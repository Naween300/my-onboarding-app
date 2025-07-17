import { StrategySelector } from './strategy-selector';
import { OnboardingData } from './types';
import { createClient } from '@supabase/supabase-js';

export class StrategyService {
  private supabase;
  private strategySelector = new StrategySelector();

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient;
  }

  static async assignStrategyToUser(userId: string) {
    try {
      console.log('🔍 StrategyService: Looking for onboarding data for user:', userId);
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Query the enhanced onboarding table with proper error handling
      const { data: onboardingData, error } = await supabase
        .from('user_enhanced_onboarding')
        .select('*')
        .eq('clerk_user_id', userId)
        .eq('is_completed', true)
        .single();

      console.log('📊 StrategyService: Query result:', { 
        found: !!onboardingData, 
        error: error?.message,
        userId,
        onboardingData
      });

      if (error) {
        if (error.code === 'PGRST116') {
          console.error('❌ StrategyService: No onboarding data found for user:', userId);
          throw new Error(`Onboarding data not found for user: ${userId}`);
        }
        throw new Error(`Database error: ${error.message}`);
      }

      if (!onboardingData) {
        throw new Error('Onboarding data not found in database');
      }

      console.log('✅ StrategyService: Onboarding data found:', onboardingData);

      // Generate strategy based on onboarding data
      const selector = new StrategySelector();
      const allScores = selector.selectStrategy(onboardingData);
      console.log('🧮 All strategy scores:', allScores);
      const strategy = allScores[0];
      console.log('🏆 Selected strategy:', strategy);

      // Enhanced return object
      const template = selector.getStrategyTemplate(strategy.strategyId);
      const recommendations = selector.getRecommendationsByBusinessType(onboardingData);

      return {
        ...strategy,
        template,
        onboardingData: {
          businessCategory: onboardingData.business_category,
          targetMarket: onboardingData.target_market,
          businessOffering: onboardingData.business_offering,
          topGoals: onboardingData.top_goals,
          brandPersonality: onboardingData.brand_personality,
          monthlyBudget: onboardingData.monthly_budget,
          teamSize: onboardingData.team_size,
          businessAge: onboardingData.business_age,
        },
        recommendations,
      };
    } catch (error) {
      console.error('❌ StrategyService error:', error);
      throw error;
    }
  }

  private static generateStrategy(onboardingData: any) {
    // Your strategy generation logic based on onboarding data
    return {
      businessType: onboardingData.business_category,
      targetAudience: onboardingData.ideal_customers,
      contentThemes: onboardingData.audience_topics,
      brandPersonality: onboardingData.brand_personality,
      primaryGoals: onboardingData.top_goals,
      recommendedPostingFrequency: this.calculatePostingFrequency(onboardingData),
      contentStrategy: this.buildContentStrategy(onboardingData)
    };
  }

  // Placeholder methods for strategy generation
  private static calculatePostingFrequency(onboardingData: any) {
    // Implement your logic
    return '3x per week';
  }

  private static buildContentStrategy(onboardingData: any) {
    // Implement your logic
    return ['Educational', 'Promotional', 'Engagement'];
  }

  async getUserStrategy(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_strategy_assignments')
        .select('*')
        .eq('clerk_user_id', userId)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      const template = this.strategySelector.getStrategyTemplate(data.strategy_id);
      return {
        assignment: data,
        template
      };
    } catch (error) {
      console.error('❌ Error getting user strategy:', error);
      return null;
    }
  }

  async getAllStrategies() {
    return this.strategySelector.selectStrategy({} as OnboardingData);
  }
} 