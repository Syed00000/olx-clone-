// Updated Vercel API handler for OLX Clone backend with authentication
import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
const authenticateToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { success: true, decoded };
  } catch (error) {
    return { success: false, error };
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Parse the URL to get just the pathname
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  // Health check endpoint
  if (req.method === 'GET' && pathname === '/health') {
    return res.status(200).json({ 
      status: 'OK', 
      message: 'Vercel API handler is working',
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
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
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
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    try {
      const { username, email, password, phone, location } = req.body;
      
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
  if (req.method === 'GET' && pathname === '/api/auth/me') {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }
      
      // Verify token
      const verification = authenticateToken(token);
      if (!verification.success) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      
      // Find user by ID
      const user = await User.findById(verification.decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      return res.status(200).json({
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        location: user.location
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // For all other requests, return a simple message
  return res.status(200).json({ 
    message: 'OLX Clone Backend API - Vercel Deployment',
    note: 'Backend is deployed successfully'
  });
}