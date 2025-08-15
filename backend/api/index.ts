// Updated Vercel API handler for OLX Clone backend with authentication
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { User } from '../shared/mongodb-schema';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Health check endpoint
  if (req.method === 'GET' && req.url === '/health') {
    return res.status(200).json({ 
      status: 'OK', 
      message: 'Vercel API handler is working',
      timestamp: new Date().toISOString() 
    });
  }
  
  // Auth login endpoint
  if (req.method === 'POST' && req.url === '/api/auth/login') {
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
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // Auth register endpoint
  if (req.method === 'POST' && req.url === '/api/auth/register') {
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
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // For all other requests, return a simple message
  return res.status(200).json({ 
    message: 'OLX Clone Backend API - Vercel Deployment',
    note: 'Backend is deployed successfully'
  });
}