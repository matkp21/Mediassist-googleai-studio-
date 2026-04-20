
// src/components/pro/rounds-tool.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, ListChecks, PlusCircle, MessageSquare, UserPlus, AlertTriangle, ArrowRightLeft, ClipboardEdit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface PatientForRound {
  id: string;
  name: string;
  ward: string;
  bed: string;
  keyIssues: string[];
  tasks: Task[];
  notes: string;
}

interface Task {
  id: string;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

const initialPatients: PatientForRound[] = [
  { 
    id: 'pat1', name: 'Alice Wonderland', ward: 'A', bed: '101', 
    keyIssues: ['Post-op pain', 'Low BP'], 
    tasks: [
      {id: 'task1-1', description: 'Check vitals Q4H', status: 'pending', priority: 'high'},
      {id: 'task1-2', description: 'Administer analgesia PRN', status: 'pending', priority: 'medium'}
    ], 
    notes: 'Restless overnight, pain score 7/10.'
  },
  { 
    id: 'pat2', name: 'Bob The Builder', ward: 'B', bed: '205', 
    keyIssues: ['Awaiting MRI results', 'Needs discharge planning'], 
    tasks: [
      {id: 'task2-1', description: 'Chase MRI report', status: 'in-progress', priority: 'high'},
      {id: 'task2-2', description: 'Discuss discharge with social worker', status: 'pending', priority: 'medium'}
    ], 
    notes: 'Family concerned about home care.'
  },
];

export function RoundsTool() {
  const [patients, setPatients] = useState<PatientForRound[]>(initialPatients);
  const [selectedPatient, setSelectedPatient] = useState<PatientForRound | null>(null);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const { toast } = useToast();

  const handleSelectPatient = (patient: PatientForRound) => {
    setSelectedPatient(patient);
    setNewNoteText(patient.notes); // Load current notes for editing
  };

  const handleAddTask = () => {
    if (!selectedPatient || !newTaskDescription.trim()) {
      toast({ title: "Task description needed", variant: "destructive"});
      return;
    }
    const newTask: Task = {
      id: `task-${Date.now()}`,
      description: newTaskDescription,
      status: 'pending',
      priority: 'medium', // Default priority
    };
    const updatedPatients = patients.map(p => 
      p.id === selectedPatient.id ? { ...p, tasks: [...p.tasks, newTask] } : p
    );
    setPatients(updatedPatients);
    setSelectedPatient(prev => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : null);
    setNewTaskDescription('');
    toast({ title: "Task Added", description: `"${newTaskDescription}" added for ${selectedPatient.name}.`});
  };

  const toggleTaskStatus = (taskId: string) => {
    if (!selectedPatient) return;
    const updatedTasks = selectedPatient.tasks.map(task => {
      if (task.id === taskId) {
        let newStatus: Task['status'] = 'pending';
        if (task.status === 'pending') newStatus = 'in-progress';
        else if (task.status === 'in-progress') newStatus = 'completed';
        return { ...task, status: newStatus };
      }
      return task;
    });
    
    const updatedPatients = patients.map(p =>
      p.id === selectedPatient.id ? { ...p, tasks: updatedTasks } : p
    );
    setPatients(updatedPatients);
    setSelectedPatient(prev => prev ? { ...prev, tasks: updatedTasks } : null);
  };

  const handleSaveNotes = () => {
    if (!selectedPatient) return;
    const updatedPatients = patients.map(p => 
      p.id === selectedPatient.id ? { ...p, notes: newNoteText } : p
    );
    setPatients(updatedPatients);
    setSelectedPatient(prev => prev ? { ...prev, notes: newNoteText } : null);
    toast({ title: "Notes Saved", description: `Notes for ${selectedPatient.name} updated.`});
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
        <Users className="h-5 w-5 text-blue-600" />
        <AlertTitle className="font-semibold text-blue-700 dark:text-blue-500">Rounds Tool 2.0</AlertTitle>
        <AlertDescription className="text-blue-600/90 dark:text-blue-500/90 text-xs">
          Manage patient rounds, track tasks, update notes, and streamline handovers. This is a conceptual interface.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient List */}
        <Card className="md:col-span-1 shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Patient List for Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {patients.map(patient => (
                <Button
                  key={patient.id}
                  variant={selectedPatient?.id === patient.id ? "secondary" : "ghost"}
                  className="w-full justify-start mb-2 text-left h-auto py-2 rounded-md"
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div>
                    <p className="font-semibold">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">Ward: {patient.ward}, Bed: {patient.bed}</p>
                  </div>
                </Button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Selected Patient Details */}
        <Card className="md:col-span-2 shadow-md rounded-xl">
          {selectedPatient ? (
            <>
              <CardHeader>
                <CardTitle className="text-lg">{selectedPatient.name} - Details</CardTitle>
                <CardDescription>Ward: {selectedPatient.ward}, Bed: {selectedPatient.bed}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-semibold text-sm">Key Issues:</Label>
                  <ul className="list-disc list-inside ml-4 text-sm text-muted-foreground">
                    {selectedPatient.keyIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                  </ul>
                </div>

                <div>
                  <Label className="font-semibold text-sm">Tasks:</Label>
                  <ScrollArea className="h-[150px] border p-2 rounded-md bg-muted/30">
                    {selectedPatient.tasks.length === 0 && <p className="text-xs text-muted-foreground p-2">No tasks yet.</p>}
                    {selectedPatient.tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-1.5 hover:bg-background/50 rounded">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={task.status === 'completed'} 
                            onCheckedChange={() => toggleTaskStatus(task.id)}
                            id={`task-${task.id}`}
                          />
                          <label htmlFor={`task-${task.id}`} className="text-xs cursor-pointer">{task.description}</label>
                        </div>
                        <Badge variant={
                          task.status === 'completed' ? 'default' : task.status === 'in-progress' ? 'secondary' : 'outline'
                        } className="text-xs px-1.5 py-0.5">
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </ScrollArea>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      value={newTaskDescription}
                      onChange={e => setNewTaskDescription(e.target.value)}
                      placeholder="New task description..."
                      className="text-sm rounded-md h-8"
                    />
                    <Button onClick={handleAddTask} size="sm" className="rounded-md h-8 text-xs">
                      <PlusCircle className="mr-1 h-3.5 w-3.5"/> Add Task
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`notes-${selectedPatient.id}`} className="font-semibold text-sm">Progress Notes:</Label>
                  <Textarea 
                    id={`notes-${selectedPatient.id}`}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter progress notes..."
                    className="min-h-[100px] mt-1 text-sm rounded-md"
                  />
                   <Button onClick={handleSaveNotes} size="sm" className="mt-2 rounded-md text-xs">
                    <ClipboardEdit className="mr-1 h-3.5 w-3.5"/> Save Notes
                   </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" className="rounded-md text-xs">
                  <MessageSquare className="mr-1 h-3.5 w-3.5"/> Message Team
                </Button>
                <Button size="sm" className="rounded-md text-xs">
                  <ArrowRightLeft className="mr-1 h-3.5 w-3.5"/> Prepare Handover
                </Button>
              </CardFooter>
            </>
          ) : (
            <CardContent className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <UserPlus className="h-16 w-16 mb-4 text-primary/50" />
              <p>Select a patient to view details and manage tasks.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
