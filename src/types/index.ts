export interface NotificationPayload {
  userId: string;
  type: 'EMAIL' | 'IN_APP';
  subject?: string;
  body: string;
  templateId?: string;
  metadata?: Record<string, any>;
}

export interface TicketPurchaseData {
  orderId: string;
  userId: string;
  eventId: string;
  ticketDetails: {
    quantity: number;
    totalAmount: number;
    seatNumbers?: string[];
  };
}

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  organizer: string;
  imageUrl?: string;
}

export interface OrderData {
  id: string;
  userId: string;
  eventId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  tickets: TicketData[];
}

export interface TicketData {
  id: string;
  orderId: string;
  seatNumber?: string;
  price: number;
  qrCode?: string;
}

export interface NotificationJobData {
  notificationId: string;
  userId: string;
  type: 'EMAIL' | 'IN_APP';
  templateId?: string;
  data: Record<string, any>;
}

export interface EmailTemplateData {
  userEmail: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  orderDetails: OrderData;
  ticketDetails: TicketData[];
}