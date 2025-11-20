// src/components/PasswordResetForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../components/context/authContext';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await resetPassword(email);
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(result.message || 'Password reset failed');
    }
  };

  if (success) {
    return (
      <div className="bg-gray-900/80 p-4 rounded-xl text-white space-y-3">
        <h2 className="text-lg font-semibold mb-2">Reset Email Sent</h2>
        <div className="bg-green-600/20 border border-green-600 rounded p-2 text-green-200 text-sm">
          Check your email for password reset instructions.
        </div>
        <button
          onClick={onCancel}
          className="w-full bg-gray-600 hover:bg-gray-700 rounded py-2 text-sm font-medium"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900/80 p-4 rounded-xl text-white space-y-3">
      <h2 className="text-lg font-semibold mb-2">Reset Password</h2>
      <p className="text-gray-400 text-sm mb-3">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded p-2 text-red-200 text-sm">
          {error}
        </div>
      )}
      <input
        className="w-full px-3 py-2 rounded bg-black/60 border border-gray-700 text-sm"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <div className="space-y-2">
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-blue-600 hover:bg-blue-700 rounded py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send Reset Email'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-gray-600 hover:bg-gray-700 rounded py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};