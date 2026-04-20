
// src/components/profile/profile-display.tsx
"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Edit3, Save, UserCircle, Mail, BriefcaseMedical, School, Stethoscope, XCircle } from 'lucide-react';
import { ProfileForm, type ProfileFormValues } from './profile-form';
import type { UserRole } from '@/contexts/pro-mode-context';
import { cn } from '@/lib/utils';
import { useProMode } from '@/contexts/pro-mode-context';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatarUrl?: string;
}

interface ProfileDisplayProps {
  initialUser: UserProfile;
}

export function ProfileDisplay({ initialUser }: ProfileDisplayProps) {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const { userRole } = useProMode();

  const handleSaveProfile = (data: ProfileFormValues) => {
    setUser(prevUser => ({ ...prevUser, name: data.name, bio: data.bio || '' }));
    setIsEditing(false);
    // In a real app, you would call an API to save the data here.
  };
  
  const getRoleDisplay = () => {
    if (userRole === 'pro') return { name: 'Professional', icon: BriefcaseMedical, color: 'text-purple-600' };
    if (userRole === 'medico') return { name: 'Medical Student', icon: School, color: 'text-sky-600' };
    if (userRole === 'diagnosis') return { name: 'Patient/User', icon: Stethoscope, color: 'text-green-600' };
    return { name: 'User', icon: UserCircle, color: 'text-muted-foreground' };
  };

  const roleInfo = getRoleDisplay();
  const RoleIcon = roleInfo.icon;


  return (
    <CardContent className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-primary/20 shadow-md">
          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
          <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          {isEditing ? (
             <h2 className="text-2xl font-bold text-foreground">{user.name} (Editing)</h2>
          ) : (
             <h2 className="text-3xl font-bold text-foreground">{user.name}</h2>
          )}
          <p className={cn("text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1", roleInfo.color)}>
            <RoleIcon className="h-4 w-4" />
            {roleInfo.name}
          </p>
          <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-1">
            <Mail className="h-4 w-4" />
            {user.email} (Display only)
          </p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm" className="rounded-lg group">
          {isEditing ? <XCircle className="mr-2 h-4 w-4"/> : <Edit3 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-[-5deg]" />}
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </Button>
      </div>

      {isEditing ? (
        <ProfileForm
          defaultValues={{ name: user.name, bio: user.bio }}
          onSubmit={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bio</h3>
            <p className="mt-1 text-md text-foreground/90 whitespace-pre-wrap bg-secondary/30 p-3 rounded-lg">
              {user.bio || <span className="italic text-muted-foreground">No bio provided. Click 'Edit Profile' to add one.</span>}
            </p>
          </div>
          {/* Add more display fields here if needed */}
        </div>
      )}
    </CardContent>
  );
}
