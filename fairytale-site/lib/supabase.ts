import { createClient } from '@supabase/supabase-js'

// Публічний клієнт (для читання на фронтенді)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Адмін-клієнт (тільки на сервері — для запису казок)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Story = {
  id: number
  title: string
  content: string
  moral: string
  created_at: string
  published_at: string
  cover_emoji: string
}
