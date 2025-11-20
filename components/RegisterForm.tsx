// src/components/RegisterForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../components/context/authContext';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await register(username, email, password);
    setLoading(false);
    
    if (result.success) {
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900/80 p-4 rounded-xl text-white space-y-3">
      <h2 className="text-lg font-semibold mb-2">Create Account</h2>
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
        placeholder="Email (optional)"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="w-full px-3 py-2 rounded bg-black/60 border border-gray-700 text-sm"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={8}
      />
      <button
        type="submit"
        disabled={loading || !username || !password}
        className="w-full bg-green-600 hover:bg-green-700 rounded py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Sign up'}
      </button>
    </form>
  );
};
