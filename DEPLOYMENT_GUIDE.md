# 🚀 Deployment Guide for Event Org

## Free Hosting Options

### Option 1: Vercel (Recommended)
- **Frontend**: Next.js app on Vercel
- **Backend**: Node.js API on Vercel
- **Database**: MongoDB Atlas (free tier)

### Option 2: Netlify + Railway
- **Frontend**: Next.js on Netlify
- **Backend**: Node.js on Railway
- **Database**: MongoDB Atlas (free tier)

## Quick Deployment Steps

### 1. Deploy Backend to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --prod
```

### 2. Deploy Frontend to Vercel
```bash
# Deploy frontend
cd frontend
vercel --prod
```

### 3. Set Environment Variables
In Vercel dashboard, set:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Random secret key
- `NEXT_PUBLIC_API_URL` - Backend URL

### 4. Database Setup
- Create MongoDB Atlas account
- Create cluster
- Get connection string
- Add to environment variables

## Production URLs
- **Frontend**: https://event-org-app.vercel.app
- **Backend**: https://event-org-backend.vercel.app
- **Live Demo**: https://event-org-app.vercel.app/poll/U706KM/results-fixed

## Features Available in Production
✅ Live Polling Dashboard
✅ Hide/Show Results Control
✅ Poll Creation & Management
✅ Issues Management
✅ User Authentication
✅ Real-time Updates
