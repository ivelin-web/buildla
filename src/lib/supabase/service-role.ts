import "server-only"

import { createClient } from "@supabase/supabase-js"
import { Database } from "./types"

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set")
  }

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}
