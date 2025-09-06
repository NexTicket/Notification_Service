// Mock external API service
jest.mock('../src/services/externalAPIService', () => ({
    ExternalApiService: jest.fn().mockImplementation(() => ({
        getEventDetails: jest.fn().mockResolvedValue({
            id: 'event-1',
            title: 'New Event',
            date: '2025-09-20T19:00:00Z',
            venue: 'Announcement Venue',
            organizer: 'Test Org'
        }),
        getEventAttendees: jest.fn().mockResolvedValue([
            { email: 'attendee1@example.com' },
            { email: 'attendee2@example.com' }
        ])
    }))
}));

// Mock SendGrid service
jest.mock('../src/services/sendGridService', () => ({
    sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

test('should send event announcement', async () => {
    const { sendEventAnnouncement } = require('../src/services/eventAnnouncementService');
    const result = await sendEventAnnouncement('event-1', 'Custom message');
    
    expect(result.success).toBe(true);
    const mockSendEmail = require('../src/services/sendGridService').sendEmail;
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
});