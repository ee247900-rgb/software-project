import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to catch 401/403 auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.response.data && error.response.data.error === 'Invalid username or password') {
        // Handled by login form
      } else {
        // Token expired or forbidden
        if (localStorage.getItem('auth_token')) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

// Staff Services
export const staffService = {
  getAll: async (search = '') => {
    const res = await api.get(`/staff?search=${encodeURIComponent(search)}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/staff/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/staff', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/staff/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/staff/${id}`);
    return res.data;
  }
};

// Shift Services
export const shiftService = {
  getAll: async () => {
    const res = await api.get('/shifts');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/shifts', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/shifts/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/shifts/${id}`);
    return res.data;
  }
};

// Schedule Services
export const scheduleService = {
  assign: async (data) => {
    const res = await api.post('/schedules', data);
    return res.data;
  },
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.staff_id) params.append('staff_id', filters.staff_id);
    if (filters.department) params.append('department', filters.department);
    if (filters.date) params.append('date', filters.date);
    if (filters.shift_id) params.append('shift_id', filters.shift_id);
    if (filters.status) params.append('status', filters.status);
    const res = await api.get(`/schedules?${params.toString()}`);
    return res.data;
  },
  getMySchedule: async () => {
    const res = await api.get('/schedules/my');
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/schedules/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/schedules/${id}`);
    return res.data;
  }
};

// Leave Services
export const leaveService = {
  apply: async (data) => {
    const res = await api.post('/leave', data);
    return res.data;
  },
  getMyRequests: async () => {
    const res = await api.get('/leave/my');
    return res.data;
  },
  cancel: async (id) => {
    const res = await api.put(`/leave/${id}/cancel`);
    return res.data;
  },
  getAll: async (status = 'All') => {
    const res = await api.get(`/leave?status=${encodeURIComponent(status)}`);
    return res.data;
  },
  review: async (id, status) => {
    const res = await api.put(`/leave/${id}/review`, { status });
    return res.data;
  }
};

// Attendance Services
export const attendanceService = {
  checkIn: async () => {
    const res = await api.post('/attendance/check-in');
    return res.data;
  },
  checkOut: async () => {
    const res = await api.post('/attendance/check-out');
    return res.data;
  },
  getTodayStatus: async () => {
    const res = await api.get('/attendance/today');
    return res.data;
  },
  getMyAttendance: async () => {
    const res = await api.get('/attendance/my');
    return res.data;
  },
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.staff_id) params.append('staff_id', filters.staff_id);
    if (filters.from_date && filters.to_date) {
      params.append('from_date', filters.from_date);
      params.append('to_date', filters.to_date);
    }
    const res = await api.get(`/attendance?${params.toString()}`);
    return res.data;
  }
};

// Report Services
export const reportService = {
  getStats: async () => {
    const res = await api.get('/reports/stats');
    return res.data;
  },
  generate: async (report_type, from_date = '', to_date = '') => {
    const params = new URLSearchParams({ report_type });
    if (from_date) params.append('from_date', from_date);
    if (to_date) params.append('to_date', to_date);
    const res = await api.get(`/reports/generate?${params.toString()}`);
    return res.data;
  }
};

export default api;
