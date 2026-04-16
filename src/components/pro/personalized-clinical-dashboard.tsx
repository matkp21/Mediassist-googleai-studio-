// src/components/pro/personalized-clinical-dashboard.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckSquare, MessageCircle, Bell, CalendarDays, Settings, PlusCircle, Edit2, GripVertical, Star } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";


interface TaskItem {
  id: string;
  text: string;
  category: 'Lab Review' | 'Follow-up' | 'Patient Alert' | 'Schedule';
  dueDate?: string;
  priority?: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

const initialTasks: TaskItem[] = [
  { id: 'task1', text: 'Review Mr. Smith\'s latest CBC results', category: 'Lab Review', dueDate: 'Today', priority: 'High', completed: false },
  { id: 'task2', text: 'Follow-up call with Mrs. Jones re: medication adjustment', category: 'Follow-up', dueDate: 'Tomorrow', priority: 'Medium', completed: false },
  { id: 'task3', text: 'Patient Alert: John Doe - Critical lab value (K+ 2.5)', category: 'Patient Alert', priority: 'High', completed: false },
  { id: 'task4', text: 'On-call shift: 7 PM - 7 AM', category: 'Schedule', dueDate: 'Today', completed: false },
  { id: 'task5', text: 'Review imaging for Patient X', category: 'Lab Review', dueDate: 'Today', priority: 'Medium', completed: true },
];

interface DashboardWidget {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
  defaultPosition: number;
  isFrequentlyUsed?: boolean; 
  colSpan?: string; // e.g., 'lg:col-span-1', 'lg:col-span-2'
}


export function PersonalizedClinicalDashboard() {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [isEditMode, setIsEditMode] = useState(false);

  const widgets: DashboardWidget[] = [
     {
      id: 'patientAlerts',
      title: 'Key Patient Alerts',
      icon: Bell,
      defaultPosition: 0,
      isFrequentlyUsed: true,
      colSpan: 'lg:col-span-2',
      content: (
         <ScrollArea className="h-40">
          <ul className="space-y-2">
            {tasks.filter(t => t.category === 'Patient Alert' && !t.completed).map(task => (
              <li key={task.id} className="flex items-center justify-between p-2 bg-destructive/10 border border-destructive/30 rounded-md text-sm">
                <span className="font-medium text-destructive">{task.text}</span>
                 <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => setTasks(currentTasks => currentTasks.map(t => t.id === task.id ? {...t, completed: true} : t))}>
                  Acknowledge
                </Button>
              </li>
            ))}
            {tasks.filter(t => t.category === 'Patient Alert' && !t.completed).length === 0 && <p className="text-center text-muted-foreground py-4">No active alerts.</p>}
          </ul>
        </ScrollArea>
      )
    },
    {
      id: 'pendingTasks',
      title: 'Pending Tasks',
      icon: CheckSquare,
      defaultPosition: 1,
      isFrequentlyUsed: true, 
      colSpan: 'lg:col-span-1',
      content: (
        <ScrollArea className="h-60">
          <ul className="space-y-2">
            {tasks.filter(t => !t.completed).map(task => (
              <li key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm hover:bg-muted/70 transition-colors">
                <div>
                  <span className={cn("font-medium", task.priority === "High" && "text-destructive")}>{task.text}</span>
                  <div className="text-xs text-muted-foreground">
                    <span>{task.category}</span>
                    {task.dueDate && <span> • Due: {task.dueDate}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setTasks(currentTasks => currentTasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))}>
                  {task.completed ? "Undo" : "Done"}
                </Button>
              </li>
            ))}
             {tasks.filter(t => !t.completed).length === 0 && <p className="text-center text-muted-foreground py-4">No pending tasks!</p>}
          </ul>
        </ScrollArea>
      )
    },
    {
      id: 'messages',
      title: 'Messages & Communications',
      icon: MessageCircle,
      defaultPosition: 2,
      colSpan: 'lg:col-span-1',
      content: <p className="text-muted-foreground text-sm p-4 text-center">Secure messaging interface placeholder. (e.g., unread messages count, quick reply)</p>
    },
    {
      id: 'scheduleOverview',
      title: 'Schedule & On-Call',
      icon: CalendarDays,
      defaultPosition: 3,
      colSpan: 'lg:col-span-1',
      content: <p className="text-muted-foreground text-sm p-4 text-center">Today's appointments and on-call responsibilities placeholder.</p>
    }
  ];
  
  const [widgetOrder, setWidgetOrder] = useState<string[]>(widgets.sort((a,b) => a.defaultPosition - b.defaultPosition).map(w => w.id));


  return (
    <div className="p-1 fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">My Clinical Dashboard</h2>
        <Button variant="outline" onClick={() => setIsEditMode(!isEditMode)} size="sm" className="rounded-lg group">
          {isEditMode ? <CheckSquare className="mr-2 h-4 w-4"/> : <Settings className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-45"/>}
          {isEditMode ? "Save Layout" : "Customize"}
        </Button>
      </div>

      {isEditMode && (
        <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-lg text-primary">Customize Dashboard Layout</CardTitle>
            <CardDescription className="text-xs">
              Drag and drop functionality for reordering widgets is conceptual for future versions.
              Click "{isEditMode ? 'Save Layout' : 'Customize'}" again to exit. Actual layout saving is not yet implemented.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
             <p className="text-sm text-muted-foreground">
              The grip handles <GripVertical className="inline h-4 w-4 text-muted-foreground" /> on widgets are for visual representation of this planned feature.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgetOrder.map(widgetId => {
          const widget = widgets.find(w => w.id === widgetId);
          if (!widget) return null;
          return (
            <motion.div
              key={widget.id}
              layout // Enables smooth animation when reordering (if D&D was implemented)
              whileHover={!isEditMode ? { y: -3, boxShadow: "0px 8px 15px hsla(var(--primary) / 0.15)" } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn(
                "bg-card rounded-xl shadow-md border-2 border-transparent",
                widget.colSpan || 'lg:col-span-1', // Apply colSpan
                widget.isFrequentlyUsed && !isEditMode && "tool-card-frequent firebase-gradient-border-hover animate-subtle-pulse-glow",
                isEditMode && "cursor-grab"
              )}
            >
              <Card className={cn("h-full border-none shadow-none", widget.isFrequentlyUsed && !isEditMode && "bg-transparent")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                  <div className="flex items-center gap-2">
                    <widget.icon className={cn("h-5 w-5", widget.isFrequentlyUsed ? "text-primary" : "text-muted-foreground")} />
                    <CardTitle className="text-md font-medium">{widget.title}</CardTitle>
                  </div>
                  {isEditMode && <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" title="Drag to reorder (conceptual)" />}
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {widget.content}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
       <div className="mt-8 text-center">
        <Button variant="ghost" className="text-primary hover:text-primary/80 rounded-md">
            <PlusCircle className="mr-2 h-4 w-4"/> Add New Widget (Conceptual)
        </Button>
      </div>
    </div>
  );
}
