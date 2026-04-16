# GAZE Security Platform - Frontend

Modern security operations dashboard built with Next.js 15, React 19, shadcn/ui, and Tailwind CSS.

## Features

- **Modern Stack**: Next.js 15 App Router, React 19, TypeScript
- **Beautiful UI**: shadcn/ui components with Tailwind CSS
- **Dark/Light Theme**: System-aware theming with next-themes
- **Responsive**: Mobile-first design
- **Type-Safe**: Full TypeScript coverage
- **API Integration**: Pre-built hooks for backend connection

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm, pnpm, or yarn
- Backend API running (see gazesecurity-secops-backend)

### Development Setup

```bash
# 1. Install dependencies
npm install --legacy-peer-deps
# or
pnpm install

# 2. Configure environment
cp .env.example .env.local

# 3. Update API URL in .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# 4. Start development server
npm run dev

# 5. Open browser
open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Build Output

After running `npm run build`, the output is in `.next/` directory:
- `.next/standalone/` - Standalone Node.js server (used in Docker)
- `.next/static/` - Static assets

### Docker Build

```bash
# Build Docker image
docker build -t gazesecurity-secops-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://your-backend:8000/api \
  gazesecurity-secops-frontend
```

### Docker Deployment

```bash
# Build image
docker build -t gazesecurity-secops-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://backend:8000/api \
  gazesecurity-secops-frontend
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:8000/api |

## Project Structure

```
gazesecurity-secops-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login)
│   │   ├── (dashboard)/       # Dashboard pages
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── assessments/   # Assessments list
│   │   │   ├── findings/      # Findings table
│   │   │   └── assets/        # Asset inventory
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Theme & styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Sidebar, Header
│   │   └── ...                # Feature components
│   ├── hooks/
│   │   ├── use-auth.tsx       # Authentication hook
│   │   └── use-data.ts        # Data fetching hooks
│   ├── lib/
│   │   ├── api/               # API client & endpoints
│   │   └── utils.ts           # Utilities
│   └── types/                 # TypeScript definitions
├── Dockerfile                 # Production Docker build
├── package.json
└── tailwind.config.ts
```

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Authentication page |
| `/dashboard` | Main dashboard with metrics & charts |
| `/assessments` | Security assessments list |
| `/findings` | Vulnerability findings table |
| `/assets` | Asset inventory |

## Connecting to Backend

The frontend connects to the Flask backend API. Ensure:

1. Backend is running on the configured URL
2. CORS is enabled on backend for frontend origin
3. Session cookies can be shared (same domain or proper CORS config)

### Development (separate processes)

```bash
# Terminal 1: Start backend
cd gazesecurity-secops-backend
docker compose up

# Terminal 2: Start frontend
cd gazesecurity-secops-frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api npm run dev
```

### Production (Docker Compose)

See `docs/INTEGRATION.md` for full-stack Docker deployment.

## API Integration

### Authentication

```tsx
import { useAuth } from '@/hooks';

function LoginPage() {
  const { login, isLoading } = useAuth();
  
  const handleSubmit = async (email, password) => {
    const result = await login(email, password);
    if (result.requiresMfa) {
      // Redirect to MFA page
    } else if (result.success) {
      // Redirect to dashboard
    }
  };
}
```

### Data Fetching

```tsx
import { useFindings, useDashboardStats } from '@/hooks';

function Dashboard() {
  const { stats, isLoading } = useDashboardStats();
  const { data: findings } = useFindings({ 
    filters: { severity: 'critical' } 
  });
  
  // Render data...
}
```

### Direct API Calls

```tsx
import { findingsApi } from '@/lib/api';

async function createFinding(data) {
  const response = await findingsApi.create(data);
  if (response.success) {
    // Handle success
  }
}
```

## Theming

The app supports light and dark themes. Customize colors in `src/app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  /* ... */
}
```

### Severity Colors

Custom colors for vulnerability severity levels:
- Critical: Red
- High: Orange  
- Medium: Yellow
- Low: Green
- Info: Blue

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### CORS errors
- Ensure backend `CORS_ORIGINS` includes `http://localhost:3000`
- Check browser console for specific CORS error messages

### Session not persisting
- Verify `credentials: 'include'` in API client (already configured)
- Check cookies in browser DevTools
- Ensure backend and frontend are on compatible domains

### Hydration errors
- Already handled with `suppressHydrationWarning` on `<html>`
- If persists, check for client-only code in server components

## License

Proprietary - GAZE Limited