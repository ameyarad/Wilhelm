# Wilhelm - Free and Open Source Medical Imaging Reporting AI Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

> An advanced AI-powered radiology reporting platform designed to streamline medical documentation through intelligent template management and AI-generated reports.

## ⚠️ Important Notice

**FOR EDUCATIONAL AND RESEARCH PURPOSES ONLY**

Wilhelm is designed for educational and research purposes. It is not intended for clinical use and should not be used for actual patient care. Always consult with qualified healthcare professionals for medical decisions.

## 🚀 Features

- **AI-Powered Transcription**: Voice-to-text conversion using Groq's Whisper API
- **Intelligent Report Generation**: AI-generated radiology reports with template matching
- **Advanced Template Management**: Organize templates by folders with drag-and-drop functionality
- **Rich Text Editor**: Full-featured editor with formatting, colors, and styling options
- **Multi-language Support**: Generate reports in 8 languages (English, French, German, Hindi, Italian, Spanish, Portuguese, Thai)
- **Real-time Chat Interface**: Interactive AI assistant for report generation
- **Responsive Design**: Mobile-optimized interface with NHS blue theme
- **Secure Authentication**: Replit Auth with OpenID Connect integration
- **Enterprise Security**: Production-ready security with HTTPS enforcement, CSP headers, and rate limiting

## 🏗️ Architecture

### Full-Stack Technology Stack

- **Frontend**: React 18 with TypeScript, Vite build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **AI Services**: Groq API for transcription and report generation
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state management

### Project Structure

```
wilhelm/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express.js backend API
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   └── routes.ts          # API route definitions
├── shared/                # Shared TypeScript schemas
│   └── schema.ts          # Database schema and types
└── public/                # Static assets
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16 or higher
- PostgreSQL database
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wilhelm.git
   cd wilhelm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/wilhelm
   GROQ_API_KEY=your_groq_api_key_here
   SESSION_SECRET=your_session_secret_here
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173` (development) or `https://your-domain.replit.app` (production)

## 📚 Usage

### Core Workflow

1. **Voice Recording**: Use the microphone to record clinical findings
2. **AI Transcription**: Automatic conversion of speech to text
3. **Template Selection**: AI intelligently selects appropriate templates
4. **Report Generation**: AI generates comprehensive radiology reports
5. **Review and Edit**: Use the rich text editor to refine reports
6. **Save and Manage**: Organize reports with categorization and search

### Template Management

- **Upload Templates**: Support for .docx, .doc, and .txt files
- **Folder Organization**: Organize templates by imaging modality or anatomy
- **Drag and Drop**: Intuitive template management interface
- **Rich Text Editing**: Full-featured editor for template customization

### Voice Recording

- **High-Quality Transcription**: Optimized for medical terminology
- **Context Isolation**: Each recording session is independent
- **Multiple Audio Formats**: Support for various audio file types

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate database migrations

### Technology Choices

- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **React Query**: Efficient server state management
- **Wouter**: Lightweight client-side routing
- **Zod**: Runtime type validation
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components

### Security Features

- HTTPS enforcement with automatic redirect
- Content Security Policy (CSP) headers
- HTTP Strict Transport Security (HSTS)
- Rate limiting on all API endpoints
- Input validation and sanitization
- Secure session management
- File upload security with MIME type validation

## 📖 API Documentation

### Authentication Endpoints

- `GET /api/auth/login` - Initiate authentication
- `GET /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/logout` - Logout user

### Template Endpoints

- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create new template
- `PATCH /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `PATCH /api/templates/:id/folder` - Move template to folder

### Report Endpoints

- `GET /api/reports` - Get user reports
- `POST /api/reports` - Create new report
- `PATCH /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### AI Services

- `POST /api/ai/transcribe` - Transcribe audio to text
- `POST /api/ai/generate-report` - Generate radiology report
- `POST /api/ai/select-template` - AI template selection

## 🤝 Contributing

Wilhelm welcomes contributions from the medical and developer communities!

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use the existing component patterns
- Write comprehensive tests
- Update documentation for new features
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ameya Kawthalkar**
- Created Wilhelm as an educational tool for radiology trainees and radiologists
- Wilhelm is intended to spur the creation of more open source solutions to streamline medical imaging workflows

## 🙏 Acknowledgments

Built with ❤️ by a radiologist for radiologists and professionals practising medical imaging around the world

## 📞 Support

For questions, feedback, or contributions:
- Open an issue on GitHub
- Contact through the application's contact form


## 🔮 Future Roadmap

- [ ] GDPR and HIPAA compliant local free and open source model
- [ ] DICOM reader integration 
- [ ] In-built template library
---

**Remember**: Wilhelm is for educational and research purposes only. Always consult qualified healthcare professionals for medical decisions.
