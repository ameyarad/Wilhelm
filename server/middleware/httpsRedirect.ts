import { Request, Response, NextFunction } from "express";

/**
 * Comprehensive HTTPS redirect middleware
 * Handles various proxy configurations
 */
export function httpsRedirectMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip for local development
  if (process.env.NODE_ENV !== 'production') return next();
  
  // Skip for health checks and SSL validation endpoints
  if (req.path === '/health' || req.path.startsWith('/.well-known/')) {
    return next();
  }
  
  // Check if request is already HTTPS
  const proto = req.headers['x-forwarded-proto'] || 
                req.headers['x-forwarded-scheme'] ||
                req.headers['cloudfront-forwarded-proto'] ||
                (req.headers['x-forwarded-ssl'] === 'on' ? 'https' : null) ||
                (req.headers['x-arr-ssl'] ? 'https' : null) ||
                req.protocol;
  
  if (proto !== 'https') {
    // Build HTTPS URL
    const host = req.headers['x-forwarded-host'] || req.headers.host || req.hostname;
    const httpsUrl = `https://${host}${req.originalUrl}`;
    
    // Set security headers even on redirect
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Permanent redirect to HTTPS
    return res.redirect(301, httpsUrl);
  }
  
  next();
}