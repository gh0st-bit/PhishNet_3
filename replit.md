# PhishNet - Phishing Simulation Platform

## Overview

PhishNet is a comprehensive phishing simulation and cybersecurity awareness training platform designed to help organizations test and improve their security posture. The application allows administrators to create phishing campaigns, track employee responses, and provide educational resources to improve security awareness.

The system is built as a full-stack web application using modern technologies including React, Express.js, and PostgreSQL, with a focus on scalability, security, and user experience.

## System Architecture

### High-Level Architecture

The application follows a three-tier architecture pattern:

```
Frontend (React SPA) ↔ Backend (Express.js API) ↔ Database (PostgreSQL)
```

**Problem Addressed**: Need for a scalable, maintainable architecture that separates concerns and allows for independent development of frontend and backend components.

**Solution**: Implemented a RESTful API architecture with clear separation between presentation, business logic, and data layers.

**Alternatives Considered**: Monolithic architecture, but chose microservice-ready architecture for better scalability.

**Pros**: Clean separation of concerns, scalable, testable
**Cons**: Slightly more complex initial setup

### Database Redundancy Strategy

The system implements a robust database fallback mechanism:

- **Primary**: Cloud PostgreSQL (Neon Database)
- **Fallback**: Local PostgreSQL instance
- **Hybrid Option**: MongoDB in-memory storage for development

**Problem Addressed**: Database availability and development environment consistency.

**Solution**: Automatic fallback system that detects cloud database failures and switches to local storage.

**Pros**: High availability, consistent development experience
**Cons**: Data synchronization complexity

## Key Components

### Frontend Architecture

**Technology Stack**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: React Query for server state, React Context for auth
- **Routing**: Wouter (lightweight client-side router)
- **Forms**: React Hook Form with Zod validation

**Design Decisions**:
- Chose shadcn/ui for consistent, accessible components
- Implemented custom orange/grey dark theme for brand identity
- Used React Query for efficient server state management and caching

### Backend Architecture

**Technology Stack**: Express.js + TypeScript + Node.js
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy + express-session
- **Validation**: Zod schemas for runtime type checking
- **File Upload**: Multer for handling multipart data
- **Email Service**: SendGrid with fallback logging service

**Security Features**:
- Account lockout after failed login attempts
- Session timeout (10 minutes) with activity tracking
- Password complexity requirements
- CSRF protection through session-based auth

### Database Schema

**Core Entities**:
- **Organizations**: Multi-tenant support
- **Users**: Authentication and profile management
- **Groups**: Target group management for campaigns
- **Targets**: Individual recipients with custom fields
- **SMTP Profiles**: Email server configurations
- **Email Templates**: Customizable phishing email templates
- **Landing Pages**: Capture pages for phishing simulations
- **Campaigns**: Main simulation orchestration
- **Campaign Results**: Tracking and analytics

**Design Decisions**:
- Implemented soft multi-tenancy through organization_id foreign keys
- Used PostgreSQL for ACID compliance and complex queries
- Added audit fields (created_at, updated_at) for all entities

## Data Flow

### Authentication Flow
1. User submits credentials → Passport.js validation → Session creation
2. Subsequent requests → Session validation → Route access control
3. Auto-logout after 10 minutes of inactivity

### Campaign Creation Flow
1. Admin selects target group, email template, SMTP profile, landing page
2. System validates all components exist and are accessible
3. Campaign scheduled/launched → Emails sent via SMTP → Tracking begins
4. User interactions captured → Results aggregated → Reports generated

### Session Management
- Client-side activity tracking with automatic session extension
- Server-side session timeout with warning notifications
- Graceful logout with cleanup

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: Cloud PostgreSQL connection
- **@sendgrid/mail**: Email delivery service
- **@radix-ui/***: Accessible UI primitives
- **@tanstack/react-query**: Server state management
- **passport**: Authentication middleware
- **drizzle-orm**: Database ORM

### Development Dependencies
- **mongodb-memory-server**: In-memory database for testing
- **tsx**: TypeScript execution for development
- **vite**: Build tool and dev server
- **@replit/vite-plugin-***: Replit-specific tooling

### Fallback Services
- **Logging Email Service**: When SendGrid unavailable
- **MongoDB Storage**: When PostgreSQL unavailable
- **Memory Session Store**: When database sessions fail

## Deployment Strategy

**Target Platform**: Replit
- **Development**: `npm run dev` - Uses tsx for hot reloading
- **Production**: `npm run build && npm start` - Compiled bundle
- **Database**: Automatic provisioning through DATABASE_URL environment variable

**Build Process**:
1. Frontend: Vite builds React app to `dist/public`
2. Backend: ESBuild compiles server to `dist/index.js`
3. Assets: Static files served from build output

**Environment Configuration**:
- `NODE_ENV=development|production`
- `DATABASE_URL` for cloud database
- `LOCAL_DATABASE_URL` for fallback
- `SENDGRID_API_KEY` for email service

**Monitoring & Testing**:
- Admin panel includes database status monitoring
- Built-in database failure simulation for testing
- Session management testing tools

## Changelog

```
Changelog:
- July 13, 2025. Successfully migrated from Replit Agent to standard Replit environment
  - Configured PostgreSQL database with cloud fallback architecture  
  - Restored existing PhishNet database with 12 users and 3 organizations
  - Verified client-server separation and security practices
  - Application running successfully on port 5000 with proper environment setup
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```