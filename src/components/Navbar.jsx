import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, handleLogout }) => {
  return (
    <nav className="nav">
      <div className="nav-left">
        <img src="logo.png" alt="Linka Logo" className="logo" />
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/dashboards" className="nav-link">My Dashboards</Link>
        <Link to="/build" className="nav-link">Build</Link>
      </div>
      <div className="nav-right">
        {isLoggedIn && (
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
