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
    console.log('Requisição enviada:', config.method, config.url, config.data);
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
    console.error('Erro na resposta:', error.response?.status, error.response?.data);
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      toast.error('Sessão expirada. Faça login novamente.');
      window.location.href = '/login'; // Redireciona para login
    }
    return Promise.reject(error);
  }
);

export default api;