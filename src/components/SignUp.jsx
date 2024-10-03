<<<<<<< HEAD
=======
import './SignUp.css';
>>>>>>> f8e256d (updated login and signup)
import React, { useState } from 'react';
import './SignUp.css';
import axios from 'axios';
import { ENV } from '../constants';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
<<<<<<< HEAD
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    const formData = {
      username,
      email,
      password,
    };

    try {
      const baseURL = ENV.API_BASE_URL_8000; // Update with your backend base URL
      const response = await axios.post(`${baseURL}/create-account/create-account/`, formData);

      if (response.status === 201) {
        alert("Successfully signed up! You may now log in.");
        navigate('/login'); // Redirect to login page after successful signup
      }
    } catch (error) {
      console.error('Error signing up:', error);
      alert("Error Signing Up!");
=======
    
    // Simple password match validation
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/create-account/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message); 
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
>>>>>>> f8e256d (updated login and signup)
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button className='signup-button'>Sign Up</button>
      </form>
    </div>
  );
};

<<<<<<< HEAD
export default SignUp;
=======
export default SignUp;
>>>>>>> f8e256d (updated login and signup)
