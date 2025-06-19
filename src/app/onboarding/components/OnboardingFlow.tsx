'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Step1BusinessBasics } from './Step1BusinessBasics';
import { Step2GoalsStyle } from './Step2GoalsStyle';
import { Step3BrandSetup } from './Step3BrandSetup';
import { useOnboarding } from '@/hooks/useOnboarding';
import { DatabaseService } from '@/lib/database';

export const OnboardingFlow: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const totalSteps = 3;
  
  const {
    data,
    isLoading,
    error,
    updateData,
    saveStepData,
    saveCompleteData,
    loadFromDatabase,
    resetData
  } = useOnboarding();

  // Load existing data on component mount
  useEffect(() => {
    const savedId = localStorage.getItem('onboardingId');
    if (savedId) {
      console.log('📥 Loading existing onboarding data...');
      loadFromDatabase(savedId);
    }
  }, [loadFromDatabase]);

  // Test database connection
  useEffect(() => {
    const testDatabaseConnection = async () => {
      console.log('🔍 Testing database connection on component mount...');
      try {
        const isConnected = await DatabaseService.testConnection();
        if (!isConnected) {
          console.error('❌ Database connection failed');
        } else {
          console.log('✅ Database connection successful');
        }
      } catch (err) {
        console.error('❌ Database test error:', err);
      }
    };
    testDatabaseConnection();
  }, []);

  // Handle Step 1 advancement
  const handleStep1Next = async (step1Data: any) => {
    console.log('📝 Step 1 submitted with:', step1Data);
    
    try {
      updateData(step1Data);
      const success = await saveStepData(step1Data);
      
      if (success) {
        console.log('✅ Step 1 saved, advancing to Step 2');
        setCurrentStep(2);
      } else {
        console.error('❌ Failed to save Step 1 data');
      }
    } catch (error) {
      console.error('❌ Error in handleStep1Next:', error);
    }
  };

  // Handle Step 2 advancement
  const handleStep2Next = async (step2Data: any) => {
    console.log('📝 Step 2 submitted with:', step2Data);
    
    try {
      updateData(step2Data);
      const success = await saveStepData(step2Data);
      
      if (success) {
        console.log('✅ Step 2 saved, advancing to Step 3');
        setCurrentStep(3);
      } else {
        console.error('❌ Failed to save Step 2 data');
      }
    } catch (error) {
      console.error('❌ Error in handleStep2Next:', error);
    }
  };

  // Handle Step 2 back navigation
  const handleStep2Back = () => {
    console.log('⬅️ Going back to Step 1');
    setCurrentStep(1);
  };

  // ✅ ENHANCED: Handle final submission with proper router navigation
  const handleStep3Submit = async (step3Data: any) => {
    console.log('🏁 [OnboardingFlow] Final step submission with:', step3Data);
    setIsCompleting(true);
    
    try {
      // Update data state first
      updateData(step3Data);
      
      // Use saveCompleteData for final submission
      console.log('💾 [OnboardingFlow] Calling saveCompleteData for final submission...');
      const success = await saveCompleteData();
      console.log('📊 [OnboardingFlow] saveCompleteData result:', success);
      
      if (success) {
        console.log('✅ [OnboardingFlow] Onboarding completed successfully');
        
        // Store brand information for dashboard display
        const brandName = data.businessName || step3Data.businessName;
        if (brandName) {
          localStorage.setItem('brandName', brandName);
          localStorage.setItem('onboardingCompleted', 'true');
          localStorage.setItem('completionDate', new Date().toISOString());
          console.log('💾 [OnboardingFlow] Brand information stored for dashboard');
        }
        
        // ✅ ENHANCED: Multiple navigation methods for reliability
        console.log('🚀 [OnboardingFlow] Starting navigation to dashboard...');
        
        try {
          // Method 1: router.refresh + delay + router.push
          router.refresh();
          await new Promise(resolve => setTimeout(resolve, 100));
          await router.push('/dashboard?onboarding=completed');
          console.log('✅ [OnboardingFlow] Router.push completed');
        } catch (routerError) {
          console.error('❌ [OnboardingFlow] Router.push failed:', routerError);
          
          // Method 2: Fallback with window.location
          console.log('🔄 [OnboardingFlow] Using window.location fallback...');
          window.location.href = '/dashboard?onboarding=completed';
        }
        
        // Method 3: Additional safety fallback
        setTimeout(() => {
          if (window.location.pathname !== '/dashboard') {
            console.log('🔄 [OnboardingFlow] Final safety redirect...');
            window.location.replace('/dashboard?onboarding=completed');
          }
        }, 3000);
        
      } else {
        console.error('❌ [OnboardingFlow] saveCompleteData returned false');
        setIsCompleting(false);
      }
    } catch (error) {
      console.error('❌ [OnboardingFlow] Error in handleStep3Submit:', error);
      setIsCompleting(false);
    }
  };

  // Handle Step 3 back navigation
  const handleStep3Back = () => {
    console.log('⬅️ Going back to Step 2');
    setCurrentStep(2);
  };

  // Calculate progress percentage
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  // Render current step component
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BusinessBasics
            key="step-1"
            data={data}
            onNext={handleStep1Next}
          />
        );
      case 2:
        return (
          <Step2GoalsStyle
            key="step-2"
            data={data}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
          />
        );
      case 3:
        return (
          <Step3BrandSetup
            key="step-3"
            data={data}
            onSubmit={handleStep3Submit}
            onBack={handleStep3Back}
            isCompleting={isCompleting}
          />
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-red-600">Invalid step: {currentStep}</p>
            <button 
              onClick={() => setCurrentStep(1)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Go to Step 1
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Business Onboarding
          </h1>
          <p className="text-gray-600">
            Let's get your business set up in just 3 simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {progressPercentage}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    step < currentStep
                      ? 'bg-green-500 text-white'
                      : step === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    step <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step === 1 && 'Business Basics'}
                  {step === 2 && 'Goals & Style'}
                  {step === 3 && 'Brand Setup'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Indicator */}
        {(isLoading || isCompleting) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-600 text-sm">
                {isCompleting ? 'Completing your setup...' : 'Saving your progress...'}
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-400 text-xl mr-3">⚠️</div>
              <div>
                <p className="text-red-600 text-sm font-medium">Error occurred</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Completion Overlay */}
        {isCompleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Completing Your Setup
              </h3>
              <p className="text-gray-600">
                We're finalizing your brand setup and preparing your dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Current Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation Helper */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your progress is automatically saved as you go
          </p>
        </div>
      </div>
    </div>
  );
};
