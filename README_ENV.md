# Environment Configuration

This project uses environment variables to configure the backend API and WebSocket connections.

## Setup

### Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. The `.env.local` file is already configured for local development with:
   - API URL: `http://localhost:5000/api`
   - WebSocket URL: `http://localhost:5000`

### Production Deployment

For production deployment (Vercel, Netlify, etc.), set these environment variables in your deployment platform:

- `NEXT_PUBLIC_API_BASE_URL=https://ticportal-v2-backend.onrender.com/api`
- `NEXT_PUBLIC_WS_URL=https://ticportal-v2-backend.onrender.com`

**Note:** The WebSocket URL will be automatically derived from the API URL if `NEXT_PUBLIC_WS_URL` is not set (converting `http://` to `ws://` and `https://` to `wss://`).

## Environment Variables

| Variable | Description | Default (Local) | Production |
|----------|-------------|-----------------|------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` | `https://ticportal-v2-backend.onrender.com/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `http://localhost:5000` | `https://ticportal-v2-backend.onrender.com` |

## Switching Between Environments

The application automatically uses:
- **Local**: When running `npm run dev` with `.env.local` file
- **Production**: When environment variables are set in your deployment platform

No code changes are needed - just set the appropriate environment variables for your deployment target.
