import React from 'react';
import { 
  BellRing, 
  CheckCircle2, 
  Mail, 
  Target, 
  Clock, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency, formatDateTime, timeAgo } from '../utils/formatters';

export default function AlertsPage({ alerts = [], isLoading = false }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight">
          Alerts & Dispatches
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Historical log of triggered threshold email alerts and price drop events
        </p>
      </div>

      {/* Alert Timeline */}
      {alerts.length === 0 ? (
        <EmptyState
          title="No Price Alerts Triggered Yet"
          description="When any MacBook Air configuration reaches or falls below its configured target price, an automated alert will be logged here and dispatched to your email."
          icon={BellRing}
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className="p-5 bg-surface/90 border-surface-border hover:border-emerald-500/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Left: Event Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald" size="sm" dot>
                      Price Target Reached
                    </Badge>
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3 text-text-dim" />
                      {timeAgo(alert.sentAt)} ({formatDateTime(alert.sentAt)})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary">
                    {alert.productName}
                  </h3>

                  {/* Price movement bar */}
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-text-secondary">Target: {formatCurrency(alert.thresholdPrice)}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-cyan" />
                    <span className="text-emerald-400 font-extrabold text-sm">
                      Hit: {formatCurrency(alert.price)}
                    </span>
                  </div>
                </div>

                {/* Right: Email Dispatch Status Pill */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0 self-start sm:self-center">
                  <Mail className="w-4 h-4" />
                  <span>Email Dispatched</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
