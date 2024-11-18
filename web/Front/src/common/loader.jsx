import React from 'react';
import { BounceLoader } from 'react-spinners';

const Loader = ({ loading }) => {
  return (
    loading && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1500,  // Ensure it's beneath the modal
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <BounceLoader color="#000000" loading={loading} size={100} speedMultiplier={1} />
      </div>
    )
  );
};

export default Loader;
