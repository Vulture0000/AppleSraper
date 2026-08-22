import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUpDown, Trash2, Sliders, ExternalLink } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ProductTable from '../components/products/ProductTable';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency, timeAgo, extractSpecs } from '../utils/formatters';

export default function ProductsPage({
  products = [],
  isLoading = false,
  onSelectProduct,
  onOpenThreshold,
  onOpenAddModal,
  onDeleteProduct,
}) {
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created'); // 'price_asc', 'price_desc', 'name', 'created'

  const filtered = products
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.store.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      if (storeFilter === 'retail') return !p.store.toLowerCase().includes('edu');
      if (storeFilter === 'edu') return p.store.toLowerCase().includes('edu');
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') {
        return (parseFloat(a.currentPrice) || 0) - (parseFloat(b.currentPrice) || 0);
      }
      if (sortBy === 'price_desc') {
        return (parseFloat(b.currentPrice) || 0) - (parseFloat(a.currentPrice) || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0; // default creation order
    });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            Monitored Products
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage tracked MacBook configurations, thresholds, and store sources
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Product
        </Button>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-surface/70 border border-surface-border backdrop-blur-xl">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter models..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
          />
        </div>

        {/* Store selector */}
        <div>
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
          >
            <option value="all">All Stores ({products.length})</option>
            <option value="retail">Apple India Retail</option>
            <option value="edu">Apple Education Store</option>
          </select>
        </div>

        {/* Sort selector */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
          >
            <option value="created">Sort: Default Order</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Products Table View */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Products Match"
          description="Try changing your search terms or filter selection."
          actionLabel="Add New Product"
          onAction={onOpenAddModal}
        />
      ) : (
        <ProductTable
          products={filtered}
          onSelect={onSelectProduct}
          onOpenThreshold={onOpenThreshold}
          onDelete={onDeleteProduct}
        />
      )}
    </div>
  );
}
