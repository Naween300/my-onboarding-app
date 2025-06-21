import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ Create a single instance
let supabaseInstance: any = null;

export function useSupabaseClient() {
  const { getToken } = useAuth()
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        try {
          // ✅ Get the JWT token using the template we created
          const clerkToken = await getToken({ template: 'supabase' })
          
          const headers = new Headers(options?.headers)
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`)
            console.log('🔑 Using Clerk JWT token for Supabase authentication')
          } else {
            console.warn('⚠️ No Clerk JWT token available - user may not be authenticated')
          }
          
          return fetch(url, {
            ...options,
            headers,
          })
        } catch (error) {
          console.error('❌ Error getting Clerk token:', error)
          return fetch(url, options)
        }
      },
    },
  })
  
  return supabase
}

// Server-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
