import { STRATEGY_TEMPLATES } from './strategy-templates';
import { OnboardingData, StrategyScore, StrategyTemplate } from './types';

export class StrategySelector {
  public selectStrategy(onboardingData: OnboardingData): StrategyScore[] {
    const strategyScores: StrategyScore[] = [];

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

    // Industry scoring (30% weight)
    if (template.decisionCriteria.industry?.includes(data.business_type)) {
      score += 30;
      reasoning.push(`Industry match: ${data.business_type}`);
    }

    // Business model scoring (25% weight)
    if (template.decisionCriteria.businessModel?.includes(data.customer_type)) {
      score += 25;
      reasoning.push(`Business model match: ${data.customer_type}`);
    }

    // Goals scoring (25% weight)
    const goalMatches = data.goals.filter(goal => 
      template.decisionCriteria.goals?.some(templateGoal => 
        goal.toLowerCase().includes(templateGoal.toLowerCase())
      )
    );
    if (goalMatches.length > 0) {
      const goalScore = 25 * (goalMatches.length / data.goals.length);
      score += goalScore;
      reasoning.push(`Goal matches: ${goalMatches.join(', ')}`);
    }

    // Location scoring (10% weight)
    if (template.id === 'local_market_dominator' && data.location_type === 'local') {
      score += 10;
      reasoning.push('Local business with specific location');
    }

    // Budget considerations (10% weight)
    if (data.budget >= 500 && template.postingFrequency > 5) {
      score += 10;
      reasoning.push('Budget supports high-frequency strategy');
    } else if (data.budget < 500 && template.postingFrequency <= 4) {
      score += 10;
      reasoning.push('Budget-appropriate strategy');
    }

    return {
      strategyId: template.id,
      strategyName: template.name,
      score: Math.round(score),
      reasoning
    };
  }

  public getStrategyTemplate(strategyId: string): StrategyTemplate | undefined {
    return STRATEGY_TEMPLATES.find(template => template.id === strategyId);
  }
} 