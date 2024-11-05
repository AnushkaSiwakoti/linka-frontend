import React, { useState, useEffect } from 'react';
import './Dashboards.css';
import Navbar from './Navbar';
import Footer from './Footer';

const Dashboards = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('username');
    if (loggedInUser) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
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
          <div className="dashboard-list">
            <div className="dashboard-card">
              <h3 className="dashboard-name">Dashboard 1</h3>
              <p className="dashboard-preview">Preview of the dashboard here</p>
            </div>

            <div className="dashboard-card">
              <h3 className="dashboard-name">Dashboard 2</h3>
              <p className="dashboard-preview">Preview of the dashboard here</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Dashboards;
