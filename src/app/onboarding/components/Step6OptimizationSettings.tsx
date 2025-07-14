import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
const projectDurationOptions = [
  { value: 'same_day', label: '📅 Same day' },
  { value: '2_7_days', label: '📅 2-7 days' },
  { value: '1_4_weeks', label: '📅 1-4 weeks' },
  { value: '1_3_months', label: '📅 1-3 months' },
  { value: '3_plus_months', label: '📅 3+ months' },
  { value: 'ongoing', label: '🔄 Ongoing service' },
];
const resultsTimelineOptions = [
  { value: 'quick', label: '🏃 Quick (1-3mo)' },
  { value: 'steady', label: '📈 Steady (3-6mo)' },
  { value: 'long_term', label: '🏗️ Long-term (6+mo)' },
];

const schema = z.object({
  team_size: z.string().min(1, 'Select your team size'),
  business_age: z.string().min(1, 'Select how long you have been in business'),
  project_duration: z.string().min(1, 'Select your typical project/service duration'),
  budget: z.number().min(0),
  results_timeline: z.string().min(1, 'Select your results timeline'),
});

type Step6Form = z.infer<typeof schema>;

export function Step6OptimizationSettings({ data = {}, onSubmit, onBack, isCompleting = false }: any) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<Step6Form>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      team_size: data.team_size || '',
      business_age: data.business_age || '',
      project_duration: data.project_duration || '',
      budget: data.budget || 500,
      results_timeline: data.results_timeline || '',
    },
  });

  const handleFormSubmit = (formData: Step6Form) => {
    console.log('✅ Step 6 form data:', formData);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 6: Optimization Settings</h2>
      {/* Team size */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Your business has:</h3>
        <Controller
          name="team_size"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {teamSizeOptions.map(option => (
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
        {errors.team_size && <p className="mt-2 text-sm text-red-600">{errors.team_size.message as string}</p>}
      </div>
      {/* Years in business */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">How long have you been in business?</h3>
        <Controller
          name="business_age"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {businessAgeOptions.map(option => (
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
        {errors.business_age && <p className="mt-2 text-sm text-red-600">{errors.business_age.message as string}</p>}
      </div>
      {/* Project duration */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Your typical project/service takes:</h3>
        <Controller
          name="project_duration"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {projectDurationOptions.map(option => (
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
        {errors.project_duration && <p className="mt-2 text-sm text-red-600">{errors.project_duration.message as string}</p>}
      </div>
      {/* Budget & timeline */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Budget & timeline</h3>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Monthly budget: ${watch('budget')}
          </label>
          <Controller
            name="budget"
            control={control}
            render={({ field }) => (
              <input
                type="range"
                min={0}
                max={2000}
                step={100}
                value={field.value}
                onChange={e => field.onChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            )}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>$100</span>
            <span>$500</span>
            <span>$1000+</span>
          </div>
        </div>
        <Controller
          name="results_timeline"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-3 gap-4">
              {resultsTimelineOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => field.onChange(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    field.value === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.label.split(' ')[0]}</div>
                  <div className="font-medium text-sm">{option.label.replace(/^[^ ]+ /, '')}</div>
                </button>
              ))}
            </div>
          )}
        />
        {errors.results_timeline && <p className="mt-2 text-sm text-red-600">{errors.results_timeline.message as string}</p>}
      </div>
      <div className="flex justify-between mt-8">
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
            'Finish & Optimize!'
          )}
        </button>
      </div>
    </form>
  );
} 