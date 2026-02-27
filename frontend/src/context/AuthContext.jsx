/**
 * Authentication Context
 * AI Comic Strip Challenge 2026
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    
    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
      setUser({ token: storedToken, role: storedRole });
    }
    setLoading(false);
  }, []);

  const register = async (email, password) => {
    try {
      const response = await authService.register({ email, password });
      const { access_token, role: userRole } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', userRole);
      
      // Update state
      setToken(access_token);
      setRole(userRole);
      setUser({ token: access_token, role: userRole });
      
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { access_token, role: userRole } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', userRole);
      
      // Update state
      setToken(access_token);
      setRole(userRole);
      setUser({ token: access_token, role: userRole });
      
      toast.success('Login successful!');
      return { success: true, role: userRole };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    role,
    loading,
    isAuthenticated: !!token,
    isAdmin: role === 'admin',
    isStudent: role === 'student',
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
