import { NavLink, useNavigate } from 'react-router-dom';
import { RiDashboardLine, RiUserLine, RiUserAddLine, RiBarChartLine, RiMegaphoneLine, RiSettings4Line, RiLogoutBoxLine, RiMusicLine, RiCloseLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    console.log('Sidebar logout clicked');
    logout();
    navigate('/login', { replace: true });
  };

  const handleNavClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  const navItems = [
    { path: '/', icon: RiDashboardLine, label: 'Dashboard' },
    { path: '/members', icon: RiUserLine, label: 'Member Management' },
    { path: '/onboarding', icon: RiUserAddLine, label: 'Onboarding' },
    { path: '/reporting', icon: RiBarChartLine, label: 'Reporting' },
    { path: '/campaigns', icon: RiMegaphoneLine, label: 'Campaigns' },
  ];

  return (
    <div className={`bg-slate-800 min-h-screen flex flex-col text-gray-300 transition-all duration-300 ${
      isMobile 
        ? `fixed inset-y-0 left-0 z-50 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        : isOpen ? 'w-64' : 'w-20'
    }`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <RiMusicLine className="text-2xl text-white" />
            </div>
            {(isOpen || isMobile) && (
              <div>
                <h1 className="text-xl font-bold text-white">Artists</h1>
                <p className="text-xs text-gray-400">Management Portal</p>
              </div>
            )}
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <RiCloseLine className="text-2xl" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <item.icon className="text-xl" />
            {(isOpen || isMobile) && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-slate-700">
        <NavLink
          to="/settings"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-6 py-3 transition-colors ${
              isActive
                ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                : 'text-gray-300 hover:bg-slate-700 hover:text-white'
            }`
          }
        >
          <RiSettings4Line className="text-xl" />
          {(isOpen || isMobile) && <span className="text-sm font-medium">Settings</span>}
        </NavLink>
        
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-6 py-3 w-full text-gray-300 hover:bg-slate-700 hover:text-white transition-colors text-left"
        >
          <RiLogoutBoxLine className="text-xl" />
          {(isOpen || isMobile) && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
