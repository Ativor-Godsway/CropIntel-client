import api from './axios';

export const initializePayment = (orderId) => api.post('/payments/initialize', { orderId });
export const verifyPayment = (reference) => api.get(`/payments/verify/${reference}`);
