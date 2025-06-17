export interface User {
  id: number;
  username: string;
}

export interface Comment {
  id: number;
  content: string;
  user: User;
  postId: number;
  parentId?: number;
  likes: number;
  likedBy: number[];
  replies: Comment[];
  createdAt: string;
}

export interface Post {
  id: number;
  content: string;
  createdAt: string;
  user: User;
  likes: number;
  likedBy: number[];
  images?: string[];
  comments?: Comment[];
}