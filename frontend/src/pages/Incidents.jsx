import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import IncidentFilters from '../components/IncidentFilters';
import IncidentForm from '../components/IncidentForm';
import incidentService from '../services/incidentService';

const Incidents = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: ''
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Charger les incidents
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await incidentService.getAll(filters);
      setIncidents(response.data.incidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage et quand les filtres changent
  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  // Gérer les changements de filtre
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset filtres
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: ''
    });
  };

  // Créer un incident
  const handleCreate = async (formData) => {
    setFormLoading(true);
    try {
      await incidentService.create(formData);
      setIsCreateModalOpen(false);
      fetchIncidents(); // Recharger la liste
    } catch (error) {
      console.error('Error creating incident:', error);
      alert('Failed to create incident. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Ouvrir le modal d'édition
  const handleEditClick = (incident) => {
    setSelectedIncident(incident);
    setIsEditModalOpen(true);
  };

  // Mettre à jour un incident
  const handleUpdate = async (formData) => {
    setFormLoading(true);
    try {
      await incidentService.update(selectedIncident.id, formData);
      setIsEditModalOpen(false);
      setSelectedIncident(null);
      fetchIncidents(); // Recharger la liste
    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Failed to update incident. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Supprimer un incident
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this incident?')) {
      return;
    }

    try {
      await incidentService.delete(id);
      fetchIncidents(); // Recharger la liste
    } catch (error) {
      console.error('Error deleting incident:', error);
      alert('Failed to delete incident. Please try again.');
    }
  };

  // Helper functions
  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      critical: 'badge-critical'
    };
    return badges[priority] || 'badge-low';
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'badge-open',
      in_progress: 'badge-in-progress',
      resolved: 'badge-resolved',
      closed: 'badge-closed'
    };
    return badges[status] || 'badge-open';
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Vérifier les permissions
  const canEditIncident = (incident) => {
    // Admin et Manager peuvent tout modifier
    if (['admin', 'manager'].includes(user.role)) {
      return true;
    }
    // Le créateur peut modifier
    if (incident.createdById === user.id) {
      return true;
    }
    // L'assigné peut modifier le statut (on gérera ça dans le formulaire)
    if (incident.assignedToId === user.id) {
      return true;
    }
    return false;
  };

  const canDeleteIncident = (incident) => {
    // Seuls admin, manager et le créateur peuvent supprimer
    return ['admin', 'manager'].includes(user.role) || incident.createdById === user.id;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 sm:px-0 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Incidents</h1>
                <p className="mt-2 text-gray-600">
                  Manage and track all incidents
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Incident
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 sm:px-0">
            <IncidentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Incidents list */}
          <div className="px-4 sm:px-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : incidents.length === 0 ? (
              <div className="card text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No incidents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new incident.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn btn-primary"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Incident
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {incident.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {incident.description}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`badge ${getPriorityBadge(incident.priority)}`}>
                            {incident.priority}
                          </span>
                          <span className={`badge ${getStatusBadge(incident.status)}`}>
                            {formatStatus(incident.status)}
                          </span>
                        </div>

                        {/* Meta info */}
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>
                            <span className="font-medium">Created by:</span>{' '}
                            {incident.creator?.firstName} {incident.creator?.lastName}
                            {' · '}
                            {formatDate(incident.createdAt)}
                          </p>
                          {incident.assignedTo && (
                            <p>
                              <span className="font-medium">Assigned to:</span>{' '}
                              {incident.assignedTo.firstName} {incident.assignedTo.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-4 flex items-center space-x-2">
                        {canEditIncident(incident) && (
                          <button
                            onClick={() => handleEditClick(incident)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit incident"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {canDeleteIncident(incident) && (
                          <button
                            onClick={() => handleDelete(incident.id)}
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            title="Delete incident"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Incident"
      >
        <IncidentForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedIncident(null);
        }}
        title="Edit Incident"
      >
        <IncidentForm
          incident={selectedIncident}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedIncident(null);
          }}
          loading={formLoading}
        />
      </Modal>
    </>
  );
};

export default Incidents;