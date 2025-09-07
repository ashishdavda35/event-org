# ✅ Railway Deployment Verification Checklist

## 🔍 **Pre-Deployment Verification**

### **1. Backend Dependencies ✅**
All required dependencies are now in `backend/package.json`:
- ✅ `express: ^4.18.2`
- ✅ `mongoose: ^7.5.0`
- ✅ `passport: ^0.7.0` ← **FIXED**
- ✅ `passport-google-oauth20: ^2.0.0` ← **FIXED**
- ✅ `jsonwebtoken: ^9.0.2`
- ✅ `bcryptjs: ^2.4.3`
- ✅ `socket.io: ^4.7.2`
- ✅ `cors: ^2.8.5`
- ✅ `helmet: ^7.1.0`
- ✅ `dotenv: ^16.3.1`
- ✅ `joi: ^17.9.2`
- ✅ `uuid: ^9.0.0`
- ✅ `express-rate-limit: ^6.10.0`

### **2. Frontend Dependencies ✅**
All required dependencies are in `frontend/package.json`:
- ✅ `next: 15.5.2`
- ✅ `react: 19.1.0`
- ✅ `axios: ^1.11.0`
- ✅ `@heroicons/react: ^2.2.0`
- ✅ `recharts: ^3.1.2`
- ✅ `qrcode: ^1.5.4`
- ✅ All other dependencies present

### **3. Railway Configuration Files ✅**

**Backend (`backend/railway.json`)**:
```json
{
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Frontend (`frontend/railway.json`)**:
```json
{
  "deploy": {
    "startCommand": "npm run build && npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100
  }
}
```

### **4. Backend Code Verification ✅**
- ✅ Passport properly imported and initialized
- ✅ Database connection configured
- ✅ Health check endpoint at `/api/health`
- ✅ All routes properly configured
- ✅ Error handling in place

## 🚀 **Railway Deployment Settings**

### **Step 1: Deploy MongoDB Database**
1. **Go to Railway Dashboard**
2. **New Project** → **Deploy from GitHub**
3. **Select your repository**
4. **Add Database** → **MongoDB**
5. **Wait for "Ready" status**
6. **Copy the MongoDB connection string**

### **Step 2: Deploy Backend Service**
1. **New Service** → **Deploy from GitHub**
2. **Repository**: Your event-org repo
3. **Root Directory**: `backend`
4. **Build Command**: `npm install` (auto-detected)
5. **Start Command**: `npm start` (auto-detected)

**Environment Variables for Backend**:
```bash
MONGODB_URI=mongodb://mongo:27017/event-org
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.railway.app
CORS_ORIGIN=https://your-frontend-url.railway.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **Step 3: Deploy Frontend Service**
1. **New Service** → **Deploy from GitHub**
2. **Repository**: Your event-org repo
3. **Root Directory**: `frontend`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`

**Environment Variables for Frontend**:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
NODE_ENV=production
```

## 🔧 **Railway Dashboard Settings**

### **Backend Service Settings**:
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check**: Disabled (temporarily)
- **Restart Policy**: On Failure (10 retries)

### **Frontend Service Settings**:
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Health Check**: `/` (enabled)
- **Restart Policy**: On Failure (10 retries)

## 🧪 **Testing Checklist**

### **Backend Health Check**:
```bash
curl https://your-backend-url.railway.app/api/health
```
**Expected Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### **Frontend Test**:
- Visit: `https://your-frontend-url.railway.app`
- Should load the Event Org application
- Should be able to create polls
- Should be able to join polls

### **API Integration Test**:
- Frontend should connect to backend API
- Poll creation should work
- Poll joining should work
- Admin controls should work

## 🚨 **Common Issues & Solutions**

### **Issue 1: Backend Won't Start**
**Symptoms**: Build succeeds but service won't start
**Solution**: 
- Check environment variables
- Verify MongoDB is running
- Check logs for specific errors

### **Issue 2: Frontend Build Fails**
**Symptoms**: Build command fails
**Solution**:
- Check Node.js version (should be 22+)
- Verify all dependencies are in package.json
- Check for TypeScript errors

### **Issue 3: API Connection Issues**
**Symptoms**: Frontend can't connect to backend
**Solution**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings
- Ensure backend is running

### **Issue 4: Database Connection Issues**
**Symptoms**: Backend can't connect to MongoDB
**Solution**:
- Verify `MONGODB_URI` is correct
- Ensure MongoDB service is running
- Check database permissions

## ✅ **Success Indicators**

Your deployment is successful when:
- ✅ Backend logs show: "🚀 Server running on port 5000"
- ✅ Backend logs show: "✅ MongoDB Connected: mongo"
- ✅ Health check returns 200 OK
- ✅ Frontend loads without errors
- ✅ Can create and join polls
- ✅ Admin controls work
- ✅ Real-time synchronization works

## 🎯 **Deployment Order**

1. **MongoDB** (first - wait for "Ready")
2. **Backend** (second - wait for "Running")
3. **Frontend** (last - wait for "Running")

## 📊 **Monitoring**

After deployment, monitor:
- **Railway Dashboard**: Service status and logs
- **Health Endpoints**: Regular health checks
- **Application Logs**: Error tracking
- **Performance**: Response times

---

## 🚀 **Ready to Deploy!**

All configurations are verified and ready. The missing passport dependencies have been fixed, and all Railway settings are properly configured.

**Next Step**: Follow the deployment steps above in Railway dashboard.
