// src/components/pages/PasswordResetConfirmPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PasswordResetConfirmForm } from '../PasswordResetConfirmForm';

export const PasswordResetConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="bg-gray-900/80 p-6 rounded-xl text-white max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">Invalid Reset Link</h2>
          <p className="text-gray-300 mb-4">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded py-2 text-sm font-medium"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-md w-full mx-4">
        <PasswordResetConfirmForm
          token={token}
          onSuccess={() => navigate('/login')}
          onCancel={() => navigate('/')}
        />
      </div>
    </div>
  );
};