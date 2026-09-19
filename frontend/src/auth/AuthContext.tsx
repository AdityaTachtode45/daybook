import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { User, Profile, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get<Profile>('/profile');
      setProfile(res.data);
      setUser((prevUser) => ({
        id: res.data.userId,
        email: res.data.email,
        createdAt: prevUser?.createdAt || new Date().toISOString(),
      }));
      return res.data;
    } catch (err) {
      console.error('Failed to fetch profile', err);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('daybook_access_token');
      if (token) {
        try {
          const res = await api.get<Profile>('/profile');
          setProfile(res.data);
          setUser({
            id: res.data.userId,
            email: res.data.email,
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          localStorage.removeItem('daybook_access_token');
          localStorage.removeItem('daybook_refresh_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('daybook_access_token', res.data.accessToken);
    localStorage.setItem('daybook_refresh_token', res.data.refreshToken);
    setUser(res.data.user);
    await fetchProfile();
  };

  const register = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/register', { email, password });
    localStorage.setItem('daybook_access_token', res.data.accessToken);
    localStorage.setItem('daybook_refresh_token', res.data.refreshToken);
    setUser(res.data.user);
    await fetchProfile();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('daybook_access_token');
      localStorage.removeItem('daybook_refresh_token');
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user || !!localStorage.getItem('daybook_access_token'),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
