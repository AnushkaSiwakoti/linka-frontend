import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import SignUp from './SignUp';
import Login from './Login';
import './Home.css';

const Home = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is already logged in
    const loggedInUser = localStorage.getItem('username');
    if (loggedInUser) {
      setIsLoggedIn(true);
    }
  }, []);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
  };

  return (
    <div className="home-container">
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <div className="main-content">
        <div className="form-container">
          {!isLoggedIn ? (
            isSignUp ? (
              <>
                <SignUp onSuccess={() => setIsLoggedIn(true)} />
                <p className="toggle-message">
                  Already have an account?{' '}
                  <button className="toggle-button" onClick={toggleForm}>
                    Log in
                  </button>
                </p>
              </>
            ) : (
              <>
                <Login onSuccess={() => setIsLoggedIn(true)} />
                <p className="toggle-message">
                  Don't have an account?{' '}
                  <button className="toggle-button" onClick={toggleForm}>
                    Sign up
                  </button>
                </p>
              </>
            )
          ) : (
            <div className="welcome-container">
              <h2>Welcome, {localStorage.getItem('username')}!</h2>
            </div>
          )}
        </div>

        <div className="right-content">
          <div className="welcome-box">
            <h1 className="welcome-header">Welcome to Linka!</h1>
            <p className="welcome-text">
              Linka simplifies the creation of custom dashboard builders, giving you the power to design, customize, and deploy in one streamlined step!
            </p>
          </div>

          {/* Decorative Shapes */}
          <div className="shape-container">
            <div className="shape shape1"></div>
            <div className="shape shape2"></div>
            <div className="shape triangle1"></div>
            <div className="shape shape3"></div>
            <div className="shape shape4"></div>
            <div className="shape shape5"></div>
            <div className="shape shape6"></div>
            <div className="shape square1"></div>
            <div className="shape square2"></div>
            <div className="shape square3"></div>
            <div className="shape shape7"></div>
            <div className="shape shape8"></div>
            <div className="shape shape9"></div>
            <div className="shape cylinder1"></div>
            <div className="shape cylinder2"></div>
            <div className="shape triangle2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;