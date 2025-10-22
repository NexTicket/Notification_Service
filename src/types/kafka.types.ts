// Kafka Event Types
export interface KafkaMessage<T = any> {
    topic: string;
    partition: number;
    offset: string;
    key: string | null;
    value: T;
    timestamp: string;
    headers?: Record<string, string>;
}

// Event types from different microservices
export enum KafkaEventType {
    ORDER_CREATED = 'order.created',
    ORDER_CONFIRMED = 'order.confirmed',
    ORDER_CANCELLED = 'order.cancelled',
    PAYMENT_SUCCESSFUL = 'payment.successful',
    PAYMENT_FAILED = 'payment.failed',
    TICKET_GENERATED = 'ticket.generated',
    USER_REGISTERED = 'user.registered',
    EVENT_REMINDER = 'event.reminder',
    EVENT_CANCELLED = 'event.cancelled',
}

// Order Service Events
export interface OrderCreatedEvent {
    eventType: KafkaEventType.ORDER_CREATED;
    orderId: string;
    userId: string;
    eventId: string;
    totalAmount: number;
    quantity: number;
    timestamp: string;
}

export interface OrderConfirmedEvent {
    eventType: KafkaEventType.ORDER_CONFIRMED;
    orderId: string;
    userId: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    venue: string;
    totalAmount: number;
    ticketIds: string[];
    timestamp: string;
}

export interface OrderCancelledEvent {
    eventType: KafkaEventType.ORDER_CANCELLED;
    orderId: string;
    userId: string;
    reason: string;
    refundAmount: number;
    timestamp: string;
}

// Payment Service Events
export interface PaymentSuccessfulEvent {
    eventType: KafkaEventType.PAYMENT_SUCCESSFUL;
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    paymentMethod: string;
    timestamp: string;
}

export interface PaymentFailedEvent {
    eventType: KafkaEventType.PAYMENT_FAILED;
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    reason: string;
    timestamp: string;
}

// Ticket Service Events - The main notification trigger
export interface TicketGeneratedEvent {
    eventType: KafkaEventType.TICKET_GENERATED;
    messageId: string;          // Unique message ID for idempotency
    ticketId: string;
    orderId: string;
    firebaseUid: string;        // User's Firebase UID (not email)
    eventId: string;
    venueId: string;
    qrData: string;             // QR code data string (not the image)
    timestamp: string;
}

// User Service Events
export interface UserRegisteredEvent {
    eventType: KafkaEventType.USER_REGISTERED;
    userId: string;
    email: string;
    displayName: string;
    timestamp: string;
}

// Event Service Events
export interface EventReminderEvent {
    eventType: KafkaEventType.EVENT_REMINDER;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    venue: string;
    userIds: string[];
    timestamp: string;
}

export interface EventCancelledEvent {
    eventType: KafkaEventType.EVENT_CANCELLED;
    eventId: string;
    eventTitle: string;
    reason: string;
    affectedUserIds: string[];
    refundInfo: {
        refundAmount: number;
        refundMethod: string;
    };
    timestamp: string;
}

// Union type for all Kafka events
export type KafkaEvent =
    | OrderCreatedEvent
    | OrderConfirmedEvent
    | OrderCancelledEvent
    | PaymentSuccessfulEvent
    | PaymentFailedEvent
    | TicketGeneratedEvent
    | UserRegisteredEvent
    | EventReminderEvent
    | EventCancelledEvent;
