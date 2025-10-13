# Notification Service

A robust microservice for handling email notifications in the NexTicket platform. Built with Node.js, Express, TypeScript, Redis, and SendGrid.

## 🚀 Features

- **Asynchronous Email Processing**: Queue-based email sending using Redis and Bull
- **Multiple Notification Types**: Support for ticket purchases, event announcements, and event reminders
- **Database Persistence**: Track notification status and history with Prisma and PostgreSQL
- **QR Code Generation**: Automatic QR code generation for tickets
- **Template Support**: Extensible notification templates
- **Health Monitoring**: Built-in health check endpoints
- **Comprehensive Testing**: Unit and integration tests

## 🏗️ Architecture

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Routes    │    │   Queue System  │    │   Email Service │
│                 │    │                 │    │                 │
│ • /api/notify   │───▶│ • Redis Queue   │───▶│ • SendGrid      │
│ • /api/health   │    │ • Bull Worker   │    │ • QR Codes      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │                 │
                       │ • Notifications │
                       │ • Templates     │
                       └─────────────────┘
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Redis server
- SendGrid account with API key

## 🛠️ Installation

1. **Clone and navigate to the service:**

   ```bash
   cd Notification_Service
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup SendGrid API Key:**

   ```bash
   npm run setup:sendgrid
   ```

4. **Environment Configuration:**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/notification_db"
   DIRECT_URL="postgresql://username:password@localhost:5432/notification_db"

   # Redis
   REDIS_URL="redis://localhost:6379"

   # SendGrid
   SENDGRID_API_KEY="SG.your_sendgrid_api_key_here"
   SENDGRID_FROM_EMAIL="noreply@nexticket.com"

   # Server
   PORT=5000
   ```

5. **Database Setup:**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push database schema
   npx prisma db push
   ```

## 🚀 Running the Service

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Testing

```bash
# Run all tests
npm test

# Test real email sending (requires SendGrid setup)
npm run test:real-email
```

## 📡 API Endpoints

### Health Check

```http
GET /api/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T10:00:00.000Z",
  "service": "notification-service"
}
```

### Send Notification

```http
POST /api/notify
Content-Type: application/json
```

**Request Body:**

```json
{
  "type": "TICKET_PURCHASE",
  "recipient": "user@example.com",
  "orderId": "order-123",
  "userId": "user@example.com",
  "eventId": "event-123",
  "ticketDetails": {
    "quantity": 2,
    "totalAmount": 150
  }
}
```

**Supported Notification Types:**

- `TICKET_PURCHASE`: Sends ticket confirmation with QR code
- `EVENT_ANNOUNCEMENT`: Sends event announcements to attendees
- `EVENT_REMINDER`: Sends event reminders before the event

**Response:**

```json
{
  "message": "Notification queued.",
  "id": "notification-id-123"
}
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Real Email Test

```bash
npm run test:real-email
```

### API Testing Example

```bash
curl -X POST http://localhost:5000/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "TICKET_PURCHASE",
    "recipient": "test@example.com",
    "orderId": "test-123",
    "userId": "test@example.com",
    "eventId": "event-123",
    "ticketDetails": {
      "quantity": 1,
      "totalAmount": 50
    }
  }'
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `DIRECT_URL` | Direct PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection URL | No | `redis://localhost:6379` |
| `SENDGRID_API_KEY` | SendGrid API key | Yes | - |
| `SENDGRID_FROM_EMAIL` | Verified sender email | Yes | - |
| `PORT` | Server port | No | `5000` |

### SendGrid Setup

1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com)
2. Generate an API key in Settings > API Keys
3. Verify your sender email address
4. Run the setup script: `npm run setup:sendgrid`

## 📁 Project Structure

```text
Notification_Service/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client setup
│   │   ├── redis.ts           # Redis connection
│   │   └── sendgrid.ts        # SendGrid configuration
│   ├── controllers/
│   │   └── notification.controller.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts    # Error handling middleware
│   │   └── requestLogger.ts   # Request logging middleware
│   ├── queues/
│   │   ├── notificationQueue.ts      # Bull queue setup
│   │   └── notificationProcessor.ts  # Queue processor
│   ├── routes/
│   │   ├── notification.routes.ts    # Notification routes
│   │   └── health.routes.ts          # Health check routes
│   ├── services/
│   │   ├── sendGridService.ts        # Email sending service
│   │   ├── ticketPurchaseService.ts  # Ticket purchase notifications
│   │   ├── eventAnnouncementService.ts
│   │   ├── eventReminderService.ts
│   │   ├── externalAPIService.ts     # External API calls
│   │   └── userService.ts            # User data service
│   ├── types/
│   │   └── notification.types.ts     # TypeScript types
│   └── index.ts                      # Application entry point
├── tests/                            # Test files
├── setup-sendgrid.ts                 # SendGrid setup script
├── test-real-email.ts                # Real email testing script
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Queue Processing

The service uses Redis and Bull for asynchronous email processing:

1. **Queue Submission**: Notifications are added to Redis queue via `/api/notify`
2. **Background Processing**: Worker processes queue items asynchronously
3. **Status Tracking**: All notifications are tracked in the database
4. **Error Handling**: Failed notifications are marked and can be retried

## 📊 Database Schema

### Notification Table

- `id`: Unique identifier
- `type`: Notification type (EMAIL, IN_APP)
- `userId`: User identifier
- `subject`: Email subject
- `body`: Email content
- `status`: Status (PENDING, SENT, FAILED)
- `templateId`: Template reference
- `metadata`: Additional data
- `sentAt`: Timestamp when sent
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### NotificationTemplate Table

- `id`: Unique identifier
- `name`: Template name
- `subject`: Email subject template
- `body`: Text content template
- `htmlContent`: HTML content template
- `textContent`: Plain text content
- `variables`: Template variables
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## 🚨 Error Handling

The service includes comprehensive error handling:

- **Queue Processing Errors**: Failed emails are marked in database
- **API Errors**: Proper HTTP status codes and error messages
- **SendGrid Errors**: Detailed error logging and fallback handling
- **Database Errors**: Connection and query error handling

## 🔒 Security

- Environment variables for sensitive data
- Input validation for API requests
- Rate limiting considerations (to be implemented)
- Secure email content handling

## 📈 Monitoring

- Health check endpoint: `GET /api/health`
- Database connection monitoring
- Queue status monitoring
- Email delivery tracking

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## 📝 License

This project is part of the NexTicket platform.
