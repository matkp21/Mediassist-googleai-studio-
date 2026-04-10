// src/components/notifications/notification-list-item-page.tsx
"use client";

import type { NotificationItem } from '@/types/notifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { 
  Pill, CalendarDays, Sparkles, Edit, BookOpen, School, FileText, 
  Brain, CheckSquare, AlertCircle, Info, BellRing, Settings, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const getIconForNotificationType = (type: NotificationItem['type']): React.ElementType => {
  switch (type) {
    case 'medication_reminder': return Pill;
    case 'appointment_reminder': return CalendarDays;
    case 'wellness_nudge': return Sparkles;
    case 'new_content': return Edit;
    case 'study_material_update': return BookOpen;
    case 'study_session_reminder': return School;
    case 'quiz_review_due': return FileText;
    case 'learning_path_update': return Brain;
    case 'task_reminder': return CheckSquare;
    case 'urgent_patient_alert': return AlertCircle;
    case 'summary_ready': return FileText;
    case 'guideline_update': return Info;
    case 'system_update': return Settings;
    case 'security_alert': return AlertCircle;
    case 'general': return BellRing;
    default: return BellRing;
  }
};

interface NotificationListItemPageProps {
  item: NotificationItem;
  onMarkAsRead: (id: string) => void;
}

export function NotificationListItemPage({ item, onMarkAsRead }: NotificationListItemPageProps) {
  const IconComponent = getIconForNotificationType(item.type);

  const handleItemClick = () => {
    if (!item.isRead) {
      onMarkAsRead(item.id);
    }
    // Navigation will be handled by the Link component
  };

  const content = (
    <div
      className={cn(
        "flex items-start gap-4 p-4 transition-colors duration-150 hover:bg-muted/50",
        !item.isRead && 'bg-primary/5',
      )}
      role="button"
      tabIndex={0}
      onClick={handleItemClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleItemClick()}
    >
      {!item.isRead && (
        <span className="mt-1.5 flex-shrink-0 h-2.5 w-2.5 bg-primary rounded-full animate-pulse" aria-label="Unread notification" />
      )}
      {item.isRead && (
          <span className="mt-1.5 flex-shrink-0 h-2.5 w-2.5" /> 
      )}
      <IconComponent className={cn("h-6 w-6 mt-0.5 flex-shrink-0", item.isRead ? "text-muted-foreground" : "text-primary")} />
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-start mb-0.5">
            <h3 className={cn("text-md font-semibold text-foreground", !item.isRead && "text-primary")}>{item.title}</h3>
            <p className="text-xs text-muted-foreground/90 flex-shrink-0 ml-2 whitespace-nowrap">
                {formatDistanceToNowStrict(item.timestamp, { addSuffix: true })}
            </p>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>
      </div>
      {item.deepLink && (
        <ArrowRight className="h-5 w-5 text-muted-foreground self-center flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"/>
      )}
    </div>
  );

  if (item.deepLink) {
    return (
      <Link href={item.deepLink} className="block w-full no-underline group cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
}
