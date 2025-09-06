# 🔧 Vercel Deployment Fix - Backend API Issue

## ❌ **Problem Identified**

Your Vercel deployment is working, but the frontend is still trying to connect to `localhost:5000` for API calls. This is why authentication isn't working on the deployed version.

## ✅ **Solution: Deploy Backend + Set Environment Variables**

### **Step 1: Deploy Backend to Railway**

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Create New Project**
4. **Deploy from GitHub**
5. **Select your repository: `ashishdavda35/event-org`**
6. **Configure:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
7. **Deploy and get your backend URL**

### **Step 2: Set Environment Variables in Vercel**

1. **Go to your Vercel dashboard**
2. **Select your project: `event-org-eight`**
3. **Go to Settings → Environment Variables**
4. **Add new variable:**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-url.railway.app/api`
   - Environment: Production, Preview, Development
5. **Save and redeploy**

### **Step 3: Alternative - Use Vercel API Routes**

If you prefer to keep everything on Vercel, we can use Next.js API routes as a proxy.

## 🚀 **Quick Fix Commands**

### **Deploy Backend to Railway:**
```bash
cd backend
# Follow Railway deployment steps
```

### **Update Vercel Environment:**
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Add: `NEXT_PUBLIC_API_URL` = `https://your-railway-backend.railway.app/api`

## 🔍 **Test Your Fix**

After setting the environment variable:
1. **Redeploy your Vercel app**
2. **Test login at:** https://event-org-eight.vercel.app/auth/login
3. **Check browser console** for API calls
4. **Verify API calls go to Railway backend**

## 📋 **Expected Result**

- ✅ Frontend loads on Vercel
- ✅ API calls go to Railway backend
- ✅ Authentication works
- ✅ All features functional

---

**💡 The key is setting `NEXT_PUBLIC_API_URL` environment variable in Vercel!**