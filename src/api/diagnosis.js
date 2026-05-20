import api from './axios';

// POST /api/diagnosis/analyze — multipart/form-data with `cropImage` field
export const analyzeCrop = (formData) =>
  api.post('/diagnosis/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// POST /api/diagnosis/analyze-text — JSON { textDescription, cropType }
export const analyzeText = (data) =>
  api.post('/diagnosis/analyze-text', data);

// GET /api/diagnosis/history — paginated list for current user
export const getDiagnosisHistory = (params) =>
  api.get('/diagnosis/history', { params });

// GET /api/diagnosis/history/:id — single diagnosis detail (ownership-checked)
export const getDiagnosisById = (id) => api.get(`/diagnosis/history/${id}`);

// GET /api/diagnosis/:id — single diagnosis for detail view
export const getDiagnosis = (id) => api.get(`/diagnosis/${id}`);
