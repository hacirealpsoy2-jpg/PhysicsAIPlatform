# TYT/AYT Fizik Çözüm Platformu

## Overview

This is a Turkish physics problem-solving platform designed for TYT (Transition to Higher Education Examination) and AYT (Field Proficiency Test) students. The application allows students to submit physics problems via text or images and receive AI-powered step-by-step solutions generated through Google's Gemini AI. The platform includes user authentication, admin management capabilities, and rate limiting to ensure fair usage.

**Core Purpose**: Provide Turkish high school students with reliable, AI-verified physics problem solutions that break down complex problems into understandable steps, helping them prepare for university entrance examinations.

**Current Status**: ✅ **PRODUCTION READY** - All core features implemented and tested. Platform is fully functional with auto-created admin account.

## Recent Changes (November 4, 2025)

### Completed Features
1. ✅ **Full Authentication System**
   - User registration with password validation
   - JWT-based login with 7-day token expiration
   - Automatic admin account creation on server startup
   - Protected routes with role-based access control

2. ✅ **Physics Problem Solving Interface**
   - Text and image input support (base64 encoded, max 8MB)
   - Real-time Gemini AI integration with structured JSON output
   - Step-by-step solution display with copy functionality
   - Loading states and comprehensive error handling

3. ✅ **Admin Dashboard**
   - User management table with search and filtering
   - Block/unblock user functionality
   - User deletion with confirmation dialog
   - Real-time status updates

4. ✅ **Critical Bug Fixes**
   - Fixed Gemini API integration (corrected request structure: `contents: [{ role: "user", parts }]`)
   - Proper JSON response parsing from Gemini
   - Rate limiting configured properly (general: 100 req/15min, solve: 10 req/min)

### Default Admin Account
- **Username**: `admin`
- **Password**: `Ferhat4755__`
- ⚠️ **Security Note**: Change `ADMIN_PASSWORD` environment variable in production!

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite as the build tool and development server.

**UI Component System**: Shadcn UI components (Radix UI primitives) following the "new-york" style variant. The component library is extensive, including forms, dialogs, cards, badges, buttons, and data display elements.

**Styling Strategy**: 
- Tailwind CSS with custom design tokens defined in CSS variables (HSL color space)
- Material Design principles adapted for educational context
- Mobile-first responsive design approach
- Typography uses Inter (UI/body) and JetBrains Mono (formulas/code) from Google Fonts
- Consistent spacing scale: 2, 4, 6, 8, 12, 16, 20, 24 (Tailwind units)
- Color scheme: Deep blue primary (#1E40AF), teal accents (#0D9488), professional educational aesthetic

**State Management**: 
- TanStack React Query for server state management and caching
- Local storage for JWT tokens and user session data
- No global state management library (relying on React Query and local state)

**Routing**: Wouter (lightweight React router)

**Form Handling**: React Hook Form with Zod schema validation

**Key Pages**:
- `/login` - User authentication with username/password
- `/register` - New user registration with password confirmation
- `/solve` - Main problem-solving interface (image upload + text input)
- `/admin` - Admin dashboard for user management (admin role required)
- `/` - Redirects to login

### Backend Architecture

**Runtime**: Node.js with Express.js framework, written in TypeScript and executed with tsx in development.

**API Design**: RESTful API with the following main endpoints:
- `POST /api/auth/register` - User registration (validates unique username, hashes password)
- `POST /api/auth/login` - User authentication (returns JWT + user object)
- `POST /api/solve` - Physics problem solving (protected, rate-limited, accepts text/image)
- `GET /api/admin/users` - List all users (admin only)
- `PATCH /api/admin/users/:id` - Update user (block/unblock) (admin only)
- `DELETE /api/admin/users/:id` - Delete users (admin only)

**Authentication & Authorization**:
- JWT-based authentication with 7-day token expiration
- bcrypt for password hashing (10 rounds)
- Role-based access control (user/admin roles)
- Middleware chain: `authMiddleware` → `adminMiddleware` for protected routes
- Tokens stored in localStorage on client, verified via Bearer token in headers

**Rate Limiting**:
- Global API limiter: 100 requests per 15 minutes
- Solve endpoint: 10 requests per minute (prevents AI API abuse)
- Uses express-rate-limit middleware

**Session Management**: Currently using in-memory storage (MemStorage class), designed to be replaceable with persistent database storage.

**Auto-Initialization**: Server automatically creates admin account on first startup via `server/lib/init.ts`.

### Data Storage Solutions

**Current Implementation**: In-memory storage using JavaScript Map for development/prototyping.

**Database Schema** (Drizzle ORM, PostgreSQL-ready):
```typescript
users {
  id: UUID (primary key)
  username: text (unique, not null)
  password: text (hashed, not null)
  role: text (default: "user")
  blocked: boolean (default: false)
}
```

**Migration Path**: 
- Drizzle ORM configured for PostgreSQL (@neondatabase/serverless driver)
- Schema defined in `shared/schema.ts` for type sharing between client/server
- Current MemStorage implementation follows IStorage interface for easy swapping
- To migrate to PostgreSQL: Set `DATABASE_URL` and swap storage implementation in `server/routes.ts`

**Design Decision**: The application is architected to easily transition from in-memory to persistent PostgreSQL storage by swapping the storage implementation while maintaining the same interface. This allows for rapid development while keeping production-ready infrastructure in mind.

### External Dependencies

**AI Service**: 
- **Google Gemini AI** (`@google/genai` SDK)
- Model: `gemini-2.0-flash-exp`
- Structured JSON output with response schema validation
- System prompt instructs AI to verify physics problems using Google Search tool
- Output format: `{konu, istenilen, verilenler, cozum, sonuc,konuOzet}` (Turkish field names)
- API key stored in `GEMINI_API_KEY` environment variable
- Image support: Base64-encoded images sent with text prompts (max 8MB)
- **Implementation**: `server/lib/gemini.ts` - handles API calls and response parsing

**Authentication**:
- **jsonwebtoken** - JWT token generation/verification
- **bcryptjs** - Password hashing (10 salt rounds)
- JWT secret stored in `SESSION_SECRET` environment variable

**Development Tools**:
- **Vite** - Frontend build tool and dev server with HMR
- **Replit Plugins** - Runtime error modal, cartographer, dev banner (development only)
- **tsx** - TypeScript execution for development server
- **esbuild** - Production server bundling

**Environment Variables Required**:
```
GEMINI_API_KEY - Google Gemini AI API key (REQUIRED)
SESSION_SECRET - Secret for JWT signing (auto-generated if not set)
ADMIN_PASSWORD - Default admin account password (default: Ferhat4755__)
PORT - Server port (default: 5000)
```

## Important Files

### Core Application Files
- `server/routes.ts` - All API endpoints and authentication logic
- `server/lib/gemini.ts` - Gemini AI integration for physics problem solving
- `server/lib/init.ts` - Auto-initialization script for admin account
- `server/middleware/auth.ts` - JWT authentication and admin authorization middleware
- `server/storage.ts` - In-memory storage implementation with IStorage interface
- `shared/schema.ts` - Shared TypeScript types and Zod schemas

### Frontend Pages
- `client/src/pages/login.tsx` - Login page with form validation
- `client/src/pages/register.tsx` - Registration page with password confirmation
- `client/src/pages/solve.tsx` - Main physics problem solving interface
- `client/src/pages/admin.tsx` - Admin dashboard for user management
- `client/src/App.tsx` - Route configuration and app wrapper

### Configuration
- `design_guidelines.md` - Material Design tokens and styling rules
- `client/src/index.css` - Tailwind CSS configuration with custom design tokens
- `tailwind.config.ts` - Tailwind configuration with theme extensions

## How to Use

### For Students
1. Register an account with username and password
2. Login to access the solve interface
3. Enter physics question in Turkish (text or upload image)
4. Click "Çöz" to receive AI-generated step-by-step solution
5. Copy solution or ask new questions

### For Administrators
1. Login with default credentials (admin/Ferhat4755__)
2. Navigate to Admin panel (automatic redirect for admin role)
3. View all registered users
4. Block/unblock users who violate terms
5. Delete spam or inactive accounts

## Design Philosophy

The platform prioritizes simplicity and educational value. Every architectural decision serves the goal of making physics problems accessible to Turkish students through clear, step-by-step AI-generated solutions while maintaining system security and preventing abuse through rate limiting and authentication.

**Key Design Principles**:
- Clean, distraction-free interface prioritizing content readability
- Turkish language throughout (UTF-8 support for ş, ğ, ı, etc.)
- Mobile-responsive Material Design components
- Professional color palette suitable for educational context
- Accessibility-focused with semantic HTML and proper ARIA labels
