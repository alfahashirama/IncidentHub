import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import incidentService from '../services/incidentService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Récupère les statistiques
        const statsResponse = await incidentService.getStats();
        setStats(statsResponse.data);

        // Récupère les incidents récents (limités à 5)
        const incidentsResponse = await incidentService.getAll();
        setRecentIncidents(incidentsResponse.data.incidents.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fonction helper pour obtenir le badge de priorité
  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      critical: 'badge-critical'
    };
    return badges[priority] || 'badge-low';
  };

  // Fonction helper pour obtenir le badge de statut
  const getStatusBadge = (status) => {
    const badges = {
      open: 'badge-open',
      in_progress: 'badge-in-progress',
      resolved: 'badge-resolved',
      closed: 'badge-closed'
    };
    return badges[status] || 'badge-open';
  };

  // Fonction pour formater le statut
  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome section */}
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your incidents today.
            </p>
          </div>

          {/* Stats cards */}
          <div className="px-4 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total incidents */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats?.total || 0}
                    </p>
                  </div>
                  <div className="bg-primary-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Open incidents */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open</p>
                    <p className="text-3xl font-bold text-primary-600 mt-2">
                      {stats?.byStatus?.find(s => s.status === 'open')?.count || 0}
                    </p>
                  </div>
                  <div className="bg-primary-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* In Progress */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-3xl font-bold text-warning-600 mt-2">
                      {stats?.byStatus?.find(s => s.status === 'in_progress')?.count || 0}
                    </p>
                  </div>
                  <div className="bg-warning-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Resolved */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <p className="text-3xl font-bold text-success-600 mt-2">
                      {stats?.byStatus?.find(s => s.status === 'resolved')?.count || 0}
                    </p>
                  </div>
                  <div className="bg-success-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent incidents */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Incidents</h2>
                <Link to="/incidents" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all →
                </Link>
              </div>

              {recentIncidents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No incidents yet</p>
              ) : (
                <div className="space-y-4">
                  {recentIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {incident.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {incident.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`badge ${getPriorityBadge(incident.priority)}`}>
                              {incident.priority}
                            </span>
                            <span className={`badge ${getStatusBadge(incident.status)}`}>
                              {formatStatus(incident.status)}
                            </span>
                            {incident.assignedTo && (
                              <span className="text-xs text-gray-500">
                                Assigned to: {incident.assignedTo.firstName} {incident.assignedTo.lastName}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/incidents/${incident.id}`}
                          className="ml-4 text-primary-600 hover:text-primary-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;