import { OnboardingFlow } from './components/OnboardingFlow'; // ✅ Correct path
import { Suspense } from 'react';

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading onboarding...</div>}>
      <OnboardingFlow />
    </Suspense>
  );
}
