
import React from 'react';

export const Header: React.FC = () => {
  const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 shadow-lg border-b border-gray-700">
      <div className="container mx-auto flex items-center justify-center space-x-3">
        <ClockIcon className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          Con Số Nổi Bật Hàng Ngày Tại Việt Nam
        </h1>
      </div>
    </header>
  );
};
