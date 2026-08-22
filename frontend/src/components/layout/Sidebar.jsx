import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  LineChart, 
  BellRing, 
  Settings, 
  Zap, 
  Database,
  ExternalLink,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  productsCount = 6,
  alertsCount = 0,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Layers, badge: productsCount },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: alertsCount > 0 ? alertsCount : null, badgeColor: 'rose' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-40 lg:z-20 h-screen lg:h-[calc(100vh-4rem)] w-64 glass-panel border-r border-surface-border/70 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-border lg:hidden">
            <span className="font-extrabold text-lg text-text-primary">Navigation</span>
            <button
              onClick={onClose}
              className="p-1 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-subtle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider px-3 mb-2">
              Price Intelligence
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/10 text-brand-cyan border border-brand-cyan/30 shadow-[0_0_15px_-3px_rgba(0,240,255,0.15)] font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-brand-cyan' : 'text-text-muted group-hover:text-text-primary'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor === 'rose'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-surface-card text-text-muted border border-surface-border'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Database & Scraper Info Box */}
        <div className="pt-4 border-t border-surface-border/50 space-y-3">
          <div className="p-3 rounded-xl bg-surface-card/60 border border-surface-border/80 text-xs">
            <div className="flex items-center justify-between text-text-muted mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-text-secondary">
                <Database className="w-3.5 h-3.5 text-brand-cyan" />
                SQLite DB
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-dim">
              <span>Scraper Engine</span>
              <span className="text-text-muted font-mono">Bright Data</span>
            </div>
          </div>

          <a
            href="https://www.apple.com/in/shop/buy-mac/macbook-air"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-text-muted hover:text-brand-cyan rounded-lg hover:bg-surface-subtle transition-colors group"
          >
            <span>Apple Store India</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </aside>
    </>
  );
}
