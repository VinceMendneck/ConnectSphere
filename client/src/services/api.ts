import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Requisição enviada:', config.method, config.url, {
      headers: config.headers,
      data: config.data instanceof FormData ? Array.from(config.data.entries()) : config.data,
    });
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || 'Sessão expirada';
      toast.error(`${errorMessage}. Faça login novamente.`);
      localStorage.removeItem('token');
    } else if (error.response?.status === 403) {
      toast.error('Permissão negada. Verifique sua sessão.');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;