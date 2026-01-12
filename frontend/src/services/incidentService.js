import api from './api';

const incidentService = {
  // Récupérer tous les incidents (avec filtres optionnels)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.createdBy) params.append('createdBy', filters.createdBy);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/incidents?${params.toString()}`);
    return response.data;
  },

  // Récupérer un incident par ID
  getById: async (id) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },

  // Créer un nouvel incident
  create: async (incidentData) => {
    const response = await api.post('/incidents', incidentData);
    return response.data;
  },

  // Mettre à jour un incident
  update: async (id, incidentData) => {
    const response = await api.put(`/incidents/${id}`, incidentData);
    return response.data;
  },

  // Supprimer un incident
  delete: async (id) => {
    const response = await api.delete(`/incidents/${id}`);
    return response.data;
  },

  // Obtenir les statistiques
  getStats: async () => {
    const response = await api.get('/incidents/stats/overview');
    return response.data;
  }
};

export default incidentService;