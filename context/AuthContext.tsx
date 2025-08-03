
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthContextType, User, AuthState } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  useEffect(() => {
    // Mock: Check local storage for existing session
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('authUserEmail');
    if (token && userEmail) {
      setAuthState({
        isAuthenticated: true,
        user: { id: 'mockId', email: userEmail },
        token: token,
      });
    }
  }, []);

  const login = (email: string, token: string) => {
    const user: User = { id: 'mockId', email }; // Simplified user object
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUserEmail', email);
    setAuthState({ isAuthenticated: true, user, token });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUserEmail');
    setAuthState({ isAuthenticated: false, user: null, token: null });
  };
  
  const signup = (email: string, token: string) => {
    // For mock purposes, signup is similar to login
    login(email, token);
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
