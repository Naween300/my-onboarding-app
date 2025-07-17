import { OnboardingData } from '@/lib/types';

export class DataMapper {
  static mapOnboardingData(onboardingData: OnboardingData): Record<string, any> {
    return {
      business_name: onboardingData.business_name || '',
      business_category: onboardingData.business_category || '',
      business_offering: onboardingData.business_offering || '',
      target_market: onboardingData.target_market || '',
      // Product data
      product_types: Array.isArray(onboardingData.product_types) 
        ? onboardingData.product_types.join(', ') 
        : onboardingData.product_types || '',
      product_price_range: onboardingData.product_price_range || '',
      product_sales_channels: Array.isArray(onboardingData.product_sales_channels)
        ? onboardingData.product_sales_channels.join(', ')
        : onboardingData.product_sales_channels || '',
      // Service data  
      service_types: Array.isArray(onboardingData.service_types)
        ? onboardingData.service_types.join(', ')
        : onboardingData.service_types || '',
      service_delivery_methods: Array.isArray(onboardingData.service_delivery_methods)
        ? onboardingData.service_delivery_methods.join(', ')
        : onboardingData.service_delivery_methods || '',
      // Brand data
      brand_personality: Array.isArray(onboardingData.brand_personality)
        ? onboardingData.brand_personality.join(', ')
        : onboardingData.brand_personality || '',
      differentiators: Array.isArray(onboardingData.differentiators)
        ? onboardingData.differentiators.join(', ')
        : onboardingData.differentiators || '',
      // Brand colors (flat keys)
      'brandColors.primary': onboardingData.primary_color || '#3B82F6',
      'brandColors.secondary': onboardingData.secondary_color || '#EF4444',
      // Other fields
      logo: onboardingData.logo_url || '',
      business_age: onboardingData.business_age || '',
      team_size: onboardingData.team_size || '',
      main_goal: onboardingData.primary_business_goal || '',
      customer_biggest_challenge: onboardingData.customer_biggest_challenge || '',
      ideal_customers: Array.isArray(onboardingData.ideal_customers)
        ? onboardingData.ideal_customers.join(', ')
        : onboardingData.ideal_customers || '',
      location_type: onboardingData.location_type || '',
      location_details: onboardingData.location_details || '',
      project_duration: onboardingData.project_duration || '',
      customer_type: onboardingData.target_market || '',
      customer_purchase_pattern: onboardingData.customer_purchase_pattern || '',
      service_engagement_type: onboardingData.service_engagement_type || '',
      service_price_range: onboardingData.service_price_range || ''
    };
  }
} 