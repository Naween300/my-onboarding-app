'use client';

import { createContext, useContext, ReactNode, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

const SupabaseContext = createContext<any>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const clientRef = useRef<any>(null);
  
  // ✅ Create singleton instance to prevent multiple clients
  if (!clientRef.current) {
    clientRef.current = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await getToken({ template: 'supabase' });
            const headers = new Headers(options?.headers);
            if (clerkToken) {
              headers.set('Authorization', `Bearer ${clerkToken}`);
            }
            return fetch(url, { ...options, headers });
          },
        },
      }
    );
  }
  
  return (
    <SupabaseContext.Provider value={clientRef.current}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
} 