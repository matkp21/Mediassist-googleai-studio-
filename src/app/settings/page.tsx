"use client";

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BellRing, ShieldCheck, Mail, Smartphone, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useProMode } from '@/contexts/pro-mode-context';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { user, userRole } = useProMode();
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: 'Settings Saved', description: 'Your preferences have been updated.' });
  };

  return (
    <PageWrapper title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences, notifications, and privacy settings.</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Account & Role</CardTitle>
              <CardDescription>View your current mode and basic account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <div className="font-medium">{user?.email || 'Not logged in'}</div>
                </div>
                <div className="space-y-1">
                  <Label>Active Mode</Label>
                  <div className="font-medium capitalize text-primary">{userRole || 'Standard'} Mode</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BellRing className="w-5 h-5" /> Notifications</CardTitle>
              <CardDescription>Configure how you receive updates and alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" /> Email Digests
                  </Label>
                  <p className="text-sm text-muted-foreground">Receive weekly summaries of your activity.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" /> Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Get instant alerts for important messages.</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><EyeOff className="w-5 h-5" /> Privacy</CardTitle>
              <CardDescription>Control your data sharing preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Data Telemetry</Label>
                  <p className="text-sm text-muted-foreground">Allow us to collect usage data to improve MediAssistant.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
