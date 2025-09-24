import { type MutableRefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, X } from 'lucide-react';

interface ChatComposerProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  selectedFiles?: FileList;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSelectedFiles: () => void;
  isSessionComplete: boolean;
  onResetChat: () => Promise<void>;
  isLoading: boolean;
  hasSelectedAssistant: boolean;
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
      {selectedFiles && selectedFiles.length > 0 && (
        <div className="mb-3 flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm border">
          <Paperclip className="w-4 h-4 text-gray-500" />
          <span className="flex-1 truncate font-medium">{selectedFiles[0].name}</span>
          <span className="text-gray-400">({(selectedFiles[0].size / 1024).toFixed(1)} KB)</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearSelectedFiles}
            className="h-6 w-6 p-0 hover:bg-gray-200 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

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
          disabled={!hasSelectedAssistant || isLoading}
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
        accept=".pdf"
        onChange={onFileChange}
        ref={fileInputRef}
        className="hidden"
      />
    </>
  );
}
