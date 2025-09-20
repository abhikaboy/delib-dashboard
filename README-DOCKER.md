# 🐳 Docker Deployment for Delibs

## Quick Start

### 1. Setup Environment Variables
```bash
# Copy the example environment file
cp env.example backend/.env

# Edit the .env file with your MongoDB credentials
nano backend/.env
```

### 2. Build and Run with Docker Compose
```bash
# Build and start the application
docker compose up --build

# Or run in detached mode (background)
docker compose up --build -d
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Alternative: Docker without Compose

### Build the image
```bash
docker build -t delibs-app .
```

### Run the container
```bash
docker run -p 3000:3000 -p 3001:3001 \
  --env-file backend/.env \
  delibs-app
```

## Environment Variables

Make sure your `backend/.env` file contains:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/delibs
DATABASE_NAME=delibs
COLLECTION_NAME=applications
PORT=3001
NODE_ENV=production
```

## Docker Commands

```bash
# Build and start
docker compose up --build

# Start in background
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild after changes
docker compose up --build --force-recreate
```

## Production Deployment

### Deploy to any Docker-compatible platform:

- **Railway**: Connect GitHub repo, Railway auto-detects Dockerfile
- **Render**: Docker deployment with automatic builds
- **DigitalOcean App Platform**: Docker support with scaling
- **AWS ECS/Fargate**: Enterprise-grade container orchestration
- **Google Cloud Run**: Serverless container deployment

### Example Railway deployment:
1. Push code to GitHub
2. Connect Railway to your repo
3. Add environment variables in Railway dashboard
4. Railway automatically builds and deploys your Docker container

## Troubleshooting

### Container won't start:
```bash
# Check logs
docker compose logs

# Check if ports are available
lsof -i :3000
lsof -i :3001
```

### Database connection issues:
- Verify MongoDB URI in `.env`
- Ensure MongoDB Atlas allows connections from 0.0.0.0/0
- Check database name and collection name

### Frontend/Backend communication:
- Both services run in the same container
- Frontend connects to backend via localhost:3001
- No CORS issues since they're on the same host

## Development vs Production

This Docker setup is configured for **production**. For development, you might prefer:

```bash
# Development with hot reload
npm run dev
```

The Docker container serves the built frontend and runs the backend in production mode for optimal performance.
