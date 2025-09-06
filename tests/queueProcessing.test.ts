// Mock Bull queue
jest.mock('bull', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
        process: jest.fn()
    }))
}));

test('should add notification to queue', async () => {
    const { notificationQueue } = require('../src/queues/notificationQueue');
    
    await notificationQueue.add({
        type: 'TICKET_PURCHASE',
        orderId: 'order-1',
        userId: 'test@example.com',
        eventId: 'event-1',
        ticketDetails: { quantity: 1, totalAmount: 100 }
    });

    expect(notificationQueue.add).toHaveBeenCalledWith({
        type: 'TICKET_PURCHASE',
        orderId: 'order-1',
        userId: 'test@example.com',
        eventId: 'event-1',
        ticketDetails: { quantity: 1, totalAmount: 100 }
    });
});