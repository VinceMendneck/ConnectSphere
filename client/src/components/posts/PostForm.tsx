import { useState, useRef, useContext } from 'react';
import { PostContext } from '../../context/PostContextType';
import { AuthContext } from '../../context/AuthContextType';
import { theme } from '../../styles/theme';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

interface PostFormProps {
  isDarkMode: boolean;
}

function PostForm({ isDarkMode }: PostFormProps) {
  const navigate = useNavigate();
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

  return (
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
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative w-[150px] h-[150px]">
                  <img
                    src={preview}
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
                className={`w-5 h-5 ${isDarkMode ? 'text-white hover:text-[#e2e8f0]' : 'text-[#213547] hover:text-[#4591d6]'}`}
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
              <span className={isDarkMode ? 'text-white hover:text-[#e2e8f0]' : 'text-[#213547] hover:text-[#4591d6]'}>Postar</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default PostForm;