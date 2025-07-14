'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step3MarketSchema } from '@/lib/validations';
import { useState } from 'react';
import { OnboardingData } from '@/lib/types';
import { StorageService } from '@/lib/storage';
import { DatabaseService } from '@/lib/database';

const customerTypeOptions = [
  { value: 'b2b', label: '🏢 Businesses (B2B)' },
  { value: 'b2c', label: '👥 Consumers (B2C)' },
  { value: 'both', label: '🔄 Both' },
];
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
const customerChallengeOptions = [
  { value: 'affordable', label: '💰 Finding affordable solutions' },
  { value: 'saving_time', label: '⏰ Saving time' },
  { value: 'results', label: '🎯 Getting results' },
  { value: 'trustworthy', label: '🤝 Finding trustworthy providers' },
  { value: 'learning', label: '📚 Learning new skills' },
  { value: 'technical', label: '🔧 Technical problems' },
  { value: 'other', label: '✏️ Other' },
];
const audienceTopicOptions = [
  { value: 'tips', label: '💡 Tips & tutorials' },
  { value: 'news', label: '📊 Industry news' },
  { value: 'success', label: '🎯 Success stories' },
  { value: 'cost', label: '💰 Cost-saving ideas' },
  { value: 'trends', label: '🚀 New trends' },
  { value: 'problem', label: '🔧 Problem-solving' },
  { value: 'behind', label: '🏆 Behind-the-scenes' },
  { value: 'growth', label: '📈 Business growth' },
  { value: 'networking', label: '🤝 Networking' },
  { value: 'inspiration', label: '🎨 Inspiration' },
];
const teamSizeOptions = [
  { value: 'just_me', label: '👤 Just me' },
  { value: '2_5_members', label: '👥 2-5 team members' },
  { value: '6_20_members', label: '🏢 6-20 team members' },
  { value: '20_plus', label: '🏭 20+ team members' },
];
const businessAgeOptions = [
  { value: 'less_1_year', label: '🆕 Less than 1 year' },
  { value: '1_3_years', label: '📅 1-3 years' },
  { value: '3_10_years', label: '🏢 3-10 years' },
  { value: '10_plus', label: '🏆 10+ years' },
];

interface Step3Props {
  data: any; // Change to OnboardingFormData if importable
  onSubmit: (data: any) => void; // Change to (data: OnboardingFormData) => void if importable
  onBack: () => void;
  isCompleting?: boolean;
}

export const Step3BrandSetup = ({ data, onSubmit, onBack, isCompleting = false }: Step3Props) => {
  const [logo, setLogo] = useState<File | null>(data.logo || null);
  const [colors, setColors] = useState(
    data.brandColors || { primary: '#3B82F6', secondary: '#EF4444' }
  );
  const [budget, setBudget] = useState(data.budget || 500);
  const [dragActive, setDragActive] = useState(false);
  const [isStepCompleting, setIsStepCompleting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger
  } = useForm({
    resolver: zodResolver(step3MarketSchema),
    mode: 'onChange',
    defaultValues: {
      customer_type: (data.customer_type as 'b2b' | 'b2c' | 'both') || undefined,
      ideal_customers: data.ideal_customers || [],
      customer_biggest_challenge: data.customer_biggest_challenge || '',
      customer_biggest_challenge_other: data.customer_biggest_challenge_other || '',
      competitors: data.competitors || [{ url: '', description: '' }],
      competitors_skipped: data.competitors_skipped || false,
      audience_topics: data.audience_topics || [],
    },
  });

  // Enhanced logo upload with drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setLogo(file);
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };

  const handleColorChange = (type: 'primary' | 'secondary', color: string) => {
    setColors((prev: { primary: string; secondary: string }) => ({ ...prev, [type]: color }));
  };

  const handleFormSubmit = async (formData: any) => {
    if (isStepCompleting) return;
    
    setIsStepCompleting(true);
    console.log('🔥 [Step3] Complete Setup button clicked!');
    
    try {
      // ✅ Prepare complete data from all steps
      const completeData = {
        // Step 1 data
        businessType: data.businessType,
        businessName: data.businessName,
        locationType: data.locationType,
        location: data.location,
        customerType: data.customerType,
        // Step 2 data
        goals: data.goals,
        brandPersonality: data.brandPersonality,
        socialMediaPresence: data.socialMediaPresence,
        // Step 3 data
        brandColors: colors,
        contactInfo: formData.contactInfo,
        budget,
        timeline: formData.timeline,
        audience_topics: formData.audience_topics,
        team_size: formData.team_size,
        business_age: formData.business_age,
        ...(logo ? { logo } : {})
      };
      
      console.log('✅ [Step3] Complete data prepared:', completeData);
      
      // ✅ Call onSubmit which should trigger the completion handler
      await onSubmit(completeData);
    } catch (error) {
      console.error('❌ [Step3] Error in form submission:', error);
    } finally {
      setIsStepCompleting(false);
    }
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault(); // ✅ CRITICAL: Prevent default form submission
        e.stopPropagation(); // ✅ Stop event bubbling
        console.log('📝 [Step3] Form submission prevented, calling handleSubmit...');
        // ✅ CRITICAL: Call handleSubmit properly
        handleSubmit((formData) => {
          console.log('🔥 [Step3] handleSubmit callback triggered');
          handleFormSubmit(formData);
        })(e);
      }} 
      className="space-y-8"
    >
  
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Intelligence</h2>
        {/* You serve */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">You serve *</label>
          <Controller
            name="customer_type"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {customerTypeOptions.map(option => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => field.onChange(option.value)}
                    className={`px-3 py-2 rounded-full border-2 text-sm transition-all ${
                      field.value === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          />
          {errors.customer_type && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.customer_type?.message?.toString()}
            </p>
          )}
        </div>
        {/* Ideal customers */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Who's your ideal customer? <span className="text-gray-400">(Select up to 4)</span> *</label>
          <Controller
            name="ideal_customers"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {idealCustomerOptions.map(option => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      const arr = field.value || [];
                      if (arr.includes(option.value)) {
                        field.onChange(arr.filter((v: string) => v !== option.value));
                      } else if (arr.length < 4) {
                        field.onChange([...(arr || []), option.value]);
                      }
                    }}
                    className={`px-3 py-2 rounded-full border-2 text-sm transition-all ${
                      field.value?.includes(option.value)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          />
          {errors.ideal_customers && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.ideal_customers?.message?.toString()}
            </p>
          )}
        </div>
        {/* Customer's biggest challenge */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your customers' biggest challenge is: *</label>
          <Controller
            name="customer_biggest_challenge"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {customerChallengeOptions.map(option => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => field.onChange(option.value)}
                    className={`px-3 py-2 rounded-full border-2 text-sm transition-all ${
                      field.value === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          />
          {watch('customer_biggest_challenge') === 'other' && (
            <div className="mt-4">
              <input
                {...register('customer_biggest_challenge_other')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please specify the other challenge"
              />
              {errors.customer_biggest_challenge_other && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.customer_biggest_challenge_other?.message?.toString()}
                </p>
              )}
            </div>
          )}
          {errors.customer_biggest_challenge && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.customer_biggest_challenge?.message?.toString()}
            </p>
          )}
        </div>
        {/* Competitors */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Who are your main competitors?</label>
          <Controller
            name="competitors"
            control={control}
            render={({ field }) => (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <input
                      type="url"
                      value={field.value?.[i]?.url || ''}
                      onChange={e => {
                        const arr = field.value ? [...field.value] : [{}, {}, {}];
                        arr[i] = { ...arr[i], url: e.target.value };
                        field.onChange(arr);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder={`Facebook URL for Competitor ${i + 1}`}
                    />
                    <input
                      type="text"
                      value={field.value?.[i]?.description || ''}
                      onChange={e => {
                        const arr = field.value ? [...field.value] : [{}, {}, {}];
                        arr[i] = { ...arr[i], description: e.target.value };
                        field.onChange(arr);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="What they do (optional)"
                    />
                  </div>
                ))}
                <div className="mt-2">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('competitors_skipped')}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-600">Skip this step - we'll help you identify them later</span>
                  </label>
                </div>
              </div>
            )}
          />
          {errors.competitors && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.competitors?.message?.toString()}
            </p>
          )}
        </div>
        {/* Audience topics */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">What topics does your audience care about? <span className="text-gray-400">(Select up to 5)</span> *</label>
          <Controller
            name="audience_topics"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {audienceTopicOptions.map(option => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      const arr = field.value || [];
                      if (arr.includes(option.value)) {
                        field.onChange(arr.filter((v: string) => v !== option.value));
                      } else if (arr.length < 5) {
                        field.onChange([...(arr || []), option.value]);
                      }
                    }}
                    className={`px-3 py-2 rounded-full border-2 text-sm transition-all ${
                      field.value?.includes(option.value)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          />
          {errors.audience_topics && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.audience_topics?.message?.toString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
        >
          ← Back
        </button>
        <button
          type="submit"
          className={`px-6 py-2 rounded-md font-semibold transition-all ${
            isValid
              ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
          disabled={!isValid || isStepCompleting}
        >
          {isStepCompleting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </form>
  );
};
