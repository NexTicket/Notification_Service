import { EventData, OrderData, TicketData, UserData } from '../types/index';

export const mockEvents: EventData[] = [
    {
        id: 'event-1',
        title: 'Summer Music Festival',
        description: 'A fantastic outdoor music event',
        date: '2025-09-15T18:00:00Z',
        venue: 'Central Park',
        organizer: 'Music Co',
        imageUrl: 'https://example.com/image.jpg'
    }
];

export const mockOrders: OrderData[] = [
    {
        id: 'order-1',
        userId: 'user-1',
        eventId: 'event-1',
        totalAmount: 150,
        status: 'confirmed',
        createdAt: '2025-09-01T10:00:00Z',
        tickets: [
            {
                id: 'ticket-1',
                orderId: 'order-1',
                seatNumber: 'A1',
                price: 75,
                qrCode: 'mock-qr-code-1'
            },
            {
                id: 'ticket-2',
                orderId: 'order-1',
                seatNumber: 'A2',
                price: 75,
                qrCode: 'mock-qr-code-2'
            }
        ]
    }
];

export const mockUsers: UserData[] = [
    {
        uid: 'user-1',
        email: 'mindirebeka@gmail.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
    }
];

export const mockTickets: TicketData[] = [
    {
        id: 'ticket-1',
        orderId: 'order-1',
        seatNumber: 'A1',
        price: 75,
        qrCode: 'mock-qr-code-1'
    }
];