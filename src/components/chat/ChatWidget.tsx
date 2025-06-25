'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Assistant } from '@/types';
import { ModelSettings } from '@/lib/supabase/types';

interface ChatWidgetProps {
  className?: string;
  modelSettings?: ModelSettings | null;
  isEmbed?: boolean;
}

export default function ChatWidget({ className = '', modelSettings, isEmbed = false }: ChatWidgetProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          content: 'Hi'
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
        content: 'Hi'
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

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
          Choose assistant (for testing):
        </label>
        <Select value={selectedAssistant} onValueChange={handleAssistantChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an assistant..." />
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
            Please select an assistant above to start testing
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 italic">
            Start a conversation...
          </div>
        ) : (
          <>
            {messages.map((message) => {
              // Hide empty assistant messages to prevent empty balloons during tool execution
              if (message.role === 'assistant' && !message.content.trim()) {
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
                    {message.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 px-5 py-2 text-gray-600 text-sm">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span>AI is thinking...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-5 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error.message}
        </div>
      )}

      {/* Input */}
      <div className="p-5 bg-white border-t border-gray-200">
        {isSessionComplete ? (
          <div className="flex flex-col gap-3">
            <div className="text-center text-sm text-gray-600">
              Session completed! You can start a new conversation.
            </div>
            <Button
              onClick={resetChat}
              className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white"
            >
              Start New Conversation
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={
                selectedAssistant
                  ? 'Type your message...'
                  : 'Select an assistant first...'
              }
              disabled={!selectedAssistant || isLoading}
              className="flex-1 rounded-full"
            />
            <Button
              type="submit"
              disabled={!selectedAssistant || !input.trim() || isLoading}
              className={`px-6 rounded-full bg-blue-500 hover:bg-blue-600 ${
                !selectedAssistant || !input.trim() || isLoading 
                  ? 'cursor-not-allowed' 
                  : 'cursor-pointer'
              }`}
            >
              Send
            </Button>
          </form>
        )}
      </div>
    </div>
  );
} 