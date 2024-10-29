import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import SignUp from './SignUp';
import Login from './Login';
import Footer from './Footer';
import './Home.css';

const Home = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('username');
    if (loggedInUser) {
      setIsLoggedIn(true);
    }
  }, []);

  const toggleForm = () => {
    setIsSignUp((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <Navbar className="navbar" isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      {/* Main Content */}
      <div className="home-main-content">
      <img src="/shapes.png" alt="background shapes" className="background-image" />
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
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
