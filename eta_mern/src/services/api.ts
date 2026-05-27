import { DashboardStats, Route, Schedule, Station, Ticket, RevenueByDay, RevenueByRoute } from "@/types/models";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
};

// Auth API
export const AuthAPI = {
  register: async (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },

  updateProfile: async (profileData: {
    fullName?: string;
    email?: string;
    phone?: string;
  }) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  updatePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Stations API
export const StationsAPI = {
  getAll: async (): Promise<Station[]> => {
    return apiRequest<Station[]>('/stations');
  },

  getById: async (id: string): Promise<Station> => {
    return apiRequest<Station>(`/stations/${id}`);
  },

  create: async (station: Omit<Station, "id">): Promise<Station> => {
    return apiRequest<Station>('/stations', {
      method: 'POST',
      body: JSON.stringify(station),
    });
  },

  update: async (id: string, station: Partial<Station>): Promise<Station> => {
    return apiRequest<Station>(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(station),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/stations/${id}`, {
      method: 'DELETE',
    });
  },
};

// Routes API
export const RoutesAPI = {
  getAll: async (): Promise<Route[]> => {
    return apiRequest<Route[]>('/routes');
  },

  getPopular: async (limit: number = 6): Promise<Route[]> => {
    return apiRequest<Route[]>(`/routes/popular?limit=${limit}`);
  },

  getById: async (id: string): Promise<Route> => {
    return apiRequest<Route>(`/routes/${id}`);
  },

  create: async (route: Omit<Route, "id">): Promise<Route> => {
    return apiRequest<Route>('/routes', {
      method: 'POST',
      body: JSON.stringify(route),
    });
  },

  update: async (id: string, route: Partial<Route>): Promise<Route> => {
    return apiRequest<Route>(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(route),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/routes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Schedules API
export const SchedulesAPI = {
  getAll: async (params?: {
    route?: string;
    date?: string;
    status?: string;
  }): Promise<Schedule[]> => {
    const queryParams = new URLSearchParams();
    if (params?.route) queryParams.append('route', params.route);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/schedules?${queryString}` : '/schedules';
    
    return apiRequest<Schedule[]>(endpoint);
  },

  getById: async (id: string): Promise<Schedule> => {
    return apiRequest<Schedule>(`/schedules/${id}`);
  },

  search: async (searchParams: {
    from: string;
    to: string;
    date: string;
  }): Promise<Schedule[]> => {
    const queryParams = new URLSearchParams(searchParams);
    return apiRequest<Schedule[]>(`/schedules/search?${queryParams.toString()}`);
  },

  getSeatAvailability: async (scheduleId: string): Promise<{
    scheduleId: string;
    totalSeats: number;
    availableSeats: number;
    occupiedSeats: string[];
    seatLayout: Array<{
      number: string;
      index: number;
      available: boolean;
    }>;
  }> => {
    return apiRequest(`/schedules/${scheduleId}/seats`);
  },

  create: async (schedule: Omit<Schedule, "id">): Promise<Schedule> => {
    return apiRequest<Schedule>('/schedules', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  },

  update: async (id: string, schedule: Partial<Schedule>): Promise<Schedule> => {
    return apiRequest<Schedule>(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schedule),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/schedules/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin methods
  getStats: async (): Promise<any> => {
    return apiRequest('/schedules/stats');
  },

  updateStatus: async (id: string, status: string): Promise<Schedule> => {
    return apiRequest<Schedule>(`/schedules/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  bulkUpdate: async (schedules: Array<{ id: string; data: any }>): Promise<Schedule[]> => {
    return apiRequest<Schedule[]>('/schedules/bulk', {
      method: 'PUT',
      body: JSON.stringify({ schedules }),
    });
  },

  // Busman methods
  getBusmanSchedules: async (): Promise<Schedule[]> => {
    return apiRequest<Schedule[]>('/schedules/busman/my-schedules');
  },
};

// Tickets API
export const TicketsAPI = {
  getAll: async (params?: {
    status?: string;
    user?: string;
    page?: number;
    limit?: number;
  }): Promise<Ticket[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.user) queryParams.append('user', params.user);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tickets?${queryString}` : '/tickets';
    
    return apiRequest(endpoint);
  },

  getMyTickets: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Ticket[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tickets/my-tickets?${queryString}` : '/tickets/my-tickets';
    
    return apiRequest(endpoint);
  },

  getById: async (id: string): Promise<Ticket> => {
    return apiRequest<Ticket>(`/tickets/${id}`);
  },

  create: async (ticketData: {
    scheduleId: string;
    passengerName: string;
    passengerEmail: string;
    passengerPhone: string;
    seatNumber: string;
    paymentMethod: string;
    price: number;
  }): Promise<Ticket> => {
    return apiRequest<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  },

  createGuest: async (ticketData: {
    scheduleId: string;
    passengerName: string;
    passengerEmail: string;
    passengerPhone: string;
    seatNumber: string;
    paymentMethod: string;
    price: number;
  }): Promise<Ticket> => {
    // Guest booking doesn't require authentication
    const response = await fetch(`${API_BASE_URL}/tickets/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  update: async (id: string, ticketData: {
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentReference?: string;
    cancellationReason?: string;
  }): Promise<Ticket> => {
    return apiRequest<Ticket>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    });
  },

  confirm: async (id: string, paymentData: {
    paymentReference?: string;
  }): Promise<Ticket> => {
    return apiRequest<Ticket>(`/tickets/${id}/confirm`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  },

  checkIn: async (id: string, scheduleId?: string): Promise<Ticket> => {
    return apiRequest<Ticket>(`/tickets/${id}/checkin`, {
      method: 'PUT',
      body: JSON.stringify({ scheduleId }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/tickets/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin methods
  getStats: async (): Promise<any> => {
    return apiRequest('/tickets/stats');
  },

  getByDateRange: async (params: {
    startDate: string;
    endDate: string;
    status?: string;
  }): Promise<Ticket[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    if (params.status) queryParams.append('status', params.status);
    
    return apiRequest<Ticket[]>(`/tickets/date-range?${queryParams.toString()}`);
  },

  getBySchedule: async (scheduleId: string, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Ticket[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tickets/schedule/${scheduleId}?${queryString}` : `/tickets/schedule/${scheduleId}`;
    
    return apiRequest(endpoint);
  },

  cancel: async (id: string, data: { cancellationReason?: string }): Promise<Ticket> => {
    return apiRequest<Ticket>(`/tickets/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  refund: async (id: string, data: { refundAmount?: number; refundReason?: string }): Promise<Ticket> => {
    return apiRequest<Ticket>(`/tickets/${id}/refund`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  bulkUpdate: async (tickets: Array<{ id: string; data: any }>): Promise<Ticket[]> => {
    return apiRequest<Ticket[]>('/tickets/bulk', {
      method: 'PUT',
      body: JSON.stringify({ tickets }),
    });
  },
};

// Dashboard API
export const DashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    return apiRequest<DashboardStats>('/dashboard/stats');
  },

  getRevenueByDay: async (): Promise<RevenueByDay[]> => {
    return apiRequest<RevenueByDay[]>('/dashboard/revenue-by-day');
  },

  getRevenueByRoute: async (): Promise<RevenueByRoute[]> => {
    return apiRequest<RevenueByRoute[]>('/dashboard/revenue-by-route');
  },

  getAnalytics: async (period?: string): Promise<any> => {
    const endpoint = period ? `/dashboard/analytics?period=${period}` : '/dashboard/analytics';
    return apiRequest(endpoint);
  },
};

// Busman API
export const BusmanAPI = {
  getAll: async (params?: {
    route?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.route) queryParams.append('route', params.route);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/auth/busmen?${queryString}` : '/auth/busmen';
    
    return apiRequest(endpoint);
  },

  getById: async (id: string): Promise<any> => {
    return apiRequest(`/auth/busmen/${id}`);
  },

  create: async (busmanData: {
    fullName: string;
    email: string;
    phone: string;
    routeId: string;
  }): Promise<any> => {
    return apiRequest('/auth/busmen', {
      method: 'POST',
      body: JSON.stringify(busmanData),
    });
  },

  update: async (id: string, busmanData: {
    fullName?: string;
    phone?: string;
    routeId?: string;
  }): Promise<any> => {
    return apiRequest(`/auth/busmen/${id}`, {
      method: 'PUT',
      body: JSON.stringify(busmanData),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/auth/busmen/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export all APIs
export default {
  AuthAPI,
  StationsAPI,
  RoutesAPI,
  SchedulesAPI,
  TicketsAPI,
  DashboardAPI,
  BusmanAPI,
};