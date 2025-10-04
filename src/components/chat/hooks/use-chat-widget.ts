'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useChatUploads } from './use-chat-uploads';
import { useChatSession } from './use-chat-session';
import { useAssistantList } from './use-assistants';
import type { UseChatWidgetOptions, UseChatWidgetResult } from './use-chat-widget.types';

export function useChatWidget({ modelSettings, isEmbed }: UseChatWidgetOptions): UseChatWidgetResult {
  const { assistants } = useAssistantList(isEmbed);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    fileInputRef,
    selectedFiles,
    currentUpload,
    isUploadingFile,
    uploadSessionId,
    handleFileChange,
    clearSelectedFiles: clearSelectedFilesAsync,
    beginNewUploadSession
  } = useChatUploads();

  const clearSelectedFiles = useCallback(() => {
    void clearSelectedFilesAsync();
  }, [clearSelectedFilesAsync]);

  const {
    messages,
    sendMessage,
    status,
    error,
    setMessages,
    shouldShowSkeleton,
    getSourcesForMessage,
    resetSources
  } = useChatSession({
    onOfferCompleted: () => setIsSessionComplete(true)
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const startConversation = useCallback(
    async (assistantId: string, sessionId: string) => {
      if (!assistantId) {
        return;
      }

      try {
        await sendMessage(
          { text: 'Hej' },
          {
            body: {
              assistantId,
              modelSettings,
              uploadSessionId: sessionId
            }
          }
        );
      } catch (error) {
        console.error('Error starting conversation:', error);
      }
    },
    [modelSettings, sendMessage]
  );

  const handleAssistantChange = useCallback(
    async (assistantId: string) => {
      setSelectedAssistant(assistantId);
      setIsSessionComplete(false);
      setMessages([]);
      resetSources();

      const newSessionId = await beginNewUploadSession();
      await startConversation(assistantId, newSessionId);
    },
    [beginNewUploadSession, resetSources, setMessages, setIsSessionComplete, startConversation]
  );

  const resetChat = useCallback(async () => {
    setMessages([]);
    setIsSessionComplete(false);
    resetSources();

    const newSessionId = await beginNewUploadSession();
    await startConversation(selectedAssistant, newSessionId);
  }, [beginNewUploadSession, resetSources, selectedAssistant, startConversation, setMessages, setIsSessionComplete]);

  const handleFormSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!input.trim()) {
        return;
      }

      if (isUploadingFile) {
        toast.error('Vänta tills filen har laddats upp.');
        return;
      }

      if (selectedFiles?.length && !currentUpload) {
        toast.error('Filen kunde inte laddas upp. Försök igen.');
        return;
      }

      const messageText = input;
      const filesToSend = selectedFiles;

      setInput('');

      let shouldClearFiles = false;

      try {
        await sendMessage(
          { text: messageText, files: filesToSend },
          {
            body: {
              assistantId: selectedAssistant,
              modelSettings,
              uploadSessionId
            }
          }
        );
        shouldClearFiles = true;
      } catch (submitError) {
        console.error('Error sending message:', submitError);
        setInput(messageText);
      } finally {
        if (shouldClearFiles) {
          await clearSelectedFilesAsync({ deleteUploaded: false });
        }
      }
    },
    [
      clearSelectedFilesAsync,
      currentUpload,
      input,
      isUploadingFile,
      modelSettings,
      selectedAssistant,
      selectedFiles,
      sendMessage,
      uploadSessionId
    ]
  );

  return {
    assistants,
    selectedAssistant,
    isSessionComplete,
    selectedFiles,
    input,
    messages,
    error,
    isLoading,
    isUploadingFile,
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
  };
}
