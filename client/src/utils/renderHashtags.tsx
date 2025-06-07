import { Link } from 'react-router-dom';

export function renderHashtags(content: string) {
  const hashtagRegex = /(#\w+)/g; // Regex para detectar hashtags
  const parts = content.split(hashtagRegex); // Divide o texto em partes
  return parts.map((part, index) => {
    if (part.match(hashtagRegex)) {
      const tag = part.slice(1); // Remove o símbolo # da hashtag
      return (
        <Link
          key={index}
          to={`/hashtag/${tag}`}
          className="text-blue-500 hover:underline"
        >
          {part}
        </Link>
      );
    }
    return part; // Mantém o texto normal como está
  });
}