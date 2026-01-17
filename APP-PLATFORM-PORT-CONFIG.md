# 🌐 App Platform Port Configuration

## Current Issue

Your backend API is accessible at:
- https://whale-app-8rs89.ondigitalocean.app/api/applications ✅

But the frontend (main dashboard) is not showing at:
- https://whale-app-8rs89.ondigitalocean.app ❌

## Why This Happens

Your Docker container runs TWO services:
- **Frontend** (TanStack Start) on port **3000** 
- **Backend** (Express API) on port **3001**

App Platform is currently routing to port **3001** (backend only), but it should route to port **3000** (frontend), which then proxies API requests to the backend.

## ✅ Solution: Configure HTTP Port in App Platform

### Step 1: Go to App Platform Settings

1. Go to [Digital Ocean Dashboard](https://cloud.digitalocean.com/)
2. Click **Apps** → Your app (whale-app-8rs89)
3. Click **Settings** tab

### Step 2: Configure HTTP Port

Look for **"HTTP Port"** or **"Port"** setting:

1. Find the **"Components"** or **"Resources"** section
2. Click your app component
3. Look for **"HTTP Port"** or **"Port"** field
4. Set it to: **3000**
5. Click **"Save"**

### Step 3: Check Dockerfile Port Exposure

Your Dockerfile should expose port 3000 as the main port:

```dockerfile
EXPOSE 3000 3001
```

This is already correct in your Dockerfile!

### Step 4: Verify docker-compose.prod.yml

Make sure port 3000 is mapped first:

```yaml
ports:
  - "3000:3000"  # Frontend (main)
  - "3001:3001"  # Backend API
```

This is already correct!

### Step 5: Redeploy

After changing the HTTP port:

1. Go to **Deployments** tab
2. Click **"Deploy"** → **"Force Rebuild"**
3. Wait for deployment to complete (2-5 minutes)

### Step 6: Test

Visit your app URL:
- https://whale-app-8rs89.ondigitalocean.app → Should show the dashboard ✅
- https://whale-app-8rs89.ondigitalocean.app/api/applications → Should still work ✅

---

## 🔍 How to Check Current Port Configuration

### Option A: Check App Platform UI

1. Go to your app → **Settings**
2. Look for **"HTTP Port"** or **"Port"** setting
3. It should be **3000**, not 3001

### Option B: Check Runtime Logs

1. Go to **Runtime Logs**
2. Look for these messages:

```
✅ Both services started!
Frontend: http://localhost:3000
Backend:  http://localhost:3001
```

Both should be running!

---

## 🎯 Expected Behavior

### Frontend (Port 3000)
- Main dashboard UI
- Routes: `/`, `/applicant/:id`, etc.
- Proxies API requests to backend on port 3001

### Backend (Port 3001)
- API endpoints only
- Routes: `/api/applications`, `/api/evals`, etc.
- Direct database access

### How They Work Together

```
User Browser
    ↓
App Platform (Port 3000)
    ↓
Frontend (TanStack Start)
    ↓ (API requests)
Backend (Express) → MongoDB Atlas
```

---

## 🆘 If Frontend Still Doesn't Work

### Check 1: Runtime Logs

Look for errors in the frontend startup:

```
🌐 Starting frontend server...
```

If you see errors after this, the frontend failed to start.

### Check 2: Test Locally

```bash
# Build and run locally
docker build -t test-app .
docker run -p 3000:3000 -p 3001:3001 \
  -e MONGODB_URI="your_uri" \
  -e DATABASE_NAME="spring2026" \
  -e COLLECTION_NAME="applications" \
  test-app
```

Then visit:
- http://localhost:3000 → Should show dashboard
- http://localhost:3001/api/applications → Should show API data

### Check 3: Verify Frontend Build

Make sure the frontend was built correctly in the Docker image:

```bash
# Check if frontend files exist
docker run --rm test-app ls -la /app/frontend
```

You should see:
- `server/` directory
- `index.mjs` file

---

## 📝 Quick Fix Checklist

- [ ] Set HTTP Port to **3000** in App Platform Settings
- [ ] Remove hardcoded credentials from `docker-start.sh`
- [ ] Add `MONGODB_URI` to App Platform Environment Variables
- [ ] Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- [ ] Force rebuild in App Platform
- [ ] Check Runtime Logs for both services starting
- [ ] Visit main URL (should show dashboard, not API JSON)

---

## 🚀 After Fixing

Your app should work like this:

| URL | What You See |
|-----|--------------|
| `https://whale-app-8rs89.ondigitalocean.app` | Dashboard UI (Frontend) |
| `https://whale-app-8rs89.ondigitalocean.app/applicant/123` | Applicant detail page |
| `https://whale-app-8rs89.ondigitalocean.app/api/applications` | JSON API response |

---

**TL;DR:** Change the HTTP Port in App Platform Settings from **3001** to **3000**, then force rebuild!
