# 🚀 Digital Ocean App Platform Setup Guide

## Understanding Your App Structure

Your app runs in **ONE Docker container** with **TWO services**:

```
┌─────────────────────────────────────┐
│     Docker Container (Port 3000)    │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Frontend (TanStack Start)   │  │
│  │  Port: 3000                  │  │
│  │  No env vars needed          │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Backend (Express.js)        │  │
│  │  Port: 3001                  │  │
│  │  ⚠️  NEEDS ENV VARS!          │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**The backend needs these environment variables to connect to MongoDB!**

---

## 📋 Step-by-Step Setup

### Step 1: Set Environment Variables in App Platform

1. Go to [Digital Ocean Dashboard](https://cloud.digitalocean.com/)
2. Click **Apps** in the left sidebar
3. Select your app (delib-dashboard)
4. Click the **Settings** tab
5. Scroll down to **"App-Level Environment Variables"**
6. Click **"Edit"** button

### Step 2: Add These Variables

Click **"Add Variable"** for each of these:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/spring2026?retryWrites=true&w=majority` |
| `DATABASE_NAME` | `spring2026` | `spring2026` |
| `COLLECTION_NAME` | `applications` | `applications` |
| `PORT` | `3001` | `3001` |
| `NODE_ENV` | `production` | `production` |

**⚠️ CRITICAL: Get your MONGODB_URI from MongoDB Atlas:**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click your cluster
3. Click **"Connect"**
4. Click **"Connect your application"**
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Replace `<dbname>` with `spring2026`

**Example MONGODB_URI:**
```
mongodb+srv://myuser:MyP@ssw0rd@cluster0.abc123.mongodb.net/spring2026?retryWrites=true&w=majority
```

### Step 3: Whitelist App Platform IPs in MongoDB Atlas

**This is THE MOST COMMON cause of "bad auth" errors!**

#### Option A: Allow All IPs (Recommended for App Platform)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster
3. Click **"Network Access"** (left sidebar)
4. Click **"+ ADD IP ADDRESS"**
5. Click **"ALLOW ACCESS FROM ANYWHERE"**
6. This adds `0.0.0.0/0` to the whitelist
7. Click **"Confirm"**

#### Option B: Whitelist Specific IPs (More Secure)

1. In App Platform, go to **Settings** → **"Trusted Sources"**
2. Copy all IP addresses shown
3. Add each IP to MongoDB Atlas **Network Access**

### Step 4: Save and Deploy

1. Click **"Save"** at the bottom of the Settings page
2. App Platform will automatically trigger a new deployment
3. Wait 2-5 minutes for the deployment to complete
4. Watch the progress in the **"Deployments"** tab

### Step 5: Check Runtime Logs

1. Go to the **"Runtime Logs"** tab
2. Look for these messages:

**✅ Good signs:**
```
🔍 Environment Variables:
========================
NODE_ENV: production
PORT: 3001
MONGODB_URI: [SET]
DATABASE_NAME: spring2026
COLLECTION_NAME: applications
========================
🔌 Attempting to connect to MongoDB...
✅ Connected to MongoDB database: spring2026
📁 Available collections: applications, evals, aggregate
🚀 Backend server running on port 3001
```

**❌ Bad signs:**
```
❌ ERROR: MONGODB_URI environment variable is not set!
```
→ Go back to Step 1 and add the environment variables

```
MongoServerError: bad auth : authentication failed
```
→ Check your username/password in MONGODB_URI
→ Make sure you replaced `<password>` with your actual password

```
MongoServerError: IP address X.X.X.X is not whitelisted
```
→ Go back to Step 3 and whitelist IPs

### Step 6: Test Your App

Visit your app URL (e.g., `https://your-app.ondigitalocean.app`)

You should see the dashboard with applications loading!

---

## 🔍 Troubleshooting

### Issue: "bad auth: authentication failed"

**Causes:**
1. ❌ Wrong username or password in `MONGODB_URI`
2. ❌ IP not whitelisted in MongoDB Atlas
3. ❌ Special characters in password not URL-encoded

**Fixes:**
1. Double-check your MongoDB Atlas username and password
2. Make sure `0.0.0.0/0` is in MongoDB Atlas Network Access
3. If your password has special characters like `@`, `#`, `%`, encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`

**Example with special characters:**
```
Password: MyP@ss#123
Encoded:  MyP%40ss%23123
URI:      mongodb+srv://user:MyP%40ss%23123@cluster.mongodb.net/spring2026
```

### Issue: Environment variables not loading

**Check:**
1. Are variables set at **App-Level** (not component-level)?
2. Did you click **"Save"** after adding them?
3. Did the app redeploy after saving?

**Fix:**
1. Go to Settings → App-Level Environment Variables
2. Verify all 5 variables are listed
3. If not, add them and click Save
4. Wait for automatic redeployment

### Issue: "MONGODB_URI environment variable is not set"

**This means the backend can't see the environment variables.**

**Fix:**
1. Verify variables are set in App Platform Settings
2. Make sure you're using **App-Level** variables (not component-level)
3. Try manually triggering a rebuild:
   - Go to **Deployments** tab
   - Click **"Deploy"** → **"Force Rebuild"**

### Issue: App shows old code

**Fix:**
1. Push new Docker image to GHCR:
   ```bash
   ./push-to-ghcr.sh
   ```
2. In App Platform:
   - Go to **Deployments** tab
   - Click **"Deploy"** → **"Force Rebuild"**

---

## 🧪 Testing Locally Before Deploying

To test if your MongoDB connection works:

```bash
# Create a .env file in the backend directory
cd backend
cat > .env << EOF
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/spring2026?retryWrites=true&w=majority
DATABASE_NAME=spring2026
COLLECTION_NAME=applications
PORT=3001
NODE_ENV=development
EOF

# Test the connection
node server.js
```

If you see:
```
✅ Connected to MongoDB database: spring2026
🚀 Backend server running on port 3001
```

Then your credentials are correct! Use the same `MONGODB_URI` in App Platform.

---

## 📝 Checklist

Before deploying, make sure:

- [ ] MongoDB Atlas cluster is running
- [ ] `0.0.0.0/0` is whitelisted in MongoDB Atlas Network Access
- [ ] All 5 environment variables are set in App Platform (App-Level)
- [ ] `MONGODB_URI` has the correct username, password, and cluster URL
- [ ] `MONGODB_URI` ends with `/spring2026?retryWrites=true&w=majority`
- [ ] Special characters in password are URL-encoded
- [ ] You clicked "Save" in App Platform Settings
- [ ] App has redeployed (check Deployments tab)

---

## 🎯 Quick Reference

### Required Environment Variables

```bash
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER.mongodb.net/spring2026?retryWrites=true&w=majority
DATABASE_NAME=spring2026
COLLECTION_NAME=applications
PORT=3001
NODE_ENV=production
```

### Where to Set Them

**Digital Ocean App Platform:**
- Apps → Your App → Settings → App-Level Environment Variables

**MongoDB Atlas IP Whitelist:**
- Network Access → Add IP Address → 0.0.0.0/0

### Common Errors and Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| `bad auth` | Check username/password, whitelist IPs |
| `MONGODB_URI not set` | Add env vars in App Platform Settings |
| `IP not whitelisted` | Add `0.0.0.0/0` to MongoDB Atlas |
| `ENOTFOUND` | Check cluster URL in MONGODB_URI |

---

## 🆘 Still Not Working?

1. Check **Runtime Logs** in App Platform
2. Look for the "🔍 Environment Variables" section
3. Make sure `MONGODB_URI: [SET]` appears
4. If it says `[NOT SET]`, the env vars aren't being passed correctly

**Last resort:**
- Delete the app in App Platform
- Recreate it from scratch
- Set environment variables BEFORE first deployment

---

## 📚 Additional Resources

- [App Platform Environment Variables](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
- [MongoDB Atlas IP Whitelist](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
- [MongoDB Connection Strings](https://www.mongodb.com/docs/manual/reference/connection-string/)

---

**Need help?** Check the Runtime Logs and look for the error messages. They'll tell you exactly what's wrong!
