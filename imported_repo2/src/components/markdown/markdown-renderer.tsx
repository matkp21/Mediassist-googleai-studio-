// src/components/markdown/markdown-renderer.tsx
"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      remarkPlugins={[remarkGfm]}
      components={{
        // Customize components if needed, e.g., to use Next/Link
        // a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
