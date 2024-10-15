import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Build from './components/Build';  // Import your Build component
import Dashboards from './components/Dashboards';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/build" element={<Build />} />  {/* Build route */}
        <Route path="/dashboards" element={<Dashboards/>}/>
      </Routes>
    </Router>
  );
}

export default App;
