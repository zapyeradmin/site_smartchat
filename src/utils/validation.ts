/**
 * ============================================================================
 * SITE SMART CHAT - VALIDATION UTILITIES
 * ============================================================================
 * 
 * This file contains validation utilities for forms, user input, and data
 * processing to ensure data integrity and user experience.
 * 
 * @author Zapyer Team
 * @version 1.0.0
 * @created 2024
 * ============================================================================
 */

import { VALIDATION, ERROR_MESSAGES } from '@/constants';

/**
 * ============================================================================
 * FORM VALIDATION TYPES
 * ============================================================================
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  field: string;
  isValid: boolean;
  error?: string;
}

/**
 * ============================================================================
 * EMAIL VALIDATION
 * ============================================================================
 */

/**
 * Validates email address format
 * @param email - Email to validate
 * @returns Validation result
 */
export const validateEmail = (email: string): FieldValidation => {
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return {
      field: 'email',
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  if (trimmedEmail.length > VALIDATION.MAX_EMAIL_LENGTH) {
    return {
      field: 'email',
      isValid: false,
      error: `Email must be less than ${VALIDATION.MAX_EMAIL_LENGTH} characters`
    };
  }
  
  if (!VALIDATION.EMAIL_REGEX.test(trimmedEmail)) {
    return {
      field: 'email',
      isValid: false,
      error: ERROR_MESSAGES.INVALID_EMAIL
    };
  }
  
  return {
    field: 'email',
    isValid: true
  };
};

/**
 * ============================================================================
 * NAME VALIDATION
 * ============================================================================
 */

/**
 * Validates name field
 * @param name - Name to validate
 * @returns Validation result
 */
export const validateName = (name: string): FieldValidation => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return {
      field: 'name',
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  if (trimmedName.length > VALIDATION.MAX_NAME_LENGTH) {
    return {
      field: 'name',
      isValid: false,
      error: `Name must be less than ${VALIDATION.MAX_NAME_LENGTH} characters`
    };
  }
  
  // Only allow letters, spaces, hyphens, and apostrophes
  const namePattern = /^[a-zA-Z\s\-']+$/;
  if (!namePattern.test(trimmedName)) {
    return {
      field: 'name',
      isValid: false,
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    };
  }
  
  return {
    field: 'name',
    isValid: true
  };
};

/**
 * ============================================================================
 * MESSAGE VALIDATION
 * ============================================================================
 */

/**
 * Validates message/text content
 * @param message - Message to validate
 * @returns Validation result
 */
export const validateMessage = (message: string): FieldValidation => {
  const trimmedMessage = message.trim();
  
  if (!trimmedMessage) {
    return {
      field: 'message',
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  if (trimmedMessage.length > VALIDATION.MAX_MESSAGE_LENGTH) {
    return {
      field: 'message',
      isValid: false,
      error: `Message must be less than ${VALIDATION.MAX_MESSAGE_LENGTH} characters`
    };
  }
  
  return {
    field: 'message',
    isValid: true
  };
};

/**
 * ============================================================================
 * PHONE VALIDATION
 * ============================================================================
 */

/**
 * Validates phone number format
 * @param phone - Phone number to validate
 * @returns Validation result
 */
export const validatePhone = (phone: string): FieldValidation => {
  const trimmedPhone = phone.trim();
  
  if (!trimmedPhone) {
    return {
      field: 'phone',
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  if (!VALIDATION.PHONE_REGEX.test(trimmedPhone)) {
    return {
      field: 'phone',
      isValid: false,
      error: 'Please enter a valid phone number'
    };
  }
  
  return {
    field: 'phone',
    isValid: true
  };
};

/**
 * ============================================================================
 * TRADING VALIDATION
 * ============================================================================
 */

/**
 * Validates trading amount
 * @param amount - Amount to validate
 * @param minAmount - Minimum allowed amount
 * @param maxAmount - Maximum allowed amount
 * @returns Validation result
 */
export const validateTradingAmount = (
  amount: string,
  minAmount: number = 10,
  maxAmount: number = 100000
): FieldValidation => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return {
      field: 'amount',
      isValid: false,
      error: 'Please enter a valid amount'
    };
  }
  
  if (numAmount < minAmount) {
    return {
      field: 'amount',
      isValid: false,
      error: `Minimum amount is $${minAmount}`
    };
  }
  
  if (numAmount > maxAmount) {
    return {
      field: 'amount',
      isValid: false,
      error: `Maximum amount is $${maxAmount}`
    };
  }
  
  return {
    field: 'amount',
    isValid: true
  };
};

/**
 * Validates trading symbol/pair
 * @param symbol - Trading symbol to validate
 * @returns Validation result
 */
export const validateTradingSymbol = (symbol: string): FieldValidation => {
  const trimmedSymbol = symbol.trim().toUpperCase();
  
  if (!trimmedSymbol) {
    return {
      field: 'symbol',
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }
  
  // Basic pattern for crypto trading pairs (e.g., BTC/USD, ETH/USDT)
  const symbolPattern = /^[A-Z]{3,10}\/[A-Z]{3,10}$/;
  if (!symbolPattern.test(trimmedSymbol)) {
    return {
      field: 'symbol',
      isValid: false,
      error: 'Invalid trading pair format (e.g., BTC/USD)'
    };
  }
  
  return {
    field: 'symbol',
    isValid: true
  };
};

/**
 * ============================================================================
 * FORM VALIDATION HELPERS
 * ============================================================================
 */

/**
 * Validates an entire form object
 * @param formData - Form data to validate
 * @param validationRules - Validation rules for each field
 * @returns Overall validation result
 */
export const validateForm = (
  formData: Record<string, any>,
  validationRules: Record<string, (value: any) => FieldValidation>
): ValidationResult => {
  const errors: string[] = [];
  
  for (const [fieldName, validator] of Object.entries(validationRules)) {
    const fieldValue = formData[fieldName];
    const validation = validator(fieldValue);
    
    if (!validation.isValid && validation.error) {
      errors.push(validation.error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * ============================================================================
 * NEWSLETTER FORM VALIDATION
 * ============================================================================
 */

/**
 * Validates newsletter subscription form
 * @param email - Email address
 * @returns Validation result
 */
export const validateNewsletterForm = (email: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  
  return {
    isValid: emailValidation.isValid,
    errors: emailValidation.error ? [emailValidation.error] : []
  };
};

/**
 * ============================================================================
 * CONTACT FORM VALIDATION
 * ============================================================================
 */

/**
 * Validates contact form data
 * @param formData - Contact form data
 * @returns Validation result
 */
export const validateContactForm = (formData: {
  name: string;
  email: string;
  message: string;
}): ValidationResult => {
  return validateForm(formData, {
    name: validateName,
    email: validateEmail,
    message: validateMessage
  });
};

/**
 * ============================================================================
 * REAL-TIME VALIDATION
 * ============================================================================
 */

/**
 * Debounced validation function for real-time form validation
 * @param validator - Validation function
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced validator function
 */
export const createDebouncedValidator = <T>(
  validator: (value: T) => FieldValidation,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (value: T, callback: (result: FieldValidation) => void) => {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      const result = validator(value);
      callback(result);
    }, delay);
  };
};

/**
 * ============================================================================
 * SANITIZATION HELPERS
 * ============================================================================
 */

/**
 * Sanitizes form input to prevent XSS and other attacks
 * @param input - Raw input string
 * @returns Sanitized string
 */
export const sanitizeFormInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .substring(0, 1000); // Limit length
};

/**
 * Sanitizes the entire form data object
 * @param formData - Form data object
 * @returns Sanitized form data
 */
export const sanitizeFormData = (
  formData: Record<string, any>
): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeFormInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};