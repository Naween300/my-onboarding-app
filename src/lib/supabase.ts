import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database record type (matches your table structure)
export interface OnboardingRecord {
  id?: string;

  // Step 1: Business Basics
  business_offering: 'products' | 'services' | 'both';
  business_category: string;
  business_name: string;
  location_type: 'local' | 'online';
  location_details?: string;

  // Step 2: Goals & Style
  product_types?: string[];
  product_sales_channels?: string[];
  customer_purchase_pattern?: string;
  product_price_range?: string;
  service_types?: string[];
  service_delivery_methods?: string[];
  service_engagement_type?: string;
  service_price_range?: string;
  primary_focus?: string;
  products_services_connection?: string;

  // Step 3: Market & Brand
  ideal_customers?: string[];
  customer_biggest_challenge?: string;
  audience_topics?: string[];

  // Step 4: Goals & Brand Identity
  top_goals?: string[];
  primary_business_goal?: string;
  brand_personality?: string[];
  differentiators?: string[];

  // Step 5: Brand Setup
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  website?: string;
  phone?: string;
  social_handles?: string;
  current_social_presence?: {
    facebook: 'none' | 'some' | 'active';
    instagram: 'none' | 'some' | 'active';
    linkedin: 'none' | 'some' | 'active';
  };

  // Step 6: Optimization/Settings
  team_size?: 'just_me' | '2_5_members' | '6_20_members' | '20_plus';
  business_age?: 'less_1_year' | '1_3_years' | '3_10_years' | '10_plus';
  project_duration?: string;
  monthly_budget?: number;
  results_timeline?: string;

  // Progress/Meta
  onboarding_step?: number;
  is_completed?: boolean;
  completion_percentage?: number;
  completed_at?: string;
  updated_at?: string;
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