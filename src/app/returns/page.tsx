'use client';

import React from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { EmptyState } from '@/components/ui/core';

export default function ReturnsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <EmptyState
          title="Returns Coming Soon"
          description="Return management features will be available in the next update."
          icon="ArrowPathIcon"
        />
      </div>
    </AppLayout>
  );
}
