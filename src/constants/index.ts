/**
 * ============================================================================
 * SITE SMART CHAT - APPLICATION CONSTANTS
 * ============================================================================
 * 
 * This file contains all application constants including configuration,
 * API endpoints, feature flags, and other static values used throughout
 * the application.
 * 
 * @author Zapyer Team
 * @version 1.0.0
 * @created 2024
 * ============================================================================
 */

/**
 * ============================================================================
 * APPLICATION CONFIGURATION
 * ============================================================================
 */

export const APP_CONFIG = {
  NAME: 'Site Smart Chat',
  VERSION: '1.0.0',
  DESCRIPTION: 'Plataforma de atendimento inteligente com IA e integrações WhatsApp',
  AUTHOR: 'Zapyer',
  CONTACT_EMAIL: 'info@zapyer.com.br',
  SUPPORT_EMAIL: 'suporte@zapyer.com.br',
} as const;

/**
 * ============================================================================
 * API CONFIGURATION
 * ============================================================================
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://apismartchat.zapyer.com.br',
  VERSION: 'v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

/**
 * ============================================================================
 * NAVIGATION CONSTANTS
 * ============================================================================
 */

export const NAVIGATION_SECTIONS = {
  FEATURES: 'features',
  PRICING: 'pricing', 
  TESTIMONIALS: 'testimonials',
  BLOG: 'blog',
  FAQ: 'faq',
  CTA: 'cta',
} as const;

/**
 * ============================================================================
 * PRICING PLANS
 * ============================================================================
 */

export const PRICING_PLANS = {
  FREE: {
    id: 'free',
    name: 'Starter',
    price: 0,
    currency: 'USD',
    interval: 'monthly' as const,
    features: [
      'Basic trading interface',
      'Real-time market data',
      'Portfolio tracking',
      'Email support',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Professional',
    price: 29,
    currency: 'USD',
    interval: 'monthly' as const,
    recommended: true,
    features: [
      'Advanced trading tools',
      'AI-powered analytics',
      'Risk management',
      'Priority support',
      'Advanced charting',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'USD',
    interval: 'monthly' as const,
    features: [
      'All Pro features',
      'White-label solution',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
  },
} as const;

/**
 * ============================================================================
 * SECURITY CONSTANTS
 * ============================================================================
 */

export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  
  // Session management
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SYMBOLS: true,
} as const;

/**
 * ============================================================================
 * TRADING CONSTANTS
 * ============================================================================
 */

export const TRADING_CONFIG = {
  // Default trading pairs
  DEFAULT_PAIRS: ['BTC/USD', 'ETH/USD', 'BNB/USD', 'ADA/USD'],
  
  // Order types
  ORDER_TYPES: ['market', 'limit', 'stop', 'stop-limit'] as const,
  
  // Risk management
  MAX_LEVERAGE: 10,
  MIN_ORDER_SIZE: 10, // USD
  MAX_ORDER_SIZE: 100000, // USD
} as const;

/**
 * ============================================================================
 * UI CONSTANTS
 * ============================================================================
 */

export const UI_CONFIG = {
  // Animation durations (in milliseconds)
  ANIMATION_FAST: 200,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,
  
  // Breakpoints (matches Tailwind defaults)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },
} as const;

/**
 * ============================================================================
 * VALIDATION CONSTANTS
 * ============================================================================
 */

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  
  // Input limits
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  MAX_MESSAGE_LENGTH: 1000,
  
  // File upload limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

/**
 * ============================================================================
 * ERROR MESSAGES
 * ============================================================================
 */

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  VALIDATION: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  
  // Form validation
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
} as const;

/**
 * ============================================================================
 * SUCCESS MESSAGES
 * ============================================================================
 */

export const SUCCESS_MESSAGES = {
  FORM_SUBMITTED: 'Form submitted successfully!',
  NEWSLETTER_SUBSCRIBED: 'Successfully subscribed to newsletter!',
  ACCOUNT_CREATED: 'Account created successfully!',
  PASSWORD_UPDATED: 'Password updated successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const;

/**
 * ============================================================================
 * SOCIAL MEDIA LINKS
 * ============================================================================
 */

export const SOCIAL_LINKS = {
  TWITTER: 'https://x.com/MZapyer34353',
  LINKEDIN: 'https://www.linkedin.com/company/zapyer',
  GITHUB: 'https://github.com/zapyeradmin',
  DISCORD: '',
  TELEGRAM: '',
} as const;

/**
 * ============================================================================
 * FEATURE FLAGS
 * ============================================================================
 */

export const FEATURE_FLAGS = {
  ENABLE_CHAT: true,
  ENABLE_BLOG: true,
  ENABLE_TESTIMONIALS: true,
  ENABLE_NEWSLETTER: true,
  ENABLE_ANALYTICS: true,
  ENABLE_PWA: false,
} as const;

export const PRICING_CONTACT = {
  WHATSAPP_NUMBER: import.meta.env.VITE_WHATSAPP_NUMBER || '5587996316081',
  MESSAGES: {
    free: 'Olá, gostaria de saber mais informações sobre o Grátis, poderia informar?',
    smart: 'Olá, gostaria de saber mais informações sobre o Plano Smart Chat, poderia informar?',
    corporate: 'Olá, gostaria de saber mais informações sobre o Plano Corporativo Personalizado, poderia informar?',
  },
} as const;