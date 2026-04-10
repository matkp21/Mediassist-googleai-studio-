// src/components/profile/profile-form.tsx
"use client";

import { useState } from 'react'; // Added useState import
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Save, XCircle } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }).max(50, { message: "Name must not exceed 50 characters." }),
  bio: z.string().max(500, { message: "Bio must not exceed 500 characters." }).optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  defaultValues: ProfileFormValues;
  onSubmit: (data: ProfileFormValues) => void;
  onCancel: () => void;
}

export function ProfileForm({ defaultValues, onSubmit, onCancel }: ProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const handleFormSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmit(data);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 p-4 border border-border/50 rounded-lg bg-card">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="input-focus-glow rounded-lg">
              <FormLabel htmlFor="profile-name">Full Name</FormLabel>
              <FormControl>
                <Input
                  id="profile-name"
                  placeholder="Enter your full name"
                  className="rounded-lg border-border/70 focus:border-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="input-focus-glow rounded-lg">
              <FormLabel htmlFor="profile-bio">Bio / About Me</FormLabel>
              <FormControl>
                <Textarea
                  id="profile-bio"
                  placeholder="Tell us a bit about yourself..."
                  className="min-h-[120px] resize-y rounded-lg border-border/70 focus:border-primary"
                  {...field}
                  value={field.value ?? ''} // Ensure value is not undefined for textarea
                />
              </FormControl>
              <FormDescription>
                This will be displayed on your public profile (if applicable). Max 500 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg group" aria-label="Cancel editing profile">
             <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" className="rounded-lg group" disabled={isSubmitting} aria-label="Save profile changes">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
            {!isSubmitting && <Save className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}

