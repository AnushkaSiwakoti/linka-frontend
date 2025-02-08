import React, { useState, useEffect } from 'react';

const Login = ({ onSuccess, onSwitchToSignUp }) => {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState(''); 
 const [error, setError] = useState(null);

 const handleSubmit = async (event) => {
   event.preventDefault();
   try {
     const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verify-account/`, {
       method: 'POST',
       headers: { 
         'Content-Type': 'application/json',
         'Accept': 'application/json'
       },
       credentials: 'include', 
       body: JSON.stringify({ username, password })
     });

     const data = await response.json();
     if (response.ok) {
       localStorage.setItem('username', username);
       localStorage.setItem('sessionid', data.sessionid);
       onSuccess?.();
     } else {
       setError(data.error || 'Invalid credentials');
     }
   } catch (error) {
     setError('Server error. Please try again.');
   }
 };

  return (
    <div className="form-wrapper">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}
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
          <button type="submit" className="login-button">Login</button>
          <div className="toggle-message">
            Don't have an account?{' '}
            <button type="button" className="toggle-button" onClick={onSwitchToSignUp}>
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
 };
 
 export default Login;