/**
 * ============================================================================
 * SITE SMART CHAT - TYPE DEFINITIONS
 * ============================================================================
 * 
 * This file contains all TypeScript interfaces and types used across the 
 * application to ensure type safety and better development experience.
 * 
 * @author Zapyer Team
 * @version 1.0.0
 * @created 2024
 * ============================================================================
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * ============================================================================
 * COMMON TYPES
 * ============================================================================
 */

/**
 * Base component props interface
 */
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

/**
 * API Response structure for standardized error handling
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * ============================================================================
 * FEATURE TYPES
 * ============================================================================
 */

/**
 * Feature item structure for the features section
 */
export interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
  image: string;
}

/**
 * ============================================================================
 * TIMELINE TYPES
 * ============================================================================
 */

/**
 * Timeline item structure for company history
 */
export interface TimelineItem {
  title: string;
  content: ReactNode;
}

/**
 * ============================================================================
 * TRADING TYPES
 * ============================================================================
 */

/**
 * Trading pair information
 */
export interface TradingPair {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
}

/**
 * User portfolio information
 */
export interface Portfolio {
  totalValue: number;
  assets: Asset[];
  performance: PerformanceMetrics;
}

/**
 * Individual asset in portfolio
 */
export interface Asset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change24h: number;
}

/**
 * Performance metrics for analytics
 */
export interface PerformanceMetrics {
  totalReturn: number;
  monthlyReturn: number;
  yearlyReturn: number;
  winRate: number;
}

/**
 * ============================================================================
 * PRICING TYPES
 * ============================================================================
 */

/**
 * Pricing plan structure
 */
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  recommended?: boolean;
  popular?: boolean;
}

/**
 * ============================================================================
 * TESTIMONIAL TYPES
 * ============================================================================
 */

/**
 * Customer testimonial structure
 */
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar: string;
  rating: number;
}

/**
 * ============================================================================
 * BLOG TYPES
 * ============================================================================
 */

/**
 * Blog post structure
 */
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: Author;
  publishedAt: Date;
  tags: string[];
  featuredImage: string;
  readTime: number;
}

/**
 * News article structure - extends BlogPost with additional fields
 */
export interface NewsArticle extends BlogPost {
  slug: string;
  category: string;
}

/**
 * Blog author information
 */
export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

/**
 * ============================================================================
 * NAVIGATION TYPES
 * ============================================================================
 */

/**
 * Navigation item structure
 */
export interface NavItem {
  name: string;
  href: string;
  onClick?: () => void;
  external?: boolean;
}

/**
 * ============================================================================
 * FORM TYPES
 * ============================================================================
 */

/**
 * Contact form data
 */
export interface ContactForm {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

/**
 * Newsletter subscription form
 */
export interface NewsletterForm {
  email: string;
}

/**
 * ============================================================================
 * SECURITY TYPES
 * ============================================================================
 */

/**
 * User authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  token?: string;
}

/**
 * User information
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  verified: boolean;
  createdAt: Date;
}

/**
 * ============================================================================
 * CHAT TYPES
 * ============================================================================
 */

/**
 * Chat message structure for trading chat
 */
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'trading-signal' | 'analysis';
}

/**
 * Trading signal from AI
 */
export interface TradingSignal {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  targetPrice?: number;
  stopLoss?: number;
}