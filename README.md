# NexTicket Notification Service

A microservice for handling notifications across the NexTicket platform. Receives events via **Kafka** from other microservices and sends notifications through various channels (Email, SMS, In-App).

##  Architecture

```
Other Microservices → Kafka → Notification Service → Bull Queue → SendGrid/Email
                                      ↓
                                   PostgreSQL (Notification History)
                                      ↓
                                    Redis (Cache + Queue)
```

##  Features

-  **Kafka Consumer** - Listens to events from other microservices
-  **Email Notifications** - SendGrid integration
-  **Queue Processing** - Bull queue with Redis for async processing
-  **Notification History** - PostgreSQL database with Prisma ORM
-  **Health Checks** - Readiness and liveness probes
-  **Docker Support** - Development and production containers
-  **Hot Reload** - Nodemon for development

##  Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)
- Kafka (or use Docker)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Running Locally (without Docker)

```bash
# Start development server with hot-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Running with Docker (Recommended)

#### Development Mode

```bash
# Start all services (Notification Service + Kafka + Redis + PostgreSQL)
docker-compose -f docker-compose.dev.yml up --build

# Access services:
# - Notification Service: http://localhost:4001
# - Kafka UI: http://localhost:8080
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - Kafka: localhost:9092
```

#### Production Mode

```bash
# Start production stack
docker-compose up --build

# Access at http://localhost:5001
```

##  Kafka Integration

### Topics Subscribed

The notification service listens to the following Kafka topics:

- `order-events` - Order creation, confirmation, cancellation
- `payment-events` - Payment success/failure
- `ticket-events` - Ticket generation
- `user-events` - User registration
- `event-notifications` - Event reminders, cancellations

### Supported Event Types

| Event Type | Notification Sent |
|------------|-------------------|
| `order.confirmed` | Order confirmation email |
| `order.cancelled` | Order cancellation email with refund info |
| `payment.successful` | Payment confirmation |
| `payment.failed` | Payment failure notice |
| `ticket.generated` | Ticket delivery with QR code |
| `user.registered` | Welcome email |
| `event.reminder` | Event reminder (24h before) |
| `event.cancelled` | Event cancellation with refund |

### Example Kafka Message

#### Order Confirmation Event

```json
{
  "eventType": "order.confirmed",
  "orderId": "ord_abc123",
  "userId": "user_xyz789",
  "eventId": "evt_def456",
  "eventTitle": "Rock Concert 2025",
  "eventDate": "2025-12-31T20:00:00Z",
  "venue": "Madison Square Garden",
  "totalAmount": 150.00,
  "ticketIds": ["tick_001", "tick_002"],
  "timestamp": "2025-10-17T10:30:00Z"
}
```

##  API Endpoints

### REST API

#### Send Notification (Manual)

```http
POST /api/notify
Content-Type: application/json

{
  "type": "EMAIL",
  "recipient": "user_id_or_email",
  "subject": "Test Notification",
  "content": "<h1>Hello!</h1>",
  "variables": {
    "userName": "John Doe"
  }
}
```

### Health Checks

```http
GET /api/health          # Overall health
GET /api/health/ready    # Readiness probe
GET /api/health/live     # Liveness probe
```

##  Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `4001` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `KAFKA_BROKERS` | Comma-separated Kafka brokers | `localhost:9092` |
| `KAFKA_GROUP_ID` | Kafka consumer group ID | `notification-service-group` |
| `SENDGRID_API_KEY` | SendGrid API key | - |
| `SENDGRID_FROM_EMAIL` | Sender email address | - |

##  Testing Kafka Integration

### Send Test Event

```bash
# Using kafka-console-producer
docker exec -it notification-kafka-dev kafka-console-producer \
  --broker-list localhost:9092 \
  --topic order-events

# Then paste:
{"eventType":"order.confirmed","orderId":"test_123","userId":"test_user","eventId":"test_event","eventTitle":"Test Event","eventDate":"2025-12-31T20:00:00Z","venue":"Test Venue","totalAmount":100,"ticketIds":["t1"],"timestamp":"2025-10-17T10:00:00Z"}
```

### Using Kafka UI

1. Navigate to `http://localhost:8080`
2. Select topic (e.g., `order-events`)
3. Click "Produce Message"
4. Paste JSON event
5. Watch logs: `docker-compose logs -f notification-service`

##  Project Structure

```
├── src/
│   ├── config/
│   │   ├── database.ts      # Prisma client
│   │   ├── redis.ts         # Redis client + cache service
│   │   ├── kafka.ts         # Kafka client (NEW)
│   │   └── sendgrid.ts      # SendGrid client
│   ├── services/
│   │   ├── kafkaConsumer.ts      # Kafka event handlers (NEW)
│   │   ├── sendGridService.ts
│   │   └── externalAPIService.ts
│   ├── types/
│   │   ├── kafka.types.ts        # Kafka event schemas (NEW)
│   │   └── notification.types.ts
│   └── index.ts                  # Application entry
```

## 🚢 CI/CD

### GitHub Actions

Automatically builds and pushes Docker image on push to `main` branch.

**Required Secrets:**
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token

---

**NexTicket Development Team**
