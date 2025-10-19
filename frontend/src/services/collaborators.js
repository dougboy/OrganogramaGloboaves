import api from './api';

export const getCollaborators = async (companyId) => {
  const { data } = await api.get(`/api/companies/${companyId}/collaborators`);
  return data;
};

export const createCollaborator = async (companyId, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  const { data } = await api.post(`/api/companies/${companyId}/collaborators`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateCollaborator = async (companyId, collaboratorId, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  const { data } = await api.put(`/api/companies/${companyId}/collaborators/${collaboratorId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteCollaborator = async (companyId, collaboratorId) =>
  api.delete(`/api/companies/${companyId}/collaborators/${collaboratorId}`);
