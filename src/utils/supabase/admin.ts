import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // Fallback to regular client if service role key is missing
    // or log a warning
    console.warn('Missing SUPABASE_SERVICE_ROLE_KEY. Tokens might not be accessible to visitors.')
  }

  return createClient(
    supabaseUrl!,
    supabaseServiceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
