'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/contexts/SupabaseContext';
import { StrategyService } from '@/lib/strategies/strategy-service';

export const StrategyWidget = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  const [strategy, setStrategy] = useState<any>(null);
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

      console.log('🎯 Loading strategy with authenticated client...');
      const strategyService = new StrategyService(supabase);
      let userStrategy = await strategyService.getUserStrategy(user?.id as string);

      if (!userStrategy) {
        console.log('🎯 No strategy found, auto-assigning...');
        await strategyService.assignStrategyToUser(user?.id as string);    
        userStrategy = await strategyService.getUserStrategy(user?.id as string);
      }

      setStrategy(userStrategy);
    } catch (error: any) {
      console.error('❌ Failed to load strategy:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="text-sm text-gray-500">Initializing...</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Content Strategy</h3>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-700 text-sm">Error loading strategy: {error}</p>
          <button 
            onClick={loadUserStrategy}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Your Content Strategy</h3>
        <button
          onClick={loadUserStrategy}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>
      
      {strategy ? (
        <div className="space-y-4">
          {/* Strategy Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-900">
              {strategy.template?.name || 'Strategy Assigned'}
            </h4>
            <p className="text-blue-700 text-sm mt-1">
              {strategy.template?.description || 'Custom strategy for your business'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Match Score: {strategy.assignment?.assigned_score || 0}%
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                {strategy.template?.postingFrequency || 0} posts/week
              </span>
            </div>
          </div>

          {/* Content Mix */}
          {strategy.template?.contentMix && (
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Content Mix Strategy</h5>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(strategy.template.contentMix).map(([type, percentage]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm capitalize text-gray-700">
                      {type.replace('_', ' ')}
                    </span>
                    <span className="font-medium text-gray-900">{percentage as number}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Recommendations */}
          {strategy.template?.platformAdaptations && (
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Platform Focus</h5>
              <div className="space-y-2">
                {Object.entries(strategy.template.platformAdaptations).map(([platform, tactics]) => (
                  <div key={platform} className="p-2 bg-gray-50 rounded">
                    <span className="font-medium capitalize text-gray-800">{platform}:</span>
                    <p className="text-sm text-gray-600 mt-1">{Array.isArray(tactics) ? tactics.join(', ') : tactics as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why This Strategy */}
          {strategy.assignment?.assignment_reasoning && (
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Why This Strategy?</h5>
              <ul className="space-y-1">
                {strategy.assignment.assignment_reasoning.map((reason: string, index: number) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span className="text-gray-600">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Assignment Info */}
          {strategy.assignment?.assigned_at && (
            <div className="text-xs text-gray-500 pt-2 border-t">
              Assigned: {new Date(strategy.assignment.assigned_at).toLocaleDateString()}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🎯</div>
          <p className="text-gray-600">No strategy assigned yet</p>
          <button
            onClick={loadUserStrategy}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Assign Strategy
          </button>
        </div>
      )}
    </div>
  );
};

export default StrategyWidget; 