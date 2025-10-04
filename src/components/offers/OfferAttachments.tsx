"use client"

import { useCallback, useMemo, useState } from "react"
import { Paperclip } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface OfferAttachmentsProps {
  files: Array<{
    id: string
    file_name: string
    mime_type: string | null
    size_bytes: number | null
    created_at: string
  }>
}

function formatFileSize(bytes: number | null) {
  if (!bytes || bytes <= 0) {
    return "Okänd storlek"
  }

  if (bytes < 1024) {
    return `${bytes} B`
  }

  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }

  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export function OfferAttachments({ files }: OfferAttachmentsProps) {
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  const hasFiles = useMemo(() => files.length > 0, [files])

  const handleOpenFile = useCallback(
    async (fileId: string) => {
      if (signedUrls[fileId]) {
        window.open(signedUrls[fileId], "_blank")
        return
      }

      setLoadingFileId(fileId)

      try {
        const response = await fetch(`/api/uploads?id=${encodeURIComponent(fileId)}`)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || "Misslyckades att hämta fil")
        }

        const json = await response.json()
        const signedUrl: string | null = json?.file?.signedUrl ?? null

        if (!signedUrl) {
          throw new Error("Saknar signerad URL för filen")
        }

        setSignedUrls((previous) => ({ ...previous, [fileId]: signedUrl }))
        window.open(signedUrl, "_blank")
      } catch (error) {
        console.error("Failed to open attachment", error)
        toast.error("Kunde inte öppna filen. Försök igen.")
      } finally {
        setLoadingFileId(null)
      }
    },
    [signedUrls]
  )

  if (!hasFiles) {
    return null
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Bifogade filer
      </div>
      <ul className="space-y-2">
        {files.map((file) => (
          <li
            key={file.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-500">
                <Paperclip className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium text-gray-800">{file.file_name}</div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(file.size_bytes)} • {new Date(file.created_at).toLocaleString("sv-SE")}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              disabled={loadingFileId === file.id}
              onClick={() => {
                void handleOpenFile(file.id)
              }}
            >
              {loadingFileId === file.id ? "Öppnar…" : "Öppna"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
