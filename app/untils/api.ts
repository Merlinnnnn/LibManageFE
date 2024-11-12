import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
    private api: AxiosInstance;

    constructor(baseURL: string) {
        this.api = axios.create({
            baseURL,
            // headers: {
            //     'Content-Type': 'application/json',
            // },
        });

        this.api.interceptors.request.use(
            config => {
                if (typeof window !== 'undefined') {
                    const token = sessionStorage.getItem('access_token');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.post<T>(url, data, config);
    }
    get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.get<T>(url, config);
    }
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.put<T>(url, data, config);
    }
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.delete<T>(url, config);
    }
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.patch<T>(url, data, config);
    }
}

const apiService = new ApiService('http://localhost:8009');

export default apiService;
