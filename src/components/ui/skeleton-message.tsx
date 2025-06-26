import React from 'react';

interface SkeletonMessageProps {
  className?: string;
}

export function SkeletonMessage({ className = '' }: SkeletonMessageProps) {
  return (
    <div className={`mb-4 flex justify-start ${className}`}>
      <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-bl-md">
        {/* Smooth typing dots animation */}
        <div className="flex items-center space-x-1">
          <div 
            className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" 
            style={{ animationDelay: '0ms' }}
          ></div>
          <div 
            className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" 
            style={{ animationDelay: '100ms' }}
          ></div>
          <div 
            className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" 
            style={{ animationDelay: '200ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
}