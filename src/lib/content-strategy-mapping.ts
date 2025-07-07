import { STRATEGY_TEMPLATES } from './strategies';

// Map your existing strategy contentMix to standardized content types
export const CONTENT_TYPE_MAPPING = {
  // Local Market Dominator
  "local_community": "community",
  "educational_tips": "educational", 
  "behind_scenes": "behind_scenes",
  "promotional": "promotional",
  
  // B2B Authority Builder
  "educational_insights": "educational",
  "expertise_showcase": "educational",
  "industry_news": "educational",
  
  // Creative Storyteller
  "visual_storytelling": "behind_scenes",
  "user_generated": "community",
  
  // Add mappings for all your strategies...
};

export const OPTIMAL_POSTING_TIMES = {
  instagram: ['09:00', '12:00', '17:00', '19:00'],
  facebook: ['09:00', '13:00', '15:00', '20:00'], 
  linkedin: ['08:00', '12:00', '17:00', '18:00']
};

export function getContentMixForStrategy(strategyId: string) {
  const strategy = STRATEGY_TEMPLATES.find(s => s.id === strategyId);
  if (!strategy) return {};
  
  // Convert strategy contentMix to standardized types
  const standardizedMix: Record<string, number> = {};
  
  Object.entries(strategy.contentMix).forEach(([key, value]) => {
    const standardType = CONTENT_TYPE_MAPPING[key as keyof typeof CONTENT_TYPE_MAPPING] || 'educational';
    standardizedMix[standardType] = (standardizedMix[standardType] || 0) + value;
  });
  
  return standardizedMix;
}
