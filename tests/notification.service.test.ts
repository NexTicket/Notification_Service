import { sendTicketPurchaseNotification } from '../src/services/ticketPurchaseService';

describe('Notification Services', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should send ticket purchase notification', async () => {
        // Setup mocks
        const { externalApi } = require('../src/services/ticketPurchaseService');
        externalApi.getEventDetails.mockResolvedValue({
            id: 'event-1',
            title: 'Summer Music Festival',
            description: 'A fantastic outdoor music event',
            date: '2025-09-15T18:00:00Z',
            venue: 'Central Park',
            organizer: 'Music Co'
        });
        externalApi.getOrderDetails.mockResolvedValue({
            id: 'order-1',
            userId: 'user-1',
            eventId: 'event-1',
            totalAmount: 150,
            status: 'confirmed',
            createdAt: '2025-09-01T10:00:00Z',
            tickets: []
        });

        const mockSendEmail = require('../src/services/sendGridService').sendEmail;
        mockSendEmail.mockResolvedValue({ success: true });

        const mockData = {
            orderId: 'order-1',
            userId: 'user-1',
            eventId: 'event-1',
            ticketDetails: {
                quantity: 2,
                totalAmount: 150
            }
        };
        const result = await sendTicketPurchaseNotification(mockData);
        expect(result.success).toBe(true);
        expect(mockSendEmail).toHaveBeenCalled();
    });
});
