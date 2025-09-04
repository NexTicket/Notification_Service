export interface SendNotificationParams {
  recipient: string;
  subject?: string;
  content: string;
  textContent?: string;
  metadata?: Record<string, any>;
  attachments?:{
    content: string;
    filename: string;
    type: string;
  }[];
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface INotificationService {
  send(params: SendNotificationParams): Promise<SendResult>;
  sendBulk(notifications: SendNotificationParams[]): Promise<SendResult[]>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject?: string;
  htmlContent: string;
  textContent?: string;
  variables?: string[];
  isActive: boolean;
}

export interface CreateNotificationRequest {
  type: NotificationType;
  recipient: string;
  templateName?: string;
  variables?: Record<string, any>;
  subject?: string;
  content?: string;
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
}

export enum NotificationType {
  TICKET_PURCHASE = 'TICKET_PURCHASE',
  EVENT_ANNOUNCEMENT = 'EVENT_ANNOUNCEMENT',
  EVENT_REMINDER = 'EVENT_REMINDER',
  GENERAL_EMAIL = 'GENERAL_EMAIL'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  DELIVERED = 'DELIVERED',
  BOUNCED = 'BOUNCED',
  CLICKED = 'CLICKED'
}
