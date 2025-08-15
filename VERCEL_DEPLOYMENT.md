# Deploying OLX Clone to Vercel

## Overview

This guide explains how to deploy both the frontend and backend of the OLX Clone application to Vercel, with the latest updates and best practices.

## Prerequisites

1. Vercel account
2. Vercel CLI installed (`npm install -g vercel`)
3. Git repository with the OLX Clone code
4. MongoDB database (Atlas recommended for production)

## Deploying the Backend

### 1. Configure Environment Variables

In the Vercel dashboard, set these environment variables for your backend project:

```
MONGODB_URI=mongodb+srv://syedimranh59:Syed%401234@cluster0.dmgn230.mongodb.net/olx-clone?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
SESSION_SECRET=your-super-secret-session-key-here-make-it-long-and-complex
NODE_ENV=production
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
FRONTEND_URL=https://your-frontend-url.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

> Note: You'll need to create a Cloudinary account for image storage as Vercel's temporary filesystem doesn't persist files.

### 2. Prepare Backend for Deployment

Before deploying, ensure your backend is properly configured:

1. Install necessary dependencies:
```bash
npm install @vercel/node
```

2. Create a `vercel.json` file in the root directory:
```json
{
  "version": 2,
  "name": "olx-clone-backend",
  "framework": "other",
  "functions": {
    "api/index": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 3. Deploy Backend Using Vercel CLI

From the root directory of your project:

```bash
vercel --prod
```

When prompted:
- Set project name to `olx-clone-backend`
- Select root directory
- Choose "Other" framework

### 4. Get Your Backend URL

After deployment, note your backend URL which will look like:
`https://olx-clone-backend.vercel.app`

## Deploying the Frontend

### 1. Update Environment Variables

Update [frontend/.env.production](file:///C:/Users/Syed%20Imran%20Hassan/Downloads/OLXClone/OLXClone/frontend/.env.production) with your actual backend URL:

```
VITE_API_URL=https://your-backend-url.vercel.app
VITE_FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 2. Prepare Frontend for Deployment

1. Create a `vercel.json` file in the frontend directory:
```json
{
  "version": 2,
  "name": "olx-clone-frontend",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 3. Deploy Frontend

From the frontend directory:

```bash
cd frontend
vercel --prod
```

## Important Notes

### File Upload Limitations

Vercel serverless functions have temporary file systems. For production use, we've integrated Cloudinary for persistent image storage.

### CORS Configuration

The application is already configured to allow requests from your frontend URL. If you use a different frontend URL, add it to the [allowedOrigins](file:///C:/Users/Syed%20Imran%20Hassan/Downloads/OLXClone/OLXClone/backend/api/index.ts#L8-L12) array in [backend/api/index.ts](file:///C:/Users/Syed%20Imran%20Hassan/Downloads/OLXClone/OLXClone/backend/api/index.ts).

### Environment Variables

Remember to update environment variables in the Vercel dashboard if you change your frontend or backend URLs.

## Testing Your Deployment

1. Visit your frontend URL to see the application
2. Visit `https://your-backend-url.vercel.app/health` to check backend health
3. Try uploading images to verify Cloudinary integration works
4. Try logging in or registering a new user to test the API connection
5. Test all major features to ensure everything works as expected

## Post-Deployment Tasks

1. Set up custom domains for both frontend and backend if needed
2. Configure monitoring and error tracking
3. Set up automated deployments from your git repository
4. Configure proper logging and analytics