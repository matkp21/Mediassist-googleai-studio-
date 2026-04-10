// src/types/notifications.ts

export type NotificationType =
  | 'medication_reminder'
  | 'appointment_reminder'
  | 'wellness_nudge'
  | 'new_content'
  | 'study_material_update'
  | 'study_session_reminder'
  | 'quiz_review_due'
  | 'learning_path_update'
  | 'task_reminder'
  | 'urgent_patient_alert' // Use with extreme caution and privacy considerations
  | 'summary_ready'
  | 'guideline_update'
  | 'system_update'
  | 'security_alert'
  | 'general';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  deepLink?: string; // Path to navigate to within the app
  icon?: React.ElementType; // Optional: specific icon component
  actions?: NotificationAction[]; // Optional: for actionable notifications
}
