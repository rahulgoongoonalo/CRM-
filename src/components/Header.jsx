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
    <header className="bg-surface-light border-b border-border px-4 md:px-6 py-3 shadow-lg shadow-brand-primary/5">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={onMenuClick}
            className="text-text-muted hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-brand-primary/10"
          >
            <RiMenuLine className="text-2xl" />
          </button>
          <h2 className="text-text-primary font-bold text-sm md:text-base lg:hidden">CRM</h2>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search - Hidden on mobile */}
          <div className="relative w-32 md:w-48 lg:w-64 hidden sm:block">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-sm" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full text-sm pl-9 pr-4 py-2"
            />
          </div>

          {/* Notification Icon */}
          <button className="relative text-text-muted hover:text-text-primary hidden md:block p-2 rounded-lg hover:bg-brand-primary/10 transition-all">
            <RiNotification3Line className="text-2xl" />
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-brand-accent to-brand-highlight text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-lg">
              1
            </span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-brand-primary to-brand-secondary px-2 md:px-4 py-2 rounded-lg cursor-pointer hover:from-brand-secondary hover:to-brand-accent transition-all shadow-lg shadow-brand-primary/30"
            >
              <div className="bg-brand-accent text-white font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-white/20">
                {getInitials(user?.name)}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-white text-sm font-semibold block">{user?.name || 'User'}</span>
                <span className="text-white/80 text-xs capitalize font-medium">{user?.role || 'staff'}</span>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-card rounded-lg shadow-2xl shadow-brand-primary/20 py-2 z-[100] border border-border">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs text-text-muted font-medium">Signed in as</p>
                  <p className="text-sm font-semibold text-text-primary truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center space-x-2 transition-all font-semibold"
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
