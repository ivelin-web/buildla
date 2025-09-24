'use client';

import { type ModelSettings } from '@/lib/supabase/types';

import { AssistantSelector } from './AssistantSelector';
import { ChatComposer } from './ChatComposer';
import { ChatMessageList } from './ChatMessageList';
import { useChatWidget } from './hooks/use-chat-widget';

interface ChatWidgetProps {
  className?: string;
  modelSettings?: ModelSettings | null;
  isEmbed?: boolean;
}

export default function ChatWidget({ className = '', modelSettings, isEmbed = false }: ChatWidgetProps) {
  const {
    assistants,
    selectedAssistant,
    isSessionComplete,
    selectedFiles,
    input,
    messages,
    error,
    isLoading,
    shouldShowSkeleton,
    messagesEndRef,
    fileInputRef,
    getSourcesForMessage,
    handleAssistantChange,
    handleFormSubmit,
    handleFileChange,
    clearSelectedFiles,
    resetChat,
    setInput
  } = useChatWidget({ modelSettings, isEmbed });

  const hasSelectedAssistant = selectedAssistant !== '';

  return (
    <div
      className={`${
        isEmbed ? 'w-full flex flex-col h-full' : 'max-w-2xl mx-auto'
      } bg-white overflow-hidden ${isEmbed ? '' : 'rounded-xl shadow-lg'} ${className}`}
    >
      {!isEmbed && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5 text-center">
          <h3 className="text-xl font-semibold mb-2">AI Assistant Demo</h3>
          <p className="text-blue-100">Testing your AI assistants</p>
        </div>
      )}

      <AssistantSelector
        assistants={assistants}
        selectedAssistant={selectedAssistant}
        onChange={handleAssistantChange}
      />

      <ChatMessageList
        messages={messages}
        shouldShowSkeleton={shouldShowSkeleton}
        getSourcesForMessage={getSourcesForMessage}
        messagesEndRef={messagesEndRef}
        isEmbed={isEmbed}
        hasSelectedAssistant={hasSelectedAssistant}
      />

      {error && (
        <div className="mx-5 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error.message}
        </div>
      )}

      <div className="p-5 bg-white border-t border-gray-200">
        <ChatComposer
          input={input}
          onInputChange={setInput}
          onSubmit={handleFormSubmit}
          selectedFiles={selectedFiles}
          onFileChange={handleFileChange}
          onClearSelectedFiles={clearSelectedFiles}
          isSessionComplete={isSessionComplete}
          onResetChat={resetChat}
          isLoading={isLoading}
          hasSelectedAssistant={hasSelectedAssistant}
          fileInputRef={fileInputRef}
        />
      </div>
    </div>
  );
}
