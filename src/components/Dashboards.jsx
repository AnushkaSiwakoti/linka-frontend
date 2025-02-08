import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboards.css';
import Navbar from './Navbar';
import Footer from './Footer';

const Dashboards = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchDashboards();
  }, []);
  

  // Check for a stored username (or other indicator) and then fetch dashboards
  const checkAuthAndFetchDashboards = async () => {
    const loggedInUser = localStorage.getItem('username');
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    setIsLoggedIn(true);
    await fetchDashboards();
  };

  // Fetch dashboards from the backend; note that we send credentials (cookies)
  const fetchDashboards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/dashboards/list/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('username');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch dashboards');
      }

      const data = await response.json();
      setDashboards(data.dashboards);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      setError('Unable to load dashboards. Please refresh the page or try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Logout by removing the username from local storage and redirecting to login
  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Deploy dashboard: sends a POST request to deploy the dashboard
  const deployDashboard = async (dashboardId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/dashboards/deploy/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dashboard_id: dashboardId }),
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to deploy dashboard');
      }
  
      const data = await response.json();
      const deployedUrl = data.deployed_url;
      window.open(deployedUrl, '_blank');
    } catch (error) {
      console.error('Error deploying dashboard:', error);
      setError('Failed to deploy dashboard. Please try again.');
    }
  };

  // Open a dashboard: fetch the dashboard details and navigate to the build page
  const openDashboard = async (dashboardId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/dashboards/${dashboardId}/`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch dashboard');
      }

      const data = await response.json();
      navigate('/build', { 
        state: { 
          dashboardId,
          dashboardState: data.state, 
          dashboardName: data.name, 
          columns: data.columns, 
          data: data.data,
          isEditing: true
        } 
      });
    } catch (error) {
      console.error('Error opening dashboard:', error);
      setError('Unable to open dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a dashboard by sending a DELETE request
  const deleteDashboard = async (dashboardId) => {
    try {
      setDeleteInProgress(dashboardId);
      setError(null);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/dashboards/delete/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ dashboard_id: dashboardId }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to delete dashboard');
      }
      setDashboards((prevDashboards) =>
        prevDashboards.filter((dashboard) => dashboard.id !== dashboardId)
      );
      setIsConfirmingDelete(null);
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      setError('Failed to delete the dashboard. Please try again.');
    } finally {
      setDeleteInProgress(null);
    }
  };

  const handleDeleteClick = (dashboardId) => {
    setIsConfirmingDelete(dashboardId);
  };

  // Helper to format date strings
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render a single dashboard card
  const renderDashboardCard = (dashboard) => (
    <div key={dashboard.id} className="dashboard-card relative">
      <h3 className="dashboard-name">{dashboard.name}</h3>
      <div className="dashboard-preview">
        <p className="text-sm text-gray-600">
          Created: {formatDate(dashboard.created_at)}
        </p>
        <p className="text-sm text-gray-600">
          Updated: {formatDate(dashboard.updated_at)}
        </p>
      </div>
      <div className="dashboard-actions">
        <button
          className="open-dashboard-button"
          onClick={() => openDashboard(dashboard.id)}
          disabled={loading || deleteInProgress === dashboard.id}
        >
          {loading ? 'Opening...' : 'Edit Dashboard'}
        </button>
        <button
          className="deploy"
          onClick={() => deployDashboard(dashboard.id)}
          disabled={loading || deleteInProgress === dashboard.id}
        >
          {deleteInProgress === dashboard.id ? 'Deploying...' : 'Deploy'}
        </button>
        {isConfirmingDelete === dashboard.id ? (
          <div className="delete-confirmation">
            <p>Are you sure?</p>
            <button
              className="confirm-delete-button"
              onClick={() => deleteDashboard(dashboard.id)}
              disabled={deleteInProgress === dashboard.id}
            >
              {deleteInProgress === dashboard.id ? 'Deleting...' : 'Confirm Delete'}
            </button>
            <button
              className="cancel-delete-button"
              onClick={() => setIsConfirmingDelete(null)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="delete-dashboard-button"
            onClick={() => handleDeleteClick(dashboard.id)}
            disabled={deleteInProgress === dashboard.id}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <main className="flex-grow dashboards-container relative">
        <img 
          src="/shapes.png" 
          alt="background shapes" 
          className="background-image absolute inset-0 object-cover w-full h-full opacity-50"
        />
        <div className="dashboard-main-content relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="section-title text-2xl font-bold">My Dashboards</h1>
          </div>
          {error && (
            <div className="error-banner mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {loading && !error ? (
            <div className="loading-state p-4 text-center">
              <p>Loading your dashboards...</p>
            </div>
          ) : dashboards.length === 0 ? (
            <div className="empty-state p-8 text-center bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">No Dashboards Yet</h3>
              <p className="text-gray-600 mb-4">Create your first dashboard to get started!</p>
              <button
                onClick={() => navigate('/build')}
                className="create-first-dashboard-button"
              >
                Create Your First Dashboard
              </button>
            </div>
          ) : (
            <div className="dashboard-grid">
              {dashboards.map(renderDashboardCard)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboards;
