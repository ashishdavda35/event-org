#!/bin/bash

echo "🚀 Starting Deployment Process..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔧 Deploying Backend..."
cd backend
vercel --prod --yes
BACKEND_URL=$(vercel ls | grep backend | head -1 | awk '{print $2}')
echo "✅ Backend deployed to: https://$BACKEND_URL"

echo "🔧 Deploying Frontend..."
cd ../frontend
vercel --prod --yes
FRONTEND_URL=$(vercel ls | grep frontend | head -1 | awk '{print $2}')
echo "✅ Frontend deployed to: https://$FRONTEND_URL"

echo ""
echo "🎉 Deployment Complete!"
echo "📱 Frontend URL: https://$FRONTEND_URL"
echo "🔧 Backend URL: https://$BACKEND_URL"
echo "🎯 Live Demo: https://$FRONTEND_URL/poll/U706KM/results-fixed"
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Set up MongoDB Atlas database"
echo "3. Update API URLs in frontend"
echo "4. Test the live application"
