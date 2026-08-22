import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cloud, 
  Mail, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Copy,
  ExternalLink
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { getMonitoringStatus } from '../services/api';

export default function SettingsPage() {
  const [statusData, setStatusData] = useState(null);
  const [copiedCmd, setCopiedCmd] = useState(null);

  useEffect(() => {
    getMonitoringStatus()
      .then(setStatusData)
      .catch((err) => console.error('Status fetch error:', err));
  }, []);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const cronCmd = '0 * * * * cd /path/to/backend && /path/to/venv/bin/python manage.py scrape_prices';
  const winCmd = 'powershell.exe -ExecutionPolicy Bypass -File "D:\\Ram\\AppleScrapper\\backend\\run_scraper.ps1"';
  const cliCmd = 'python manage.py scrape_prices';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight">
          System & Engine Settings
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Scraping pipeline, alert integrations, SQLite database status, and automation configuration
        </p>
      </div>

      {/* Integration Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bright Data Engine */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-brand-cyan" />
              <h3 className="font-bold text-sm text-text-primary">Bright Data Scraper</h3>
            </div>
            {statusData?.brightData?.configured ? (
              <Badge variant="emerald" size="sm" dot>Configured</Badge>
            ) : (
              <Badge variant="cyan" size="sm">Active (Local Fallback)</Badge>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Dataset ID:</span>
              <span className="font-mono text-text-primary">{statusData?.brightData?.datasetId || 'gd_ml87ng90wjb9sc1bi'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Mode:</span>
              <span className="text-text-primary">Batch Multi-URL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Custom Fields:</span>
              <span className="font-mono text-text-muted">title, description, price</span>
            </div>
          </div>

          <p className="text-[11px] text-text-dim pt-2 border-t border-surface-border/50">
            Set <code className="text-brand-cyan">BRIGHT_DATA_API_KEY</code> in <code className="text-text-secondary">.env</code> to route requests directly through your live Bright Data dataset.
          </p>
        </Card>

        {/* SQLite Database */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-text-primary">SQLite Engine</h3>
            </div>
            <Badge variant="emerald" size="sm" dot>Persistent</Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Database File:</span>
              <span className="font-mono text-text-primary">db.sqlite3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Active Monitors:</span>
              <span className="font-mono text-emerald-400 font-bold">{statusData?.activeMonitors || 6} models</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">ORM Layer:</span>
              <span className="text-text-primary">Django ORM</span>
            </div>
          </div>

          <p className="text-[11px] text-text-dim pt-2 border-t border-surface-border/50">
            Database automatically survives application and server restarts. No external database required.
          </p>
        </Card>

        {/* Email / SMTP Alerts */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand-purple" />
              <h3 className="font-bold text-sm text-text-primary">SMTP Alert Engine</h3>
            </div>
            {statusData?.emailAlerts?.configured ? (
              <Badge variant="emerald" size="sm" dot>Live</Badge>
            ) : (
              <Badge variant="amber" size="sm">Console Backend</Badge>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Alert Destination:</span>
              <span className="font-mono text-text-primary truncate max-w-[140px]">
                {statusData?.emailAlerts?.alertEmail || 'Configured in .env'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Format:</span>
              <span className="text-text-primary">Multi-part HTML</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Anti-Spam Filter:</span>
              <span className="text-emerald-400 font-bold">Enabled</span>
            </div>
          </div>

          <p className="text-[11px] text-text-dim pt-2 border-t border-surface-border/50">
            Configure <code className="text-brand-purple">EMAIL_HOST_USER</code> and <code className="text-brand-purple">ALERT_EMAIL</code> to dispatch alerts directly to your inbox.
          </p>
        </Card>
      </div>

      {/* Hourly Automation Scheduling Guide */}
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-text-primary">
            Hourly Scheduling & Automation
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            MacWatch can be triggered automatically every hour using native operating system schedulers or management commands.
          </p>
        </div>

        <div className="space-y-4">
          {/* Windows Task Scheduler */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-cyan" />
                Windows Task Scheduler Setup
              </span>
              <button
                onClick={() => copyToClipboard(cliCmd, 'cli')}
                className="text-xs text-text-muted hover:text-brand-cyan flex items-center gap-1 font-mono transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCmd === 'cli' ? 'Copied!' : 'Copy Command'}</span>
              </button>
            </div>
            <div className="p-3 rounded-lg bg-surface-card font-mono text-xs text-brand-cyan overflow-x-auto">
              {cliCmd}
            </div>
            <p className="text-[11px] text-text-muted">
              Create a basic task in Windows Task Scheduler set to recur hourly triggering <code className="text-text-primary">venv\Scripts\python.exe manage.py scrape_prices</code>.
            </p>
          </div>

          {/* Linux Cron Syntax */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-purple" />
                Linux / macOS Cron Job
              </span>
              <button
                onClick={() => copyToClipboard(cronCmd, 'cron')}
                className="text-xs text-text-muted hover:text-brand-cyan flex items-center gap-1 font-mono transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCmd === 'cron' ? 'Copied!' : 'Copy Cron'}</span>
              </button>
            </div>
            <div className="p-3 rounded-lg bg-surface-card font-mono text-xs text-brand-purple overflow-x-auto">
              {cronCmd}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
