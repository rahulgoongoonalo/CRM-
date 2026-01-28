import { RiUserAddLine, RiEyeLine, RiEditLine, RiDeleteBinLine, RiSendPlaneLine } from 'react-icons/ri';
import { useState } from 'react';
import AddOnboardingModal from '../components/AddOnboardingModal';

const Onboarding = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [onboardings, setOnboardings] = useState([
    {
      id: 'ONB-001',
      artistName: 'Neha Kakkar',
      startDate: '2026-01-15',
      source: 'Open Inbound',
      tier: 'Tier 1',
      spoc: 'Vishal Onkar',
      status: 'Contact Established'
    },
    {
      id: 'ONB-002',
      artistName: 'Badshah',
      startDate: '2026-01-10',
      source: 'Special-Curated',
      tier: 'Tier 2',
      spoc: 'Soumini Paul',
      status: 'Review for L2'
    },
    {
      id: 'ONB-003',
      artistName: 'Arijit Singh',
      startDate: '2026-01-05',
      source: 'Personal Reference',
      tier: 'Tier 1',
      spoc: 'Aayan De',
      status: 'Closed Won'
    },
    {
      id: 'ONB-004',
      artistName: 'Shreya Ghoshal',
      startDate: '2026-01-18',
      source: 'Personal Reference',
      tier: 'Tier 1',
      spoc: 'Joshua Singh',
      status: 'SPOC Assigned'
    },
    {
      id: 'ONB-005',
      artistName: 'Sunidhi Chauhan',
      startDate: '2026-01-08',
      source: 'Personal Reference',
      tier: 'Tier 1',
      spoc: 'Rahul Sharma',
      status: 'Cold Storage'
    },
  ]);

  const stats = [
    { number: '5', label: 'Total Onboarding', icon: RiUserAddLine, bgColor: 'bg-blue-900/30', iconBg: 'bg-blue-600' },
    { number: '3', label: 'In Progress', icon: RiUserAddLine, bgColor: 'bg-orange-900/30', iconBg: 'bg-orange-600' },
    { number: '1', label: 'Closed Won', icon: RiUserAddLine, bgColor: 'bg-emerald-900/30', iconBg: 'bg-emerald-600' },
    { number: '1', label: 'Cold Storage', icon: RiUserAddLine, bgColor: 'bg-purple-900/30', iconBg: 'bg-purple-600' },
  ];

  const filters = [
    'All',
    'SPOC Assigned',
    'Contact Established',
    'Review for L2',
    'Closed Won',
    'Closed Lost',
    'Cold Storage'
  ];

  const handleAddOnboarding = (data) => {
    const newOnboarding = {
      id: `ONB-${String(onboardings.length + 1).padStart(3, '0')}`,
      artistName: data.member,
      startDate: new Date().toISOString().split('T')[0],
      source: 'Open Inbound',
      tier: 'Tier 1',
      spoc: data.spoc,
      status: 'SPOC Assigned'
    };
    setOnboardings([...onboardings, newOnboarding]);
    setIsModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Contact Established':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Review for L2':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Closed Won':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'SPOC Assigned':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'Cold Storage':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getTierColor = (tier) => {
    return tier === 'Tier 1' 
      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'Open Inbound':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Special-Curated':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'Personal Reference':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  // Filter onboardings based on active filter
  const filteredOnboardings = activeFilter === 'All' 
    ? onboardings 
    : onboardings.filter(item => item.status === activeFilter);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Member Onboarding</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <span>+</span>
          <span>Add New Onboarding</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-5 border border-slate-700/50`}>
            <div className="flex items-start justify-between">
              <div className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                <stat.icon className="text-2xl" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-white text-3xl font-bold mb-1">{stat.number}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1e2a3a] rounded-lg overflow-hidden border border-slate-700/50">
        <table className="w-full">
          <thead className="bg-[#243447] border-b border-slate-700">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Task #
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Artist Name
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Start Date
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Source
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Tier
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                SPOC
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredOnboardings.map((item) => (
              <tr key={item.id} className="hover:bg-[#243447] transition-colors">
                <td className="px-4 py-2.5">
                  <span className="text-blue-400 font-medium text-xs">{item.id}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-white font-medium text-xs">{item.artistName}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-gray-300 text-xs">{item.startDate}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block ${getSourceColor(item.source)}`}>
                    {item.source}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block ${getTierColor(item.tier)}`}>
                    {item.tier}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-gray-300 text-xs">{item.spoc}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-blue-400 transition-colors">
                      <RiEyeLine className="text-base" />
                    </button>
                    <button className="text-gray-400 hover:text-blue-400 transition-colors">
                      <RiEditLine className="text-base" />
                    </button>
                    <button className="text-gray-400 hover:text-blue-400 transition-colors">
                      <RiDeleteBinLine className="text-base" />
                    </button>
                    <button className="text-gray-400 hover:text-blue-400 transition-colors">
                      <RiSendPlaneLine className="text-base" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Onboarding Modal */}
      <AddOnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddOnboarding}
      />
    </div>
  );
};

export default Onboarding;
