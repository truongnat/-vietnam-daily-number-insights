'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ViewToggle } from '@/components/ViewToggle';
import { FrequencyDashboard } from '@/components/FrequencyDashboard';
import { HistoricalLog } from '@/components/HistoricalLog';
import { TimeBasedDisplay } from '@/components/TimeBasedDisplay';
import { HistoricalDataManager } from '@/components/HistoricalDataManager';

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
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <HistoricalDataManager />
        <ViewToggle view={view} setView={setView} />
        {renderContent()}
      </main>
      <Footer groundingChunks={[]} />
    </div>
  );
}