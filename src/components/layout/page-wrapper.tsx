import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ title, children, className }: PageWrapperProps) {
  return (
    <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
      {title && <h1 className="text-3xl font-bold mb-8 text-foreground">{title}</h1>}
      {children}
    </div>
  );
}
