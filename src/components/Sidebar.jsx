import { NavLink } from 'react-router-dom';
import { RiDashboardLine, RiUserLine, RiUserAddLine, RiBarChartLine, RiMegaphoneLine, RiSettings4Line, RiLogoutBoxLine, RiMusicLine } from 'react-icons/ri';

const Sidebar = ({ isOpen }) => {
  const navItems = [
    { path: '/', icon: RiDashboardLine, label: 'Dashboard' },
    { path: '/members', icon: RiUserLine, label: 'Member Management' },
    { path: '/onboarding', icon: RiUserAddLine, label: 'Onboarding' },
    { path: '/reporting', icon: RiBarChartLine, label: 'Reporting' },
    { path: '/campaigns', icon: RiMegaphoneLine, label: 'Campaigns' },
  ];

  return (
    <div className={`bg-slate-800 min-h-screen flex flex-col text-gray-300 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <RiMusicLine className="text-2xl text-white" />
          </div>
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold text-white">Artists</h1>
              <p className="text-xs text-gray-400">Management Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <item.icon className="text-xl" />
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-slate-700">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-6 py-3 transition-colors ${
              isActive
                ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                : 'text-gray-300 hover:bg-slate-700 hover:text-white'
            }`
          }
        >
          <RiSettings4Line className="text-xl" />
          {isOpen && <span className="text-sm font-medium">Settings</span>}
        </NavLink>
        
        <button className="flex items-center space-x-3 px-6 py-3 w-full text-gray-300 hover:bg-slate-700 hover:text-white transition-colors">
          <RiLogoutBoxLine className="text-xl" />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
