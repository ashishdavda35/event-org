# ⚡ Quick Railway Deployment

## 🚀 Deploy in 5 Minutes

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. **Go to Railway**
- Visit [railway.app](https://railway.app)
- Sign up with GitHub
- Click "New Project" → "Deploy from GitHub"

### 3. **Deploy Database**
- Select your repository
- Click "Add Database" → "MongoDB"
- Wait for deployment ✅

### 4. **Deploy Backend**
- Click "New Service" → "Deploy from GitHub"
- Select your repository
- Set **Root Directory**: `backend`
- Add environment variables (see `railway-env-vars.md`)
- Deploy ✅

### 5. **Deploy Frontend**
- Click "New Service" → "Deploy from GitHub"
- Select your repository
- Set **Root Directory**: `frontend`
- Add environment variables (see `railway-env-vars.md`)
- Deploy ✅

### 6. **Update URLs**
- Copy backend URL from Railway dashboard
- Update frontend environment variable:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
  ```
- Redeploy frontend

## 🎉 Done!

Your app is now live at:
- **Frontend**: `https://your-frontend-url.railway.app`
- **Backend**: `https://your-backend-url.railway.app/api`

## 📚 Detailed Guide

For complete instructions, see: `RAILWAY_DEPLOYMENT.md`

## 🆘 Need Help?

- Check logs in Railway dashboard
- Verify environment variables
- Ensure all services are running
- Test health endpoint: `/api/health`
