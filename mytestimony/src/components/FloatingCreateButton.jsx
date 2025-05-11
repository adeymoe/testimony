import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const FloatingCreateButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/create')}
      className="fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition duration-300 z-50"
      aria-label="Create Testimony"
    >
      <Plus size={24} />
    </button>
  );
};

export default FloatingCreateButton;
