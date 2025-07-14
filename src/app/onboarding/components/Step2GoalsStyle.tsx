'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema } from '@/lib/validations';
import { useState } from 'react';

// Product options
const productTypes = [
  { value: 'physical_goods', label: '🛍️ Physical goods' },
  { value: 'digital_products', label: '💻 Digital products' },
  { value: 'software_apps', label: '📱 Software/Apps' },
  { value: 'educational_materials', label: '📚 Educational materials' },
  { value: 'creative_assets', label: '🎨 Creative assets' },
  { value: 'food_beverages', label: '🍽️ Food/Beverages' },
  { value: 'fashion_apparel', label: '👕 Fashion/Apparel' },
  { value: 'home_goods', label: '🏠 Home goods' },
];
const productSalesChannels = [
  { value: 'physical_store', label: '🏪 Physical store' },
  { value: 'online_store', label: '🌐 Online store' },
  { value: 'mobile_app', label: '📱 Mobile app' },
  { value: 'marketplaces', label: '🛒 Marketplaces (Amazon, Etsy)' },
  { value: 'direct_sales', label: '📞 Direct sales' },
  { value: 'wholesale_b2b', label: '🤝 Wholesale/B2B' },
];
const customerPurchasePatterns = [
  { value: 'once', label: '💰 Once and done' },
  { value: 'regularly', label: '🔄 Regularly (repeat purchases)' },
  { value: 'bulk', label: '📦 In bulk/wholesale' },
  { value: 'seasonally', label: '🎁 Seasonally' },
  { value: 'subscription', label: '📅 On subscription' },
];
const productPriceRanges = [
  { value: 'under_25', label: '💵 Under $25' },
  { value: '25_100', label: '💰 $25-$100' },
  { value: '100_500', label: '💎 $100-$500' },
  { value: '500_plus', label: '🏆 $500+' },
  { value: 'varies', label: '📊 Varies widely' },
];
// Service options
const serviceTypes = [
  { value: 'consulting', label: '🤝 Consulting/Advisory' },
  { value: 'technical', label: '🔧 Technical services' },
  { value: 'creative', label: '🎨 Creative services' },
  { value: 'education', label: '📚 Education/Training' },
  { value: 'healthcare', label: '🏥 Healthcare services' },
  { value: 'professional', label: '💼 Professional services' },
  { value: 'home', label: '🏠 Home services' },
  { value: 'digital', label: '💻 Digital services' },
];
const serviceDeliveryMethods = [
  { value: 'in_person', label: '🏢 In-person/on-site' },
  { value: 'virtual', label: '💻 Virtual/online' },
  { value: 'phone', label: '📞 Phone consultations' },
  { value: 'video', label: '🎥 Video calls' },
  { value: 'mobile_app', label: '📱 Mobile app' },
  { value: 'at_location', label: '🏪 At your location' },
];
const serviceEngagementTypes = [
  { value: 'one_time', label: '⚡ One-time project' },
  { value: 'retainer', label: '🔄 Ongoing retainer' },
  { value: 'package', label: '📅 Package/program' },
  { value: 'hourly', label: '🎯 Hourly consultation' },
  { value: 'custom', label: '📊 Custom contracts' },
  { value: 'subscription', label: '🔄 Subscription model' },
];
const servicePriceRanges = [
  { value: 'under_500', label: '💵 Under $500' },
  { value: '500_2500', label: '💰 $500-$2,500' },
  { value: '2500_10000', label: '💎 $2,500-$10,000' },
  { value: '10000_plus', label: '🏆 $10,000+' },
  { value: 'varies', label: '📊 Varies by project' },
];
// Both
const productsServicesConnections = [
  { value: 'services_support_products', label: '🔗 Services support product sales' },
  { value: 'products_support_services', label: '📦 Products support service delivery' },
  { value: 'separate', label: '🎯 Completely separate offerings' },
  { value: 'bundled', label: '🔄 Bundled together' },
  { value: 'custom_products', label: '💡 Services create custom products' },
];

interface Step2Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export const Step2GoalsStyle = ({ data, onNext, onBack }: Step2Props) => {
  const businessOffering = data.business_offering;
  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      ...data,
      business_offering: data.business_offering,
    }
  });
  const formValues = watch();

  // Helper for multi-select
  const toggleMultiSelect = (field: string, value: string, max?: number) => {
    const arr = formValues[field] || [];
    if (arr.includes(value)) {
      setValue(field, arr.filter((v: string) => v !== value));
    } else if (!max || arr.length < max) {
      setValue(field, [...arr, value]);
      }
  };

  // Helper for single select
  const setSingleSelect = (field: string, value: string) => {
    setValue(field, value);
  };

  // Helper for slider
  const setSlider = (value: number) => {
    if (value < 33) setValue('primary_focus', 'mostly_products');
    else if (value > 66) setValue('primary_focus', 'mostly_services');
    else setValue('primary_focus', 'balanced');
  };

  const onSubmit = (values: any) => {
    onNext(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Offering Details</h2>
      {/* Products Section */}
      {businessOffering === 'products' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What type of products do you sell? <span className="text-gray-400">(Select up to 3)</span> *
            </label>
            <Controller
              name="product_types"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {productTypes.map(option => (
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
            {errors.product_types && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.product_types?.message?.toString()}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where do customers buy your products? *
            </label>
            <Controller
              name="product_sales_channels"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {productSalesChannels.map(option => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => {
                        const arr = field.value || [];
                        if (arr.includes(option.value)) {
                          field.onChange(arr.filter((v: string) => v !== option.value));
                        } else {
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
            {errors.product_sales_channels && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.product_sales_channels?.message?.toString()}
              </p>
            )}
          </div>
      <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your typical customer buys: *
            </label>
            <Controller
              name="customer_purchase_pattern"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {customerPurchasePatterns.map(option => (
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
            {errors.customer_purchase_pattern && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.customer_purchase_pattern?.message?.toString()}
              </p>
                    )}
                  </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product price range: *
            </label>
            <Controller
              name="product_price_range"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {productPriceRanges.map(option => (
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
            {errors.product_price_range && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.product_price_range?.message?.toString()}
              </p>
            )}
          </div>
        </div>
      )}
      {/* Services Section */}
      {businessOffering === 'services' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What type of services do you provide? <span className="text-gray-400">(Select up to 3)</span> *
            </label>
            <Controller
              name="service_types"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {serviceTypes.map(option => (
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
            {errors.service_types && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.service_types?.message?.toString()}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How do you deliver your services? *
            </label>
            <Controller
              name="service_delivery_methods"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {serviceDeliveryMethods.map(option => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => {
                        const arr = field.value || [];
                        if (arr.includes(option.value)) {
                          field.onChange(arr.filter((v: string) => v !== option.value));
                        } else {
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
            {errors.service_delivery_methods && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.service_delivery_methods?.message?.toString()}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your typical service engagement: *
            </label>
            <Controller
              name="service_engagement_type"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {serviceEngagementTypes.map(option => (
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
            {errors.service_engagement_type && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.service_engagement_type?.message?.toString()}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service price range: *
            </label>
            <Controller
              name="service_price_range"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {servicePriceRanges.map(option => (
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
            {errors.service_price_range && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.service_price_range?.message?.toString()}
              </p>
            )}
          </div>
        </div>
      )}
      {/* Both: Show all */}
      {businessOffering === 'both' && (
        <>
          <div className="space-y-6">
            {/* Product questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What type of products do you sell? <span className="text-gray-400">(Select up to 3)</span> *
              </label>
              <Controller
                name="product_types"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {productTypes.map(option => (
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
              {errors.product_types && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.product_types?.message?.toString()}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where do customers buy your products? *
              </label>
              <Controller
                name="product_sales_channels"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {productSalesChannels.map(option => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => {
                          const arr = field.value || [];
                          if (arr.includes(option.value)) {
                            field.onChange(arr.filter((v: string) => v !== option.value));
                          } else {
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
              {errors.product_sales_channels && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.product_sales_channels?.message?.toString()}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your typical customer buys: *
              </label>
              <Controller
                name="customer_purchase_pattern"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {customerPurchasePatterns.map(option => (
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
              {errors.customer_purchase_pattern && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.customer_purchase_pattern?.message?.toString()}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product price range: *
              </label>
              <Controller
                name="product_price_range"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {productPriceRanges.map(option => (
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
              {errors.product_price_range && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.product_price_range?.message?.toString()}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-6 mt-8">
            {/* Service questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What type of services do you provide? <span className="text-gray-400">(Select up to 3)</span> *
              </label>
              <Controller
                name="service_types"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {serviceTypes.map(option => (
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
              {errors.service_types && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.service_types?.message?.toString()}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How do you deliver your services? *
              </label>
              <Controller
                name="service_delivery_methods"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {serviceDeliveryMethods.map(option => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => {
                          const arr = field.value || [];
                          if (arr.includes(option.value)) {
                            field.onChange(arr.filter((v: string) => v !== option.value));
                          } else {
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
              {errors.service_delivery_methods && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.service_delivery_methods?.message?.toString()}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your typical service engagement: *
              </label>
              <Controller
                name="service_engagement_type"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {serviceEngagementTypes.map(option => (
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
              {errors.service_engagement_type && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.service_engagement_type?.message?.toString()}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service price range: *
              </label>
              <Controller
                name="service_price_range"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {servicePriceRanges.map(option => (
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
              {errors.service_price_range && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.service_price_range?.message?.toString()}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-6 mt-8">
            {/* Both: Primary Focus & Connection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your primary focus?
              </label>
              <Controller
                name="primary_focus"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={field.value === 'mostly_products' ? 0 : field.value === 'mostly_services' ? 100 : 50}
                    onChange={e => field.onChange(e.target.value)}
                    className="w-full"
                  />
                )}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>📦 Mostly Products</span>
                <span>🛠️ Mostly Services</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How do products and services connect?
              </label>
              <Controller
                name="products_services_connection"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {productsServicesConnections.map(option => (
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
              {errors.products_services_connection && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.products_services_connection?.message?.toString()}
                </p>
              )}
        </div>
      </div>
        </>
      )}
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
          className={`px-6 py-2 rounded-md font-semibold transition-all ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isValid}
        >
          Continue
        </button>
      </div>
    </form>
  );
};
 