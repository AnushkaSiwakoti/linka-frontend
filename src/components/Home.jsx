import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SignUp from './SignUp';
import Login from './Login';
import './Home.css';

const Home = () => {
  const [isSignUp, setIsSignUp] = useState(true);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="home-container">
      <header className="header">
        <img src="logo.png" alt="Linka Logo" className="logo" />
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/dashboards" className="nav-link">My Dashboards</Link>
          <Link to="/build" className="nav-link">Build</Link>
        </nav>
      </header>

      <div className="main-content">
        <div className="form-container">
          {isSignUp ? (
            <>
              <SignUp />
              <p className="toggle-message">
                Already have an account?{' '}
                <button className="toggle-button" onClick={toggleForm}>
                  Log in
                </button>
              </p>
            </>
          ) : (
            <>
              <Login />
              <p className="toggle-message">
                Don't have an account?{' '}
                <button className="toggle-button" onClick={toggleForm}>
                  Sign up
                </button>
              </p>
            </>
          )}
        </div>

        <div className="right-content">
          <div className="welcome-message">Welcome to Linka!</div>
          <div className="shape shape1"></div>
          <div className="shape shape2"></div>
          <div className="shape triangle1"></div>
          <div className="shape shape3"></div>
          <div className="shape shape4"></div>
          <div className="shape shape5"></div>
          <div className="shape shape6"></div>
          <div className="shape shape7"></div>
          <div className="shape shape8"></div>
          <div className="shape shape9"></div>
          <div className="shape triangle2"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
