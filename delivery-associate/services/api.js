import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../constants/config';

// Create axios instance
const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Do not add Authorization header for login, register, refresh-token
    const authEndpoints = [
      CONFIG.ENDPOINTS.AUTH.LOGIN,
      CONFIG.ENDPOINTS.AUTH.REGISTER,
      CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
    ];
    if (authEndpoints.some((ep) => config.url.endsWith(ep))) {
      return config;
    }
    try {
      const token = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      console.log('🔐 API Request - URL:', config.url);
      console.log('🔐 API Request - Token:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
      console.log('🔐 API Request - Method:', config.method?.toUpperCase());
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ API Request - Authorization header set');
      } else {
        console.log('❌ API Request - No token found');
      }
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API Response - Success:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.log('API Response - Error:', error.config?.url, error.response?.status, error.response?.data);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);

        if (refreshToken) {
          const response = await axios.post(
            `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        await AsyncStorage.multiRemove([
          CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
          CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
          CONFIG.STORAGE_KEYS.USER_DATA,
        ]);

        // You can emit an event here to notify the app to redirect to login
        // EventBus.emit('AUTH_EXPIRED');
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post(CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),
  register: (userData) => api.post(CONFIG.ENDPOINTS.AUTH.REGISTER, userData),
  logout: () => api.post(CONFIG.ENDPOINTS.AUTH.LOGOUT),
  forgotPassword: (email) => api.post(CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: (token, password) => api.post(`${CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`, { password }),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const supplierAPI = {
  getProfile: () => api.get(CONFIG.ENDPOINTS.SUPPLIER.PROFILE),
  updateProfile: (data) => api.put(CONFIG.ENDPOINTS.SUPPLIER.UPDATE_PROFILE, data),
  updateLogo: (formData) => api.put(CONFIG.ENDPOINTS.SUPPLIER.UPDATE_LOGO, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateAddress: (addressData) => api.put(CONFIG.ENDPOINTS.SUPPLIER.UPDATE_ADDRESS, addressData),
  updateBankDetails: (bankDetailsData) => api.put(CONFIG.ENDPOINTS.SUPPLIER.UPDATE_BANK_DETAILS, bankDetailsData),
  uploadVerificationDocument: (formData) => api.post(CONFIG.ENDPOINTS.SUPPLIER.UPLOAD_DOCUMENT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDashboardStats: () => api.get(CONFIG.ENDPOINTS.SUPPLIER.DASHBOARD_STATS),
};

export const productsAPI = {
  getProducts: (params) => api.get(CONFIG.ENDPOINTS.PRODUCTS.LIST, { params }),
  createProduct: (data) => {
    // If data is FormData, let the browser set the Content-Type header automatically
    if (data instanceof FormData) {
      return api.post(CONFIG.ENDPOINTS.PRODUCTS.CREATE, data);
    }
    return api.post(CONFIG.ENDPOINTS.PRODUCTS.CREATE, data);
  },
  updateProduct: (id, data) => {
    // If data is FormData, let the browser set the Content-Type header automatically
    if (data instanceof FormData) {
      return api.put(`${CONFIG.ENDPOINTS.PRODUCTS.UPDATE}/${id}`, data);
    }
    return api.put(`${CONFIG.ENDPOINTS.PRODUCTS.UPDATE}/${id}`, data);
  },
  deleteProduct: (id) => api.delete(`${CONFIG.ENDPOINTS.PRODUCTS.DELETE}/${id}`),
  getProductDetails: (id) => api.get(`${CONFIG.ENDPOINTS.PRODUCTS.DETAILS}/${id}`),
};

export const ordersAPI = {
  getOrders: (params) => api.get(CONFIG.ENDPOINTS.ORDERS.LIST, { params }),
  getOrderDetails: (id) => api.get(`${CONFIG.ENDPOINTS.ORDERS.DETAILS}/${id}`),
  updateOrderStatus: (id, status) => api.put(`${CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS}/${id}/status`, { status }),
  getOrderStatusCounts: () => api.get(CONFIG.ENDPOINTS.ORDERS.STATUS_COUNTS),
  getAvailableOrders: (params) => api.get(CONFIG.ENDPOINTS.ORDERS.AVAILABLE_LIST, { params }),
};

export const categoriesAPI = {
  getCategories: () => api.get(CONFIG.ENDPOINTS.CATEGORIES.LIST),
};

export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const smsAPI = {
  sendOTP: (phone) => api.post(CONFIG.ENDPOINTS.SMS.SEND_OTP, { phone }),
  sendOrderSMS: (data) => api.post(CONFIG.ENDPOINTS.SMS.SEND_ORDER_SMS, data),
};

export const advancedDeliveryAPI = {
  generateDeliveryOTP: (orderId) => api.post(`${CONFIG.ENDPOINTS.ADVANCED_DELIVERY.GENERATE_DELIVERY_OTP}/${orderId}`),
  verifyDeliveryOTPWithNotifications: (orderId, otp) =>
    api.post(`${CONFIG.ENDPOINTS.ADVANCED_DELIVERY.VERIFY_DELIVERY_OTP_WITH_NOTIFICATIONS}`, { orderId, otp }),
  verifyDeliveryOTP: (orderId, otp) => api.post(`${CONFIG.ENDPOINTS.ADVANCED_DELIVERY.VERIFY_DELIVERY_OTP}/${orderId}`, { otp }),
  resendDeliveryOTP: (orderId) => api.post(`${CONFIG.ENDPOINTS.ADVANCED_DELIVERY.RESEND_DELIVERY_OTP}/${orderId}`),
};



export default api; 