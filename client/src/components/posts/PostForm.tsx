import { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostContext } from '../../context/PostContextType';
import { AuthContext } from '../../context/AuthContextType';
import { theme } from '../../styles/theme';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { extractHashtags } from '../../utils/extractHashtags';
import { handleApiError } from '../../utils/handleApiError';

function PostForm({ isDarkMode }: { isDarkMode: boolean }) {
  const postContext = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!postContext || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { addPost } = postContext;
  const { user } = authContext;
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Faça login para criar posts.');
      navigate('/login');
      return;
    }
    if (!content.trim()) {
      toast.error('O conteúdo do post não pode estar vazio.');
      return;
    }
    const formData = new FormData();
    formData.append('content', content);
    extractHashtags(content).forEach((hashtag) => formData.append('hashtags[]', hashtag));
    images.forEach((image) => formData.append('images', image));

    try {
      const response = await api.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      addPost(response.data);
      setContent('');
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Post criado com sucesso!');
    } catch (error: unknown) {
      handleApiError(error, navigate, 'Erro ao criar post.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      toast.error('Você pode enviar no máximo 4 imagens.');
      return;
    }
    const newImages = files.filter((file) => file.type.startsWith('image/'));
    if (newImages.length !== files.length) {
      toast.error('Apenas arquivos de imagem são permitidos.');
    }
    setImages((prev) => [...prev, ...newImages]);
    const previews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={isDarkMode ? theme.home.postFormContainerDark : theme.home.postFormContainer}>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="No que você está pensando?"
          maxLength={280}
          className={isDarkMode ? theme.home.textareaDark : theme.home.textarea}
        />
        <div className={theme.home.postFormFooter}>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <button
                type="button"
                className={isDarkMode ? theme.home.imageUploadButton : theme.home.imageUploadButtonLight}
                onClick={() => fileInputRef.current?.click()}
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </label>
            <span className={isDarkMode ? theme.home.charCountDark : theme.home.charCount}>
              {content.length}/280
            </span>
          </div>
          <button
            type="submit"
            className={isDarkMode ? theme.home.postButtonDark : theme.home.postButton}
            disabled={!content.trim()}
          >
            Postar
          </button>
        </div>
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-[150px] h-[150px]">
                <img
                  src={preview}
                  alt={`Pré-visualização ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  onClick={() => handleRemoveImage(index)}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

export default PostForm;