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
    { icon: <RiPulseLine className="text-2xl" />, value: '24', label: 'Total Campaigns', bgColor: 'bg-surface-card', iconColor: 'text-brand-primary' },
    { icon: <RiMailLine className="text-2xl" />, value: '12,456', label: 'Emails Sent', bgColor: 'bg-surface-card', iconColor: 'text-emerald-400' },
    { icon: <RiEyeLine className="text-2xl" />, value: '64%', label: 'Avg Open Rate', bgColor: 'bg-surface-card', iconColor: 'text-brand-accent' },
    { icon: <RiCheckboxCircleLine className="text-2xl" />, value: '3', label: 'Active Campaigns', bgColor: 'bg-surface-card', iconColor: 'text-brand-secondary' },
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
        return 'badge-success';
      case 'Draft':
        return 'bg-surface-lighter text-text-muted border border-border';
      case 'Scheduled':
        return 'badge-primary';
      default:
        return 'bg-surface-lighter/50 text-text-muted border border-border';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Email Campaigns</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2 px-5 py-2.5"
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
            className="card card-hover shadow-lg shadow-brand-primary/5"
          >
            <div className="flex items-center space-x-4">
              <div className={`${stat.bgColor} ${stat.iconColor} w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                <div className="text-text-muted text-sm font-medium">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns Table - Desktop View */}
      <div className="hidden lg:block card shadow-lg shadow-brand-primary/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-lighter border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">
                Campaign ID
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">
                Recipients
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">
                Open Rate
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">
                Sent Date
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {campaigns.map((campaign) => (
              <tr 
                key={campaign.id}
                className="table-row"
              >
                <td className="px-6 py-4">
                  <span className="text-brand-accent font-semibold text-sm">{campaign.id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-text-primary font-semibold text-sm">{campaign.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-text-secondary text-sm">{campaign.recipients}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-text-secondary text-sm">{campaign.openRate}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-text-secondary text-sm">{campaign.sentDate}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button className="text-text-muted hover:text-brand-accent transition-colors">
                      <RiEyeLine className="text-lg" />
                    </button>
                    <button 
                      onClick={() => openEditModal(campaign)}
                      className="text-text-muted hover:text-brand-accent transition-colors"
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
            className="card-hover shadow-md"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-brand-accent font-bold text-sm">{campaign.id}</span>
                  <span className={`${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="text-text-primary font-bold text-base">{campaign.name}</div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <span className="text-text-muted font-medium">Recipients:</span>
                <span className="text-text-primary ml-1">{campaign.recipients}</span>
              </div>
              <div>
                <span className="text-text-muted font-medium">Open Rate:</span>
                <span className="text-text-primary ml-1">{campaign.openRate}</span>
              </div>
              <div className="col-span-2">
                <span className="text-text-muted font-medium">Sent Date:</span>
                <span className="text-text-primary ml-1">{campaign.sentDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-3 border-t border-border">
              <button className="flex-1 flex items-center justify-center space-x-1 text-text-muted hover:text-brand-accent py-2 transition-colors">
                <RiEyeLine className="text-lg" />
                <span className="text-sm font-medium">View</span>
              </button>
              <button 
                onClick={() => openEditModal(campaign)}
                className="flex-1 flex items-center justify-center space-x-1 text-text-muted hover:text-brand-accent py-2 transition-colors"
              >
                <RiEditLine className="text-lg" />
                <span className="text-sm font-medium">Edit</span>
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
