# 🚀 Split Deployment Guide

## Architecture

```
Frontend (Vercel)          Backend (Digital Ocean)
     ↓                              ↓
React SPA (Static)    →    Express API + MongoDB
Port 80/443                Port 3001 (via App Platform)
```

---

## ✅ Changes Made

### 1. **Removed TanStack Start SSR**
- Converted from server-side rendering to static React SPA
- Removed `@tanstack/react-start` plugin from vite config
- Added standard React entry point (`src/main.tsx`)

### 2. **Updated Build Configuration**
- `vite.config.ts` - Now builds static files to `dist/`
- `vercel.json` - Configured for static site deployment
- `index.html` - Added HTML entry point

### 3. **API Configuration**
- Frontend uses: `https://whale-app-8rs89.ondigitalocean.app/api`
- Centralized in: `src/config/api.ts`

---

## 📦 Deployment Steps

### **Backend (Digital Ocean) - Already Done! ✅**

Your backend is live at:
- **API URL:** `https://whale-app-8rs89.ondigitalocean.app/api/`
- **Test:** https://whale-app-8rs89.ondigitalocean.app/api/applications

**No changes needed!** Just make sure:
- Environment variables are set (MONGODB_URI, etc.)
- MongoDB Atlas has `0.0.0.0/0` whitelisted
- Backend is running on port 3001

---

### **Frontend (Vercel)**

#### **Step 1: Test Build Locally**

```bash
# Install dependencies
npm install

# Build the frontend
npm run build

# This should create a 'dist/' folder with:
# - index.html
# - assets/ (JS, CSS files)
```

#### **Step 2: Deploy to Vercel**

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /path/to/delib-dashboard
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect the settings from `vercel.json`:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Framework:** Vite
5. Click **"Deploy"**

#### **Step 3: Configure CORS on Backend (Important!)**

Since frontend and backend are on different domains, you need to enable CORS.

In your `backend/server.js`, make sure CORS is configured:

```javascript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app',  // Your Vercel domain
    'http://localhost:3000'  // For local development
  ],
  credentials: true
}));
```

Or allow all origins (less secure but simpler):

```javascript
app.use(cors({
  origin: '*'
}));
```

#### **Step 4: Test**

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Dashboard should load
3. API requests go to: `https://whale-app-8rs89.ondigitalocean.app/api/`

---

## 🔧 Troubleshooting

### Issue: CORS Errors

**Error:** `Access to fetch at 'https://whale-app-8rs89...' from origin 'https://your-app.vercel.app' has been blocked by CORS`

**Fix:**
1. Update `backend/server.js` CORS configuration
2. Redeploy backend on Digital Ocean
3. Hard refresh frontend (Cmd+Shift+R)

### Issue: API Requests Fail

**Error:** `Failed to fetch` or `Network Error`

**Fix:**
1. Check backend is running: https://whale-app-8rs89.ondigitalocean.app/api/applications
2. Check `src/config/api.ts` has correct URL
3. Check browser console for specific errors

### Issue: Build Fails

**Error:** Build errors related to TanStack Start

**Fix:**
1. Make sure you removed `@tanstack/react-start` from `vite.config.ts`
2. Check that `src/main.tsx` exists
3. Run `npm install` to update dependencies

---

## 📊 Comparison: Before vs After

| Aspect | Before (Docker) | After (Split) |
|--------|----------------|---------------|
| **Frontend** | Port 3000 in Docker | Vercel CDN |
| **Backend** | Port 3001 in Docker | Digital Ocean |
| **Deployment** | Single container | Two separate deploys |
| **CORS** | Not needed | Must configure |
| **Performance** | Good | Excellent (CDN) |
| **Cost** | $5-10/mo | $0-5/mo |
| **Complexity** | Low | Medium |

---

## 🎯 Next Steps

1. **Test the build locally:**
   ```bash
   npm run build
   npm run serve  # Preview the build
   ```

2. **Push changes to GitHub:**
   ```bash
   git add .
   git commit -m "Convert to static build for Vercel deployment"
   git push origin main
   ```

3. **Deploy to Vercel:**
   - Connect your GitHub repo
   - Vercel will auto-deploy on every push

4. **Update CORS on backend:**
   - Add your Vercel domain to CORS whitelist
   - Redeploy backend

5. **Test everything:**
   - Visit Vercel URL
   - Check dashboard loads
   - Check API calls work

---

## 🔄 Development Workflow

### Local Development

```bash
# Terminal 1: Backend
cd backend
bun dev  # Runs on localhost:3001

# Terminal 2: Frontend
npm run dev  # Runs on localhost:3000
```

### Deployment

```bash
# Frontend: Push to GitHub
git push origin main
# Vercel auto-deploys

# Backend: Already deployed on Digital Ocean
# Only redeploy if you change backend code
```

---

## 📝 Files Changed

- ✅ `vite.config.ts` - Removed TanStack Start, configured static build
- ✅ `vercel.json` - Configured for Vercel static deployment
- ✅ `index.html` - Added HTML entry point
- ✅ `src/main.tsx` - Created React entry point
- ✅ `src/router.tsx` - Removed SSR integration
- ✅ `src/config/api.ts` - Already configured for production API

---

**Summary:** Your frontend is now a standard React SPA that can be deployed to Vercel, while your backend stays on Digital Ocean! 🎉
