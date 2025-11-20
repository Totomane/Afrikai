// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../components/context/authContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(username, password);
    setLoading(false);
    
    if (result.success) {
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900/80 p-4 rounded-xl text-white space-y-3">
      <h2 className="text-lg font-semibold mb-2">Login</h2>
      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded p-2 text-red-200 text-sm">
          {error}
        </div>
      )}
      <input
        className="w-full px-3 py-2 rounded bg-black/60 border border-gray-700 text-sm"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <input
        className="w-full px-3 py-2 rounded bg-black/60 border border-gray-700 text-sm"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading || !username || !password}
        className="w-full bg-blue-600 hover:bg-blue-700 rounded py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Logging in…' : 'Login'}
      </button>
    </form>
  );
};
