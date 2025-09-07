# 🛠️ Railway Deployment Troubleshooting

## ❌ Health Check Failed - "Service Unavailable"

### **Problem**: Backend health check is failing with "service unavailable"

### **Solutions**:

#### 1. **Check Environment Variables**
Make sure these are set in Railway dashboard:
```bash
MONGODB_URI=mongodb://mongo:27017/event-org
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PORT=5000
```

#### 2. **Check Railway Logs**
1. Go to Railway Dashboard
2. Click on your backend service
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Check "Build Logs" and "Deploy Logs"

#### 3. **Common Issues & Fixes**

**Issue**: Database connection failed
```
❌ Database connection error: connect ECONNREFUSED
```
**Fix**: 
- Ensure MongoDB service is deployed first
- Check MONGODB_URI is correct
- Wait for MongoDB to be fully ready

**Issue**: Port binding error
```
❌ Server error: listen EADDRINUSE
```
**Fix**: 
- Railway automatically sets PORT environment variable
- Don't hardcode port numbers

**Issue**: Missing dependencies
```
❌ Cannot find module 'express'
```
**Fix**: 
- Ensure package.json has all dependencies
- Check if build completed successfully

#### 4. **Step-by-Step Debugging**

1. **Deploy MongoDB First**
   - Add Database → MongoDB
   - Wait for "Ready" status
   - Copy connection string

2. **Deploy Backend Without Health Check**
   - Remove healthcheckPath from railway.json
   - Deploy and check logs
   - Test manually: `curl https://your-backend-url.railway.app/api/health`

3. **Add Health Check Back**
   - Once backend is working, add health check
   - Set healthcheckTimeout to 300 seconds

#### 5. **Manual Testing**

Test your backend manually:
```bash
# Test health endpoint
curl https://your-backend-url.railway.app/api/health

# Expected response:
{"status":"OK","timestamp":"2024-01-01T00:00:00.000Z","uptime":123.45,"environment":"production"}
```

#### 6. **Railway Configuration**

**Backend railway.json** (simplified):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 7. **Environment Variables Checklist**

**Backend**:
- ✅ `MONGODB_URI` - From Railway MongoDB service
- ✅ `JWT_SECRET` - Long random string
- ✅ `NODE_ENV=production`
- ✅ `PORT` - Railway sets this automatically
- ✅ `FRONTEND_URL` - Your frontend Railway URL
- ✅ `CORS_ORIGIN` - Your frontend Railway URL

**Frontend**:
- ✅ `NEXT_PUBLIC_API_URL` - Your backend Railway URL + `/api`
- ✅ `NODE_ENV=production`

#### 8. **Deployment Order**

1. **MongoDB** (first)
2. **Backend** (second)
3. **Frontend** (last)

#### 9. **Quick Fixes**

**If backend won't start**:
1. Remove health check temporarily
2. Check logs for specific errors
3. Verify all environment variables
4. Ensure MongoDB is running

**If health check fails**:
1. Test endpoint manually
2. Increase healthcheckTimeout
3. Check if server is actually running
4. Verify port configuration

#### 10. **Log Analysis**

Look for these in logs:
- ✅ `🚀 Server running on port 5000`
- ✅ `✅ MongoDB Connected: mongo`
- ❌ `❌ Database connection error`
- ❌ `❌ Server error`

## 🆘 Still Having Issues?

1. **Check Railway Status**: [status.railway.app](https://status.railway.app)
2. **Railway Discord**: Join for community support
3. **Railway Docs**: [docs.railway.app](https://docs.railway.app)

## 🎯 Success Indicators

Your deployment is working when you see:
- ✅ Backend logs: "Server running on port 5000"
- ✅ Backend logs: "MongoDB Connected"
- ✅ Health check: `curl` returns JSON response
- ✅ Frontend loads without errors
- ✅ API calls work from frontend
