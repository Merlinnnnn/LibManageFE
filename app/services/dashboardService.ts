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
    typeDistribution?: Record<string, number>;
    totalByType?: Record<string, number>;
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
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    roleDistribution: {
      role: string;
      count: number;
    }[];
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
    const response = await apiService.get<any>('/api/dashboard/documents/by-type');
    if (Array.isArray(response.data.data)) {
      return response.data.data[0];
    }
    return response.data.data;
  },

  getLoanStatistics: async (): Promise<DashboardStatistics['loans']> => {
    const response = await apiService.get<ApiResponse<DashboardStatistics['loans']>>('/api/dashboard/loans');
    return response.data.data;
  },

  async getUserStatistics(): Promise<DashboardStatistics['users']> {
    try {
      const response = await apiService.get<{ data: { content: any[] } }>('/api/v1/users');
      const users = response.data.data.content;
      
      // Tính toán thống kê
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.isActive === 'ACTIVE').length;
      const newUsers = users.filter(user => {
        const createdDate = new Date(user.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7; // Người dùng mới trong 7 ngày
      }).length;

      // Tính toán phân bố roles
      const roleCounts = users.reduce((acc: { [key: string]: number }, user) => {
        user.roles.forEach((role: string) => {
          acc[role] = (acc[role] || 0) + 1;
        });
        return acc;
      }, {});

      const roleDistribution = Object.entries(roleCounts).map(([role, count]) => ({
        role,
        count
      }));

      return {
        totalUsers,
        activeUsers,
        newUsers,
        roleDistribution
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
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

  getDocumentStatusStatistics: async (): Promise<DashboardStatistics['documents']> => {
    const response = await apiService.get<ApiResponse<DashboardStatistics['documents']>>('/api/dashboard/documents');
    return response.data.data;
  },

  getDocumentTypeStatistics: async (): Promise<{ typeDistribution?: Record<string, number>; totalByType?: Record<string, number>; }> => {
    const response = await apiService.get<any>('/api/dashboard/documents/by-type');
    if (Array.isArray(response.data.data)) {
      return response.data.data[0];
    }
    return response.data.data;
  },

  getLoanStatisticsByDateRange: async (startDate: string, endDate: string) => {
    const response = await apiService.get<any>(`/api/dashboard/loans/statistics/date-range?startDate=${startDate}&endDate=${endDate}`);
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