import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database record type (matches your table structure)
export interface OnboardingRecord {
  id?: string
  
  // Step 1: Business Basics
  business_type: string
  business_name: string
  location_type: 'local' | 'online'
  location?: string
  customer_type: 'b2b' | 'b2c' | 'both'
  
  // Step 2: Goals & Style
  goals: string[] // Array of goal IDs
  brand_personality: string[] // Array of personality trait IDs
  social_media_presence: {
    facebook: 'none' | 'some' | 'active'
    instagram: 'none' | 'some' | 'active'
    linkedin: 'none' | 'some' | 'active'
  }
  
  // Step 3: Brand Setup
  logo_file_name?: string
  brand_colors: {
    primary: string
    secondary: string
  }
  contact_info?: {
    website?: string
    phone?: string
    socialHandles?: string
  }
  budget: number
  timeline: 'quick' | 'steady' | 'long-term'
  
  // Metadata
  created_at?: string
  updated_at?: string
}

// Form data type (matches your form structure)
export interface FormData {
  // Step 1
  businessType: string
  businessName: string
  locationType: 'local' | 'online'
  location?: string
  customerType: 'b2b' | 'b2c' | 'both'
  
  // Step 2
  goals: string[]
  brandPersonality: string[]
  socialMediaPresence: {
    facebook: 'none' | 'some' | 'active'
    instagram: 'none' | 'some' | 'active'
    linkedin: 'none' | 'some' | 'active'
  }
  
  // Step 3
  logo?: File
  brandColors: {
    primary: string
    secondary: string
  }
  contactInfo?: {
    website?: string
    phone?: string
    socialHandles?: string
  }
  budget: number
  timeline: 'quick' | 'steady' | 'long-term'
}