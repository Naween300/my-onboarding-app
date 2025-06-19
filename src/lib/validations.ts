import { z } from 'zod';

export const step1Schema = z.object({
  businessType: z.string().min(1, 'Please select a business type'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  locationType: z.enum(['local', 'online']),
  location: z.string().optional(),
  customerType: z.enum(['b2b', 'b2c', 'both']),
});

export const step2Schema = z.object({
  goals: z.array(z.string()).min(1, 'Please select at least 1 goal').max(3, 'Maximum 3 goals'),
  brandPersonality: z.array(z.string()).min(1, 'Please select at least 1 personality trait'),
  socialMediaPresence: z.object({
    facebook: z.enum(['none', 'some', 'active']),
    instagram: z.enum(['none', 'some', 'active']),
    linkedin: z.enum(['none', 'some', 'active']),
  }),
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
});

