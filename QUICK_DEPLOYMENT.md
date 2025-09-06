# 🚀 QUICK DEPLOYMENT GUIDE

## Option 1: Vercel (Easiest - 5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit for deployment"
git remote add origin https://github.com/YOUR_USERNAME/event-org.git
git push -u origin main
```

### Step 2: Deploy Frontend
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Set **Root Directory** to `frontend`
6. Click "Deploy"

### Step 3: Deploy Backend
1. Create new Vercel project
2. Import same repository
3. Set **Root Directory** to `backend`
4. Click "Deploy"

### Step 4: Set Environment Variables
In Vercel dashboard for backend:
- `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/eventorg`
- `JWT_SECRET` = `your-secret-key-here`

In Vercel dashboard for frontend:
- `NEXT_PUBLIC_API_URL` = `https://your-backend-url.vercel.app`

## Option 2: Netlify + Railway (Alternative)

### Frontend (Netlify)
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Set build command: `cd frontend && npm run build`
4. Set publish directory: `frontend/.next`

### Backend (Railway)
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Set root directory to `backend`
4. Add environment variables

## Database Setup (MongoDB Atlas)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create cluster
4. Get connection string
5. Add to environment variables

## Expected URLs After Deployment

- **Frontend**: `https://event-org-app.vercel.app`
- **Backend**: `https://event-org-backend.vercel.app`
- **Live Demo**: `https://event-org-app.vercel.app/poll/U706KM/results-fixed`

## Features Available in Production

✅ **Live Polling Dashboard** - Hide/show results for audience
✅ **Poll Creation** - Create interactive polls
✅ **Real-time Updates** - Live audience participation
✅ **Issues Management** - Track and manage issues
✅ **User Authentication** - Secure login/register
✅ **Responsive Design** - Works on all devices

## Testing the Live Application

1. **Create Poll**: Go to `/create-poll`
2. **Share Poll**: Copy poll link and share
3. **Live Control**: Use `/poll/[code]/results-fixed` to control visibility
4. **Audience View**: Use `/poll/[code]` to participate

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints
4. Check MongoDB connection

---

**🎉 Your live polling application will be ready in minutes!**
