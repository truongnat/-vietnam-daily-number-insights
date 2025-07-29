import React from 'react';

interface EventSnippetProps {
  title: string;
  description: string;
}

export const EventSnippet: React.FC<EventSnippetProps> = ({ title, description }) => {
  const NewspaperIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  );

  return (
    <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex items-start space-x-4">
      <div className="flex-shrink-0 pt-1">
        <NewspaperIcon className="w-6 h-6 text-gray-500" />
      </div>
      <div>
        <h3 className="font-semibold text-md text-blue-300">{title}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
};
