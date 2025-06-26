'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema } from '@/lib/validations';
import { BusinessType, OnboardingData } from '@/lib/types';

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
      businessType: data.businessType || '',
      businessName: data.businessName || '',
      locationType: data.locationType || 'online',
      location: data.location || '',
      customerType: data.customerType || 'b2c'
    },
  });

  const formValues = watch();
  
  console.log('🔍 Form Debug:', {
    formValues,
    isValid,
    errors,
    hasBusinessType: !!formValues.businessType,
    hasBusinessName: !!formValues.businessName,
  });

  const onSubmit = (formData: any) => {
    console.log('✅ Form submitted successfully with:', formData);
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Basics</h2>
        
        {/* Debug Panel */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🔧 Live Debug:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Business Type:</strong> "{formValues.businessType}"</p>
            <p><strong>Business Name:</strong> "{formValues.businessName}" (Length: {formValues.businessName?.length || 0})</p>
            <p><strong>Form Valid:</strong> {isValid ? '✅ YES' : '❌ NO'}</p>
            <p><strong>Errors:</strong> {Object.keys(errors).length}</p>
          </div>
        </div>

        {/* ✅ FIXED: Business Type with hidden input for React Hook Form */}
        <div className="mb-6">
          <fieldset>
            <legend id="business-type-legend" className="block text-sm font-medium text-gray-700 mb-4">
              What's your business? *
              <span className="text-xs text-gray-500 ml-2">
                (Selected: {formValues.businessType || 'None'})
              </span>
            </legend>
            {/* ✅ ADD: Hidden input for React Hook Form registration */}
            <input
              {...register('businessType')}
              type="hidden"
              id="businessType"
              name="businessType"
              value={formValues.businessType}
            />
            <div className="grid grid-cols-5 gap-3" role="radiogroup" aria-labelledby="business-type-legend">
              {businessTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  role="radio"
                  aria-checked={formValues.businessType === type.id}
                  aria-labelledby={`business-type-${type.id}`}
                  onClick={() => {
                    setValue('businessType', type.id, { shouldValidate: true });
                    trigger('businessType');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-center hover:shadow-md ${
                    formValues.businessType === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div id={`business-type-${type.id}`} className="text-xs font-medium">{type.name}</div>
                </button>
              ))}
            </div>
            {errors.businessType && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                ⚠️ {errors.businessType.message}
              </p>
            )}
          </fieldset>
        </div>

        {/* Business Name - Standard input registration */}
        <div className="mb-6">
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            {...register('businessName')}
            id="businessName"
            name="businessName"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your business name"
            aria-describedby={errors.businessName ? "businessName-error" : undefined}
          />
          {errors.businessName && (
            <p id="businessName-error" className="mt-2 text-sm text-red-600" role="alert">
              ⚠️ {errors.businessName.message}
            </p>
          )}
        </div>

        {/* ✅ FIXED: Location Type with proper fieldset */}
        <div className="mb-6">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-4">
              Location *
            </legend>
            <Controller
              name="locationType"
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
        {formValues.locationType === 'local' && (
          <div className="mb-6">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              City/Location
            </label>
            <input
              {...register('location')}
              id="location"
              name="location"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your city/location"
              aria-describedby={errors.location ? "location-error" : undefined}
            />
            {errors.location && (
              <p id="location-error" className="mt-2 text-sm text-red-600" role="alert">
                ⚠️ {errors.location.message}
              </p>
            )}
          </div>
        )}

        {/* ✅ FIXED: Customer Type with proper fieldset */}
        <div className="mb-6">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-4">
              You serve *
            </legend>
            <Controller
              name="customerType"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-4" role="radiogroup">
                  {[
                    { value: 'b2b', label: 'Businesses (B2B)', icon: '🏢' },
                    { value: 'b2c', label: 'Consumers (B2C)', icon: '👥' },
                    { value: 'both', label: 'Both', icon: '🔄' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={field.value === option.value}
                      aria-label={option.label}
                      onClick={() => field.onChange(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                        field.value === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xl mb-2">{option.icon}</div>
                      <div className="font-medium text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.customerType && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                ⚠️ {errors.customerType.message}
              </p>
            )}
          </fieldset>
        </div>
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
 