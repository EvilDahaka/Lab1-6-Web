interface LoadingProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

function Loading({ text = 'Завантаження...', size = 'medium' }: LoadingProps) {
  const sizes = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-4',
    large: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <div
        className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizes[size]}`}
        role="status"
        aria-label={text}
      />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

export default Loading;