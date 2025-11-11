# Miniferias Frontend

Frontend application for Miniferias Live Shopping Platform built with Vue 3, Vite, Tailwind CSS, and Agora SDK.

## Features

- 🎨 Modern UI with Tailwind CSS (Mobile-first)
- 🔐 Authentication (Login/Register)
- 📺 Live Streaming with Agora SDK
- 💬 Real-time Chat with Supabase Realtime
- 🛒 Shopping Cart
- 📦 Order Management
- 👥 Role-based UI (Admin, Exhibitor, Visitor)
- ⚡ Fast and responsive with Vite

## Tech Stack

- **Vue 3** - Composition API
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Pinia** - State management
- **Vue Router** - Routing
- **Agora SDK** - Live streaming
- **Supabase** - Real-time subscriptions
- **Axios** - HTTP client

## Prerequisites

- Node.js 18+
- Backend API running (see backend/README.md)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_AGORA_APP_ID=your-agora-app-id
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

Build the app:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable components
│   ├── shared/      # Shared components
│   ├── events/      # Event components
│   ├── booths/      # Booth components
│   └── ...
├── composables/     # Vue composables
│   └── useAgora.js  # Agora streaming composable
├── router/          # Vue Router configuration
├── services/        # API services
│   ├── api.js       # Axios instance & API calls
│   └── supabase.js  # Supabase client
├── stores/          # Pinia stores
│   ├── auth.js      # Authentication store
│   ├── events.js    # Events store
│   └── cart.js      # Shopping cart store
├── views/           # Page components
│   ├── auth/        # Login, Register
│   ├── admin/       # Admin views
│   ├── exhibitor/   # Exhibitor views
│   └── ...
├── App.vue          # Root component
└── main.js          # App entry point
```

## Features Implementation Status

### ✅ Implemented
- Authentication (Login/Register)
- Event listing and detail views
- Booth listing
- Shopping cart
- Responsive navigation
- Role-based routing
- Loading states

### 🚧 In Development
- Booth detail with live stream
- Real-time chat
- Product catalog
- Order checkout
- Admin dashboard
- Exhibitor dashboard
- Live streaming controls

## Deployment

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables in Netlify dashboard

## License

MIT