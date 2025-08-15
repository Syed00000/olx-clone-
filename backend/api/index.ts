// Simple Vercel API handler for OLX Clone backend
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Health check endpoint
  if (req.method === 'GET' && req.url === '/health') {
    return res.status(200).json({ 
      status: 'OK', 
      message: 'Vercel API handler is working',
      timestamp: new Date().toISOString() 
    });
  }
  
  // For all other requests, return a simple message
  return res.status(200).json({ 
    message: 'OLX Clone Backend API - Vercel Deployment',
    note: 'Backend is deployed successfully'
  });
}