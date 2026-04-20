// src/components/feedback/feedback-form.tsx
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageSquareText, Bug, Lightbulb } from 'lucide-react';

const feedbackFormSchema = z.object({
  feedbackType: z.enum(['bug', 'suggestion', 'general'], {
    required_error: "Please select a feedback type.",
  }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }).max(1000, { message: "Description must not exceed 1000 characters."}),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export function FeedbackForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      feedbackType: undefined,
      description: "",
      email: "",
    },
  });

  const onSubmit: SubmitHandler<FeedbackFormValues> = async (data) => {
    setIsSubmitting(true);
    console.log("Feedback submitted:", data);
    // TODO: Implement actual feedback submission logic (e.g., API call)
    // For now, simulate a delay and show a success toast
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Feedback Submitted!",
      description: "Thank you for your feedback. We appreciate your input.",
    });
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 md:p-8 bg-card shadow-xl rounded-xl border border-border/50">
        <FormField
          control={form.control}
          name="feedbackType"
          render={({ field }) => (
            <FormItem className="input-focus-glow rounded-lg">
              <FormLabel htmlFor="feedback-type-select">Feedback Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="feedback-type-select" aria-label="Select feedback type">
                    <SelectValue placeholder="Select a type..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bug">
                    <div className="flex items-center">
                      <Bug className="mr-2 h-4 w-4" /> Report a Bug
                    </div>
                  </SelectItem>
                  <SelectItem value="suggestion">
                     <div className="flex items-center">
                        <Lightbulb className="mr-2 h-4 w-4" /> Suggestion
                    </div>
                  </SelectItem>
                  <SelectItem value="general">
                     <div className="flex items-center">
                        <MessageSquareText className="mr-2 h-4 w-4" /> General Feedback
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="input-focus-glow rounded-lg">
              <FormLabel htmlFor="feedback-description">Description</FormLabel>
              <FormControl>
                <Textarea
                  id="feedback-description"
                  placeholder="Please describe your feedback in detail..."
                  className="min-h-[150px] resize-y rounded-lg border-border/70 focus:border-primary"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The more details you provide, the better we can understand and address your feedback.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="input-focus-glow rounded-lg">
              <FormLabel htmlFor="feedback-email">Email (Optional)</FormLabel>
              <FormControl>
                <Input
                  id="feedback-email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="rounded-lg border-border/70 focus:border-primary"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide your email if you'd like us to follow up with you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full rounded-lg py-3 text-base group" disabled={isSubmitting} aria-label="Submit feedback">
          {isSubmitting ? 'Submitting...' : 'Send Feedback'}
          {!isSubmitting && <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
        </Button>
      </form>
    </Form>
  );
}
