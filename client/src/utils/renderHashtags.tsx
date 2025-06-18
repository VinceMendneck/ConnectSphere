import { Link } from 'react-router-dom';
import { theme } from '../styles/theme';

export function renderHashtags(content: string) {
  const hashtagRegex = /(#\w+)/g;
  const parts = content.split(hashtagRegex);
  return parts.map((part, index) => {
    if (part.match(hashtagRegex)) {
      const tag = part.slice(1);
      return (
        <Link
          key={index}
          to={`/hashtag/${tag}`}
          className={theme.home.hashtagLink}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}