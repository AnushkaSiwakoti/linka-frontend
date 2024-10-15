import React from 'react';
import './Dashboards.css';

const Dashboards = () => {
  return (
    <div className="dashboards-container">
      <header className="header">
        <img src="logo.png" alt="Linka Logo" className="logo" />
        <nav className="nav">
          <a href="./" className="nav-link">Home</a>
          <a href="./build" className="nav-link">Build</a>
        </nav>
      </header>

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
