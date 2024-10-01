import './Login.css';
import React, { useState } from 'react';
import axios from 'axios';
import { ENV } from '../constants';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      username,
      password,
    };

    try {
      const baseURL = ENV.API_BASE_URL_8000; // Update with your backend base URL
      const response = await axios.post(`${baseURL}/verify-account/verify-account/`, formData);

      if (response.status === 200) {
        // Handle successful login (e.g., redirect to a different page, store user data, etc.)
        alert("Login successful!");
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert("Login failed! Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
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
