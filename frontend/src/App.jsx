import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import AddProductModal from './components/products/AddProductModal';
import ThresholdModal from './components/products/ThresholdModal';
import { 
  getProducts, 
  getDashboardSummary, 
  getAlerts, 
  runMonitoringNow, 
  deleteProduct 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [thresholdProduct, setThresholdProduct] = useState(null);
  
  const [toasts, setToasts] = useState([]);

  // Add toast notification helper
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString();
    const newToast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch initial application data
  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [productsData, summaryData, alertsData] = await Promise.all([
        getProducts(),
        getDashboardSummary(),
        getAlerts(),
      ]);
      setProducts(productsData);
      setSummary(summaryData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to load MacWatch data:', err);
      addToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not connect to Django backend. Ensure server is running at http://127.0.0.1:8000',
      });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // On-demand manual price refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate interactive stage timing for rich UI feel
      const res = await runMonitoringNow();
      await loadData(false);
      addToast({
        type: 'success',
        title: 'Prices Refreshed',
        message: `Successfully synced ${res.updated || products.length} MacBook configurations via Bright Data.`,
      });
    } catch (err) {
      console.error('Refresh error:', err);
      addToast({
        type: 'error',
        title: 'Scrape Notice',
        message: 'Unable to complete live scrape. Previous stored prices were preserved.',
      });
    } finally {
      // Small pause to let user see completion
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Product addition callback
  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    loadData(false);
    addToast({
      type: 'success',
      title: 'Product Monitored',
      message: `Started price intelligence for ${newProduct.name}.`,
    });
  };

  // Threshold updated callback
  const handleThresholdSaved = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    loadData(false);
    addToast({
      type: 'success',
      title: 'Target Configured',
      message: `Alert threshold updated to ₹${updatedProduct.thresholdPrice ? parseFloat(updatedProduct.thresholdPrice).toLocaleString('en-IN') : 'None'}`,
    });
  };

  // Delete product handler
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to stop monitoring this product?')) {
      return;
    }
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      loadData(false);
      addToast({
        type: 'info',
        title: 'Product Removed',
        message: 'Product removed from price monitoring.',
      });
      if (selectedProductId === id) {
        setActiveTab('dashboard');
        setSelectedProductId(null);
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Could not remove product.',
      });
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    setActiveTab('product-detail');
  };

  return (
    <Layout
      activeTab={activeTab}
      onSelectTab={(tab) => {
        setActiveTab(tab);
        if (tab !== 'product-detail') setSelectedProductId(null);
      }}
      summary={summary}
      products={products}
      alerts={alerts}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      onOpenAddModal={() => setIsAddModalOpen(true)}
      toasts={toasts}
      onDismissToast={dismissToast}
    >
      {/* Tab routing */}
      {activeTab === 'dashboard' && (
        <DashboardPage
          summary={summary}
          products={products}
          isLoading={isLoading}
          onSelectProduct={handleSelectProduct}
          onOpenThreshold={setThresholdProduct}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeTab === 'products' && (
        <ProductsPage
          products={products}
          isLoading={isLoading}
          onSelectProduct={handleSelectProduct}
          onOpenThreshold={setThresholdProduct}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeTab === 'product-detail' && selectedProductId && (
        <ProductDetailPage
          productId={selectedProductId}
          onBack={() => {
            setActiveTab('dashboard');
            setSelectedProductId(null);
          }}
          onOpenThresholdModal={setThresholdProduct}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsPage products={products} />
      )}

      {activeTab === 'alerts' && (
        <AlertsPage alerts={alerts} isLoading={isLoading} />
      )}

      {activeTab === 'settings' && (
        <SettingsPage />
      )}

      {/* Add Product Modal Dialog */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Set Threshold Modal Dialog */}
      <ThresholdModal
        isOpen={!!thresholdProduct}
        product={thresholdProduct}
        onClose={() => setThresholdProduct(null)}
        onThresholdSaved={handleThresholdSaved}
      />
    </Layout>
  );
}
