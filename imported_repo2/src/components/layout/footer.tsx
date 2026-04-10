// src/components/layout/footer.tsx
"use client";

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className={cn(
        "bg-secondary/50 dark:bg-secondary/20 text-secondary-foreground border-t border-border/50 py-8 px-4 md:px-8 fade-in fade-in-delay-10"
      )}
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <Logo simple={true} />
          <p className="text-xs mt-1 opacity-70">&copy; {new Date().getFullYear()} MediAssistant. All rights reserved.</p>
        </div>
        <nav className="flex space-x-4 sm:space-x-6 text-sm">
          <Link href="/feedback" className="hover:text-primary transition-colors">Feedback</Link>
          <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms of Use</Link>
          <Link href="#" className="hover:text-primary transition-colors">Contact Us</Link>
        </nav>
      </div>
    </footer>
  );
}
