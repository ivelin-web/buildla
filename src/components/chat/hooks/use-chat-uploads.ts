'use client'

import { useCallback, useRef, useState, type MutableRefObject } from 'react'
import { toast } from 'sonner'

import { ALLOWED_UPLOAD_FORMAT_LABEL, isAllowedFileType } from '@/lib/uploads'

export interface UploadedFileRecord {
  id: string
  offer_id: string | null
  session_id: string
  file_name: string
  storage_path: string
  mime_type: string | null
  size_bytes: number | null
  created_at: string
  signedUrl: string | null
}

interface ClearOptions {
  deleteUploaded?: boolean
}

interface UseChatUploadsResult {
  fileInputRef: MutableRefObject<HTMLInputElement | null>
  selectedFiles?: FileList
  currentUpload: UploadedFileRecord | null
  isUploadingFile: boolean
  uploadSessionId: string
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  clearSelectedFiles: (options?: ClearOptions) => Promise<void>
  beginNewUploadSession: () => Promise<string>
}

const MAX_FILE_SIZE_MB = Number.parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '10', 10) || 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

const generateSessionId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

export function useChatUploads(): UseChatUploadsResult {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<FileList | undefined>(undefined)
  const [currentUpload, setCurrentUpload] = useState<UploadedFileRecord | null>(null)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [uploadSessionId, setUploadSessionId] = useState<string>(() => generateSessionId())

  const deleteUploadedFile = useCallback(
    async (fileId: string) => {
      try {
        const response = await fetch(
          `/api/uploads?id=${encodeURIComponent(fileId)}&sessionId=${encodeURIComponent(uploadSessionId)}`,
          {
            method: 'DELETE'
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || 'Failed to delete uploaded file')
        }
      } catch (error) {
        console.error('Failed to delete uploaded file', error)
      }
    },
    [uploadSessionId]
  )

  const deleteSessionUploads = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/uploads?sessionId=${encodeURIComponent(uploadSessionId)}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to delete session files')
      }
    } catch (error) {
      console.error('Failed to delete session uploads', error)
    }
  }, [uploadSessionId])

  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const clearSelectedFiles = useCallback(
    async (options?: ClearOptions) => {
      const shouldDelete = options?.deleteUploaded ?? true

      if (shouldDelete && currentUpload) {
        await deleteUploadedFile(currentUpload.id)
      }

      setCurrentUpload(null)
      setSelectedFiles(undefined)
      resetFileInput()
    },
    [currentUpload, deleteUploadedFile, resetFileInput]
  )

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        const formData = new FormData()
        formData.append('sessionId', uploadSessionId)
        formData.append('file', file)

        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          let errorMessage = 'Failed to upload file'

          try {
            const json = (await response.json()) as { error?: string }
            if (json?.error) {
              errorMessage = json.error
            }
          } catch {
            // Default message already set
          }

          if (response.status === 401) {
            toast.error('Du måste vara inloggad för att ladda upp filer.')
            return null
          }

          if (response.status === 413) {
            toast.error(errorMessage)
            return null
          }

          throw new Error(errorMessage)
        }

        const json = (await response.json()) as { file?: UploadedFileRecord }

        if (!json.file) {
          throw new Error('Malformed upload response')
        }

        try {
          const signedUrlResponse = await fetch(
            `/api/uploads?id=${encodeURIComponent(json.file.id)}&sessionId=${encodeURIComponent(uploadSessionId)}`
          )

          if (signedUrlResponse.ok) {
            const signedUrlJson = (await signedUrlResponse.json()) as {
              file?: UploadedFileRecord
            }

            if (signedUrlJson.file?.signedUrl) {
              return {
                ...json.file,
                signedUrl: signedUrlJson.file.signedUrl
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch signed URL for uploaded file', error)
        }

        return json.file
      } catch (error) {
        console.error('Failed to upload file', error)
        if (error instanceof Error && error.message && error.message !== 'Failed to upload file') {
          toast.error(error.message)
        } else {
          toast.error('Kunde inte spara filen. Försök igen.')
        }
        return null
      }
    },
    [uploadSessionId]
  )

  const validateFileSize = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`Filstorleken överskrider ${MAX_FILE_SIZE_MB}MB-gränsen. Välj en mindre fil.`)
      return false
    }
    return true
  }, [])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files || files.length === 0) {
        await clearSelectedFiles()
        return
      }

      const file = files[0]

      if (!isAllowedFileType(file)) {
        toast.error(`Filformatet stöds inte. Tillåtna format: ${ALLOWED_UPLOAD_FORMAT_LABEL}.`)
        await clearSelectedFiles()
        return
      }

      if (!validateFileSize(file)) {
        await clearSelectedFiles()
        return
      }

      if (currentUpload) {
        await deleteUploadedFile(currentUpload.id)
        setCurrentUpload(null)
      }

      setSelectedFiles(files)
      setIsUploadingFile(true)

      try {
        const uploaded = await uploadFile(file)
        if (!uploaded) {
          await clearSelectedFiles({ deleteUploaded: false })
          return
        }

        setCurrentUpload(uploaded)
      } finally {
        setIsUploadingFile(false)
      }
    },
    [
      clearSelectedFiles,
      currentUpload,
      deleteUploadedFile,
      uploadFile,
      validateFileSize
    ]
  )

  const beginNewUploadSession = useCallback(async () => {
    await deleteSessionUploads()
    await clearSelectedFiles({ deleteUploaded: false })

    const newSessionId = generateSessionId()
    setUploadSessionId(newSessionId)
    return newSessionId
  }, [clearSelectedFiles, deleteSessionUploads])

  return {
    fileInputRef,
    selectedFiles,
    currentUpload,
    isUploadingFile,
    uploadSessionId,
    handleFileChange,
    clearSelectedFiles,
    beginNewUploadSession
  }
}
