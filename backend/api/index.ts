import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from '../routes';

// Create an Express app
const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000',
  'https://frontend-chi-steel-16.vercel.app',
  // Add your deployed backend URL when you have it
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Register all API routes
await registerRoutes(app);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export the Express app as a Vercel serverless function
export default (req: VercelRequest, res: VercelResponse) => {
  // Pass the Vercel request and response to Express
  return app(req as any, res as any);
};