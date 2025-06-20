#!/bin/bash

echo "🚀 Starting local development server..."

# Check if port 3002 is in use
if lsof -ti:3002 > /dev/null 2>&1; then
    echo "⚠️  Port 3002 is already in use. Killing existing process..."
    lsof -ti:3002 | xargs kill -9
    sleep 2
fi

# Check if dist folder exists, if not build it
if [ ! -d "dist" ]; then
    echo "📦 Building project..."
    npm run build
fi

# Start the server
echo "🌐 Starting server on http://localhost:3002"
npm run dev 