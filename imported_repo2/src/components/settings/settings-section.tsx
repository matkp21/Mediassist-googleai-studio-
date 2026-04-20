// src/components/settings/settings-section.tsx
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  icon?: React.ElementType;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, icon: Icon, children, className }: SettingsSectionProps) {
  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center gap-3 mb-4 px-1">
        {Icon && <Icon className="h-6 w-6 text-primary" />}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
