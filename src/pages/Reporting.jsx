import { RiUserLine, RiTicket2Line, RiCheckboxCircleLine, RiTimeLine, RiFileTextLine, RiLayoutGridLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const Reporting = () => {
  const navigate = useNavigate();
  
  const reportCards = [
    {
      icon: <RiUserLine className="text-2xl" />,
      title: 'Member Onboarding Status',
      description: 'Overview of all member onboarding progress and status',
      iconBg: 'bg-brand-primary/20',
      iconColor: 'text-brand-accent',
      route: '/member-onboarding-status'
    },
    {
      icon: <RiTicket2Line className="text-2xl" />,
      title: 'Tickets & SLA Report',
      description: 'Support ticket analytics and SLA compliance',
      iconBg: 'bg-brand-secondary/20',
      iconColor: 'text-brand-highlight',
      route: null
    },
    {
      icon: <RiFileTextLine className="text-2xl" />,
      title: 'CRM Task Report',
      description: 'Pending, completed & overdue tasks by owner',
      iconBg: 'bg-brand-primary/20',
      iconColor: 'text-brand-accent',
      route: null
    },
    {
      icon: <RiLayoutGridLine className="text-2xl" />,
      title: 'Onboarding Pipeline',
      description: 'Member onboarding progress across stages',
      iconBg: 'bg-brand-secondary/20',
      iconColor: 'text-brand-highlight',
      route: null
    },
    {
      icon: <RiCheckboxCircleLine className="text-2xl" />,
      title: 'KYC Compliance Report',
      description: 'KYC verification status across members',
      iconBg: 'bg-brand-primary/20',
      iconColor: 'text-brand-accent',
      route: null
    },
    {
      icon: <RiTimeLine className="text-2xl" />,
      title: 'Agreement Expiry Report',
      description: 'Upcoming and expired agreements',
      iconBg: 'bg-brand-secondary/20',
      iconColor: 'text-brand-highlight',
      route: null
    },
  ];

  const quickStats = [
    { value: '92%', label: 'KYC Compliance', color: 'bg-emerald-500/10', textColor: 'text-emerald-400', bgDark: 'bg-surface-lighter' },
    { value: '78%', label: 'SLA Met', color: 'bg-yellow-500/10', textColor: 'text-yellow-400', bgDark: 'bg-surface-lighter' },
    { value: '34', label: 'Pending Tasks', color: 'bg-brand-primary/10', textColor: 'text-brand-accent', bgDark: 'bg-surface-lighter' },
    { value: '8', label: 'Expiring Soon', color: 'bg-orange-500/10', textColor: 'text-orange-400', bgDark: 'bg-surface-lighter' },
  ];

  const membersByTier = [
    { tier: 'Tier 1 (Premier)', count: 156, percentage: 52, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
    { tier: 'Tier 2 (Elite)', count: 124, percentage: 41, color: 'bg-gradient-to-r from-brand-primary to-brand-secondary' },
    { tier: 'Tier 3 (Standard)', count: 67, percentage: 22, color: 'bg-gradient-to-r from-gray-500 to-gray-600' },
  ];

  const onboardingSources = [
    { source: 'Personal References', count: 89, percentage: 78, color: 'bg-gradient-to-r from-brand-primary to-brand-secondary' },
    { source: 'Curated Artists', count: 67, percentage: 59, color: 'bg-gradient-to-r from-brand-secondary to-brand-accent' },
    { source: 'Open Inbound', count: 45, percentage: 39, color: 'bg-gradient-to-r from-brand-accent to-brand-highlight' },
    { source: 'Special Curated', count: 23, percentage: 20, color: 'bg-gradient-to-r from-brand-highlight to-brand-accent' },
  ];

  return (
    <div className="p-6">
      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {reportCards.map((card, index) => (
          <div 
            key={index}
            onClick={() => card.route && navigate(card.route)}
            className={`bg-surface-card rounded-lg p-6 border border-border hover:bg-surface-lighter hover:shadow-lg hover:shadow-brand-primary/10 transition-all ${card.route ? 'cursor-pointer' : 'cursor-default'} group`}
          >
            <div className={`${card.iconBg} ${card.iconColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-primary/30 transition-colors`}>
              {card.icon}
            </div>
            <h3 className="text-text-primary font-semibold text-base mb-2">{card.title}</h3>
            <p className="text-text-secondary text-sm">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Statistics */}
      <div className="bg-surface-card rounded-lg p-6 border border-border mb-6">
        <h2 className="text-text-primary font-semibold text-lg mb-4">Quick Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <div 
              key={index}
              className={`${stat.bgDark} rounded-lg p-6 border border-border hover:shadow-lg hover:shadow-brand-primary/10 transition-all`}
            >
              <div className={`text-4xl font-bold ${stat.textColor} mb-2`}>{stat.value}</div>
              <div className="text-text-secondary text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members by Tier */}
        <div className="bg-surface-card rounded-lg p-6 border border-border">
          <h3 className="text-text-primary font-semibold text-lg mb-6">Members by Tier</h3>
          <div className="space-y-6">
            {membersByTier.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-primary text-sm font-medium">{item.tier}</span>
                  <span className="text-text-secondary text-sm">{item.count} members</span>
                </div>
                <div className="w-full bg-surface-lighter rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding Sources */}
        <div className="bg-surface-card rounded-lg p-6 border border-border">
          <h3 className="text-text-primary font-semibold text-lg mb-6">Onboarding Sources</h3>
          <div className="space-y-6">
            {onboardingSources.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-primary text-sm font-medium">{item.source}</span>
                  <span className="text-text-secondary text-sm">{item.count}</span>
                </div>
                <div className="w-full bg-surface-lighter rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
