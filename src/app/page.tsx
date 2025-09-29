'use client';

import React from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import DashboardPage from '../app/dashboard';

export default function HomePage() {
  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  );
}