// Updated Vercel API handler for OLX Clone backend with authentication
import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://syedimranh59:Syed%401234@cluster0.dmgn230.mongodb.net/olx-clone?retryWrites=true&w=majority';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Define user schema and model directly to avoid import issues
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String },
  },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Middleware to verify JWT token
const authenticateToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Make sure we're connected to the database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }
    
    // Find user in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    return { success: true, user, decoded };
  } catch (error) {
    return { success: false, error };
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://frontend-chi-steel-16.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
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
      timestamp: new Date().toISOString() 
    });
  }
  
  // Test endpoint for debugging
  if (req.method === 'GET' && pathname === '/test') {
    return res.status(200).json({ 
      message: 'Backend is working correctly',
      method: req.method,
      pathname: pathname,
      timestamp: new Date().toISOString() 
    });
  }
  
  // Connect to MongoDB if not already connected
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      return res.status(500).json({ message: 'Database connection failed' });
    }
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
      
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      console.log('User found:', user.email);
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          location: user.location
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
      const { username, email, password, phone, location } = req.body;
      
      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ 
          message: 'Username, email, and password are required' 
        });
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email or username already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = new User({
        username,
        email,
        password: hashedPassword,
        phone,
        location
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          location: user.location
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
      
      // Verify token
      const verification = await authenticateToken(token);
      if (!verification.success) {
        console.error('Token verification failed:', verification.error);
        return res.status(403).json({ message: 'Invalid token', error: verification.error });
      }
      
      return res.status(200).json({
        id: verification.user._id,
        username: verification.user.username,
        email: verification.user.email,
        phone: verification.user.phone,
        location: verification.user.location
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
    note: 'Backend is deployed successfully',
    availableEndpoints: [
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/me',
      'GET /health',
      'GET /test'
    ]
  });
}