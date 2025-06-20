#!/bin/bash

echo "🛑 Stopping local development server..."

# Find and kill processes on port 3002
if lsof -ti:3002 > /dev/null 2>&1; then
    echo "🔍 Found process on port 3002, killing it..."
    lsof -ti:3002 | xargs kill -9
    echo "✅ Server stopped"
else
    echo "ℹ️  No server running on port 3002"
fi 