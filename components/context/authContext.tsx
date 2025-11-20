// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, login as apiLogin, logout as apiLogout, register as apiRegister, fetchCurrentUser } from '../../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // load current user on mount
  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchCurrentUser();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load current user', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    if (res.success && res.user) {
      setUser(res.user);
      return true;
    } else {
      alert(res.message || 'Login failed');
      return false;
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    const res = await apiRegister(username, email, password);
    if (res.success && res.user) {
      setUser(res.user);
      return true;
    } else {
      alert(res.message || 'Registration failed');
      return false;
    }
  };

  const handleLogout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
