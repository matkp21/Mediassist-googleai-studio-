"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Loader2, CheckCircle2, Circle, ListTodo, Trash2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { useProMode } from '@/contexts/pro-mode-context';
import { trackProgress } from '@/ai/agents/medico/ProgressTrackerAgent';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface StudyTask {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: any;
}

export function StudyTasksManager() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useProMode();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const tasksRef = collection(firestore, `users/${user.uid}/tasks`);
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudyTask[];
      setTasks(fetchedTasks);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    setIsAdding(true);
    try {
      await addDoc(collection(firestore, `users/${user.uid}/tasks`), {
        title: newTaskTitle.trim(),
        isCompleted: false,
        createdAt: serverTimestamp()
      });
      setNewTaskTitle('');
      toast({ title: 'Task Added', description: 'Your new study task has been created.' });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({ title: 'Error', description: 'Could not add task.', variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (task: StudyTask) => {
    if (!user) return;
    try {
      const taskRef = doc(firestore, `users/${user.uid}/tasks`, task.id);
      await updateDoc(taskRef, {
        isCompleted: !task.isCompleted
      });

      // If marking as completed, track progress
      if (!task.isCompleted) {
        trackProgress({
          activityType: 'task_completed',
          topic: task.title
        }).then((result) => {
          toast({
            title: "Task Completed! 🎉",
            description: result?.progressUpdateMessage || "Your progress has been updated.",
          });
          if (result?.newAchievements && result.newAchievements.length > 0) {
            setTimeout(() => {
                toast({
                  title: "🏆 New Achievement Unlocked!",
                  description: result.newAchievements!.join(", "),
                });
            }, 1000);
          }
        }).catch(err => {
          console.warn("Failed to track progress for task:", err);
          toast({
            title: "Task Completed! 🎉",
            description: "Your progress has been updated.",
          });
        });
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({ title: 'Error', description: 'Could not update task.', variant: 'destructive' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(firestore, `users/${user.uid}/tasks`, taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({ title: 'Error', description: 'Could not delete task.', variant: 'destructive' });
    }
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <Card className="shadow-lg rounded-xl flex flex-col h-full bg-gradient-to-br from-card via-card to-accent/5 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            Study Tasks
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">{pendingCount} pending</Badge>
          </div>
        </div>
        <CardDescription>Track your study goals and assignments.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0 gap-4 min-h-[300px]">
        <form onSubmit={handleAddTask} className="flex gap-2 relative">
          <Input 
            placeholder="Add a new study task..." 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={isAdding || !user}
            className="flex-1 rounded-full outline-none focus-visible:ring-1 focus-visible:ring-primary pl-4"
          />
          <Button type="submit" size="icon" disabled={!newTaskTitle.trim() || isAdding || !user} className="rounded-full shrink-0">
            {isAdding ? <Loader2 className="h-5 w-5 animate-spin"/> : <PlusCircle className="h-5 w-5"/>}
          </Button>
        </form>

        <ScrollArea className="flex-1 -mx-4 px-4 h-full">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ListTodo className="h-10 w-10 mx-auto opacity-20 mb-3" />
              <p className="text-sm">No tasks yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className={`group flex items-center justify-between p-3 rounded-lg border ${task.isCompleted ? 'bg-muted/50 border-transparent' : 'bg-card border-border/50 shadow-sm hover:border-primary/30'} transition-all duration-200`}>
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <button 
                      onClick={() => handleToggleTask(task)}
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex flex-col overflow-hidden">
                        <span className={`text-sm truncate ${task.isCompleted ? 'line-through text-muted-foreground opacity-70' : 'text-foreground font-medium'}`}>
                          {task.title}
                        </span>
                        {/* TypeScript ts-ignore for dynamic fields since task interface was not fully updated here */}
                        {/* @ts-ignore */}
                        {task.requiresAdaptiveReview && !task.isCompleted && (
                            <span className="text-[10px] text-destructive flex items-center font-semibold mt-0.5">
                                <ListTodo className="h-3 w-3 mr-1"/> Spaced Repetition Active
                            </span>
                        )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all shrink-0 ml-2"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
