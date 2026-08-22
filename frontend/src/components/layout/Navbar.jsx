import React, { useState } from 'react';
import { 
  Laptop, 
  RotateCw, 
  Plus, 
  Menu, 
  ShieldCheck,
  Bell,
  CheckCircle2,
  Cpu,
  Database,
  CloudLightning
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { timeAgo } from '../../utils/formatters';

export default function Navbar({
  systemOnline = true,
  lastSync = null,
  onRefresh,
  isRefreshing = false,
  refreshProgress = null, // { step: 1, text: 'Fetching Apple data', completed: false }
  onOpenAddModal,
  onToggleSidebar,
  activeAlertsCount = 0,
  onNavigate,
}) {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-surface-border/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile menu & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-glow-cyan/30">
              <div className="w-full h-full bg-surface rounded-[11px] flex items-center justify-center">
                <Laptop className="w-5 h-5 text-brand-cyan group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-text-primary">
                  MacWatch
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 uppercase">
                  M5 Air
                </span>
              </div>
              <p className="text-[11px] text-text-muted hidden sm:block">
                Price Intelligence System
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right Status & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live System Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-subtle/80 border border-surface-border text-xs">
            <span className={`w-2 h-2 rounded-full ${systemOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-rose-400'} animate-pulse`} />
            <span className="font-semibold text-text-primary">
              {systemOnline ? 'System Online' : 'Offline'}
            </span>
            <span className="text-text-dim">•</span>
            <span className="text-text-muted">
              Sync: {timeAgo(lastSync)}
            </span>
          </div>

          {/* Alert Notification Indicator */}
          <button
            onClick={() => onNavigate('alerts')}
            className="relative p-2.5 rounded-xl bg-surface-subtle hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-surface-border transition-colors"
            title="View Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow-md">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Refresh Prices Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            className="hidden sm:inline-flex shadow-sm hover:border-brand-cyan/40"
          >
            {isRefreshing ? 'Scraping...' : 'Refresh Prices'}
          </Button>

          {/* Add Product Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Interactive Scraping Progress Modal / Drawer */}
      <Modal
        isOpen={isRefreshing}
        onClose={() => {}} // Non-dismissible while active
        title="Refreshing Apple Prices"
        subtitle="Bright Data Web Scraper Engine active"
        maxWidth="max-w-md"
      >
        <div className="space-y-5 py-2">
          <div className="flex items-center justify-center p-6 bg-surface-subtle/50 rounded-2xl border border-surface-border">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-brand-cyan animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Laptop className="w-6 h-6 text-brand-cyan animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-surface-border">
              <CloudLightning className="w-4 h-4 text-brand-cyan animate-pulse shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-text-primary">1. Fetching Apple Store Data</p>
                <p className="text-text-muted">Querying Bright Data dataset for all active URLs...</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-surface-border">
              <Cpu className="w-4 h-4 text-brand-purple shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-text-primary">2. Processing & Normalizing Prices</p>
                <p className="text-text-muted">Parsing INR currency and calculating delta shifts...</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-surface-border">
              <Database className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-text-primary">3. Updating SQLite & Alert Engine</p>
                <p className="text-text-muted">Writing to PriceHistory and verifying thresholds...</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </header>
  );
}
