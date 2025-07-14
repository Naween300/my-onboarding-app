import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const topGoalsOptions = [
  { value: 'brand_awareness', label: '📈 Brand awareness' },
  { value: 'generate_leads', label: '🎯 Generate leads' },
  { value: 'direct_sales', label: '💰 Direct sales' },
  { value: 'build_relationships', label: '🤝 Build relationships' },
  { value: 'thought_leadership', label: '🧠 Thought leadership' },
  { value: 'customer_support', label: '🛠️ Customer support' },
];
const mainGoalOptions = [
  { value: 'grow_customer_base', label: '📈 Grow customer base' },
  { value: 'increase_revenue', label: '💰 Increase revenue' },
  { value: 'build_brand_awareness', label: '🌟 Build brand awareness' },
  { value: 'launch_new_product', label: '🎯 Launch new product/service' },
  { value: 'improve_retention', label: '🔄 Improve customer retention' },
  { value: 'scale_operations', label: '🚀 Scale operations' },
];
const brandPersonalityOptions = [
  { value: 'professional', label: '💼 Professional' },
  { value: 'friendly', label: '😊 Friendly' },
  { value: 'creative', label: '🎨 Creative' },
  { value: 'innovative', label: '🚀 Innovative' },
  { value: 'authentic', label: '🌱 Authentic' },
  { value: 'premium', label: '✨ Premium' },
  { value: 'bold', label: '💪 Bold' },
  { value: 'trustworthy', label: '🤝 Trustworthy' },
];
const differentiatorOptions = [
  { value: 'faster_service', label: '⚡ Faster service' },
  { value: 'better_pricing', label: '💰 Better pricing' },
  { value: 'higher_quality', label: '🏆 Higher quality' },
  { value: 'personal_attention', label: '🤝 Personal attention' },
  { value: 'more_experience', label: '🎓 More experience' },
  { value: 'latest_technology', label: '🚀 Latest technology' },
  { value: 'unique_approach', label: '🌟 Unique approach' },
];

const schema = z.object({
  top_goals: z.array(z.string()).min(1, 'Select at least 1 goal').max(3, 'Select up to 3 goals'),
  main_goal: z.string().min(1),
  brand_personality: z.array(z.string()).min(1).max(4),
  differentiators: z.array(z.string()).min(1).max(3),
});

type Step4Form = z.infer<typeof schema>;

export function Step4GoalsBrandIdentity({ data = {}, onSubmit, onBack, isCompleting = false }: any) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<Step4Form>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      top_goals: [],
      main_goal: '',
      brand_personality: [],
      differentiators: [],
      ...data,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 4: Goals & Brand Identity</h2>
      {/* Top 3 goals - multi-select */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Top 3 goals <span className="text-gray-400">(Select up to 3)</span> *</label>
        <Controller
          name="top_goals"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {topGoalsOptions.map(option => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => {
                    const arr = field.value || [];
                    if (arr.includes(option.value)) {
                      field.onChange(arr.filter((v: string) => v !== option.value));
                    } else if (arr.length < 3) {
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
        {errors.top_goals && <p className="mt-2 text-sm text-red-600">{errors.top_goals.message as string}</p>}
      </div>
      {/* Main business goal */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">What's your main business goal right now? *</label>
        <Controller
          name="main_goal"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {mainGoalOptions.map(option => (
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
        {errors.main_goal && <p className="mt-2 text-sm text-red-600">{errors.main_goal.message as string}</p>}
      </div>
      {/* Brand personality */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Brand personality <span className="text-gray-400">(Select up to 4)</span> *</label>
        <Controller
          name="brand_personality"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {brandPersonalityOptions.map(option => (
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
        {errors.brand_personality && <p className="mt-2 text-sm text-red-600">{errors.brand_personality.message as string}</p>}
      </div>
      {/* Differentiators */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">What makes you different? <span className="text-gray-400">(Select up to 3)</span> *</label>
        <Controller
          name="differentiators"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {differentiatorOptions.map(option => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => {
                    const arr = field.value || [];
                    if (arr.includes(option.value)) {
                      field.onChange(arr.filter((v: string) => v !== option.value));
                    } else if (arr.length < 3) {
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
        {errors.differentiators && <p className="mt-2 text-sm text-red-600">{errors.differentiators.message as string}</p>}
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
          disabled={!isValid || isCompleting}
        >
          {isCompleting ? (
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
} 