'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step3Schema } from '@/lib/validations';
import { useState } from 'react';
import { OnboardingData } from '@/lib/types';
import { StorageService } from '@/lib/storage';
import { DatabaseService } from '@/lib/database';

const colorSuggestions = [
  { name: 'Blue', value: '#3B82F6', description: 'Trust & Professional' },
  { name: 'Green', value: '#10B981', description: 'Growth & Nature' },
  { name: 'Purple', value: '#8B5CF6', description: 'Creative & Luxury' },
  { name: 'Red', value: '#EF4444', description: 'Energy & Passion' },
  { name: 'Orange', value: '#F97316', description: 'Friendly & Warm' },
  { name: 'Pink', value: '#EC4899', description: 'Playful & Modern' },
  { name: 'Indigo', value: '#6366F1', description: 'Deep & Sophisticated' },
  { name: 'Teal', value: '#14B8A6', description: 'Fresh & Balanced' },
  { name: 'Yellow', value: '#F59E0B', description: 'Optimistic & Bold' },
  { name: 'Slate', value: '#64748B', description: 'Professional & Clean' },
];

const budgetOptions = [
  { value: 100, label: '$100', description: 'Basic package' },
  { value: 250, label: '$250', description: 'Starter package' },
  { value: 500, label: '$500', description: 'Professional package' },
  { value: 1000, label: '$1,000', description: 'Premium package' },
  { value: 2000, label: '$2,000+', description: 'Enterprise package' },
];

interface Step3Props {
  data: Partial<OnboardingData>;
  onSubmit: (data: Partial<OnboardingData>) => void;
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
    resolver: zodResolver(step3Schema),
    mode: 'onChange',
    defaultValues: {
      contactInfo: data.contactInfo || {
        website: '',
        phone: '',
        socialHandles: ''
      },
      timeline: data.timeline || 'steady',
    },
  });

  const timeline = watch('timeline');

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
    setColors(prev => ({ ...prev, [type]: color }));
  };

  const getBudgetDescription = (value: number) => {
    const option = budgetOptions.find(opt => opt.value === value);
    return option?.description || 'Custom budget';
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Brand Setup</h2>
        
        {/* Enhanced Logo Upload with Drag & Drop */}
        <fieldset className="mb-8">
          <legend className="block text-sm font-medium text-gray-700 mb-4">
            Upload logo
          </legend>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : logo 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
              aria-label="Upload logo"
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              {logo ? (
                <div className="space-y-2">
                  <div className="text-green-600 text-3xl">✓</div>
                  <p className="text-sm font-medium text-green-600">
                    {logo.name}
                  </p>
                  <p className="text-xs text-gray-500">Click to change or drag a new file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl text-gray-400">📁</div>
                  <p className="text-sm font-medium text-gray-600">
                    Drag & drop your logo here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, SVG up to 10MB
                  </p>
                </div>
              )}
            </label>
          </div>
        </fieldset>

        {/* Brand Colors Picker */}
        <div className="mb-8">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-4">
              Brand colors
            </legend>
            {/* Color Suggestions */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Choose from our smart suggestions:</p>
              <div className="grid grid-cols-5 gap-3" role="radiogroup" aria-label="Color suggestions">
                {colorSuggestions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    role="radio"
                    aria-checked={colors.primary === color.value}
                    aria-label={color.name}
                    onClick={() => handleColorChange('primary', color.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center hover:shadow-md ${
                      colors.primary === color.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="text-xs font-medium text-gray-700">{color.name}</div>
                    <div className="text-xs text-gray-500">{color.description}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Custom Color Inputs */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="primaryColorHex" className="block text-xs font-medium text-gray-600 mb-1">
                      Primary Color Hex
                    </label>
                    <input
                      type="text"
                      id="primaryColorHex"
                      name="primaryColorHex"
                      value={colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      autoComplete="off"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={colors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="secondaryColorHex" className="block text-xs font-medium text-gray-600 mb-1">
                      Secondary Color Hex
                    </label>
                    <input
                      type="text"
                      id="secondaryColorHex"
                      name="secondaryColorHex"
                      value={colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      autoComplete="off"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#EF4444"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Color Preview */}
            <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">Color Preview:</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span className="text-sm text-gray-600">Primary</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: colors.secondary }}
                  />
                  <span className="text-sm text-gray-600">Secondary</span>
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Enhanced Contact Info */}
        <fieldset className="mb-8">
          <legend className="block text-sm font-medium text-gray-700 mb-4">
            Contact information
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="website" className="block text-xs font-medium text-gray-600 mb-1">
                Website
              </label>
              <input
                {...register('contactInfo.website')}
                id="website"
                name="website"
                type="url"
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yourwebsite.com"
              />
              {errors.contactInfo?.website && (
                <p className="mt-1 text-xs text-red-600">{errors.contactInfo.website.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-gray-600 mb-1">
                Phone
              </label>
              <input
                {...register('contactInfo.phone')}
                id="phone"
                name="phone"
                type="tel"
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <label htmlFor="socialHandles" className="block text-xs font-medium text-gray-600 mb-1">
                Social handles
              </label>
              <input
                {...register('contactInfo.socialHandles')}
                id="socialHandles"
                name="socialHandles"
                type="text"
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="@yourbrand"
              />
            </div>
          </div>
        </fieldset>

        {/* Budget Slider */}
        <div className="mb-8">
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-4">
            Monthly budget
          </label>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-blue-600">${budget.toLocaleString()}</span>
              <span className="text-sm text-gray-500">{getBudgetDescription(budget)}</span>
            </div>
            <input
              type="range"
              id="budget"
              name="budget"
              min="100"
              max="2000"
              step="50"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Results Timeline */}
        <fieldset className="mb-8">
          <legend className="block text-sm font-medium text-gray-700 mb-4">
            Results timeline
          </legend>
          <Controller
            name="timeline"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-4" role="radiogroup" aria-label="Results timeline">
                {[
                  { value: 'quick', label: 'Quick', icon: '🏃', description: '1-3 months', detail: 'Fast results, higher intensity' },
                  { value: 'steady', label: 'Steady', icon: '🚶', description: '3-6 months', detail: 'Balanced approach, sustainable growth' },
                  { value: 'long-term', label: 'Long-term', icon: '🏗️', description: '6+ months', detail: 'Strategic planning, lasting impact' },
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
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                    <div className="text-xs text-gray-400 mt-1">{option.detail}</div>
                  </button>
                ))}
              </div>
            )}
          />
          {errors.timeline && (
            <p className="mt-2 text-sm text-red-600">{errors.timeline.message}</p>
          )}
        </fieldset>

        {/* Data Summary Preview */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Setup Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-blue-700">
            <div>
              <p><strong>Business:</strong> {data.businessName}</p>
              <p><strong>Type:</strong> {data.businessType}</p>
              <p><strong>Budget:</strong> ${budget.toLocaleString()}</p>
            </div>
            <div>
              <p><strong>Timeline:</strong> {timeline}</p>
              <p><strong>Logo:</strong> {logo ? 'Uploaded' : 'Not uploaded'}</p>
              <p><strong>Colors:</strong> {colors.primary} / {colors.secondary}</p>
            </div>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">🔍 Step 3 Data Debug:</h4>
            <div className="text-sm text-red-700 space-y-1">
              <p><strong>Has Business Type:</strong> {data.businessType ? '✅ YES' : '❌ NO'} ({data.businessType})</p>
              <p><strong>Has Business Name:</strong> {data.businessName ? '✅ YES' : '❌ NO'} ({data.businessName})</p>
              <p><strong>Has Goals:</strong> {data.goals?.length ? '✅ YES' : '❌ NO'} ({data.goals?.length || 0} items)</p>
              <p><strong>Has Brand Personality:</strong> {data.brandPersonality?.length ? '✅ YES' : '❌ NO'} ({data.brandPersonality?.length || 0} items)</p>
              <p><strong>All Data Keys:</strong> {Object.keys(data).join(', ')}</p>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-red-800 font-medium">Show Full Data Object</summary>
              <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          disabled={isStepCompleting}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        
        {/* Update your Complete Setup button */}
        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Get current form data
            const currentFormData = {
              contactInfo: watch('contactInfo'),
              timeline: watch('timeline')
            };
            
            console.log('🖱️ [Step3] Complete Setup clicked');
            await handleFormSubmit(currentFormData);
          }}
          disabled={isStepCompleting}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
        >
          {isStepCompleting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Completing Setup...
            </div>
          ) : (
            '🚀 Complete Setup & Launch!'
          )}
        </button>
      </div>
    </form>
  );
};
