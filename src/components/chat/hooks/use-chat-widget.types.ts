import type { MutableRefObject } from 'react'

import type { Assistant } from '@/types'
import type { ModelSettings } from '@/lib/supabase/types'

import type { MessageSource } from '../types'
import type { UseChatSessionResult } from './use-chat-session'

export interface UseChatWidgetOptions {
  modelSettings?: ModelSettings | null
  isEmbed: boolean
}

export interface UseChatWidgetResult {
  assistants: Assistant[]
  selectedAssistant: string
  isSessionComplete: boolean
  selectedFiles?: FileList
  input: string
  messages: UseChatSessionResult['messages']
  error: UseChatSessionResult['error']
  isLoading: boolean
  isUploadingFile: boolean
  shouldShowSkeleton: boolean
  messagesEndRef: MutableRefObject<HTMLDivElement | null>
  fileInputRef: MutableRefObject<HTMLInputElement | null>
  getSourcesForMessage: (messageId: string) => MessageSource[] | null
  handleAssistantChange: (assistantId: string) => Promise<void>
  handleFormSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  clearSelectedFiles: () => void
  resetChat: () => Promise<void>
  setInput: React.Dispatch<React.SetStateAction<string>>
}
