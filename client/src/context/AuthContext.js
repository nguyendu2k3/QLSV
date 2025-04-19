import React, { createContext, useState, useContext, useEffect } from 'react';
// Sửa lại import jwt-decode
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Sửa jwt_decode thành jwtDecode
        const decoded = jwtDecode(token);
        // Kiểm tra nếu có thông tin user được lưu trữ
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setAuthState({
            user: JSON.parse(storedUser),
            token: token,
            loading: false
          });
        } else {
          setAuthState({
            user: decoded,
            token: token,
            loading: false
          });
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          token: null,
          loading: false
        });
      }
    } else {
      setAuthState({
        user: null,
        token: null,
        loading: false
      });
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setAuthState({
      user: userData,
      token: token,
      loading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      loading: false
    });
  };
  
  // Cập nhật hàm updateUser để lưu thông tin người dùng vào localStorage
  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setAuthState(prev => ({
      ...prev,
      user: userData
    }));
  };

  const value = {
    authState,
    user: authState.user, // Duy trì backward compatibility
    login,
    logout,
    updateUser,
    loading: authState.loading // Duy trì backward compatibility
  };

  return (
    <AuthContext.Provider value={value}>
      {!authState.loading && children}
    </AuthContext.Provider>
  );
};