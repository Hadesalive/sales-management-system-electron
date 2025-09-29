'use client';

import React, { Suspense } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { EmptyState } from '@/components/ui/core';

function OrdersContent() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <EmptyState
          title="Orders Coming Soon"
          description="Order management features will be available in the next update."
          icon="ClipboardDocumentListIcon"
        />
      </div>
    </AppLayout>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
