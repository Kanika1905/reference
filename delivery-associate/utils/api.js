import axios from 'axios';
import CONFIG from '../constants/config';

const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 10000,
});

// Development logging for requests and responses
if (__DEV__) {
  api.interceptors.request.use(
    (config) => {
      console.log(`➡️  [API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('❌ [API] Request error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log(`✅ [API] ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      if (error.response) {
        console.error('❌ [API]', error.response.status, error.response.config.url, error.response.data);
      } else {
        console.error('❌ [API] Network/Unknown error:', error.message);
      }
      return Promise.reject(error);
    }
  );
}

api.changePassword = (currentPassword, newPassword, token) =>
  api.post('/auth/change-password', { currentPassword, newPassword }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default api;