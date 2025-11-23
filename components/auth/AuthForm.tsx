// src/components/auth/AuthForm.tsx
import React, { useState, FormEvent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { validateForm, ValidationError, ValidationRule } from '../../utils/validation';
import { formatBackendErrors } from '../../utils/auth';

interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'tel';
  label: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  validation?: ValidationRule;
}

interface AuthFormProps {
  title: string;
  subtitle?: string;
  fields: FormField[];
  submitText: string;
  isLoading?: boolean;
  errors?: Record<string, string>;
  onSubmit: (data: Record<string, string>) => void | Promise<void>;
  children?: ReactNode;
  className?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  fields,
  submitText,
  isLoading = false,
  errors = {},
  onSubmit,
  children,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach(field => {
      initial[field.name] = '';
    });
    return initial;
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors.some(err => err.field === name)) {
      setValidationErrors(prev => prev.filter(err => err.field !== name));
    }
  };

  const handleInputBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur if it has been touched
    const field = fields.find(f => f.name === name);
    if (field?.validation) {
      const rules = { [name]: field.validation };
      const fieldErrors = validateForm(formData, rules);
      
      setValidationErrors(prev => {
        const filtered = prev.filter(err => err.field !== name);
        return [...filtered, ...fieldErrors];
      });
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    console.log('[FORM] Submitting:', title);
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const rules: Record<string, ValidationRule> = {};
    fields.forEach(field => {
      if (field.validation) {
        rules[field.name] = field.validation;
      }
    });

    const fieldErrors = validateForm(formData, rules);
    setValidationErrors(fieldErrors);

    if (fieldErrors.length === 0) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('[FORM] Submit error:', error);
      }
    } else {
      console.log('[FORM] Validation failed:', fieldErrors.length, 'errors');
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    // Backend errors take priority
    if (errors[fieldName]) {
      return errors[fieldName];
    }
    
    // Then validation errors, but only show if field has been touched
    if (touched[fieldName]) {
      const validationError = validationErrors.find(err => err.field === fieldName);
      return validationError?.message || null;
    }
    
    return null;
  };

  const isFormValid = validationErrors.length === 0 && Object.values(formData).every(value => value.trim() !== '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full max-w-md mx-auto ${className}`}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>

        {/* General error message */}
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-sm text-red-700">{errors.general}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => {
            const fieldError = getFieldError(field.name);
            const isPasswordField = field.type === 'password';
            const showPassword = showPasswords[field.name];

            return (
              <div key={field.name}>
                <label 
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                <div className="relative">
                  <input
                    id={field.name}
                    name={field.name}
                    type={isPasswordField && showPassword ? 'text' : field.type}
                    autoComplete={field.autoComplete}
                    required={field.required}
                    value={formData[field.name]}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    onBlur={() => handleInputBlur(field.name)}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fieldError 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                    } ${isPasswordField ? 'pr-12' : ''}`}
                    disabled={isLoading}
                  />
                  
                  {isPasswordField && (
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field.name)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>

                {fieldError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {fieldError}
                  </motion.p>
                )}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              submitText
            )}
          </button>

          {children}
        </form>
      </div>
    </motion.div>
  );
};