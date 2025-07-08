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
- July 08, 2025. SSL certificate optimization and security improvements
  - Fixed WebSocket CSP directive to be more specific (wss://*.replit.app, wss://*.replit.dev)
  - Added comprehensive SSL readiness check endpoint (/.well-known/ssl-check)
  - Enhanced health check endpoint with SSL status and security information
  - Updated HTTPS enforcement to allow well-known endpoints for SSL validation
  - Cleaned up HTTP references in documentation files
  - Added production SSL certificate validation and monitoring capabilities
  - Improved security headers configuration for better SSL certificate compatibility
- July 08, 2025. Added MIT License and comprehensive README documentation
  - Created MIT License file with copyright to Ameya Kawthalkar (2025)
  - Generated comprehensive README.md with full project documentation:
    - Complete feature overview and architecture explanation
    - Installation and quick start guide with prerequisites
    - API documentation for all endpoints
    - Development guidelines and contribution instructions
    - Security features documentation
    - Educational use disclaimer and important notices
    - Future roadmap and acknowledgments
  - Updated project documentation to reflect open-source nature
  - Added proper licensing information for educational and research use
- July 08, 2025. Complete security implementation and toast system removal
  - Removed ALL toast messages from the entire React application (60+ locations)
  - Implemented comprehensive security middleware for production deployment:
    - HTTPS enforcement with automatic redirect middleware
    - Content Security Policy (CSP) headers with strict directives
    - HTTP Strict Transport Security (HSTS) with 1-year max-age
    - CORS configuration with origin validation for Replit domains
    - Rate limiting on all API endpoints (general/API/AI/upload tiers)
    - Input validation and sanitization using express-validator
    - File upload security with MIME type validation
    - Session security with secure cookie configuration
    - HTTP Parameter Pollution (HPP) protection
    - X-Content-Type-Options, X-Frame-Options, X-XSS-Protection headers
    - Permissions Policy for geolocation, microphone, camera restrictions
  - Enhanced error handling with production-safe error messages
  - Added health check endpoint for monitoring
  - Replaced all toast notifications with console logging and error state management
  - Fixed security configuration issues with helmet CSP directives
  - Application now ready for production deployment with enterprise-level security
- July 07, 2025. Contact page optimization and secure email implementation
  - Removed "Support the Project" panel completely for cleaner interface
  - Deleted X Twitter reference and social media promotion elements
  - Implemented secure contact form using Formspree for user feedback
  - Added professional feedback form with name, email, and message fields
  - Integrated NHS blue theme styling with proper focus states for form elements
  - Cleaned up unused icon imports (Heart, Coffee) from contact page
  - Fixed Formspree endpoint to use proper form ID (movwojpk)
  - Removed template examples array from groqService.ts for cleaner AI prompting
  - Simplified AI template selection to work dynamically without hardcoded examples
- July 07, 2025. UI streamlining, About page enhancement, and workflow documentation
  - Removed "How It Was Built" page from sidebar navigation for cleaner interface
  - Added instructional text to main page below chat box explaining template naming conventions
  - Created comprehensive About page with detailed Core Workflow section (4-step process documentation)
  - Added About Me section and Educational/Research Use disclaimer with HIPAA/GDPR compliance notice
  - Enhanced About page with visual step-by-step workflow using numbered badges and icons
  - Documented Wilhelm's sub-3-second report generation process with technical details
- July 07, 2025. Wilhelm logo integration, SEO optimization, and modern landing page redesign
  - Integrated Wilhelm logo across all pages: landing page, header, sidebar, and navigation
  - Removed animation from Wilhelm logo for cleaner, more professional appearance
  - Redesigned landing page with modern NHS blue color scheme and elegant animations
  - Implemented different shades of NHS blue throughout the interface (nhs-blue, nhs-dark-blue, nhs-light-blue, nhs-accent-blue)
  - Enhanced feature cards with NHS blue gradients and improved hover effects
  - Updated call-to-action sections with larger buttons and improved spacing
  - Created sophisticated background with multiple gradient orbs using NHS color palette
  - Improved button styling with enhanced gradients and smooth transitions
  - Enhanced Wilhelm logo size (w-28 h-28 md:w-32 md:h-32) and heading size (text-7xl md:text-8xl)
  - Changed Wilhelm heading to pure white text for better readability
  - Updated button text: "Get Started" → "Start Reporting", "Start Your Journey" → "Start Reporting"
  - Systematically cleaned up UI by removing secondary "Learn More" button for streamlined interface
  - Made all subheadings, card text, and feature descriptions bold on landing page for stronger visual impact
  - Applied bold font weight to footer text across all pages (home, chat, reports, landing) for consistency
  - Added comprehensive SEO meta tags optimized for medical imaging keywords
  - Created sitemap.xml for search engine crawling with medical imaging focus
  - Implemented robots.txt with AI crawler guidelines for better LLM discovery
  - Added structured data (JSON-LD) for medical software application
  - Created manifest.json for progressive web app capabilities
  - Added browserconfig.xml for Windows tile integration
  - Enhanced meta tags with medical-specific keywords: CT, MRI, X-ray, ultrasound, nuclear medicine
  - Optimized Open Graph and Twitter Card meta tags for social media sharing
  - Added preconnect links for performance optimization
  - Implemented medical AI discovery meta tags for healthcare professionals
  - Added comprehensive favicon and app icon support
  - Enhanced landing page content with medical imaging terminology
- July 07, 2025. Complete mobile responsive UI and landing page redesign
  - Fixed database schema: made templateId nullable to allow generated reports without template association
  - Enhanced GeneratedReportViewer with full rich text editor functionality and formatting preservation
  - Added undo/redo buttons with keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
  - Implemented automatic formatting preservation for generated reports (markdown to HTML conversion)
  - Updated sidebar: changed "Home" to "Report", centered "More Features" button
  - Enhanced reports page with date categorization (Today, Yesterday, specific dates)
  - Fixed report saving functionality with proper data structure
  - Added comprehensive toolbar with colors, alignment, headers, lists, and formatting options
  - Reports page improvements: removed edit functionality, kept only view/copy/delete buttons
  - Simplified report naming: changed from "Generated Report - [date]" to just date/time format
  - Improved main page UI responsiveness when sidebar expands
  - Added delete functionality with proper confirmation and error handling
  - Enhanced copy functionality to strip HTML tags for plain text copying
  - Completely overhauled mobile responsive design for rich text editors:
    - Enhanced ReactQuill with mobile-optimized toolbar (larger touch targets, horizontal scrolling)
    - Improved font sizes (16px minimum) to prevent mobile zoom-in behavior
    - Sticky toolbar positioning for better mobile navigation
    - Optimized dialog sizing with proper viewport handling
    - Enhanced touch scrolling with -webkit-overflow-scrolling: touch
    - Flexible button layouts that adapt to screen size
  - Redesigned landing page with modern animations and sleek design:
    - Added animated background elements with floating orbs and gradients
    - Implemented smooth fade-in animations with staggered timing
    - Enhanced feature cards with hover effects and gradient icons
    - Added "Why Choose Wilhelm?" section with animated feature highlights
    - Created comprehensive final CTA section with gradient buttons
    - Improved mobile responsiveness across all landing page elements
    - Added custom CSS animations (float, glow, pulse effects)
  - Implemented advanced scrollbar functionality for all rich text editors:
    - Added comprehensive scrollbar support for both horizontal and vertical scrolling
    - Implemented sticky toolbar with scrollable content area
    - Created custom scrollbar styling for WebKit browsers (Chrome, Safari, Edge)
    - Added Firefox support with standard scrollbar properties
    - Enhanced mobile scrolling with touch-friendly scrollbars and proper sizing
    - Applied scrollable-editor class to all three ReactQuill instances
    - Optimized dialog sizing and container layouts for better scroll behavior
- July 07, 2025. Enhanced document processing and rich text editor
  - Fixed .doc file text extraction with multiple encoding methods (latin1, utf-8, binary)
  - Enhanced .docx file processing to preserve HTML formatting for rich text editor
  - Updated rich text editor with expanded toolbar (colors, alignment, blockquotes, code blocks)
  - Removed category field completely from templates and all AI prompts
  - Improved template content display in rich text editor with proper HTML support
  - Added comprehensive formatting preservation from original documents
  - Fixed rich text editor height issue - now shows full content without cut-off
  - Added superscript/subscript formatting buttons
  - Removed code block button and added undo/redo functionality
  - Enhanced keyboard shortcuts support (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
  - Improved CSS styling for better editor visibility and scrolling
  - Implemented optimal AI parameters: temperature=0.1, top_p=0.6-0.7 for consistent output
  - Added Llama Guard 3 8B content moderation for input/output safety (temporarily disabled due to model deprecation)
  - Enhanced document processing with word-extractor library for .doc files
  - Removed blockquote and unwanted toolbar buttons completely
  - Fixed undo/redo functionality with custom buttons and proper visual separation
  - Updated sidebar navigation: removed Settings, added How To Use, How It Was Built, About, Contact at bottom
  - Centered chat interface on home page for better user experience
- July 07, 2025. Advanced template management with full folder organization
  - Fixed .doc file upload issues by filtering out binary characters that cause UTF-8 database errors
  - Added comprehensive folder organization system with backend API endpoints:
    - PATCH /api/templates/:id/folder - Move templates between folders
    - GET /api/folders - Get folder counts
    - DELETE /api/folders/:name - Delete folders (moves templates to General)
  - Created AdvancedTemplateManager component with complete folder operations:
    - Drag and drop templates between folders
    - Cut/copy/paste functionality for templates
    - Visual clipboard indicator showing cut/copied templates
    - Folder deletion with template preservation (moves to General)
    - Template context menus with copy/cut/delete options
    - Real-time folder highlighting during drag operations
    - Folder creation with keyboard shortcuts (Enter key)
  - Enhanced UX with visual feedback:
    - Drag over highlighting for target folders
    - Template count badges on folders
    - Paste buttons appear when clipboard has content
    - Smooth animations and transitions
  - Fixed FormData upload mechanism and ES module imports
  - Database schema supports folder field with proper relationships
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