import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PostContext } from '../../context/PostContextType';
import { AuthContext } from '../../context/AuthContextType';
import { theme } from '../../styles/theme';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { type Comment, type Post } from '../../types/index';
import Avatar from '../common/Avatar';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  post: Post;
  isDarkMode: boolean;
  userAvatars: Record<number, string>;
  level?: number;
}

function CommentItem({ comment, post, isDarkMode, userAvatars, level = 0 }: CommentItemProps) {
  const navigate = useNavigate();
  const postContext = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!postContext || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { toggleCommentLike, updateComment, deleteComment } = postContext;
  const { user } = authContext;
  const userId = user ? user.id : 0;
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleEditComment = () => {
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
    const content = editCommentContent.trim();
    if (!content) {
      toast.warning('O comentário não pode estar vazio.');
      return;
    }
    try {
      await updateComment(comment.id, content);
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

  const handleDeleteComment = async () => {
    if (!user) {
      toast.error('Faça login para excluir comentários.');
      navigate('/login');
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;
    try {
      await deleteComment(comment.id);
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

  const handleCommentLike = () => {
    if (!user) {
      toast.error('Faça login para curtir comentários.');
      navigate('/login');
      return;
    }
    toggleCommentLike(comment.id).catch(err =>
      toast.error(err.response?.data?.error || 'Erro ao curtir comentário.')
    );
  };

  return (
    <div className={`ml-${level * 4} mt-2 relative`}>
      <div className="flex items-center">
        <Avatar
          src={userAvatars[comment.user.id]}
          username={comment.user.username}
          size="sm"
          className="mr-2"
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
              onClick={handleCommentLike}
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
                setShowReplyForm(true);
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
                  onClick={handleEditComment}
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
                onClick={handleDeleteComment}
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
          {showReplyForm && (
            <CommentForm
              postId={post.id}
              parentId={comment.id}
              isDarkMode={isDarkMode}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Escreva uma resposta..."
            />
          )}
        </>
      )}
    </div>
  );
}

export default CommentItem;