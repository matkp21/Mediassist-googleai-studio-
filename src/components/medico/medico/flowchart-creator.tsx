
// src/components/medico/flowchart-creator.tsx
"use client";

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import '@reactflow/node-resizer/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { medicalFlowchartTemplates, type FlowchartTemplate } from '@/config/flowchart-templates';
import { useFlowEditor } from '@/hooks/use-flow-editor';
import { nodeTypes } from './flowchart-custom-nodes';
import { FileDown, Undo, Redo, PlusCircle, Trash2, BookCopy, Save, Wand2, Loader2, ArrowRight, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { createFlowchart, type MedicoFlowchartCreatorOutput } from '@/ai/agents/medico/FlowchartCreatorAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Toolbar component
const Toolbar = ({ onAddNode, onUndo, onRedo, canUndo, canRedo, onExport, onClear, onSave }) => {
  return (
    <Card className="p-2 flex flex-wrap gap-2 shadow-md mb-4">
      <Button variant="outline" size="sm" onClick={() => onAddNode('symptom', 'Symptom')}><PlusCircle className="mr-1 h-4 w-4"/>Symptom</Button>
      <Button variant="outline" size="sm" onClick={() => onAddNode('test', 'Test')}><PlusCircle className="mr-1 h-4 w-4"/>Test</Button>
      <Button variant="outline" size="sm" onClick={() => onAddNode('decision', 'Decision')}><PlusCircle className="mr-1 h-4 w-4"/>Decision</Button>
      <Button variant="outline" size="sm" onClick={() => onAddNode('treatment', 'Treatment')}><PlusCircle className="mr-1 h-4 w-4"/>Treatment</Button>
      <div className="flex-grow" />
      <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} title="Undo"><Undo className="h-4 w-4"/></Button>
      <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} title="Redo"><Redo className="h-4 w-4"/></Button>
      <Button variant="ghost" size="icon" onClick={() => onExport('png')} title="Export as PNG"><FileDown className="h-4 w-4"/></Button>
      <Button variant="ghost" size="icon" onClick={onSave} title="Save Flowchart"><Save className="h-4 w-4" /></Button>
      <Button variant="destructive" size="icon" onClick={onClear} title="Clear Canvas"><Trash2 className="h-4 w-4"/></Button>
    </Card>
  );
};

// Template Selector component
const TemplateSelector = ({ onLoadTemplate }) => {
  return (
    <Card className="h-full shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><BookCopy className="h-5 w-5 text-primary"/>Templates</CardTitle>
        <CardDescription className="text-xs">Load a pre-built medical flowchart.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-2">
          <div className="space-y-2">
            {medicalFlowchartTemplates.map(template => (
              <div key={template.id} className="p-2 border rounded-md hover:bg-muted/50 hover:border-primary/50 transition-colors">
                <h4 className="font-semibold text-sm">{template.name}</h4>
                <p className="text-xs text-muted-foreground">{template.description}</p>
                <Button size="xs" className="mt-2" onClick={() => onLoadTemplate(template)}>Load</Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Main editor component
const FlowchartEditor = () => {
    const { toast } = useToast();
    const flowRef = useRef<HTMLDivElement>(null);
    const { nodes, setNodes, onNodesChange, edges, setEdges, onConnect, addNode, loadTemplate, undo, redo, canUndo, canRedo } = useFlowEditor();
    
    const [aiTopic, setAiTopic] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<MedicoFlowchartCreatorOutput | null>(null);
    const { user } = useProMode();

    const handleAiGenerate = async () => {
      if (!aiTopic.trim()) {
        toast({ title: "Topic Required", description: "Please enter a topic for the AI to generate a flowchart.", variant: "destructive" });
        return;
      }
      setIsAiLoading(true);
      setAiResult(null);
      try {
        const result = await createFlowchart({ topic: aiTopic });
        if (result && result.nodes && result.edges) {
          loadTemplate({ id: 'ai-generated', name: aiTopic, category: 'AI', description: '', nodes: result.nodes, edges: result.edges });
          setAiResult(result);
          toast({ title: "Flowchart Generated!", description: "AI has created a flowchart. You can now edit it." });
        } else {
            throw new Error("AI did not return a valid flowchart structure.");
        }
      } catch (err) {
        toast({ title: "AI Generation Failed", description: err instanceof Error ? err.message : "An unknown error occurred.", variant: "destructive" });
      } finally {
        setIsAiLoading(false);
      }
    };


    const handleExport = useCallback((format: 'png' | 'pdf') => {
        const flowchartElement = flowRef.current;
        if (flowchartElement) {
            html2canvas(flowchartElement, {
                useCORS: true,
                backgroundColor: null, // Use transparent background
            }).then((canvas) => {
                if (format === 'png') {
                    const link = document.createElement('a');
                    link.download = 'flowchart.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    toast({ title: "Export Successful", description: "Flowchart saved as PNG."});
                } else if (format === 'pdf') {
                    const pdf = new jsPDF({
                        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [canvas.width, canvas.height]
                    });
                    const imgData = canvas.toDataURL('image/png');
                    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                    pdf.save("flowchart.pdf");
                    toast({ title: "Export Successful", description: "Flowchart saved as PDF."});
                }
            }).catch(err => {
                 toast({title: "Export Failed", description: err instanceof Error ? err.message : "An unknown error occurred.", variant: "destructive"});
            });
        }
    }, [flowRef, toast]);
    
    const handleClear = () => {
        loadTemplate({id: 'clear', name: '', category: '', description: '', nodes: [], edges: []});
        setAiResult(null);
        toast({ title: "Canvas Cleared" });
    }

    const handleSave = async () => {
        if (!user) {
          toast({ title: "Login Required", description: "You must be logged in to save.", variant: "destructive"});
          return;
        }
        if (nodes.length === 0) {
          toast({ title: "Empty Flowchart", description: "Cannot save an empty flowchart.", variant: "destructive"});
          return;
        }
        try {
          const topicForSave = aiResult?.topicGenerated || aiTopic || 'Custom Flowchart';
          const dataToSave = {
            type: 'flowchart',
            topic: topicForSave,
            userId: user.uid,
            flowchartData: JSON.stringify(
              { nodes: nodes || [], edges: edges || [] },
              (key, value) => (value === undefined ? null : value)
            ),
            createdAt: serverTimestamp(),
          };
          await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), dataToSave);
          toast({ title: "Flowchart Saved!", description: `Flowchart for "${topicForSave}" has been saved.`});
        } catch(err) {
          toast({ title: "Save Failed", description: "Could not save flowchart.", variant: "destructive"});
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[85vh]">
            <div className="lg:col-span-1">
                <TemplateSelector onLoadTemplate={loadTemplate} />
            </div>
            <div className="lg:col-span-3 flex flex-col h-full">
                <Card className="p-3 shadow-md mb-4 space-y-2">
                    <div className="flex gap-2">
                        <Input 
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                            placeholder="Enter a topic for AI generation..."
                            className="h-9"
                        />
                        <Button onClick={handleAiGenerate} disabled={isAiLoading} className="h-9">
                            {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4"/>}
                            <span className="ml-2 hidden sm:inline">Generate with AI</span>
                        </Button>
                    </div>
                </Card>
                <Toolbar onAddNode={addNode} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onExport={handleExport} onClear={handleClear} onSave={handleSave} />
                
                <Card className="flex-grow flex flex-col rounded-lg border bg-background shadow-inner">
                  <div ref={flowRef} className="flex-grow">
                      <ReactFlow
                          nodes={nodes}
                          edges={edges}
                          onNodesChange={onNodesChange}
                          onEdgesChange={onEdgesChange}
                          onConnect={onConnect}
                          nodeTypes={nodeTypes}
                          fitView
                          className="medico-layout-background" // Use consistent background
                      >
                          <Controls />
                          <MiniMap nodeStrokeWidth={3} zoomable pannable />
                          <Background variant="dots" gap={12} size={1} />
                      </ReactFlow>
                  </div>
                   {aiResult?.nextSteps && aiResult.nextSteps.length > 0 && (
                      <CardFooter className="p-4 border-t flex items-center justify-between">
                         <Button onClick={handleSave} disabled={!user}>
                            <Save className="mr-2 h-4 w-4"/> Save to Library
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline">
                                Next Steps <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Recommended Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {aiResult.nextSteps.map((step, index) => (
                                <DropdownMenuItem key={index} asChild className="cursor-pointer">
                                  <Link href={`/medico/${step.toolId}?topic=${encodeURIComponent(step.prefilledTopic)}`}>
                                    {step.cta}
                                  </Link>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default function FlowchartCreator() {
  return (
    <ReactFlowProvider>
      <FlowchartEditor />
    </ReactFlowProvider>
  );
}
