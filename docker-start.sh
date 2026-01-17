#!/bin/sh

echo "🚀 Starting Delibs Application in Docker"
echo "========================================"

# Function to handle shutdown
shutdown() {
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait
    exit 0
}

# Trap signals
trap shutdown SIGTERM SIGINT

# Start backend in background
echo "🔧 Starting backend server..."
echo "📋 Backend Environment Check:"
echo "   MONGODB_URI: ${MONGODB_URI:+[SET]} ${MONGODB_URI:-[NOT SET]}"
echo "   DATABASE_NAME: ${DATABASE_NAME:-[NOT SET]}"
echo "   COLLECTION_NAME: ${COLLECTION_NAME:-[NOT SET]}"
echo "   BACKEND_PORT: 3001"
echo "   NODE_ENV: ${NODE_ENV:-[NOT SET]}"

# Export environment variables explicitly for backend
export MONGODB_URI="${MONGODB_URI}"
export DATABASE_NAME="${DATABASE_NAME:-spring2026}"
export COLLECTION_NAME="${COLLECTION_NAME:-applications}"
export NODE_ENV="${NODE_ENV:-production}"

cd /app/backend
PORT=3001 node server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🌐 Starting frontend server..."
cd /app/frontend
# Run the Nitro server (TanStack Start SSR)
# Frontend runs on port 3000 (the main port exposed by App Platform)
PORT=3000 HOST=0.0.0.0 node server/index.mjs &
FRONTEND_PID=$!

echo "✅ Both services started!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo "Press Ctrl+C to stop"

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID
