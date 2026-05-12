import api from './axios';

export const getSellerAnalytics = () => api.get('/analytics/seller');
