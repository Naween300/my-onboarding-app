export interface OnboardingData {
  clerk_user_id: string;
  business_offering: 'products' | 'services' | 'both';
  business_category: string;
  business_name: string;
  location_type: 'local' | 'online';
  location_details?: string;
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
  target_market?: 'b2b' | 'b2c' | 'both';
  ideal_customers?: string[];
  customer_biggest_challenge?: string;
  audience_topics?: string[];
  top_goals: string[];
  primary_business_goal: string;
  brand_personality: string[];
  differentiators?: string[];
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
  team_size?: 'just_me' | '2_5_members' | '6_20_members' | '20_plus';
  business_age?: 'less_1_year' | '1_3_years' | '3_10_years' | '10_plus';
  project_duration?: string;
  monthly_budget: number;
  results_timeline?: string;
  onboarding_step?: number;
  is_completed?: boolean;
  completion_percentage?: number;
  completed_at?: string;
  updated_at?: string;
}

// Add this alias for compatibility
export type FormData = OnboardingData;

export interface BusinessType {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface DecisionCriteria {
  industry?: string[];
  businessOffering?: string[];
  targetMarket?: string[];
  locationType?: string[];
  goals?: string[];
  primaryGoal?: string[];
  businessAge?: string[];
  teamSize?: string[];
  budgetRange?: { min: number; max: number };
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  postingFrequency: number;
  complexity: 'low' | 'medium' | 'high';
  decisionCriteria: DecisionCriteria;
  resources?: {
    suitableTeamSizes?: string[];
    minBudget?: number;
    maxBudget?: number;
  };
  contentPillars?: string[];
  contentMix?: { [key: string]: number };
  platformPriority: string[];
}

export interface StrategyScore {
  strategyId: string;
  strategyName: string;
  score: number;
  reasoning: string[];
}
