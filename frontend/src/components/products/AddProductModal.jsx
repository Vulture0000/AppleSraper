import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { PlusCircle, Sparkles, AlertCircle } from 'lucide-react';
import { createProduct } from '../../services/api';

export default function AddProductModal({
  isOpen,
  onClose,
  onProductAdded,
}) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid Apple product URL.');
      return;
    }

    if (!url.includes('apple.com')) {
      setError('Please provide an official Apple store link (e.g. apple.com/in/shop/...)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        url: url.trim(),
        name: name.trim() || undefined,
        targetPrice: targetPrice ? parseFloat(targetPrice.replace(/[^0-9.]/g, '')) : undefined,
      };

      const result = await createProduct(payload);
      onProductAdded(result);
      // Reset form
      setUrl('');
      setName('');
      setTargetPrice('');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to add product. Please check the URL and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Track New MacBook Air"
      subtitle="Paste an Apple Store URL to start automated price intelligence"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            Product URL <span className="text-rose-400">*</span>
          </label>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.apple.com/in/shop/buy-mac/macbook-air/..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan transition-all"
          />
          <p className="text-[11px] text-text-muted mt-1">
            Supports Apple India Retail & Apple Education Store product pages.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            Custom Product Name <span className="text-text-muted text-[10px] lowercase">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. MacBook Air M5 13-inch (Midnight 16GB)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            Target Price Alert Threshold (₹) <span className="text-text-muted text-[10px] lowercase">(optional)</span>
          </label>
          <input
            type="text"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="e.g. 95000"
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-text-primary text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan transition-all"
          />
          <p className="text-[11px] text-text-muted mt-1">
            An email alert will be sent automatically when price hits or falls below this target.
          </p>
        </div>

        <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
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
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {isLoading ? 'Scraping Initial Price...' : 'Start Monitoring'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
