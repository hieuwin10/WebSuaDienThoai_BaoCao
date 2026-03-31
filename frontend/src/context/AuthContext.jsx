/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

function getTokenFromLoginResponse(data) {
  if (typeof data === 'string') {
    return data;
  }

  return data?.token || data?.TOKEN_NNPTUD_C3 || null;
}

function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function saveAuthStorage(token, profile) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(profile));
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreLoginFromLocalStorage = () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (!savedToken || !savedUser) {
        setLoading(false);
        return;
      }

      try {
        setUser(JSON.parse(savedUser));
      } catch {
        clearAuthStorage();
      } finally {
        setLoading(false);
      }
    };

    restoreLoginFromLocalStorage();
  }, []);

  const login = async (username, password) => {
    try {
      const loginResponse = await api.post('/auth/login', { username, password });
      const token = getTokenFromLoginResponse(loginResponse.data);
      if (!token) {
        return { success: false, message: 'Khong lay duoc token dang nhap' };
      }

      const userResponse = await api.get('/auth/me');
      const profile = userResponse.data;

      saveAuthStorage(token, profile);
      setUser(profile);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Dang nhap that bai',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      clearAuthStorage();
      setUser(null);
    }
  };

  const authValue = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role?.name === 'ADMIN',
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
