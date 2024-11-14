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
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('username');
    if (loggedInUser) {
      setIsLoggedIn(true);
    }
    fetchDashboards();
  }, []);

  // Fetch the list of dashboards from the backend
  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/dashboards/list/`, {
        method: 'GET',
        credentials: 'include', // To handle cookies
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboards');
      }

      const data = await response.json();
      setDashboards(data.dashboards);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      setError('Failed to load dashboards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
  };

  // Fetch the dashboard details and navigate to the Build component
  const openDashboard = async (dashboardId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/dashboards/${dashboardId}/`,
        {
          method: 'GET',
          credentials: 'include', // To handle cookies
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
      }

      const data = await response.json();
      // Navigate to the Build component and pass the dashboard state as location state
      navigate(`/build/${dashboardId}`, { state: { dashboardState: data.state, dashboardName: data.name } });
    } catch (error) {
      console.error('Error opening dashboard:', error);
      setError('Failed to load dashboard. Please try again.');
    }
  };

  // Handle deleting a dashboard
  const deleteDashboard = async (dashboardId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/dashboards/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // To handle cookies
        body: JSON.stringify({ dashboard_id: dashboardId }), // Sending the ID in the request body
      });

      if (!response.ok) {
        throw new Error('Failed to delete dashboard');
      }

      setDashboards((prevDashboards) =>
        prevDashboards.filter((dashboard) => dashboard.id !== dashboardId)
      );
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      setError('Failed to delete the dashboard. Please try again.');
    }
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <div className="dashboards-container">
        {/* Background Image */}
        <img src="/shapes.png" alt="background shapes" className="background-image" />
        {/* Main Content */}
        <div className="dashboard-main-content">
          <h1 className="section-title">My Dashboards</h1>

          {loading ? (
            <p>Loading dashboards...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : dashboards.length === 0 ? (
            <p>No dashboards found. Start by creating a new dashboard.</p>
          ) : (
            <div className="dashboard-list">
              {dashboards.map((dashboard) => (
                <div key={dashboard.id} className="dashboard-card">
                  <h3 className="dashboard-name">{dashboard.name}</h3>
                  <p className="dashboard-preview">
                    Created At: {new Date(dashboard.created_at).toLocaleString()}
                    <br />
                    Last Updated: {new Date(dashboard.updated_at).toLocaleString()}
                  </p>
                  <button
                    className="open-dashboard-button"
                    onClick={() => openDashboard(dashboard.id)}
                  >
                    Edit Dashboard
                  </button>
                  <button
                    className="delete-dashboard-button"
                    onClick={() => deleteDashboard(dashboard.id)}
                  >
                    Delete Dashboard
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboards;
