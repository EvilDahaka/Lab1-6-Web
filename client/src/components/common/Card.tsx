import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
}

function Card({ children, title, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}
      {...props}
    >
      {title && (
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {title}
        </h2>
      )}

      {children}
    </div>
  );
}

export default Card;