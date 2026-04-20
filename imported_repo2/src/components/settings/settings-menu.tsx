
// src/components/settings/settings-menu.tsx
"use client";

import React from 'react';
import { useProMode, type UserRole } from '@/contexts/pro-mode-context';
import { SettingsSection } from './settings-section';
import { SettingsItem } from './settings-item';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import {
  UserCircle, ShieldCheck, Palette, BellRing, Database, Lock, Users, HelpCircle, Info, LogOut, Trash2, BriefcaseMedical, School, Stethoscope, UserCog, Settings2 as SettingsIcon, AlertTriangle, Pill, Edit,
  FileText, // Added FileText here
  EyeOff, SlidersHorizontal, Languages, BellOff, Volume2, MailWarning, CloudLightning, Download, Pin, Mic, Phone, BookOpen, MessageSquareHeart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export function SettingsMenu() {
  const { userRole, selectUserRole } = useProMode();
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  const handleLogout = () => {
    toast({ title: "Logged Out", description: "You have been successfully logged out. (Demo)" });
    selectUserRole(null);
  };

  const handleDeleteAccount = () => {
    toast({
      variant: "destructive",
      title: "Account Deletion Requested",
      description: "Your account deletion process has started. (Demo)"
    });
    selectUserRole(null);
  };

  const getRoleDisplayString = (role: UserRole | null): string => {
    if (role === 'pro') return 'Professional';
    if (role === 'medico') return 'Medical Student';
    if (role === 'diagnosis') return 'Patient/User';
    return 'Guest';
  }

  const isGuest = !user; // Use auth state to determine guest status

  const userRolesForSelection: { value: Exclude<UserRole, null>; label: string; icon: React.ElementType }[] = [
    { value: 'pro', label: 'Professional', icon: BriefcaseMedical },
    { value: 'medico', label: 'Medical Student', icon: School },
    { value: 'diagnosis', label: 'Patient/User', icon: Stethoscope },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* Account Management */}
      {!isGuest && (
        <SettingsSection title="Account Management" icon={UserCircle}>
          <SettingsItem label="Profile Information" description="View and edit your display name, email, bio." icon={Edit} actionElement={<Link href="/profile"><Button variant="outline" size="sm">Edit Profile</Button></Link>} />
          <SettingsItem label="Account Security" description="Change password, manage 2FA." icon={ShieldCheck} actionElement={<Button variant="outline" size="sm" disabled>Manage Security</Button>} />
          <SettingsItem
            label="Current User Mode"
            description={`You are currently using: ${getRoleDisplayString(userRole)}`}
            icon={UserCog}
            actionElement={
              <Select
                value={userRole ?? ''}
                onValueChange={(value) => {
                  if (value) {
                    selectUserRole(value as Exclude<UserRole, null>);
                    toast({ title: "User Role Updated", description: `Switched to ${getRoleDisplayString(value as UserRole)} mode.`});
                  }
                }}
              >
                <SelectTrigger className="w-[180px] rounded-md text-xs">
                  <SelectValue placeholder="Change mode..." />
                </SelectTrigger>
                <SelectContent>
                  {userRolesForSelection.map(roleOption => (
                    <SelectItem key={roleOption.value} value={roleOption.value}>
                      <div className="flex items-center gap-2">
                        <roleOption.icon className="h-4 w-4" />
                        {roleOption.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
          <SettingsItem label="Subscription Management" description="View plan details." icon={FileText} actionElement={<Button variant="outline" size="sm" disabled>View Subscription</Button>} />
        </SettingsSection>
      )}
      <Separator />

      {/* Appearance & Personalization */}
      <SettingsSection title="Appearance & Personalization" icon={Palette}>
        <SettingsItem label="Theme" description="Choose light, dark, or system default." icon={Palette} actionElement={<Button variant="outline" size="sm" disabled>Change Theme</Button>} />
        <SettingsItem label="Accessibility" description="Adjust text size, contrast, and motion." icon={EyeOff} actionElement={<Button variant="outline" size="sm" disabled>Accessibility Options</Button>} />
        {!isGuest && <SettingsItem label="Home Screen Customization" description="Tailor your dashboard layout and tools." icon={SlidersHorizontal} actionElement={<Button variant="outline" size="sm" disabled>Customize Home</Button>} />}
        <SettingsItem label="Language" description="Select app language." icon={Languages} actionElement={<Button variant="outline" size="sm" disabled>Change Language</Button>} />
      </SettingsSection>
      <Separator />

      {/* Notification Preferences */}
      {!isGuest && (
        <SettingsSection title="Notification Preferences" icon={BellRing}>
          <SettingsItem label="Master Notification Toggle" description="Enable or disable all push notifications." icon={BellOff} actionElement={<Switch id="master-notifications" disabled />} />
          <SettingsItem label="Study Reminders (Medico)" description="Get reminders for study sessions, flashcards." icon={School} actionElement={<Switch id="medico-reminders" disabled />} />
          <SettingsItem label="Clinical Alerts (Pro)" description="Critical patient alerts and task reminders." icon={BriefcaseMedical} actionElement={<Switch id="pro-alerts" disabled />} />
          <SettingsItem label="Notification Sounds" description="Choose notification sounds." icon={Volume2} actionElement={<Button variant="outline" size="sm" disabled>Sounds</Button>} />
          <SettingsItem label="Email Notifications" description="Manage email updates and summaries." icon={MailWarning} actionElement={<Switch id="email-notifications" disabled />} />
        </SettingsSection>
      )}
       {isGuest && (
         <SettingsSection title="Notification Preferences" icon={BellRing}>
            <SettingsItem label="Notifications are disabled for guest users." description="Please sign up or log in to manage notifications." icon={BellOff} />
         </SettingsSection>
       )}
      <Separator />

      {/* Data & Sync */}
      {!isGuest && (
        <SettingsSection title="Data & Sync" icon={Database}>
          <SettingsItem label="Sync Status" description="Last synced: Just now (Demo)" icon={CloudLightning} />
          <SettingsItem label="Manual Sync" icon={CloudLightning} actionElement={<Button variant="outline" size="sm" disabled>Sync Now</Button>} />
          <SettingsItem label="Sync Over Wi-Fi Only" icon={CloudLightning} actionElement={<Switch id="wifi-sync" disabled />} />
          <SettingsItem label="Export My Data" description="Download your personal data." icon={Download} actionElement={<Button variant="outline" size="sm" disabled>Request Export</Button>} />
        </SettingsSection>
      )}
      <Separator />

      {/* Security & Privacy */}
      <SettingsSection title="Security & Privacy" icon={Lock}>
        {!isGuest && <SettingsItem label="App Lock (PIN/Biometric)" description="Secure app access." icon={Pin} actionElement={<Switch id="app-lock" disabled />} />}
        <SettingsItem label="View Privacy Policy" icon={FileText} actionElement={<Link href="#"><Button variant="link" size="sm">View Policy</Button></Link>} />
        <SettingsItem label="Clear Cache" description="Clear locally cached data." icon={Trash2} actionElement={<Button variant="outline" size="sm" disabled>Clear Cache</Button>} />
      </SettingsSection>
      <Separator />

      {/* Mode-Specific Settings */}
      {!isGuest && userRole && (
        <SettingsSection title={`${getRoleDisplayString(userRole)} Mode Settings`} icon={SettingsIcon}>
          {userRole === 'medico' && (
            <>
              <SettingsItem label="Curriculum Preferences" description="Tailor content to your region/exams." icon={School} actionElement={<Button variant="outline" size="sm" disabled>Set Preferences</Button>} />
              <SettingsItem label="Study Tool Defaults" description="Set default MCQ difficulty, flashcard settings." icon={BookOpen} actionElement={<Button variant="outline" size="sm" disabled>Tool Defaults</Button>} />
            </>
          )}
          {userRole === 'pro' && (
            <>
              <SettingsItem label="Clinical Profile" description="Set your primary specialty for tailored tools." icon={BriefcaseMedical} actionElement={<Button variant="outline" size="sm" disabled>Edit Profile</Button>} />
              <SettingsItem label="Dictation Settings" description="Manage voice input language and custom vocabulary." icon={Mic} actionElement={<Button variant="outline" size="sm" disabled>Dictation Settings</Button>} />
              <SettingsItem label="Drug Database Region" description="Set region for pharmacopeia." icon={Pill} actionElement={<Button variant="outline" size="sm" disabled>Set Region</Button>} />
            </>
          )}
           {userRole === 'diagnosis' && (
            <>
              <SettingsItem label="Wellness Goals" description="Set or adjust health targets." icon={Stethoscope} actionElement={<Button variant="outline" size="sm" disabled>Manage Goals</Button>} />
              <SettingsItem label="Emergency Contacts" description="Add or edit emergency contacts." icon={Phone} actionElement={<Button variant="outline" size="sm" disabled>Contacts</Button>} />
            </>
          )}
        </SettingsSection>
      )}
      <Separator />

      {/* Help & Support */}
      <SettingsSection title="Help & Support" icon={HelpCircle}>
        <SettingsItem label="FAQ" icon={MessageSquareHeart} actionElement={<Button variant="link" size="sm" disabled>View FAQ</Button>} />
        <SettingsItem label="App Tutorials" icon={BookOpen} actionElement={<Button variant="link" size="sm" disabled>View Tutorials</Button>} />
        <SettingsItem label="Provide Feedback" icon={Edit} actionElement={<Link href="/feedback"><Button variant="outline" size="sm">Submit Feedback</Button></Link>} />
        <SettingsItem label="Report a Problem" icon={AlertTriangle} actionElement={<Button variant="outline" size="sm" disabled>Report Issue</Button>} />
      </SettingsSection>
      <Separator />

      {/* Account Actions */}
      {!isGuest ? (
        <SettingsSection title="Account Actions" icon={UserCog}>
          <SettingsItem label="Log Out" icon={LogOut} actionElement={<Button variant="outline" onClick={handleLogout}>Log Out</Button>} />
          <SettingsItem
            label="Delete Account"
            description="Permanently delete your account and data."
            icon={Trash2}
            actionElement={
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            }
          />
        </SettingsSection>
      ) : (
         <SettingsSection title="Account" icon={UserCircle}>
            <SettingsItem label="You are currently using MediAssistant as a guest." description="Sign up or log in to access more features and save your data." icon={Info} actionElement={<Link href="/login"><Button variant="default" size="sm">Sign Up / Log In</Button></Link>}/>
        </SettingsSection>
      )}
    </div>
  );
}
