import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import {
  enforceHTTPS,
  securityHeaders,
  corsOptions,
  generalRateLimit,
  additionalSecurity,
  sanitizeRequest,
  securityErrorHandler
} from "./middleware/security";
import { enhancedSSLMiddleware, secureSessionMiddleware } from "./middleware/ssl";
import { applySecurityHeaders, validateHTTPS } from "./middleware/securityConfig";
import { httpsRedirectMiddleware } from "./middleware/httpsRedirect";

// Handle self-signed certificate errors in development
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = express();

// Trust proxy for Replit deployments
if (process.env.NODE_ENV === "production") {
  app.set('trust proxy', true);
}

// Security middleware - minimal for development, full for production
if (process.env.NODE_ENV === "production") {
  app.use(httpsRedirectMiddleware); // HTTPS redirect first
  app.use(validateHTTPS); // Validate HTTPS
  app.use(applySecurityHeaders); // Apply comprehensive security headers
  app.use(secureSessionMiddleware); // Secure session cookies
  app.use(enhancedSSLMiddleware); // Enhanced SSL handling for Replit deployment
  app.use(securityHeaders);
  app.use(generalRateLimit);
  app.use(...additionalSecurity);
}
app.use(corsOptions);
app.use(sanitizeRequest);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Security error handler
  app.use(securityErrorHandler);
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? "Internal Server Error" 
      : err.message || "Internal Server Error";

    res.status(status).json({ 
      message,
      timestamp: new Date().toISOString()
    });
    
    if (process.env.NODE_ENV !== 'production') {
      throw err;
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
