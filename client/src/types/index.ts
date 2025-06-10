export interface User {
  id: number;
  username: string;
}

export interface Post {
  id: number;
  content: string;
  createdAt: string;
  user: User;
  likes: number;
  likedBy: number[];
  image?: string;
}