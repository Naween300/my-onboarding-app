import { STRATEGY_TEMPLATES, StrategyService } from '@/lib/strategies';
import { useSupabaseClient } from '@/lib/supabase-client';

// Remove duplicate interfaces and re-export from main types
export type { OnboardingData, StrategyTemplate, StrategyScore } from '@/lib/types';

const supabase = useSupabaseClient();
const strategyService = new StrategyService(supabase);

async function assignStrategyToUser(userId: string) {
  await StrategyService.assignStrategyToUser(userId);
} 