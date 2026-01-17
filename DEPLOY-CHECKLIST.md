# ✅ Deployment Checklist

## Current Status

- ✅ Backend working on Digital Ocean: `https://whale-app-8rs89.ondigitalocean.app/api/`
- ⚠️ Frontend showing 404 on Vercel
- ✅ Code converted from SSR to static build

---

## Option 1: Deploy to Vercel (Frontend Only)

### Prerequisites
- [ ] Backend is running on Digital Ocean
- [ ] API URL is: `https://whale-app-8rs89.ondigitalocean.app/api`
- [ ] CORS is enabled on backend

### Steps

1. **Test build locally:**
   ```bash
   npm install
   npm run build
   ```
   
   ✅ If successful, you'll see a `dist/` folder with:
   - `index.html`
   - `assets/` folder
   
   ❌ If it fails, check the error messages

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Convert to static build for Vercel"
   git push origin main
   ```

3. **Deploy on Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Import your GitHub repo
   - Vercel will auto-detect settings from `vercel.json`
   - Click **Deploy**
   - Wait for build to complete

4. **Check deployment:**
   - If successful: Visit your Vercel URL
   - If failed: Click on deployment → View Build Logs

5. **Test the app:**
   - [ ] Dashboard loads
   - [ ] Applications show up
   - [ ] Can click on applicants
   - [ ] API calls work (check Network tab)

---

## Option 2: Deploy Everything on Digital Ocean (Recommended)

### Why This is Better
- ✅ No CORS issues
- ✅ No separate deployments
- ✅ Simpler configuration
- ✅ Backend already working

### Steps

1. **Update App Platform HTTP Port:**
   - Go to [Digital Ocean Dashboard](https://cloud.digitalocean.com/apps)
   - Click your app: **whale-app-8rs89**
   - Go to **Settings** → **App Spec** → **Edit**
   - Find: `http_port: 3001`
   - Change to: `http_port: 3000`
   - Click **Save**

2. **Add Environment Variables:**
   - Still in **Settings** → **App-Level Environment Variables**
   - Add:
     ```
     MONGODB_URI = mongodb+srv://abhikaboy_db_user:YOUR_PASSWORD@delib.yggavqz.mongodb.net/spring2026?retryWrites=true&w=majority
     DATABASE_NAME = spring2026
     COLLECTION_NAME = applications
     NODE_ENV = production
     ```

3. **Force Rebuild:**
   - Go to **Deployments** tab
   - Click **Deploy** → **Force Rebuild**
   - Wait 2-5 minutes

4. **Test:**
   - Visit: https://whale-app-8rs89.ondigitalocean.app
   - Should see **Dashboard UI**, not JSON

---

## Troubleshooting

### Vercel: Build Fails

**Check build logs for:**
- `Cannot find module` - Missing dependency
- `TypeScript error` - Type errors in code
- `Build command failed` - Check `package.json` scripts

**Fix:**
```bash
# Clean install
rm -rf node_modules dist
npm install
npm run build
```

### Vercel: 404 Error

**Possible causes:**
1. Build succeeded but wrong output directory
2. Routing not configured correctly
3. `index.html` not found

**Fix:**
- Check `vercel.json` has correct `outputDirectory: "dist"`
- Check `dist/index.html` exists after build
- Check rewrites are configured

### Digital Ocean: Shows Backend JSON

**Cause:** HTTP port is set to 3001 (backend) instead of 3000 (frontend)

**Fix:** Change HTTP port to 3000 in App Platform settings

### API Calls Fail

**Cause:** CORS not enabled or wrong API URL

**Fix:**
1. Check `src/config/api.ts` has correct URL
2. Check backend CORS is enabled
3. Check backend is running

---

## My Recommendation

**Use Digital Ocean for everything:**

1. Change HTTP port to 3000
2. Force rebuild
3. Done! ✅

**Why?**
- Your backend is already there
- No CORS configuration needed
- No managing two deployments
- Simpler and faster

**Vercel is only worth it if:**
- You want frontend on a CDN
- You're okay with CORS setup
- You want to manage deployments separately

---

## Quick Commands

```bash
# Test build locally
npm run build

# Test preview locally
npm run serve

# Deploy to Vercel
vercel --prod

# Check what's in dist/
ls -la dist/

# Clean everything
rm -rf node_modules dist .vercel
npm install
```

---

## Final Decision

Choose one:

- [ ] **Vercel** - Frontend separate, need to fix build errors
- [ ] **Digital Ocean** - Everything together, just change port to 3000

**I recommend Digital Ocean!** It's simpler and already mostly working. 🚀
