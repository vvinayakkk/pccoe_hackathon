import React from 'react';
import { Bell, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
  return (
    <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-xl font-bold">Communication Dashboard</h1>
      
      <div className="flex items-center gap-4">
        <button className="p-2 relative text-gray-500 hover:bg-gray-100 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button onClick={() => navigate('/voice')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg">
          <Mic className="h-4 w-4" />
          Start Voice Input
        </button>
      </div>
    </header>
  );
};

export default Header;