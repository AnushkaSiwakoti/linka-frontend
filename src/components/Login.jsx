import './Login.css';
import React, { useState } from 'react';
import axios from 'axios';
import { ENV } from '../constants';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // State for handling errors

  const handleSubmit = async (event) => {
    event.preventDefault();
<<<<<<< HEAD
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
=======
    setError(null); // Reset error state before submission

    try {
      const response = await fetch('http://127.0.0.1:8000/verify-account/', {
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
        // You can redirect or do further processing here, like saving the token
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Something went wrong. Please try again later.');
>>>>>>> f8e256d (updated login and signup)
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
