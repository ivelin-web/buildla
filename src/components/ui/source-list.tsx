import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SourceCitation } from './source-citation';

interface Source {
  url: string;
  title?: string | null;
  source?: string | null;
  similarity?: number;
}

interface SourceListProps {
  sources: Source[];
  className?: string;
}

export function SourceList({ sources, className = '' }: SourceListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className={`mt-3 border-t border-gray-200 pt-3 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mb-2 cursor-pointer"
      >
        <span className="font-medium">Källor ({sources.length})</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {isExpanded && (
        <div className="space-y-2">
          {sources.map((source, index) => (
            <SourceCitation
              key={source.url}
              url={source.url}
              title={source.title}
              source={source.source}
              similarity={source.similarity}
              index={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}