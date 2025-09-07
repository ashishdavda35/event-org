# Railway Environment Variables

## Backend Environment Variables

Set these in Railway dashboard for your backend service:

```bash
MONGODB_URI=mongodb://mongo:27017/event-org
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.railway.app
CORS_ORIGIN=https://your-frontend-url.railway.app
```

## Frontend Environment Variables

Set these in Railway dashboard for your frontend service:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
NODE_ENV=production
```

## Important Notes

1. **Replace URLs**: Update `your-backend-url` and `your-frontend-url` with your actual Railway URLs
2. **JWT Secret**: Use a long, random string for JWT_SECRET in production
3. **MongoDB URI**: Railway will provide the correct MongoDB URI automatically
4. **CORS**: Ensure CORS_ORIGIN matches your frontend URL exactly

## How to Set Environment Variables in Railway

1. Go to your service in Railway dashboard
2. Click on "Variables" tab
3. Add each environment variable
4. Click "Deploy" to apply changes
