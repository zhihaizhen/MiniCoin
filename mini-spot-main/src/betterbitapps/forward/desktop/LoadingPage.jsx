import React from 'react';

const LoadingPage = () => (
  <div
    style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: 'var(--text-tertiary)',
      backgroundColor: 'var(--bg-primary)',
    }}
  >
    Loading...
  </div>
);

export default LoadingPage;
