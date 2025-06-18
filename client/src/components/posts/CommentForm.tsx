import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostContext } from '../../context/PostContextType';
import { AuthContext } from '../../context/AuthContextType';
import { theme } from '../../styles/theme';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

interface CommentFormProps {
  postId: number;
  parentId?: number;
  isDarkMode: boolean;
  onCancel: () => void;
  initialContent?: string;
  placeholder?: string;
}

function CommentForm({ postId, parentId, isDarkMode, onCancel, initialContent = '', placeholder = 'Adicione um comentário...' }: CommentFormProps) {
  const navigate = useNavigate();
  const postContext = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!postContext || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { addComment } = postContext;
  const { user } = authContext;
  const [commentContent, setCommentContent] = useState(initialContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Faça login para comentar.');
      navigate('/login');
      return;
    }
    const content = commentContent.trim();
    if (!content) {
      toast.warning('O comentário não pode estar vazio.');
      return;
    }
    try {
      await addComment(postId, content, parentId);
      setCommentContent('');
      onCancel();
      toast.success(parentId ? 'Resposta adicionada com sucesso!' : 'Comentário adicionado com sucesso!');
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

  return (
    <form onSubmit={handleSubmit} className="mb-2 mt-2">
      <textarea
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        className={isDarkMode ? theme.home.textareaDark : theme.home.textarea}
        placeholder={placeholder}
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
          onClick={onCancel}
          className={isDarkMode ? theme.profile.cancelButtonDark : theme.profile.cancelButton}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default CommentForm;