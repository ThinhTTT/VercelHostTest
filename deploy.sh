#!/bin/bash

echo "🚀 Deploying to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run 'railway login' first."
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Get the domain
echo "🌐 Getting deployment URL..."
railway domain

echo "✅ Deployment complete!"
echo "🔍 Check the logs with: railway logs"
echo "🏥 Test health endpoint: https://your-app.railway.app/health" 