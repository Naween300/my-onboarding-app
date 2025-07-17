import { StrategyTemplate } from './types';

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'local_market_dominator',
    name: 'Local Market Dominator',
    description: 'Dominate your local market with location-based content and community engagement',
    postingFrequency: 5,
    complexity: 'medium',
    decisionCriteria: {
      industry: ['restaurant', 'retail', 'healthcare', 'beauty', 'automotive'],
      businessOffering: ['products', 'services', 'both'],
      targetMarket: ['b2c', 'both'],
      locationType: ['local'],
      goals: ['brand_awareness', 'direct_sales', 'build_relationships'],
      primaryGoal: ['grow_customer_base', 'build_brand_awareness'],
      businessAge: ['less_1_year', '1_3_years'],
      teamSize: ['just_me', '2_5_members'],
      budgetRange: { min: 200, max: 800 }
    },
    contentMix: {
      business_introduction: 15,
      product_showcase: 20,
      service_process: 15,
      brand_personality: 10,
      goal_aligned: 15,
      hashtags_trending: 10,
      industry_news: 5,
      seasonal_post: 10
    },
    platformPriority: ['facebook', 'instagram', 'google_business']
  },
  {
    id: 'b2b_thought_leadership',
    name: 'B2B Thought Leadership',
    description: 'Establish authority and generate leads through professional content and industry insights',
    postingFrequency: 4,
    complexity: 'high',
    decisionCriteria: {
      industry: ['technology', 'professional', 'finance', 'education'],
      businessOffering: ['services', 'both'],
      targetMarket: ['b2b'],
      goals: ['thought_leadership', 'generate_leads', 'build_relationships'],
      primaryGoal: ['grow_customer_base', 'increase_revenue'],
      businessAge: ['3_10_years', '10_plus'],
      teamSize: ['2_5_members', '6_20_members', '20_plus'],
      budgetRange: { min: 500, max: 2000 }
    },
    contentMix: {
      business_introduction: 10,
      product_showcase: 5,
      service_process: 25,
      brand_personality: 15,
      goal_aligned: 20,
      hashtags_trending: 5,
      industry_news: 15,
      seasonal_post: 5
    },
    platformPriority: ['linkedin', 'twitter', 'youtube']
  },
  {
    id: 'ecommerce_growth_engine',
    name: 'E-commerce Growth Engine',
    description: 'Drive online sales through product showcases, customer reviews, and promotional content',
    postingFrequency: 7,
    complexity: 'medium',
    decisionCriteria: {
      industry: ['retail', 'beauty', 'fashion', 'home_goods'],
      businessOffering: ['products'],
      targetMarket: ['b2c', 'both'],
      locationType: ['online'],
      goals: ['direct_sales', 'brand_awareness'],
      primaryGoal: ['increase_revenue', 'grow_customer_base'],
      budgetRange: { min: 400, max: 1500 }
    },
    contentMix: {
      business_introduction: 10,
      product_showcase: 35,
      service_process: 5,
      brand_personality: 15,
      goal_aligned: 20,
      hashtags_trending: 10,
      industry_news: 0,
      seasonal_post: 5
    },
    platformPriority: ['instagram', 'facebook', 'tiktok', 'pinterest']
  },
  {
    id: 'service_authority_builder',
    name: 'Service Authority Builder',
    description: 'Build trust and credibility for service-based businesses through expertise demonstration',
    postingFrequency: 3,
    complexity: 'low',
    decisionCriteria: {
      industry: ['healthcare', 'professional', 'creative', 'consulting'],
      businessOffering: ['services'],
      targetMarket: ['b2c', 'b2b'],
      goals: ['thought_leadership', 'build_relationships', 'generate_leads'],
      primaryGoal: ['build_brand_awareness', 'grow_customer_base'],
      teamSize: ['just_me', '2_5_members'],
      budgetRange: { min: 100, max: 600 }
    },
    contentMix: {
      business_introduction: 15,
      product_showcase: 5,
      service_process: 30,
      brand_personality: 20,
      goal_aligned: 15,
      hashtags_trending: 5,
      industry_news: 10,
      seasonal_post: 0
    },
    platformPriority: ['linkedin', 'facebook', 'instagram']
  },
  {
    id: 'startup_momentum_builder',
    name: 'Startup Momentum Builder',
    description: 'Build awareness and community for new businesses with limited resources',
    postingFrequency: 4,
    complexity: 'low',
    decisionCriteria: {
      industry: ['technology', 'creative', 'retail', 'professional'],
      businessOffering: ['products', 'services', 'both'],
      targetMarket: ['b2c', 'b2b', 'both'],
      businessAge: ['less_1_year'],
      goals: ['brand_awareness', 'build_relationships'],
      primaryGoal: ['build_brand_awareness', 'grow_customer_base'],
      teamSize: ['just_me', '2_5_members'],
      budgetRange: { min: 0, max: 400 }
    },
    contentMix: {
      business_introduction: 25,
      product_showcase: 20,
      service_process: 15,
      brand_personality: 25,
      goal_aligned: 10,
      hashtags_trending: 5,
      industry_news: 0,
      seasonal_post: 0
    },
    platformPriority: ['instagram', 'linkedin', 'twitter']
  }
];
