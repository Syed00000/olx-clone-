# Vercel Deployment Instructions

## Prerequisites

1. Create a [Vercel account](https://vercel.com/signup) if you don't have one
2. Install Vercel CLI: `npm install -g vercel`
3. Login to Vercel CLI: `vercel login`

## Backend Deployment

### 1. Prepare Environment Variables

Before deploying, prepare the following environment variables:

```
MONGODB_URI=mongodb+srv://syedimranh59:Syed%401234@cluster0.dmgn230.mongodb.net/olx-clone?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
SESSION_SECRET=your-super-secret-session-key-here-make-it-long-and-complex
NODE_ENV=production
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
FRONTEND_URL=https://frontend-chi-steel-16.vercel.app
```

### 2. Deploy Backend

1. From the root directory, run:
   ```
   vercel --prod
   ```

2. When prompted:
   - Set the project name (e.g., `olx-clone-backend`)
   - Select the root directory
   - Choose "Other" for the framework

3. After deployment, copy the backend URL (e.g., `https://olx-clone-backend.vercel.app`)

### 3. Set Environment Variables in Vercel Dashboard

1. Go to your Vercel dashboard
2. Navigate to your backend project
3. Go to "Settings" → "Environment Variables"
4. Add all the environment variables listed above

### 4. Redeploy Backend

After setting environment variables, redeploy the backend:
1. In Vercel dashboard, go to your backend project
2. Go to "Deployments"
3. Click on the latest deployment
4. Click "Redeploy"

## Frontend Updates

### 1. Update Frontend Environment Variables

Update [frontend/.env.production](file:///C:/Users/Syed%20Imran%20Hassan/Downloads/OLXClone/OLXClone/frontend/.env.production) with your actual backend URL:

```
VITE_API_URL=https://your-backend-url.vercel.app
```

### 2. Redeploy Frontend

1. Go to your frontend project directory:
   ```
   cd frontend
   ```

2. Deploy with Vercel:
   ```
   vercel --prod
   ```

## File Upload Limitations

Vercel has limitations with file uploads in serverless functions:
- Files are not persisted between function calls
- For production use, consider using a dedicated file storage service like:
  - AWS S3
  - Cloudinary
  - Firebase Storage

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure `FRONTEND_URL` environment variable is set correctly
   - Check that the frontend URL is in the [allowedOrigins](file:///C:/Users/Syed%20Imran%20Hassan/Downloads/OLXClone/OLXClone/backend/api/index.ts#L8-L12) array

2. **Environment Variables Not Working**
   - Ensure all environment variables are set in the Vercel dashboard
   - Redeploy after setting environment variables

3. **API Endpoints Not Found**
   - Check that the [vercel.json](file:///C:/Users/Syed%20Imran%20Hassan/Downloads/OLXClone/OLXClone/vercel.json) configuration is correct
   - Make sure the API route files are in the correct location

### Checking Deployment Status

1. **Backend Health Check**
   Visit `https://your-backend-url.vercel.app/health` to check if the backend is running

2. **Logs**
   Check logs in the Vercel dashboard under your project's "Logs" section

## Best Practices

1. **Security**
   - Never commit sensitive environment variables to version control
   - Use strong, random secrets for JWT and session management
   - Regularly rotate secrets

2. **Performance**
   - Monitor function execution times
   - Optimize database queries
   - Use caching where appropriate

3. **Monitoring**
   - Set up alerts for errors
   - Monitor usage and costs
   - Regularly check MongoDB Atlas for performance issues