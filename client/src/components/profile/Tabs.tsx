import { theme } from '../../styles/theme';

interface TabsProps {
  activeTab: 'posts' | 'followers' | 'following';
  setActiveTab: React.Dispatch<React.SetStateAction<'posts' | 'followers' | 'following'>>;
  followersCount: number;
  followingCount: number;
  isDarkMode: boolean;
}

function Tabs({ activeTab, setActiveTab, followersCount, followingCount, isDarkMode }: TabsProps) {
  return (
    <div className="mt-4 flex justify-center space-x-4">
      <button
        className={`${
          isDarkMode ? theme.profile.tabDark : theme.profile.tab
        } ${activeTab === 'posts' ? 'text-red-500' : ''}`}
        onClick={() => setActiveTab('posts')}
      >
        Posts
      </button>
      <button
        className={`${
          isDarkMode ? theme.profile.tabDark : theme.profile.tab
        } ${activeTab === 'followers' ? 'text-red-500' : ''}`}
        onClick={() => setActiveTab('followers')}
      >
        Seguidores {followersCount}
      </button>
      <button
        className={`${
          isDarkMode ? theme.profile.tabDark : theme.profile.tab
        } ${activeTab === 'following' ? 'text-red-500' : ''}`}
        onClick={() => setActiveTab('following')}
      >
        Seguindo {followingCount}
      </button>
    </div>
  );
}

export default Tabs;