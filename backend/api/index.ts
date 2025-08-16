// Simple Vercel API handler for OLX Clone backend
import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://syedimranh59:Syed%401234@cluster0.dmgn230.mongodb.net/olx-clone?retryWrites=true&w=majority';

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Simple in-memory user storage for testing (replace with MongoDB later)
const users = [
  {
    id: '1',
    email: 'syedimranh59@gmail.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', // "password" hashed
    username: 'syedimranh59'
  }
];

// Simple JWT secret
const JWT_SECRET = 'your-jwt-secret-key';

// Simple authentication function
const authenticateToken = async (token: string) => {
  try {
    // For now, just return a mock user (replace with JWT verification later)
    return { success: true, user: users[0], decoded: { userId: '1' } };
  } catch (error) {
    return { success: false, error };
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Handle CORS
    const allowedOrigins = [
      'https://frontend-chi-steel-16.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
  // Log request for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  
  // Parse the URL to get just the pathname
  let pathname = '/';
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    pathname = url.pathname;
  } catch (error) {
    console.error('URL parsing error:', error);
    pathname = req.url || '/';
  }
  
  console.log('Pathname:', pathname);
  
  // Health check endpoint
  if (req.method === 'GET' && pathname === '/health') {
    return res.status(200).json({ 
      status: 'OK', 
      message: 'Vercel API handler is working',
      timestamp: new Date().toISOString(),
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      cors: 'enabled',
      allowedOrigins: allowedOrigins
    });
  }
  
  // Test endpoint for debugging
  if (req.method === 'GET' && pathname === '/test') {
    return res.status(200).json({ 
      message: 'Backend is working correctly',
      method: req.method,
      pathname: pathname,
      timestamp: new Date().toISOString(),
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  }
  
  // Auth login endpoint
  if (pathname === '/api/auth/login') {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        message: 'Method not allowed',
        allowedMethods: ['POST'],
        receivedMethod: req.method,
        pathname: pathname
      });
    }
    
    try {
      console.log('Login request body:', req.body);
      console.log('Request body type:', typeof req.body);
      
      // Ensure req.body is an object
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (parseError) {
          console.error('Failed to parse request body:', parseError);
          return res.status(400).json({ message: 'Invalid JSON in request body' });
        }
      }
      
      const { email, password } = body;
      
      // Validate input
      if (!email || !password) {
        console.log('Missing email or password:', { email: !!email, password: !!password });
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Find user by email (simple check for now)
      const user = users.find(u => u.email === email);
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      console.log('User found:', user.email);
      
      // For now, just check if password is "12345" (replace with bcrypt later)
      if (password !== '12345') {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate simple token (replace with JWT later)
      const token = 'mock-token-' + Date.now();

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // Auth register endpoint
  if (pathname === '/api/auth/register') {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        message: 'Method not allowed',
        allowedMethods: ['POST'],
        receivedMethod: req.method,
        pathname: pathname
      });
    }
    
    try {
      const { username, email, password } = req.body;
      
      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ 
          message: 'Username, email, and password are required' 
        });
      }
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === email || u.username === username);
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email or username already exists' 
        });
      }

      // For now, just return success (replace with actual user creation later)
      const token = 'mock-token-' + Date.now();

      return res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: '2',
          username,
          email
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // Get current user endpoint
  if (pathname === '/api/auth/me') {
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        message: 'Method not allowed',
        allowedMethods: ['GET'],
        receivedMethod: req.method,
        pathname: pathname
      });
    }
    
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      console.log('Auth header:', authHeader);
      console.log('Token:', token);
      
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }
      
      // For now, just return the first user (replace with token verification later)
      return res.status(200).json({
        id: users[0].id,
        username: users[0].username,
        email: users[0].email
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // For all other requests, return a simple message
  if (pathname.startsWith('/api/')) {
    // API endpoints that don't match any route
    return res.status(404).json({ 
      message: 'API endpoint not found',
      pathname: pathname,
      method: req.method,
      availableEndpoints: [
        'POST /api/auth/login',
        'POST /api/auth/register', 
        'GET /api/auth/me'
      ]
    });
  }
  
  // Root and other non-API requests
  return res.status(200).json({ 
    message: 'OLX Clone Backend API - Vercel Deployment',
    note: 'Backend is working successfully',
    availableEndpoints: [
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/me',
      'GET /health',
      'GET /test'
    ]
  });
  } catch (error: any) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}