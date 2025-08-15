# OLX Clone - Full Stack Application

A comprehensive, fully functional OLX clone built with modern web technologies including MongoDB, React, Express.js, and TypeScript.

## 🚀 Features

### Frontend Features
- **Exact OLX UI Design**: Pixel-perfect recreation of OLX.in interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern React**: Built with React 18, TypeScript, and Tailwind CSS
- **Component Library**: Radix UI components for consistent design
- **State Management**: TanStack Query for server state management
- **Real-time Updates**: Dynamic content loading and updates

### Backend Features
- **MongoDB Integration**: Complete database setup with Mongoose ODM
- **Express.js Server**: RESTful API with proper error handling
- **JWT Authentication**: Secure user authentication and authorization
- **File Uploads**: Image upload with Multer and proper file handling
- **Search & Filter**: Advanced search with multiple filter options
- **Pagination**: Efficient data loading with pagination

### Core Functionality

#### 🔐 Authentication System
- User registration and login
- JWT token-based authentication
- Password hashing with bcryptjs
- Protected routes and middleware

#### 📝 Listing Management
- Create new listings with multiple images
- Edit and delete listings
- Category-based organization
- Advanced search and filtering
- Featured and urgent listings
- View tracking

#### 📱 User Interface
- **Homepage**: Browse listings, categories, featured ads
- **Search**: Advanced search with filters for price, location, category
- **Listing Details**: Complete product information with image gallery
- **Post Ad**: Multi-step form with image upload
- **Categories**: Dynamic category system with subcategories

#### 🗂️ Categories & Subcategories
- Mobiles (Mobile Phones, Accessories)
- Cars (Cars, Motorcycles)  
- Properties (For Sale, For Rent)
- Electronics & Appliances (TVs, Kitchen Appliances)
- Bikes (Motorcycles, Bicycles)
- Fashion (Men, Women)
- Jobs (Full-time, Part-time)
- Furniture (Home, Office)

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **TanStack Query** - Data fetching and state management
- **Wouter** - Lightweight routing
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESBuild** - Fast JavaScript bundler
- **TypeScript** - Static type checking
- **Cross-env** - Cross-platform environment variables

## 🗄️ Database Schema

### User Schema
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  location: {
    city: String,
    state: String,
    country: String
  },
  avatar: String,
  isVerified: Boolean,
  timestamps: true
}
```

### Listing Schema
```javascript
{
  title: String (required),
  description: String (required),
  price: Number (required),
  category: String (required),
  subcategory: String,
  condition: String (enum: New, Like New, Good, Fair, Poor),
  location: {
    city: String (required),
    state: String,
    coordinates: { lat: Number, lng: Number }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  attributes: Map (dynamic based on category),
  seller: ObjectId (ref: User),
  isFeatured: Boolean,
  isUrgent: Boolean,
  status: String (enum: active, sold, inactive, deleted),
  views: Number,
  favorites: [ObjectId] (ref: User),
  tags: [String],
  timestamps: true
}
```

## 🔧 Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd OLXClone
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# MongoDB connection is already configured in server/database.ts
# MongoDB URI: mongodb+srv://syedimranh59:Syed%401234@cluster0.dmgn230.mongodb.net/
```

4. **Run the application**
```bash
npm run dev
```

The application will start on `http://localhost:5000`

## 🎨 UI Components

### Header Component
- Exact OLX-style navigation
- Location selector dropdown
- Search functionality
- User profile menu
- Gradient SELL button

### Product Cards
- Multiple variants (grid, list, featured)
- Image carousel
- Price highlighting
- Location and time stamps
- Favorite functionality
- Verified seller badges

### Post Ad Form
- Multi-step category selection
- Image upload with preview
- Dynamic form fields based on category
- Location input
- Price and condition selection
- Urgent listing option

## 📱 Pages

1. **Homepage** - Browse listings, categories, search
2. **Listing Detail** - Complete product information
3. **Post Ad** - Create new listings
4. **Search Results** - Filtered search results
5. **User Profile** - User dashboard and listings
6. **Category Pages** - Category-specific listings

## 🔍 Search & Filter Features

- **Text Search**: Full-text search across titles and descriptions
- **Category Filter**: Filter by main category and subcategory
- **Price Range**: Min/max price filtering
- **Location Filter**: City-based filtering
- **Sort Options**: Latest, price (low to high/high to low), most viewed
- **View Modes**: Grid and list view options

## 📦 File Upload System

- **Multiple Image Upload**: Support for up to 10 images per listing
- **File Validation**: Image format and size validation
- **Preview Functionality**: Real-time image preview
- **Primary Image**: First image serves as main thumbnail
- **File Storage**: Images stored in uploads directory

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Validation for file types and sizes
- **CORS Configuration**: Proper cross-origin resource sharing

## 🚀 Deployment Ready

- **Production Build**: Optimized build process
- **Environment Configuration**: Proper environment variable handling
- **Static File Serving**: Express static file serving for uploads
- **Error Handling**: Comprehensive error handling and logging

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings (with filtering)
- `GET /api/listings/featured` - Get featured listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Categories
- `GET /api/categories` - Get all categories

### User Features
- `GET /api/users/my-listings` - Get user's listings
- `GET /api/users/my-favorites` - Get user's favorites
- `POST /api/listings/:id/favorite` - Toggle favorite

### Messaging
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message

## 🎯 Key Features Implemented

✅ **Exact OLX Design**: Pixel-perfect UI recreation
✅ **Full CRUD Operations**: Create, Read, Update, Delete listings
✅ **Image Upload**: Multiple image upload with preview
✅ **Search & Filter**: Advanced search functionality  
✅ **User Authentication**: Complete auth system
✅ **Responsive Design**: Mobile-first approach
✅ **Dynamic Categories**: Database-driven category system
✅ **Featured Ads**: Premium listing functionality
✅ **Location-based Search**: City and area filtering
✅ **View Tracking**: Listing view counter
✅ **Favorite System**: Save favorite listings
✅ **Real-time Updates**: Dynamic content loading

## 🚀 Getting Started

The application is now fully functional and ready to use. Simply run `npm run dev` and visit `http://localhost:5000` to see the complete OLX clone in action!

## ☁️ Deployment

### Vercel Deployment (Recommended)

This application can be deployed to Vercel with separate projects for frontend and backend:

1. **Deploy the Backend**:
   - Create a new project in Vercel
   - Point it to your repository
   - Set the environment variables (see [VERCEL_DEPLOYMENT.md](file:///C:/Users/Syed%20Imran%20Hassan/Downloads/OLXClone/OLXClone/VERCEL_DEPLOYMENT.md) for details)
   - Configure the project to use the root directory

2. **Deploy the Frontend**:
   - Create another project in Vercel
   - Point it to your repository
   - Set the root directory to `frontend`
   - Update the `VITE_API_URL` environment variable to your deployed backend URL

For detailed instructions, see [VERCEL_DEPLOYMENT.md](file:///C:/Users/Syed%20Imran%20Hassan/Downloads/OLXClone/OLXClone/VERCEL_DEPLOYMENT.md) and [DEPLOYMENT.md](file:///C:/Users/Syed%20Imran%20Hassan/Downloads/OLXClone/OLXClone/DEPLOYMENT.md).

### Environment Variables

Make sure to set all required environment variables in your deployment platform:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure secret for JWT token generation
- `SESSION_SECRET`: A secure secret for session management
- `FRONTEND_URL`: Your frontend URL for CORS configuration

## 🔮 Future Enhancements

- Real-time chat system
- Payment integration
- Advanced user profiles
- Admin dashboard
- Push notifications
- Social media integration
- Mobile app with React Native

---

**Built with ❤️ using Modern Web Technologies**
