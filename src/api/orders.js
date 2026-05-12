import api from './axios';

export const createOrder = (data) => api.post('/orders', data);
export const getBuyerOrders = () => api.get('/orders/my-orders');
export const getSellerOrders = () => api.get('/orders/seller-orders');
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
