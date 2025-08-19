# NestJS E-commerce Platform

A production-grade e-commerce platform built with NestJS that supports three business models:
- **Digital Goods**: Software licenses, downloads, digital content
- **Offline Services**: Fitness classes, studio bookings, equipment rentals
- **Online Consulting**: One-on-one consultations, coaching sessions

## 🚀 Features

- **Multi-tenant Architecture**: Merchants can manage their own products
- **Comprehensive Payment Processing**: Stripe integration with webhooks
- **Flexible Inventory Management**: Count-based and time-slot inventory
- **Advanced Booking System**: Resource scheduling with capacity management
- **Policy Engine**: Configurable refund and cancellation policies
- **Real-time Processing**: Redis queues for webhooks and background jobs
- **Production Ready**: Health checks, logging, rate limiting, audit trails

## 🛠 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe (Checkout + Webhooks)
- **Auth**: JWT with refresh tokens, RBAC
- **Cache/Queues**: Redis + BullMQ
- **Validation**: class-validator, class-transformer
- **Docs**: Swagger/OpenAPI 3
- **Testing**: Jest
- **Logging**: Pino

## 📁 Project Structure

```
src/
├── auth/                 # Authentication & authorization
├── catalog/              # Products, prices, media
├── inventory/            # Stock management, ledger
├── orders/               # Cart, orders, order items
├── payments/             # Stripe integration
├── booking/              # Time slots, reservations
├── delivery/             # Digital fulfillment
├── policy/               # Refund/cancellation rules
├── webhooks/             # Stripe webhook processing
├── notifications/        # Email/SMS notifications
├── audit/                # Audit logging
├── admin/                # Admin endpoints
├── customers/            # Customer management
└── common/               # Shared utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd nestjs-ecommerce
   npm install
   ```

2. **Start infrastructure**:
   ```bash
   docker-compose up -d
   ```

3. **Setup environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Stripe keys and database URL
   ```

4. **Setup database**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**:
   ```bash
   npm run start:dev
   ```

6. **Access the application**:
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/docs


## 🔑 Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestjs_ecommerce?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

## 📚 API Usage Examples

### Authentication

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Digital Goods Flow

```bash
# 1. Get products
curl -X GET "http://localhost:3000/api/v1/catalog/products?type=DIGITAL"

# 2. Create cart
curl -X POST http://localhost:3000/api/v1/cart \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Add digital product to cart
curl -X POST http://localhost:3000/api/v1/cart/CART_ID/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "priceId": "PRICE_ID",
    "quantity": 1
  }'

# 4. Create order from cart
curl -X POST http://localhost:3000/api/v1/orders/from-cart/CART_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Create Stripe checkout session
curl -X POST http://localhost:3000/api/v1/payments/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORDER_ID"}'
```

### Booking Flow (Offline Services)

```bash
# 1. Get booking products with available slots
curl -X GET "http://localhost:3000/api/v1/catalog/products?type=OFFLINE_SERVICE"

# 2. Add booking to cart with time slot
curl -X POST http://localhost:3000/api/v1/cart/CART_ID/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "YOGA_CLASS_ID",
    "priceId": "PRICE_ID",
    "quantity": 1,
    "slotId": "TIME_SLOT_ID"
  }'

# 3. Proceed with order creation and payment...
```

### Online Consulting Flow

```bash
# 1. Get consulting products
curl -X GET "http://localhost:3000/api/v1/catalog/products?type=ONLINE_CONSULTING"

# 2. Add consulting session with time slot
curl -X POST http://localhost:3000/api/v1/cart/CART_ID/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "CONSULTING_ID",
    "priceId": "PRICE_ID",
    "quantity": 1,
    "slotId": "CONSULTANT_SLOT_ID"
  }'
```

## 🎯 User Roles & Permissions

- **ADMIN**: Full system access, can manage all merchants and products
- **MERCHANT**: Can create/manage their own products, view their orders
- **CUSTOMER**: Can browse products, create orders, manage their profile

## 🔧 Available Scripts

```bash
npm run start:dev        # Start development server
npm run build           # Build for production
npm run start:prod      # Start production server
npm run test            # Run tests
npm run test:e2e        # Run e2e tests
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio
npm run lint            # Lint code
npm run format          # Format code
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔒 Security Features

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- Stripe webhook signature verification
- Rate limiting on sensitive endpoints
- Audit logging for critical operations
- No raw card data storage

## 📊 Monitoring & Health

- Health check endpoint: `/health`
- Structured logging with Pino
- Database health monitoring
- Memory and disk usage monitoring

## 🚀 Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Run database migrations**:
   ```bash
   npm run db:deploy
   ```

4. **Start the application**:
   ```bash
   npm run start:prod
   ```

## 📝 Sample Test Accounts

The seed script creates test accounts:

- **Admin**: admin@example.com / admin123
- **Merchant**: merchant@example.com / merchant123  
- **Customer**: customer@example.com / customer123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details# nestjs-storefront
