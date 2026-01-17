# 🔧 Fixing Vercel 404 Error

## Problem

Your app has dependencies on server-side features (tRPC, API routes) that don't work with static deployment on Vercel.

## Solution Options

### **Option 1: Simplify for Static Deployment (Recommended)**

Remove tRPC and server-side dependencies to make it a pure client-side app.

#### Changes Needed:

1. **Remove tRPC from router:**

Update `src/router.tsx`:
```typescript
import { createRouter as createTanstackRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

export const createRouter = () => {
  const router = createTanstackRouter({
    routeTree,
    defaultPreload: 'intent',
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            {props.children}
          </QueryClientProvider>
        </AuthProvider>
      )
    },
  })

  return router
}
```

2. **Update main.tsx to not use tRPC context:**

Already done! ✅

3. **Remove tRPC API routes:**

Delete or ignore these files:
- `src/routes/api.trpc.$.tsx`
- `src/integrations/trpc/*` (keep for reference but don't import)

---

### **Option 2: Use Vercel Serverless Functions (More Complex)**

Keep tRPC but configure it for Vercel's serverless functions.

This requires:
- Converting API routes to Vercel serverless functions
- Configuring tRPC for serverless
- More complex setup

**Not recommended** since your backend is already on Digital Ocean.

---

### **Option 3: Keep Everything on Digital Ocean (Easiest)**

Just use the Docker deployment on App Platform with HTTP port set to 3000.

**This is actually the simplest solution!**

---

## Quick Fix for Vercel

If you want to stick with Vercel, here's the minimal change:

### Step 1: Update `src/router.tsx`

```typescript
import { createRouter as createTanstackRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export const createRouter = () => {
  const router = createTanstackRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            {props.children}
          </QueryClientProvider>
        </AuthProvider>
      )
    },
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
```

### Step 2: Check Vercel Build Logs

1. Go to your Vercel dashboard
2. Click on your project
3. Go to **Deployments**
4. Click on the failed deployment
5. Check the **Build Logs** for errors

Common errors:
- `Cannot find module '@tanstack/react-start'` - Remove from imports
- `tRPC router not found` - Remove tRPC dependencies
- `Build failed` - Check for TypeScript errors

### Step 3: Ignore Demo/API Routes

Update your route structure to only include client-side routes:
- Keep: `dashboard.tsx`, `applicant.$name.tsx`, `index.tsx`
- Remove/Ignore: `api.*.ts`, `demo.*.tsx` (if they use server features)

---

## Recommended: Stick with Digital Ocean

Given your setup, I recommend:

1. ✅ **Keep backend on Digital Ocean** (already working)
2. ✅ **Deploy frontend on Digital Ocean too** (in same container)
3. ✅ **Just change HTTP port to 3000**

This avoids:
- ❌ CORS issues
- ❌ tRPC/API route complications
- ❌ Build configuration headaches
- ❌ Managing two deployments

---

## Debug Vercel Build

To see what's failing:

1. **Check Vercel Dashboard:**
   - Go to your project
   - Click **Deployments**
   - Find the failed deployment
   - Click **View Build Logs**

2. **Look for these errors:**
   - Module not found errors
   - TypeScript errors
   - Build command failures

3. **Test build locally:**
   ```bash
   npm run build
   ```
   
   If this fails locally, it will fail on Vercel too.

---

## My Recommendation

**Use Digital Ocean App Platform** with HTTP port 3000:

✅ **Pros:**
- Everything in one place
- No CORS issues
- No tRPC complications
- Already mostly working
- Simpler to maintain

❌ **Vercel Cons:**
- Requires removing tRPC
- Requires removing server-side features
- CORS configuration needed
- More complex setup
- Two deployments to manage

**Just change the HTTP port in App Platform from 3001 to 3000 and you're done!**

---

## If You Insist on Vercel

Run this locally first:

```bash
# Clean install
rm -rf node_modules dist
npm install

# Try to build
npm run build

# If it builds successfully, check the dist/ folder
ls -la dist/

# You should see:
# - index.html
# - assets/ folder with JS/CSS files
```

If the build works locally, push to GitHub and Vercel will deploy it.

If the build fails locally, you need to fix the errors before Vercel can deploy it.
