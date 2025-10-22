// Types for the new notification architecture

export interface NotificationData {
    eventName: string;
    venueName: string;
    venueAddress?: string;
    eventDate: string;
    ticketId: string;
    orderId: string;
    seatNumber?: string;
    userName?: string;
    [key: string]: any; // Allow additional dynamic template data
}

export interface UserData {
    firebaseUid: string;
    email: string;
    displayName?: string;
}

export interface EventData {
    eventId: string;
    eventName: string;
    eventDate: string;
    venueId: string;
    venueName: string;
    venueAddress?: string;
    organizerName?: string;
    [key: string]: any;
}

export interface ProcessNotificationParams {
    messageId: string;
    firebaseUid: string;
    qrData: string;
    ticketId: string;
    orderId: string;
    eventId: string;
    venueId: string;
    timestamp: string;
}

export enum NotificationStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED',
    RETRYING = 'RETRYING',
}

export const MAX_RETRY_ATTEMPTS = 3;
export const DLQ_TOPIC = 'notifications_dlq';

// SendGrid specific types
export interface SendGridTemplateData {
    eventName: string;
    venueName: string;
    eventDate: string;
    qrCodeUrl: string;
    userName: string;
    ticketId: string;
    orderId: string;
    [key: string]: any;
}

