import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../../untils/api';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';  // Import thư viện jwt-decode
import { AxiosError } from 'axios'; // Import AxiosError
import { API_BASE_URL } from '@/app/untils/apiConfig';

// Định nghĩa interface cho response của API
interface LoginResponse {
  code: number;
  data: {
    authenticated: boolean;
    token: string;
  };
}
interface UserInfoResponse {
  code: number;
  success: boolean;
  data: {
    roles: string[];
    fullName: string;
    username: string;
  };
}

interface IntrospectResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    active: boolean;
  };
}

interface ResetPasswordResponse {
  code: number;
  success: boolean;
  message: string;
  data: null;
}

interface AuthContextType {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkTokenValidity: () => Promise<void>;
  loginGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
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
      const authToken = response.data.data.token;
      localStorage.setItem('access_token', authToken);
      setToken(authToken);

      const userInfoResponse = await apiService.get<UserInfoResponse>('/api/v1/users/info', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const userInfo = userInfoResponse.data.data;
      localStorage.setItem("info", JSON.stringify(userInfo));
      console.log('User info:', userInfo);
      
      const roles = userInfo.roles;
      console.log('User roles:', roles);
      const isAdminOrManager = roles.includes('ADMIN') || roles.includes('MANAGER');
      // const isManager = roles.includes('MANAGER');
      // console.log('Is Admin:', isAdmin, 'Is Manager:', isManager);
      console.log('Is Admin or Manager:', isAdminOrManager);
      
      if (isAdminOrManager) {
        console.log('Redirecting to user_dashboard...');
        router.push('/user_dashboard');
      } else {
        console.log('Redirecting to home...');
        router.push('/home');
      }
    } catch (error) {
      console.log('Đăng nhập thất bại:', error);
      alert('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
    }
  };

  const logout = async () => {
    sessionStorage.clear(); // Xóa tất cả dữ liệu phiên
    localStorage.clear(); // Xóa token khỏi localStorage
    router.push('/login');
    setToken(null);
  };

  const signup = async (username: string, password: string) => {
    try {
      const fixedData = {
        username,
        password,
        confirmPassword: password,
      };

      const response = await apiService.post('/api/v1/auth/register', fixedData);
      console.log('Đăng ký thành công:', response);
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (error) {
      console.log('Đăng ký thất bại:', error);
      alert('Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  const checkTokenValidity = async () => {
    const currentToken = localStorage.getItem('access_token');

    if (!currentToken) {
      logout();
      return;
    }

    try {
      const response = await apiService.post<IntrospectResponse>('/api/v1/auth/introspect', {
        token: currentToken,
      });
      console.log('response token check: ', response);
      console.log(response.data?.data?.active);
      
      if (!response.data?.success || !response.data?.data?.active) {
        console.log('Token is invalid or inactive. Logging out.');
        logout();
      } else {
        console.log('Token is valid and active.');
      }

    } catch (error: any) {
      console.error('Error checking token validity:', error);
      console.log('API call to check token validity failed. Logging out.');
      logout();
    }
  };

  const loginGoogle = async () => {
    const googleLoginUrl = `${API_BASE_URL}/oauth2/authorization/google`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Mở popup
    const popup = window.open(
      googleLoginUrl,
      'GoogleLogin',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Lắng nghe message từ popup
    const handleMessage = (event: MessageEvent) => {
      // Có thể kiểm tra event.origin nếu cần
      const { token, info } = event.data || {};
      if (token && info) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('info', JSON.stringify(info));
        setToken(token);
        router.push('/home');
      }
      window.removeEventListener('message', handleMessage);
      popup?.close();
    };

    window.addEventListener('message', handleMessage);
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await apiService.post<ResetPasswordResponse>('/api/v1/auth/request-password-reset', {
        email
      });
      
      if (response.data.success) {
        alert('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.');
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, signup, checkTokenValidity, loginGoogle, resetPassword }}>
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
