import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import api from '../services/api';
import { type Post, type Comment } from '../types/index';
import { PostContext } from '../context/PostContextType';
import { AuthContext } from '../context/AuthContextType';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

function HashtagPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const context = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!context || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { posts: globalPosts, toggleCommentLike, addComment, updateComment, deleteComment, toggleLike } = context;
  const { user } = authContext;
  const [posts, setPosts] = useState<Post[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains('dark-theme') ||
    localStorage.getItem('theme') === 'dark' ||
    !localStorage.getItem('theme')
  );
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [loadingAvatars, setLoadingAvatars] = useState<boolean>(true);
  const [userAvatars, setUserAvatars] = useState<Record<number, string>>({});
  const [showCommentInput, setShowCommentInput] = useState<Record<number, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const userId = user ? user.id : 0;

  const DEFAULT_AVATAR = 'http://localhost:5000/uploads/default-avatar.png';

  // Função para buscar múltiplos avatares de uma vez
  const fetchUserAvatars = useCallback(
    async (userIds: number[]) => {
      const uniqueIds = Array.from(new Set(userIds)).filter(id => !userAvatars[id]);
      console.log('Buscando avatares para IDs:', uniqueIds);
      if (uniqueIds.length === 0) {
        console.log('Nenhum avatar para buscar. Definindo loadingAvatars=false');
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
        console.log('Finalizando busca de avatares. loadingAvatars=false');
        setLoadingAvatars(false);
      }
    },
    [userAvatars]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      setLoadingAvatars(true);
      setError(null);
      console.log(`Iniciando busca de posts para hashtag #${tag}`);
      try {
        const response = await api.get(`/api/posts/hashtag/${tag}`);
        console.log('Resposta da API para hashtag:', response.data);
        if (isMounted) {
          if (Array.isArray(response.data)) {
            setPosts(response.data);
            const userIds: number[] = [];
            response.data.forEach((post: Post) => {
              userIds.push(post.user.id);
              post.comments?.forEach((comment) => {
                userIds.push(comment.user.id);
                comment.replies?.forEach((reply) => userIds.push(reply.user.id));
              });
            });
            console.log('IDs de usuários para buscar avatares:', userIds);
            await fetchUserAvatars(userIds);
          } else {
            console.warn('Resposta da API não é um array:', response.data);
            setPosts([]);
            setLoadingAvatars(false);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar posts por hashtag:', error);
        if (isMounted) {
          setPosts([]);
          setLoadingAvatars(false);
          setError('Erro ao carregar posts. Tente novamente mais tarde.');
        }
      } finally {
        if (isMounted) {
          console.log('Finalizando busca de posts. loadingPosts=false');
          setLoadingPosts(false);
        }
      }
    };
    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, [tag, fetchUserAvatars]);

  // Configurar tema inicial em um useEffect separado
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark-theme');
      if (isDark !== isDarkMode) {
        console.log('Mudança de tema detectada. isDarkMode=', isDark);
        setIsDarkMode(isDark);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [isDarkMode]);

  // Sincronizar com PostContext após mudanças, com comparação para evitar loops
  useEffect(() => {
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        const globalPost = globalPosts.find(gp => gp.id === post.id);
        return globalPost || post;
      });
      // Comparar para evitar atualizações desnecessárias
      if (JSON.stringify(updatedPosts) !== JSON.stringify(prevPosts)) {
        console.log('Sincronizando posts com globalPosts:', updatedPosts);
        return updatedPosts;
      }
      return prevPosts;
    });
  }, [globalPosts]);

  const handleLike = async (postId: number) => {
    if (!user) {
      toast.error('Faça login para curtir posts.');
      navigate('/login');
      return;
    }
    console.log(`Tentando curtir/descurtir post ${postId} pelo usuário ${user.id}`);
    try {
      const response = await toggleLike(postId);
      console.log('Resposta do toggleLike:', response);
      toast.success('Ação de curtir/descurtir realizada com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao curtir/descurtir post:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error('Sessão inválida. Faça login novamente.');
          navigate('/login');
        } else {
          toast.error(error.response.data?.error || 'Erro ao curtir post.');
        }
      } else {
        toast.error('Erro ao curtir post.');
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
    console.log(`Tentando adicionar comentário ao post ${postId}:`, commentContent);
    try {
      const response = await addComment(postId, commentContent);
      console.log('Resposta do addComment:', response);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      setShowCommentInput(prev => ({ ...prev, [postId]: false }));
      toast.success('Comentário adicionado com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao enviar comentário:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
        toast.error(error.response.data?.error || 'Erro ao adicionar comentário.');
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
    console.log(`Tentando adicionar resposta ao comentário ${parentId} no post ${postId}:`, replyContent);
    try {
      const response = await addComment(postId, replyContent, parentId);
      console.log('Resposta do addComment (reply):', response);
      setReplyInputs(prev => ({ ...prev, [`${postId}-${parentId}`]: '' }));
      toast.success('Resposta adicionada com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao enviar resposta:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
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
    console.log(`Tentando atualizar comentário ${editingCommentId}:`, content);
    try {
      const response = await updateComment(editingCommentId, content);
      console.log('Resposta do updateComment:', response);
      setEditingCommentId(null);
      setEditCommentContent('');
      toast.success('Comentário atualizado com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao atualizar comentário:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
        toast.error(error.response.data?.error || 'Erro ao atualizar comentário.');
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
    console.log(`Tentando excluir comentário ${commentId}`);
    try {
      await deleteComment(commentId);
      console.log('Comentário excluído com sucesso');
      toast.success('Comentário excluído com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao excluir comentário:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
        toast.error(error.response.data?.error || 'Erro ao excluir comentário.');
      } else {
        toast.error('Erro ao excluir comentário.');
      }
    }
  };

  const handleCommentLike = async (commentId: number) => {
    if (!user) {
      toast.error('Faça login para curtir comentários.');
      navigate('/login');
      return;
    }
    console.log(`Tentando curtir/descurtir comentário ${commentId}`);
    try {
      const response = await toggleCommentLike(commentId);
      console.log('Resposta do toggleCommentLike:', response);
      toast.success('Ação de curtir/descurtir comentário realizada com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao curtir/descurtir comentário:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
        toast.error(error.response.data?.error || 'Erro ao curtir comentário.');
      } else {
        toast.error('Erro ao curtir comentário.');
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
          <Link to={`/profile/${comment.user.id}`} className={theme.hashtag.link}>
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
            <p className={isDarkMode ? theme.hashtag.postContentDark : theme.hashtag.postContent}>
              {comment.content}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCommentLike(comment.id)}
                className={comment.likedBy.includes(userId)
                  ? isDarkMode ? theme.hashtag.likedButtonDark : theme.hashtag.likedButton
                  : isDarkMode ? theme.hashtag.likeButtonDark : theme.hashtag.likeButton}
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
    console.log('Renderizando skeleton. loadingPosts=', loadingPosts, 'loadingAvatars=', loadingAvatars);
    return <LoadingSkeleton />;
  }

  return (
    <div className={isDarkMode ? theme.hashtag.containerDark : theme.hashtag.container}>
      <h2 className={isDarkMode ? theme.home.titleDark : theme.home.title}>Posts com #{tag}</h2>
      <div className={theme.hashtag.postList}>
        {error ? (
          <p
            className={isDarkMode ? theme.hashtag.emptyPostMessageDark : theme.hashtag.emptyPostMessage}
          >
            {error}
          </p>
        ) : posts.length === 0 ? (
          <p
            className={isDarkMode ? theme.hashtag.emptyPostMessageDark : theme.hashtag.emptyPostMessage}
          >
            Nenhum post encontrado com #{tag}.
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className={isDarkMode ? theme.hashtag.postContainerDark : theme.hashtag.postContainer}
            >
              <p className={isDarkMode ? theme.hashtag.postContentDark : theme.hashtag.postContent}>
                {post.content}
              </p>
              {post.images && post.images.length > 0 && (
                <div className="max-w-[320px] w-full mt-2 p-1 ml-0">
                  <div className="grid grid-cols-2 gap-2">
                    {post.images.map((image, index) => (
                      <div key={index} className="relative w-[150px] h-[150px]">
                        <img
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={() => console.log('Erro ao carregar imagem:', image)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className={isDarkMode ? theme.hashtag.postMetaDark : theme.hashtag.postMeta}>
                <div className="flex items-center">
                  <img
                    src={userAvatars[post.user.id] || DEFAULT_AVATAR}
                    alt={`${post.user.username} avatar`}
                    className="w-8 h-8 rounded-full object-cover mr-2"
                    onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
                  />
                  <Link to={`/profile/${post.user.id}`} className={theme.hashtag.link}>
                    @{post.user.username}
                  </Link>
                </div>
                <button
                  onClick={() => handleLike(post.id)}
                  className={post.likedBy?.includes(userId)
                    ? isDarkMode ? theme.hashtag.likedButtonDark : theme.hashtag.likedButton
                    : isDarkMode ? theme.hashtag.likeButtonDark : theme.hashtag.likeButton}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HashtagPage;