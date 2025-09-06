# 🚀 Deployment Guide

## 🌐 Quick Deployment

### Netlify (Frontend)
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository: `ashishdavda35/event-org`
3. **Netlify will auto-detect the `netlify.toml` configuration**
4. Deploy (no manual settings needed)

### Vercel (Backend)
1. Go to [vercel.com](https://vercel.com)
2. Import repository
3. Set root directory to `backend`
4. Deploy

## 🔧 Local Development

```bash
# Backend
cd backend && npm install && npm start

# Frontend  
cd frontend && npm install && npm run dev
```

## 📋 Deployment Checklist

- [ ] Local build works (`npm run build`)
- [ ] Base directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Node version: 22
- [ ] Environment variables configured

---

**🎉 Ready for deployment!**
