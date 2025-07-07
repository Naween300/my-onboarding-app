import { createClient } from '@supabase/supabase-js';
import { StrategySelector } from './strategy-selector';
import { OnboardingData } from './types';

export class StrategyService {
  private supabase;
  private strategySelector = new StrategySelector();

  constructor(supabaseClient?: any) {
    // If no client is passed, create one using environment variables
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
      );
    }
  }

  async assignStrategyToUser(userId: string): Promise<string> {
    try {
      console.log('🎯 Assigning strategy to user:', userId);

      const { data: onboardingData, error: onboardingError } = await this.supabase
        .from('onboarding')
        .select('*')
        .eq('clerk_user_id', userId)
        .single();

      console.log('🔍 Query result:', { data: !!onboardingData, error: onboardingError });

      if (onboardingError) {
        console.error('❌ Database query error:', onboardingError);
        throw new Error(`Database access failed: ${onboardingError.message}`);
      }

      if (!onboardingData) {
        throw new Error('Onboarding data not found in database');
      }

      console.log('✅ Onboarding data found, proceeding with strategy assignment');

      const strategyScores = this.strategySelector.selectStrategy(onboardingData);
      const topStrategy = strategyScores[0];

      console.log('✅ Top strategy selected:', topStrategy);

      const { error: assignmentError } = await this.supabase
        .from('user_strategy_assignments')
        .upsert({
          clerk_user_id: userId,
          strategy_id: topStrategy.strategyId,
          strategy_name: topStrategy.strategyName,
          assigned_score: topStrategy.score,
          assignment_reasoning: topStrategy.reasoning,
          is_active: true,
          manually_overridden: false
        }, {
          onConflict: 'clerk_user_id'
        });

      if (assignmentError) {
        throw new Error(`Failed to save strategy: ${assignmentError.message}`);
      }

      return topStrategy.strategyId;
    } catch (error) {
      console.error('❌ Strategy assignment error:', error);
      throw error;
    }
  }

  async getUserStrategy(userId: string) {
    try {
      // Add a check to ensure supabase is initialized
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('user_strategy_assignments')
        .select('*')
        .eq('clerk_user_id', userId)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false })
        .limit(1)
        .single();

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