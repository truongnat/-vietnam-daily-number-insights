
import React from 'react';
import type { GroundingChunk } from '@/types';

interface FooterProps {
  groundingChunks: GroundingChunk[];
}

export const Footer: React.FC<FooterProps> = ({ groundingChunks }) => {
  if (groundingChunks.length === 0) {
    return (
      <footer className="w-full text-center p-4 mt-8 border-t border-gray-800">
          <p className="text-xs text-gray-500">Cung cấp bởi Google Gemini</p>
      </footer>
    );
  }

  return (
    <footer className="w-full p-4 mt-8 border-t border-gray-800">
      <div className="container mx-auto text-center">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Nguồn Dữ Liệu</h4>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {groundingChunks.map((chunk, index) => (
            <a
              key={index}
              href={chunk.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              {chunk.web.title || new URL(chunk.web.uri).hostname}
            </a>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-4">Cung cấp bởi Google Gemini với dữ liệu từ Google Search.</p>
      </div>
    </footer>
  );
};
