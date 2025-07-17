import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { StrategyService } from '@/lib/strategies/strategy-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🎯 Strategy API: Assigning strategy for user:', userId);
    
    const strategy = await StrategyService.assignStrategyToUser(userId);
    
    if (!strategy) {
      return NextResponse.json({ 
        success: false, 
        error: 'No strategy could be assigned. Please complete your onboarding first.' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      strategy: {
        strategyId: strategy.strategyId,
        strategyName: strategy.strategyName,
        score: strategy.score,
        reasoning: strategy.reasoning,
        template: strategy.template,
        onboardingData: strategy.onboardingData,
        recommendations: strategy.recommendations
      }
    });
  } catch (error: any) {
    console.error('❌ Strategy API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 