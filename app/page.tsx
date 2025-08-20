'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ViewToggle } from '@/components/ViewToggle';
import { FrequencyDashboard } from '@/components/FrequencyDashboard';
import { HistoricalLog } from '@/components/HistoricalLog';
import { TimeBasedDisplay } from '@/components/TimeBasedDisplay';
import { XSMBResults } from '@/components/XSMBResults';

export default function Page() {
  const [view, setView] = useState<'realtime' | 'frequency' | 'history'>('realtime');

  const renderContent = () => {
    switch(view) {
      case 'realtime':
        return <TimeBasedDisplay />;
      case 'frequency':
        return <FrequencyDashboard />;
      case 'history':
        return <HistoricalLog />;
      default:
        return <TimeBasedDisplay />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center">
        <ViewToggle view={view} setView={setView} />
        <div className="w-full">
          {renderContent()}
        </div>
        {/* XSMB Results Section - Always visible below main content */}
        <div className="w-full mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700">
          <XSMBResults />
        </div>
        {/* LocalStorage Export/Import Section - always at the bottom of main */}
        <div className="w-full mt-8 flex justify-center">
          {/* Only show on client side */}
          {typeof window !== 'undefined' && (
            <div className="max-w-md w-full">
              {/* Dynamically import to avoid SSR issues */}
              {React.createElement(require('@/components/LocalStorageExportImport').default)}
            </div>
          )}
        </div>
      </main>
      <Footer groundingChunks={[]} />
    </div>
  );
}