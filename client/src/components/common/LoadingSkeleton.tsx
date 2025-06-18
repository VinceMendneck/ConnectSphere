import { theme } from '../../styles/theme';

interface LoadingSkeletonProps {
  isDarkMode: boolean;
}

function LoadingSkeleton({ isDarkMode }: LoadingSkeletonProps) {
  return (
    <div className={isDarkMode ? theme.home.containerDark : theme.home.container}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={`${isDarkMode ? theme.home.postContainerDark : theme.home.postContainer} mb-4 animate-pulse`}
        >
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="flex items-center space-x-4 mt-2">
            <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;