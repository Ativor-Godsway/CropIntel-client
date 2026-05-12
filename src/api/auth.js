import api from './axios';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const refreshToken = () => api.post('/auth/refresh-token');
export const sendOtp = (phone) => api.post('/auth/send-otp', { phone });
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const toggleRole = () => api.patch('/auth/toggle-role');
export const updateProfile = (data) => api.patch('/auth/profile', data);
