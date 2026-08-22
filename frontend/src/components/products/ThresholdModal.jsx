import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Target, CheckCircle2, Percent, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { updateProductThreshold } from '../../services/api';

export default function ThresholdModal({
  isOpen,
  onClose,
  product,
  onThresholdSaved,
}) {
  const [targetVal, setTargetVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      setTargetVal(product.thresholdPrice ? String(product.thresholdPrice) : '');
      setError(null);
    }
  }, [product]);

  if (!product) return null;

  const currentPriceNum = product.currentPrice ? parseFloat(product.currentPrice) : 0;
  const targetNum = targetVal ? parseFloat(targetVal.replace(/[^0-9.]/g, '')) : null;
  const isReached = targetNum && currentPriceNum > 0 && currentPriceNum <= targetNum;
  const savingsAmount = targetNum && currentPriceNum > targetNum ? currentPriceNum - targetNum : 0;
  const savingsPct = currentPriceNum > 0 && savingsAmount > 0 ? ((savingsAmount / currentPriceNum) * 100).toFixed(1) : 0;

  const handleApplyPreset = (percentDiscount) => {
    if (currentPriceNum > 0) {
      const discount = currentPriceNum * (percentDiscount / 100);
      const roundedTarget = Math.round((currentPriceNum - discount) / 500) * 500;
      setTargetVal(String(roundedTarget));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const cleanVal = targetVal ? parseFloat(targetVal.replace(/[^0-9.]/g, '')) : null;
      const updated = await updateProductThreshold(product.id, cleanVal);
      onThresholdSaved(updated);
      onClose();
    } catch (err) {
      setError('Failed to update threshold target.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Price Target"
      subtitle={`Set threshold alert for ${product.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Current Price vs Target Banner */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted font-medium">Current Store Price</span>
            <span className="text-sm font-extrabold font-mono text-text-primary">
              {formatCurrency(product.currentPrice, product.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted font-medium">All-Time Lowest</span>
            <span className="text-xs font-bold font-mono text-emerald-400">
              {formatCurrency(product.lowestPrice, product.currency)}
            </span>
          </div>
        </div>

        {/* Input Box */}
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            Your Target Price (₹)
          </label>
          <div className="relative">
            <input
              type="text"
              value={targetVal}
              onChange={(e) => setTargetVal(e.target.value)}
              placeholder="e.g. 95000"
              className="w-full pl-8 pr-3.5 py-3 rounded-xl bg-surface-card border border-surface-border text-base font-mono text-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan transition-all"
            />
            <span className="absolute left-3 top-3.5 text-text-dim font-mono">₹</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
            Quick Target Presets
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleApplyPreset(pct)}
                className="py-1.5 px-2 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-surface-border text-xs font-bold text-text-secondary hover:text-brand-cyan transition-colors"
              >
                -{pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Status / Savings Indicator */}
        {targetNum && (
          <div className="p-3 rounded-xl bg-surface-card/80 border border-surface-border text-xs">
            {isReached ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Target reached! Alert will be dispatched.</span>
              </div>
            ) : savingsAmount > 0 ? (
              <div className="flex items-center justify-between text-text-secondary">
                <span>Required Drop:</span>
                <span className="font-bold text-brand-purple font-mono">
                  -{formatCurrency(savingsAmount, product.currency)} (-{savingsPct}%)
                </span>
              </div>
            ) : null}
          </div>
        )}

        <p className="text-[11px] text-text-muted leading-relaxed">
          You will receive an automated email notification when the price reaches ₹{targetNum ? targetNum.toLocaleString('en-IN') : '...'} or lower.
        </p>

        {error && (
          <p className="text-xs text-rose-400">{error}</p>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Target className="w-4 h-4" />}
          >
            Save Target
          </Button>
        </div>
      </form>
    </Modal>
  );
}
