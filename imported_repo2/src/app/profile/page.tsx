
// src/app/profile/page.tsx
"use client";

import { PageWrapper } from '@/components/layout/page-wrapper';
import { ProfileDisplay } from '@/components/profile/profile-display';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProMode } from '@/contexts/pro-mode-context';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { userRole } = useProMode();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <PageWrapper title="Loading Profile...">
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }
  
  // Placeholder user data - in a real app, this would come from auth/context or API
  const placeholderUser = {
    name: "Dr. Medi User",
    email: "medi.user@example.com",
    bio: "Dedicated healthcare professional passionate about leveraging technology to improve patient outcomes and medical education.",
    avatarUrl: "https://picsum.photos/id/237/200/200", // Same as header for consistency
  };

  return (
    <PageWrapper title="My Profile">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl rounded-xl overflow-hidden border-border/60">
          <CardHeader className="bg-muted/40 border-b border-border/50">
            <CardTitle className="text-2xl text-center text-foreground">User Profile</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              View and manage your MediAssistant profile details.
            </CardDescription>
          </CardHeader>
          <ProfileDisplay initialUser={placeholderUser} />
        </Card>
      </div>
    </PageWrapper>
  );
}
