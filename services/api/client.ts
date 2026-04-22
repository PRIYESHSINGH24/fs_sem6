import axios from 'axios';
import { env } from '../../constants/env';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error.message || 'Unknown network error';
    return Promise.reject(new Error(message));
  }
);
