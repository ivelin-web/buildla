"use client";

import { type UIMessage } from 'ai';
import Image from 'next/image';
import { useMemo, useState, type MutableRefObject } from 'react';
import { Paperclip } from 'lucide-react';

import { SkeletonMessage } from '@/components/ui/skeleton-message';
import { SourceList } from '@/components/ui/source-list';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [previewFile, setPreviewFile] = useState<{
    filename?: string;
    url: string;
    mediaType?: string;
  } | null>(null);

  const isPreviewImage = useMemo(
    () => Boolean(previewFile?.mediaType?.startsWith('image/')),
    [previewFile]
  );

  const isPreviewPdf = useMemo(() => {
    if (!previewFile) {
      return false;
    }

    const mediaType = previewFile.mediaType?.toLowerCase() ?? '';
    const fileName = previewFile.filename?.toLowerCase() ?? '';
    return mediaType === 'application/pdf' || fileName.endsWith('.pdf');
  }, [previewFile]);

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
                        <button
                          key={`${filePart.url}-${fileIndex}`}
                          type="button"
                          onClick={() => {
                            setPreviewFile({
                              filename: filePart.filename,
                              url: filePart.url,
                              mediaType: filePart.mediaType
                            });
                          }}
                          className="flex w-full items-center gap-2 text-left text-xs bg-blue-400 bg-opacity-20 rounded-lg px-2 py-1 mb-1 border border-blue-400 border-opacity-30 transition hover:bg-blue-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 cursor-pointer"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span className="truncate font-medium">
                            {filePart.filename || `file-${fileIndex + 1}`}
                          </span>
                        </button>
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

      <Dialog
        open={Boolean(previewFile)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPreviewFile(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          {previewFile && (
            <div className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle className="truncate text-base font-semibold">
                  {previewFile.filename || 'Förhandsgranskning'}
                </DialogTitle>
              </DialogHeader>

              {isPreviewImage ? (
                <div className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={previewFile.url}
                    alt={previewFile.filename || 'Förhandsgranskning av bild'}
                    fill
                    className="object-contain"
                    sizes="(min-width: 768px) 70vw, 100vw"
                    unoptimized
                  />
                </div>
              ) : isPreviewPdf ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.filename || 'Förhandsgranskning av PDF'}
                  className="h-[70vh] w-full rounded-lg border border-gray-200"
                />
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  Det här filformatet kan inte förhandsgranskas. Du kan
                  <a
                    href={previewFile.url}
                    download={previewFile.filename}
                    className="ml-1 font-medium text-blue-600 underline"
                  >
                    ladda ner filen här
                  </a>
                  .
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
