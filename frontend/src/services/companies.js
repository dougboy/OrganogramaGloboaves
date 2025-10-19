import api from './api';

export const getCompanies = async () => {
  const { data } = await api.get('/api/companies');
  return data;
};

export const getCompanyWithPeople = async (id) => {
  const { data } = await api.get(`/api/companies/${id}`);
  return data;
};

export const createCompany = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  const { data } = await api.post('/api/companies', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateCompany = async (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  const { data } = await api.put(`/api/companies/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteCompany = async (id) => api.delete(`/api/companies/${id}`);

export const generateOrganogram = async (id) => {
  const { data } = await api.post(`/api/companies/${id}/generate`);
  return data;
};
