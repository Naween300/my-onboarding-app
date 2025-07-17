import { z } from 'zod';

export const step1Schema = z.object({
  business_offering: z.enum(['products', 'services', 'both'], { required_error: 'Please select what you offer' }),
  business_category: z.string().min(1, 'Please select a business category'),
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  location_type: z.enum(['local', 'online']),
  location_details: z.string().optional(),
});

export const step2Schema = z.object({
  business_offering: z.enum(['products', 'services', 'both']),
  // Product fields
  product_types: z.array(z.string()).max(3, 'Select up to 3 product types').optional(),
  product_sales_channels: z.array(z.string()).optional(),
  customer_purchase_pattern: z.string().optional(),
  product_price_range: z.string().optional(),
  // Service fields
  service_types: z.array(z.string()).max(3, 'Select up to 3 service types').optional(),
  service_delivery_methods: z.array(z.string()).optional(),
  service_engagement_type: z.string().optional(),
  service_price_range: z.string().optional(),
  // Both
  primary_focus: z.string().optional(),
  products_services_connection: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.business_offering === 'products' || data.business_offering === 'both') {
    if (!data.product_types || data.product_types.length === 0) {
      ctx.addIssue({ path: ['product_types'], code: z.ZodIssueCode.custom, message: 'Select at least 1 product type' });
    }
    if (!data.product_sales_channels || data.product_sales_channels.length === 0) {
      ctx.addIssue({ path: ['product_sales_channels'], code: z.ZodIssueCode.custom, message: 'Select at least 1 sales channel' });
    }
    if (!data.customer_purchase_pattern) {
      ctx.addIssue({ path: ['customer_purchase_pattern'], code: z.ZodIssueCode.custom, message: 'Select a purchase pattern' });
    }
    if (!data.product_price_range) {
      ctx.addIssue({ path: ['product_price_range'], code: z.ZodIssueCode.custom, message: 'Select a price range' });
    }
  }
  if (data.business_offering === 'services' || data.business_offering === 'both') {
    if (!data.service_types || data.service_types.length === 0) {
      ctx.addIssue({ path: ['service_types'], code: z.ZodIssueCode.custom, message: 'Select at least 1 service type' });
    }
    if (!data.service_delivery_methods || data.service_delivery_methods.length === 0) {
      ctx.addIssue({ path: ['service_delivery_methods'], code: z.ZodIssueCode.custom, message: 'Select at least 1 delivery method' });
    }
    if (!data.service_engagement_type) {
      ctx.addIssue({ path: ['service_engagement_type'], code: z.ZodIssueCode.custom, message: 'Select an engagement type' });
    }
    if (!data.service_price_range) {
      ctx.addIssue({ path: ['service_price_range'], code: z.ZodIssueCode.custom, message: 'Select a price range' });
    }
  }
  if (data.business_offering === 'both') {
    if (!data.primary_focus) {
      ctx.addIssue({ path: ['primary_focus'], code: z.ZodIssueCode.custom, message: 'Select your primary focus' });
    }
    if (!data.products_services_connection) {
      ctx.addIssue({ path: ['products_services_connection'], code: z.ZodIssueCode.custom, message: 'Select how products and services connect' });
    }
  }
});

export const step3Schema = z.object({
  brandColors: z.object({
    primary: z.string().min(1, 'Please select a primary color'),
    secondary: z.string().min(1, 'Please select a secondary color'),
  }),
  contactInfo: z.object({
    website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
    phone: z.string().optional(),
    socialHandles: z.string().optional(),
  }),
  budget: z.number().min(0).max(10000),
  timeline: z.enum(['quick', 'steady', 'long-term']),
  // Enhanced fields
  audience_topics: z.array(z.string()).min(1, 'Select at least 1 topic').max(5, 'Select up to 5 topics'),
  team_size: z.string().min(1, 'Select your team size'),
  business_age: z.string().min(1, 'Select how long you have been in business'),
});

export const step3MarketSchema = z.object({
  customer_type: z.enum(['b2b', 'b2c', 'both'], { required_error: 'Please select who you serve' }),
  ideal_customers: z.array(z.string()).min(1, 'Select at least 1 ideal customer').max(4, 'Select up to 4 ideal customers'),
  audience_topics: z.array(z.string()).min(1, 'Select at least 1 topic').max(5, 'Select up to 5 topics'),
  customer_biggest_challenge: z.string().optional(),
  customer_biggest_challenge_other: z.string().optional(),
  competitors: z.array(z.object({
    url: z.string().optional(),
    description: z.string().optional(),
  })).max(3).optional(),
  competitors_skipped: z.boolean().optional(),
});

