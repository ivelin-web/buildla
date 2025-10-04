'use client'

import { useCallback, useMemo, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

import { type MessageSource } from '../types'
import {
  isFaqToolResponse,
  isSaveOfferResponse,
  isToolOutputPartOfType,
  parseToolOutput,
  type FaqToolResponse,
  type SaveOfferResponse
} from '../utils/tool-results'

interface UseChatSessionOptions {
  onOfferCompleted: () => void
}

export interface UseChatSessionResult {
  messages: ReturnType<typeof useChat>['messages']
  sendMessage: ReturnType<typeof useChat>['sendMessage']
  status: ReturnType<typeof useChat>['status']
  error: ReturnType<typeof useChat>['error']
  setMessages: ReturnType<typeof useChat>['setMessages']
  shouldShowSkeleton: boolean
  getSourcesForMessage: (messageId: string) => MessageSource[] | null
  resetSources: () => void
}

export function useChatSession({ onOfferCompleted }: UseChatSessionOptions): UseChatSessionResult {
  const [messageSources, setMessageSources] = useState<Map<string, MessageSource[]>>(new Map())

  const handleFaqSources = useCallback(
    (messageId: string, rawOutput: unknown) => {
      const parsed = parseToolOutput<FaqToolResponse>(rawOutput)

      if (!parsed || !isFaqToolResponse(parsed)) {
        return
      }

      const normalizedResults = parsed.results.map((result) => ({
        url: result.url,
        title: result.title ?? null,
        source: result.source ?? null,
        similarity: result.similarity,
        content: result.content
      }))

      setMessageSources((previous) => new Map(previous).set(messageId, normalizedResults))
    },
    []
  )

  const handleOfferTool = useCallback(
    (rawOutput: unknown) => {
      const parsed = parseToolOutput<SaveOfferResponse>(rawOutput)

      if (parsed && isSaveOfferResponse(parsed) && parsed.success) {
        onOfferCompleted()
      }
    },
    [onOfferCompleted]
  )

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
        if (isToolOutputPartOfType(part, 'tool-searchFAQ')) {
          handleFaqSources(message.id, part.output)
          break
        }
      }

      for (const part of message.parts) {
        if (isToolOutputPartOfType(part, 'tool-saveOffer')) {
          handleOfferTool(part.output)
          break
        }
      }
    },
    onError: (chatError) => {
      console.error('Chat error:', chatError)
    }
  })

  const shouldShowSkeleton = useMemo(() => {
    if (status !== 'streaming' && status !== 'submitted') {
      return false
    }
    const lastMessage = messages[messages.length - 1]
    const textPart = lastMessage?.parts?.find((part) => part.type === 'text')
    const isStreamingAssistantMessage = lastMessage?.role === 'assistant' && textPart?.text?.trim()
    return !isStreamingAssistantMessage
  }, [messages, status])

  const getSourcesForMessage = useCallback(
    (messageId: string) => {
      const sources = messageSources.get(messageId)
      return sources && sources.length > 0 ? sources.slice(0, 3) : null
    },
    [messageSources]
  )

  const resetSources = useCallback(() => {
    setMessageSources(new Map())
  }, [])

  return {
    messages,
    sendMessage,
    status,
    error,
    setMessages,
    shouldShowSkeleton,
    getSourcesForMessage,
    resetSources
  }
}
