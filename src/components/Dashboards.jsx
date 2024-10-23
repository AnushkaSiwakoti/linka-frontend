import React from 'react';
import './Dashboards.css';
import Navbar from './Navbar';

const Dashboards = () => {
  return (
    <div className="dashboards-container">
      <Navbar isLoggedIn={true} handleLogout={() => {}} />
      <div className="main-content">
        <div className="dashboard-section">
          <h1 className="section-title">My Dashboards</h1>

          <div className="dashboard-list">
            <div className="dashboard-card">
              <h3 className="dashboard-name">Dashboard 1</h3>
              <p>Preview of the dashboard here</p>
            </div>

            <div className="dashboard-card">
              <h3 className="dashboard-name">Dashboard 2</h3>
              <p>Preview of the dashboard here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboards;