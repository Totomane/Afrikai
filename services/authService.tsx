/// <reference types="vite/client" />

// src/services/authService.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

export const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/auth/register/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return res.json();
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const logout = async (): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.json();
};

export const fetchCurrentUser = async (): Promise<{ authenticated: boolean; user: AuthUser | null }> => {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!res.ok) {
      console.log('Auth API not responding or error:', res.status);
      return { authenticated: false, user: null };
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return { authenticated: false, user: null };
  }
};
