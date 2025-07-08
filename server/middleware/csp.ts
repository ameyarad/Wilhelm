import { Request, Response, NextFunction } from "express";

/**
 * Enhanced Content Security Policy for production
 */
export function enhancedCSP(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== 'production') return next();
  
  // Generate a nonce for inline scripts
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Store nonce in response locals for use in templates
  res.locals.cspNonce = nonce;
  
  // Build CSP header
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://apis.replit.com https://replit.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: https: blob:`,
    `connect-src 'self' https://api.groq.com https://console.groq.com https://apis.replit.com wss://*.replit.app wss://*.replit.dev https://*.replit.app https://*.replit.dev https://wilhelmai.net https://www.wilhelmai.net`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://formspree.io`,
    `frame-ancestors 'none'`,
    `manifest-src 'self'`,
    `media-src 'self'`,
    `worker-src 'none'`,
    `child-src 'none'`,
    `upgrade-insecure-requests`,
    `block-all-mixed-content`,
    `require-trusted-types-for 'script'`
  ];
  
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  res.setHeader('X-Content-Security-Policy', cspDirectives.join('; '));
  res.setHeader('X-WebKit-CSP', cspDirectives.join('; '));
  
  next();
}

import crypto from "crypto";