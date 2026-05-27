import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthAPI } from '@/services/api';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'busman';
  isActive: boolean;
  avatar?: string;
  assignedRoute?: {
    _id: string;
    name: string;
    code: string;
    fare: number;
    distance: number;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: {
    fullName?: string;
    email?: string;
    phone?: string;
  }) => Promise<void>;
  updatePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
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
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        if (AuthAPI.isAuthenticated()) {
          // First try to get user from localStorage for immediate UI update
          const cachedUser = AuthAPI.getCurrentUser();
          if (cachedUser) {
            setUser(cachedUser as User);
          }
          
          // Then verify with server
          const userData = await AuthAPI.getMe();
          setUser(userData as User);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        AuthAPI.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await AuthAPI.login(credentials);
      setUser((response as any).user as User);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      const response = await AuthAPI.register(userData);
      setUser((response as any).user as User);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthAPI.logout();
    setUser(null);
  };

  const updateProfile = async (profileData: {
    fullName?: string;
    email?: string;
    phone?: string;
  }) => {
    try {
      const updatedUser = await AuthAPI.updateProfile(profileData);
      setUser(updatedUser as User);
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      await AuthAPI.updatePassword(passwordData);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

