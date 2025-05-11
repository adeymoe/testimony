import React from 'react';
import { Home, Heart } from 'lucide-react';

const Navbar = ({ onHomeClick }) => {
  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/30 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3 flex justify-around items-center gap-10 shadow-xl z-20">
      
      <button
        onClick={onHomeClick}
        className="flex flex-col items-center text-gray-200 hover:text-blue-400 transition duration-200"
      >
        <Home size={24} />
        <span className="text-[11px] mt-1 font-medium">Home</span>
      </button>

      <button
        className="flex flex-col items-center text-gray-200 hover:text-rose-400 transition duration-200"
      >
        <Heart size={24} />
        <span className="text-[11px] mt-1 font-medium">Donate</span>
      </button>

    </nav>
  );
};

export default Navbar;
