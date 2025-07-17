'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema } from '@/lib/validations';
import { BusinessType, OnboardingData } from '@/lib/types';

// Enhanced onboarding options
const idealCustomerOptions = [
  { value: 'business_owners', label: '👔 Business owners' },
  { value: 'marketing_managers', label: '🎯 Marketing managers' },
  { value: 'individual_consumers', label: '👥 Individual consumers' },
  { value: 'large_corporations', label: '🏢 Large corporations' },
  { value: 'startups', label: '🚀 Startups' },
  { value: 'professionals', label: '👨‍💼 Professionals' },
  { value: 'students', label: '👩‍🎓 Students' },
  { value: 'families', label: '👪 Families' },
  { value: 'homeowners', label: '🏠 Homeowners' },
  { value: 'freelancers', label: '💼 Freelancers' },
];
const mainBusinessGoals = [
  { value: 'grow_customer_base', label: '📈 Grow customer base' },
  { value: 'increase_revenue', label: '💰 Increase revenue' },
  { value: 'build_brand_awareness', label: '🌟 Build brand awareness' },
  { value: 'launch_new_product', label: '🎯 Launch new product/service' },
  { value: 'improve_retention', label: '🔄 Improve customer retention' },
  { value: 'scale_operations', label: '🚀 Scale operations' },
];

const businessTypes: BusinessType[] = [
  { id: 'restaurant', name: 'Restaurant/Food', icon: '🍽️', category: 'food' },
  { id: 'retail', name: 'Retail/Store', icon: '🛍️', category: 'retail' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', category: 'health' },
  { id: 'tech', name: 'Tech/Software', icon: '💻', category: 'technology' },
  { id: 'professional', name: 'Professional Services', icon: '💼', category: 'services' },
  { id: 'creative', name: 'Creative/Design', icon: '🎨', category: 'creative' },
  { id: 'construction', name: 'Construction/Home', icon: '🏗️', category: 'construction' },
  { id: 'finance', name: 'Finance/Insurance', icon: '💰', category: 'finance' },
  { id: 'education', name: 'Education', icon: '📚', category: 'education' },
  { id: 'automotive', name: 'Automotive', icon: '🚗', category: 'automotive' },
  { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', category: 'manufacturing' },
  { id: 'nonprofit', name: 'Non-profit', icon: '❤️', category: 'nonprofit' },
  { id: 'travel', name: 'Travel/Tourism', icon: '✈️', category: 'travel' },
  { id: 'beauty', name: 'Beauty/Fashion', icon: '💄', category: 'beauty' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', category: 'entertainment' },
];

// Add at the top: What do you offer?
const offeringOptions = [
  { value: 'products', label: '📦 Products', description: 'Physical/digital items customers buy' },
  { value: 'services', label: '🛠️ Services', description: 'Work you do for customers' },
  { value: 'both', label: '🔄 Both', description: 'Products and services combined' },
];

interface Step1Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export const Step1BusinessBasics = ({ data, onNext }: Step1Props) => {
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors, isValid }, 
    watch,
    setValue,
    trigger
  } = useForm({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      business_offering: data.business_offering || 'products',
      business_category: data.business_category || '',
      business_name: data.business_name || '',
      location_type: data.location_type || 'online',
      location_details: data.location_details || '',
      // target_market removed
    },
  });

  const formValues = watch();
  
  console.log('🔍 Form Debug:', {
    formValues,
    isValid,
    errors,
    hasBusinessCategory: !!formValues.business_category,
    hasBusinessName: !!formValues.business_name,
  });

  const onSubmit = (formData: any) => {
    // Only return unified fields
    const output = {
      business_offering: formData.business_offering,
      business_category: formData.business_category,
      business_name: formData.business_name,
      location_type: formData.location_type,
      location_details: formData.location_type === 'local' ? formData.location_details : '',
      // target_market removed
    };
    console.log('✅ Form submitted successfully with:', output);
    onNext(output);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Basics</h2>
        {/* --- What do you offer? --- */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What do you offer? *
          </label>
          <Controller
            name="business_offering"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="flex gap-4">
                {offeringOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => field.onChange(option.value)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all text-left ${
                      field.value === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            )}
          />
          {errors.business_offering && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              ⚠️ Please select what you offer.
            </p>
          )}
        </div>
        {/* --- What's your business? (business type grid) --- */}
        <div className="mb-6">
          <fieldset>
            <legend id="business-type-legend" className="block text-sm font-medium text-gray-700 mb-4">
              What's your business? *
              <span className="text-xs text-gray-500 ml-2">
                (Selected: {formValues.business_category || 'None'})
              </span>
            </legend>
            <input
              {...register('business_category')}
              type="hidden"
              id="business_category"
              name="business_category"
              value={formValues.business_category}
            />
            <div className="grid grid-cols-5 gap-3" role="radiogroup" aria-labelledby="business-type-legend">
              {businessTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  role="radio"
                  aria-checked={formValues.business_category === type.id}
                  aria-labelledby={`business-type-${type.id}`}
                  onClick={() => {
                    setValue('business_category', type.id, { shouldValidate: true });
                    trigger('business_category');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-center hover:shadow-md ${
                    formValues.business_category === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div id={`business-type-${type.id}`} className="text-xs font-medium">{type.name}</div>
                </button>
              ))}
            </div>
            {errors.business_category && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                ⚠️ {errors.business_category.message}
              </p>
            )}
          </fieldset>
        </div>
        {/* --- Business Name --- */}
        <div className="mb-6">
          <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            {...register('business_name')}
            id="business_name"
            name="business_name"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your business name"
            aria-describedby={errors.business_name ? "business_name-error" : undefined}
          />
          {errors.business_name && (
            <p id="business_name-error" className="mt-2 text-sm text-red-600" role="alert">
              ⚠️ {errors.business_name.message}
            </p>
          )}
        </div>
        {/* --- Location --- */}
        <div className="mb-6">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-4">
              Location *
            </legend>
            <Controller
              name="location_type"
              control={control}
              render={({ field }) => (
                <div className="flex gap-4" role="radiogroup">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={field.value === 'local'}
                    aria-label="Local business"
                    onClick={() => field.onChange('local')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                      field.value === 'local'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl mb-2">📍</div>
                    <div className="font-medium">Local business</div>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={field.value === 'online'}
                    aria-label="Online/Remote business"
                    onClick={() => field.onChange('online')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                      field.value === 'online'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl mb-2">🌐</div>
                    <div className="font-medium">Online/Remote</div>
                  </button>
                </div>
              )}
            />
          </fieldset>
        </div>
        {/* Location Input for Local */}
        {formValues.location_type === 'local' && (
          <div className="mb-6">
            <label htmlFor="location_details" className="block text-sm font-medium text-gray-700 mb-2">
              City/Location
            </label>
            <input
              {...register('location_details')}
              id="location_details"
              name="location_details"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your city/location"
              aria-describedby={errors.location_details ? "location_details-error" : undefined}
            />
            {errors.location_details && (
              <p id="location_details-error" className="mt-2 text-sm text-red-600" role="alert">
                ⚠️ {errors.location_details.message}
              </p>
            )}
          </div>
        )}
        {/* --- Target Market --- */}
        {/* Removed Target Market section as requested */}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid}
          className={`px-6 py-2 rounded-md transition-colors duration-200 ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue {isValid ? '✅' : '❌'}
        </button>
      </div>
    </form>
  );
};
 