'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema } from '@/lib/validations';
import { useState } from 'react';

const goalOptions = [
  { id: 'brand-awareness', label: 'Brand awareness', icon: '📈' },
  { id: 'generate-leads', label: 'Generate leads', icon: '🎯' },
  { id: 'direct-sales', label: 'Direct sales', icon: '💰' },
  { id: 'build-relationships', label: 'Build relationships', icon: '🤝' },
  { id: 'thought-leadership', label: 'Thought leadership', icon: '🧠' },
  { id: 'customer-support', label: 'Customer support', icon: '🛠️' },
];

const personalityOptions = [
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'friendly', label: 'Friendly', icon: '😊' },
  { id: 'creative', label: 'Creative', icon: '🎨' },
  { id: 'innovative', label: 'Innovative', icon: '🚀' },
  { id: 'authentic', label: 'Authentic', icon: '🌱' },
  { id: 'premium', label: 'Premium', icon: '✨' },
];

interface Step2Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export const Step2GoalsStyle = ({ data, onNext, onBack }: Step2Props) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    data.goals || data.selectedGoals || []
  );
  const [selectedPersonality, setSelectedPersonality] = useState<string[]>(
    data.brand_personality || data.brandPersonality || data.selectedPersonality || []
  );
  const [socialMedia, setSocialMedia] = useState(
    data.social_media_presence || data.socialMediaPresence || data.socialMedia || {
      facebook: 'none',
      instagram: 'none',
      linkedin: 'none',
    }
  );

  const { handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(step2Schema),
  });

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else if (prev.length < 3) {
        return [...prev, goalId];
      }
      return prev;
    });
  };

  const togglePersonality = (personalityId: string) => {
    setSelectedPersonality(prev => {
      if (prev.includes(personalityId)) {
        return prev.filter(id => id !== personalityId);
      } else {
        return [...prev, personalityId];
      }
    });
  };

  const updateSocialMedia = (platform: string, level: string) => {
    setSocialMedia((prev: typeof socialMedia) => ({
      ...prev,
      [platform]: level,
    }));
  };

  const onSubmit = () => {
    // Transform data to match Supabase schema
    const transformedData = {
      goals: selectedGoals,
      brand_personality: selectedPersonality,
      social_media_presence: socialMedia,
      // Keep original format for component state
      selectedGoals,
      brandPersonality: selectedPersonality,
      socialMediaPresence: socialMedia,
    };
    onNext(transformedData);
  };

  // Keep your original JSX design from paste-2.txt exactly as is
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-8"
    >
      {/* Your existing JSX from paste-2.txt goes here */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Goals & Style</h2>
        
        {/* Goals Selection */}
        <div className="mb-8">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-4">
              Top 3 goals (drag to rank or click to select)
            </legend>
            <div className="grid grid-cols-2 gap-3" role="group">
              {goalOptions.map((goal, index) => (
                <button
                  key={goal.id}
                  type="button"
                  aria-pressed={selectedGoals.includes(goal.id)}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedGoals.includes(goal.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{goal.icon}</span>
                    <span className="font-medium">{goal.label}</span>
                    {selectedGoals.includes(goal.id) && (
                      <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {selectedGoals.indexOf(goal.id) + 1}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Selected: {selectedGoals.length}/3
            </p>
            {selectedGoals.length === 0 && (
              <p className="mt-2 text-sm text-red-600">Please select at least 1 goal</p>
            )}
          </fieldset>
        </div>

        {/* Brand Personality */}
        <div className="mb-8">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-4">
              Brand personality (select multiple)
            </legend>
            <div className="flex flex-wrap gap-3" role="group">
              {personalityOptions.map((personality) => (
                <button
                  key={personality.id}
                  type="button"
                  aria-pressed={selectedPersonality.includes(personality.id)}
                  onClick={() => togglePersonality(personality.id)}
                  className={`px-4 py-2 rounded-full border-2 transition-all duration-200 ${
                    selectedPersonality.includes(personality.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{personality.icon}</span>
                  {personality.label}
                </button>
              ))}
            </div>
            {selectedPersonality.length === 0 && (
              <p className="mt-2 text-sm text-red-600">Please select at least 1 personality trait</p>
            )}
          </fieldset>
        </div>

        {/* Social Media Presence */}
        <div className="mb-8">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-4">
              Current social media presence
            </legend>
            <div className="space-y-4">
              {[
                { platform: 'facebook', label: 'Facebook', icon: '📘' },
                { platform: 'instagram', label: 'Instagram', icon: '📷' },
                { platform: 'linkedin', label: 'LinkedIn', icon: '💼' },
              ].map(({ platform, label, icon }) => (
                <fieldset key={platform} className="flex items-center space-x-4">
                  <legend className="flex items-center space-x-2 w-32 mb-0">
                    <span>{icon}</span>
                    <span className="font-medium">{label}:</span>
                  </legend>
                  <div className="flex space-x-2" role="radiogroup" aria-label={label}>
                    {['none', 'some', 'active'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        role="radio"
                        aria-checked={socialMedia[platform as keyof typeof socialMedia] === level}
                        aria-label={level}
                        onClick={() => updateSocialMedia(platform, level)}
                        className={`px-3 py-1 rounded-full text-sm capitalize transition-all duration-200 ${
                          socialMedia[platform as keyof typeof socialMedia] === level
                            ? level === 'none' ? 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                              : level === 'some' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                              : 'bg-green-100 text-green-700 border-2 border-green-300'
                            : 'bg-gray-50 text-gray-500 border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {level === 'none' ? '⚪' : level === 'some' ? '🟡' : '🟢'} {level}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Continue
        </button>
      </div>
    </form>
  );
};
