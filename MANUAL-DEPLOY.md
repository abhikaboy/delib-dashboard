# 🚀 Manual Deployment Guide

## Problem: TLS Errors When Pushing to GHCR

You're getting `tls: bad record MAC` errors when trying to push Docker images manually. This is a known intermittent issue with Docker and GHCR.

## ✅ Solution: Use GitHub Actions (Recommended)

I've created a GitHub Actions workflow that will automatically build and push your Docker image whenever you push to GitHub.

### Step 1: Push Your Code to GitHub

```bash
git add .
git commit -m "Add GitHub Actions workflow for Docker build"
git push origin main  # or 'master' depending on your branch
```

### Step 2: GitHub Actions Will Automatically Build

1. Go to your GitHub repository
2. Click the **"Actions"** tab
3. You'll see the workflow running
4. Wait for it to complete (usually 2-5 minutes)

### Step 3: Configure App Platform Environment Variables

**This is critical!** Go to Digital Ocean App Platform:

1. **Apps** → Your app → **Settings**
2. Scroll to **"App-Level Environment Variables"**
3. Click **"Edit"**
4. Add these 5 variables:

```
MONGODB_URI = mongodb+srv://abhikaboy_db_user:YOUR_PASSWORD@delib.yggavqz.mongodb.net/spring2026?retryWrites=true&w=majority
DATABASE_NAME = spring2026
COLLECTION_NAME = applications
PORT = 3001
NODE_ENV = production
```

**⚠️ Replace `YOUR_PASSWORD` with your actual MongoDB password!**

### Step 4: Whitelist IPs in MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Network Access"** (left sidebar)
3. Click **"+ ADD IP ADDRESS"**
4. Click **"ALLOW ACCESS FROM ANYWHERE"**
5. This adds `0.0.0.0/0`
6. Click **"Confirm"**

### Step 5: Deploy in App Platform

1. Go to Digital Ocean App Platform
2. Click **"Deployments"** tab
3. Click **"Deploy"** → **"Force Rebuild"**
4. Wait for deployment (2-5 minutes)

### Step 6: Check Runtime Logs

Go to **"Runtime Logs"** and look for:

```
✅ Connected to MongoDB database: spring2026
🚀 Backend server running on port 3001
```

---

## 🔧 Alternative: Manual Push (If You Must)

If you really need to push manually, you'll need to:

### 1. Login to GHCR in Terminal

```bash
# In your regular terminal (not Cursor)
docker login ghcr.io -u abhikaboy
# Enter your GitHub Personal Access Token when prompted
```

### 2. Build for linux/amd64

```bash
docker buildx build --platform linux/amd64 -t ghcr.io/abhikaboy/delib-dashboard:latest --push .
```

If you get TLS errors, try:
- Waiting a few minutes and trying again
- Checking your internet connection
- Restarting Docker Desktop

---

## 📋 Quick Checklist

Before your app will work, you MUST:

- [ ] Push code to GitHub (triggers automatic Docker build)
- [ ] Set 5 environment variables in App Platform Settings
- [ ] Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- [ ] Force rebuild in App Platform
- [ ] Check Runtime Logs for success messages

---

## 🎯 The Key Issue

Your app has:
- **Frontend** (port 3000) - Works fine
- **Backend** (port 3001) - Needs `MONGODB_URI` environment variable

The backend can't connect to MongoDB without the environment variables set in App Platform!

---

## 🆘 Still Getting "bad auth" Error?

1. **Check Runtime Logs** - Look for the "🔍 Environment Variables" section
2. **Verify MONGODB_URI is [SET]** - If it says [NOT SET], env vars aren't configured
3. **Check MongoDB Atlas** - Make sure `0.0.0.0/0` is whitelisted
4. **Test locally** - Create `backend/.env` with your credentials and run `node backend/server.js`

---

## 📚 Files Created

- `.github/workflows/docker-build.yml` - Automatic Docker builds on push
- `APP-PLATFORM-SETUP.md` - Detailed setup guide
- `QUICK-FIX.md` - Quick reference for fixing "bad auth"

---

**Next Step:** Push your code to GitHub and let GitHub Actions handle the Docker build!
