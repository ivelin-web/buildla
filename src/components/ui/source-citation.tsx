import { ExternalLink } from 'lucide-react';

interface SourceCitationProps {
  url: string;
  title?: string | null;
  source?: string | null;
  similarity?: number;
  index?: number;
}

export function SourceCitation({ url, title, source, similarity, index }: SourceCitationProps) {
  const getDisplayTitle = () => {
    if (title) return title;
    if (source) return source;
    return new URL(url).hostname;
  };

  const getDisplaySource = () => {
    if (source && source !== title) return source;
    return new URL(url).hostname;
  };

  return (
    <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
      <span className="text-xs text-gray-500 font-medium bg-white rounded px-1.5 py-0.5 border flex-shrink-0">
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          <span className="truncate">{getDisplayTitle()}</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{getDisplaySource()}</span>
          {similarity && (
            <span className="text-xs text-gray-400">
              {similarity}% match
            </span>
          )}
        </div>
      </div>
    </div>
  );
}