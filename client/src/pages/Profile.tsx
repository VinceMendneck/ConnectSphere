import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PostContext } from '../context/PostContextType';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';
import api from '../services/api';
import { AxiosError, type AxiosResponse } from 'axios';
import { type Post, type Comment } from '../types/index';
import { toast } from 'react-toastify';

interface UserResponse {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  followers?: number;
  following?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  followers?: number;
  following?: number;
}

interface FollowUser {
  id: number;
  username: string;
  email: string;
}

// Função para detectar hashtags
const extractHashtags = (text: string) => {
  return text.match(/#\w+/g) || [];
};

function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const postContext = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!postContext || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { posts, toggleLike, deletePost, updatePost, addComment, toggleCommentLike, updateComment, deleteComment } = postContext;
  const { user: authUser } = authContext;
  const [user, setUser] = useState<User | null>(null);
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [error, setError] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')
  );
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followersList, setFollowersList] = useState<FollowUser[]>([]);
  const [followingList, setFollowingList] = useState<FollowUser[]>([]);
  const [userAvatars, setUserAvatars] = useState<Record<number, string>>({});
  const [showCommentInput, setShowCommentInput] = useState<Record<number, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState<string>('');
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [loadingAvatars, setLoadingAvatars] = useState<boolean>(true);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const loggedInUserId = authUser ? authUser.id : null;
  const isOwnProfile = user?.id === loggedInUserId;
  const DEFAULT_AVATAR = 'http://localhost:5000/uploads/default-avatar.png';

  // Função para buscar múltiplos avatares de uma vez
  const fetchUserAvatars = useCallback(
    async (userIds: number[]) => {
      const uniqueIds = Array.from(new Set(userIds)).filter(id => !userAvatars[id]);
      if (uniqueIds.length === 0) {
        setLoadingAvatars(false);
        return;
      }
      try {
        const avatarPromises = uniqueIds.map(id => api.get(`/api/users/${id}`));
        const responses = await Promise.all(avatarPromises);
        const newAvatars = responses.reduce((acc, response) => {
          const avatar =
            response.data.avatar && response.data.avatar.trim() !== ''
              ? response.data.avatar
              : DEFAULT_AVATAR;
          return { ...acc, [response.data.id]: avatar };
        }, {} as Record<number, string>);
        setUserAvatars(prev => ({ ...prev, ...newAvatars }));
      } catch (err) {
        console.error('Erro ao buscar avatares:', err);
        uniqueIds.forEach(id => {
          setUserAvatars(prev => ({ ...prev, [id]: DEFAULT_AVATAR }));
        });
      } finally {
        setLoadingAvatars(false);
      }
    },
    [userAvatars]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      setLoadingProfile(true);
      setLoadingAvatars(true);
      setError([]);
      try {
        // Buscar dados do usuário
        const userResponse = await api.get(`/api/users/${id}`);
        if (isMounted) {
          setUser(userResponse.data);
          setBio(userResponse.data.bio || '');
        }

        // Buscar status de follow
        let isFollowingStatus = false;
        if (loggedInUserId && !isOwnProfile) {
          const followersResponse = await api.get(`/api/users/${id}/followers`);
          isFollowingStatus = followersResponse.data.some((f: FollowUser) => f.id === loggedInUserId);
        }

        // Buscar listas de seguidores e seguidos
        const [followersResponse, followingResponse] = await Promise.all([
          api.get(`/api/users/${id}/followers`),
          api.get(`/api/users/${id}/following`),
        ]);

        if (isMounted) {
          setIsFollowing(isFollowingStatus);
          setFollowersList(followersResponse.data);
          setFollowingList(followingResponse.data);

          // Coletar IDs de usuários para buscar avatares
          const userIds: number[] = [parseInt(id!)];
          followersResponse.data.forEach((follower: FollowUser) => userIds.push(follower.id));
          followingResponse.data.forEach((followed: FollowUser) => userIds.push(followed.id));
          posts.forEach((post) => {
            if (post.user.id === parseInt(id!)) {
              userIds.push(post.user.id);
              post.comments?.forEach((comment) => {
                userIds.push(comment.user.id);
                comment.replies?.forEach((reply) => userIds.push(reply.user.id));
              });
            }
          });

          await fetchUserAvatars(userIds);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
        if (isMounted) {
          setError(['Erro ao carregar perfil']);
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    fetchUserData();

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [id, loggedInUserId, isOwnProfile, fetchUserAvatars, posts]);

  const handleUpdate = async (type: 'bio' | 'avatar', file?: File) => {
    setError([]);
    const formData = new FormData();
    if (type === 'bio') formData.append('bio', bio);
    if (type === 'avatar' && file) {
      if (!file.type.startsWith('image/')) {
        setError(['Arquivo inválido. Selecione uma imagem.']);
        toast.error('Arquivo inválido. Selecione uma imagem.');
        if (avatarInputRef.current) avatarInputRef.current.value = '';
        return;
      }
      formData.append('avatar', file);
    } else if (type === 'avatar' && !file) {
      setError(['Nenhum arquivo de avatar selecionado']);
      toast.error('Selecione uma imagem para o avatar');
      return;
    }

    try {
      const response: AxiosResponse<UserResponse> = await api.put(`/api/users/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(prev => ({ ...prev!, ...response.data }));
      setBio(response.data.bio || '');
      if (type === 'bio') setIsEditingBio(false);
      if (type === 'avatar' && avatarInputRef.current) {
        avatarInputRef.current.value = '';
        setUserAvatars(prev => ({ ...prev, [user!.id]: response.data.avatar || DEFAULT_AVATAR }));
      }
      toast.success(`${type === 'bio' ? 'Bio' : 'Avatar'} atualizado com sucesso!`);
    } catch (err: unknown) {
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      if (err instanceof AxiosError && err.response) {
        const errorMessage = err.response.data?.error || 'Erro ao atualizar perfil';
        setError([errorMessage]);
        toast.error(errorMessage);
      } else {
        setError(['Erro ao atualizar perfil']);
        toast.error('Erro ao atualizar perfil');
      }
    }
  };

  const handleFollowToggle = async () => {
    if (!loggedInUserId) {
      toast.error('Faça login para seguir usuários.');
      navigate('/login');
      return;
    }
    try {
      const response = await api.post(`/api/users/${id}/follow`);
      setIsFollowing(!isFollowing);
      setUser(prev => ({
        ...prev!,
        followers: isFollowing ? (prev!.followers || 0) - 1 : (prev!.followers || 0) + 1,
      }));
      const followersResponse = await api.get(`/api/users/${id}/followers`);
      setFollowersList(followersResponse.data);
      followersResponse.data.forEach((follower: FollowUser) => fetchUserAvatars([follower.id]));
      const followingResponse = await api.get(`/api/users/${id}/following`);
      setFollowingList(followingResponse.data);
      followingResponse.data.forEach((followed: FollowUser) => fetchUserAvatars([followed.id]));
      toast.success(response.data.message);
    } catch (err: unknown) {
      const errorMessage = err instanceof AxiosError && err.response?.data?.error
        ? err.response.data.error
        : 'Erro ao gerenciar follow';
      toast.error(errorMessage);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content || '');
    setEditImages([]);
    setRemovedIndices([]);
    if (post.images && post.images.length > 0) {
      setEditImagePreviews(post.images.map(image =>
        image.startsWith('http://localhost:5000/') ? image : `http://localhost:5000/${image}`
      ));
    } else {
      setEditImagePreviews([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent('');
    setEditImages([]);
    setEditImagePreviews([]);
    setRemovedIndices([]);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
    editImagePreviews.forEach(URL.revokeObjectURL);
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 4 - editImagePreviews.length);
      if (editImagePreviews.length + newFiles.length > 4) {
        toast.warning('Você pode adicionar até 4 imagens por post.');
        return;
      }
      const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
      setEditImages([...editImages, ...validFiles]);
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setEditImagePreviews([...editImagePreviews, ...newPreviews]);
    }
  };

  const handleRemoveEditImage = (index: number) => {
    const newImages = editImages.filter((_, i) => i !== index);
    const newPreviews = editImagePreviews.filter((_, i) => i !== index);
    const newRemovedIndices = [...removedIndices, index];
    setRemovedIndices(newRemovedIndices);
    if (editImagePreviews[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(editImagePreviews[index]);
    }
    setEditImages(newImages);
    setEditImagePreviews(newPreviews);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() && editImagePreviews.length === 0) {
      toast.warning('O post deve ter conteúdo ou pelo menos uma imagem.');
      return;
    }
    if (!editingPostId) return;

    const formData = new FormData();
    formData.append('content', editContent);
    const originalImages = posts.find(post => post.id === editingPostId)?.images || [];
    if (originalImages.length > 0) {
      const existingUrls = originalImages.map(image => image.replace('http://localhost:5000/', ''));
      formData.append('existingImages', JSON.stringify(existingUrls));
    }
    editImages.forEach((image) => {
      if (image) formData.append('images', image);
    });
    if (removedIndices.length > 0) {
      formData.append('removedImages', JSON.stringify(removedIndices));
    }

    try {
      await updatePost(editingPostId, formData);
      setEditingPostId(null);
      setEditContent('');
      setEditImages([]);
      setEditImagePreviews([]);
      setRemovedIndices([]);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
      editImagePreviews.forEach(URL.revokeObjectURL);
      toast.success('Post atualizado com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao atualizar post:', error);
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data?.error || 'Erro ao atualizar post.');
      } else {
        toast.error('Erro ao atualizar post.');
      }
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await deletePost(postId);
      toast.success('Post excluído com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao excluir post:', error);
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data?.error || 'Erro ao excluir post.');
      } else {
        toast.error('Erro ao excluir post.');
      }
    }
  };

  const handleCommentSubmit = async (postId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUserId) {
      toast.error('Faça login para comentar.');
      navigate('/login');
      return;
    }
    const commentContent = commentInputs[postId]?.trim();
    if (!commentContent) {
      toast.warning('O comentário não pode estar vazio.');
      return;
    }
    try {
      await addComment(postId, commentContent);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      setShowCommentInput(prev => ({ ...prev, [postId]: false }));
      toast.success('Comentário adicionado com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao enviar comentário:', error);
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data?.error || 'Erro ao adicionar comentário.');
      } else {
        toast.error('Erro ao adicionar comentário.');
      }
    }
  };

  const handleReplySubmit = async (postId: number, parentId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUserId) {
      toast.error('Faça login para responder.');
      navigate('/login');
      return;
    }
    const replyContent = replyInputs[`${postId}-${parentId}`]?.trim();
    if (!replyContent) {
      toast.warning('A resposta não pode estar vazia.');
      return;
    }
    try {
      await addComment(postId, replyContent, parentId);
      setReplyInputs(prev => ({ ...prev, [`${postId}-${parentId}`]: '' }));
      toast.success('Resposta adicionada com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao enviar resposta:', error);
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data?.error || 'Erro ao adicionar resposta.');
      } else {
        toast.error('Erro ao adicionar resposta.');
      }
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUserId) {
      toast.error('Faça login para editar comentários.');
      navigate('/login');
      return;
    }
    if (!editingCommentId) return;
    const content = editCommentContent.trim();
    if (!content) {
      toast.warning('O comentário não pode estar vazio.');
      return;
    }
    try {
      await updateComment(editingCommentId, content);
      setEditingCommentId(null);
      setEditCommentContent('');
      toast.success('Comentário atualizado com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao atualizar comentário:', error);
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data?.error || 'Erro ao atualizar comentário.');
      } else {
        toast.error('Erro ao atualizar comentário.');
      }
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!loggedInUserId) {
      toast.error('Faça login para excluir comentários.');
      navigate('/login');
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;
    try {
      await deleteComment(commentId);
      toast.success('Comentário excluído com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao excluir comentário:', error);
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data?.error || 'Erro ao excluir comentário.');
      } else {
        toast.error('Erro ao excluir comentário.');
      }
    }
  };

  // Componente de esqueleto para carregamento
  const LoadingSkeleton = () => (
    <div className={isDarkMode ? theme.profile.containerDark : theme.profile.container}>
      <div className="relative flex flex-col items-center mt-8 animate-pulse">
        <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded mt-4"></div>
        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded mt-2"></div>
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      <div className="mt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={`${isDarkMode ? theme.home.postContainerDark : theme.home.postContainer} mb-4 animate-pulse`}
          >
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
              <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="flex items-center space-x-4 mt-2">
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComment = (comment: Comment, post: Post, level: number = 0) => {
    return (
      <div key={comment.id} className={`ml-${level * 4} mt-2 relative`}>
        <div className="flex items-center">
          <img
            src={userAvatars[comment.user.id] || DEFAULT_AVATAR}
            alt={`${comment.user.username} avatar`}
            className="w-8 h-8 rounded-full object-cover mr-2"
            onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
          />
          <Link to={`/profile/${comment.user.id}`} className={theme.home.hashtagLink}>
            @{comment.user.username}
          </Link>
        </div>
        {editingCommentId === comment.id ? (
          <form onSubmit={handleUpdateComment} className="mt-2">
            <textarea
              value={editCommentContent}
              onChange={(e) => setEditCommentContent(e.target.value)}
              className={isDarkMode ? theme.home.textareaDark : theme.home.textarea}
            />
            <div className="flex space-x-2 mt-1">
              <button
                type="submit"
                className={isDarkMode ? theme.auth.buttonDark : theme.auth.button}
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingCommentId(null);
                  setEditCommentContent('');
                }}
                className={isDarkMode ? theme.profile.cancelButtonDark : theme.profile.cancelButton}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className={isDarkMode ? theme.home.postContentDark : theme.home.postContent}>
              {comment.content}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (!loggedInUserId) {
                    toast.error('Faça login para curtir comentários.');
                    navigate('/login');
                    return;
                  }
                  toggleCommentLike(comment.id).catch(err =>
                    toast.error(err.response?.data?.error || 'Erro ao curtir comentário.')
                  );
                }}
                className={comment.likedBy.includes(loggedInUserId || 0)
                  ? isDarkMode ? theme.home.likedButtonDark : theme.home.likedButton
                  : isDarkMode ? theme.home.likeButtonDark : theme.home.likeButton}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill={comment.likedBy.includes(loggedInUserId || 0) ? 'currentColor' : 'none'}
                  stroke={comment.likedBy.includes(loggedInUserId || 0) ? 'none' : 'currentColor'}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {comment.likes}
              </button>
              <button
                onClick={() => {
                  if (!loggedInUserId) {
                    toast.error('Faça login para responder.');
                    navigate('/login');
                    return;
                  }
                  setReplyInputs(prev => ({
                    ...prev,
                    [`${post.id}-${comment.id}`]: prev[`${post.id}-${comment.id}`] || '',
                  }));
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                Responder
              </button>
            </div>
            {loggedInUserId && (loggedInUserId === comment.user.id || loggedInUserId === post.user.id) && (
              <div className="absolute top-0 right-0 flex space-x-2">
                {loggedInUserId === comment.user.id && (
                  <button
                    onClick={() => handleEditComment(comment)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="Editar comentário"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Excluir comentário"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
            {replyInputs[`${post.id}-${comment.id}`] !== undefined && (
              <form
                onSubmit={(e) => handleReplySubmit(post.id, comment.id, e)}
                className="mt-2"
              >
                <textarea
                  value={replyInputs[`${post.id}-${comment.id}`] || ''}
                  onChange={(e) =>
                    setReplyInputs(prev => ({
                      ...prev,
                      [`${post.id}-${comment.id}`]: e.target.value,
                    }))
                  }
                  className={isDarkMode ? theme.home.textareaDark : theme.home.textarea}
                  placeholder="Escreva uma resposta..."
                />
                <div className="flex space-x-2 mt-1">
                  <button
                    type="submit"
                    className={isDarkMode ? theme.auth.buttonDark : theme.auth.button}
                  >
                    Enviar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setReplyInputs(prev => {
                        const newInputs = { ...prev };
                        delete newInputs[`${post.id}-${comment.id}`];
                        return newInputs;
                      })
                    }
                    className={isDarkMode ? theme.profile.cancelButtonDark : theme.profile.cancelButton}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
            {comment.replies?.map(reply => renderComment(reply, post, level + 1))}
          </>
        )}
      </div>
    );
  };

  if (loadingProfile || loadingAvatars) {
    return <LoadingSkeleton />;
  }

  if (!user) return <div className={isDarkMode ? theme.profile.containerDark : theme.profile.container}>Erro ao carregar perfil.</div>;

  const userPosts = posts.filter(post => post.user.id === parseInt(id!)).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className={isDarkMode ? theme.profile.containerDark : theme.profile.container}>
      <div className="relative flex flex-col items-center mt-8">
        <div className="relative w-32 h-32">
          <img
            src={user.avatar && user.avatar.trim() !== '' ? user.avatar : DEFAULT_AVATAR}
            alt={`${user.username} avatar`}
            className="w-full h-full rounded-full object-cover"
            onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
          />
          {isOwnProfile && (
            <>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </label>
              <input
                type="file"
                accept="image/*"
                id="avatar-upload"
                ref={avatarInputRef}
                onChange={(e) => {
                  const file = e.target.files ? e.target.files[0] : null;
                  if (file) {
                    handleUpdate('avatar', file);
                  } else {
                    toast.error('Selecione uma imagem válida');
                  }
                }}
                className="hidden"
              />
            </>
          )}
        </div>
        <h2 className={isDarkMode ? theme.profile.titleDark : theme.profile.title}>{user.username}</h2>
        <p className={isDarkMode ? theme.profile.infoDark : theme.profile.info}>@{user.username}</p>
      </div>

      <div className={isDarkMode ? theme.profile.bioContainerDark : theme.profile.bioContainer}>
        {isOwnProfile && isEditingBio ? (
          <>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              placeholder="Adicione uma bio (máximo 160 caracteres)"
              className={`${isDarkMode ? theme.auth.inputDark : theme.auth.input} w-full h-24 resize-none text-center`}
            />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{bio.length}/160</p>
            {error.length > 0 && (
              <div className="text-red-500 text-sm mt-2">
                {error.map((msg, index) => (
                  <p key={index}>{msg}</p>
                ))}
              </div>
            )}
            <div className="flex space-x-2 mt-2">
              <button type="button" onClick={() => handleUpdate('bio')} className={isDarkMode ? theme.auth.buttonDark : theme.auth.button}>
                Salvar Bio
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingBio(false);
                  setBio(user.bio || '');
                  setError([]);
                }}
                className={isDarkMode ? theme.profile.cancelButtonDark : theme.profile.cancelButton}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={isDarkMode ? theme.profile.bioTextDark : theme.profile.bioText}>
              {user.bio || 'Nenhuma bio definida'}
            </p>
            {isOwnProfile ? (
              <button
                type="button"
                onClick={() => setIsEditingBio(true)}
                className={isDarkMode ? theme.profile.editBioButtonDark : theme.profile.editBioButton}
              >
                Editar Bio
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFollowToggle}
                className={isDarkMode ? theme.auth.buttonDark : theme.auth.button}
              >
                {isFollowing ? 'Deixar de seguir' : 'Seguir'}
              </button>
            )}
          </>
        )}
      </div>

      <div className="mt-4 flex justify-center space-x-4">
        <button
          className={`${isDarkMode ? theme.profile.tabDark : theme.profile.tab} ${activeTab === 'posts' ? 'text-red-500' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          className={`${isDarkMode ? theme.profile.tabDark : theme.profile.tab} ${activeTab === 'followers' ? 'text-red-500' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          Seguidores {user.followers || 0}
        </button>
        <button
          className={`${isDarkMode ? theme.profile.tabDark : theme.profile.tab} ${activeTab === 'following' ? 'text-red-500' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Seguindo {user.following || 0}
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'posts' && (
          <div className={theme.home.postList}>
            {userPosts.length === 0 ? (
              <p className={isDarkMode ? theme.home.emptyPostMessageDark : theme.home.emptyPostMessage}>
                Nenhum post para exibir.
              </p>
            ) : (
              userPosts.map((post) => (
                <div key={post.id} className={`${isDarkMode ? theme.home.postContainerDark : theme.home.postContainer} relative`}>
                  {editingPostId === post.id ? (
                    <form onSubmit={handleUpdateSubmit} className="mb-4">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={isDarkMode ? theme.home.textareaDark : theme.home.textarea}
                        placeholder="Edite seu post..."
                      />
                      {editImagePreviews.length > 0 && (
                        <div className="max-w-[320px] w-full mt-2 p-1 ml-0">
                          <div className="grid grid-cols-2 gap-2">
                            {editImagePreviews.map((preview, index) => (
                              <div key={index} className="relative w-[150px] h-[150px] group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg transition-all duration-200 group-hover:brightness-50"
                                  onError={() => console.log('Erro ao carregar imagem:', preview)}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEditImage(index)}
                                  className="absolute inset-0 w-full h-full bg-red-500 bg-opacity-0 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-opacity-50"
                                  title="Remover imagem"
                                >
                                  <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className={isDarkMode ? theme.home.charCountDark : theme.home.charCount}>
                          {280 - editContent.length} caracteres restantes
                        </span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            ref={editFileInputRef}
                            onChange={handleEditImageUpload}
                            className="hidden"
                            id={`editImageUpload-${post.id}`}
                          />
                          <label
                            htmlFor={`editImageUpload-${post.id}`}
                            className={isDarkMode ? theme.home.imageUploadButton : theme.home.imageUploadButtonLight}
                          >
                            <svg
                              className={`w-5 h-5 ${isDarkMode ? 'text-white hover:text-[#e2e8f0]' : 'text-[#213547] hover:text-[#3e4a5a]'}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" fill="none" />
                              <path
                                d="M5 7h14M5 12h7m-7 5h14"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                              />
                            </svg>
                          </label>
                          <button
                            type="submit"
                            className={isDarkMode ? theme.home.postButtonDark : theme.home.postButton}
                          >
                            <span className={isDarkMode ? 'text-white hover:text-[#e2e8f0]' : 'text-[#213547] hover:text-[#3e4a5a]'}>Salvar</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className={isDarkMode ? theme.profile.cancelButtonDark : theme.profile.cancelButton}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      {loggedInUserId && loggedInUserId === post.user.id && (
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Editar post"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Excluir post"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                      <p className={isDarkMode ? theme.home.postContentDark : theme.home.postContent}>
                        {extractHashtags(post.content).length > 0
                          ? post.content.split(' ').map((word, index) =>
                              extractHashtags(word).length > 0 ? (
                                <Link key={index} to={`/hashtag/${word.slice(1)}`} className={theme.home.hashtagLink}>
                                  {word}{' '}
                                </Link>
                              ) : (
                                <span key={index}>{word} </span>
                              )
                            )
                          : post.content}
                      </p>
                      {post.images && post.images.length > 0 && (
                        <div className="max-w-[320px] w-full mt-2 p-1 ml-0">
                          <div className="grid grid-cols-2 gap-2">
                            {post.images.map((image, index) => (
                              image && typeof image === 'string' && image.startsWith('http://localhost:5000/') ? (
                                <div key={index} className="relative w-[150px] h-[150px]">
                                  <img
                                    src={image}
                                    alt={`Post image ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                </div>
                              ) : null
                            ))}
                          </div>
                        </div>
                      )}
                      <div className={isDarkMode ? theme.home.postMetaDark : theme.home.postMeta}>
                        <div className="flex items-center">
                          <img
                            src={userAvatars[post.user.id] || DEFAULT_AVATAR}
                            alt={`${post.user.username} avatar`}
                            className="w-8 h-8 rounded-full object-cover mr-2"
                            onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
                          />
                          <Link to={`/profile/${post.user.id}`} className={theme.home.hashtagLink}>
                            @{post.user.username}
                          </Link>
                        </div>
                        <button
                          onClick={() => {
                            if (!loggedInUserId) {
                              toast.error('Faça login para curtir posts.');
                              navigate('/login');
                              return;
                            }
                            toggleLike(post.id).catch(err =>
                              toast.error(err.response?.data?.error || 'Erro ao curtir post.')
                            );
                          }}
                          className={loggedInUserId && post.likedBy?.includes(loggedInUserId)
                            ? isDarkMode ? theme.home.likedButtonDark : theme.home.likedButton
                            : isDarkMode ? theme.home.likeButtonDark : theme.home.likeButton}
                        >
                          <svg
                            className="w-5 h-5 mr-1"
                            fill={loggedInUserId && post.likedBy?.includes(loggedInUserId) ? 'currentColor' : 'none'}
                            stroke={loggedInUserId && post.likedBy?.includes(loggedInUserId) ? 'none' : 'currentColor'}
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          {post.likes}
                        </button>
                      </div>
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            if (!loggedInUserId) {
                              toast.error('Faça login para comentar.');
                              navigate('/login');
                              return;
                            }
                            setShowCommentInput(prev => ({ ...prev, [post.id]: !prev[post.id] }));
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Comentar
                        </button>
                        {showCommentInput[post.id] && (
                          <form
                            onSubmit={(e) => handleCommentSubmit(post.id, e)}
                            className="mb-2 mt-2"
                          >
                            <textarea
                              value={commentInputs[post.id] || ''}
                              onChange={(e) =>
                                setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))
                              }
                              className={isDarkMode ? theme.home.textareaDark : theme.home.textarea}
                              placeholder="Adicione um comentário..."
                            />
                            <div className="flex space-x-2 mt-1">
                              <button
                                type="submit"
                                className={isDarkMode ? theme.auth.buttonDark : theme.auth.button}
                              >
                                Enviar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCommentInput(prev => ({ ...prev, [post.id]: false }));
                                  setCommentInputs(prev => ({ ...prev, [post.id]: '' }));
                                }}
                                className={isDarkMode ? theme.profile.cancelButtonDark : theme.profile.cancelButton}
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        )}
                        {post.comments?.map(comment => renderComment(comment, post))}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === 'followers' && (
          <div className={isDarkMode ? theme.profile.postList : theme.profile.postList}>
            {followersList.length > 0 ? (
              followersList.map((follower) => (
                <div key={follower.id} className={isDarkMode ? theme.profile.postContainerDark : theme.profile.postContainer}>
                  <div className="flex items-center">
                    <img
                      src={userAvatars[follower.id] || DEFAULT_AVATAR}
                      alt={`${follower.username} avatar`}
                      className="w-6 h-6 rounded-full object-cover mr-2"
                      onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
                    />
                    <Link to={`/profile/${follower.id}`} className={theme.profile.hashtagLink}>
                      @{follower.username}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className={isDarkMode ? theme.profile.postContentDark : theme.profile.postContent}>
                Nenhum seguidor.
              </p>
            )}
          </div>
        )}
        {activeTab === 'following' && (
          <div className={isDarkMode ? theme.profile.postList : theme.profile.postList}>
            {followingList.length > 0 ? (
              followingList.map((followed) => (
                <div key={followed.id} className={isDarkMode ? theme.profile.postContainerDark : theme.profile.postContainer}>
                  <div className="flex items-center">
                    <img
                      src={userAvatars[followed.id] || DEFAULT_AVATAR}
                      alt={`${followed.username} avatar`}
                      className="w-6 h-6 rounded-full object-cover mr-2"
                      onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
                    />
                    <Link to={`/profile/${followed.id}`} className={theme.profile.hashtagLink}>
                      @{followed.username}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className={isDarkMode ? theme.profile.postContentDark : theme.profile.postContent}>
                Não segue ninguém.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;