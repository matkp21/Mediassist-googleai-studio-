// src/components/pro/pro-tool-card.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Star, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';

// A more generic type to accommodate both Pro and Medico tools
interface GenericTool {
  id: string | null;
  title: string;
  description: string;
  icon: React.ElementType;
  component?: React.LazyExoticComponent<React.ComponentType<any>>;
  href?: string;
  comingSoon?: boolean;
}

interface ToolCardProps {
  tool: GenericTool;
  onLaunch: (toolId: string | null) => void;
  isFrequentlyUsed?: boolean;
  isEditMode?: boolean;
}

const ToolCardComponent: React.FC<ToolCardProps> = ({ tool, onLaunch, isFrequentlyUsed, isEditMode }) => {
  const cardContent = (
    <motion.div
      whileHover={!isEditMode ? { y: -5, boxShadow: "0px 10px 20px hsla(var(--primary) / 0.2)" } : {}}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "bg-card rounded-xl overflow-hidden shadow-md transition-all duration-300 h-full flex flex-col group relative border-2 border-transparent",
        !isEditMode && "hover:shadow-lg cursor-pointer tool-card-frequent firebase-gradient-border-hover animate-subtle-pulse-glow",
        isEditMode && "cursor-grab border-dashed border-muted-foreground/50"
      )}
      role="button"
      tabIndex={isEditMode || tool.comingSoon ? -1 : 0}
      onKeyDown={(e) => { if (!isEditMode && !tool.href && (e.key === 'Enter' || e.key === ' ') ) onLaunch(tool.id); }}
      aria-disabled={!!(isEditMode)}
      aria-label={`Launch ${tool.title}`}
    >
        {isEditMode && (
          <GripVertical className="absolute top-2 left-2 h-5 w-5 text-muted-foreground z-10" title="Drag to reorder" />
        )}
        {isFrequentlyUsed && !isEditMode && (
          <Star className="absolute top-2 right-2 h-5 w-5 text-yellow-400 fill-yellow-400 z-10" />
        )}
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center gap-3 mb-1.5">
            <div className={cn(
                "p-2 rounded-lg bg-primary/10 text-primary transition-colors duration-300",
                !isEditMode && "group-hover:bg-gradient-to-br group-hover:from-[hsl(var(--firebase-color-1-light-h),var(--firebase-color-1-light-s),calc(var(--firebase-color-1-light-l)_-_10%))/0.2] group-hover:to-[hsl(var(--firebase-color-3-light-h),var(--firebase-color-3-light-s),calc(var(--firebase-color-3-light-l)_-_10%))/0.2] group-hover:text-foreground"
            )}>
                <tool.icon className={cn(
                    "h-7 w-7 transition-transform duration-300",
                    !isEditMode && "group-hover:scale-110",
                    !isEditMode && "group-hover:text-purple-500"
                )} />
            </div>
            <CardTitle className={cn(
                "text-lg leading-tight text-foreground",
                 !isEditMode && "group-hover:text-primary"
            )}>{tool.title}</CardTitle>
          </div>
          <CardDescription className="text-xs leading-relaxed line-clamp-2 min-h-[2.5em]">{tool.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 px-4 pb-3 flex-grow flex items-end">
           <div className="w-full text-right">
              {tool.comingSoon ? (
                <div className="text-center text-xs text-amber-700 dark:text-amber-500 font-semibold p-1.5 bg-amber-500/10 rounded-md w-full">Coming Soon!</div>
              ) : (
                <Button variant="link" size="sm" disabled={isEditMode} className={cn(
                    "text-primary group-hover:underline p-0 h-auto text-xs",
                     !isEditMode && "group-hover:text-foreground group-hover:hover:text-primary",
                     isEditMode && "text-muted-foreground cursor-default"
                    )}>
                   Open Tool <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              )}
           </div>
        </CardContent>
    </motion.div>
  );

  if (isEditMode || tool.comingSoon) {
    return cardContent;
  }
  
  // If it has an href, it's a dedicated page
  if (tool.href) {
    return <Link href={tool.href} className="no-underline h-full flex">{cardContent}</Link>
  }

  // Otherwise, it launches a dialog
  return <DialogTrigger asChild onClick={() => onLaunch(tool.id)}>{cardContent}</DialogTrigger>;
};

export const ProToolCard = React.memo(ToolCardComponent);
ProToolCard.displayName = 'ProToolCard';
