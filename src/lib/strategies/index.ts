import { STRATEGY_TEMPLATES } from './strategy-templates';
export { STRATEGY_TEMPLATES } from './strategy-templates';
export { StrategySelector } from './strategy-selector';
export { StrategyService } from './strategy-service';
export type { StrategyTemplate, OnboardingData, StrategyScore } from './types';

// Helper function to get strategy by ID
export const getStrategyById = (id: string) => {
  return STRATEGY_TEMPLATES.find((strategy) => strategy.id === id);
};

// Helper function to get all strategy names
export const getAllStrategyNames = () => {
  return STRATEGY_TEMPLATES.map((strategy) => ({
    id: strategy.id,
    name: strategy.name,
    description: strategy.description
  }));
};

// Helper function to get strategies by business type
export const getStrategiesByBusinessType = (businessType: string) => {
  return STRATEGY_TEMPLATES.filter((strategy) => 
    strategy.decisionCriteria.industry?.includes(businessType)
  );
}; 