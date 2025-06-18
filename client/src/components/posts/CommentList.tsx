import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostContext } from '../../context/PostContextType';
import { AuthContext } from '../../context/AuthContextType';
import { toast } from 'react-toastify';
import { type Post } from '../../types/index';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

interface CommentListProps {
  post: Post;
  isDarkMode: boolean;
  userAvatars: Record<number, string>;
}

function CommentList({ post, isDarkMode, userAvatars }: CommentListProps) {
  const navigate = useNavigate();
  const postContext = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!postContext || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { user } = authContext;
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleCommentClick = () => {
    if (!user) {
      toast.error('Faça login para comentar.');
      navigate('/login');
      return;
    }
    setShowCommentForm(!showCommentForm);
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleCommentClick}
        className="text-blue-500 hover:text-blue-700"
      >
        Comentar
      </button>
      {showCommentForm && (
        <CommentForm
          postId={post.id}
          isDarkMode={isDarkMode}
          onCancel={() => setShowCommentForm(false)}
        />
      )}
      {post.comments?.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          post={post}
          isDarkMode={isDarkMode}
          userAvatars={userAvatars}
          level={0}
        />
      ))}
    </div>
  );
}

export default CommentList;