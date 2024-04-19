import axios from 'axios';
import { Cookies } from 'react-cookie';

const cookie = new Cookies();

export const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
});

export const authInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
});

// 요청 인터셉터
authInstance.interceptors.request.use(
  (config) => {
    const accessToken = cookie.get('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete config.headers['Authorization'];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터
authInstance.interceptors.response.use(
  (response) => {
    const authHeader =
      response.headers['authorization'] || response.headers['Authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      cookie.set('accessToken', token, { path: '/' });
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Unauthorized!');
    }
    return Promise.reject(error);
  },
);
