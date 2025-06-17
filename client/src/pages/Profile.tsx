import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PostContext } from '../context/PostContextType';
import { theme } from '../styles/theme';
import api from '../services/api';
import type { AxiosResponse } from 'axios';
import { type Post } from '../types/index';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

interface UserResponse {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  posts?: Post[];
  followers?: number;
  following?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  posts?: Post[];
  followers?: number;
  following?: number;
}

interface FollowUser {
  id: number;
  username: string;
  email: string;
}

interface JwtPayload {
  userId: number;
  username: string;
}

// Função para processar hashtags e convertê-las em links
const renderPostContent = (content: string) => {
  const hashtagRegex = /#(\w+)/g;
  const parts = content.split(hashtagRegex);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <Link
          key={index}
          to={`/hashtag/${part}`}
          className={theme.profile.hashtagLink}
        >
          #{part}
        </Link>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [error, setError] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')
  );
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followersList, setFollowersList] = useState<FollowUser[]>([]);
  const [followingList, setFollowingList] = useState<FollowUser[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const postContext = useContext(PostContext);

  if (!postContext) {
    throw new Error('PostContext must be used within a PostProvider');
  }

  const { updatePost } = postContext;

  // Obtém o ID do usuário logado do token JWT
  const token = localStorage.getItem('token');
  let loggedInUserId: number | null = null;
  if (token) {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      loggedInUserId = decoded.userId;
    } catch (err) {
      console.error('Erro ao decodificar token:', err);
    }
  }

  const isOwnProfile = user?.id === loggedInUserId;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/api/users/${id}`);
        setUser(response.data);
        setBio(response.data.bio || '');
      } catch (err) {
        setError(['Erro ao carregar perfil']);
        console.error('Erro ao carregar perfil:', err);
      }
    };

    const fetchFollowStatus = async () => {
      if (!loggedInUserId || isOwnProfile) return;
      try {
        const followers = await api.get(`/api/users/${id}/followers`);
        const isFollowing = followers.data.some((f: FollowUser) => f.id === loggedInUserId);
        setIsFollowing(isFollowing);
      } catch (err) {
        console.error('Erro ao verificar status de follow:', err);
      }
    };

    const fetchFollowers = async () => {
      try {
        const response = await api.get(`/api/users/${id}/followers`);
        setFollowersList(response.data);
      } catch (err) {
        console.error('Erro ao carregar seguidores:', err);
      }
    };

    const fetchFollowing = async () => {
      try {
        const response = await api.get(`/api/users/${id}/following`);
        setFollowingList(response.data);
      } catch (err) {
        console.error('Erro ao carregar seguidos:', err);
      }
    };

    fetchUser();
    fetchFollowStatus();
    fetchFollowers();
    fetchFollowing();

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [id, loggedInUserId, isOwnProfile]);

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
      }
      toast.success(`${type === 'bio' ? 'Bio' : 'Avatar'} atualizado com sucesso!`);
    } catch (err: unknown) {
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const error = err as { response?: { status?: number; data?: { error?: string } } };
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.error || 'Sessão expirada';
          toast.error(`${errorMessage}. Faça login novamente.`);
          navigate('/login');
          return;
        }
        if (error.response?.status === 403) {
          toast.error('Permissão negada. Verifique sua sessão.');
          navigate('/login');
          return;
        }
        const errorMessage = error.response?.data?.error || 'Erro ao atualizar perfil';
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
      // Atualiza contagem de seguidores
      setUser(prev => ({
        ...prev!,
        followers: isFollowing ? (prev!.followers || 0) - 1 : (prev!.followers || 0) + 1,
      }));
      // Atualiza listas
      const followersResponse = await api.get(`/api/users/${id}/followers`);
      setFollowersList(followersResponse.data);
      const followingResponse = await api.get(`/api/users/${id}/following`);
      setFollowingList(followingResponse.data);
      toast.success(response.data.message);
    } catch (err: unknown) {
      let errorMessage = 'Erro ao gerenciar follow';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorObj = err as { response?: { data?: { error?: string } } };
        errorMessage = errorObj.response?.data?.error || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await api.delete(`/api/posts/${postId}`);
      setUser(prev => ({ ...prev!, posts: prev!.posts?.filter(post => post.id !== postId) || [] }));
      toast.success('Post excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir post.');
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost({ ...post });
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

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    if (!editingPost.content.trim() && editImagePreviews.length === 0) {
      toast.warning('O post deve ter conteúdo ou pelo menos uma imagem.');
      return;
    }

    const formData = new FormData();
    formData.append('content', editingPost.content);

    const originalImages = editingPost.images || [];
    if (originalImages.length > 0) {
      const existingUrls = originalImages.map(image => 
        image.replace('http://localhost:5000/', '')
      );
      formData.append('existingImages', JSON.stringify(existingUrls));
    }

    editImages.forEach((image) => {
      if (image) formData.append('images', image);
    });

    if (removedIndices.length > 0) {
      formData.append('removedImages', JSON.stringify(removedIndices));
    }

    try {
      const updatedPost = await updatePost(editingPost.id, formData);
      setUser(prev => ({
        ...prev!,
        posts: prev!.posts?.map(post => 
          post.id === editingPost.id 
            ? { 
                ...post, 
                content: editingPost.content, 
                images: updatedPost.images?.map((img: string) => 
                  img.startsWith('http://localhost:5000/') ? img : `http://localhost:5000/${img}`
                ) || [] 
              } 
            : post
        ) || []
      }));
      const updatedUser: AxiosResponse<UserResponse> = await api.get(`/api/users/${id}`);
      setUser(updatedUser.data);
      setEditImagePreviews([]);
      setEditingPost(null);
      setEditImages([]);
      setRemovedIndices([]);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
      editImagePreviews.forEach(URL.revokeObjectURL);
      toast.success('Post atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar post.');
    }
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditImages([]);
    setEditImagePreviews([]);
    setRemovedIndices([]);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
    editImagePreviews.forEach(URL.revokeObjectURL);
  };

  if (!user) return <div className={isDarkMode ? theme.profile.containerDark : theme.profile.container}>Carregando...</div>;

  const DEFAULT_AVATAR = 'http://localhost:5000/uploads/default-avatar.png';

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
          <div className={isDarkMode ? theme.profile.postList : theme.profile.postList}>
            {user.posts && user.posts.length > 0 ? (
              [...user.posts].reverse().map((post) => (
                <div key={post.id} className={isDarkMode ? theme.profile.postContainerDark : theme.profile.postContainer}>
                  <p className={isDarkMode ? theme.profile.postContentDark : theme.profile.postContent}>
                    {renderPostContent(post.content)}
                  </p>
                  {post.images && post.images.length > 0 && (
                    <div className="max-w-[320px] w-full mt-2 p-1 ml-0">
                      <div className="grid grid-cols-2 gap-2">
                        {post.images.map((image, index) => (
                          <div key={index} className="relative w-[150px] h-[150px]">
                            <img
                              src={image.startsWith('http://localhost:5000/') ? image : `http://localhost:5000/${image}`}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={isDarkMode ? theme.profile.postMetaDark : theme.profile.postMeta}>
                    <Link to={`/profile/${user.id}`} className={theme.profile.hashtagLink}>
                      @{user.username}
                    </Link>
                    {isOwnProfile && (
                      <>
                        <button
                          onClick={() => handleEditPost(post)}
                          className="text-blue-500 hover:text-blue-700 ml-2"
                          title="Editar post"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          title="Excluir post"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  {editingPost && editingPost.id === post.id && isOwnProfile && (
                    <div className={isDarkMode ? 'p-4 bg-gray-800 rounded-lg' : theme.home.postFormContainer}>
                      <textarea
                        value={editingPost.content}
                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                        className={`${isDarkMode ? theme.auth.inputDark : theme.auth.input} w-full p-3 border rounded-lg`}
                      />
                      {editImagePreviews.length > 0 && (
                        <div className="max-w-[320px] w-full mt-2 p-1 ml-0">
                          <div className="grid grid-cols-2 gap-2">
                            {editImagePreviews.map((preview, index) => (
                              <div key={index} className="relative w-[150px] h-[150px] group">
                                <img
                                  src={preview}
                                  alt={`Edit preview ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg transition-all duration-200 group-hover:brightness-50"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEditImage(index)}
                                  className="absolute inset-0 w-full h-full bg-red-500 bg-opacity-0 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-opacity-50"
                                  title="Remover imagem"
                                >
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center mt-2">
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
                          <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-[#213547]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" fill="none" />
                            <path d="M5 7h14M5 12h7m-7 5h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                          </svg>
                        </label>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button onClick={handleUpdatePost} className={`${isDarkMode ? theme.auth.buttonDark : theme.auth.button} mr-2`}>Salvar</button>
                        <button onClick={cancelEdit} className={`${isDarkMode ? theme.profile.cancelButtonDark : theme.profile.cancelButton}`}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className={isDarkMode ? theme.profile.emptyMessageDark : theme.profile.emptyMessage}>Nenhum post disponível.</p>
            )}
          </div>
        )}
        {activeTab === 'followers' && (
          <div className={isDarkMode ? theme.profile.postList : theme.profile.postList}>
            {followersList.length > 0 ? (
              followersList.map((follower) => (
                <div key={follower.id} className={isDarkMode ? theme.profile.postContainerDark : theme.profile.postContainer}>
                  <Link to={`/profile/${follower.id}`} className={theme.profile.hashtagLink}>
                    @{follower.username}
                  </Link>
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
                  <Link to={`/profile/${followed.id}`} className={theme.profile.hashtagLink}>
                    @{followed.username}
                  </Link>
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