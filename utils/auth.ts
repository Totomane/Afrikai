// src/utils/auth.ts

/**
 * Authentication utility functions
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Extract token from URL path
 */
export const extractTokenFromPath = (path: string): string | null => {
  const matches = path.match(/\/([a-zA-Z0-9\-_]+)$/);
  return matches ? matches[1] : null;
};

/**
 * Format backend validation errors
 */
export const formatBackendErrors = (errors: any): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  if (typeof errors === 'string') {
    formattedErrors.general = errors;
    return formattedErrors;
  }
  
  if (Array.isArray(errors)) {
    formattedErrors.general = errors.join(', ');
    return formattedErrors;
  }
  
  if (typeof errors === 'object' && errors !== null) {
    Object.keys(errors).forEach(key => {
      if (Array.isArray(errors[key])) {
        formattedErrors[key] = errors[key][0];
      } else if (typeof errors[key] === 'string') {
        formattedErrors[key] = errors[key];
      } else {
        formattedErrors[key] = 'Invalid value';
      }
    });
  }
  
  return formattedErrors;
};

/**
 * Password strength checker
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Add numbers');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Add special characters (!@#$%^&*)');
  } else {
    score += 1;
  }

  return { score: Math.min(score, 4), feedback };
};

/**
 * Sanitize redirect URL to prevent open redirect attacks
 */
export const sanitizeRedirectUrl = (url: string): string => {
  // Only allow relative URLs or same origin URLs
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin === window.location.origin) {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch (e) {
    // Invalid URL, treat as relative path
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
  }
  
  // Default fallback
  return '/dashboard';
};

/**
 * Get error message from API response
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.detail) {
    return error.detail;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  return 'An unexpected error occurred';
};