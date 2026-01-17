# 🚨 QUICK FIX: "bad auth" Error

## What's Happening

```
┌─────────────────────────────────────────────┐
│   Digital Ocean App Platform                │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │  Your Docker Container              │  │
│   │                                     │  │
│   │  Frontend (Port 3000) ✅            │  │
│   │  Backend (Port 3001)  ❌            │  │
│   │         ↓                           │  │
│   │    Needs MONGODB_URI!               │  │
│   └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
                    ↓
                    ❌ Can't connect
                    ↓
         ┌──────────────────────┐
         │   MongoDB Atlas      │
         │   (Your Database)    │
         └──────────────────────┘
```

## 🎯 The Fix (3 Steps)

### 1️⃣ Add Environment Variables in App Platform

Go to: **Apps → Your App → Settings → App-Level Environment Variables**

Click **"Edit"** and add:

```
MONGODB_URI = mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/spring2026?retryWrites=true&w=majority
DATABASE_NAME = spring2026
COLLECTION_NAME = applications
PORT = 3001
NODE_ENV = production
```

**⚠️ Replace:**
- `USERNAME` = Your MongoDB username
- `PASSWORD` = Your MongoDB password
- `CLUSTER` = Your cluster URL (e.g., `cluster0.abc123.mongodb.net`)

**Where to find these?**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click your cluster → **"Connect"**
3. Click **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your actual password

### 2️⃣ Whitelist IPs in MongoDB Atlas

Go to: **MongoDB Atlas → Network Access**

Click **"+ ADD IP ADDRESS"** → **"ALLOW ACCESS FROM ANYWHERE"**

This adds `0.0.0.0/0` to the whitelist.

**⚠️ This is THE MOST COMMON cause of "bad auth" errors!**

### 3️⃣ Save and Wait

1. Click **"Save"** in App Platform
2. Wait 2-5 minutes for automatic redeployment
3. Check **Runtime Logs** for success messages

---

## ✅ How to Verify It Worked

### Check Runtime Logs

Go to: **Apps → Your App → Runtime Logs**

**Look for:**
```
✅ Connected to MongoDB database: spring2026
🚀 Backend server running on port 3001
```

**If you see:**
```
❌ ERROR: MONGODB_URI environment variable is not set!
```
→ Go back to Step 1

```
MongoServerError: bad auth : authentication failed
```
→ Check your username/password in Step 1
→ Make sure you did Step 2 (whitelist IPs)

---

## 🆘 Still Not Working?

### Quick Checklist:

- [ ] Did you add ALL 5 environment variables?
- [ ] Did you click "Save" in App Platform?
- [ ] Did you add `0.0.0.0/0` to MongoDB Atlas Network Access?
- [ ] Is your MongoDB password correct?
- [ ] Did you replace `<password>` in the connection string?
- [ ] Did you wait for the app to redeploy (2-5 minutes)?

### Test Your Connection Locally:

```bash
cd backend
cat > .env << EOF
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/spring2026?retryWrites=true&w=majority
DATABASE_NAME=spring2026
COLLECTION_NAME=applications
PORT=3001
EOF

node server.js
```

If it works locally, use the same `MONGODB_URI` in App Platform!

---

## 📚 Full Documentation

- **Detailed guide:** `APP-PLATFORM-SETUP.md`
- **Troubleshooting:** `DIGITAL-OCEAN-APP-PLATFORM.md`

---

**TL;DR:**
1. Add `MONGODB_URI` to App Platform Settings
2. Whitelist `0.0.0.0/0` in MongoDB Atlas
3. Save and wait for redeploy
