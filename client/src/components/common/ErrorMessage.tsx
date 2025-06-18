import { theme } from '../../styles/theme';

interface ErrorMessageProps {
  errors: string | string[];
  isDarkMode: boolean;
  className?: string;
}

function ErrorMessage({ errors, isDarkMode, className = '' }: ErrorMessageProps) {
  if (!errors || (Array.isArray(errors) && errors.length === 0)) {
    return null;
  }

  const errorList = Array.isArray(errors) ? errors : [errors];

  return (
    <div
      className={`${
        isDarkMode ? theme.home.containerDark : theme.home.container
      } p-3 rounded-lg border border-red-300 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-100'} ${className}`}
    >
      {errorList.map((error, index) => (
        <p
          key={index}
          className={`${
            isDarkMode ? theme.home.emptyPostMessageDark : theme.home.emptyPostMessage
          } text-red-500 ${isDarkMode ? 'text-red-400' : ''}`}
        >
          {error}
        </p>
      ))}
    </div>
  );
}

export default ErrorMessage;