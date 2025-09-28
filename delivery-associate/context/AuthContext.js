// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me/delivery-associate', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser({ ...data.data, token });
        } catch (e) {
          setUser(null);
          console.error('AuthContext bootstrap error:', e);
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, []);

  const login = async (phone, password) => {
    setAuthLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login/delivery-associate', {
        phone,
        password,
      });
      const token = data.data.token;
      await AsyncStorage.setItem('access_token', token);
      // Fetch user profile after login
      const profileRes = await api.get('/auth/me/delivery-associate', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...profileRes.data.data, token });
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Login failed');
      console.error('AuthContext login error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
