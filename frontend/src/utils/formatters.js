/**
 * Format numeric amount into INR currency string: e.g. ₹99,900
 */
export function formatCurrency(amount, currency = 'INR') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(numeric);
}

/**
 * Format numeric amount with decimals: e.g. ₹99,900.00
 */
export function formatCurrencyDetailed(amount, currency = 'INR') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

/**
 * Format percentage change: e.g. -4.8%
 */
export function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val)) {
    return '0.0%';
  }
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

/**
 * Human-readable relative time: e.g. "5 mins ago", "just now"
 */
export function timeAgo(isoString) {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/**
 * Format full date time for charts and logs
 */
export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Extract chip and storage specs from product name or URL
 */
export function extractSpecs(name = '', url = '') {
  const text = `${name} ${url}`.toLowerCase();
  
  let chip = 'M5';
  if (text.includes('10-core') || text.includes('10 core')) {
    chip = 'M5 (10-Core GPU)';
  } else if (text.includes('8-core') || text.includes('8 core')) {
    chip = 'M5 (8-Core GPU)';
  }

  let memory = '16GB';
  if (text.includes('24gb')) {
    memory = '24GB';
  } else if (text.includes('8gb')) {
    memory = '8GB';
  } else if (text.includes('16gb')) {
    memory = '16GB';
  }

  let storage = '512GB SSD';
  if (text.includes('256gb')) {
    storage = '256GB SSD';
  } else if (text.includes('1tb')) {
    storage = '1TB SSD';
  } else if (text.includes('512gb')) {
    storage = '512GB SSD';
  }

  let storeType = 'Retail';
  if (text.includes('edu') || text.includes('in-edu')) {
    storeType = 'Education Store';
  }

  return { chip, memory, storage, storeType };
}
