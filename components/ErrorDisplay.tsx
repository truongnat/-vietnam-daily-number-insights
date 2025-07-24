
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  const ExclamationIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );

  return (
    <div className="my-16 flex flex-col items-center justify-center text-center p-6 bg-red-900/20 border border-red-500 rounded-lg max-w-lg mx-auto">
      <ExclamationIcon className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-xl font-semibold text-red-300">Đã Xảy Ra Lỗi</h3>
      <p className="text-red-400 mt-2 text-sm">{message}</p>
    </div>
  );
};
