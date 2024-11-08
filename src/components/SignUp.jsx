// import React, { useState } from 'react';
// import './SignUp.css';

// const SignUp = ({ onSuccess, onSwitchToLogin }) => {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setError('');

//     if (password !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     try {
//       // First, create the account
//       const createResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/create-account/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ username, email, password }),
//         credentials: 'include', // Important for session cookies
//       });

//       const createData = await createResponse.json();
      
//       if (createResponse.ok) {
//         // If account creation was successful, immediately verify/login
//         const verifyResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verify-account/`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ username, password }),
//           credentials: 'include', // Important for session cookies
//         });

//         const verifyData = await verifyResponse.json();

//         if (verifyResponse.ok) {
//           // Store session information
//           localStorage.setItem('isAuthenticated', 'true');
//           localStorage.setItem('username', username);
//           localStorage.setItem('sessionId', verifyData.session_id);

//           // Clear sensitive form data
//           setPassword('');
//           setConfirmPassword('');
          
//           if (onSuccess) {
//             onSuccess({
//               username,
//               sessionId: verifyData.session_id
//             });
//           }
//         } else {
//           setError(verifyData.error || 'Login failed after account creation');
//         }
//       } else {
//         setError(createData.error || 'Unable to create an account. Please try again.');
//       }
//     } catch (error) {
//       setError(`Network error: ${error.message}`);
//     }
//   };

//   return (
//     <div className="form-wrapper">
//       <div className="signup-container">
//         <form className="signup-form" onSubmit={handleSubmit}>
//           <h2>Sign Up</h2>
//           {error && <div className="error-message">{error}</div>}
//           <div className="form-group">
//             <label htmlFor="username">Username</label>
//             <input
//               type="text"
//               id="username"
//               name="username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="email">Email</label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="password">Password</label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="confirm-password">Confirm Password</label>
//             <input
//               type="password"
//               id="confirm-password"
//               name="confirmPassword"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button type="submit" className="signup-button">
//             Sign Up
//           </button>
//           <div className="toggle-message">
//             Already have an account?{' '}
//             <button type="button" className="toggle-button" onClick={onSwitchToLogin}>
//               Log in
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SignUp;


import React, { useState } from 'react';
import './SignUp.css';

const SignUp = ({ onSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Create account
      const createResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/create-account/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include', // This enables sending and receiving cookies
      });

      const createData = await createResponse.json();
      
      if (createResponse.ok) {
        // Verify/login
        const verifyResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verify-account/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
          credentials: 'include', // This enables sending and receiving cookies
        });

        const verifyData = await verifyResponse.json();

        if (verifyResponse.ok) {
          // Only store non-sensitive authentication state
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('username', username);
          
          // Clear sensitive form data
          setPassword('');
          setConfirmPassword('');
          
          if (onSuccess) {
            onSuccess({ username });
          }
        } else {
          setError(verifyData.error || 'Login failed after account creation');
        }
      } else {
        setError(createData.error || 'Unable to create an account. Please try again.');
      }
    } catch (error) {
      setError(`Network error: ${error.message}`);
    }
  };

  return (
    <div className="form-wrapper">
      <div className="signup-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>
          {error && <div className="error-message">{error}</div>}
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
          <button type="submit" className="signup-button">
            Sign Up
          </button>
          <div className="toggle-message">
            Already have an account?{' '}
            <button type="button" className="toggle-button" onClick={onSwitchToLogin}>
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;