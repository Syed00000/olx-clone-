# 🚀 Quick Vercel Deployment Guide

## Frontend Deployment (पहले यह deploy करें)

### Step 1: Frontend Deploy करें
```bash
cd frontend
npm install
npm run build
```

### Step 2: Vercel पर Deploy
1. **Vercel.com पर जाएं** और GitHub से login करें
2. **"Import Project"** पर click करें
3. **Repository select करें**: `olx-clone-`
4. **Framework preset**: Vite
5. **Root Directory**: `frontend` (बहुत important!)
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`
8. **Install Command**: `npm install`

### Step 3: Environment Variables (Frontend)
Vercel dashboard में यह variables add करें:
```
VITE_API_URL=https://your-backend-domain.vercel.app
VITE_APP_NAME=OLX Clone
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

---

## Backend Deployment (Frontend के बाद)

### Step 1: Backend Deploy करें
1. **New Vercel Project** create करें
2. **Same repository** select करें: `olx-clone-`
3. **Framework preset**: Other
4. **Root Directory**: Leave empty (root level)
5. **Build Command**: Leave empty
6. **Output Directory**: Leave empty
7. **Install Command**: `npm install`

### Step 2: Environment Variables (Backend)
Vercel dashboard में यह variables add करें:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://syedimranh59:Syed%401234@cluster0.dmgn230.mongodb.net/olx-clone?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-random
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters-long-random
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Step 3: Update Frontend API URL
Backend deploy होने के बाद:
1. Backend का URL copy करें
2. Frontend project के environment variables में `VITE_API_URL` update करें
3. Frontend को redeploy करें

---

## 📝 Important Notes:

### For Frontend:
- ✅ `vercel.json` already created
- ✅ `.env` and `.env.production` files ready
- ✅ Vite config optimized
- ✅ Build scripts ready

### For Backend:
- ✅ `vercel.json` already created (root level)
- ✅ `.env.example` ready
- ✅ MongoDB connection configured

### Deployment Order:
1. **Frontend first** (get the domain)
2. **Backend second** (get the API domain)
3. **Update frontend** API URL
4. **Test everything**

---

## 🔧 Quick Commands:

```bash
# Frontend build test
cd frontend
npm install
npm run build
npm run preview

# Check if build is successful
cd dist
ls -la
```

---

## 🎯 After Deployment:

1. ✅ Frontend URL: `https://your-frontend.vercel.app`
2. ✅ Backend URL: `https://your-backend.vercel.app`
3. ✅ Test API endpoints: `/api/listings`, `/api/auth/me`
4. ✅ Test file uploads and authentication

---

**All files are ready for deployment! 🎉**
