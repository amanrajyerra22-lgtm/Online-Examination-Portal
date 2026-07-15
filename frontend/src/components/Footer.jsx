import React from 'react';

export const Footer = () => {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '1.5rem 1rem',
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color)',
      color: 'var(--text-secondary)',
      fontSize: '0.85rem',
      backgroundColor: 'var(--bg-secondary)',
      backdropFilter: 'var(--glass-blur)',
      zIndex: 10
    }}>
      <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.2rem', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.5px' }}>
        VidyaSetu
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        Bridge to Knowledge
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>
        &copy; {new Date().getFullYear()} VidyaSetu. All rights reserved.
      </div>
    </footer>
  );
};
