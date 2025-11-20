// src/utils/validation.ts

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const validateField = (
  value: string,
  rules: ValidationRule
): string | null => {
  if (rules.required && (!value || value.trim() === '')) {
    return rules.message || 'This field is required';
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    return rules.message || `Must be at least ${rules.minLength} characters`;
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    return rules.message || `Must be no more than ${rules.maxLength} characters`;
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    return rules.message || 'Invalid format';
  }

  return null;
};

export const authValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    message: 'Password must be at least 8 characters long'
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
  },
  confirmPassword: {
    required: true,
    message: 'Please confirm your password'
  }
};

export const validateForm = (
  formData: Record<string, string>,
  rules: Record<string, ValidationRule>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.entries(rules).forEach(([field, rule]) => {
    const error = validateField(formData[field] || '', rule);
    if (error) {
      errors.push({ field, message: error });
    }
  });

  // Special validation for password confirmation
  if (formData.password && formData.confirmPassword) {
    if (formData.password !== formData.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }
  }

  return errors;
};