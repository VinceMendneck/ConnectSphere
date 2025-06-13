import { useState, useEffect, useContext, useRef } from 'react';
import { PostContext } from '../context/PostContextType';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { type Post } from '../types/index';
import type { AxiosError } from 'axios';

// Função para detectar hashtags
const extractHashtags = (text: string) => {
  return text.match(/#\w+/g) || [];
};

function Home() {
  const context = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!context || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { posts, setPosts, addPost, toggleLike, deletePost, updatePost } = context;
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
  const [removedIndices, setRemovedIndices] = useState<number[]>([]); // Estado para rastrear índices removidos
  const userId = user ? user.id : 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('isDarkMode:', isDarkMode);
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [isDarkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      toast.warning('O post deve ter conteúdo ou pelo menos uma imagem.');
      return;
    }
    const formData = new FormData();
    formData.append('content', content);
    images.forEach((image) => {
      if (image) formData.append('images', image);
    });
    console.log('FormData enviado:', Array.from(formData.entries()));
    try {
      await addPost(formData);
      setContent('');
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      imagePreviews.forEach(URL.revokeObjectURL);
      toast.success('Post criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao criar post.');
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
      await deletePost(postId);
      toast.success('Post excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast.error('Erro ao excluir post.');
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content || '');
    setEditImages([]);
    setRemovedIndices([]); // Resetar índices removidos ao entrar no modo de edição
    // Inicializar com caminhos relativos e adicionar prefixo na renderização
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

    // Enviar imagens existentes como caminhos relativos no campo existingImages
    const originalImages = posts.find(post => post.id === editingPostId)?.images || [];
    if (originalImages.length > 0) {
      const existingUrls = originalImages.map(image => image.replace('http://localhost:5000/', ''));
      formData.append('existingImages', JSON.stringify(existingUrls));
    }

    // Enviar novas imagens como arquivos
    editImages.forEach((image) => {
      if (image) formData.append('images', image);
    });

    // Enviar índices de imagens removidas
    if (removedIndices.length > 0) {
      formData.append('removedImages', JSON.stringify(removedIndices));
    }

    console.log('FormData enviado (update):', Array.from(formData.entries()));
    try {
      const response: Post = await updatePost(editingPostId, formData);
      console.log('Resposta da atualização - response:', response);
      setEditImagePreviews(response.images || []); // Sincronizar com a resposta do backend
      setPosts(prevPosts =>
        prevPosts.map((post: Post) =>
          post.id === editingPostId ? { ...post, ...response } : post
        )
      );
      setEditingPostId(null);
      setEditContent('');
      setEditImages([]);
      setEditImagePreviews([]);
      setRemovedIndices([]);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
      editImagePreviews.forEach(URL.revokeObjectURL);
      toast.success('Post atualizado com sucesso!');
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Erro ao atualizar post:', axiosError.response?.data || axiosError.message);
      toast.error('Erro ao atualizar post.');
    }
  };

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
                    <Link to={`/profile/${post.user.id}`} className={theme.home.hashtagLink}>
                      @{post.user.username}
                    </Link>
                    <button
                      onClick={async () => {
                        if (!user) {
                          console.log('Usuário não autenticado, login necessário. userId:', userId, 'user:', user);
                          return;
                        }
                        try {
                          await toggleLike(post.id);
                        } catch (error) {
                          console.error('Erro ao curtir/descurtir:', error);
                        }
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