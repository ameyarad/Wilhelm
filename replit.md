# Wilhelm - AI-Powered Radiology Reporting Platform

## Overview

Wilhelm is a comprehensive AI-powered radiology reporting platform designed to streamline the creation and management of radiology reports. The application combines advanced voice recognition, AI-generated reports, and template management to enhance radiologist workflow efficiency.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **AI Services**: Groq API for transcription (Whisper) and report generation
- **Styling**: Tailwind CSS with shadcn/ui components

### Monorepo Structure
The project follows a monorepo pattern with shared TypeScript definitions:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript schemas and types

## Key Components

### Frontend Architecture
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **State Management**: React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom NHS-themed color scheme
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **API Layer**: RESTful API with Express.js
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with OpenID Connect strategy
- **Session Management**: PostgreSQL-backed session store
- **File Upload**: Multer for handling audio file uploads

### Database Schema
- **Users**: Core user information with Replit Auth integration
- **Templates**: Radiology report templates with categories
- **Reports**: Generated reports with metadata
- **Chat Messages**: Conversation history for AI interactions
- **Sessions**: Authentication session storage

## Data Flow

### Voice Recording and Transcription
1. User records voice using browser MediaRecorder API
2. Audio data sent to backend via multipart form upload
3. Backend processes audio through Groq Whisper API
4. Transcribed text returned to frontend for review

### AI Report Generation
1. User provides clinical findings (via voice or text)
2. System fetches available templates from database
3. Groq AI processes findings against templates
4. Generated report returned with template selection reasoning
5. Report saved to database with user association

### Template Management
1. Default templates initialized on server startup
2. Users can upload custom templates via file upload
3. Templates categorized by imaging type (CT, MRI, X-ray, etc.)
4. Templates available for AI report generation

## External Dependencies

### AI Services
- **Groq API**: Primary AI service for both transcription and text generation
- **Whisper Large V3 Turbo**: Speech-to-text transcription
- **Llama/Mixtral Models**: Report generation and template matching

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Connection Pooling**: Optimized database connections

### Authentication
- **Replit Auth**: OAuth2/OpenID Connect provider
- **Passport.js**: Authentication middleware
- **Session Store**: PostgreSQL-based session persistence

### UI/UX
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation utilities

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend
- **TSX**: TypeScript execution for backend
- **Concurrent Development**: Frontend and backend run simultaneously

### Production Build
- **Frontend**: Vite build with static asset optimization
- **Backend**: esbuild compilation to ES modules
- **Asset Serving**: Express serves built frontend assets

### Environment Configuration
- **Database URL**: PostgreSQL connection string
- **Groq API Key**: AI service authentication
- **Session Secret**: Secure session encryption
- **Replit Auth**: OAuth provider configuration

## Changelog

```
Changelog:
- July 07, 2025. Template management with folder organization
  - Fixed .doc file upload issues by filtering out binary characters that cause UTF-8 database errors
  - Added folder organization system with "folder" column in templates table
  - Created FolderTemplateManager component with:
    - Folder selection dropdown for organizing templates
    - "New Folder" button to create custom folders
    - Templates grouped and displayed by folder
    - Folder creation with validation
  - Fixed FormData upload mechanism using fetch directly instead of apiRequest
  - Changed mammoth import to ES module syntax (await import) to fix require errors
  - Database schema updated to include folder field with default "General"
  - Templates now properly organized in folders with visual folder indicators
- July 07, 2025. Complete NHS blue theme implementation & voice recording fixes
  - Removed all green colors, implemented NHS blue color palette
  - Sidebar collapsed by default with "More Features" button
  - Wilhelm logo moved to top navigation bar
  - Removed system status panel and cleaned up interface text
  - Added "Get Started" button to landing page
  - Updated sidebar labels: "Templates" → "My Templates", "Report History" → "Saved Reports"
  - Compact footer design across all pages
  - Security audit completed - authentication and database properly implemented
  - GROQ_API_KEY configured for AI transcription and report generation
  - Fixed voice recording context bleeding issues:
    - Clear transcript state between recordings
    - Generate unique filenames for each audio file
    - Remove language parameter from Whisper API calls
    - Add cache-busting headers to prevent context carryover
    - Create fresh MediaRecorder instances for complete isolation
- July 06, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```