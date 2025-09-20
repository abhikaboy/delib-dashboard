#!/bin/bash

echo "🚀 Deploying Delibs to Production"
echo "================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on env.example"
    echo "   cp env.example .env"
    echo "   # Then edit .env with your actual values"
    exit 1
fi

# Check if required environment variables are set
if ! grep -q "MONGODB_URI=" .env || ! grep -q "mongodb" .env; then
    echo "❌ MONGODB_URI not found in .env file"
    echo "   Please set your MongoDB connection string in .env"
    exit 1
fi

# Pull the latest image
echo "📥 Pulling latest Docker image..."
docker pull ghcr.io/abhikaboy/delib-dashboard:latest

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start with the new image
echo "🚀 Starting production deployment..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Health check
echo "🏥 Performing health checks..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

# Show status
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📝 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=10

echo ""
echo "✅ Deployment complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "To stop:      docker-compose -f docker-compose.prod.yml down"
