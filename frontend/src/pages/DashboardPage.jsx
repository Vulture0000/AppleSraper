import React, { useState } from 'react';
import { 
  Laptop, 
  TrendingDown, 
  Target, 
  Tag, 
  Grid, 
  List, 
  Filter, 
  Search, 
  Sparkles,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import ProductCard from '../components/products/ProductCard';
import ProductTable from '../components/products/ProductTable';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/formatters';

export default function DashboardPage({
  summary,
  products = [],
  isLoading = false,
  onSelectProduct,
  onOpenThreshold,
  onOpenAddModal,
  onRefresh,
  isRefreshing = false,
  onDeleteProduct,
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'drops' | 'below_target' | 'retail' | 'edu'

  // Filter products based on search and selected tab
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.store.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterType === 'drops') {
      return p.priceChange && p.priceChange < 0;
    }
    if (filterType === 'below_target') {
      return p.thresholdReached;
    }
    if (filterType === 'retail') {
      return !p.store.toLowerCase().includes('edu');
    }
    if (filterType === 'edu') {
      return p.store.toLowerCase().includes('edu');
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            MacBook Air Intelligence
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time automated price tracking and alert engine for Apple Silicon M5 hardware
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          >
            Sync Prices
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddModal}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Track Model
          </Button>
        </div>
      </div>

      {/* KPI Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Tracked Products"
          value={summary ? summary.trackedProducts : products.length}
          subtitle="Active Apple configurations"
          icon={Laptop}
          variant="cyan"
        />

        <StatCard
          title="Price Drops"
          value={summary ? summary.priceDrops : products.filter(p => p.priceChange < 0).length}
          subtitle="Models with discounts"
          icon={TrendingDown}
          variant="emerald"
          trend={summary && summary.priceDrops > 0 ? { type: 'down', label: `${summary.priceDrops} Dropped` } : null}
        />

        <StatCard
          title="Below Target"
          value={summary ? summary.belowTarget : products.filter(p => p.thresholdReached).length}
          subtitle="Alert triggers ready"
          icon={Target}
          variant="purple"
        />

        <StatCard
          title="Lowest Price"
          value={summary && summary.lowestPrice ? formatCurrency(summary.lowestPrice) : '₹89,900'}
          subtitle={summary?.lowestProduct ? summary.lowestProduct.name.slice(0, 22) + '...' : 'Edu store discount'}
          icon={Tag}
          variant="amber"
        />
      </div>

      {/* Search, Filters, & View Toggle Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-2xl bg-surface/70 border border-surface-border backdrop-blur-xl">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by chip, memory, storage or store..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Models' },
            { id: 'drops', label: 'Price Drops' },
            { id: 'below_target', label: 'Below Target' },
            { id: 'retail', label: 'Retail Store' },
            { id: 'edu', label: 'Edu Store' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-200 ${
                filterType === tab.id
                  ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Toggle (Grid / Table) */}
        <div className="hidden sm:flex items-center bg-surface-subtle p-1 rounded-xl border border-surface-border shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-surface-card text-brand-cyan shadow-sm border border-surface-border'
                : 'text-text-muted hover:text-text-primary'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-surface-card text-brand-cyan shadow-sm border border-surface-border'
                : 'text-text-muted hover:text-text-primary'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Content: Grid or Table or Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <ProductCardSkeleton key={n} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No MacBook Air configurations found"
          description={
            searchQuery
              ? `No results match your search "${searchQuery}".`
              : "No products match the selected filter."
          }
          actionLabel="Add New Product"
          onAction={onOpenAddModal}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onOpenThreshold={onOpenThreshold}
            />
          ))}
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onSelect={onSelectProduct}
          onOpenThreshold={onOpenThreshold}
          onDelete={onDeleteProduct}
        />
      )}
    </div>
  );
}
