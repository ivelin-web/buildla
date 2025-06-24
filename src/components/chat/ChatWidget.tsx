'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatMessage, Assistant } from '@/types';
import { ModelSettings } from '@/lib/supabase/types';

interface ChatWidgetProps {
  className?: string;
  modelSettings?: ModelSettings | null;
}

export default function ChatWidget({ className = '', modelSettings }: ChatWidgetProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      setError('Failed to load available services. Please refresh the page.');
    }
  };

  const handleAssistantChange = (assistantId: string) => {
    setSelectedAssistant(assistantId);
    setMessages([]);
    setError(null);
    
    if (assistantId) {
      addWelcomeMessage();
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: 'Testing started! The AI will respond in Swedish. Try asking about bathroom renovation in Swedish or English.'
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedAssistant || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          assistantId: selectedAssistant,
          modelSettings: modelSettings
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setError('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5 text-center">
        <h3 className="text-xl font-semibold mb-2">AI Assistant Demo</h3>
        <p className="text-blue-100">Testing your AI assistants</p>
      </div>

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
            {messages.map((message, index) => (
              <div
                key={index}
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
            ))}
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
          {error}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 p-5 bg-white border-t border-gray-200">
        <Input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            selectedAssistant
              ? 'Type your message...'
              : 'Select an assistant first...'
          }
          disabled={!selectedAssistant || isLoading}
          className="flex-1 rounded-full"
        />
        <Button
          onClick={sendMessage}
          disabled={!selectedAssistant || !inputMessage.trim() || isLoading}
          className={`px-6 rounded-full bg-blue-500 hover:bg-blue-600 ${
            !selectedAssistant || !inputMessage.trim() || isLoading 
              ? 'cursor-not-allowed' 
              : 'cursor-pointer'
          }`}
        >
          Send
        </Button>
      </div>
    </div>
  );
} 