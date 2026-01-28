import { RiMenuLine, RiSearchLine, RiNotification3Line } from 'react-icons/ri';
import { useState } from 'react';

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuClick}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <RiMenuLine className="text-2xl" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative w-64">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-white text-sm pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notification Icon */}
          <button className="relative text-gray-400 hover:text-white">
            <RiNotification3Line className="text-2xl" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              1
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
            <div className="bg-blue-500 text-white font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center">
              AD
            </div>
            <span className="text-white text-sm font-medium">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
