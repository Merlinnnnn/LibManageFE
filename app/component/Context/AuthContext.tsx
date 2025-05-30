import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../../untils/api';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';  // Import thư viện jwt-decode
import { AxiosError } from 'axios'; // Import AxiosError

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

interface AuthContextType {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkTokenValidity: () => Promise<void>;
  loginGoogle: () => Promise<void>;
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
      
      const userInfo = userInfoResponse.data.data; // ✅ Đúng: Vì interface đã có `data`
      localStorage.setItem("info", JSON.stringify(userInfo));
      console.log(userInfo);
      
      const roles = userInfo.roles;
      const isAdmin = roles.includes('ADMIN');
      if (isAdmin) {
        router.push('/user_dashboard');
      } else {
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
        firstName: 'John',
        lastName: 'Doe',
        dob: '1990-01-01',
        phoneNumber: '1234567890',
        address: '123 Main St',
      };

      const response = await apiService.post('/api/v1/users', fixedData);
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
    try {
      const response = await apiService.post('/api/v1/auth/login-google');
      console.log(response);
      // Mở cửa sổ popup để đăng nhập Google
      // const width = 500;
      // const height = 600;
      // const left = window.screenX + (window.outerWidth - width) / 2;
      // const top = window.screenY + (window.outerHeight - height) / 2;
      
      // const popup = window.open(
      //   'http://localhost:8009/api/v1/auth/google',
      //   'Google Login',
      //   `width=${width},height=${height},left=${left},top=${top}`
      // );

      // // Lắng nghe message từ popup
      // window.addEventListener('message', async (event) => {
      //   if (event.origin !== window.location.origin) return;
        
      //   if (event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
      //     const { token } = event.data;
      //     localStorage.setItem('access_token', token);
      //     setToken(token);

      //     // Lấy thông tin người dùng
      //     const userInfoResponse = await apiService.get<UserInfoResponse>('/api/v1/users/info', {
      //       headers: { Authorization: `Bearer ${token}` }
      //     });
          
      //     const userInfo = userInfoResponse.data.data;
      //     localStorage.setItem("info", JSON.stringify(userInfo));
          
      //     const roles = userInfo.roles;
      //     const isAdmin = roles.includes('ADMIN');
      //     if (isAdmin) {
      //       router.push('/user_dashboard');
      //     } else {
      //       router.push('/home');
      //     }
      //   }
      // });
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, signup, checkTokenValidity, loginGoogle }}>
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
