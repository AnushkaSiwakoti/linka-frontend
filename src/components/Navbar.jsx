import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={styles.nav}>
      <div>
        <h1 style={styles.brand}>Linka</h1>
      </div>
      <div style={styles.navLinks}>
        <Link to="/login" style={styles.link}>
          <button style={styles.button}>Login</button>
        </Link>
        <Link to="/signup" style={styles.link}>
          <button style={styles.button}>Sign Up</button>
        </Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    color: '#fff',
    padding: '1rem',
  },
  brand: {
    margin: 0,
  },
  navLinks: {
    display: 'flex',
    gap: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    border: 'none',
    backgroundColor: '#fff',
    color: '#333',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  link: {
    textDecoration: 'none',
  },
};

export default Navbar;
