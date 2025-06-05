// client/src/services/mockApi.ts
import { type Post, type User } from '../types'; // Usa import type

// Interfaces para respostas da API
interface LoginResponse {
  token: string;
  userId: number;
}

interface RegisterResponse {
  success: boolean;
}

interface PostResponse {
  id: number;
  content: string;
  createdAt: string;
  user: User;
}

// Interfaces para corpos das requisições
interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  email: string;
  password: string;
  username: string;
}

interface PostBody {
  content: string;
}

// Dados simulados
const mockUser: User = { id: 1, username: 'user_teste' };
const mockPosts: Post[] = [
  {
    id: 1,
    content: 'Bem-vindo ao #ConnectSphere!',
    createdAt: new Date().toISOString(),
    user: mockUser,
  },
  {
    id: 2,
    content: 'Testando #hashtags no projeto!',
    createdAt: new Date().toISOString(),
    user: mockUser,
  },
];

const mockApi = {
  get: async (url: string): Promise<{ data: Post[] }> => {
    if (url === '/posts') {
      return { data: mockPosts };
    }
    if (url.startsWith('/hashtags/')) {
      const tag = url.split('/')[2];
      return {
        data: mockPosts.filter((post) => post.content.includes(`#${tag}`)),
      };
    }
    throw new Error('Rota não encontrada');
  },
  post: async (
    url: string,
    body: LoginBody | RegisterBody | PostBody
  ): Promise<{ data: LoginResponse | RegisterResponse | PostResponse }> => {
    if (url === '/login') {
      const { email, password } = body as LoginBody;
      // Simula validação (opcional)
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      return {
        data: { token: 'mock_token', userId: 1 },
      };
    }
    if (url === '/register') {
      const { email, password, username } = body as RegisterBody;
      // Simula validação (opcional)
      if (!email || !password || !username) {
        throw new Error('Todos os campos são obrigatórios');
      }
      return { data: { success: true } };
    }
    if (url === '/posts') {
      const { content } = body as PostBody;
      const newPost: PostResponse = {
        id: mockPosts.length + 1,
        content,
        createdAt: new Date().toISOString(),
        user: mockUser,
      };
      mockPosts.push(newPost as Post);
      return { data: newPost };
    }
    throw new Error('Rota não encontrada');
  },
};

export default mockApi;