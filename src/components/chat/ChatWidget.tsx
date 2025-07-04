'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkeletonMessage } from '@/components/ui/skeleton-message';
import { Assistant } from '@/types';
import { ModelSettings } from '@/lib/supabase/types';
import { Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChatWidgetProps {
  className?: string;
  modelSettings?: ModelSettings | null;
  isEmbed?: boolean;
}

export default function ChatWidget({ className = '', modelSettings, isEmbed = false }: ChatWidgetProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File size configuration
  const MAX_FILE_SIZE_MB = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '10');
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`Filstorleken överskrider ${MAX_FILE_SIZE_MB}MB-gränsen. Välj en mindre fil.`);
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFileSize(file)) {
        setSelectedFiles(files);
      } else {
        // Reset file input if validation fails
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSelectedFiles(undefined);
      }
    } else {
      setSelectedFiles(undefined);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e, {
      experimental_attachments: selectedFiles,
    });
    
    setSelectedFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages, append } = useChat({
    api: '/api/chat',
    body: {
      assistantId: selectedAssistant,
      modelSettings: modelSettings
    },
    onFinish: (message) => {
      // Check for successful saveOffer tool execution via message.parts
      if (message.parts) {
        const toolResults = message.parts.filter(
          (part) =>
            part.type === 'tool-invocation' &&
            'toolInvocation' in part &&
            part.toolInvocation?.state === 'result' &&
            part.toolInvocation?.toolName === 'saveOffer'
        );

        for (const part of toolResults) {
          try {
            if ('toolInvocation' in part && part.toolInvocation?.state === 'result') {
              const result = part.toolInvocation.result;
              const data = typeof result === 'string' ? JSON.parse(result) : result;
              
              if (data && typeof data === 'object' && 'success' in data && data.success) {
                setIsSessionComplete(true);
                break;
              }
            }
          } catch (error) {
            // Ignore JSON parsing errors
            console.error('Failed to parse tool result:', error);
          }
        }
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetChat = async () => {
    setMessages([]);
    setIsSessionComplete(false);
    
    // Auto-start conversation using append
    if (selectedAssistant) {
      try {
        await append({
          role: 'user',
          content: 'Hej'
        });
      } catch (error) {
        console.error('Error restarting conversation:', error);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadAssistants();
  }, []);

  const loadAssistants = async () => {
    try {
      const response = await fetch('/api/assistants');
      const data = await response.json();
      if (data.assistants) {
        setAssistants(data.assistants);
      }
    } catch (error) {
      console.error('Failed to load assistants:', error);
    }
  };

  const handleAssistantChange = async (assistantId: string) => {
    setSelectedAssistant(assistantId);
    setIsSessionComplete(false);
    setMessages([]); // Clear previous messages
    
    // Auto-start conversation using append - this automatically triggers AI response
    try {
      await append({
        role: 'user',
        content: 'Hej'
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Memoized skeleton visibility logic for better performance
  const shouldShowSkeleton = useMemo(() => {
    if (!isLoading) return false;
    const lastMessage = messages[messages.length - 1];
    const isStreamingAssistantMessage = lastMessage?.role === 'assistant' && lastMessage.content.trim();
    return !isStreamingAssistantMessage;
  }, [isLoading, messages]);

  return (
    <div className={`max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      {!isEmbed && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5 text-center">
          <h3 className="text-xl font-semibold mb-2">AI Assistant Demo</h3>
          <p className="text-blue-100">Testing your AI assistants</p>
        </div>
      )}

      {/* Assistant Selector */}
      <div className="p-5 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Välj assistent:
        </label>
        <Select value={selectedAssistant} onValueChange={handleAssistantChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Välj en assistent..." />
          </SelectTrigger>
          <SelectContent>
            {assistants.map((assistant) => (
              <SelectItem key={assistant.id} value={assistant.id}>
                {assistant.name} ({assistant.description})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-5 bg-gray-50">
        {!selectedAssistant ? (
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
              // Hide empty assistant messages to prevent empty balloons during tool execution
              if (message.role === 'assistant' && !message.content.trim()) {
                return null;
              }
              
              // Hide the first user message (automatic greeting)
              if (message.role === 'user' && index === 0) {
                return null;
              }
              
              return (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    {/* Show PDF attachment if present */}
                    {message.role === 'user' && message.experimental_attachments && message.experimental_attachments.length > 0 && (
                      <div className="mb-2 pb-2 border-b border-blue-400 border-opacity-30">
                        {message.experimental_attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs bg-blue-400 bg-opacity-20 rounded-lg px-2 py-1 mb-1">
                            <Paperclip className="w-3 h-3" />
                            <span className="truncate font-medium">
                              {attachment.name || `file-${index + 1}.pdf`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {message.content}
                  </div>
                </div>
              );
            })}
            
            {/* Show skeleton message when loading and waiting for response to start */}
            {shouldShowSkeleton && (
              <SkeletonMessage />
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-5 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error.message}
        </div>
      )}

      {/* File Input (Hidden) */}
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      {/* Input */}
      <div className="p-5 bg-white border-t border-gray-200">
        {isSessionComplete ? (
          <div className="flex flex-col gap-3">
            <div className="text-center text-sm text-gray-600">
              Sessionen är klar! Du kan starta en ny konversation.
            </div>
            <Button
              onClick={resetChat}
              className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white cursor-pointer"
            >
              Starta ny konversation
            </Button>
          </div>
        ) : (
          <>
            {/* File Preview Area */}
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mb-3 flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm border">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="flex-1 truncate font-medium">{selectedFiles[0].name}</span>
                <span className="text-gray-400">({(selectedFiles[0].size / 1024).toFixed(1)} KB)</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm" 
                  onClick={() => setSelectedFiles(undefined)}
                  className="h-6 w-6 p-0 hover:bg-gray-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            <form onSubmit={handleFormSubmit} className="flex gap-3">
            <Input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={
                selectedAssistant
                  ? 'Skriv ditt meddelande...'
                  : 'Välj en assistent först...'
              }
              disabled={!selectedAssistant || isLoading}
              className="flex-1 rounded-full"
            />
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedAssistant || isLoading}
              className="px-3 cursor-pointer hover:bg-gray-50"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              type="submit"
              disabled={!selectedAssistant || !input.trim() || isLoading}
              className={`px-6 rounded-full bg-blue-500 hover:bg-blue-600 ${
                !selectedAssistant || !input.trim() || isLoading 
                  ? 'cursor-not-allowed' 
                  : 'cursor-pointer'
              }`}
            >
              Skicka
            </Button>
          </form>
          </>
        )}
      </div>
    </div>
  );
} 