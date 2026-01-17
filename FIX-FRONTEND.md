# 🎯 Quick Fix: Get Frontend Working

## Current Status

✅ **Backend working:** https://whale-app-8rs89.ondigitalocean.app/api/applications  
❌ **Frontend not showing:** https://whale-app-8rs89.ondigitalocean.app

## The Problem

App Platform is routing to port **3001** (backend API only) instead of port **3000** (frontend).

## ✅ The Fix (2 Steps)

### Step 1: Change HTTP Port in App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Click your app: **whale-app-8rs89**
3. Click **Settings** tab
4. Look for one of these sections:
   - **"Components"** → Click your component → **"HTTP Port"**
   - **"Resources"** → **"HTTP Port"**
   - **"Service"** → **"HTTP Port"**
5. Change the port from **3001** to **3000**
6. Click **"Save"**

### Step 2: Add Environment Variables (IMPORTANT!)

While you're in Settings:

1. Scroll to **"App-Level Environment Variables"**
2. Click **"Edit"**
3. Add these variables:

```
MONGODB_URI = mongodb+srv://abhikaboy_db_user:YOUR_PASSWORD@delib.yggavqz.mongodb.net/spring2026?retryWrites=true&w=majority
DATABASE_NAME = spring2026
COLLECTION_NAME = applications
NODE_ENV = production
```

**⚠️ Replace `YOUR_PASSWORD` with your actual MongoDB password!**

4. Click **"Save"**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"Deploy"** → **"Force Rebuild"**
3. Wait 2-5 minutes

### Step 4: Test

Visit: https://whale-app-8rs89.ondigitalocean.app

You should see the **dashboard UI**, not JSON!

---

## 🔍 How to Find HTTP Port Setting

The setting location varies by App Platform version:

### Option A: In Component Settings
```
Apps → Your App → Settings → Components → [Your Component] → HTTP Port
```

### Option B: In App Spec Editor
```
Apps → Your App → Settings → App Spec → Edit
```

Look for:
```yaml
http_port: 3001  # Change this to 3000
```

### Option C: Via doctl CLI
```bash
doctl apps spec get YOUR_APP_ID > app.yaml
# Edit app.yaml: change http_port to 3000
doctl apps update YOUR_APP_ID --spec app.yaml
```

---

## 📋 What Should Happen

### Before Fix
- Main URL → Shows JSON (backend API)
- `/api/applications` → Shows JSON (backend API)
- Dashboard UI → Not accessible

### After Fix
- Main URL → Shows Dashboard UI (frontend)
- `/api/applications` → Shows JSON (backend API)
- All pages work correctly

---

## 🎯 Architecture

Your app has TWO services in ONE container:

```
Port 3000 (Frontend)          Port 3001 (Backend)
     ↓                              ↓
TanStack Start UI    →    Express.js API → MongoDB
     ↓
  User sees
  Dashboard
```

**App Platform should route to port 3000 (frontend), which then talks to port 3001 (backend) internally.**

---

## 🆘 If It Still Doesn't Work

### Check Runtime Logs

Go to **Runtime Logs** and look for:

```
✅ Both services started!
Frontend: http://localhost:3000
Backend:  http://localhost:3001
```

If you don't see this, check for errors.

### Common Issues

| Error | Fix |
|-------|-----|
| Only backend starts | Frontend build failed - check Dockerfile |
| "MONGODB_URI not set" | Add env vars in App Platform Settings |
| Port 3000 not accessible | Change HTTP Port to 3000 in Settings |
| Shows JSON instead of UI | HTTP Port is still set to 3001 |

---

## 📝 Files I Updated

1. ✅ `docker-start.sh` - Removed hardcoded credentials, added `HOST=0.0.0.0`
2. ✅ `.do/app.yaml` - Created App Platform spec with correct port config
3. ✅ `APP-PLATFORM-PORT-CONFIG.md` - Detailed port configuration guide

---

## 🚀 Next Steps

1. **Change HTTP Port to 3000** in App Platform Settings
2. **Add environment variables** (especially `MONGODB_URI`)
3. **Force rebuild**
4. **Check Runtime Logs** to verify both services start
5. **Visit main URL** - should see dashboard!

---

**TL;DR:** In App Platform Settings, change HTTP Port from **3001** to **3000**, add environment variables, then force rebuild!
