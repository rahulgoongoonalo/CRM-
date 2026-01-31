import { RiMenuLine, RiSearchLine, RiNotification3Line, RiLogoutBoxLine } from 'react-icons/ri';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Logout clicked');
    logout();
    setShowDropdown(false);
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 100);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={onMenuClick}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <RiMenuLine className="text-2xl" />
          </button>
          <h2 className="text-white font-semibold text-sm md:text-base lg:hidden">CRM</h2>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search - Hidden on mobile */}
          <div className="relative w-32 md:w-48 lg:w-64 hidden sm:block">
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
          <button className="relative text-gray-400 hover:text-white hidden md:block">
            <RiNotification3Line className="text-2xl" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              1
            </span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 md:space-x-3 bg-blue-600 px-2 md:px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <div className="bg-blue-500 text-white font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center">
                {getInitials(user?.name)}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-white text-sm font-medium block">{user?.name || 'User'}</span>
                <span className="text-blue-200 text-xs capitalize">{user?.role || 'staff'}</span>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-[100] border border-gray-200">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors font-medium"
                >
                  <RiLogoutBoxLine className="text-lg" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
