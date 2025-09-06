# 🔧 Railway Build Failure Fix

## ❌ **Common Railway Build Issues & Solutions**

### **Issue 1: Wrong Root Directory**
Railway might be trying to build from the root instead of the `backend` directory.

**Solution:**
1. Go to Railway dashboard
2. Select your project
3. Go to Settings → Source
4. Set **Root Directory** to `backend`

### **Issue 2: Missing Package.json in Root**
Railway needs to know which directory contains the Node.js app.

**Solution:**
Create a root `package.json` that points to the backend:

```json
{
  "name": "event-org",
  "version": "1.0.0",
  "scripts": {
    "start": "cd backend && npm start",
    "build": "cd backend && npm install"
  },
  "engines": {
    "node": "22"
  }
}
```

### **Issue 3: Port Configuration**
Railway might not be detecting the correct port.

**Solution:**
Add to `backend/package.json`:
```json
{
  "scripts": {
    "start": "PORT=$PORT node src/index.js"
  }
}
```

### **Issue 4: Environment Variables**
Missing required environment variables.

**Solution:**
Set these in Railway dashboard:
- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI=your-mongodb-connection-string`

## 🚀 **Quick Fix Steps**

### **Step 1: Check Build Logs**
1. Go to Railway dashboard
2. Click on your project
3. Check the build logs for specific error messages

### **Step 2: Fix Root Directory**
1. Settings → Source
2. Set Root Directory: `backend`
3. Redeploy

### **Step 3: Alternative - Create Root Package.json**
If Railway still can't find the backend, create a root package.json.

### **Step 4: Check Backend Package.json**
Ensure your backend has proper start script.

## 🔍 **Debugging Steps**

1. **Check Railway build logs** for specific error
2. **Verify backend/package.json** exists and has start script
3. **Set correct root directory** in Railway settings
4. **Add required environment variables**
5. **Redeploy**

---

**💡 Most Railway build failures are due to wrong root directory or missing package.json!**
