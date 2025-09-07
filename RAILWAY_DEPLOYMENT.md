# 🚀 Railway Deployment Guide

This guide will help you deploy your Event Org application (frontend, backend, and database) to Railway.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Node.js 22+** - Ensure your local environment matches

## 🗄️ Step 1: Deploy Database (MongoDB)

1. **Go to Railway Dashboard**
2. **Click "New Project"**
3. **Select "Deploy from GitHub"**
4. **Choose your repository**
5. **Click "Add Database"**
6. **Select "MongoDB"**
7. **Wait for deployment**
8. **Copy the MongoDB connection string** (you'll need this for the backend)

## 🔧 Step 2: Deploy Backend

1. **In the same Railway project**
2. **Click "New Service"**
3. **Select "Deploy from GitHub"**
4. **Choose your repository**
5. **Set the following:**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Environment Variables for Backend:
```
MONGODB_URI=mongodb://mongo:27017/event-org
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.railway.app
CORS_ORIGIN=https://your-frontend-url.railway.app
```

## 🎨 Step 3: Deploy Frontend

1. **In the same Railway project**
2. **Click "New Service"**
3. **Select "Deploy from GitHub"**
4. **Choose your repository**
5. **Set the following:**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Environment Variables for Frontend:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NODE_ENV=production
```

## 🔗 Step 4: Update API URLs

After deployment, you'll need to update the frontend to use the Railway backend URL:

1. **Get your backend URL** from Railway dashboard
2. **Update frontend environment variable**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
3. **Redeploy the frontend**

## 🌐 Step 5: Configure Custom Domains (Optional)

1. **Go to each service in Railway**
2. **Click "Settings"**
3. **Add custom domain** if you have one
4. **Update environment variables** with new domains

## 🔍 Step 6: Verify Deployment

### Backend Health Check:
Visit: `https://your-backend-url.railway.app/api/health`
Should return: `{"status":"OK","timestamp":"..."}`

### Frontend:
Visit: `https://your-frontend-url.railway.app`
Should show your Event Org application

### Database:
- Check Railway dashboard for MongoDB connection status
- Backend should connect automatically using the MONGODB_URI

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version (should be 22+)
   - Verify all dependencies are in package.json
   - Check build logs in Railway dashboard

2. **Database Connection Issues**:
   - Verify MONGODB_URI is correct
   - Check if MongoDB service is running
   - Ensure database name is correct

3. **CORS Issues**:
   - Update CORS_ORIGIN with your frontend URL
   - Ensure FRONTEND_URL matches your frontend domain

4. **API Connection Issues**:
   - Verify NEXT_PUBLIC_API_URL is set correctly
   - Check if backend is running and accessible
   - Ensure all environment variables are set

### Logs and Debugging:
- **Railway Dashboard** → **Service** → **Deployments** → **View Logs**
- Check both build logs and runtime logs
- Look for error messages and stack traces

## 📊 Monitoring

Railway provides:
- **Real-time logs**
- **Performance metrics**
- **Uptime monitoring**
- **Automatic restarts** on failures

## 💰 Pricing

- **Free Tier**: $5 credit monthly
- **Pro Plan**: $5/month per service
- **Database**: Included in service cost

## 🔄 Updates and Redeployment

Railway automatically redeploys when you push to your GitHub repository. To manually redeploy:

1. **Go to Railway Dashboard**
2. **Select your service**
3. **Click "Redeploy"**

## 📝 Environment Variables Reference

### Backend (.env):
```bash
MONGODB_URI=mongodb://mongo:27017/event-org
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.railway.app
CORS_ORIGIN=https://your-frontend-url.railway.app
```

### Frontend (.env.local):
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NODE_ENV=production
```

## 🎉 Success!

Once deployed, your Event Org application will be live at:
- **Frontend**: `https://your-frontend-url.railway.app`
- **Backend API**: `https://your-backend-url.railway.app/api`
- **Database**: Managed by Railway

Your application is now ready for production use! 🚀
