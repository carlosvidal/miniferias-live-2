import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('Supabase credentials not configured')
}

export { supabase }

// Subscribe to real-time messages
export function subscribeToBoothMessages(boothId, callback) {
  if (!supabase) {
    console.error('Supabase not initialized')
    return null
  }

  const channel = supabase
    .channel(`booth:${boothId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'Message',
        filter: `boothId=eq.${boothId}`
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()

  return channel
}

// Unsubscribe from channel
export function unsubscribeFromChannel(channel) {
  if (channel) {
    supabase.removeChannel(channel)
  }
}
