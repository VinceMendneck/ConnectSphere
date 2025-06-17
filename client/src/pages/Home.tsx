import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { PostContext } from '../context/PostContextType';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { type Post, type Comment } from '../types/index';
import { AxiosError } from 'axios';
import api from '../services/api';

// Função para detectar hashtags
const extractHashtags = (text: string) => {
  return text.match(/#\w+/g) || [];
};

function Home() {
  const navigate = useNavigate();
  const context = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!context || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { posts, setPosts, addPost, toggleLike, deletePost, updatePost, addComment, toggleCommentLike, updateComment, deleteComment } = context;
  const { user } = authContext;
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')
  );
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);
  const [userAvatars, setUserAvatars] = useState<Record<number, string>>({});
  const [showCommentInput, setShowCommentInput] = useState<Record<number, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState<string>('');
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [loadingAvatars, setLoadingAvatars] = useState<boolean>(true);
  const userId = user ? user.id : 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const DEFAULT_AVATAR = 'http://localhost:5000/uploads/default-avatar.png';

  const fetchUserAvatar = useCallback(
    async (userId: number) => {
      if (userAvatars[userId]) return;
      try {
        const response = await api.get(`/api/users/${userId}`);
        const avatar =
          response.data.avatar && response.data.avatar.trim() !== ''
            ? response.data.avatar
            : DEFAULT_AVATAR;
        setUserAvatars(prev => ({ ...prev, [userId]: avatar }));
      } catch (err) {
        console.error(`Erro ao buscar avatar do usuário ${userId}:`, err);
        setUserAvatars(prev => ({ ...prev, [userId]: DEFAULT_AVATAR }));
      }
    },
    [userAvatars]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      setLoadingAvatars(true);
      try {
        const response = await api.get('/api/posts');
        if (isMounted) {
          setPosts(response.data);
          const userIds: number[] = [];
          response.data.forEach((post: Post) => {
            userIds.push(post.user.id);
            post.comments?.forEach((comment) => {
              userIds.push(comment.user.id);
              comment.replies?.forEach((reply) => userIds.push(reply.user.id));
            });
          });
          const uniqueIds = Array.from(new Set(userIds));
          await Promise.all(uniqueIds.map(id => fetchUserAvatar(id)));
        }
      } catch (err) {
        console.error('Erro ao buscar posts:', err);
        if (isMounted) {
          setPosts([]);
        }
      } finally {
        if (isMounted) {
          setLoadingPosts(false);
          setLoadingAvatars(false);
        }
      }
    };

    fetchPosts();

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [fetchUserAvatar, setPosts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Faça login para criar posts.');
      navigate('/login');
      return;
    }
    if (!content.trim() && images.length === 0) {
      toast.warning('O post deve ter conteúdo ou pelo menos uma imagem.');
      return;
    }
    const formData = new FormData();
    formData.append('content', content);
    images.forEach((image) => {
      if (image) formData.append('images', image);
    });
    console.log('FormData enviado para post:', Array.from(formData.entries()));
    try {
      await addPost(formData);
      setContent('');
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      imagePreviews.forEach(URL.revokeObjectURL);
      toast.success('Post criado com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao criar post:', error);
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error('Sessão inválida. Faça login novamente.');
          navigate('/login');
        } else {
          toast.error(error.response.data?.error || 'Erro ao criar post.');
        }
      } else {
        toast.error('Erro ao criar post.');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 4 - images.length);
      if (images.length + newFiles.length > 4) {
        toast.warning('Você pode adicionar até 4 imagens por post.');
        return;
      }
      const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
      setImages([...images, ...validFiles]);
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      console.log('Excluindo post:', postId);
      await deletePost(postId);
      toast.success('Post excluído com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao excluir post:', error);
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error('Sessão inválida. Faça login novamente.');
          navigate('/login');
        } else {
          toast.error(error.response.data?.error || 'Erro ao excluir post.');
        }
      } else {
        toast.error('Erro ao excluir post.');
      }
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content || '');
    setEditImages([]);
    setRemovedIndices([]);
    if (post.images && post.images.length > 0) {
      const relativePaths = post.images.map(image => image.replace('http://localhost:5000/', ''));
      setEditImagePreviews(relativePaths.map(path => `http://localhost:5000/${path}`));
      console.log('Edit previews inicializadas:', relativePaths.map(path => `http://localhost:5000/${path}`));
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
      console.log('Edit previews após upload:', [...editImagePreviews, ...newPreviews]);
    }
  };

  const handleRemoveEditImage = (index: number) => {
    const newImages = editImages.filter((_, i) => i !== index);
    const newPreviews = editImagePreviews.filter((_, i) => i !== index);
    const newRemovedIndices = [...removedIndices, index];
    setRemovedIndices(newRemovedIndices);
    URL.revokeObjectURL(editImagePreviews[index]);
    setEditImages(newImages);
    setEditImagePreviews(newPreviews);
    console.log('Edit previews após remoção:', newPreviews, 'Removed indices:', newRemovedIndices);
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

    console.log('FormData enviado (update):', Array.from(formData.entries()));
    try {
      const response: Post = await updatePost(editingPostId, formData);
      console.log('Resposta da atualização - response:', response);
      setEditImagePreviews(response.images || []);
      setPosts(prevPosts =>
        prevPosts.map((post: Post) =>
          post.id === editingPostId ? { ...post, ...response } : post
        )
      );
      fetchUserAvatar(response.user.id);
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
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error('Sessão inválida. Faça login novamente.');
          navigate('/login');
        } else {
          toast.error(error.response.data?.error || 'Erro ao atualizar post.');
        }
      } else {
        toast.error('Erro ao atualizar post.');
      }
    }
  };

  const handleCommentSubmit = async (postId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
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
      console.log('Enviando comentário:', { postId, content: commentContent });
      await addComment(postId, commentContent);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      setShowCommentInput(prev => ({ ...prev, [postId]: false }));
      toast.success('Comentário adicionado com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao enviar comentário:', error);
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error('Sessão inválida. Faça login novamente.');
          navigate('/login');
        } else {
          toast.error(error.response.data?.error || 'Erro ao adicionar comentário.');
        }
      } else {
        toast.error('Erro ao adicionar comentário.');
      }
    }
  };

  const handleReplySubmit = async (postId: number, parentId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
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
      console.log('Enviando resposta:', { postId, parentId, content: replyContent });
      await addComment(postId, replyContent, parentId);
      setReplyInputs(prev => ({ ...prev, [`${postId}-${parentId}`]: '' }));
      toast.success('Resposta adicionada com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao enviar resposta:', error);
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error('Sessão inválida. Faça login novamente.');
          navigate('/login');
        } else {
          toast.error(error.response.data?.error || 'Erro ao adicionar resposta.');
        }
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
    if (!user) {
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
      console.log('Atualizando comentário:', { commentId: editingCommentId, content });
      await updateComment(editingCommentId, content);
      setEditingCommentId(null);
      setEditCommentContent('');
      toast.success('Comentário atualizado com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao atualizar comentário:', error);
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error('Sessão inválida. Faça login novamente.');
          navigate('/login');
        } else {
          toast.error(error.response.data?.error || 'Erro ao atualizar comentário.');
        }
      } else {
        toast.error('Erro ao atualizar comentário.');
      }
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) {
      toast.error('Faça login para excluir comentários.');
      navigate('/login');
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;
    try {
      console.log('Excluindo comentário:', commentId);
      await deleteComment(commentId);
      toast.success('Comentário excluído com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao excluir comentário:', error);
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error('Sessão inválida. Faça login novamente.');
          navigate('/login');
        } else {
          toast.error(error.response.data?.error || 'Erro ao excluir comentário.');
        }
      } else {
        toast.error('Erro ao excluir comentário.');
      }
    }
  };

  // Componente de esqueleto para carregamento
  const LoadingSkeleton = () => (
    <div className={isDarkMode ? theme.home.containerDark : theme.home.container}>
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
                  if (!user) {
                    toast.error('Faça login para curtir comentários.');
                    navigate('/login');
                    return;
                  }
                  toggleCommentLike(comment.id).catch(err =>
                    toast.error(err.response?.data?.error || 'Erro ao curtir comentário.')
                  );
                }}
                className={comment.likedBy.includes(userId)
                  ? isDarkMode ? theme.home.likedButtonDark : theme.home.likedButton
                  : isDarkMode ? theme.home.likeButtonDark : theme.home.likeButton}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill={comment.likedBy.includes(userId) ? 'currentColor' : 'none'}
                  stroke={comment.likedBy.includes(userId) ? 'none' : 'currentColor'}
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
                  if (!user) {
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
            {user && (user.id === comment.user.id || user.id === post.user.id) && (
              <div className="absolute top-0 right-0 flex space-x-2">
                {user.id === comment.user.id && (
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

  if (loadingPosts || loadingAvatars) {
    return <LoadingSkeleton />;
  }

  return (
    <div className={isDarkMode ? theme.home.containerDark : theme.home.container}>
      <div className={isDarkMode ? theme.home.header : theme.home.header}>
        <h1 className={isDarkMode ? theme.home.titleDark : theme.home.title}>ConnectSphere</h1>
      </div>
      <div className={isDarkMode ? theme.home.postFormContainerDark : theme.home.postFormContainer}>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={isDarkMode ? theme.home.textareaDark : theme.home.textarea}
            placeholder="O que está acontecendo?"
          />
          {imagePreviews.length > 0 && (
            <div className="max-w-[320px] w-full mt-2 p-1 ml-0">
              <div className="grid grid-cols-2 gap-2">
                {imagePreviews.map((_, index) => (
                  <div key={index} className="relative w-[150px] h-[150px]">
                    <img
                      src={imagePreviews[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={`${theme.home.postFormFooter} flex items-center justify-between`}>
            <span className={isDarkMode ? theme.home.charCountDark : theme.home.charCount}>
              {280 - content.length} caracteres restantes
            </span>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
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
              <button type="submit" className={isDarkMode ? theme.home.postButtonDark : theme.home.postButton}>
                <span className={isDarkMode ? 'text-white hover:text-[#e2e8f0]' : 'text-[#213547] hover:text-[#3e4a5a]'}>Postar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
      {posts.length === 0 ? (
        <p className={isDarkMode ? theme.home.emptyPostMessageDark : theme.home.emptyPostMessage}>
          Nenhum post para exibir.
        </p>
      ) : (
        <div className={theme.home.postList}>
          {posts.map((post) => (
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
                        className={
                          isDarkMode
                            ? `${theme.home.postButtonDark} !text-red-500 hover:!text-red-400`
                            : 'px-3 py-1.5 rounded-lg bg-[#ffffff] text-red-500 hover:text-red-700 border border-[#e5e7eb] transition-colors duration-200'
                        }
                        onMouseEnter={() => console.log('isDarkMode:', isDarkMode)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  {user && user.id === post.user.id && (
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
                          viewBox="0 0 24 22"
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
                        if (!user) {
                          console.log('Usuário não autenticado, login necessário. userId:', userId, 'user:', user);
                          return;
                        }
                        toggleLike(post.id).catch(err =>
                          toast.error(err.response?.data?.error || 'Erro ao curtir post.')
                        );
                      }}
                      className={post.likedBy?.includes(userId)
                        ? isDarkMode ? theme.home.likedButtonDark : theme.home.likedButton
                        : isDarkMode ? theme.home.likeButtonDark : theme.home.likeButton}
                    >
                      <svg
                        className="w-5 h-5 mr-1"
                        fill={post.likedBy?.includes(userId) ? 'currentColor' : 'none'}
                        stroke={post.likedBy?.includes(userId) ? 'none' : 'currentColor'}
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
                        if (!user) {
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
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;