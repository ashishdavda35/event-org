#!/bin/bash

echo "🔧 Setting up GitHub repository for deployment..."

# Check if we have a remote
if git remote -v | grep -q "origin"; then
    echo "📝 Current remote:"
    git remote -v
    echo ""
    echo "❌ You have a remote that's causing permission issues."
    echo "Let's remove it and set up a new one."
    echo ""
    read -p "Press Enter to continue..."
    git remote remove origin
fi

echo ""
echo "✅ Ready to connect to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://github.com/new"
echo "2. Repository name: event-org-live-polling"
echo "3. Make it PUBLIC (required for free Vercel)"
echo "4. Don't initialize with README"
echo "5. Click 'Create repository'"
echo ""
echo "6. Then run these commands:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/event-org-live-polling.git"
echo "   git push -u origin main"
echo ""
echo "🎯 Your repository will be ready for Vercel deployment!"
echo ""
echo "📖 See FIXED_DEPLOYMENT.md for complete instructions"
