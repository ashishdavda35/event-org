# 🚀 GitHub Actions - Deploy Everything!

## 🎯 **What GitHub Actions Can Deploy:**

- ✅ **Frontend** → GitHub Pages, Vercel, Netlify
- ✅ **Backend** → Railway, Render, Heroku, AWS, Google Cloud
- ✅ **Database** → MongoDB Atlas, PostgreSQL, MySQL

## 📋 **Deployment Options:**

### **Option 1: Free Tier (Recommended)**
- **Frontend**: GitHub Pages (FREE)
- **Backend**: Render (FREE)
- **Database**: MongoDB Atlas (FREE)

### **Option 2: Premium Tier**
- **Frontend**: Vercel (FREE tier available)
- **Backend**: Railway (FREE tier available)
- **Database**: MongoDB Atlas (FREE tier available)

## 🔧 **Setup Instructions:**

### **Step 1: Get Required API Keys**

#### **For Render (Backend):**
1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click on your backend service
3. Go to **Settings** → **API Keys**
4. Copy your **API Key**
5. Get your **Service ID** from the URL

#### **For Vercel (Frontend - Optional):**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create a new token
3. Copy the token
4. Get **Org ID** and **Project ID** from Vercel dashboard

#### **For Railway (Backend - Alternative):**
1. Go to [railway.app/account/tokens](https://railway.app/account/tokens)
2. Create a new token
3. Copy the token
4. Get your **Service ID** from Railway dashboard

### **Step 2: Add Secrets to GitHub**

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

#### **For Simple Deploy (Render + GitHub Pages):**
```
RENDER_API_KEY = your-render-api-key
RENDER_SERVICE_ID = your-render-service-id
BACKEND_URL = https://your-backend-url.onrender.com
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/event-org
```

#### **For Full Deploy (Railway + Vercel):**
```
RAILWAY_TOKEN = your-railway-token
RAILWAY_BACKEND_SERVICE = your-service-id
VERCEL_TOKEN = your-vercel-token
VERCEL_ORG_ID = your-vercel-org-id
VERCEL_PROJECT_ID = your-vercel-project-id
BACKEND_URL = https://your-backend-url.railway.app
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/event-org
```

### **Step 3: Enable GitHub Pages**

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. **Source**: GitHub Actions
4. Save

### **Step 4: Deploy**

1. **Push to main branch**:
   ```bash
   git push origin main
   ```

2. **Watch the deployment**:
   - Go to **Actions** tab in GitHub
   - See the deployment progress
   - Get your deployed URLs

## 🎯 **Deployment Workflows:**

### **`simple-deploy.yml`** (Recommended)
- **Backend**: Deploy to Render
- **Frontend**: Deploy to GitHub Pages
- **Database**: MongoDB Atlas (external)

### **`deploy-all.yml`** (Full Featured)
- **Backend**: Deploy to Railway
- **Frontend**: Deploy to GitHub Pages + Vercel
- **Database**: Setup and migrations
- **Tests**: Run frontend and backend tests

## 🧪 **Testing Deployment:**

### **Backend Health Check:**
```bash
curl https://your-backend-url.onrender.com/
curl https://your-backend-url.railway.app/
```

### **Frontend:**
- **GitHub Pages**: `https://your-username.github.io/event-org`
- **Vercel**: `https://your-project.vercel.app`

## 🔄 **Automatic Deployments:**

- **Every push to main** → Triggers deployment
- **Pull requests** → Runs tests only
- **Manual trigger** → Available in Actions tab

## 💰 **Cost:**

### **Free Tier:**
- **GitHub Actions**: FREE (2000 minutes/month)
- **GitHub Pages**: FREE
- **Render**: FREE (750 hours/month)
- **MongoDB Atlas**: FREE (512MB)

### **Premium Tier:**
- **Vercel**: FREE (100GB bandwidth/month)
- **Railway**: FREE (500 hours/month)

## 🆘 **Troubleshooting:**

1. **Check GitHub Actions logs** for deployment errors
2. **Verify secrets** are set correctly
3. **Check Render/Railway/Vercel logs** for runtime errors
4. **Test endpoints** manually

## 🚀 **Quick Start:**

1. **Choose your deployment option** (simple-deploy.yml recommended)
2. **Add the required secrets** to GitHub
3. **Enable GitHub Pages**
4. **Push to main branch**
5. **Watch your app deploy automatically!**

---

**Your full-stack app will be automatically deployed on every push to main! 🎉**
