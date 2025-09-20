# Delibs Application Deployment Guide

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new cluster (M0 Sandbox is free)
4. Choose your preferred cloud provider and region
5. Wait for cluster creation (2-3 minutes)

### Step 2: Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set user privileges to "Read and write to any database"

### Step 3: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (0.0.0.0/0) for deployment
4. Confirm the change

### Step 4: Get Connection String
1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Replace `<password>` with your actual password
5. Add your database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/delibs`

---

## 🖥️ Backend Deployment (Railway)

### Step 1: Prepare Backend for Deployment
Create a `.env` file in your `backend/` directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/delibs
DATABASE_NAME=delibs
COLLECTION_NAME=applications
PORT=3001
NODE_ENV=production
```

### Step 2: Update Backend Package.json
Add production start script to `backend/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "bun --watch server.js",
    "build": "echo 'No build step required'"
  }
}
```

### Step 3: Deploy to Railway
1. Go to [Railway](https://railway.app)
2. Sign up/in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your GitHub account and select your repository
5. Choose "Deploy from a folder" and select `backend/`
6. Railway will auto-detect it's a Node.js app

### Step 4: Configure Environment Variables
1. In Railway dashboard, go to your project
2. Click "Variables" tab
3. Add all environment variables from your `.env` file:
   - `MONGODB_URI`: Your MongoDB connection string
   - `DATABASE_NAME`: delibs
   - `COLLECTION_NAME`: applications
   - `PORT`: 3001
   - `NODE_ENV`: production

### Step 5: Get Backend URL
1. After deployment, Railway will provide a public URL
2. Copy this URL (e.g., `https://your-app.railway.app`)
3. You'll need this for frontend configuration

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Update API Configuration
Update the API base URL in your frontend code:

In `src/components/DashboardPage.tsx` and `src/components/ApplicantDetailPage.tsx`:

```typescript
// Replace this line:
const API_BASE_URL = 'http://localhost:3001/api'

// With your Railway backend URL:
const API_BASE_URL = 'https://your-backend-url.railway.app/api'
```

### Step 2: Create Production Build Configuration
Create `vercel.json` in your project root:

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

### Step 3: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up/in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - Framework Preset: "Vite"
   - Build Command: `npm run build`
   - Output Directory: `.output/public`
6. Click "Deploy"

### Step 4: Configure Environment Variables (if needed)
1. In Vercel dashboard, go to your project
2. Go to "Settings" → "Environment Variables"
3. Add any frontend environment variables if you have them

---

## 🔧 Alternative Deployment Options

### Backend Alternatives:
- **Render**: Similar to Railway, free tier available
- **Heroku**: Popular but no longer has free tier
- **DigitalOcean App Platform**: Good performance, paid
- **AWS/GCP/Azure**: More complex but scalable

### Frontend Alternatives:
- **Netlify**: Similar to Vercel, great for static sites
- **GitHub Pages**: Free but limited features
- **AWS S3 + CloudFront**: More complex setup
- **Firebase Hosting**: Good integration with Google services

---

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend CORS is configured to allow your frontend domain
2. **MongoDB Connection**: Verify connection string and IP whitelist
3. **Build Failures**: Check Node.js version compatibility
4. **Environment Variables**: Ensure all required variables are set

### Backend CORS Configuration:
Update your `backend/server.js` CORS configuration:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
}));
```

---

## 📝 Post-Deployment Checklist

- [ ] Backend is accessible at Railway URL
- [ ] Frontend is accessible at Vercel URL
- [ ] Database connection is working
- [ ] Login functionality works
- [ ] All API endpoints respond correctly
- [ ] Images and assets load properly
- [ ] Authentication persists across sessions

---

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:
- **Railway**: Auto-deploys when you push to your main branch
- **Vercel**: Auto-deploys when you push to your main branch
- Configure branch protection and staging environments as needed

---

## 💡 Production Optimizations

### Backend:
- Enable MongoDB connection pooling
- Add request rate limiting
- Implement proper error logging
- Set up health check endpoints

### Frontend:
- Enable Vercel Analytics
- Configure caching headers
- Optimize images and assets
- Set up error monitoring (Sentry)

---

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Access**: Use specific database users, not admin
3. **CORS**: Configure specific origins, not wildcards in production
4. **HTTPS**: Both platforms provide HTTPS by default
5. **Authentication**: Consider adding JWT tokens for production

---

Your application should now be fully deployed and accessible to users!
