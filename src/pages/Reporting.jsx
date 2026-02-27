import { RiUserLine, RiTicket2Line, RiCheckboxCircleLine, RiTimeLine, RiFileTextLine, RiLayoutGridLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { membersAPI, onboardingAPI } from '../services/api';

const Reporting = () => {
  const navigate = useNavigate();
  const [membersByTier, setMembersByTier] = useState([]);
  const [onboardingSources, setOnboardingSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [membersResponse, onboardingResponse] = await Promise.all([
        membersAPI.getAll({ limit: 10000 }),
        onboardingAPI.getAll({ limit: 10000 })
      ]);

      if (membersResponse.success) {
        calculateMembersByTier(membersResponse.data);
      }

      if (onboardingResponse.success) {
        calculateOnboardingSources(onboardingResponse.data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMembersByTier = (members) => {
    const tierCounts = {};
    const totalMembers = members.length;

    // Count members by tier
    members.forEach(member => {
      const tier = member.tier || 'N/A';
      const tierKey = tier.toString().toLowerCase();
      const tierMatch = tierKey.match(/tier\s*(\d+)/);
      const tierLabel = tierMatch ? `Tier ${tierMatch[1]}` : tier;
      
      if (!tierCounts[tierLabel]) {
        tierCounts[tierLabel] = 0;
      }
      tierCounts[tierLabel]++;
    });

    // Convert to array and calculate percentages
    const tierColors = {
      'Tier 1': 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      'Tier 2': 'bg-gradient-to-r from-purple-500 to-purple-600',
      'Tier 3': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'Tier 4': 'bg-gradient-to-r from-green-500 to-green-600',
      'Tier 5': 'bg-gradient-to-r from-orange-500 to-orange-600',
      'Tier 6': 'bg-gradient-to-r from-pink-500 to-pink-600',
      'Tier 7': 'bg-gradient-to-r from-cyan-500 to-cyan-600',
      'Tier 8': 'bg-gradient-to-r from-gray-500 to-gray-600',
    };

    const tierData = Object.entries(tierCounts)
      .map(([tier, count]) => ({
        tier,
        count,
        percentage: totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0,
        color: tierColors[tier] || 'bg-gradient-to-r from-gray-500 to-gray-600'
      }))
      .sort((a, b) => {
        const tierNumA = parseInt(a.tier.match(/\d+/)?.[0] || '999');
        const tierNumB = parseInt(b.tier.match(/\d+/)?.[0] || '999');
        return tierNumA - tierNumB;
      });

    setMembersByTier(tierData);
  };

  const calculateOnboardingSources = (onboardings) => {
    const sourceCounts = {};
    const total = onboardings.length;

    // Count onboardings by source
    onboardings.forEach(onboarding => {
      const source = onboarding.step1Data?.source || onboarding.member?.source || 'Unknown';
      if (!sourceCounts[source]) {
        sourceCounts[source] = 0;
      }
      sourceCounts[source]++;
    });

    // Convert to array and calculate percentages
    const sourceColors = [
      'bg-gradient-to-r from-brand-primary to-brand-secondary',
      'bg-gradient-to-r from-brand-secondary to-brand-accent',
      'bg-gradient-to-r from-brand-accent to-brand-highlight',
      'bg-gradient-to-r from-brand-highlight to-brand-accent',
      'bg-gradient-to-r from-purple-500 to-pink-500',
      'bg-gradient-to-r from-blue-500 to-cyan-500',
    ];

    const sourceData = Object.entries(sourceCounts)
      .map(([source, count], index) => ({
        source: source === 'Unknown' ? 'Not Specified' : source,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: sourceColors[index % sourceColors.length]
      }))
      .sort((a, b) => b.count - a.count);

    setOnboardingSources(sourceData);
  };
  
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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : membersByTier.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              No member data available
            </div>
          ) : (
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
          )}
        </div>

        {/* Onboarding Sources */}
        <div className="bg-surface-card rounded-lg p-6 border border-border">
          <h3 className="text-text-primary font-semibold text-lg mb-6">Onboarding Sources</h3>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : onboardingSources.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              No onboarding data available
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Reporting;
