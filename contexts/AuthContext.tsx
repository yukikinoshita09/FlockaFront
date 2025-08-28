import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, tokenManager } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log('Checking auth status...');
      
      // トークンが存在するかチェック
      const token = await tokenManager.get();
      if (!token) {
        console.log('No token found');
        setUser(null);
        return;
      }
      
      const isValid = await apiClient.validateToken();
      console.log('Token validation result:', isValid);
      
      if (isValid) {
        const userData = await apiClient.getCurrentUser();
        console.log('User data retrieved:', userData);
        setUser(userData as User);
      } else {
        console.log('Token invalid, clearing user state');
        setUser(null);
        await apiClient.logout(); // トークンを削除
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      await apiClient.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const loginResponse = await apiClient.login(email, password);
      setUser(loginResponse.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
