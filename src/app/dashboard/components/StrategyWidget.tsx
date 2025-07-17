'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';

interface StrategyData {
  strategyId: string;
  strategyName: string;
  score: number;
  reasoning: string[];
  template?: {
    name: string;
    description: string;
    postingFrequency: number;
    complexity: string;
    contentPillars: string[];
    platformPriority: string[];
  };
  onboardingData?: {
    businessCategory: string;
    targetMarket: string;
    businessOffering: string;
    topGoals: string[];
    brandPersonality: string[];
    monthlyBudget: number;
    teamSize: string;
    businessAge: string;
  };
  recommendations?: {
    primary: any;
    alternatives: any[];
  };
}

export const StrategyWidget = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  const [strategy, setStrategy] = useState<StrategyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && supabase) {
      loadUserStrategy();
    }
  }, [user?.id, supabase]);

  const loadUserStrategy = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      console.log('🎯 Loading enhanced strategy with onboarding data...');
      const response = await fetch('/api/strategy/assign');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load strategy');
      }
      
      console.log('✅ Strategy loaded successfully:', result.strategy);
      setStrategy(result.strategy);
    } catch (error: any) {
      console.error('❌ Failed to load strategy:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="text-sm text-gray-500">Initializing...</div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Content Strategy</h3>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-700 text-sm">Error loading strategy: {error}</p>
          <Button variant="destructive" size="sm" className="mt-2" onClick={loadUserStrategy}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Your Content Strategy</h3>
        <Button variant="outline" size="sm" onClick={loadUserStrategy}>
          🔄 Refresh
        </Button>
      </div>

      {strategy ? (
        <div className="space-y-6">
          {/* Strategy Header with Enhanced Data */}
          <Card className="bg-muted rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-foreground">
                  {strategy.strategyName}
                </h4>
                <p className="text-muted-foreground text-sm mt-1">
                  {strategy.template?.description || 'Personalized strategy for your business'}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 ml-4">
                {strategy.score}% Match
              </Badge>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">
                📊 {strategy.template?.postingFrequency || 0} posts/week
              </Badge>
              <Badge variant="secondary">
                🎯 {strategy.template?.complexity || 'Medium'} complexity
              </Badge>
              {strategy.onboardingData?.businessCategory && (
                <Badge variant="secondary">
                  🏢 {strategy.onboardingData.businessCategory}
                </Badge>
              )}
              {strategy.onboardingData?.targetMarket && (
                <Badge variant="secondary">
                  👥 {strategy.onboardingData.targetMarket.toUpperCase()}
                </Badge>
              )}
            </div>
          </Card>

          {/* Business Profile Summary */}
          {strategy.onboardingData && (
            <div>
              <h5 className="font-medium text-foreground mb-3">Your Business Profile</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded">
                  <span className="text-sm font-medium text-foreground">Business Type:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {strategy.onboardingData.businessCategory} • {strategy.onboardingData.businessOffering}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <span className="text-sm font-medium text-foreground">Target Market:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {strategy.onboardingData.targetMarket} • {strategy.onboardingData.teamSize} team
                  </p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <span className="text-sm font-medium text-foreground">Top Goals:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {strategy.onboardingData.topGoals?.slice(0, 2).join(', ') || 'Not specified'}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <span className="text-sm font-medium text-foreground">Brand Personality:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {strategy.onboardingData.brandPersonality?.slice(0, 2).join(', ') || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content Pillars */}
          {strategy.template?.contentPillars && (
            <div>
              <h5 className="font-medium text-foreground mb-3">Content Pillars</h5>
              <div className="grid grid-cols-2 gap-3">
                {strategy.template.contentPillars.map((pillar, index) => (
                  <div key={index} className="flex items-center p-3 bg-muted rounded">
                    <span className="text-blue-500 mr-2">📝</span>
                    <span className="text-sm text-foreground">{pillar}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Priority */}
          {strategy.template?.platformPriority && (
            <div>
              <h5 className="font-medium text-foreground mb-3">Recommended Platforms</h5>
              <div className="flex flex-wrap gap-2">
                {strategy.template.platformPriority.map((platform, index) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Strategy Reasoning */}
          {strategy.reasoning && strategy.reasoning.length > 0 && (
            <div>
              <h5 className="font-medium text-foreground mb-3">Why This Strategy?</h5>
              <ul className="space-y-2">
                {strategy.reasoning.map((reason, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span className="text-muted-foreground">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alternative Strategies */}
          {strategy.recommendations?.alternatives && strategy.recommendations.alternatives.length > 0 && (
            <div>
              <h5 className="font-medium text-foreground mb-3">Alternative Strategies</h5>
              <div className="space-y-2">
                {strategy.recommendations.alternatives.slice(0, 2).map((alt, index) => (
                  <div key={index} className="p-3 bg-muted rounded flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-foreground">{alt.strategyName}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alt.reasoning?.slice(0, 2).join(', ') || 'Alternative approach'}
                      </p>
                    </div>
                    <Badge variant="outline">{alt.score}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          <div className="pt-4 border-t border-border">
            <h5 className="font-medium text-foreground mb-3">Next Steps</h5>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="text-blue-500 mr-2">📅</span>
                <span className="text-muted-foreground">
                  Plan {strategy.template?.postingFrequency || 3} posts per week
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-blue-500 mr-2">🎯</span>
                <span className="text-muted-foreground">
                  Focus on {strategy.template?.contentPillars?.[0] || 'your main content theme'}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-blue-500 mr-2">📱</span>
                <span className="text-muted-foreground">
                  Prioritize {strategy.template?.platformPriority?.[0] || 'your main platform'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-muted-foreground text-4xl mb-4">🎯</div>
          <p className="text-muted-foreground mb-2">No strategy assigned yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Complete your onboarding to get a personalized content strategy
          </p>
          <Button className="mt-4" onClick={loadUserStrategy}>
            Generate Strategy
          </Button>
        </div>
      )}
    </Card>
  );
};

export default StrategyWidget; 