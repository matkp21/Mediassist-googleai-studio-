// src/hooks/use-flow-editor.ts
import { useState, useCallback } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from 'reactflow';
import type { FlowchartTemplate } from '@/config/flowchart-templates';

export const useFlowEditor = () => {
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const updateHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: newNodes, edges: newEdges });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
      if (changes.some(c => (c.type === 'position' && c.dragging === false) || c.type === 'remove' || c.type === 'add' || c.type === 'dimensions')) {
        updateHistory(newNodes, edges);
      }
    },
    [nodes, edges, updateHistory]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      if (changes.some(c => c.type === 'remove' || c.type === 'add')) {
        updateHistory(nodes, newEdges);
      }
    },
    [edges, nodes, updateHistory]
  );
  
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge({ ...connection, animated: true, type: 'smoothstep' }, edges);
      setEdges(newEdges);
      updateHistory(nodes, newEdges);
    },
    [edges, nodes, updateHistory]
  );
  
  const addNode = (type: string, label: string) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type,
      data: { label: `${label}` },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 200 },
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    updateHistory(newNodes, edges);
  };
  
  const loadTemplate = (template: FlowchartTemplate) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    const newHistory = [{ nodes: template.nodes, edges: template.edges }];
    setHistory(newHistory);
    setHistoryIndex(0);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const { nodes: pastNodes, edges: pastEdges } = history[newIndex];
      setNodes(pastNodes);
      setEdges(pastEdges);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const { nodes: futureNodes, edges: futureEdges } = history[newIndex];
      setNodes(futureNodes);
      setEdges(futureEdges);
      setHistoryIndex(newIndex);
    }
  };
  
  return {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    onConnect, addNode, loadTemplate,
    undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1,
  };
};
