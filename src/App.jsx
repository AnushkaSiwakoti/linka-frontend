import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Build from './components/Build';  // Import your Build component
import Dashboards from './components/Dashboards';

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('username'); // Check if user is logged in
  return isLoggedIn ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Protect the Build route */}
        <Route 
          path="/build" 
          element={
            <ProtectedRoute>
              <Build />
            </ProtectedRoute>
          } 
        />
        {/* Protect the Dashboards route */}
        <Route 
          path="/dashboards" 
          element={
            <ProtectedRoute>
              <Dashboards />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
