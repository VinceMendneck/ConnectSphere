import { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostContext } from '../../context/PostContextType';
import { theme } from '../../styles/theme';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { type Post } from '../../types/index';

interface EditPostFormProps {
  post: Post;
  isDarkMode: boolean;
  onCancel: () => void;
  fetchUserAvatar: (userId: number) => Promise<void>;
}

function EditPostForm({ post, isDarkMode, onCancel, fetchUserAvatar }: EditPostFormProps) {
  const navigate = useNavigate();
  const postContext = useContext(PostContext);
  if (!postContext) {
    throw new Error('PostContext must be used within its Provider');
  }
  const { updatePost } = postContext;
  const [editContent, setEditContent] = useState(post.content || '');
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>(
    post.images?.map(image => image.startsWith('http://localhost:5000/') ? image : `http://localhost:5000/${image}`) || []
  );
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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
    const newImages = editImages.filter((_, i) => i !== index - (editImagePreviews.length - editImages.length));
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

    const formData = new FormData();
    formData.append('content', editContent);
    const originalImages = post.images || [];
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
      const response: Post = await updatePost(post.id, formData);
      setEditImagePreviews(response.images || []);
      fetchUserAvatar(response.user.id);
      setEditContent('');
      setEditImages([]);
      setEditImagePreviews([]);
      setRemovedIndices([]);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
      editImagePreviews.forEach(URL.revokeObjectURL);
      toast.success('Post atualizado com sucesso!');
      onCancel();
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

  return (
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
            onClick={onCancel}
            className={isDarkMode ? theme.profile.cancelButtonDark : theme.profile.cancelButton}
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

export default EditPostForm;