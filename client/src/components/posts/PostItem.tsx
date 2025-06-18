import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PostContext } from '../../context/PostContextType';
import { AuthContext } from '../../context/AuthContextType';
import { theme } from '../../styles/theme';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { type Post } from '../../types/index';
import Avatar from '../common/Avatar';
import EditPostForm from './EditPostForm';
import CommentList from './CommentList';
import { renderHashtags } from '../../utils/renderHashtags';
import { extractHashtags } from '../../utils/extractHashtags';

interface PostItemProps {
  post: Post;
  isDarkMode: boolean;
  userAvatars: Record<number, string>;
  fetchUserAvatar: (userId: number) => Promise<void>;
}

function PostItem({ post, isDarkMode, userAvatars, fetchUserAvatar }: PostItemProps) {
  const navigate = useNavigate();
  const postContext = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!postContext || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { toggleLike, deletePost } = postContext;
  const { user } = authContext;
  const userId = user ? user.id : 0;
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const handleEditPost = () => {
    setEditingPostId(post.id);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
  };

  const handleDeletePost = async () => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await deletePost(post.id);
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

  const handleLike = () => {
    if (!user) {
      toast.error('Faça login para curtir posts.');
      navigate('/login');
      return;
    }
    toggleLike(post.id).catch(err =>
      toast.error(err.response?.data?.error || 'Erro ao curtir post.')
    );
  };

  return (
    <div className={`${isDarkMode ? theme.home.postContainerDark : theme.home.postContainer} relative`}>
      {editingPostId === post.id ? (
        <EditPostForm
          post={post}
          isDarkMode={isDarkMode}
          onCancel={handleCancelEdit}
          fetchUserAvatar={fetchUserAvatar}
        />
      ) : (
        <>
          {user && user.id === post.user.id && (
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={handleEditPost}
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
                onClick={handleDeletePost}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Excluir post"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
          <p className={isDarkMode ? theme.home.postContentDark : theme.home.postContent}>
            {typeof extractHashtags === 'function' && extractHashtags(post.content).length > 0
              ? renderHashtags(post.content)
              : post.content}
          </p>
          {post.images && post.images.length > 0 && (
            <div className="max-w-[320px] w-full mt-2 p-1 ml-0">
              <div className="grid grid-cols-2 gap-2">
                {post.images.map((image, index) =>
                  image && typeof image === 'string' && image.startsWith('http://localhost:5000/') ? (
                    <div key={index} className="relative w-[150px] h-[150px]">
                      <img
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
          <div className={isDarkMode ? theme.home.postMetaDark : theme.home.postMeta}>
            <div className="flex items-center">
              <Avatar
                src={userAvatars[post.user.id]}
                username={post.user.username}
                size="md"
                className="mr-2"
              />
              <Link to={`/profile/${post.user.id}`} className={theme.home.hashtagLink}>
                @{post.user.username}
              </Link>
            </div>
            <button
              onClick={handleLike}
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
          <CommentList
            post={post}
            isDarkMode={isDarkMode}
            userAvatars={userAvatars}
          />
        </>
      )}
    </div>
  );
}

export default PostItem;