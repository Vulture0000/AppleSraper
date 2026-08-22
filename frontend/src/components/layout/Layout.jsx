import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Toast from '../common/Toast';

export default function Layout({
  children,
  activeTab,
  onSelectTab,
  summary,
  products = [],
  alerts = [],
  isRefreshing,
  onRefresh,
  onOpenAddModal,
  toasts = [],
  onDismissToast,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Top Navbar */}
      <Navbar
        systemOnline={true}
        lastSync={summary?.lastSync}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        onOpenAddModal={onOpenAddModal}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        activeAlertsCount={summary?.recentAlertsCount || alerts.length}
        onNavigate={onSelectTab}
      />

      {/* Main Area: Sidebar + Page Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          productsCount={products.length}
          alertsCount={alerts.length}
        />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>

      {/* Global Toast Stack */}
      <Toast toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
}
