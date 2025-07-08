import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import cors from "cors";
import compression from "compression";
import hpp from "hpp";
import { Request, Response, NextFunction } from "express";

// HTTPS Redirect Middleware
export function enforceHTTPS(req: Request, res: Response, next: NextFunction) {
  // Allow well-known endpoints for SSL validation
  if (req.url.startsWith('/.well-known/') || req.url === '/health') {
    return next();
  }
  
  // Only enforce HTTPS in production and only on Replit domains
  const host = req.get("host");
  const isReplitDomain = host && (host.includes('.replit.app') || host.includes('.replit.dev'));
  
  if (process.env.NODE_ENV === "production" && isReplitDomain && !req.secure && req.get("x-forwarded-proto") !== "https") {
    const httpsUrl = `https://${req.get("host")}${req.url}`;
    return res.redirect(301, httpsUrl);
  }
  next();
}

// Security Headers Configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://apis.replit.com", "https://replit.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.groq.com", "https://console.groq.com", "https://apis.replit.com", "wss://*.replit.app", "wss://*.replit.dev", "https://*.replit.app", "https://*.replit.dev", "https://wilhelmai.net", "https://www.wilhelmai.net"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'", "https://formspree.io"]
    }
  } : {
    // Development CSP - more permissive for local development
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", "https://apis.replit.com", "https://replit.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:", "http:", "https:", "https://api.groq.com", "https://console.groq.com", "https://apis.replit.com", "wss://*.replit.app", "wss://*.replit.dev", "https://*.replit.app", "https://*.replit.dev"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'", "https://formspree.io"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: process.env.NODE_ENV === "production" ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
  noSniff: true,
  frameguard: process.env.NODE_ENV === "production" ? { action: 'deny' } : false,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

// CORS Configuration
export const corsOptions = cors({
  origin: process.env.NODE_ENV === "production" 
    ? function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          /\.replit\.dev$/,
          /\.replit\.app$/,
          /^https:\/\/[a-zA-Z0-9\-]+\.replit\.dev$/,
          /^https:\/\/[a-zA-Z0-9\-]+\.replit\.app$/,
          'https://wilhelmai.net',
          'https://www.wilhelmai.net'
        ];
        
        const isAllowed = allowedOrigins.some(pattern => {
          if (pattern instanceof RegExp) {
            return pattern.test(origin);
          }
          return pattern === origin;
        });
        
        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : true, // Allow all origins in development,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
});

// Rate Limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased limit for general requests
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks, static files, and in development
    return req.path === '/health' || req.path.startsWith('/assets/') || process.env.NODE_ENV === "development";
  }
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit for API requests
  message: {
    error: "Too many API requests from this IP, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development";
  }
});

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // Increased limit for AI requests - more generous for development
  message: {
    error: "Too many AI requests from this IP, please slow down.",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development";
  }
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Increased limit for uploads - more generous for development
  message: {
    error: "Too many upload requests from this IP, please slow down.",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development";
  }
});

// Input Validation Middleware
export const validateTextInput = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 50000 })
    // Removed .escape() to allow AI-generated content with special characters
    .withMessage('Content must be between 1 and 50000 characters'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    // Removed .escape() to allow special characters in titles
    .withMessage('Title must be between 1 and 200 characters'),
];

export const validateReportInput = [
  body('findings')
    .trim()
    .isLength({ min: 1, max: 10000 })
    // Removed .escape() to allow medical terminology and AI-generated content
    .withMessage('Findings must be between 1 and 10000 characters'),
];

export const validateIdParam = [
  body('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
];

// Validation Error Handler
export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array()
    });
  }
  next();
}

// Request Sanitization
export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
  // Remove null bytes and other dangerous characters
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/\0/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[sanitizeString(key)] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
}

// Additional Security Middleware
export const additionalSecurity = [
  compression(), // Gzip compression
  hpp(), // HTTP Parameter Pollution protection
  
  // X-Content-Type-Options
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  },
  
  // X-Frame-Options
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  },
  
  // X-XSS-Protection
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  },
  
  // Permissions Policy
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Permissions-Policy', 
      'geolocation=(), microphone=(self), camera=(), payment=(), usb=()');
    next();
  },
  
  // Secure session cookies
  (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'production') {
      res.cookie = new Proxy(res.cookie, {
        apply: function(target, thisArg, argumentsList) {
          if (argumentsList[2]) {
            argumentsList[2] = {
              ...argumentsList[2],
              secure: true,
              httpOnly: true,
              sameSite: 'strict'
            };
          }
          return target.apply(thisArg, argumentsList);
        }
      });
    }
    next();
  }
];

// Error handling middleware
export function securityErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Don't expose error details in production
  if (process.env.NODE_ENV === 'production') {
    console.error('Security error:', err);
    return res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
  
  next(err);
}

// File upload security
export const fileUploadSecurity = {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    // No file count limit - users can upload unlimited templates
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Only allow specific file types
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain', // .txt
      'audio/webm', // .webm
      'audio/webm;codecs=opus', // .webm with opus codec
      'audio/mp3', // .mp3
      'audio/wav', // .wav
      'audio/mpeg', // .mp3
      'audio/ogg', // .ogg
      'audio/x-wav', // .wav alternative
      'audio/wave' // .wav alternative
    ];
    
    // Check if the MIME type is allowed or if it starts with audio/
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents and audio files are allowed.'));
    }
  }
};