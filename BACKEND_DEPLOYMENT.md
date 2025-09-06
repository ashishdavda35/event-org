# 🚀 Backend Deployment to Railway

## 🎯 **Deploy Your Backend API**

### **Step 1: Go to Railway**
1. Visit [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"

### **Step 2: Deploy from GitHub**
1. Select "Deploy from GitHub repo"
2. Choose your repository: `ashishdavda35/event-org`
3. Railway will detect the backend automatically

### **Step 3: Configure Backend**
1. **Root Directory:** `backend`
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. **Node Version:** 22
5. **Railway Configuration:** Already set up with `railway.json`

### **Step 4: Set Environment Variables**
Add these environment variables in Railway:
- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI=your-mongodb-connection-string`

### **Step 5: Get Your Backend URL**
After deployment, Railway will give you a URL like:
`https://your-project-name.railway.app`

## 🔧 **Update Vercel Environment**

1. **Go to Vercel dashboard**
2. **Select your project**
3. **Settings → Environment Variables**
4. **Add:**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-project-name.railway.app/api`
   - Environment: All (Production, Preview, Development)

## ✅ **Test Your Setup**

1. **Backend health check:** `https://your-project-name.railway.app/api/health`
2. **Frontend login:** `https://event-org-eight.vercel.app/auth/login`
3. **Check browser console** for API calls

---

**🎉 Your full-stack app will be live on both platforms!**
