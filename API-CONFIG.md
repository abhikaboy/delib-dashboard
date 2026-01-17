# 🌐 API Configuration Guide

## What Changed

I've updated the frontend to use the production backend API:

**Production Backend:** `https://whale-app-8rs89.ondigitalocean.app/api`

## Files Updated

### 1. Created `src/config/api.ts`

This centralizes the API URL configuration with automatic environment detection:

```typescript
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001/api'  // Local development
    } else {
      return `${window.location.protocol}//${window.location.host}/api`  // Production
    }
  }
  
  return 'https://whale-app-8rs89.ondigitalocean.app/api'  // Default
}
```

**Benefits:**
- ✅ Automatically uses `localhost:3001` when developing locally
- ✅ Automatically uses production API when deployed
- ✅ Works with any domain (no hardcoded URLs)
- ✅ Centralized configuration (change once, applies everywhere)

### 2. Updated `src/components/DashboardPage.tsx`

Changed from:
```typescript
const API_BASE_URL = 'http://localhost:3001/api'
```

To:
```typescript
import { API_BASE_URL } from "@/config/api"
```

### 3. Updated `src/components/ApplicantDetailPage.tsx`

Changed from:
```typescript
const API_BASE_URL = 'https://whale-app-8rs89.ondigitalocean.app/api'
```

To:
```typescript
import { API_BASE_URL } from "@/config/api"
```

---

## How It Works

### Local Development

When you run `bun dev`:
- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:3001`
- Frontend automatically uses `http://localhost:3001/api`

### Production (App Platform)

When deployed to Digital Ocean:
- Both frontend and backend run in the same container
- Frontend is on port 3000, backend on port 3001
- Frontend automatically uses the production domain
- API requests go to: `https://whale-app-8rs89.ondigitalocean.app/api`

---

## Architecture

```
┌─────────────────────────────────────────────┐
│   Digital Ocean App Platform                │
│   https://whale-app-8rs89.ondigitalocean.app│
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │  Docker Container                   │  │
│   │                                     │  │
│   │  ┌──────────────────────────────┐  │  │
│   │  │  Frontend (Port 3000)        │  │  │
│   │  │  - Dashboard UI              │  │  │
│   │  │  - TanStack Start            │  │  │
│   │  └──────────────────────────────┘  │  │
│   │              ↓ API requests         │  │
│   │  ┌──────────────────────────────┐  │  │
│   │  │  Backend (Port 3001)         │  │  │
│   │  │  - Express.js                │  │  │
│   │  │  - /api/* endpoints          │  │  │
│   │  └──────────────────────────────┘  │  │
│   │              ↓                      │  │
│   └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                   ↓
         ┌──────────────────┐
         │  MongoDB Atlas   │
         │  spring2026 DB   │
         └──────────────────┘
```

---

## Testing

### Test Locally

1. Start both services:
   ```bash
   # Terminal 1: Backend
   cd backend
   bun dev
   
   # Terminal 2: Frontend
   bun dev
   ```

2. Visit `http://localhost:3000`
3. API requests should go to `http://localhost:3001/api`

### Test Production

1. Visit: https://whale-app-8rs89.ondigitalocean.app
2. Open DevTools → Network tab
3. API requests should go to: `https://whale-app-8rs89.ondigitalocean.app/api/*`

---

## Environment Variables (Optional)

You can override the API URL using environment variables:

### For Local Development

Create `.env.local`:
```bash
VITE_API_URL=http://localhost:3001/api
```

### For Production

In App Platform Settings, add:
```bash
VITE_API_URL=https://whale-app-8rs89.ondigitalocean.app/api
```

**Note:** This is optional since the auto-detection already works!

---

## Troubleshooting

### Issue: API requests fail with CORS errors

**Cause:** Backend CORS not configured for your domain

**Fix:** Check `backend/server.js` CORS configuration:
```javascript
app.use(cors({
  origin: '*',  // Allow all origins (for now)
  credentials: true
}))
```

### Issue: API requests go to wrong URL

**Cause:** Browser cache or old build

**Fix:**
1. Clear browser cache
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Rebuild: `bun run build`

### Issue: "Failed to fetch" errors

**Cause:** Backend not running or wrong URL

**Fix:**
1. Check Runtime Logs in App Platform
2. Verify backend started: Look for "Backend server running on port 3001"
3. Test API directly: `https://whale-app-8rs89.ondigitalocean.app/api/applications`

---

## Next Steps

1. ✅ API configuration is now centralized
2. ✅ Frontend uses production backend
3. 🔄 **Build and deploy:**
   ```bash
   # Commit changes
   git add .
   git commit -m "Configure frontend to use production API"
   git push
   
   # GitHub Actions will build Docker image
   # Then force rebuild in App Platform
   ```

4. 🎯 **Configure App Platform HTTP Port:**
   - Go to App Platform Settings
   - Set HTTP Port to **3000** (frontend)
   - Force rebuild

---

**Summary:** The frontend now automatically detects the environment and uses the correct API URL. No more hardcoded URLs! 🎉
