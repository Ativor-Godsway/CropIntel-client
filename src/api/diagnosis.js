import api from './axios';

export const createDiagnosis = (data) => api.post('/diagnosis', data);
export const getDiagnosisHistory = (params) => api.get('/diagnosis/history', { params });
export const getDiagnosis = (id) => api.get(`/diagnosis/${id}`);
