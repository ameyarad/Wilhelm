import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Comprehensive security configuration for production deployment
 * Addresses Google Safe Browsing security requirements
 */

// Security headers that should be applied to all responses
export const SECURITY_HEADERS = {
  // HSTS with 2-year duration for preload list eligibility
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Clickjacking protection
  'X-Frame-Options': 'DENY',
  
  // XSS protection for older browsers
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy for privacy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (replaces Feature Policy)
  'Permissions-Policy': 'geolocation=(), microphone=(self), camera=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()',
  
  // Additional security headers
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-Download-Options': 'noopen',
  'X-DNS-Prefetch-Control': 'off',
  
  // Certificate Transparency
  'Expect-CT': 'max-age=86400, enforce',
  
  // Legacy Feature Policy for older browsers
  'Feature-Policy': "geolocation 'none'; microphone 'self'; camera 'none'; payment 'none'; usb 'none'",
  
  // Cache control for sensitive data
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  
  // CORP and COEP headers for isolation
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin'
};

// Remove headers that might expose sensitive information
export const HEADERS_TO_REMOVE = [
  'X-Powered-By',
  'Server',
  'X-AspNet-Version',
  'X-AspNetMvc-Version',
  'X-Drupal-Cache',
  'X-Drupal-Dynamic-Cache',
  'X-Generator',
  'X-Runtime',
  'X-Version',
  'X-Rack-Cache'
];

/**
 * Apply comprehensive security headers middleware
 */
export function applySecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Apply all security headers
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  // Remove potentially dangerous headers
  HEADERS_TO_REMOVE.forEach(header => {
    res.removeHeader(header);
  });
  
  // Set secure cookie policy
  const originalSetHeader = res.setHeader;
  res.setHeader = function(name: string, value: any) {
    if (name.toLowerCase() === 'set-cookie') {
      if (Array.isArray(value)) {
        value = value.map(cookie => ensureSecureCookie(cookie));
      } else {
        value = ensureSecureCookie(value);
      }
    }
    return originalSetHeader.call(this, name, value);
  };
  
  next();
}

/**
 * Ensure cookies have secure attributes
 */
function ensureSecureCookie(cookie: string): string {
  if (process.env.NODE_ENV !== 'production') return cookie;
  
  const attributes = cookie.split(';').map(attr => attr.trim());
  const hasSecure = attributes.some(attr => attr.toLowerCase() === 'secure');
  const hasHttpOnly = attributes.some(attr => attr.toLowerCase() === 'httponly');
  const hasSameSite = attributes.some(attr => attr.toLowerCase().startsWith('samesite'));
  
  if (!hasSecure) attributes.push('Secure');
  if (!hasHttpOnly) attributes.push('HttpOnly');
  if (!hasSameSite) attributes.push('SameSite=Strict');
  
  return attributes.join('; ');
}

/**
 * Validate that request is coming over HTTPS
 */
export function validateHTTPS(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== 'production') return next();
  
  // Check various headers that indicate HTTPS
  const isSecure = req.secure || 
                  req.headers['x-forwarded-proto'] === 'https' ||
                  req.headers['x-forwarded-ssl'] === 'on' ||
                  req.headers['x-forwarded-scheme'] === 'https' ||
                  req.headers['cloudfront-forwarded-proto'] === 'https' ||
                  req.headers['x-arr-ssl'] !== undefined ||
                  req.headers['x-forwarded-port'] === '443' ||
                  req.protocol === 'https';
  
  if (!isSecure) {
    // Log security violation
    console.error(`[SECURITY] Non-HTTPS request blocked: ${req.method} ${req.url} from ${req.ip}`);
    
    // Return security error
    return res.status(426).json({
      error: 'Upgrade Required',
      message: 'HTTPS is required for this service'
    });
  }
  
  next();
}

/**
 * Content Security Policy nonce generator
 */
export function generateCSPNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}