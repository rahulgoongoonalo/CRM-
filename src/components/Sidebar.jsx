import { NavLink, useNavigate } from 'react-router-dom';
import { RiDashboardLine, RiUserLine, RiUserAddLine, RiBarChartLine, RiMegaphoneLine, RiSettings4Line, RiLogoutBoxLine, RiMusicLine, RiCloseLine, RiShieldCheckLine, RiBookOpenLine, RiQuestionAnswerLine } from 'react-icons/ri';
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
    // { path: '/', icon: RiDashboardLine, label: 'Dashboard' },
    { path: '/members', icon: RiUserLine, label: 'Member Management' },
    { path: '/onboarding', icon: RiUserAddLine, label: 'Onboarding' },
    { path: '/member-onboarding-status', icon: RiBarChartLine, label: 'Member Onboarding Status Report' },
    { path: '/data-hygiene', icon: RiShieldCheckLine, label: 'Data Hygiene' },
    { path: '/glossary', icon: RiBookOpenLine, label: 'Glossary' },
    { path: '/faq', icon: RiQuestionAnswerLine, label: 'FAQ' },
    // { path: '/reporting', icon: RiBarChartLine, label: 'Reporting' },
    // { path: '/campaigns', icon: RiMegaphoneLine, label: 'Campaigns' },
  ];

  return (
    <div className={`bg-surface-light min-h-screen flex flex-col text-text-secondary transition-all duration-300 border-r border-border ${
      isMobile 
        ? `fixed inset-y-0 left-0 z-50 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        : isOpen ? 'w-64' : 'w-20'
    }`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-border bg-gradient-royal-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/GG_LOGo.png" 
              alt="Logo" 
              className={`object-contain ${isOpen || isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}
            />
            {(isOpen || isMobile) && (
              <div>
                <h1 className="text-xl font-extrabold "style={{ color: '#FFB743' }}>Artists</h1>
                <p className="text-xs text-text-muted font-medium">Management Portal</p>
              </div>
            )}
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-brand-primary/10"
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
              `flex items-center space-x-3 px-6 py-3 mx-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/30'
                  : 'text-text-secondary hover:bg-brand-primary/10 hover:text-text-primary'
              }`
            }
          >
            <item.icon className="text-xl flex-shrink-0" />
            {(isOpen || isMobile) && <span className="text-sm font-semibold">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border">
        {/* <NavLink
          to="/settings"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-6 py-3 mx-2 my-2 rounded-lg transition-all ${
              isActive
                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/30'
                : 'text-text-secondary hover:bg-brand-primary/10 hover:text-text-primary'
            }`
          }
        >
          <RiSettings4Line className="text-xl flex-shrink-0" />
          {(isOpen || isMobile) && <span className="text-sm font-semibold">Settings</span>}
        </NavLink> */}
        
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-6 py-3 mx-2 mb-4 w-auto rounded-lg text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-all text-left"
        >
          <RiLogoutBoxLine className="text-xl" />
          {(isOpen || isMobile) && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
