'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const [brandName, setBrandName] = useState('');
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const storedBrandName = localStorage.getItem('brandName');
    if (storedBrandName) {
      setBrandName(storedBrandName);
    }
  }, []);

  const isFromOnboarding = searchParams.get('onboarding') === 'completed';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {isFromOnboarding && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            🎉 <strong>Welcome {brandName}!</strong> Your onboarding is complete!
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {brandName ? `${brandName} Dashboard` : 'Dashboard'}
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to your dashboard!</h2>
          <p className="text-gray-600">
            Your onboarding has been completed successfully. 
            Brand name: <strong>{brandName}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
