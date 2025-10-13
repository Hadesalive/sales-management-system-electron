'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import DashboardPage from '../app/dashboard';

export default function HomePage() {
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    
    if (!onboardingCompleted) {
      // Redirect to onboarding
      router.push('/onboarding');
    } else {
      setCheckingOnboarding(false);
    }
  }, [router]);

  if (checkingOnboarding) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  );
}