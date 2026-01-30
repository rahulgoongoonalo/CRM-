import { RiUserAddLine, RiEyeLine, RiEditLine, RiDeleteBinLine, RiSendPlaneLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import AddOnboardingModal from '../components/AddOnboardingModal';
import ViewOnboardingModal from '../components/ViewOnboardingModal';
import EditOnboardingModal from '../components/EditOnboardingModal';
import L2ReviewModal from '../components/L2ReviewModal';
import { onboardingAPI } from '../services/api';

const Onboarding = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isL2ReviewModalOpen, setIsL2ReviewModalOpen] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnboardings();
  }, []);

  const fetchOnboardings = async () => {
    try {
      setLoading(true);
      const response = await onboardingAPI.getAll();
      if (response.success) {
        setOnboardings(response.data);
      }
    } catch (error) {
      console.error('Error fetching onboardings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOnboarding = async (formData) => {
    try {
      const response = await onboardingAPI.create({
        member: formData.member,
        memberName: formData.memberName,
        description: formData.description,
        spoc: formData.spoc,
        etaClosure: formData.etaClosure,
        notes: formData.notes,
        status: 'contact-established'
      });
      
      if (response.success) {
        await fetchOnboardings();
        setIsModalOpen(false);
        // Don't show alert, let the modal flow continue
        return response.data._id; // Return the created onboarding ID
      }
    } catch (error) {
      console.error('Error creating onboarding:', error);
      alert('Failed to create onboarding');
    }
  };

  const handleDeleteOnboarding = async (onboardingId) => {
    if (window.confirm('Are you sure you want to delete this onboarding?')) {
      try {
        const response = await onboardingAPI.delete(onboardingId);
        if (response.success) {
          await fetchOnboardings();
          alert('Onboarding deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting onboarding:', error);
        alert('Failed to delete onboarding');
      }
    }
  };

  const handleViewOnboarding = (onboarding) => {
    setSelectedOnboarding(onboarding);
    setIsViewModalOpen(true);
  };

  const handleEditOnboarding = (onboarding) => {
    setSelectedOnboarding(onboarding);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = async (dataUpdated) => {
    if (dataUpdated) {
      await fetchOnboardings();
    }
    setIsEditModalOpen(false);
    setSelectedOnboarding(null);
  };

  const handleUpdateOnboarding = async (updatedData) => {
    try {
      const response = await onboardingAPI.update(selectedOnboarding._id, updatedData);
      if (response.success) {
        await fetchOnboardings();
        setIsEditModalOpen(false);
        setSelectedOnboarding(null);
        alert('Onboarding updated successfully');
      }
    } catch (error) {
      console.error('Error updating onboarding:', error);
      alert('Failed to update onboarding');
    }
  };

  const handleOpenL2Review = (onboarding) => {
    setSelectedOnboarding(onboarding);
    setIsL2ReviewModalOpen(true);
  };

  const handleSubmitL2Review = async (l2Data) => {
    try {
      const response = await onboardingAPI.updateL2Review(selectedOnboarding._id, l2Data);
      if (response.success) {
        await fetchOnboardings();
        setIsL2ReviewModalOpen(false);
        setSelectedOnboarding(null);
        alert('L2 Review saved successfully');
      }
    } catch (error) {
      console.error('Error saving L2 review:', error);
      alert('Failed to save L2 review');
    }
  };
      
  const getStatusColor = (status) => {
    const statusMap = {
      'contact-established': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'spoc-assigned': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      'review-l2': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'closed-won': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      'closed-lost': 'bg-red-500/20 text-red-400 border border-red-500/30'
    };
    return statusMap[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  };

  const getTierColor = (tier) => {
    return tier === 'premium' 
      ? 'bg-amber-600 text-white'
      : tier === 'basic'
      ? 'bg-blue-600 text-white'
      : 'bg-gray-600 text-white';
  };

  const formatStatus = (status) => {
    const statusMap = {
      'contact-established': 'Contact Established',
      'spoc-assigned': 'SPOC Assigned',
      'review-l2': 'Review for L2',
      'closed-won': 'Closed Won',
      'closed-lost': 'Closed Lost'
    };
    return statusMap[status] || status;
  };

  const filteredOnboardings = activeFilter === 'All' 
    ? onboardings 
    : onboardings.filter(o => formatStatus(o.status) === activeFilter);

  const stats = [
    { number: onboardings.length.toString(), label: 'Total Onboarding', icon: RiUserAddLine, bgColor: 'bg-blue-900/30', iconBg: 'bg-blue-600' },
    { number: onboardings.filter(o => ['contact-established', 'spoc-assigned', 'review-l2'].includes(o.status)).length.toString(), label: 'In Progress', icon: RiUserAddLine, bgColor: 'bg-orange-900/30', iconBg: 'bg-orange-600' },
    { number: onboardings.filter(o => o.status === 'closed-won').length.toString(), label: 'Closed Won', icon: RiUserAddLine, bgColor: 'bg-emerald-900/30', iconBg: 'bg-emerald-600' },
    { number: onboardings.filter(o => o.status === 'closed-lost').length.toString(), label: 'Closed Lost', icon: RiUserAddLine, bgColor: 'bg-purple-900/30', iconBg: 'bg-purple-600' },
  ];

  const filters = [
    'All',
    'SPOC Assigned',
    'Contact Established',
    'Review for L2',
    'Closed Won',
    'Closed Lost'
  ];

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
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                  Loading onboardings...
                </td>
              </tr>
            ) : filteredOnboardings.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                  No onboardings found. Click "Add New Onboarding" to create one.
                </td>
              </tr>
            ) : (
              filteredOnboardings.map((item) => {
                const taskId = item.taskNumber || 'N/A';
                const startDate = new Date(item.createdAt).toISOString().split('T')[0];
                const memberName = item.memberName || item.member?.name || 'N/A';
                const source = item.member?.source || 'N/A';
                const tier = item.member?.membershipType || 'basic';
                
                return (
                  <tr key={item._id} className="hover:bg-[#243447] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="text-blue-400 font-medium text-xs">{taskId}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-white font-medium text-xs">{memberName}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-gray-300 text-xs">{startDate}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-gray-300 text-xs">{source}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block ${getTierColor(tier)}`}>
                        {tier === 'premium' ? 'Tier 1' : tier === 'basic' ? 'Tier 2' : 'Tier 3'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-gray-300 text-xs">{item.spoc}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block ${getStatusColor(item.status)}`}>
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleViewOnboarding(item)}
                          className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                        >
                          <RiEyeLine className="text-base" />
                        </button>
                        <button 
                          onClick={() => handleEditOnboarding(item)}
                          className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                        >
                          <RiEditLine className="text-base" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOnboarding(item._id)}
                          className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        >
                          <RiDeleteBinLine className="text-base" />
                        </button>
                        <button 
                          onClick={() => handleOpenL2Review(item)}
                          className="text-gray-400 hover:text-green-400 transition-colors p-1"
                        >
                          <RiSendPlaneLine className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>


      {/* View Onboarding Modal */}
      <ViewOnboardingModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOnboarding(null);
        }}
        onboarding={selectedOnboarding}
      />

      {/* Edit Onboarding Modal */}
      <EditOnboardingModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onboarding={selectedOnboarding}
        onSubmit={handleUpdateOnboarding}
      />
      {/* Add Onboarding Modal */}
      <AddOnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddOnboarding}
      />

      {/* L2 Review Modal */}
      <L2ReviewModal
        isOpen={isL2ReviewModalOpen}
        onClose={() => {
          setIsL2ReviewModalOpen(false);
          setSelectedOnboarding(null);
        }}
        onboarding={selectedOnboarding}
        onSubmit={handleSubmitL2Review}
      />
    </div>
  );
};

export default Onboarding;
