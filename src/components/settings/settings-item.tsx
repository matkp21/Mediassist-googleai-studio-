// src/components/settings/settings-item.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SettingsItemProps {
  label: string;
  description?: string;
  icon?: React.ElementType;
  actionElement?: ReactNode; // e.g., Switch, Button, Link
  className?: string;
}

export function SettingsItem({ label, description, icon: Icon, actionElement, className }: SettingsItemProps) {
  return (
    <div className={cn("flex items-center justify-between p-3 bg-card hover:bg-muted/50 rounded-lg border border-border/40 transition-colors min-h-[60px]", className)}>
      <div className="flex items-center gap-3 flex-1">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actionElement && <div className="ml-4 flex-shrink-0">{actionElement}</div>}
    </div>
  );
}
