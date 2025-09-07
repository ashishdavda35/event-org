# 🚀 Event Org - GitHub Actions Deployment

## 🎯 **Automated Deployment with GitHub Actions**

This project uses GitHub Actions for automated deployment of:
- **Frontend**: Next.js application
- **Backend**: Node.js/Express API
- **Database**: MongoDB Atlas

### **✅ Benefits:**
- ✅ **Automatic deployments** on every push to main
- ✅ **More reliable** than manual deployments
- ✅ **Full control** over the deployment process
- ✅ **Free** (2000 minutes/month for private repos)
- ✅ **Integrated** with your GitHub repository
- ✅ **Better error handling** and rollback capabilities

## 📋 **Deployment Options:**

### **Option 1: GitHub Actions + Render + Vercel**
- **Backend**: Deploy to Render via Actions
- **Frontend**: Deploy to Vercel via Actions
- **Database**: MongoDB Atlas

### **Option 2: GitHub Actions + GitHub Pages**
- **Backend**: Deploy to Render via Actions
- **Frontend**: Deploy to GitHub Pages via Actions
- **Database**: MongoDB Atlas

### **Option 3: GitHub Actions + Railway**
- **Backend**: Deploy to Railway via Actions
- **Frontend**: Deploy to Vercel via Actions
- **Database**: MongoDB Atlas

## 🔧 **Setup Instructions:**

### **Step 1: Get Required Secrets**

#### **For Render (Backend):**
1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click on your backend service
3. Go to **"Settings"** → **"API Keys"**
4. Copy your **API Key**
5. Get your **Service ID** from the URL or settings

#### **For Vercel (Frontend):**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create a new token
3. Copy the token
4. Get your **Org ID** and **Project ID** from Vercel dashboard

### **Step 2: Add Secrets to GitHub**

1. Go to your GitHub repository
2. Click **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Add these secrets:

```
RENDER_API_KEY = your-render-api-key
RENDER_SERVICE_ID = your-render-service-id
VERCEL_TOKEN = your-vercel-token
VERCEL_ORG_ID = your-vercel-org-id
VERCEL_PROJECT_ID = your-vercel-project-id
```

### **Step 3: Choose Your Deployment Workflow**

#### **Option A: Simple Deploy (Recommended)**
- Uses `simple-deploy.yml`
- Deploys backend to Render, frontend to Vercel
- Easy to set up

#### **Option B: GitHub Pages**
- Uses `github-pages.yml`
- Deploys frontend to GitHub Pages
- Free hosting

#### **Option C: Full Deploy**
- Uses `deploy.yml`
- Includes testing and multiple deployment options

### **Step 4: Enable GitHub Pages (if using Option B)**

1. Go to your GitHub repository
2. Click **"Settings"** → **"Pages"**
3. **Source**: GitHub Actions
4. Save

## 🚀 **How It Works:**

### **Automatic Deployment:**
1. **Push to main branch** → Triggers GitHub Actions
2. **Backend deploys** to Render
3. **Frontend deploys** to Vercel/GitHub Pages
4. **Everything is automated!**

### **Manual Deployment:**
1. Go to **"Actions"** tab in GitHub
2. Click **"Run workflow"**
3. Select branch and run

## 🧪 **Testing:**

### **Local Testing:**
```bash
# Test backend
curl https://event-org-tk6o.onrender.com/

# Test frontend
# Visit your deployed frontend URL
```

### **GitHub Actions Testing:**
- Check **"Actions"** tab for deployment status
- View logs for any errors
- Automatic rollback on failure

## 💰 **Cost:**

- **GitHub Actions**: FREE (2000 minutes/month)
- **Render**: FREE (750 hours/month)
- **Vercel**: FREE (100GB bandwidth/month)
- **GitHub Pages**: FREE
- **MongoDB Atlas**: FREE (512MB)

## 🎯 **Advantages Over Manual Deployment:**

- ✅ **No more manual deployments**
- ✅ **Automatic testing** before deployment
- ✅ **Rollback on failure**
- ✅ **Deployment history** and logs
- ✅ **Multiple environment support**
- ✅ **Team collaboration** friendly

## 🚀 **Ready to Deploy!**

1. **Choose your deployment option**
2. **Add the required secrets**
3. **Push to main branch**
4. **Watch the magic happen!**

Your app will be automatically deployed every time you push to the main branch! 🎉
