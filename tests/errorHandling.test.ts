test('should handle event not found', async () => {
    const { externalApi } = require('../src/services/ticketPurchaseService');
    externalApi.getEventDetails.mockResolvedValue(null);

    const { sendTicketPurchaseNotification } = require('../src/services/ticketPurchaseService');
    const result = await sendTicketPurchaseNotification({
        orderId: 'order-1',
        userId: 'test@example.com',
        eventId: 'invalid-event',
        ticketDetails: { quantity: 1, totalAmount: 100 }
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to fetch event');
});