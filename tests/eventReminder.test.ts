// Mock external API service
jest.mock('../src/services/externalAPIService', () => ({
    ExternalApiService: jest.fn().mockImplementation(() => ({
        getEventDetails: jest.fn().mockResolvedValue({
            id: 'event-1',
            title: 'Test Event',
            date: '2025-09-15T18:00:00Z',
            venue: 'Test Venue',
            description: 'Test Description'
        }),
        getEventAttendees: jest.fn().mockResolvedValue([
            { email: 'mindirebeka@gmail.com', displayName: 'Test User' }
        ])
    }))
}));

// Mock SendGrid service
jest.mock('../src/services/sendGridService', () => ({
    sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

test('should send event reminder', async () => {
    const { sendEventReminder } = require('../src/services/eventReminderService');
    const result = await sendEventReminder('event-1', 1);
    
    expect(result.success).toBe(true);
    const mockSendEmail = require('../src/services/sendGridService').sendEmail;
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
});