/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';

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
        return { success: false, message: 'Không lấy được mã đăng nhập từ máy chủ.' };
      }

      // Gắn token trước khi gọi /auth/me — interceptor axios chỉ đọc từ localStorage
      localStorage.setItem('token', token);

      const userResponse = await api.get('/auth/me');
      const profile = userResponse.data;

      saveAuthStorage(token, profile);
      setUser(profile);

      return { success: true };
    } catch (err) {
      localStorage.removeItem('token');
      return {
        success: false,
        message: getApiErrorMessage(
          err,
          'Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập và mật khẩu.'
        ),
      };
    }
  };

  /** Đồng bộ user trong layout/header sau khi đổi ảnh hồ sơ, v.v. */
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const userResponse = await api.get('/auth/me');
      const nextUser = userResponse.data;
      saveAuthStorage(token, nextUser);
      setUser(nextUser);
    } catch {
      /* giữ user cũ nếu /me lỗi tạm thời */
    }
  }, []);

  // Phiên bản cũ lưu user không có profile — gọi /me một lần để có avatar header
  useEffect(() => {
    if (loading || !user) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!Object.prototype.hasOwnProperty.call(user, 'profile')) {
      refreshUser();
    }
  }, [loading, user, refreshUser]);

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

  const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
  const isStaff = roleName === 'ADMIN' || roleName === 'MODERATOR';

  const authValue = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAdmin: user?.role?.name === 'ADMIN' || roleName === 'ADMIN',
    isStaff,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
