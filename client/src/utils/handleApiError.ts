import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import type { NavigateFunction } from 'react-router-dom';

export function handleApiError(error: unknown, navigate: NavigateFunction, defaultMessage: string): void {
  if (error instanceof AxiosError && error.response) {
    const { status, data } = error.response;
    if (status === 401 || status === 403) {
      const errorMessage = data?.error || 'Sessão inválida';
      toast.error(`${errorMessage}. Faça login novamente.`);
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      toast.error(data?.error || defaultMessage);
    }
  } else {
    toast.error(defaultMessage);
  }
}