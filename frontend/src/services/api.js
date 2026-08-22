import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary/');
  return response.data;
};

export const getProducts = async () => {
  const response = await api.get('/products/');
  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}/`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post('/products/', data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}/`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}/`);
  return response.data;
};

export const getProductHistory = async (id, range = 'all') => {
  const response = await api.get(`/products/${id}/history/?range=${range}`);
  return response.data;
};

export const updateProductThreshold = async (id, thresholdPrice) => {
  const response = await api.put(`/products/${id}/threshold/`, { thresholdPrice });
  return response.data;
};

export const getMonitoringStatus = async () => {
  const response = await api.get('/monitoring/status/');
  return response.data;
};

export const runMonitoringNow = async () => {
  const response = await api.post('/monitoring/run-now/');
  return response.data;
};

export const getAlerts = async () => {
  const response = await api.get('/alerts/');
  return response.data;
};

export default api;
