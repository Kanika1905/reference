export default CONFIG = {
    //API_BASE_URL: 'https://farmferry-backend-revised.onrender.com/api/v1',
  // API_BASE_URL: 'http://localhost:9000/api/v1', // For web development
  // API_BASE_URL: 'http://10.0.2.2:9000/api/v1', // For Android emulator
   API_BASE_URL: 'http://192.168.0.100:9000/api/v1', // For local development
  // API_BASE_URL: 'https://your-production-api.com/api/v1', // For production
  //API_BASE_URL: 'https://farmferry-backend-revised-r4y2.onrender.com/api/v1',
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login/supplier',
      REGISTER: '/auth/register/supplier',
      REFRESH_TOKEN: '/auth/refresh-token',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    SUPPLIER: {
      PROFILE: '/deliveryAssociate/profile',
      UPDATE_PROFILE: '/deliveryAssociate/profile',
      UPDATE_LOGO: '/deliveryAssociate/profile/logo',
      UPDATE_ADDRESS: '/deliveryAssociate/address',
      UPDATE_BANK_DETAILS: '/deliveryAssociate/bank-details',
      UPLOAD_DOCUMENT: '/deliveryAssociate/verification-document',
      DASHBOARD_STATS: '/deliveryAssociate/dashboard-stats',
    },
    ORDERS: {
      LIST: '/delivery-associates/orders',
      DETAILS: '/delivery-associates/orders',
      UPDATE_STATUS: '/delivery-associates/orders',
      AVAILABLE_LIST: '/delivery-associates/available-orders',
    },
    SMS: {
      SEND_OTP: '/sms/send-otp',
      SEND_ORDER_SMS: '/sms/send-order-sms',
    },
    ADVANCED_DELIVERY: {
      GENERATE_DELIVERY_OTP: '/advanced-delivery/otp/generate',
      VERIFY_DELIVERY_OTP: '/advanced-delivery/verify/delivery',
      RESEND_DELIVERY_OTP: '/advanced-delivery/otp/resend',
      VERIFY_DELIVERY_OTP_WITH_NOTIFICATIONS: '/advanced-delivery/verify-delivery'
    },
    CATEGORIES: {
      LIST: '/categories',
    },
  },
  
  // App Configuration
  APP: {
    NAME: 'FarmFerry Delivery Associate',
    VERSION: '1.0.0',
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME: 'theme',
  },
  
  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    PHONE_REGEX: /^[0-9]{10}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}; 