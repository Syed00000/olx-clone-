# OLX-Style Marketplace Application

## Overview

This is a full-stack classified ads marketplace application built with modern web technologies. The application allows users to browse, search, and post classified advertisements across various categories like cars, properties, electronics, and more. It features a responsive design with a React frontend and Express.js backend, following the OLX marketplace model.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React with TypeScript and follows a component-based architecture:

- **Build System**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

The frontend follows a modular structure with reusable components, custom hooks, and a clear separation of concerns between UI components and business logic.

### Backend Architecture
The server-side uses Express.js with TypeScript for type safety:

- **API Design**: RESTful API endpoints for CRUD operations on listings
- **Request Handling**: Express middleware for JSON parsing, URL encoding, and request logging
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development**: Hot reload support with custom Vite integration for seamless development experience

The backend implements a clean API layer with proper error handling and logging for debugging and monitoring.

### Data Storage Solutions
The application uses a dual-storage approach:

- **Development Storage**: In-memory storage with mock data for rapid development and testing
- **Production Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Definition**: Shared TypeScript schemas using Drizzle and Zod for consistent data validation across frontend and backend

The database schema includes users and listings tables with support for JSON fields for flexible attributes and image arrays.

### Authentication and Authorization
Currently implements a basic user system with:

- **User Management**: User creation and retrieval endpoints
- **Session Handling**: Prepared for session-based authentication with PostgreSQL session store
- **Data Validation**: Zod schemas for user input validation and type safety

### Component Architecture
The UI is built with a comprehensive component library:

- **Base Components**: Buttons, inputs, cards, dialogs, and other primitive UI elements
- **Composite Components**: Product cards, header with search functionality, category selectors
- **Modal System**: Post creation flow with step-by-step category selection and form submission
- **Image Handling**: File upload components with preview functionality for listing images

### State Management Strategy
The application uses a modern state management approach:

- **Server State**: TanStack Query for caching, synchronization, and optimistic updates
- **Client State**: React useState and useContext for local component state
- **Form State**: React Hook Form for complex form state management with validation
- **URL State**: Wouter for navigation state and route parameters

## External Dependencies

### Database and ORM
- **PostgreSQL**: Primary database for production data storage
- **Neon Database**: Cloud PostgreSQL service for hosted database solutions
- **Drizzle ORM**: Type-safe database operations with automatic migration generation
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library following modern design principles

### Development and Build Tools
- **Vite**: Fast build tool with hot module replacement for development
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Integration between React Hook Form and Zod validation

### Development Experience
- **Replit Integration**: Custom plugins for development environment optimization
- **Runtime Error Overlay**: Better error reporting during development
- **Cartographer**: Enhanced debugging and development tools for Replit environment