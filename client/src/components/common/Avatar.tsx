
interface AvatarProps {
  src: string | undefined;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DEFAULT_AVATAR = 'http://localhost:5000/uploads/default-avatar.png';

function Avatar({ src, username, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-32 h-32',
  };

  return (
    <img
      src={src && src.trim() !== '' ? src : DEFAULT_AVATAR}
      alt={`${username} avatar`}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
    />
  );
}

export default Avatar;