/**
 * Authentication Context Provider
 * Manages user authentication state and tokens
 */
import { createContext, useState, useEffect, ReactNode } from 'react';
import { registerUser, loginUser, getCurrentUser, logoutUser, User, UserRegister, UserLogin } from '../api/auth';
import apiClient from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserRegister) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and user from localStorage on mount
  useEffect(() => {
    const loadAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');

      if (savedToken && savedUser) {
        try {
          // Validate token by fetching current user
          const currentUser = await getCurrentUser(savedToken);
          setToken(savedToken);
          setUser(currentUser);
          
          // Set default authorization header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      
      setIsLoading(false);
    };

    loadAuth();
  }, []);

  const login = async (credentials: UserLogin) => {
    const response = await loginUser(credentials);
    
    // Save to state
    setUser(response.user);
    setToken(response.token.access_token);
    
    // Save to localStorage
    localStorage.setItem('auth_token', response.token.access_token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    
    // Set default authorization header
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.token.access_token}`;
  };

  const register = async (userData: UserRegister) => {
    const response = await registerUser(userData);
    
    // Save to state
    setUser(response.user);
    setToken(response.token.access_token);
    
    // Save to localStorage
    localStorage.setItem('auth_token', response.token.access_token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    
    // Set default authorization header
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.token.access_token}`;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Remove authorization header
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
