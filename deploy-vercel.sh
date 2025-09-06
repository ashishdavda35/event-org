#!/bin/bash

# 🚀 Vercel Deployment Script for Event Org

echo "🚀 Deploying Event Org to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd frontend

# Deploy to Vercel
echo "🌐 Deploying frontend to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at the provided URL"
