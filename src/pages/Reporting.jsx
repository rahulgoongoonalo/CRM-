import { RiUserLine, RiTicket2Line, RiCheckboxCircleLine, RiTimeLine, RiFileTextLine, RiLayoutGridLine } from 'react-icons/ri';

const Reporting = () => {
  const reportCards = [
    {
      icon: <RiUserLine className="text-2xl" />,
      title: 'Member Status Report',
      description: 'Overview of all member statuses and classifications',
      iconBg: 'bg-blue-900/50',
      iconColor: 'text-blue-400'
    },
    {
      icon: <RiTicket2Line className="text-2xl" />,
      title: 'Tickets & SLA Report',
      description: 'Support ticket analytics and SLA compliance',
      iconBg: 'bg-blue-900/50',
      iconColor: 'text-blue-400'
    },
    {
      icon: <RiFileTextLine className="text-2xl" />,
      title: 'CRM Task Report',
      description: 'Pending, completed & overdue tasks by owner',
      iconBg: 'bg-blue-900/50',
      iconColor: 'text-blue-400'
    },
    {
      icon: <RiLayoutGridLine className="text-2xl" />,
      title: 'Onboarding Pipeline',
      description: 'Member onboarding progress across stages',
      iconBg: 'bg-blue-900/50',
      iconColor: 'text-blue-400'
    },
    {
      icon: <RiCheckboxCircleLine className="text-2xl" />,
      title: 'KYC Compliance Report',
      description: 'KYC verification status across members',
      iconBg: 'bg-blue-900/50',
      iconColor: 'text-blue-400'
    },
    {
      icon: <RiTimeLine className="text-2xl" />,
      title: 'Agreement Expiry Report',
      description: 'Upcoming and expired agreements',
      iconBg: 'bg-blue-900/50',
      iconColor: 'text-blue-400'
    },
  ];

  const quickStats = [
    { value: '92%', label: 'KYC Compliance', color: 'bg-emerald-500/10', textColor: 'text-emerald-400', bgDark: 'bg-[#1a3a2e]' },
    { value: '78%', label: 'SLA Met', color: 'bg-yellow-500/10', textColor: 'text-yellow-400', bgDark: 'bg-[#3a3220]' },
    { value: '34', label: 'Pending Tasks', color: 'bg-blue-500/10', textColor: 'text-blue-400', bgDark: 'bg-[#1a2a3a]' },
    { value: '8', label: 'Expiring Soon', color: 'bg-orange-500/10', textColor: 'text-orange-400', bgDark: 'bg-[#3a2a1a]' },
  ];

  const membersByTier = [
    { tier: 'Tier 1 (Premier)', count: 156, percentage: 52, color: 'bg-yellow-500' },
    { tier: 'Tier 2 (Elite)', count: 124, percentage: 41, color: 'bg-blue-500' },
    { tier: 'Tier 3 (Standard)', count: 67, percentage: 22, color: 'bg-gray-500' },
  ];

  const onboardingSources = [
    { source: 'Personal References', count: 89, percentage: 78, color: 'bg-blue-500' },
    { source: 'Curated Artists', count: 67, percentage: 59, color: 'bg-blue-500' },
    { source: 'Open Inbound', count: 45, percentage: 39, color: 'bg-blue-500' },
    { source: 'Special Curated', count: 23, percentage: 20, color: 'bg-blue-500' },
  ];

  return (
    <div className="p-6">
      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {reportCards.map((card, index) => (
          <div 
            key={index}
            className="bg-[#1e2a3a] rounded-lg p-6 border border-slate-700/50 hover:bg-[#243447] transition-colors cursor-pointer group"
          >
            <div className={`${card.iconBg} ${card.iconColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-800/50 transition-colors`}>
              {card.icon}
            </div>
            <h3 className="text-white font-semibold text-base mb-2">{card.title}</h3>
            <p className="text-gray-400 text-sm">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Statistics */}
      <div className="bg-[#1e2a3a] rounded-lg p-6 border border-slate-700/50 mb-6">
        <h2 className="text-white font-semibold text-lg mb-4">Quick Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <div 
              key={index}
              className={`${stat.bgDark} rounded-lg p-6 border border-slate-700/50`}
            >
              <div className={`text-4xl font-bold ${stat.textColor} mb-2`}>{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members by Tier */}
        <div className="bg-[#1e2a3a] rounded-lg p-6 border border-slate-700/50">
          <h3 className="text-white font-semibold text-lg mb-6">Members by Tier</h3>
          <div className="space-y-6">
            {membersByTier.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm font-medium">{item.tier}</span>
                  <span className="text-gray-400 text-sm">{item.count} members</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
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
        <div className="bg-[#1e2a3a] rounded-lg p-6 border border-slate-700/50">
          <h3 className="text-white font-semibold text-lg mb-6">Onboarding Sources</h3>
          <div className="space-y-6">
            {onboardingSources.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm font-medium">{item.source}</span>
                  <span className="text-gray-400 text-sm">{item.count}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
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
