import apiService from '../untils/api';

interface ApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardStatistics {
  documents: {
    documentsByENABLED: number;
    totalDocuments: number;
    documentsByDISABLED: number;
  };
  loans: {
    totalLoans: number;
    recentLoans: number;
    activeLoans: number;
    overdueLoans: number;
  };
  fines: {
    pendingTransactions: number;
    pendingFines: number;
    totalFineTransactions: number;
    totalFines: number;
    paidFines: number;
    paidTransactions: number;
  };
  payments: {
    totalAmount: number;
    vnpayPayments: number;
    vnpayAmount: number;
    cashAmount: number;
    cashPayments: number;
    totalPayments: number;
  };
  daily: {
    payments: number;
    newLoans: number;
    returns: number;
    newFines: number;
    newFineAmount: number;
    paymentAmount: number;
  };
  users: {
    newUsers: number;
    totalUsers: number;
    activeUsers: number;
  };
  drm: {
    recentLicenses: number;
    totalLicenses: number;
    revokedLicenses: number;
    activeLicenses: number;
  };
}

const dashboardService = {
  getAllStatistics: async (): Promise<DashboardStatistics> => {
    const response = await apiService.get<ApiResponse<DashboardStatistics>>('/api/dashboard');
    return response.data.data;
  },

  getDocumentStatistics: async (): Promise<DashboardStatistics['documents']> => {
    const response = await apiService.get<ApiResponse<DashboardStatistics['documents']>>('/api/dashboard/documents');
    return response.data.data;
  },

  getLoanStatistics: async (): Promise<DashboardStatistics['loans']> => {
    const response = await apiService.get<ApiResponse<DashboardStatistics['loans']>>('/api/dashboard/loans');
    return response.data.data;
  },

  getUserStatistics: async (): Promise<DashboardStatistics['users']> => {
    const response = await apiService.get<ApiResponse<DashboardStatistics['users']>>('/api/dashboard/users');
    return response.data.data;
  },

  getDrmStatistics: async (): Promise<DashboardStatistics['drm']> => {
    const response = await apiService.get<ApiResponse<DashboardStatistics['drm']>>('/api/dashboard/drm');
    return response.data.data;
  },

  getFineStatistics: async (): Promise<DashboardStatistics['fines']> => {
    const response = await apiService.get<ApiResponse<DashboardStatistics['fines']>>('/api/dashboard/fines');
    return response.data.data;
  },

  getPaymentStatistics: async (): Promise<DashboardStatistics['payments']> => {
    const response = await apiService.get<ApiResponse<DashboardStatistics['payments']>>('/api/dashboard/payments');
    return response.data.data;
  },

  getDailyStatistics: async (): Promise<DashboardStatistics['daily']> => {
    const response = await apiService.get<ApiResponse<DashboardStatistics['daily']>>('/api/dashboard/daily');
    return response.data.data;
  },

//   getMonthlyStatistics: async () => {
//     const response = await apiService.get('/api/dashboard/monthly');
//     return response.data.data;
//   },

//   getYearlyStatistics: async () => {
//     const response = await apiService.get('/api/dashboard/yearly');
//     return response.data.data;
//   },
};

export default dashboardService; 