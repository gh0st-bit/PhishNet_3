# Architecture

## Overview

This repository is a full-stack web application for phishing simulation and security awareness training. It's built with a Node.js Express backend and a React frontend, using a PostgreSQL database (via Neon's serverless Postgres) for data storage.

The application follows a client-server architecture with a RESTful API. The frontend is built with React, leveraging modern UI patterns with shadcn/ui components. The backend uses Express.js with a structured approach to routing and database access.

## System Architecture

### High-Level Components

```
┌─────────────────┐    ┌───────────────────┐    ┌─────────────────┐
│                 │    │                   │    │                 │
│  React Client   │◄──►│   Express Server  │◄──►│  PostgreSQL DB  │
│                 │    │                   │    │                 │
└─────────────────┘    └───────────────────┘    └─────────────────┘
```

The application consists of three primary layers:

1. **Client Layer** - React-based single-page application with shadcn/ui components
2. **Server Layer** - Express.js application handling API requests, authentication, and business logic
3. **Data Layer** - PostgreSQL database accessed via Drizzle ORM

### Development & Deployment Environment

The application is designed to be developed and deployed on Replit, as indicated by the `.replit` configuration file. This provides a consistent environment from development to production.

## Key Components

### Frontend Architecture

The frontend is built with React and follows a structured approach:

- **Component Organization**:
  - UI components based on shadcn/ui design system
  - Page components for different routes
  - Layout components for shared page structures
  - Custom hooks for shared functionality

- **State Management**:
  - React Query for server state management
  - React Context for global application state (auth)
  - Local component state for UI-specific concerns

- **Routing**:
  - Uses Wouter for lightweight client-side routing
  - Protected routes enforcing authentication

- **Styling**:
  - Tailwind CSS for utility-first styling
  - CSS variables for theming (light/dark support)

### Backend Architecture

The backend follows a structured Express.js application pattern:

- **Entry Point**: `server/index.ts` initializes the Express application
- **Routing**: API routes defined in `server/routes.ts`
- **Authentication**: Passport.js with local strategy in `server/auth.ts`
- **Database Access**: Abstracted through `server/storage.ts`
- **Database Connection**: Neon serverless Postgres in `server/db.ts`

### Data Storage

- **ORM**: Uses Drizzle for type-safe SQL queries and schema definition
- **Schema**: Defined in `shared/schema.ts`
- **Key Entities**:
  - Organizations (multi-tenancy)
  - Users
  - Groups (for phishing targets)
  - Email Templates
  - SMTP Profiles
  - Landing Pages
  - Campaigns
  - Campaign Results

### Authentication

- **Session-based Authentication**:
  - Express-session with Postgres session store in production
  - Memory store for development
  - Passport.js for authentication strategy

- **Password Handling**:
  - Secure password hashing with scrypt
  - Timing-safe comparison for security

## Data Flow

### Authentication Flow

1. User submits login credentials to `/api/login`
2. Server validates credentials against stored hash
3. Session is established and stored in Postgres
4. Session ID cookie is sent to client
5. Subsequent requests include the session cookie
6. Server validates session for protected endpoints

### API Request Flow

1. Client makes API request with session cookie
2. Express middleware validates the session
3. Route handler processes the request
4. Database operations performed via Drizzle ORM
5. Response is formatted and returned to client

### Phishing Campaign Flow

1. Admin creates email templates, landing pages, and target groups
2. Admin configures and launches a campaign
3. System sends emails through configured SMTP profiles
4. User interactions (opens, clicks, submissions) are tracked
5. Results are stored and displayed in dashboard reports

## External Dependencies

### Frontend Dependencies

- **UI Framework**: React with shadcn/ui components
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Data Visualization**: Recharts
- **Date Handling**: date-fns
- **Styling**: Tailwind CSS
- **Rich Text Editing**: SunEditor

### Backend Dependencies

- **Server Framework**: Express.js
- **Authentication**: Passport.js with express-session
- **Database ORM**: Drizzle ORM
- **Database Connector**: Neon serverless PostgreSQL client
- **File Uploads**: Multer
- **CSV Parsing**: PapaParse
- **Validation**: Zod

## Deployment Strategy

The application is configured for deployment on Replit, with:

1. **Build Process**:
   - Frontend: Vite bundling for production-optimized assets
   - Backend: esbuild for Node.js server code

2. **Runtime Environment**:
   - Node.js 20 with PostgreSQL 16
   - Environment variables for configuration
   - Auto-scaling deployment target

3. **CI/CD**:
   - Replit handles deployment workflows
   - Build and run commands specified in `.replit` file

4. **Database**:
   - Neon serverless PostgreSQL database
   - Connection string provided via environment variables

5. **Security Considerations**:
   - HTTP-only session cookies
   - HTTPS in production environment
   - Secure password hashing
   - Session timeout for security

The application is structured to support both development and production environments, with appropriate configuration for each.