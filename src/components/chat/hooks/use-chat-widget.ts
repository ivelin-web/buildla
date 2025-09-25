'use client';

import { useState, useEffect, useRef, useMemo, useCallback, type MutableRefObject } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { toast } from 'sonner';

import { type Assistant } from '@/types';
import { type ModelSettings } from '@/lib/supabase/types';
import { ALLOWED_UPLOAD_FORMAT_LABEL, isAllowedFileType } from '@/lib/uploads';

import { type MessageSource } from '../types';
import {
  isFaqToolResponse,
  isSaveOfferResponse,
  isToolOutputPartOfType,
  parseToolOutput,
  type FaqToolResponse,
  type SaveOfferResponse
} from '../utils/tool-results';

interface UseChatWidgetOptions {
  modelSettings?: ModelSettings | null;
  isEmbed: boolean;
}

interface UseChatWidgetResult {
  assistants: Assistant[];
  selectedAssistant: string;
  isSessionComplete: boolean;
  selectedFiles?: FileList;
  input: string;
  messages: ReturnType<typeof useChat>['messages'];
  error: ReturnType<typeof useChat>['error'];
  isLoading: boolean;
  shouldShowSkeleton: boolean;
  messagesEndRef: MutableRefObject<HTMLDivElement | null>;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  getSourcesForMessage: (messageId: string) => MessageSource[] | null;
  handleAssistantChange: (assistantId: string) => Promise<void>;
  handleFormSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearSelectedFiles: () => void;
  resetChat: () => Promise<void>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

export function useChatWidget({ modelSettings, isEmbed }: UseChatWidgetOptions): UseChatWidgetResult {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | undefined>(undefined);
  const [input, setInput] = useState('');
  const [messageSources, setMessageSources] = useState<Map<string, MessageSource[]>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '10');
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const clearSelectedFiles = useCallback(() => {
    setSelectedFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const validateFileSize = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`Filstorleken överskrider ${MAX_FILE_SIZE_MB}MB-gränsen. Välj en mindre fil.`);
        return false;
      }
      return true;
    },
    [MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (!isAllowedFileType(file)) {
          toast.error(`Filformatet stöds inte. Tillåtna format: ${ALLOWED_UPLOAD_FORMAT_LABEL}.`);
          clearSelectedFiles();
          return;
        }

        if (!validateFileSize(file)) {
          clearSelectedFiles();
          return;
        }

        setSelectedFiles(files);
      } else {
        clearSelectedFiles();
      }
    },
    [clearSelectedFiles, validateFileSize]
  );

  const {
    messages,
    sendMessage,
    status,
    error,
    setMessages
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    }),
    onFinish: ({ message }) => {
      for (const part of message.parts) {
        if (!isToolOutputPartOfType(part, 'tool-searchFAQ')) {
          continue;
        }

        const parsed = parseToolOutput<FaqToolResponse>(part.output);

        if (!parsed) {
          continue;
        }

        if (isFaqToolResponse(parsed)) {
          const normalizedResults = parsed.results.map((result) => ({
            url: result.url,
            title: result.title ?? null,
            source: result.source ?? null,
            similarity: result.similarity,
            content: result.content
          }));

          setMessageSources((previous) => new Map(previous).set(message.id, normalizedResults));
          break;
        }
      }

      for (const part of message.parts) {
        if (!isToolOutputPartOfType(part, 'tool-saveOffer')) {
          continue;
        }

        const parsed = parseToolOutput<SaveOfferResponse>(part.output);

        if (parsed && isSaveOfferResponse(parsed) && parsed.success) {
          setIsSessionComplete(true);
          break;
        }
      }
    },
    onError: (chatError) => {
      console.error('Chat error:', chatError);
    }
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

  const loadAssistants = useCallback(async () => {
    try {
      const url = isEmbed ? '/api/assistants?widget=true' : '/api/assistants';
      const response = await fetch(url);
      const data: { assistants?: Assistant[] } = await response.json();
      if (data.assistants) {
        setAssistants(data.assistants);
      }
    } catch (loadError) {
      console.error('Failed to load assistants:', loadError);
    }
  }, [isEmbed]);

  useEffect(() => {
    loadAssistants();
  }, [loadAssistants]);

  const getSourcesForMessage = useCallback(
    (messageId: string) => {
      const sources = messageSources.get(messageId);
      return sources && sources.length > 0 ? sources.slice(0, 3) : null;
    },
    [messageSources]
  );

  const handleAssistantChange = useCallback(
    async (assistantId: string) => {
      setSelectedAssistant(assistantId);
      setIsSessionComplete(false);
      setMessages([]);
      setMessageSources(new Map());

      if (!assistantId) {
        return;
      }

      try {
        await sendMessage(
          { text: 'Hej' },
          {
            body: {
              assistantId,
              modelSettings
            }
          }
        );
      } catch (assistantError) {
        console.error('Error starting conversation:', assistantError);
      }
    },
    [modelSettings, sendMessage, setMessages]
  );

  const resetChat = useCallback(async () => {
    setMessages([]);
    setIsSessionComplete(false);
    setMessageSources(new Map());

    if (!selectedAssistant) {
      return;
    }

    try {
      await sendMessage(
        { text: 'Hej' },
        {
          body: {
            assistantId: selectedAssistant,
            modelSettings
          }
        }
      );
    } catch (resetError) {
      console.error('Error restarting conversation:', resetError);
    }
  }, [modelSettings, selectedAssistant, sendMessage, setMessages]);

  const handleFormSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!input.trim()) {
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
              modelSettings
            }
          }
        );
        shouldClearFiles = true;
      } catch (submitError) {
        console.error('Error sending message:', submitError);
        setInput(messageText);
      } finally {
        if (shouldClearFiles) {
          clearSelectedFiles();
        }
      }
    },
    [clearSelectedFiles, input, modelSettings, selectedAssistant, selectedFiles, sendMessage]
  );

  const shouldShowSkeleton = useMemo(() => {
    if (!isLoading) {
      return false;
    }
    const lastMessage = messages[messages.length - 1];
    const textPart = lastMessage?.parts?.find((part) => part.type === 'text');
    const isStreamingAssistantMessage = lastMessage?.role === 'assistant' && textPart?.text?.trim();
    return !isStreamingAssistantMessage;
  }, [isLoading, messages]);

  return {
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
  };
}
