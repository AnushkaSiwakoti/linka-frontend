import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Send a POST request to the backend to handle logout
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/logout/`, {
        method: 'POST',
        credentials: 'include', // Include credentials so the backend can identify the session
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(), // Attach CSRF token if required
        },
      });

      if (!response.ok) {
        throw new Error('Failed to log out');
      }

      // Clear client-side storage (such as localStorage or sessionStorage)
      localStorage.removeItem('username');
      localStorage.removeItem('isAuthenticated');

      // Redirect to the home page after successful logout
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  // Helper function to get CSRF token from cookies
  const getCsrfToken = () => {
    const name = 'csrftoken';
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(name + '='))
      ?.split('=')[1];
    return cookieValue || '';
  };

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
