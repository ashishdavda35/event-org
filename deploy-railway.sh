#!/bin/bash

# Railway Deployment Script for Event Org
# This script helps you deploy your application to Railway

echo "🚀 Railway Deployment Script for Event Org"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed successfully!"
else
    echo "✅ Railway CLI is already installed."
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway:"
    railway login
else
    echo "✅ Already logged in to Railway."
fi

echo ""
echo "📋 Deployment Steps:"
echo "1. 🗄️  Deploy Database (MongoDB)"
echo "2. 🔧 Deploy Backend"
echo "3. 🎨 Deploy Frontend"
echo "4. 🔗 Configure Environment Variables"
echo ""

echo "📖 For detailed instructions, see: RAILWAY_DEPLOYMENT.md"
echo ""
echo "🎯 Quick Commands:"
echo "   railway status          - Check deployment status"
echo "   railway logs            - View logs"
echo "   railway open            - Open in browser"
echo ""

echo "🚀 Ready to deploy! Follow the steps in RAILWAY_DEPLOYMENT.md"
