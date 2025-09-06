#!/bin/bash

echo "🔄 Restarting Event Org Services..."

# Kill existing processes
echo "Stopping existing processes..."
pkill -f "node.*backend" 2>/dev/null || true
pkill -f "next.*frontend" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true

# Wait a moment
sleep 2

# Start backend
echo "Starting backend..."
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Services restarted!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "🌐 Access your app:"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""
echo "📊 Poll Results Pages:"
echo "Static (no API): http://localhost:3000/poll/U706KM/results-static"
echo "Simple (minimal API): http://localhost:3000/poll/U706KM/results-simple"
echo ""
echo "Press Ctrl+C to stop all services"
