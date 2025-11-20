// src/components/PasswordResetConfirmForm.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/context/authContext';

interface PasswordResetConfirmFormProps {
  token: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PasswordResetConfirmForm: React.FC<PasswordResetConfirmFormProps> = ({ 
  token,
  onSuccess, 
  onCancel 
}) => {
  const { confirmResetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await confirmResetPassword(token, password);
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 2000); // Redirect after showing success message
      }
    } else {
      setError(result.message || 'Password reset failed');
    }
  };

  if (success) {
    return (
      <div className="bg-gray-900/80 p-4 rounded-xl text-white space-y-3">
        <h2 className="text-lg font-semibold mb-2">Password Reset Successful</h2>
        <div className="bg-green-600/20 border border-green-600 rounded p-2 text-green-200 text-sm">
          Your password has been reset successfully. You can now login with your new password.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900/80 p-4 rounded-xl text-white space-y-3">
      <h2 className="text-lg font-semibold mb-2">Set New Password</h2>
      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded p-2 text-red-200 text-sm">
          {error}
        </div>
      )}
      <input
        className="w-full px-3 py-2 rounded bg-black/60 border border-gray-700 text-sm"
        type="password"
        placeholder="New Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={8}
      />
      <input
        className="w-full px-3 py-2 rounded bg-black/60 border border-gray-700 text-sm"
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        required
        minLength={8}
      />
      <div className="space-y-2">
        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="w-full bg-green-600 hover:bg-green-700 rounded py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Updating…' : 'Update Password'}
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