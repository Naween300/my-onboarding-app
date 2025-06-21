export interface OnboardingData {
  // Step 1: Business Basics
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
}

// Add this alias for compatibility
export type FormData = OnboardingData;

export interface BusinessType {
  id: string;
  name: string;
  icon: string;
  category: string;
}
