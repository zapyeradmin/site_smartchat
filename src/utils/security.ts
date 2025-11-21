/**
 * ============================================================================
 * SITE SMART CHAT - SECURITY UTILITIES
 * ============================================================================
 * 
 * This file contains security-related utilities for input sanitization,
 * XSS prevention, CSRF protection, and other security measures.
 * 
 * @author Zapyer Team
 * @version 1.0.0
 * @created 2024
 * ============================================================================
 */

/**
 * ============================================================================
 * INPUT SANITIZATION
 * ============================================================================
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param input - Raw HTML string
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Sanitizes user input by removing potentially dangerous characters
 * @param input - Raw user input
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>\"']/g, '') // Remove HTML chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validates and sanitizes email addresses
 * @param email - Email to validate
 * @returns Sanitized email or null if invalid
 */
export const sanitizeEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeInput(email.toLowerCase());
  return emailRegex.test(sanitized) ? sanitized : null;
};

/**
 * ============================================================================
 * CSRF PROTECTION
 * ============================================================================
 */

/**
 * Generates a CSRF token for form protection
 * @returns CSRF token string
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validates CSRF token
 * @param token - Token to validate
 * @param expectedToken - Expected token value
 * @returns True if tokens match
 */
export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  return token === expectedToken && token.length === 64;
};

/**
 * ============================================================================
 * CONTENT SECURITY
 * ============================================================================
 */

/**
 * Validates URL to prevent malicious redirects
 * @param url - URL to validate
 * @returns True if URL is safe
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Only allow https and http protocols
    return ['https:', 'http:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

/**
 * Checks if URL is from allowed domain
 * @param url - URL to check
 * @param allowedDomains - Array of allowed domains
 * @returns True if domain is allowed
 */
export const isAllowedDomain = (url: string, allowedDomains: string[]): boolean => {
  try {
    const parsedUrl = new URL(url);
    return allowedDomains.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

/**
 * ============================================================================
 * RATE LIMITING
 * ============================================================================
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple client-side rate limiting
 * @param key - Unique identifier (e.g., IP or user ID)
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns True if request is allowed
 */
export const checkRateLimit = (
  key: string, 
  maxRequests: number, 
  windowMs: number
): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
};

/**
 * ============================================================================
 * PASSWORD SECURITY
 * ============================================================================
 */

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with validation result and feedback
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain lowercase letters');
  } else {
    score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain uppercase letters');
  } else {
    score += 1;
  }
  
  if (!/\d/.test(password)) {
    feedback.push('Password must contain numbers');
  } else {
    score += 1;
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
    feedback.push('Password must contain special characters');
  } else {
    score += 1;
  }
  
  return {
    isValid: score >= 4,
    score,
    feedback
  };
};

/**
 * ============================================================================
 * SESSION SECURITY
 * ============================================================================
 */

/**
 * Generates a secure session ID
 * @returns Session ID string
 */
export const generateSessionId = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Checks if session is expired
 * @param timestamp - Session creation timestamp
 * @param maxAge - Maximum session age in milliseconds
 * @returns True if session is expired
 */
export const isSessionExpired = (timestamp: number, maxAge: number): boolean => {
  return Date.now() - timestamp > maxAge;
};

/**
 * ============================================================================
 * INPUT VALIDATION
 * ============================================================================
 */

/**
 * Validates file upload security
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSize - Maximum file size in bytes
 * @returns Validation result
 */
export const validateFileUpload = (
  file: File,
  allowedTypes: string[],
  maxSize: number
): { isValid: boolean; error?: string } => {
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds maximum limit' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  return { isValid: true };
};

/**
 * ============================================================================
 * ERROR HANDLING
 * ============================================================================
 */

/**
 * Safely logs errors without exposing sensitive information
 * @param error - Error to log
 * @param context - Additional context
 */
export const logSecureError = (error: unknown, context?: string): void => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context: context || 'Unknown',
    message: error instanceof Error ? error.message : 'Unknown error',
    // Never log sensitive data like passwords, tokens, etc.
  };
  
  console.error('Security Error:', errorInfo);
  
  // In production, send to secure logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service (implement based on your logging solution)
  }
};