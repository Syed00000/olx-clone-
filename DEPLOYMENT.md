# Deployment Guide - OLX Clone

## 🚀 Vercel Deployment

### Frontend Deployment (Vercel)

1. **Prepare Frontend for Deployment**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Vercel Configuration**
   Create `vercel.json` in the frontend directory:
   ```json
   {
     "name": "olx-clone-frontend",
     "version": 2,
     "builds": [
       {
         "src": "dist/**/*",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/assets/(.*)",
         "dest": "/assets/$1"
       },
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

3. **Environment Variables for Frontend (.env)**
   ```bash
   VITE_API_URL=https://your-backend-api.vercel.app
   VITE_APP_NAME=OLX Clone
   VITE_APP_VERSION=1.0.0
   ```

### Backend Deployment (Vercel)

1. **Prepare Backend for Deployment**
   Create `vercel.json` in the root directory:
   ```json
   {
     "name": "olx-clone-backend",
     "version": 2,
     "builds": [
       {
         "src": "backend/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "backend/index.ts"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

2. **Environment Variables for Backend**
   Set these in Vercel dashboard:
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://syedimranh59:Syed%401234@cluster0.dmgn230.mongodb.net/olx-clone?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
   SESSION_SECRET=your-super-secret-session-key-here-make-it-long-and-complex
   MAX_FILE_SIZE=5242880
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

### Step-by-Step Deployment Process

#### Option 1: Deploy Both Frontend and Backend Separately

1. **Deploy Backend**
   ```bash
   # In root directory
   vercel --prod
   ```
   - Select your project
   - Set environment variables in Vercel dashboard
   - Copy the backend URL

2. **Deploy Frontend**
   ```bash
   cd frontend
   # Update VITE_API_URL in .env to your backend URL
   vercel --prod
   ```

#### Option 2: Monorepo Deployment

1. **Create separate Vercel projects for frontend and backend**
2. **Deploy backend first and get the URL**
3. **Update frontend environment variables**
4. **Deploy frontend**

### MongoDB Database Setup

Your database is already configured:
- **MongoDB URI**: `mongodb+srv://syedimranh59:Syed%401234@cluster0.dmgn230.mongodb.net/olx-clone`
- **Database**: Already connected and working
- **Collections**: Users, Listings, Categories (auto-created)

### File Upload Configuration

Since Vercel has limitations with file uploads, consider:

1. **Option 1: Use Vercel's serverless functions**
   - Files will be temporary (cleared after function execution)
   - Good for small files and development

2. **Option 2: Use Cloud Storage (Recommended)**
   - Integrate with AWS S3, Cloudinary, or similar
   - Update the backend file upload logic
   - More reliable for production

### Domain Configuration

1. **Custom Domain Setup**
   - Add your domain in Vercel dashboard
   - Update CORS settings in backend
   - Update API URLs in frontend

### SSL and Security

- Vercel automatically provides SSL certificates
- Ensure CORS is properly configured
- Use environment variables for all secrets
- Enable security headers

### Monitoring and Logs

1. **Vercel Dashboard**
   - Monitor function executions
   - View deployment logs
   - Check error logs

2. **Database Monitoring**
   - Monitor MongoDB Atlas dashboard
   - Set up alerts for high usage
   - Check connection logs

### Quick Deployment Commands

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy backend
vercel --prod

# Deploy frontend
cd frontend
vercel --prod
```

### Environment Variables Summary

#### Backend (.env or Vercel Environment Variables)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://syedimranh59:Syed%401234@cluster0.dmgn230.mongodb.net/olx-clone?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-minimum-32-characters-long
SESSION_SECRET=your-session-secret-minimum-32-characters-long
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Frontend (.env)
```
VITE_API_URL=https://your-backend.vercel.app
VITE_APP_NAME=OLX Clone
VITE_APP_VERSION=1.0.0
```

### Post-Deployment Checklist

- [ ] Backend API endpoints are accessible
- [ ] Frontend can connect to backend API
- [ ] Database connections are working
- [ ] File uploads are functioning
- [ ] Authentication system is working
- [ ] CORS is properly configured
- [ ] All environment variables are set
- [ ] SSL certificates are active
- [ ] Custom domains are configured (if applicable)

### Troubleshooting Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL in backend environment
   - Verify CORS configuration in backend code

2. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check MongoDB Atlas network access
   - Ensure database user has proper permissions

3. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Consider cloud storage integration

4. **Environment Variable Issues**
   - Ensure all variables are set in Vercel dashboard
   - Check variable names match code expectations
   - Verify no trailing spaces or special characters

### Performance Optimization

1. **Frontend Optimization**
   - Enable compression
   - Optimize images
   - Use CDN for static assets
   - Enable caching headers

2. **Backend Optimization**
   - Add response compression
   - Implement API rate limiting
   - Optimize database queries
   - Use connection pooling

---

**Your OLX Clone is now ready for production deployment! 🎉**
