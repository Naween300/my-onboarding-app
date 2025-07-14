import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRef, useState } from 'react';

const schema = z.object({
  logo: z.any().optional(),
  brandColors: z.object({
    primary: z.string().min(1, 'Select a primary color'),
    secondary: z.string().min(1, 'Select a secondary color'),
  }),
  contactInfo: z.object({
    website: z.string().url('Enter a valid website').optional().or(z.literal('')),
    phone: z.string().optional(),
    socialHandles: z.string().optional(),
  }),
  socialMedia: z.object({
    facebook: z.enum(['none', 'some', 'active']),
    instagram: z.enum(['none', 'some', 'active']),
    linkedin: z.enum(['none', 'some', 'active']),
  }),
});

type Step5Form = z.infer<typeof schema>;

const colorSuggestions = [
  '#3B82F6', '#EF4444', '#F59E42', '#10B981', '#6366F1', '#F472B6', '#FBBF24', '#374151', '#6B7280', '#111827'
];

const socialOptions = [
  { value: 'none', label: '⚪ None' },
  { value: 'some', label: '🟡 Some' },
  { value: 'active', label: '🟢 Active' },
];

export function Step5BrandSetup({ data = {}, onSubmit, onBack, isCompleting = false }: any) {
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<Step5Form>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      logo: undefined,
      brandColors: { primary: '#3B82F6', secondary: '#EF4444' },
      contactInfo: { website: '', phone: '', socialHandles: '' },
      socialMedia: { facebook: 'none', instagram: 'none', linkedin: 'none' },
      ...data,
    },
  });

  const handleLogoChange = (file: File | null) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      alert('Supported formats: PNG, JPG, SVG. Max size: 5MB.');
      return;
    }
    setValue('logo', file, { shouldValidate: true });
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 5: Brand Setup</h2>
      {/* Logo upload */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-3">Upload logo</h3>
        <Controller
          name="logo"
          control={control}
          render={({ field }) => (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-all cursor-pointer relative bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={e => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) handleLogoChange(file);
              }}
            >
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo preview" className="mx-auto h-20 mb-2 rounded shadow" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-xs text-red-500 bg-white border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                    onClick={e => { e.stopPropagation(); setLogoPreview(null); setValue('logo', undefined, { shouldValidate: true }); }}
                  >Remove</button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="text-4xl mb-2">🖼️</div>
                  <div className="text-gray-600">Drag & drop your logo here, or click to browse</div>
                  <div className="text-xs text-gray-400 mt-1">Supported: PNG, JPG, SVG (max 5MB)</div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={e => handleLogoChange(e.target.files?.[0] || null)}
              />
            </div>
          )}
        />
        {errors.logo && <p className="mt-2 text-sm text-red-600">{errors.logo.message as string}</p>}
      </div>
      {/* Brand colors */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-3">Brand colors</h3>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Primary color */}
          <div className="flex-1">
            <div className="mb-1 text-xs text-gray-500">Primary</div>
            <div className="flex items-center gap-3">
              <Controller
                name="brandColors.primary"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      type="color"
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      className="w-28 px-2 py-1 border border-gray-300 rounded-md text-sm font-mono"
                      placeholder="#000000"
                      maxLength={7}
                    />
                  </>
                )}
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {colorSuggestions.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 ${watch('brandColors.primary') === color ? 'border-blue-500' : 'border-gray-200'}`}
                  style={{ background: color }}
                  onClick={() => setValue('brandColors.primary', color, { shouldValidate: true })}
                />
              ))}
            </div>
          </div>
          {/* Secondary color */}
          <div className="flex-1">
            <div className="mb-1 text-xs text-gray-500">Secondary</div>
            <div className="flex items-center gap-3">
              <Controller
                name="brandColors.secondary"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      type="color"
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      className="w-28 px-2 py-1 border border-gray-300 rounded-md text-sm font-mono"
                      placeholder="#000000"
                      maxLength={7}
                    />
                  </>
                )}
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {colorSuggestions.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 ${watch('brandColors.secondary') === color ? 'border-blue-500' : 'border-gray-200'}`}
                  style={{ background: color }}
                  onClick={() => setValue('brandColors.secondary', color, { shouldValidate: true })}
                />
              ))}
            </div>
          </div>
        </div>
        {errors.brandColors && <p className="mt-2 text-sm text-red-600">{errors.brandColors.message as string}</p>}
      </div>
      {/* Contact info */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-3">Contact info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="contactInfo.website"
            control={control}
            render={({ field }) => (
              <input
                type="url"
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...field}
              />
            )}
          />
          <Controller
            name="contactInfo.phone"
            control={control}
            render={({ field }) => (
              <input
                type="tel"
                placeholder="Phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...field}
              />
            )}
          />
          <Controller
            name="contactInfo.socialHandles"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                placeholder="@yourbusiness"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...field}
              />
            )}
          />
        </div>
      </div>
      {/* Social media grid */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-3">Current social media</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="socialMedia.facebook"
            control={control}
            render={({ field }) => (
              <div>
                <div className="mb-1 text-xs text-gray-500 capitalize">Facebook</div>
                <div className="flex gap-2">
                  {socialOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
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
              </div>
            )}
          />
          <Controller
            name="socialMedia.instagram"
            control={control}
            render={({ field }) => (
              <div>
                <div className="mb-1 text-xs text-gray-500 capitalize">Instagram</div>
                <div className="flex gap-2">
                  {socialOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
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
              </div>
            )}
          />
          <Controller
            name="socialMedia.linkedin"
            control={control}
            render={({ field }) => (
              <div>
                <div className="mb-1 text-xs text-gray-500 capitalize">LinkedIn</div>
                <div className="flex gap-2">
                  {socialOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
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
              </div>
            )}
          />
        </div>
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
            'Continue'
          )}
        </button>
      </div>
    </form>
  );
} 