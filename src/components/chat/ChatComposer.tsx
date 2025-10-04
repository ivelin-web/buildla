import { type MutableRefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, X } from 'lucide-react';
import { ALLOWED_UPLOAD_ACCEPT_ATTRIBUTE, getReadableFileType } from '@/lib/uploads';

interface ChatComposerProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  selectedFiles?: FileList;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onClearSelectedFiles: () => void;
  isSessionComplete: boolean;
  onResetChat: () => Promise<void>;
  isLoading: boolean;
  hasSelectedAssistant: boolean;
  isUploadingFile: boolean;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
}

export function ChatComposer({
  input,
  onInputChange,
  onSubmit,
  selectedFiles,
  onFileChange,
  onClearSelectedFiles,
  isSessionComplete,
  onResetChat,
  isLoading,
  hasSelectedAssistant,
  isUploadingFile,
  fileInputRef
}: ChatComposerProps) {
  if (isSessionComplete) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-center text-sm text-gray-600">
          Sessionen är klar! Du kan starta en ny konversation.
        </div>
        <Button
          onClick={() => {
            void onResetChat();
          }}
          className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white cursor-pointer"
        >
          Starta ny konversation
        </Button>
      </div>
    );
  }

  return (
    <>
      {selectedFiles && selectedFiles.length > 0 && (() => {
        const file = selectedFiles[0];
        return (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white/60 p-3 text-sm shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Paperclip className="h-4 w-4 text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-gray-800">{file.name}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                  {getReadableFileType(file)}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {isUploadingFile ? 'Laddar upp…' : `${(file.size / 1024).toFixed(1)} KB`}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClearSelectedFiles}
              className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      })()}

      <form
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        className="flex gap-3"
      >
        <Input
          type="text"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={hasSelectedAssistant ? 'Skriv ditt meddelande...' : 'Välj en assistent först...'}
          disabled={!hasSelectedAssistant || isLoading}
          className="flex-1 rounded-full"
        />
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => fileInputRef.current?.click()}
          disabled={!hasSelectedAssistant || isLoading || isUploadingFile}
          className="px-3 cursor-pointer hover:bg-gray-50"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Button
          type="submit"
          disabled={!hasSelectedAssistant || !input.trim() || isLoading}
          className={`px-6 rounded-full bg-blue-500 hover:bg-blue-600 ${
            !hasSelectedAssistant || !input.trim() || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          Skicka
        </Button>
      </form>

      <input
        type="file"
        accept={ALLOWED_UPLOAD_ACCEPT_ATTRIBUTE}
        onChange={(event) => {
          void onFileChange(event);
        }}
        ref={fileInputRef}
        className="hidden"
      />
    </>
  );
}
