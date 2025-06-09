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
  likes: number;
  likedBy: number[];
}

interface LikeResponse {
  likes: number;
  likedBy: number[];
}

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  posts: Post[];
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

interface LikeBody {
  userId: number;
}

// Dados simulados
const mockUser: User = { id: 1, username: 'user_teste' };
const mockPosts: Post[] = [
  {
    id: 1,
    content: 'Bem-vindo ao #ConnectSphere!',
    createdAt: new Date().toISOString(),
    user: mockUser,
    likes: 0,
    likedBy: [],
  },
  {
    id: 2,
    content: 'Testando #hashtags no projeto!',
    createdAt: new Date().toISOString(),
    user: mockUser,
    likes: 0,
    likedBy: [],
  },
];

const mockApi = {
  get: async (url: string): Promise<{ data: Post[] | ProfileResponse }> => {
    if (url === '/posts') {
      return { data: mockPosts };
    }
    if (url.startsWith('/hashtags/')) {
      const tag = url.split('/')[2];
      return {
        data: mockPosts.filter((post) => post.content.includes(`#${tag}`)),
      };
    }
    if (url.startsWith('/users/')) {
      const userId = parseInt(url.split('/')[2], 10);
      const userPosts = mockPosts.filter((post) => post.user.id === userId);
      return {
        data: {
          id: userId,
          username: `user${userId}`,
          email: `user${userId}@example.com`,
          posts: userPosts,
        },
      };
    }
    throw new Error('Rota não encontrada');
  },
  post: async (
    url: string,
    body: LoginBody | RegisterBody | PostBody | LikeBody
  ): Promise<{ data: LoginResponse | RegisterResponse | PostResponse | LikeResponse }> => {
    if (url === '/login') {
      const { email, password } = body as LoginBody;
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      return {
        data: { token: 'mock_token', userId: 1 },
      };
    }
    if (url === '/register') {
      const { email, password, username } = body as RegisterBody;
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
        likes: 0,
        likedBy: [],
      };
      mockPosts.push(newPost as Post);
      return { data: newPost };
    }
    if (url.startsWith('/posts/') && url.endsWith('/like')) {
      const postId = parseInt(url.split('/')[2], 10);
      const { userId } = body as LikeBody;
      const post = mockPosts.find((p) => p.id === postId);
      if (!post) {
        throw new Error('Post não encontrado');
      }
      const likedBy = post.likedBy.includes(userId)
        ? post.likedBy.filter((id) => id !== userId)
        : [...post.likedBy, userId];
      post.likedBy = likedBy;
      post.likes = likedBy.length;
      return { data: { likes: post.likes, likedBy: post.likedBy } };
    }
    throw new Error('Rota não encontrada');
  },
};

export default mockApi;