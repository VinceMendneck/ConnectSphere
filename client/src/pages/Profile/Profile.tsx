import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { PostContext } from '../../context/PostContextType';
import { AuthContext } from '../../context/AuthContextType';
import { theme } from './theme';
import api from '../../services/api';
import { type User as UserType, type Post } from '../../types/index';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ProfileHeader from '../../components/profile/ProfileHeader';
import BioSection from '../../components/profile/BioSection';
import Tabs from '../../components/profile/Tabs';
import FollowList from '../../components/profile/FollowList';
import PostList from '../../components/posts/PostList';
import useDarkMode from '../../hooks/useDarkMode';
import useAvatars from '../../hooks/useAvatars';

interface User extends UserType {
  email: string;
  bio?: string;
  avatar?: string;
  followers?: number;
  following?: number;
}

interface FollowUser {
  id: number;
  username: string;
  email: string;
}

function Profile() {
  const { id } = useParams<{ id: string }>();
  const postContext = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!postContext || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { posts } = postContext;
  const { user: authUser } = authContext;
  const isDarkMode = useDarkMode();
  const { userAvatars, setUserAvatars, fetchUserAvatars, loadingAvatars } = useAvatars();
  const [user, setUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followersList, setFollowersList] = useState<FollowUser[]>([]);
  const [followingList, setFollowingList] = useState<FollowUser[]>([]);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const loggedInUserId = authUser ? authUser.id : null;
  const isOwnProfile = user?.id === loggedInUserId;

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      setLoadingProfile(true);
      try {
        const userResponse = await api.get(`/api/users/${id}`);
        let isFollowingStatus = false;
        if (loggedInUserId && !isOwnProfile) {
          const followersResponse = await api.get(`/api/users/${id}/followers`);
          isFollowingStatus = followersResponse.data.some((f: FollowUser) => f.id === loggedInUserId);
        }
        const [followersResponse, followingResponse] = await Promise.all([
          api.get(`/api/users/${id}/followers`),
          api.get(`/api/users/${id}/following`),
        ]);

        if (isMounted) {
          setUser(userResponse.data);
          setIsFollowing(isFollowingStatus);
          setFollowersList(followersResponse.data);
          setFollowingList(followingResponse.data);

          const userIds: number[] = [parseInt(id!)];
          followersResponse.data.forEach((follower: FollowUser) => userIds.push(follower.id));
          followingResponse.data.forEach((followed: FollowUser) => userIds.push(followed.id));
          posts.forEach((post: Post) => {
            if (post.user.id === parseInt(id!)) {
              userIds.push(post.user.id);
              post.comments?.forEach((comment) => {
                userIds.push(comment.user.id);
                comment.replies?.forEach((reply) => userIds.push(reply.user.id));
              });
            }
          });
          await fetchUserAvatars(userIds);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [id, loggedInUserId, isOwnProfile, fetchUserAvatars, posts]);

  if (loadingProfile || loadingAvatars) {
    return <LoadingSkeleton isDarkMode={isDarkMode} />;
  }

  if (!user) {
    return (
      <div className={isDarkMode ? theme.profile.containerDark : theme.profile.container}>
        Erro ao carregar perfil.
      </div>
    );
  }

  const userPosts = posts
    .filter((post) => post.user.id === parseInt(id!))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className={isDarkMode ? theme.profile.containerDark : theme.profile.container}>
      {/* Debug: Exibir avatar diretamente */}
      {user.avatar && (
        <div className="mb-4">
          <p>Avatar Debug:</p>
          <img
            src={user.avatar}
            alt="Debug Avatar"
            className="w-32 h-32 rounded-full object-cover"
            onError={() => console.error(`Erro ao carregar avatar de debug: ${user.avatar}`)}
          />
        </div>
      )}
      <ProfileHeader
        user={user}
        isDarkMode={isDarkMode}
        isOwnProfile={isOwnProfile}
        setUser={setUser}
        setUserAvatars={setUserAvatars}
      />
      <BioSection
        user={user}
        isDarkMode={isDarkMode}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        setUser={setUser}
        setIsFollowing={setIsFollowing}
        setFollowersList={setFollowersList}
        setFollowingList={setFollowingList}
        setUserAvatars={setUserAvatars}
      />
      <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        followersCount={user.followers || 0}
        followingCount={user.following || 0}
        isDarkMode={isDarkMode}
      />
      <div className="mt-4">
        {activeTab === 'posts' && (
          <PostList
            posts={userPosts}
            isDarkMode={isDarkMode}
            userAvatars={userAvatars}
            fetchUserAvatar={async (userId: number) => await fetchUserAvatars([userId])}
            emptyMessage="Nenhum post vazio."
          />
        )}
        {activeTab === 'followers' && (
          <FollowList
            users={followersList}
            userAvatars={userAvatars}
            isDarkMode={isDarkMode}
            emptyMessage="Nenhum seguidor."
          />
        )}
        {activeTab === 'following' && (
          <FollowList
            users={followingList}
            userAvatars={userAvatars}
            isDarkMode={isDarkMode}
            emptyMessage="Não segue ninguém."
          />
        )}
      </div>
    </div>
  );
}

export default Profile;