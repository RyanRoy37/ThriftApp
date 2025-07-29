# ThriftShare - Sustainable Fashion Community Platform

## Overview

ThriftShare is a mobile-first social platform focused on sustainable fashion. Users can share thrift finds, rent clothing items, earn eco-points for sustainable actions, and connect with like-minded individuals in the sustainable fashion community.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite build system
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with custom eco-friendly color palette
- **Mobile-First Design**: Optimized for mobile devices with responsive layouts

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Replit OAuth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **File Uploads**: Multer for handling image uploads

### Key Design Decisions
- **Monorepo Structure**: Client, server, and shared code in a single repository for easier development
- **Type Safety**: Shared TypeScript types between frontend and backend via shared schema
- **Mobile-First**: Bottom navigation and card-based UI optimized for mobile experience
- **Real-time Updates**: React Query for optimistic updates and cache invalidation

## Key Components

### Authentication System
- Replit OAuth integration for seamless user authentication
- Session-based authentication with secure cookie storage
- Automatic token refresh and user session management
- Protected routes with authentication middleware

### Post Management
- Image upload functionality with file validation (5MB limit, images only)
- Rich post metadata including thrift store info, pricing, brands, and sustainability metrics
- Like/unlike functionality with optimistic updates
- Comment system for user engagement

### Rental System
- Posts can be marked as available for rent
- Rental request system with messaging between users
- Status tracking for rental requests (pending, approved, declined)
- Integration with user profiles for rental history

### Gamification & Sustainability Tracking
- Eco-points system to reward sustainable actions
- Badge system for achievements
- Water saved, carbon reduced, and items reused metrics
- Progress tracking with visual indicators

### User Profiles
- Comprehensive user stats including sustainability metrics
- Post history and rental activity
- Badge collection display
- Profile customization with bio and location

## Data Flow

### Post Creation Flow
1. User uploads image and fills form data
2. Multer processes file upload to server storage
3. Post data is validated against Drizzle schema
4. Database insertion with automatic ID generation
5. React Query cache invalidation triggers UI updates

### Authentication Flow
1. User clicks login, redirected to Replit OAuth
2. OAuth callback processes user claims
3. User session is created and stored in PostgreSQL
4. Frontend receives user data via /api/auth/user endpoint
5. Protected routes are unlocked based on auth state

### Real-time Updates
1. User actions trigger optimistic UI updates
2. API requests are made in background
3. React Query manages cache invalidation
4. UI reflects server state once API calls complete
5. Error handling reverts optimistic updates if needed

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management
- **passport & openid-client**: OAuth authentication
- **express-session**: Session management
- **multer**: File upload handling

### UI & Styling
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **drizzle-kit**: Database migration tools
- **@replit/vite-plugin-***: Replit-specific development plugins

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Database migrations via drizzle-kit push
- Replit-specific development banner and error handling

### Production Build
- Vite builds optimized frontend bundle to dist/public
- ESBuild compiles server TypeScript to dist/index.js
- Static file serving from built frontend
- Environment-based configuration (NODE_ENV, DATABASE_URL, SESSION_SECRET)

### Database Management
- Drizzle migrations stored in ./migrations directory
- Schema definitions in shared/schema.ts for type safety
- Automatic table creation for sessions and application data
- PostgreSQL connection pooling via Neon

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPL_ID**: Replit environment identifier
- **ISSUER_URL**: OAuth issuer (defaults to Replit)
- **REPLIT_DOMAINS**: Allowed domains for OAuth