# 🔧 Vercel Deployment Fix

## ❌ Issue: 404 DEPLOYMENT_NOT_FOUND

The 404 error is caused by conflicting Vercel configurations. Here's how to fix it:

## ✅ Solution: Deploy Frontend and Backend Separately

### Step 1: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your `event-org` repository
5. **IMPORTANT**: Set **Root Directory** to `frontend`
6. Click "Deploy"

### Step 2: Deploy Backend to Vercel

1. Create a **new** Vercel project
2. Import the same `event-org` repository
3. **IMPORTANT**: Set **Root Directory** to `backend`
4. Click "Deploy"

### Step 3: Set Environment Variables

#### Frontend Environment Variables:
- `NEXT_PUBLIC_API_URL` = `https://your-backend-url.vercel.app`
- `NODE_ENV` = `production`

#### Backend Environment Variables:
- `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/eventorg`
- `JWT_SECRET` = `your-secret-key-here`
- `NODE_ENV` = `production`

## 🚫 Don't Use Root Directory

**DO NOT** deploy from the root directory. The root `vercel.json` is causing conflicts.

## ✅ Correct Deployment Structure

```
event-org/
├── frontend/          # Deploy this as separate project
│   ├── package.json
│   ├── vercel.json    # Frontend config
│   └── src/
└── backend/           # Deploy this as separate project
    ├── package.json
    ├── vercel.json    # Backend config
    └── src/
```

## 🌐 Expected URLs

After correct deployment:
- **Frontend**: `https://event-org-frontend.vercel.app`
- **Backend**: `https://event-org-backend.vercel.app`
- **Live Demo**: `https://event-org-frontend.vercel.app/poll/U706KM/results-fixed`

## 🔧 Alternative: Use Deployment Package

If Vercel continues to have issues:

1. Use the `event-org-deployment.zip` (available locally)
2. Deploy to **Netlify** (frontend) + **Railway** (backend)
3. Or use **Render** for both

## 📋 Quick Fix Commands

```bash
# Remove conflicting root vercel.json
rm vercel.json

# Commit the change
git add .
git commit -m "Remove conflicting root vercel.json"
git push origin main
```

---

**🚀 Deploy frontend and backend as separate Vercel projects with correct root directories!**
