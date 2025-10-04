'use client'

import { useCallback, useEffect, useState } from 'react'

import { type Assistant } from '@/types'

interface UseAssistantListResult {
  assistants: Assistant[]
  reloadAssistants: () => void
}

export function useAssistantList(isEmbed: boolean): UseAssistantListResult {
  const [assistants, setAssistants] = useState<Assistant[]>([])

  const loadAssistants = useCallback(async () => {
    try {
      const url = isEmbed ? '/api/assistants?widget=true' : '/api/assistants'
      const response = await fetch(url)
      const data: { assistants?: Assistant[] } = await response.json()
      if (data.assistants) {
        setAssistants(data.assistants)
      }
    } catch (error) {
      console.error('Failed to load assistants:', error)
    }
  }, [isEmbed])

  useEffect(() => {
    loadAssistants()
  }, [loadAssistants])

  return {
    assistants,
    reloadAssistants: loadAssistants
  }
}
