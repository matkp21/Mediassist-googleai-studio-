// src/app/pro/layout.tsx
import type { ReactNode } from 'react';
import { ProHeader } from '@/components/layout/pro-header'; // Assuming ProHeader will be created
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function ProLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <ProHeader />
      <PageWrapper className="flex-grow py-6 sm:py-10">
        {children}
      </PageWrapper>
      {/* You can add a Pro-specific footer here if needed */}
    </div>
  );
}