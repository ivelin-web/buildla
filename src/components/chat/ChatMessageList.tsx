import { type UIMessage } from 'ai';
import { type MutableRefObject } from 'react';
import { Paperclip } from 'lucide-react';

import { SkeletonMessage } from '@/components/ui/skeleton-message';
import { SourceList } from '@/components/ui/source-list';

import { type MessageSource, type ChatMessagePart } from './types';

interface ChatMessageListProps {
  messages: UIMessage[];
  shouldShowSkeleton: boolean;
  getSourcesForMessage: (messageId: string) => MessageSource[] | null;
  messagesEndRef: MutableRefObject<HTMLDivElement | null>;
  isEmbed: boolean;
  hasSelectedAssistant: boolean;
}

const isFilePart = (part: ChatMessagePart): part is Extract<ChatMessagePart, { type: 'file' }> => part.type === 'file';

export function ChatMessageList({
  messages,
  shouldShowSkeleton,
  getSourcesForMessage,
  messagesEndRef,
  isEmbed,
  hasSelectedAssistant
}: ChatMessageListProps) {
  return (
    <div className={`${isEmbed ? 'flex-1' : 'h-96'} overflow-y-auto p-5 bg-gray-50`}>
      {!hasSelectedAssistant ? (
        <div className="flex items-center justify-center h-full text-gray-500 italic">
          Välj en assistent ovan för att komma igång
        </div>
      ) : messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 italic">
          Starta en konversation...
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            const textPart = message.parts?.find((part) => part.type === 'text');
            const textContent = textPart?.text || '';

            if (message.role === 'assistant' && !textContent.trim()) {
              return null;
            }

            if (message.role === 'user' && index === 0) {
              return null;
            }

            const fileParts = message.role === 'user' ? message.parts.filter(isFilePart) : [];

            return (
              <div
                key={message.id}
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                  }`}
                >
                  {fileParts.length > 0 && (
                    <div className="mb-2">
                      {fileParts.map((filePart, fileIndex) => (
                        <div
                          key={`${filePart.url}-${fileIndex}`}
                          className="flex items-center gap-2 text-xs bg-blue-400 bg-opacity-20 rounded-lg px-2 py-1 mb-1 border-b border-blue-400 border-opacity-30"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span className="truncate font-medium">
                            {filePart.filename || `file-${fileIndex + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {message.parts?.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return <span key={`${message.id}-${i}`}>{part.text}</span>;
                      default:
                        return null;
                    }
                  })}

                  {message.role === 'assistant' && getSourcesForMessage(message.id) && (
                    <SourceList sources={getSourcesForMessage(message.id)!} />
                  )}
                </div>
              </div>
            );
          })}

          {shouldShowSkeleton && <SkeletonMessage />}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
