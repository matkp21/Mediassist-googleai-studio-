// src/app/settings/page.tsx
import { PageWrapper } from '@/components/layout/page-wrapper';
import { SettingsMenu } from '@/components/settings/settings-menu';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <PageWrapper title="Settings" className="max-w-4xl mx-auto">
      <Card className="shadow-xl rounded-xl overflow-hidden border-border/60">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle className="text-2xl text-center text-foreground">Application Settings</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Manage your account, personalize your experience, and configure preferences.
          </CardDescription>
        </CardHeader>
        <SettingsMenu />
      </Card>
    </PageWrapper>
  );
}
