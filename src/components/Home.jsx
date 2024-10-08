import React from 'react';

function Home() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Welcome to Linka(hehe)</h2>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
  },
};

export default Home;
