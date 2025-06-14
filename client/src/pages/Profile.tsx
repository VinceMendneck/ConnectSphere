import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { theme } from '../styles/theme';
import api from '../services/api';
import { type Post } from '../types/index';
import { toast } from 'react-toastify';

interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  header?: string;
  posts?: Post[];
  followers?: number;
  following?: number;
}

function Profile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [header, setHeader] = useState<File | null>(null);
  const [error, setError] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')
  );
  const [editingPost, setEditingPost] = useState<Post | null>(null); // Estado para edição
  const [editImages, setEditImages] = useState<File[]>([]); // Novos arquivos de imagem
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]); // Pré-visualizações
  const [removedIndices, setRemovedIndices] = useState<number[]>([]); // Índices removidos

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/api/users/${id}`);
        console.log('Resposta da API para perfil - raw data:', response.data);
        setUser(response.data);
        setBio(response.data.bio || '');
      } catch (err) {
        setError(['Erro ao carregar perfil']);
        console.error('Erro ao carregar perfil:', err);
      }
    };
    fetchUser();

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError([]);
    const formData = new FormData();
    formData.append('bio', bio);
    if (avatar) formData.append('avatar', avatar);
    if (header) formData.append('header', header);

    try {
      await api.put(`/api/users/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const response = await api.get(`/api/users/${id}`);
      setUser(response.data);
      setBio(response.data.bio || '');
      setAvatar(null);
      setHeader(null);
    } catch (err) {
      setError(['Erro ao atualizar perfil']);
      console.error('Erro ao atualizar perfil:', err);
    }
  };

  if (!user) return <div className={isDarkMode ? theme.profile.containerDark : theme.profile.container}>Carregando...</div>;

  const defaultHeader = '/default-header.jpg';
  const defaultAvatar = '/default-avatar.png';

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await api.delete(`/api/posts/${postId}`);
      setUser({ ...user, posts: user.posts?.filter(post => post.id !== postId) || [] });
      toast.success('Post excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast.error('Erro ao excluir post.');
    }
  };

  const handleEditPost = (post: Post) => {
    const currentPost = user.posts?.find(p => p.id === post.id);
    setEditingPost({ ...post }); // Criar uma cópia do post
    setEditImages([]); // Resetar imagens novas
    setEditImagePreviews(currentPost?.images || []); // Usar o estado atualizado de user.posts
    setRemovedIndices([]); // Resetar índices removidos
    console.log('Inicializando edição para post ID:', post.id, 'com imagens:', currentPost?.images);
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
    console.log('Removendo imagem no índice:', index, 'Estado atual:', {
      editImagePreviews: editImagePreviews.map((p, i) => ({ idx: i, url: p })),
      editImages,
      removedIndices,
    });
    // Filtrar apenas o índice especificado
    const newImages = editImages.filter((_, i) => i !== index - (editImagePreviews.length - editImages.length - removedIndices.length));
    const newPreviews = editImagePreviews.filter((_, i) => i !== index);
    const newRemovedIndices = index < (user.posts?.find(p => p.id === editingPost?.id)?.images?.length || 0)
      ? [...new Set([...removedIndices, index])]
      : removedIndices;
    URL.revokeObjectURL(editImagePreviews[index]);
    setEditImages(newImages);
    setEditImagePreviews(newPreviews);
    setRemovedIndices(newRemovedIndices);
    console.log('Estado após remoção:', {
      newPreviews: newPreviews.map((p, i) => ({ idx: i, url: p })),
      newImages,
      newRemovedIndices,
    });
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const formData = new FormData();
    formData.append('content', editingPost.content);

    // Enviar imagens existentes (exceto as removidas)
    const originalImages = (user.posts?.find(p => p.id === editingPost.id)?.images || []).map(img => img.replace('http://localhost:5000/', ''));
    const remainingImages = originalImages.filter((_, i) => !removedIndices.includes(i));
    if (remainingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(remainingImages));
    }

    // Enviar novas imagens
    editImages.forEach((image) => {
      if (image) formData.append('images', image);
    });

    // Enviar índices de imagens removidas
    if (removedIndices.length > 0) {
      formData.append('removedImages', JSON.stringify(removedIndices));
    }

    console.log('Enviando atualização para post ID:', editingPost.id, 'com conteúdo:', editingPost.content, 'imagens:', editImages, 'removidas:', removedIndices);

    try {
      const response = await api.put(`/api/posts/${editingPost.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Resposta da API após atualização:', response.data);
      const updatedUser = await api.get(`/api/users/${id}`);
      console.log('User após atualização:', updatedUser.data);
      setUser(updatedUser.data);
      setEditingPost(null);
      setEditImages([]);
      setEditImagePreviews([]);
      setRemovedIndices([]);
      toast.success('Post atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      toast.error('Erro ao atualizar post. Verifique o console para detalhes.');
    }
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditImages([]);
    setEditImagePreviews([]);
    setRemovedIndices([]);
  };

  return (
    <div className={isDarkMode ? theme.profile.containerDark : theme.profile.container}>
      {/* Foto de Perfil (Header) */}
      <div
        className="w-full h-40 bg-gray-300 relative"
        style={{
          backgroundImage: user.header ? `url(${user.header})` : `url(${defaultHeader})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <label
          htmlFor="header-upload"
          className="absolute bottom-2 right-2 text-white bg-blue-500 p-1 rounded-full hover:bg-blue-600 cursor-pointer"
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
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </label>
        <input
          type="file"
          accept="image/*"
          id="header-upload"
          onChange={(e) => setHeader(e.target.files ? e.target.files[0] : null)}
          className="hidden"
        />
      </div>

      {/* Avatar e Informações */}
      <div className="relative flex flex-col items-center -mt-12">
        <div className="relative">
          <img
            src={user.avatar || defaultAvatar}
            alt={`${user.username} avatar`}
            className="w-32 h-32 rounded-full border-4 border-white object-cover"
          />
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 cursor-pointer"
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </label>
          <input
            type="file"
            accept="image/*"
            id="avatar-upload"
            onChange={(e) => setAvatar(e.target.files ? e.target.files[0] : null)}
            className="hidden"
          />
        </div>
        <h2 className={isDarkMode ? theme.profile.titleDark : theme.profile.title}>{user.username}</h2>
        <p className={isDarkMode ? theme.profile.infoDark : theme.profile.info}>@{user.username}</p>
      </div>

      {/* Bio */}
      <div className="mt-4 p-4 bg-gray-800 rounded-lg max-w-2xl mx-auto flex flex-col items-center text-center">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 160))} // Limite de 160 caracteres
          placeholder="Adicione uma bio (máximo 160 caracteres)"
          className={`${theme.auth.inputDark} w-full h-24 resize-none text-center`}
        />
        <p className="text-sm text-gray-400 mt-1">{bio.length}/160</p>
        {error.length > 0 && (
          <div className="text-red-500 text-sm mt-2">
            {error.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={handleUpdate}
          className={theme.auth.buttonDark}
        >
          Atualizar Bio
        </button>
      </div>

      {/* Abas */}
      <div className="mt-4 flex justify-center space-x-4">
        <button
          className={`${theme.profile.tab} ${activeTab === 'posts' ? 'bg-blue-500' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          className={`${theme.profile.tab} ${activeTab === 'followers' ? 'bg-blue-500' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('followers')}
        >
          Followers {user.followers || 0}
        </button>
        <button
          className={`${theme.profile.tab} ${activeTab === 'following' ? 'bg-blue-500' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('following')}
        >
          Following {user.following || 0}
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-4">
        {activeTab === 'posts' && (
          <div className={isDarkMode ? theme.hashtag.postList : theme.hashtag.postList}>
            {user.posts && user.posts.length > 0 ? (
              [...user.posts].reverse().map((post) => (
                <div
                  key={post.id}
                  className={isDarkMode ? theme.hashtag.postContainerDark : theme.hashtag.postContainer}
                >
                  <p className={isDarkMode ? theme.hashtag.postContentDark : theme.hashtag.postContent}>{post.content}</p>
                  {post.images && post.images.length > 0 && (
                    <div className="max-w-[320px] w-full mt-2 p-1 ml-0">
                      <div className="grid grid-cols-2 gap-2">
                        {post.images.map((image, index) => {
                          console.log(`Rendering image ${index + 1}: ${image}`);
                          const normalizedImage = image.startsWith('http://localhost:5000/')
                            ? image
                            : image.startsWith('uploads/')
                            ? `http://localhost:5000/${image}`
                            : image;
                          return (
                            <div key={index} className="relative w-[150px] h-[150px]">
                              <img
                                src={normalizedImage}
                                alt={`Post image ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                                onError={() => console.log('Erro ao carregar imagem:', normalizedImage)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className={isDarkMode ? theme.hashtag.postMetaDark : theme.hashtag.postMeta}>
                    <Link to={`/profile/${user.id}`} className={theme.hashtag.link}>
                      @{user.username}
                    </Link>
                    {user.id === parseInt(id ?? '') && (
                      <>
                        <button
                          onClick={() => handleEditPost(post)}
                          className="text-blue-500 hover:text-blue-700 ml-2"
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
                          className="text-red-500 hover:text-red-700 ml-2"
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
                      </>
                    )}
                  </div>
                  {editingPost && editingPost.id === post.id && (
                    <div className="mt-2 p-4 bg-gray-800 rounded-lg">
                      <textarea
                        value={editingPost.content}
                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                        className={`${theme.auth.inputDark} w-full p-3 border rounded-lg bg-[#1f1f1f] text-[#e2e8f0] border-[#444444] focus:outline-none focus:ring-2 focus:ring-[#555555] resize-none`}
                      />
                      {editImagePreviews.length > 0 && (
                        <div className="max-w-[320px] w-full mt-2 p-1 ml-0">
                          <div className="grid grid-cols-2 gap-2">
                            {editImagePreviews.map((preview, index) => {
                              console.log(`Rendering edit preview ${index + 1}: ${preview}`); // Depuração
                              // Verificar se é uma URL local (nova imagem) ou do servidor
                              const isLocalUrl = preview.startsWith('blob:');
                              const normalizedPreview = isLocalUrl ? preview : (preview.startsWith('http://localhost:5000/') ? preview : `http://localhost:5000/${preview}`);
                              return (
                                <div key={index} className="relative w-[150px] h-[150px] group">
                                  <img
                                    src={normalizedPreview}
                                    alt={`Edit preview ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg transition-all duration-200 group-hover:brightness-50"
                                    onError={() => console.log('Erro ao carregar edit preview:', normalizedPreview)}
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
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
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
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleUpdatePost}
                          className={`${theme.auth.buttonDark} mr-2`}
                        >
                          Salvar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className={`${theme.auth.buttonDark} text-red-500 hover:text-red-700`}
                        >
                          Cancelar
                        </button>
                        {error.length > 0 && (
                          <div className="text-red-500 text-sm mt-2">
                            {error.map((msg, index) => (
                              <p key={index}>{msg}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className={isDarkMode ? theme.hashtag.emptyPostMessageDark : theme.hashtag.emptyPostMessage}>
                Nenhum post disponível.
              </p>
            )}
          </div>
        )}
        {activeTab === 'followers' && (
          <div className={isDarkMode ? theme.hashtag.postList : theme.hashtag.postList}>
            <p className={isDarkMode ? theme.hashtag.postContentDark : theme.hashtag.postContent}>
              Followers: {user.followers || 0}
            </p>
          </div>
        )}
        {activeTab === 'following' && (
          <div className={isDarkMode ? theme.hashtag.postList : theme.hashtag.postList}>
            <p className={isDarkMode ? theme.hashtag.postContentDark : theme.hashtag.postContent}>
              Following: {user.following || 0}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;