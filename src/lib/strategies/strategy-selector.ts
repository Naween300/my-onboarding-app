import { STRATEGY_TEMPLATES } from './strategy-templates';
import { OnboardingData, StrategyTemplate } from './types';
import type { StrategyScore } from '@/lib/types';

export class StrategySelector {
  public selectStrategy(onboardingData: OnboardingData): StrategyScore[] {
    const strategyScores: StrategyScore[] = [];

    console.log('🔍 StrategySelector: Processing onboarding data:', {
      business_category: onboardingData.business_category,
      business_offering: onboardingData.business_offering,
      target_market: onboardingData.target_market,
      location_type: onboardingData.location_type
    });

    for (const template of STRATEGY_TEMPLATES) {
      const score = this.calculateStrategyScore(template, onboardingData);
      strategyScores.push(score);
    }

    // Sort by score descending
    return strategyScores.sort((a, b) => b.score - a.score);
  }

  private calculateStrategyScore(template: StrategyTemplate, data: OnboardingData): StrategyScore {
    let score = 0;
    const reasoning: string[] = [];

    // Business Category Scoring (35% weight - increased since this is primary data)
    if (template.decisionCriteria.industry?.includes(data.business_category)) {
      score += 35;
      reasoning.push(`Industry match: ${data.business_category}`);
    }

    // Business Offering Type Scoring (30% weight - increased since this is core data)
    if (template.decisionCriteria.businessOffering?.includes(data.business_offering)) {
      score += 30;
      reasoning.push(`Business offering match: ${data.business_offering}`);
    }

    // Target Market Scoring (25% weight - fixed field name)
    if (data.target_market && template.decisionCriteria.targetMarket?.includes(data.target_market)) {
      score += 25;
      reasoning.push(`Target market match: ${data.target_market}`);
    }

    // Location Type Scoring (10% weight - using actual field)
    if (template.decisionCriteria.locationType?.includes(data.location_type)) {
      score += 10;
      reasoning.push(`Location type match: ${data.location_type}`);
    }

    // Goals Scoring - Only if data exists
    if (data.top_goals && data.top_goals.length > 0) {
      const goalMatches = data.top_goals.filter((goal: string) =>
        template.decisionCriteria.goals?.some((templateGoal: string) =>
          goal.toLowerCase().includes(templateGoal.toLowerCase()) ||
          templateGoal.toLowerCase().includes(goal.toLowerCase())
        )
      );
      
      if (goalMatches.length > 0) {
        const goalScore = 15 * (goalMatches.length / data.top_goals.length);
        score += goalScore;
        reasoning.push(`Goal matches: ${goalMatches.join(', ')}`);
      }
    }

    // Primary Business Goal Scoring - Only if data exists
    if (data.primary_business_goal && template.decisionCriteria.primaryGoal?.includes(data.primary_business_goal)) {
      score += 10;
      reasoning.push(`Primary goal match: ${data.primary_business_goal}`);
    }

    // Resource scoring - Only if data exists
    if (data.monthly_budget || data.team_size) {
      score += this.calculateResourceScore(template, data, reasoning);
    }

    return {
      strategyId: template.id,
      strategyName: template.name,
      score: Math.round(score),
      reasoning
    };
  }

  private calculateResourceScore(template: StrategyTemplate, data: OnboardingData, reasoning: string[]): number {
    let resourceScore = 0;

    // Budget considerations - Only if budget data exists
    if (data.monthly_budget) {
      const budget = data.monthly_budget;
      const budgetRange = template.decisionCriteria.budgetRange;
      
      if (budgetRange && budget >= budgetRange.min && budget <= budgetRange.max) {
        resourceScore += 3;
        reasoning.push(`Budget fits range: $${budget} (${budgetRange.min}-${budgetRange.max})`);
      } else if (budget >= 1000 && template.postingFrequency > 7) {
        resourceScore += 2;
        reasoning.push('High budget supports intensive strategy');
      } else if (budget >= 500 && template.postingFrequency >= 4) {
        resourceScore += 2;
        reasoning.push('Medium budget supports regular strategy');
      } else if (budget < 500 && template.postingFrequency <= 3) {
        resourceScore += 2;
        reasoning.push('Budget-appropriate low-frequency strategy');
      }
    }

    // Team size considerations - Only if team size data exists
    if (data.team_size && template.decisionCriteria.teamSize?.includes(data.team_size)) {
      resourceScore += 2;
      reasoning.push(`Team size match: ${data.team_size}`);
    }

    return resourceScore;
  }

  public getStrategyTemplate(strategyId: string): StrategyTemplate | undefined {
    return STRATEGY_TEMPLATES.find(template => template.id === strategyId);
  }

  public getRecommendationsByBusinessType(onboardingData: OnboardingData): {
    primary: StrategyScore;
    alternatives: StrategyScore[];
    reasoning: string;
  } {
    const allScores = this.selectStrategy(onboardingData);
    const primary = allScores[0];
    const alternatives = allScores.slice(1, 4);

    let reasoning = `Based on your ${onboardingData.business_category} business `;
    
    if (onboardingData.target_market) {
      reasoning += `serving ${onboardingData.target_market} customers `;
    }
    
    reasoning += `with ${onboardingData.business_offering} offerings`;
    
    if (onboardingData.location_type) {
      reasoning += ` (${onboardingData.location_type} business)`;
    }
    
    reasoning += `, we recommend the "${primary.strategyName}" strategy. `;
    reasoning += `This strategy scored ${primary.score}% compatibility with your current business profile.`;

    return {
      primary,
      alternatives,
      reasoning
    };
  }

  public getStrategyByBusinessMaturity(onboardingData: OnboardingData): StrategyScore[] {
    const allStrategies = this.selectStrategy(onboardingData);
    
    // Only apply business age adjustments if the data exists
    if (!onboardingData.business_age) {
      return allStrategies;
    }
    
    return allStrategies.map(strategy => {
      let adjustedScore = strategy.score;
      
      if (onboardingData.business_age === 'less_1_year') {
        if (strategy.strategyId.includes('growth') || strategy.strategyId.includes('scale')) {
          adjustedScore *= 0.8;
        }
        if (strategy.strategyId === 'startup_momentum_builder') {
          adjustedScore *= 1.3;
        }
      } else if (onboardingData.business_age === '10_plus') {
        if (strategy.strategyId.includes('authority') || strategy.strategyId.includes('thought_leadership')) {
          adjustedScore *= 1.2;
        }
      }

      return {
        ...strategy,
        score: Math.round(adjustedScore)
      };
    }).sort((a, b) => b.score - a.score);
  }
} 