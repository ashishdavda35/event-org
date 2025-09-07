# 🚀 Deployment Guide

## 🎯 **Quick Deployment with GitHub Actions**

This project is configured for automated deployment using GitHub Actions.

### **📋 What Gets Deployed:**

- **Backend**: Node.js/Express API → Render
- **Frontend**: Next.js App → Vercel  
- **Database**: MongoDB Atlas (external)

### **🔧 Setup Steps:**

#### **1. Get Required API Keys**

**Render (Backend):**
1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click on your backend service
3. Go to **Settings** → **API Keys**
4. Copy your **API Key**
5. Get your **Service ID** from the URL

**Vercel (Frontend):**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create a new token
3. Copy the token
4. Get **Org ID** and **Project ID** from Vercel dashboard

#### **2. Add Secrets to GitHub**

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

```
RENDER_API_KEY = your-render-api-key
RENDER_SERVICE_ID = your-render-service-id
VERCEL_TOKEN = your-vercel-token
VERCEL_ORG_ID = your-vercel-org-id
VERCEL_PROJECT_ID = your-vercel-project-id
```

#### **3. Deploy**

1. **Push to main branch**:
   ```bash
   git push origin main
   ```

2. **Watch the deployment**:
   - Go to **Actions** tab in GitHub
   - See the deployment progress
   - Get your deployed URLs

### **🎯 Deployment Workflows:**

- **`simple-deploy.yml`**: Deploys backend to Render, frontend to Vercel
- **`github-pages.yml`**: Alternative frontend deployment to GitHub Pages
- **`deploy.yml`**: Full deployment with testing

### **🧪 Testing Deployment:**

1. **Backend Health Check**:
   ```bash
   curl https://your-backend-url.onrender.com/
   ```

2. **Frontend**:
   - Visit your Vercel URL
   - Test login and poll creation

### **🔄 Automatic Deployments:**

- **Every push to main** → Triggers deployment
- **Pull requests** → Runs tests only
- **Manual trigger** → Available in Actions tab

### **💰 Cost:**

- **GitHub Actions**: FREE (2000 minutes/month)
- **Render**: FREE (750 hours/month)
- **Vercel**: FREE (100GB bandwidth/month)
- **MongoDB Atlas**: FREE (512MB)

### **🆘 Troubleshooting:**

1. **Check GitHub Actions logs** for deployment errors
2. **Verify secrets** are set correctly
3. **Check Render/Vercel logs** for runtime errors
4. **Test endpoints** manually

---

**That's it! Your app will be automatically deployed on every push to main! 🎉**
