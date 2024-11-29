import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../../untils/api';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';  // Import thư viện jwt-decode

// Định nghĩa interface cho response của API
interface LoginResponse {
  code: number;
  result: {
    authenticated: boolean;
    token: string;
  };
}

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
      const response = await apiService.post<LoginResponse>('/api/v1/auth/login', {
        username,
        password,
      });
      console.log(response)
      const authToken = response.data.result.token;

      const decodedToken: any = jwtDecode(authToken);
      const fullName = decodedToken.fullName;
      const role = decodedToken.scope
      sessionStorage.setItem('access_token', authToken);
      sessionStorage.setItem('fullname', fullName);
      sessionStorage.setItem('role', role);
      setToken(authToken);

      if (role === 'ROLE_ADMIN') {
        router.push('/user_dashboard');
    } else {
        router.push('/home');
    }
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      alert('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
    }
  };

  const logout = async () => {
    try {
      await apiService.post('/api/v1/auth/logout', token);

      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('fullname');
      setToken(null);

      router.push('/login');
    } catch (error) {
      console.error('Đăng xuất thất bại:', error);
      alert('Đăng xuất thất bại. Vui lòng thử lại.');
    }
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
