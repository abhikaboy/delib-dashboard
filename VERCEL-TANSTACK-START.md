# 🚀 Deploying TanStack Start to Vercel

## The Issue

TanStack Start is a **full-stack framework** that needs a Node.js server. Vercel can run it, but it requires special configuration.

Your build output shows:
```
.output/server/index.mjs  ← Node.js server
.output/public/           ← Static assets
```

## ✅ What I Fixed

1. **Restored TanStack Start plugin** in `vite.config.ts`
2. **Restored original router** with TanStack Query integration
3. **Updated vercel.json** to use `.output/public` directory
4. **Removed unnecessary files** (main.tsx, index.html, api/index.js)

Your local dev should work now! 🎉

---

## 🎯 The Problem with Vercel + TanStack Start

Vercel's default setup expects either:
1. **Static files** (like Create React App, Vite SPA)
2. **Serverless functions** (API routes in `/api` folder)

But TanStack Start creates:
- A **persistent Node.js server** (`.output/server/index.mjs`)
- Static assets (`.output/public/`)

Vercel **can't run the Node.js server** directly. It only serves the static files from `.output/public/`, which is why you get a blank page or 404.

---

## 💡 Solution Options

### **Option 1: Use Digital Ocean (Recommended)** ✅

Deploy everything (frontend + backend) on Digital Ocean App Platform:

**Why this is best:**
- ✅ TanStack Start server works perfectly
- ✅ Backend already there
- ✅ No CORS issues
- ✅ Single deployment
- ✅ Simpler configuration

**How:**
1. Go to App Platform → Settings
2. Change HTTP Port from **3001** to **3000**
3. Force rebuild
4. Done!

---

### **Option 2: Deploy Backend on DO, Frontend on Vercel**

This is **more complex** but possible:

#### Step 1: Convert TanStack Start to Static Mode

Update `vite.config.ts`:
```typescript
tanstackStart({
  customViteReactPlugin: true,
  target: 'static', // ← Change from 'node-server' to 'static'
}),
```

This will generate static HTML files instead of a Node.js server.

**Trade-offs:**
- ❌ Loses server-side rendering (SSR)
- ❌ Loses server functions
- ❌ Loses API routes
- ✅ Works on Vercel
- ✅ Faster (served from CDN)

#### Step 2: Update vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Step 3: Remove Server-Side Features

Delete or don't use:
- API routes (`src/routes/api.*.ts`)
- Server functions
- SSR-specific code

---

### **Option 3: Use Vercel with Adapter (Advanced)**

Create a custom Vercel adapter for TanStack Start. This is **very complex** and not recommended.

---

## 🎯 My Strong Recommendation

**Just use Digital Ocean for everything!**

Here's why:

| Feature | Digital Ocean | Vercel |
|---------|--------------|--------|
| **Setup Complexity** | ⭐ Simple | ⭐⭐⭐⭐ Complex |
| **SSR Support** | ✅ Yes | ❌ No (without adapter) |
| **Backend Integration** | ✅ Same container | ⚠️ Separate, needs CORS |
| **Cost** | $5-10/mo | $0-20/mo |
| **Deployment** | One place | Two places |
| **Maintenance** | Easy | Complex |

---

## 🚀 Quick Fix for Digital Ocean

1. **Go to App Platform:**
   - https://cloud.digitalocean.com/apps
   - Click **whale-app-8rs89**

2. **Change HTTP Port:**
   - Settings → App Spec → Edit
   - Find: `http_port: 3001`
   - Change to: `http_port: 3000`
   - Save

3. **Add Environment Variables:**
   - Settings → App-Level Environment Variables
   - Add:
     ```
     MONGODB_URI = mongodb+srv://...
     DATABASE_NAME = spring2026
     COLLECTION_NAME = applications
     NODE_ENV = production
     ```

4. **Force Rebuild:**
   - Deployments → Deploy → Force Rebuild

5. **Test:**
   - Visit: https://whale-app-8rs89.ondigitalocean.app
   - Should see dashboard! ✅

---

## 🔧 If You Still Want Vercel

You'll need to:

1. **Convert to static mode** (loses SSR)
2. **Remove all API routes**
3. **Configure CORS on backend**
4. **Test thoroughly**

But honestly, **it's not worth the hassle**. Digital Ocean is simpler and already working!

---

## 📝 Current Status

- ✅ Local dev restored (should work now)
- ✅ Backend working on Digital Ocean
- ⚠️ Vercel deployment won't work properly (serves static files only)
- ✅ API configuration correct

---

## 🎯 Next Steps

**Option A: Use Digital Ocean (5 minutes)**
1. Change HTTP port to 3000
2. Force rebuild
3. Done!

**Option B: Make Vercel Work (2+ hours)**
1. Convert to static mode
2. Remove server features
3. Configure CORS
4. Test everything
5. Debug issues
6. Maintain two deployments

**I strongly recommend Option A!** 🚀

---

## 💻 Test Local Dev Now

```bash
# Start dev server
bun dev

# Or if bun doesn't work:
npm run dev
```

Visit: http://localhost:3000

Should work now! ✅
