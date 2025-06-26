import { STRATEGY_TEMPLATES, StrategyService } from '@/lib/strategies';
import { useSupabaseClient } from '@/lib/supabase-client';

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  targetBusinessTypes: string[];
  businessGoals: string[];
  contentMix: {
    [key: string]: number; // percentage
  };
  postingFrequency: number; // posts per week
  optimalTiming: string[];
  platformAdaptations: {
    [platform: string]: string[];
  };
  decisionCriteria: {
    industry?: string[];
    businessModel?: string[];
    goals?: string[];
    requiredScore: number;
  };
}

export interface OnboardingData {
  clerk_user_id: string;
  business_type: string;
  business_name: string;
  location_type: string;
  location?: string;
  customer_type: string;
  goals: string[];
  brand_personality: string[];
  social_media_presence: Record<string, string>;
  brand_colors: Record<string, string>;
  contact_info: Record<string, string>;
  budget: number;
  timeline: string;
}

export interface StrategyScore {
  strategyId: string;
  strategyName: string;
  score: number;
  reasoning: string[];
}

const supabase = useSupabaseClient();
const strategyService = new StrategyService(supabase);

async function assignStrategyToUser(userId: string) {
  await strategyService.assignStrategyToUser(userId);
} 