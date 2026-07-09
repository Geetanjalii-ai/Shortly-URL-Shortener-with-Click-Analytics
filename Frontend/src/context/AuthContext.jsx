import { createContext, useContext, useState, useEffect } from 'react';
import { writeApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'dashboard'

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('shortly_token');
    const storedUser = localStorage.getItem('shortly_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setCurrentView('dashboard'); // Auto redirect to dashboard if already logged in
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await writeApi.post('/api/auth/login', { username, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('shortly_token', token);
      localStorage.setItem('shortly_user', JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      setCurrentView('dashboard'); // Redirect to dashboard on login
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Invalid credentials or connection error.';
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await writeApi.post('/api/auth/register', { username, email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('shortly_token', token);
      localStorage.setItem('shortly_user', JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      setCurrentView('dashboard'); // Redirect to dashboard on register
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.error || 'Username/email already taken or connection error.';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('shortly_token');
    localStorage.removeItem('shortly_user');
    setToken(null);
    setUser(null);
    setCurrentView('home'); // Go to home on logout
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, currentView, setCurrentView }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
