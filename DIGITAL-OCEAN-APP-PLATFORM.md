# Digital Ocean App Platform Deployment Guide

## 🚀 Quick Setup for App Platform

### Step 1: Configure Environment Variables

In your Digital Ocean App Platform dashboard:

1. Go to **Apps** → Select your app
2. Click **Settings** tab
3. Scroll to **App-Level Environment Variables**
4. Click **Edit** or **Add Variable**

Add these variables:

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/spring2026?retryWrites=true&w=majority
DATABASE_NAME=spring2026
COLLECTION_NAME=applications
PORT=3001
NODE_ENV=production
```

**Replace:**
- `YOUR_USERNAME` - Your MongoDB Atlas username
- `YOUR_PASSWORD` - Your MongoDB Atlas password  
- `YOUR_CLUSTER` - Your cluster URL (e.g., `cluster0.xxxxx.mongodb.net`)

### Step 2: Whitelist App Platform IPs in MongoDB Atlas

**Critical:** MongoDB Atlas blocks connections by default!

#### Option A: Allow All IPs (Recommended for App Platform)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your project/cluster
3. Click **Network Access** (left sidebar)
4. Click **+ ADD IP ADDRESS**
5. Click **ALLOW ACCESS FROM ANYWHERE**
6. This adds `0.0.0.0/0` (all IPs)
7. Click **Confirm**

#### Option B: Use Trusted Sources (More Secure)

1. In App Platform, go to **Settings** → **Trusted Sources**
2. Copy the IP addresses/ranges shown
3. Add each IP to MongoDB Atlas **Network Access**

### Step 3: Deploy

After adding environment variables:

1. Click **Save** in App Platform
2. App Platform will automatically redeploy
3. Wait for deployment to complete (usually 2-5 minutes)
4. Check the **Runtime Logs** for any errors

### Step 4: Verify Deployment

Visit your app URL. You should see the dashboard!

If you see errors, check the **Runtime Logs** in App Platform.

## 🔍 Troubleshooting

### Error: "bad auth: authentication failed"

**Cause:** MongoDB credentials are incorrect or not set

**Fix:**
1. Verify `MONGODB_URI` in App Platform environment variables
2. Check username/password are correct
3. Make sure the URI includes the database name: `/spring2026`
4. Ensure no special characters in password (or URL-encode them)

### Error: "IP not whitelisted"

**Cause:** App Platform IP not allowed in MongoDB Atlas

**Fix:**
1. Add `0.0.0.0/0` to MongoDB Atlas Network Access
2. Or add specific IPs from App Platform Trusted Sources

### Error: "ENOTFOUND" or "connection timeout"

**Cause:** Wrong cluster URL or network issue

**Fix:**
1. Verify cluster URL in MongoDB Atlas
2. Check MongoDB Atlas cluster is running
3. Ensure cluster is in the same region (for better performance)

### App Platform Specific Issues

#### Environment Variables Not Loading

- Make sure variables are set at **App-Level** (not component-level)
- After adding variables, click **Save** and wait for auto-redeploy
- Check Runtime Logs to verify variables are loaded

#### Docker Image Not Updating

- Make sure you pushed the latest image to GHCR:
  ```bash
  ./push-to-ghcr.sh
  ```
- In App Platform, manually trigger a deploy:
  - Go to **Deployments** tab
  - Click **Deploy** → **Force Rebuild**

#### Port Issues

- App Platform automatically handles port mapping
- Make sure your app listens on the port specified by `PORT` env var
- Frontend should be on port 3000, backend on port 3001

## 📝 Checking Runtime Logs

To see what's happening:

1. Go to your app in App Platform
2. Click **Runtime Logs** tab
3. Look for errors related to:
   - MongoDB connection
   - Environment variables
   - Port binding

Common log messages:

```
✅ Good: "Connected to MongoDB successfully"
✅ Good: "Backend server running on port 3001"
❌ Bad: "MongoServerError: bad auth"
❌ Bad: "Error connecting to MongoDB"
```

## 🔄 Redeploying

### Automatic Redeploy (Recommended)

Push to your GitHub repo:
```bash
git add .
git commit -m "Update configuration"
git push origin main
```

App Platform will auto-deploy if connected to GitHub.

### Manual Redeploy

1. Push new Docker image:
   ```bash
   ./push-to-ghcr.sh
   ```

2. In App Platform:
   - Go to **Deployments** tab
   - Click **Deploy** → **Force Rebuild**

## 🎯 Best Practices

1. **Use App-Level Environment Variables** - Not component-level
2. **Allow MongoDB Atlas IPs** - Use `0.0.0.0/0` for App Platform
3. **Check Runtime Logs** - Always check logs after deployment
4. **Use Health Checks** - App Platform will restart if unhealthy
5. **Monitor Resources** - Check CPU/Memory usage in dashboard

## 📚 Additional Resources

- [App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [MongoDB Atlas Network Access](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
- [Environment Variables in App Platform](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
