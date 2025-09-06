import 'jest';

// Mock Redis
jest.mock('redis', () => ({
    createClient: jest.fn(() => ({
        on: jest.fn(),
        connect: jest.fn(),
        get: jest.fn(),
        setEx: jest.fn(),
        del: jest.fn(),
        exists: jest.fn(),
        isOpen: true
    }))
}));

// Mock SendGrid
jest.mock('../src/services/sendGridService', () => ({
    sendEmail: jest.fn()
}));

// Mock externalApi
jest.mock('../src/services/externalAPIService', () => ({
    ExternalApiService: jest.fn().mockImplementation(() => ({
        getEventDetails: jest.fn(),
        getOrderDetails: jest.fn(),
        getEventAttendees: jest.fn()
    }))
}));
