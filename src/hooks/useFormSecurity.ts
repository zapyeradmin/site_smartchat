/**
 * ============================================================================
 * CRYPTO TRADING PLATFORM - FORM SECURITY HOOK
 * ============================================================================
 * 
 * Custom React hook for form security including CSRF protection,
 * rate limiting, input sanitization, and validation.
 * 
 * @author CryptoTrade Development Team
 * @version 1.0.0
 * @created 2024
 * ============================================================================
 */

import { useState, useCallback, useEffect } from 'react';
import { generateCSRFToken, checkRateLimit, logSecureError } from '@/utils/security';
import { validateForm, sanitizeFormData } from '@/utils/validation';
import { SECURITY_CONFIG } from '@/constants';

/**
 * ============================================================================
 * HOOK INTERFACES
 * ============================================================================
 */

interface UseFormSecurityOptions {
  rateLimitKey: string;
  maxRequests?: number;
  windowMs?: number;
  enableCSRF?: boolean;
}

interface FormSecurityState {
  csrfToken: string;
  isSubmitting: boolean;
  isRateLimited: boolean;
  errors: string[];
}

interface FormSecurityActions {
  validateAndSubmit: <T>(
    formData: T,
    validationRules: Record<string, (value: any) => any>,
    onSubmit: (data: T, csrfToken: string) => Promise<void>
  ) => Promise<void>;
  resetErrors: () => void;
  refreshCSRF: () => void;
}

/**
 * ============================================================================
 * FORM SECURITY HOOK
 * ============================================================================
 */

/**
 * Custom hook for secure form handling with built-in protection mechanisms
 * @param options - Configuration options for the hook
 * @returns State and actions for secure form handling
 */
export const useFormSecurity = (
  options: UseFormSecurityOptions
): FormSecurityState & FormSecurityActions => {
  const {
    rateLimitKey,
    maxRequests = SECURITY_CONFIG.RATE_LIMIT_REQUESTS,
    windowMs = SECURITY_CONFIG.RATE_LIMIT_WINDOW,
    enableCSRF = true,
  } = options;

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<FormSecurityState>({
    csrfToken: '',
    isSubmitting: false,
    isRateLimited: false,
    errors: [],
  });

  // ============================================================================
  // CSRF TOKEN MANAGEMENT
  // ============================================================================

  const refreshCSRF = useCallback(() => {
    if (enableCSRF) {
      const newToken = generateCSRFToken();
      setState(prev => ({ ...prev, csrfToken: newToken }));
    }
  }, [enableCSRF]);

  useEffect(() => {
    refreshCSRF();
  }, [refreshCSRF]);

  // ============================================================================
  // ERROR MANAGEMENT
  // ============================================================================

  const resetErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: [] }));
  }, []);

  const addError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      errors: [...prev.errors, error]
    }));
  }, []);

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  const checkSubmissionRateLimit = useCallback((): boolean => {
    const isAllowed = checkRateLimit(rateLimitKey, maxRequests, windowMs);
    
    if (!isAllowed) {
      setState(prev => ({ ...prev, isRateLimited: true }));
      addError('Too many requests. Please wait before submitting again.');
      
      // Reset rate limit status after window
      setTimeout(() => {
        setState(prev => ({ ...prev, isRateLimited: false }));
      }, windowMs);
    }
    
    return isAllowed;
  }, [rateLimitKey, maxRequests, windowMs, addError]);

  // ============================================================================
  // FORM VALIDATION AND SUBMISSION
  // ============================================================================

  /**
   * Validates and securely submits form data
   */
  const validateAndSubmit = useCallback(async <T>(
    formData: T,
    validationRules: Record<string, (value: any) => any>,
    onSubmit: (data: T, csrfToken: string) => Promise<void>
  ) => {
    try {
      // Reset previous errors
      resetErrors();

      // Check rate limiting
      if (!checkSubmissionRateLimit()) {
        return;
      }

      setState(prev => ({ ...prev, isSubmitting: true }));

      // Sanitize form data
      const sanitizedData = sanitizeFormData(formData as Record<string, any>) as T;

      // Validate form data
      const validation = validateForm(
        sanitizedData as Record<string, any>,
        validationRules
      );

      if (!validation.isValid) {
        validation.errors.forEach(addError);
        return;
      }

      // Submit form with CSRF token
      await onSubmit(sanitizedData, state.csrfToken);

      // Refresh CSRF token after successful submission
      if (enableCSRF) {
        refreshCSRF();
      }

    } catch (error) {
      logSecureError(error, 'Form submission failed');
      addError('An unexpected error occurred. Please try again.');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [
    state.csrfToken,
    enableCSRF,
    resetErrors,
    checkSubmissionRateLimit,
    addError,
    refreshCSRF
  ]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    csrfToken: state.csrfToken,
    isSubmitting: state.isSubmitting,
    isRateLimited: state.isRateLimited,
    errors: state.errors,

    // Actions
    validateAndSubmit,
    resetErrors,
    refreshCSRF,
  };
};

/**
 * ============================================================================
 * NEWSLETTER FORM HOOK
 * ============================================================================
 */

/**
 * Specialized hook for newsletter form security
 * @param onSubmit - Newsletter submission handler
 * @returns Newsletter form security state and actions
 */
export const useNewsletterSecurity = (
  onSubmit: (email: string, csrfToken: string) => Promise<void>
) => {
  const security = useFormSecurity({
    rateLimitKey: 'newsletter_signup',
    maxRequests: 3,
    windowMs: 60 * 1000, // 1 minute
  });

  const submitNewsletter = useCallback(async (email: string) => {
    await security.validateAndSubmit(
      { email },
      {
        email: (value: string) => {
          const trimmed = value.trim();
          if (!trimmed) return { isValid: false, error: 'Email is required' };
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            return { isValid: false, error: 'Invalid email format' };
          }
          return { isValid: true };
        }
      },
      async (data) => {
        await onSubmit(data.email, security.csrfToken);
      }
    );
  }, [security, onSubmit]);

  return {
    ...security,
    submitNewsletter,
  };
};

/**
 * ============================================================================
 * CONTACT FORM HOOK
 * ============================================================================
 */

/**
 * Specialized hook for contact form security
 * @param onSubmit - Contact form submission handler
 * @returns Contact form security state and actions
 */
export const useContactSecurity = (
  onSubmit: (data: { name: string; email: string; message: string }, csrfToken: string) => Promise<void>
) => {
  const security = useFormSecurity({
    rateLimitKey: 'contact_form',
    maxRequests: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
  });

  const submitContact = useCallback(async (data: { name: string; email: string; message: string }) => {
    await security.validateAndSubmit(
      data,
      {
        name: (value: string) => {
          const trimmed = value.trim();
          if (!trimmed) return { isValid: false, error: 'Name is required' };
          if (trimmed.length > 100) return { isValid: false, error: 'Name too long' };
          return { isValid: true };
        },
        email: (value: string) => {
          const trimmed = value.trim();
          if (!trimmed) return { isValid: false, error: 'Email is required' };
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            return { isValid: false, error: 'Invalid email format' };
          }
          return { isValid: true };
        },
        message: (value: string) => {
          const trimmed = value.trim();
          if (!trimmed) return { isValid: false, error: 'Message is required' };
          if (trimmed.length > 1000) return { isValid: false, error: 'Message too long' };
          return { isValid: true };
        }
      },
      async (validatedData) => {
        await onSubmit(validatedData, security.csrfToken);
      }
    );
  }, [security, onSubmit]);

  return {
    ...security,
    submitContact,
  };
};