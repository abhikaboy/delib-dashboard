#!/bin/bash

echo "🧪 Testing Docker Database Connection"
echo "===================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start the container
echo "🔨 Building Docker container..."
docker-compose build

echo "🚀 Starting container..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check backend health
echo "🏥 Checking backend health..."
curl -f http://localhost:3001/health || echo "❌ Backend health check failed"

# Check if we can fetch applications
echo "📋 Testing applications API..."
curl -f http://localhost:3001/api/applications || echo "❌ Applications API failed"

# Show logs
echo "📝 Recent backend logs:"
docker-compose logs --tail=20 delibs-app

echo "✅ Test complete. Check the logs above for any issues."
echo "To stop the container: docker-compose down"
