import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

import { ALLOWED_UPLOAD_FORMAT_LABEL, isAllowedFileType } from "@/lib/uploads"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { createClient as createSupabaseClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 20

const BUCKET = "quote-uploads"

const MAX_FILE_SIZE_BYTES = (() => {
  const parsed = Number.parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB ?? "10", 10)
  const safeValue = Number.isFinite(parsed) && parsed > 0 ? parsed : 10
  return safeValue * 1024 * 1024
})()

async function ensureAuthenticated() {
  try {
    const supabase = await createSupabaseClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      return false
    }

    return true
  } catch (error) {
    console.error("Failed to verify user session", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const sessionId = formData.get("sessionId")?.toString()
    const offerId = formData.get("offerId")?.toString() ?? null

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 })
    }

    if (!isAllowedFileType(file)) {
      return NextResponse.json(
        { error: `Filformatet stöds inte. Tillåtna format: ${ALLOWED_UPLOAD_FORMAT_LABEL}.` },
        { status: 400 }
      )
    }

    const sizeBytes = Number(file.size)

    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      return NextResponse.json({ error: "Ogiltig filstorlek" }, { status: 400 })
    }

    if (sizeBytes > MAX_FILE_SIZE_BYTES) {
      const allowedMb = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)
      return NextResponse.json(
        { error: `Filen är större än tillåtna ${allowedMb} MB.` },
        { status: 413 }
      )
    }

    const supabase = createServiceRoleClient()

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uniqueFileName = `${randomUUID()}-${file.name}`
    const storagePath = `${sessionId}/${uniqueFileName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false
      })

    if (uploadError) {
      console.error("Failed to upload file to storage", uploadError)
      return NextResponse.json({ error: "Failed to store file" }, { status: 500 })
    }

    const { data: insertData, error: insertError } = await supabase
      .from("offer_files")
      .insert({
        offer_id: offerId,
        session_id: sessionId,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type || null,
        size_bytes: sizeBytes
      })
      .select()
      .single()

    if (insertError) {
      console.error("Failed to persist offer file metadata", insertError)
      await supabase.storage.from(BUCKET).remove([storagePath])
      return NextResponse.json({ error: "Failed to persist file metadata" }, { status: 500 })
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 60)

    if (signedUrlError) {
      console.error("Failed to create signed URL", signedUrlError)
    }

    return NextResponse.json(
      {
        file: {
          ...insertData,
          signedUrl: signedUrlData?.signedUrl ?? null
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Unexpected upload error", error)
    return NextResponse.json({ error: "Unexpected upload error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await ensureAuthenticated()

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = request.nextUrl.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from("offer_files")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(data.storage_path, 60 * 10)

    if (signedUrlError) {
      console.error("Failed to create signed URL", signedUrlError)
      return NextResponse.json({ error: "Failed to create signed URL" }, { status: 500 })
    }

    return NextResponse.json({
      file: {
        ...data,
        signedUrl: signedUrlData?.signedUrl ?? null
      }
    })
  } catch (error) {
    console.error("Unexpected signed URL error", error)
    return NextResponse.json({ error: "Unexpected signed URL error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    if (id) {
      const { data, error } = await supabase
        .from("offer_files")
        .select("id, storage_path, offer_id")
        .eq("id", id)
        .eq("session_id", sessionId)
        .is("offer_id", null)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }

      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([data.storage_path])

      if (storageError) {
        console.error("Failed to remove file from storage", storageError)
      }

      const { error: deleteError } = await supabase
        .from("offer_files")
        .delete()
        .eq("id", data.id)

      if (deleteError) {
        console.error("Failed to delete offer file record", deleteError)
        return NextResponse.json({ error: "Failed to delete file record" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    const { data, error } = await supabase
      .from("offer_files")
      .select("id, storage_path")
      .eq("session_id", sessionId)
      .is("offer_id", null)

    if (error) {
      console.error("Failed to fetch session files", error)
      return NextResponse.json({ error: "Failed to fetch session files" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true })
    }

    const paths = data.map((file) => file.storage_path)
    const ids = data.map((file) => file.id)

    const { error: storageError } = await supabase.storage.from(BUCKET).remove(paths)

    if (storageError) {
      console.error("Failed to remove session files from storage", storageError)
    }

    const { error: deleteError } = await supabase
      .from("offer_files")
      .delete()
      .in("id", ids)

    if (deleteError) {
      console.error("Failed to delete session file records", deleteError)
      return NextResponse.json({ error: "Failed to delete session file records" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected delete error", error)
    return NextResponse.json({ error: "Unexpected delete error" }, { status: 500 })
  }
}
