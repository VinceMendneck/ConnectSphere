import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';
import Avatar from '../common/Avatar';

interface FollowUser {
  id: number;
  username: string;
  email: string;
}

interface FollowListProps {
  users: FollowUser[];
  userAvatars: Record<number, string>;
  isDarkMode: boolean;
  emptyMessage: string;
}

function FollowList({ users, userAvatars, isDarkMode, emptyMessage }: FollowListProps) {
  return (
    <div className={isDarkMode ? theme.profile.postList : theme.profile.postList}>
      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.id}
            className={isDarkMode ? theme.profile.postContainerDark : theme.profile.postContainer}
          >
            <div className="flex items-center">
              <Avatar
                src={userAvatars[user.id]}
                username={user.username}
                size="sm"
                className="mr-2"
              />
              <Link to={`/profile/${user.id}`} className={theme.profile.hashtagLink}>
                @{user.username}
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p className={isDarkMode ? theme.profile.postContentDark : theme.profile.postContent}>
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

export default FollowList;