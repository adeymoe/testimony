import React from 'react';

const Spinner = () => (
  <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
  </div>
);

export default Spinner;
