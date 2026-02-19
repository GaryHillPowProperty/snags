# Vercel Deployment Guide

## ✅ Current Status

Your frontend is successfully deployed on Vercel!

**Live URLs:**
- Production: https://frontend-phi-eight-30.vercel.app
- Dashboard: https://vercel.com/gary-hills-projects/frontend

## 🔧 Configuration

### Environment Variables

The frontend is configured to use an environment variable `VITE_API_URL` for the backend API URL.

**Current Setup:**
- `VITE_API_URL` is set but empty (falls back to `/api` for local development)
- When deployed, you need to set this to your backend URL

### Updating the Backend API URL

When you deploy your backend, update the environment variable:

**Option 1: Via Vercel Dashboard**
1. Go to https://vercel.com/gary-hills-projects/frontend/settings/environment-variables
2. Find `VITE_API_URL`
3. Update the value to your backend URL (e.g., `https://your-backend.railway.app` or `https://your-backend.render.com`)
4. Redeploy: `vercel --prod`

**Option 2: Via CLI**
```powershell
cd frontend
vercel env rm VITE_API_URL production
vercel env add VITE_API_URL production
# Enter your backend URL when prompted, e.g.: https://your-backend.railway.app
vercel --prod
```

## 📝 Code Changes Made

1. **Updated `frontend/src/services/api.js`**
   - Now uses `import.meta.env.VITE_API_URL || '/api'`
   - Falls back to `/api` for local development (Vite proxy)

2. **Fixed duplicate `minHeight` warning** in `App.jsx`

## 🚀 Redeploying After Changes

To redeploy after making code changes:

```powershell
cd frontend
vercel --prod
```

## 🔗 Backend Deployment

Your backend uses SQLite and file uploads, which don't work well on Vercel serverless functions. Recommended platforms:

1. **Railway** (https://railway.app) - Easy deployment, supports SQLite
2. **Render** (https://render.com) - Free tier available
3. **Fly.io** (https://fly.io) - Good for Node.js apps

After deploying the backend, update `VITE_API_URL` to point to your backend URL.

## 📱 Testing

- Visit: https://frontend-phi-eight-30.vercel.app
- The frontend will work, but API calls will fail until you set up the backend URL
