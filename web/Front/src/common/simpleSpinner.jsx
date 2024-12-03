import React from 'react';

const SimpleSpinner = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1500,
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #ccc',
        borderTop: '5px solid #000',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SimpleSpinner;
