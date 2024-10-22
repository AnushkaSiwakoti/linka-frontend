import './Login.css';
import Navbar from './Navbar';
import React, { useState, useEffect } from 'react';

const Login = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // State for handling errors

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // reset error state before submission

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verify-account/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        localStorage.setItem('username', username); // Store username in localStorage
        onSuccess(); // Set login status to true after successful login
        // In the future, if need to, can redirect or do further processing here, like saving the token
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>} {/* Display any error */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;