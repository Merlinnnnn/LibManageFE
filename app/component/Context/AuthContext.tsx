import React, { createContext, useContext, useState, useEffect } from 'react';

import apiService from '../../untils/api';
import { useRouter } from 'next/navigation';


interface AuthContextType {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {

    const savedToken = sessionStorage.getItem('access_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiService.post<{ token: string }>('/api/v1/auth/login', {
        username,
        password,
      });
      const authToken = response.data.token;

      sessionStorage.setItem('access_token', authToken);
      setToken(authToken);

      router.push('/home');
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      alert('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
    }
  };

  const logout = () => {
    // Xóa token khỏi sessionStorage và cập nhật state
    sessionStorage.removeItem('access_token');
    setToken(null);
    // Chuyển hướng người dùng đến trang đăng nhập
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
