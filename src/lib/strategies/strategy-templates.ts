import { StrategyTemplate } from './types';

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: "local_market_dominator",
    name: "Local Market Dominator",
    description: "Establishes strong local presence and community connections for location-based businesses",
    targetBusinessTypes: ["Restaurants", "Retail stores", "Service providers", "Healthcare"],
    businessGoals: ["Local brand awareness", "Foot traffic", "Community engagement"],
    contentMix: {
      "local_community": 45,
      "educational_tips": 30,
      "behind_scenes": 15,
      "promotional": 10
    },
    postingFrequency: 5.5,
    optimalTiming: ["7-9 AM", "12-1 PM", "6-8 PM"],
    platformAdaptations: {
      facebook: ["Community events", "Local partnerships", "Customer stories"],
      instagram: ["Location-tagged posts", "Local hashtags", "Visual storytelling"],
      google_business: ["Regular updates", "Customer Q&A", "Local news"]
    },
    decisionCriteria: {
      industry: ["restaurant", "retail", "beauty", "construction", "healthcare"],
      businessModel: ["b2c", "both"],
      goals: ["Increase brand awareness", "Drive foot traffic"],
      requiredScore: 85
    }
  },

  {
    id: "b2b_authority_builder",
    name: "B2B Authority Builder",
    description: "Positions business as industry thought leader and trusted advisor for B2B companies",
    targetBusinessTypes: ["Professional services", "Consulting", "B2B software", "Finance"],
    businessGoals: ["Lead generation", "Industry credibility", "Partnership opportunities"],
    contentMix: {
      "educational_insights": 60,
      "expertise_showcase": 25,
      "industry_news": 10,
      "promotional": 5
    },
    postingFrequency: 3.5,
    optimalTiming: ["9 AM-5 PM", "Tuesday-Thursday peak"],
    platformAdaptations: {
      linkedin: ["Industry analysis", "Professional insights", "Case studies"],
      twitter: ["Real-time commentary", "Quick tips", "Networking"],
      facebook: ["Long-form content", "Client testimonials"]
    },
    decisionCriteria: {
      industry: ["professional", "technology", "finance", "education"],
      businessModel: ["b2b"],
      goals: ["Generate leads", "Build relationships", "Thought leadership"],
      requiredScore: 90
    }
  },

  {
    id: "creative_storyteller",
    name: "Creative Storyteller",
    description: "Uses compelling narratives and visual content to build emotional connections with audiences",
    targetBusinessTypes: ["Creative agencies", "Lifestyle brands", "Entertainment", "Fashion"],
    businessGoals: ["Brand awareness", "Emotional connection", "Viral content"],
    contentMix: {
      "visual_storytelling": 50,
      "behind_scenes": 25,
      "user_generated": 15,
      "promotional": 10
    },
    postingFrequency: 6,
    optimalTiming: ["6-8 PM", "Weekends"],
    platformAdaptations: {
      instagram: ["Stories", "Reels", "Aesthetic posts"],
      tiktok: ["Trending content", "Creative videos"],
      pinterest: ["Visual inspiration", "Mood boards"]
    },
    decisionCriteria: {
      industry: ["creative", "entertainment", "beauty", "travel"],
      businessModel: ["b2c", "both"],
      goals: ["Increase brand awareness", "Build relationships"],
      requiredScore: 80
    }
  },

  {
    id: "educational_expert",
    name: "Educational Expert",
    description: "Focuses on teaching and informing audience to build trust and establish expertise",
    targetBusinessTypes: ["Training companies", "Consultants", "Healthcare", "Technology"],
    businessGoals: ["Thought leadership", "Trust building", "Lead nurturing"],
    contentMix: {
      "how_to_guides": 40,
      "industry_insights": 30,
      "tips_tricks": 20,
      "promotional": 10
    },
    postingFrequency: 4,
    optimalTiming: ["9-11 AM", "2-4 PM"],
    platformAdaptations: {
      youtube: ["Tutorial videos", "Webinars", "Educational series"],
      linkedin: ["Professional tips", "Industry insights"],
      blog: ["In-depth guides", "Case studies"]
    },
    decisionCriteria: {
      industry: ["education", "healthcare", "technology", "professional"],
      businessModel: ["b2b", "b2c", "both"],
      goals: ["Thought leadership", "Build relationships"],
      requiredScore: 85
    }
  },

  {
    id: "customer_centric_champion",
    name: "Customer-Centric Champion",
    description: "Prioritizes customer success stories, testimonials, and community building",
    targetBusinessTypes: ["Service providers", "E-commerce", "SaaS", "Healthcare"],
    businessGoals: ["Customer retention", "Referrals", "Community building"],
    contentMix: {
      "customer_stories": 40,
      "testimonials": 25,
      "community_content": 20,
      "promotional": 15
    },
    postingFrequency: 4.5,
    optimalTiming: ["10 AM-12 PM", "3-5 PM"],
    platformAdaptations: {
      facebook: ["Customer spotlights", "Community groups"],
      instagram: ["User-generated content", "Story highlights"],
      linkedin: ["Case studies", "Success stories"]
    },
    decisionCriteria: {
      industry: ["retail", "technology", "healthcare", "professional"],
      businessModel: ["b2c", "b2b", "both"],
      goals: ["Build relationships", "Customer support"],
      requiredScore: 80
    }
  },

  {
    id: "trend_riding_innovator",
    name: "Trend-Riding Innovator",
    description: "Leverages current trends and viral content to maximize reach and engagement",
    targetBusinessTypes: ["Fashion", "Entertainment", "Food", "Lifestyle"],
    businessGoals: ["Viral reach", "Brand awareness", "Engagement"],
    contentMix: {
      "trending_content": 50,
      "viral_challenges": 25,
      "current_events": 15,
      "promotional": 10
    },
    postingFrequency: 7,
    optimalTiming: ["Peak social hours", "Trending moments"],
    platformAdaptations: {
      tiktok: ["Viral challenges", "Trending sounds"],
      instagram: ["Reels", "Trending hashtags"],
      twitter: ["Real-time engagement", "Trending topics"]
    },
    decisionCriteria: {
      industry: ["entertainment", "beauty", "restaurant", "creative"],
      businessModel: ["b2c"],
      goals: ["Increase brand awareness", "Direct sales"],
      requiredScore: 75
    }
  },

  {
    id: "product_showcase_specialist",
    name: "Product Showcase Specialist",
    description: "Focuses on highlighting products/services through demonstrations and features",
    targetBusinessTypes: ["E-commerce", "Manufacturing", "Retail", "Technology"],
    businessGoals: ["Product awareness", "Sales conversion", "Feature education"],
    contentMix: {
      "product_demos": 45,
      "feature_highlights": 30,
      "comparison_content": 15,
      "promotional": 10
    },
    postingFrequency: 5,
    optimalTiming: ["Shopping hours", "Decision-making times"],
    platformAdaptations: {
      instagram: ["Product photography", "Demo videos"],
      youtube: ["Product reviews", "Tutorials"],
      facebook: ["Product catalogs", "Shopping posts"]
    },
    decisionCriteria: {
      industry: ["retail", "technology", "manufacturing", "automotive"],
      businessModel: ["b2c", "b2b"],
      goals: ["Direct sales", "Increase brand awareness"],
      requiredScore: 85
    }
  },

  {
    id: "community_builder",
    name: "Community Builder",
    description: "Creates and nurtures online communities around shared interests and values",
    targetBusinessTypes: ["Non-profits", "Lifestyle brands", "Fitness", "Education"],
    businessGoals: ["Community engagement", "Brand loyalty", "User-generated content"],
    contentMix: {
      "community_discussions": 40,
      "user_generated": 30,
      "value_driven": 20,
      "promotional": 10
    },
    postingFrequency: 6,
    optimalTiming: ["Evening hours", "Weekend engagement"],
    platformAdaptations: {
      facebook: ["Groups", "Community discussions"],
      discord: ["Real-time chat", "Community events"],
      reddit: ["Community participation", "AMA sessions"]
    },
    decisionCriteria: {
      industry: ["nonprofit", "education", "healthcare", "creative"],
      businessModel: ["b2c", "both"],
      goals: ["Build relationships", "Customer support"],
      requiredScore: 80
    }
  },

  {
    id: "sales_conversion_optimizer",
    name: "Sales Conversion Optimizer",
    description: "Directly focuses on driving sales through targeted promotional content and offers",
    targetBusinessTypes: ["E-commerce", "Retail", "Direct sales", "Services"],
    businessGoals: ["Sales conversion", "Revenue growth", "Offer promotion"],
    contentMix: {
      "promotional_offers": 40,
      "product_benefits": 30,
      "social_proof": 20,
      "educational": 10
    },
    postingFrequency: 5.5,
    optimalTiming: ["Shopping peak hours", "Payday periods"],
    platformAdaptations: {
      facebook: ["Shopping ads", "Promotional posts"],
      instagram: ["Shopping tags", "Story promotions"],
      email: ["Direct offers", "Exclusive deals"]
    },
    decisionCriteria: {
      industry: ["retail", "automotive", "beauty", "travel"],
      businessModel: ["b2c"],
      goals: ["Direct sales", "Increase brand awareness"],
      requiredScore: 90
    }
  },

  {
    id: "thought_leadership_pioneer",
    name: "Thought Leadership Pioneer",
    description: "Establishes business leaders as industry pioneers and forward-thinking experts",
    targetBusinessTypes: ["Consulting", "Technology", "Finance", "Professional services"],
    businessGoals: ["Industry recognition", "Speaking opportunities", "Media coverage"],
    contentMix: {
      "industry_predictions": 35,
      "expert_opinions": 30,
      "research_insights": 25,
      "promotional": 10
    },
    postingFrequency: 3,
    optimalTiming: ["Business hours", "Industry events"],
    platformAdaptations: {
      linkedin: ["Long-form posts", "Industry articles"],
      twitter: ["Expert commentary", "Industry discussions"],
      medium: ["Thought pieces", "Industry analysis"]
    },
    decisionCriteria: {
      industry: ["technology", "finance", "professional", "education"],
      businessModel: ["b2b"],
      goals: ["Thought leadership", "Build relationships"],
      requiredScore: 95
    }
  },

  {
    id: "behind_scenes_authentic",
    name: "Behind-the-Scenes Authentic",
    description: "Shows the human side of business through authentic, behind-the-scenes content",
    targetBusinessTypes: ["Small businesses", "Personal brands", "Creative services", "Restaurants"],
    businessGoals: ["Authenticity", "Personal connection", "Brand humanization"],
    contentMix: {
      "behind_scenes": 50,
      "team_spotlights": 25,
      "process_stories": 15,
      "promotional": 10
    },
    postingFrequency: 4.5,
    optimalTiming: ["Personal connection hours", "Casual browsing times"],
    platformAdaptations: {
      instagram: ["Stories", "Behind-scenes posts"],
      tiktok: ["Day-in-the-life", "Process videos"],
      facebook: ["Personal updates", "Team stories"]
    },
    decisionCriteria: {
      industry: ["restaurant", "creative", "beauty", "professional"],
      businessModel: ["b2c", "both"],
      goals: ["Build relationships", "Increase brand awareness"],
      requiredScore: 75
    }
  },

  {
    id: "seasonal_event_capitalizer",
    name: "Seasonal Event Capitalizer",
    description: "Leverages holidays, seasons, and events for timely and relevant content",
    targetBusinessTypes: ["Retail", "Food & beverage", "Event planning", "Gift services"],
    businessGoals: ["Seasonal sales", "Timely relevance", "Event-driven engagement"],
    contentMix: {
      "seasonal_content": 45,
      "holiday_promotions": 30,
      "event_tie_ins": 15,
      "evergreen": 10
    },
    postingFrequency: 6,
    optimalTiming: ["Pre-event buildup", "During events"],
    platformAdaptations: {
      instagram: ["Seasonal aesthetics", "Holiday posts"],
      facebook: ["Event promotions", "Seasonal offers"],
      pinterest: ["Seasonal inspiration", "Holiday ideas"]
    },
    decisionCriteria: {
      industry: ["retail", "restaurant", "travel", "beauty"],
      businessModel: ["b2c"],
      goals: ["Direct sales", "Increase brand awareness"],
      requiredScore: 80
    }
  },

  {
    id: "problem_solution_focused",
    name: "Problem-Solution Focused",
    description: "Identifies customer pain points and positions products/services as solutions",
    targetBusinessTypes: ["SaaS", "Consulting", "Healthcare", "Professional services"],
    businessGoals: ["Problem awareness", "Solution positioning", "Lead generation"],
    contentMix: {
      "problem_identification": 35,
      "solution_presentation": 35,
      "case_studies": 20,
      "promotional": 10
    },
    postingFrequency: 4,
    optimalTiming: ["Problem-solving hours", "Business decision times"],
    platformAdaptations: {
      linkedin: ["Problem-solving posts", "Solution case studies"],
      youtube: ["Problem-solution videos", "How-to guides"],
      blog: ["In-depth problem analysis", "Solution guides"]
    },
    decisionCriteria: {
      industry: ["technology", "healthcare", "professional", "finance"],
      businessModel: ["b2b", "both"],
      goals: ["Generate leads", "Thought leadership"],
      requiredScore: 85
    }
  },

  {
    id: "visual_first_aesthetic",
    name: "Visual-First Aesthetic",
    description: "Prioritizes high-quality visuals and aesthetic appeal to attract and engage audiences",
    targetBusinessTypes: ["Fashion", "Beauty", "Interior design", "Photography"],
    businessGoals: ["Visual brand recognition", "Aesthetic appeal", "Inspiration"],
    contentMix: {
      "high_quality_visuals": 60,
      "aesthetic_content": 25,
      "visual_tutorials": 10,
      "promotional": 5
    },
    postingFrequency: 7,
    optimalTiming: ["Visual browsing hours", "Inspiration seeking times"],
    platformAdaptations: {
      instagram: ["High-quality photos", "Aesthetic feeds"],
      pinterest: ["Visual inspiration", "Mood boards"],
      tiktok: ["Visual transformations", "Aesthetic videos"]
    },
    decisionCriteria: {
      industry: ["beauty", "creative", "travel", "retail"],
      businessModel: ["b2c"],
      goals: ["Increase brand awareness", "Build relationships"],
      requiredScore: 85
    }
  },

  {
    id: "data_driven_optimizer",
    name: "Data-Driven Optimizer",
    description: "Uses analytics and data insights to continuously optimize content performance",
    targetBusinessTypes: ["Technology", "Marketing agencies", "E-commerce", "SaaS"],
    businessGoals: ["Performance optimization", "ROI maximization", "Data-driven growth"],
    contentMix: {
      "performance_insights": 40,
      "data_visualizations": 30,
      "optimization_tips": 20,
      "promotional": 10
    },
    postingFrequency: 3.5,
    optimalTiming: ["Data analysis hours", "Business optimization times"],
    platformAdaptations: {
      linkedin: ["Data insights", "Performance analytics"],
      twitter: ["Quick data tips", "Industry metrics"],
      blog: ["Detailed analysis", "Optimization guides"]
    },
    decisionCriteria: {
      industry: ["technology", "professional", "finance"],
      businessModel: ["b2b"],
      goals: ["Thought leadership", "Generate leads"],
      requiredScore: 90
    }
  },

  {
    id: "multi_platform_synergist",
    name: "Multi-Platform Synergist",
    description: "Coordinates content across multiple platforms for maximum reach and consistency",
    targetBusinessTypes: ["Large businesses", "Agencies", "Franchises", "Multi-location"],
    businessGoals: ["Consistent branding", "Maximum reach", "Platform optimization"],
    contentMix: {
      "cross_platform": 35,
      "platform_specific": 30,
      "unified_campaigns": 25,
      "promotional": 10
    },
    postingFrequency: 8,
    optimalTiming: ["Platform-specific optimal times", "Cross-platform coordination"],
    platformAdaptations: {
      facebook: ["Community building", "Long-form content"],
      instagram: ["Visual storytelling", "Stories"],
      linkedin: ["Professional content", "B2B focus"],
      twitter: ["Real-time engagement", "News"],
      tiktok: ["Trending content", "Video"],
      youtube: ["Long-form video", "Tutorials"]
    },
    decisionCriteria: {
      industry: ["technology", "retail", "professional", "entertainment"],
      businessModel: ["both"],
      goals: ["Increase brand awareness", "Generate leads", "Build relationships"],
      requiredScore: 80
    }
  }
];
