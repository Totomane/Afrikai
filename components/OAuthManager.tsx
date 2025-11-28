// src/components/OAuthManager.tsx
import React, { useState } from 'react';
import { useAuth } from './context/authContext';

const OAUTH_PROVIDERS = [
  { id: 'google', name: 'Google', icon: '🔗' },
  { id: 'github', name: 'GitHub', icon: '🔗' },
  { id: 'linkedin', name: 'linkedIn', icon: '🔗' },
  { id: 'twitter', name: 'Twitter/X', icon: '🔗' },
  { id: 'facebook', name: 'Facebook', icon: '🔗' },
];

interface OAuthManagerProps {
  className?: string;
}

export const OAuthManager: React.FC<OAuthManagerProps> = ({ className = '' }) => {
  const { 
    connectedProviders, 
    connectOAuthProvider, 
    disconnectOAuthProvider,
    refreshConnectedProviders 
  } = useAuth();
  
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleConnect = async (providerId: string) => {
    setLoading(providerId);
    setError('');

    try {
      const success = await connectOAuthProvider(providerId);
      if (!success) {
        setError(`Failed to connect ${providerId}`);
      }
    } catch (err) {
      setError(`Error connecting ${providerId}`);
      console.error('OAuth connection error:', err);
    } finally {
      setLoading(null);
      // Refresh the connected providers list
      await refreshConnectedProviders();
    }
  };

  const handleDisconnect = async (providerId: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${providerId} account?`)) {
      return;
    }

    setLoading(providerId);
    setError('');

    try {
      const success = await disconnectOAuthProvider(providerId);
      if (!success) {
        setError(`Failed to disconnect ${providerId}`);
      }
    } catch (err) {
      setError(`Error disconnecting ${providerId}`);
      console.error('OAuth disconnection error:', err);
    } finally {
      setLoading(null);
      // Refresh the connected providers list
      await refreshConnectedProviders();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white">Connected Accounts</h3>
      
      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded p-2 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {OAUTH_PROVIDERS.map(provider => {
          const isConnected = connectedProviders.includes(provider.id);
          const isLoading = loading === provider.id;

          return (
            <div 
              key={provider.id}
              className="flex items-center justify-between bg-gray-800/60 rounded-lg p-3"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{provider.icon}</span>
                <div>
                  <div className="text-white font-medium">{provider.name}</div>
                  <div className="text-gray-400 text-sm">
                    {isConnected ? 'Connected' : 'Not connected'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => isConnected ? handleDisconnect(provider.id) : handleConnect(provider.id)}
                disabled={isLoading}
                className={`px-4 py-2 rounded text-sm font-medium disabled:opacity-50 ${
                  isConnected 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  'Processing...'
                ) : isConnected ? (
                  'Disconnect'
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-gray-400 text-sm">
        Connect your social media accounts to enhance your experience and enable cross-platform features.
      </div>
    </div>
  );
};