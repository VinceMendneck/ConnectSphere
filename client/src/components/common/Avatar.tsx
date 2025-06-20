interface AvatarProps {
  src: string | undefined;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function Avatar({ src, username, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-32 h-32',
  };

  // Usa um SVG placeholder se src for inválido
  const placeholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23808080'%3E%3Cpath d='M12 12c2.28 0 4.14-1.86 4.14-4.14S14.28 3.72 12 3.72 7.86 5.58 7.86 7.86 9.72 12 12 12zm0 2c-3.18 0-6 1.56-6 3.48V20h12v-2.52c0-1.92-2.82-3.48-6-3.48z'/%3E%3C/svg%3E`;

  return (
    <img
      src={src && src.trim() !== '' ? src : placeholder}
      alt={`${username} avatar`}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      onError={(e) => {
        console.warn(`Erro ao carregar avatar para ${username}: ${src}`);
        e.currentTarget.src = placeholder;
      }}
    />
  );
}

export default Avatar;