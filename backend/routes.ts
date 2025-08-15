import express, { type Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import connectDB from "./database";
import { User, Listing, Message, Category } from "./shared/mongodb-schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './backend/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Initialize default categories
async function initializeCategories() {
  try {
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      const defaultCategories = [
        {
          name: 'Mobiles',
          icon: 'smartphone',
          subcategories: [
            {
              name: 'Mobile Phones',
              attributes: [
                { name: 'Brand', type: 'select', options: ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Oppo', 'Vivo', 'Realme'], required: true },
                { name: 'Storage', type: 'select', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], required: true },
                { name: 'RAM', type: 'select', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], required: true }
              ]
            },
            {
              name: 'Accessories',
              attributes: [
                { name: 'Type', type: 'select', options: ['Case', 'Charger', 'Headphones', 'Screen Guard'], required: true }
              ]
            }
          ]
        },
        {
          name: 'Cars',
          icon: 'car',
          subcategories: [
            {
              name: 'Cars',
              attributes: [
                { name: 'Brand', type: 'select', options: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'Ford'], required: true },
                { name: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'CNG', 'Electric'], required: true },
                { name: 'Year', type: 'number', required: true },
                { name: 'KM Driven', type: 'number', required: true }
              ]
            }
          ]
        },
        {
          name: 'Properties',
          icon: 'home',
          subcategories: [
            {
              name: 'For Sale: Houses & Apartments',
              attributes: [
                { name: 'BHK', type: 'select', options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'], required: true },
                { name: 'Area', type: 'number', required: true },
                { name: 'Furnishing', type: 'select', options: ['Furnished', 'Semi-Furnished', 'Unfurnished'], required: true }
              ]
            },
            {
              name: 'For Rent: Houses & Apartments',
              attributes: [
                { name: 'BHK', type: 'select', options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'], required: true },
                { name: 'Area', type: 'number', required: true },
                { name: 'Furnishing', type: 'select', options: ['Furnished', 'Semi-Furnished', 'Unfurnished'], required: true }
              ]
            }
          ]
        },
        {
          name: 'Electronics & Appliances',
          icon: 'monitor',
          subcategories: [
            {
              name: 'TVs, Video - Audio',
              attributes: [
                { name: 'Brand', type: 'select', options: ['Samsung', 'LG', 'Sony', 'Mi', 'OnePlus'], required: true },
                { name: 'Screen Size', type: 'select', options: ['32 inch', '43 inch', '50 inch', '55 inch', '65 inch'], required: true }
              ]
            },
            {
              name: 'Kitchen & Other Appliances',
              attributes: [
                { name: 'Brand', type: 'select', options: ['LG', 'Samsung', 'Whirlpool', 'Godrej', 'Haier'], required: true }
              ]
            }
          ]
        },
        {
          name: 'Bikes',
          icon: 'bike',
          subcategories: [
            {
              name: 'Motorcycles',
              attributes: [
                { name: 'Brand', type: 'select', options: ['Hero', 'Honda', 'Bajaj', 'TVS', 'Yamaha', 'Royal Enfield'], required: true },
                { name: 'Year', type: 'number', required: true },
                { name: 'KM Driven', type: 'number', required: true }
              ]
            }
          ]
        },
        {
          name: 'Fashion',
          icon: 'shirt',
          subcategories: [
            {
              name: 'Men',
              attributes: [
                { name: 'Size', type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL'], required: true }
              ]
            },
            {
              name: 'Women',
              attributes: [
                { name: 'Size', type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL'], required: true }
              ]
            }
          ]
        }
      ];

      await Category.insertMany(defaultCategories);
      console.log('Default categories initialized');
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
}

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Initialize database connection
  await connectDB();

  // Serve uploaded images
  const uploadsPath = path.resolve('./backend/uploads');
  app.use('/uploads', express.static(uploadsPath));
  console.log('Serving uploads from:', uploadsPath);
  
  // Ensure uploads directory exists
  if (!fs.existsSync('./backend/uploads')) {
    fs.mkdirSync('./backend/uploads', { recursive: true });
    console.log('Created uploads directory');
  }

  // Initialize categories if they don't exist
  await initializeCategories();

  // Auth Routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
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

      res.status(201).json({
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
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
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

      res.json({
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
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: any, res: Response) => {
    try {
      const user = req.user;
      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar,
        isVerified: user.isVerified
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Category Routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await Category.find({ isActive: true }).sort({ name: 1 });
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Listing Routes
  app.get("/api/listings", async (req: Request, res: Response) => {
    try {
      const { 
        category, 
        subcategory, 
        city, 
        minPrice, 
        maxPrice, 
        search, 
        page = 1, 
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      let query: any = { status: 'active' };
      
      if (category) query.category = category;
      if (subcategory) query.subcategory = subcategory;
      if (city) query['location.city'] = new RegExp(city as string, 'i');
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (search) {
        query.$text = { $search: search as string };
      }

      const sortObj: any = {};
      sortObj[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const skip = (Number(page) - 1) * Number(limit);
      
      const listings = await Listing.find(query)
        .populate('seller', 'username avatar location isVerified')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit));

      const total = await Listing.countDocuments(query);
      const totalPages = Math.ceil(total / Number(limit));

      res.json({
        listings,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: total,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get featured listings
  app.get("/api/listings/featured", async (req: Request, res: Response) => {
    try {
      const listings = await Listing.find({ 
        status: 'active', 
        isFeatured: true 
      })
      .populate('seller', 'username avatar location isVerified')
      .sort({ createdAt: -1 })
      .limit(10);
      
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.get("/api/listings/:id", async (req: Request, res: Response) => {
    try {
      const listing = await Listing.findById(req.params.id)
        .populate('seller', 'username avatar location isVerified phone')
        .populate('favorites', 'username');
      
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      // Increment view count
      listing.views += 1;
      await listing.save();

      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.post("/api/listings", authenticateToken, upload.array('images', 10), async (req: any, res: Response) => {
    try {
      const {
        title,
        description,
        price,
        category,
        subcategory,
        condition,
        location,
        attributes,
        tags,
        isUrgent
      } = req.body;

      const images = req.files ? (req.files as Express.Multer.File[]).map((file: any, index: number) => ({
        url: `/uploads/${file.filename}`,
        alt: `${title} - Image ${index + 1}`,
        isPrimary: index === 0
      })) : [];

      const listing = new Listing({
        title,
        description,
        price: Number(price),
        category,
        subcategory,
        condition,
        location: typeof location === 'string' ? JSON.parse(location) : location,
        images,
        attributes: typeof attributes === 'string' ? JSON.parse(attributes) : attributes || {},
        tags: typeof tags === 'string' ? JSON.parse(tags) : tags || [],
        seller: req.user._id,
        isUrgent: isUrgent === 'true'
      });

      await listing.save();
      await listing.populate('seller', 'username avatar location isVerified');

      res.status(201).json({ message: 'Listing created successfully', listing });
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.put("/api/listings/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      const listing = await Listing.findById(req.params.id);
      
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      if (listing.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit this listing' });
      }

      const updatedListing = await Listing.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      ).populate('seller', 'username avatar location isVerified');

      res.json({ message: 'Listing updated successfully', listing: updatedListing });
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.delete("/api/listings/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      const listing = await Listing.findById(req.params.id);
      
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      if (listing.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this listing' });
      }

      listing.status = 'deleted';
      await listing.save();

      res.json({ message: 'Listing deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Favorites
  app.post("/api/listings/:id/favorite", authenticateToken, async (req: any, res: Response) => {
    try {
      const listing = await Listing.findById(req.params.id);
      
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      const userId = req.user._id;
      const isFavorited = listing.favorites.includes(userId);

      if (isFavorited) {
        listing.favorites = listing.favorites.filter((id: any) => id.toString() !== userId.toString());
      } else {
        listing.favorites.push(userId);
      }

      await listing.save();
      res.json({ message: isFavorited ? 'Removed from favorites' : 'Added to favorites', isFavorited: !isFavorited });
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // User's listings
  app.get("/api/users/my-listings", authenticateToken, async (req: any, res: Response) => {
    try {
      const listings = await Listing.find({ seller: req.user._id, status: { $ne: 'deleted' } })
        .sort({ createdAt: -1 });
      
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // User's favorites
  app.get("/api/users/my-favorites", authenticateToken, async (req: any, res: Response) => {
    try {
      const listings = await Listing.find({ 
        favorites: req.user._id,
        status: 'active'
      }).populate('seller', 'username avatar location isVerified')
      .sort({ createdAt: -1 });
      
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Messages
  app.get("/api/messages", authenticateToken, async (req: any, res: Response) => {
    try {
      const messages = await Message.find({
        $or: [{ sender: req.user._id }, { receiver: req.user._id }]
      })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .populate('listing', 'title images')
      .sort({ createdAt: -1 });
      
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.post("/api/messages", authenticateToken, async (req: any, res: Response) => {
    try {
      const { listingId, receiverId, message } = req.body;
      
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      const newMessage = new Message({
        listing: listingId,
        sender: req.user._id,
        receiver: receiverId,
        message
      });

      await newMessage.save();
      await newMessage.populate('sender', 'username avatar');
      await newMessage.populate('receiver', 'username avatar');
      await newMessage.populate('listing', 'title images');

      res.status(201).json({ message: 'Message sent successfully', data: newMessage });
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
