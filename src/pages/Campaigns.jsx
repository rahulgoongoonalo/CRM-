import { RiPulseLine, RiMailLine, RiEyeLine, RiCheckboxCircleLine, RiAddLine, RiEyeOffLine, RiEditLine } from 'react-icons/ri';
import { useState } from 'react';
import NewCampaignModal from '../components/NewCampaignModal';
import EditCampaignModal from '../components/EditCampaignModal';

const Campaigns = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([
    { 
      id: 'CMP-001', 
      name: 'Q1 Royalty Update', 
      recipients: 156, 
      openRate: '68%', 
      sentDate: '2026-01-15',
      status: 'Sent'
    },
    { 
      id: 'CMP-002', 
      name: 'New Portal Features', 
      recipients: 0, 
      openRate: '-', 
      sentDate: '-',
      status: 'Draft'
    },
    { 
      id: 'CMP-003', 
      name: 'Annual Meeting Invite', 
      recipients: 89, 
      openRate: '-', 
      sentDate: '2026-02-01',
      status: 'Scheduled'
    },
  ]);

  const stats = [
    { icon: <RiPulseLine className="text-2xl" />, value: '24', label: 'Total Campaigns', bgColor: 'bg-blue-900/50', iconColor: 'text-blue-400' },
    { icon: <RiMailLine className="text-2xl" />, value: '12,456', label: 'Emails Sent', bgColor: 'bg-emerald-900/50', iconColor: 'text-emerald-400' },
    { icon: <RiEyeLine className="text-2xl" />, value: '64%', label: 'Avg Open Rate', bgColor: 'bg-orange-900/50', iconColor: 'text-orange-400' },
    { icon: <RiCheckboxCircleLine className="text-2xl" />, value: '3', label: 'Active Campaigns', bgColor: 'bg-purple-900/50', iconColor: 'text-purple-400' },
  ];

  const handleNewCampaign = (campaignData) => {
    const newCampaign = {
      id: `CMP-${String(campaigns.length + 1).padStart(3, '0')}`,
      name: campaignData.campaignName,
      recipients: 0,
      openRate: '-',
      sentDate: '-',
      status: campaignData.saveType === 'draft' ? 'Draft' : 'Scheduled'
    };
    setCampaigns([...campaigns, newCampaign]);
    setIsModalOpen(false);
  };

  const handleEditCampaign = (campaignData) => {
    setCampaigns(campaigns.map(camp => 
      camp.id === campaignData.id 
        ? { ...camp, name: campaignData.campaignName }
        : camp
    ));
    setIsEditModalOpen(false);
    setSelectedCampaign(null);
  };

  const openEditModal = (campaign) => {
    setSelectedCampaign(campaign);
    setIsEditModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Sent':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Draft':
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
      case 'Scheduled':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <RiAddLine className="text-xl" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-[#1e2a3a] rounded-lg p-5 border border-slate-700/50"
          >
            <div className="flex items-center space-x-4">
              <div className={`${stat.bgColor} ${stat.iconColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns Table - Desktop View */}
      <div className="hidden lg:block bg-[#1e2a3a] rounded-lg overflow-hidden border border-slate-700/50">
        <table className="w-full">
          <thead className="bg-[#243447] border-b border-slate-700">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Campaign ID
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Recipients
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Open Rate
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Sent Date
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {campaigns.map((campaign) => (
              <tr 
                key={campaign.id}
                className="hover:bg-[#243447] transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-blue-400 font-medium text-sm">{campaign.id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-white font-medium text-sm">{campaign.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-300 text-sm">{campaign.recipients}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-300 text-sm">{campaign.openRate}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-300 text-sm">{campaign.sentDate}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button className="text-gray-400 hover:text-blue-400 transition-colors">
                      <RiEyeLine className="text-lg" />
                    </button>
                    <button 
                      onClick={() => openEditModal(campaign)}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <RiEditLine className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-3">
        {campaigns.map((campaign) => (
          <div 
            key={campaign.id}
            className="bg-[#1e2a3a] rounded-lg p-4 border border-slate-700/50 hover:border-blue-500 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-blue-400 font-semibold text-sm">{campaign.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="text-white font-semibold text-base">{campaign.name}</div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <span className="text-gray-400">Recipients:</span>
                <span className="text-white ml-1">{campaign.recipients}</span>
              </div>
              <div>
                <span className="text-gray-400">Open Rate:</span>
                <span className="text-white ml-1">{campaign.openRate}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Sent Date:</span>
                <span className="text-white ml-1">{campaign.sentDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-3 border-t border-slate-700">
              <button className="flex-1 flex items-center justify-center space-x-1 text-gray-400 hover:text-blue-400 py-2 transition-colors">
                <RiEyeLine className="text-lg" />
                <span className="text-sm">View</span>
              </button>
              <button 
                onClick={() => openEditModal(campaign)}
                className="flex-1 flex items-center justify-center space-x-1 text-gray-400 hover:text-blue-400 py-2 transition-colors"
              >
                <RiEditLine className="text-lg" />
                <span className="text-sm">Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Campaign Modal */}
      <NewCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewCampaign}
      />

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCampaign(null);
        }}
        onSubmit={handleEditCampaign}
        campaign={selectedCampaign}
      />
    </div>
  );
};

export default Campaigns;
