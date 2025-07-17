import { STRATEGY_TEMPLATES } from './strategy-templates';
import { StrategySelector } from './strategy-selector';
import { OnboardingData } from './types';

export const verifyStrategies = () => {
  console.log('🔍 Verifying strategy templates...');
  
  // Check if we have all 15 strategies
  console.log(`✅ Total strategies: ${STRATEGY_TEMPLATES.length}`);
  
  // List all strategy names
  STRATEGY_TEMPLATES.forEach((strategy, index) => {
    console.log(`${index + 1}. ${strategy.name} (${strategy.id})`);
  });
  
  // Test strategy selection
  const selector = new StrategySelector();
  const testData = {
    clerk_user_id: 'test',
    business_type: 'technology',
    business_name: 'Test Company',
    location_type: 'online',
    customer_type: 'b2b',
    goals: ['Generate leads', 'Thought leadership'],
    brand_personality: ['Professional', 'Innovative'],
    social_media_presence: { linkedin: 'active' },
    brand_colors: { primary: '#000', secondary: '#fff' },
    contact_info: { website: 'test.com' },
    budget: 1000,
    timeline: 'steady'
  };
  
  const results = selector.selectStrategy(testData as unknown as OnboardingData);
  console.log('🎯 Top 3 strategy recommendations:');
  results.slice(0, 3).forEach((result, index) => {
    console.log(`${index + 1}. ${result.strategyName} (Score: ${result.score})`);
  });
}; 