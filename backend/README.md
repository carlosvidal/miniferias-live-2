# Miniferias Backend

Backend API for Miniferias Live Shopping Platform built with Node.js, Express, Prisma, and Supabase.

## Features

- 🔐 JWT Authentication
- 👥 Role-based Access Control (Admin, Exhibitor, Visitor)
- 📦 RESTful API for Events, Booths, Products, Orders, and Messages
- 🎥 Agora Live Streaming Integration
- 💬 Real-time Chat with Supabase Realtime
- 📧 Email Notifications
- 🗄️ PostgreSQL Database with Prisma ORM
- 🔒 Security with Helmet and Rate Limiting

## Prerequisites

- Node.js 18+
- PostgreSQL database (via Supabase or local)
- Supabase account
- Agora account (for live streaming)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

Or push schema directly (development):
```bash
npm run prisma:push
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Events
- `GET /api/events` - List events
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/slug/:slug` - Get event by slug
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)
- `GET /api/events/:id/stats` - Get event stats (Admin)

### Booths
- `GET /api/booths` - List booths
- `GET /api/booths/:id` - Get booth by ID
- `GET /api/booths/me/booth` - Get my booth (Exhibitor)
- `POST /api/booths` - Create booth (Admin)
- `PUT /api/booths/:id` - Update booth
- `DELETE /api/booths/:id` - Delete booth (Admin)
- `POST /api/booths/:id/stream/start` - Start streaming
- `POST /api/booths/:id/stream/stop` - Stop streaming
- `GET /api/booths/:id/stream-token` - Get streaming token

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/booth/:boothId` - Get products by booth
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/me` - Get my orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status

### Messages
- `GET /api/messages/booth/:boothId` - Get booth messages
- `POST /api/messages` - Send message
- `DELETE /api/messages/:id` - Delete message

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

## Deployment

### Render.com

1. Create new Web Service
2. Connect your repository
3. Set build command: `npm install && npx prisma generate`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`
6. Deploy!

## License

MIT