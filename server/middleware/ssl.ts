import { Request, Response, NextFunction } from "express";

/**
 * Enhanced SSL/HTTPS middleware for Replit deployment
 * Handles SSL termination at various proxy levels
 */
export function detectHTTPS(req: Request): boolean {
  // Check multiple headers that indicate HTTPS
  return req.secure || 
         req.headers['x-forwarded-proto'] === 'https' ||
         req.headers['x-forwarded-ssl'] === 'on' ||
         req.headers['x-forwarded-scheme'] === 'https' ||
         req.headers['cloudfront-forwarded-proto'] === 'https' ||
         req.headers['x-arr-ssl'] !== undefined ||
         req.headers['x-forwarded-port'] === '443';
}

/**
 * Middleware to handle SSL-related headers and redirects
 */
export function enhancedSSLMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip for health checks and well-known endpoints
  if (req.url.startsWith('/.well-known/') || req.url === '/health') {
    return next();
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const isHTTPS = detectHTTPS(req);

  if (isProduction) {
    // Add security headers for all responses
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Redirect to HTTPS if not already secure
    if (!isHTTPS) {
      const httpsUrl = `https://${req.get('host')}${req.url}`;
      return res.redirect(301, httpsUrl);
    }
  }

  next();
}

/**
 * Middleware to force secure cookies in production
 */
export function secureSessionMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'production') {
    const originalCookie = res.cookie;
    res.cookie = function(name: string, value: any, options: any = {}) {
      options.secure = true;
      options.httpOnly = true;
      options.sameSite = 'strict';
      return originalCookie.call(this, name, value, options);
    };
  }
  next();
}