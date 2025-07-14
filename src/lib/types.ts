export interface OnboardingData {
  // Step 1: Business Basics
  business_offering: 'products' | 'services' | 'both';
  businessType: string;
  businessName: string;
  locationType: 'local' | 'online';
  location?: string;
  customerType: 'b2b' | 'b2c' | 'both';
  
  // Step 2: Goals & Style
  goals: string[];
  brandPersonality: string[];
  socialMediaPresence: {
    facebook: 'none' | 'some' | 'active';
    instagram: 'none' | 'some' | 'active';
    linkedin: 'none' | 'some' | 'active';
  };
  
  // Step 2: Offering Details (Enhanced)
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
  
  // Step 3: Brand Setup & Content Personalization (Enhanced)
  audience_topics?: string[];
  team_size?: string;
  business_age?: string;
  
  // Step 3: Brand Setup
  logo?: File;
  brandColors: {
    primary: string;
    secondary: string;
  };
  contactInfo: {
    website: string;
    phone: string;
    socialHandles: string;
  };
  budget: number;
  timeline: 'quick' | 'steady' | 'long-term';

  // Step 3: Market Intelligence (Enhanced)
  customer_type?: string;
  ideal_customers?: string[];
  customer_biggest_challenge?: string;
  customer_biggest_challenge_other?: string;
  competitors?: Array<{ url: string; description?: string }>;
  competitors_skipped?: boolean;
}

// Add this alias for compatibility
export type FormData = OnboardingData;

export interface BusinessType {
  id: string;
  name: string;
  icon: string;
  category: string;
}
