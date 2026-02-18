import { RiUserAddLine, RiEyeLine, RiEditLine, RiDeleteBinLine, RiSendPlaneLine, RiSearchLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import AddOnboardingModal from '../components/AddOnboardingModal';
import ViewOnboardingModal from '../components/ViewOnboardingModal';
import EditOnboardingModal from '../components/EditOnboardingModal';
import L2ReviewModal from '../components/L2ReviewModal';
import { onboardingAPI } from '../services/api';
import { useToast, useConfirm } from '../components/ToastNotification';

const Onboarding = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isL2ReviewModalOpen, setIsL2ReviewModalOpen] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const toast = useToast();
  const confirm = useConfirm();

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
        artistName: formData.artistName,
        description: formData.description,
        spoc: formData.spoc,
        etaClosure: formData.etaClosure,
        notes: formData.notes,
        status: 'warm'
      });
      
      if (response.success) {
        await fetchOnboardings();
        setIsModalOpen(false);
        // Don't show alert, let the modal flow continue
        return response.data._id; // Return the created onboarding ID
      }
    } catch (error) {
      console.error('Error creating onboarding:', error);
      toast.error('Failed to create onboarding');
    }
  };

  const handleDeleteOnboarding = async (onboardingId) => {
    const confirmed = await confirm({
      title: 'Delete Onboarding',
      message: 'Are you sure you want to delete this onboarding? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (confirmed) {
      try {
        const response = await onboardingAPI.delete(onboardingId);
        if (response.success) {
          await fetchOnboardings();
          toast.success('Onboarding deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting onboarding:', error);
        toast.error('Failed to delete onboarding');
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
        toast.success('Onboarding updated successfully');
      }
    } catch (error) {
      console.error('Error updating onboarding:', error);
      toast.error('Failed to update onboarding');
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
        toast.success('L2 Review saved successfully');
      }
    } catch (error) {
      console.error('Error saving L2 review:', error);
      toast.error('Failed to save L2 review');
    }
  };
      
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    const statusMap = {
      'hot': 'bg-red-500/20 text-red-400 border border-red-500/30',
      'warm': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      'cold': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'closed-won': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'closed-lost': 'bg-red-700/20 text-red-500 border border-red-700/30',
      'cold-storage': 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    };
    return statusMap[statusLower] || 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  };

  const getTierColor = (tier) => {
    return tier === 'premium' 
      ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/30'
      : tier === 'basic'
      ? 'bg-gradient-to-r from-brand-accent to-brand-highlight text-white shadow-md shadow-brand-accent/30'
      : 'bg-surface-lighter text-text-secondary';
  };

  const formatStatus = (status) => {
    const statusLower = status?.toLowerCase() || '';
    const statusMap = {
      'hot': 'Hot',
      'warm': 'Warm',
      'cold': 'Cold',
      'closed-won': 'Closed Won',
      'closed-lost': 'Closed Lost',
      'cold-storage': 'Cold Storage'
    };
    return statusMap[statusLower] || status || 'Warm';
  };

  const filteredOnboardings = onboardings.filter((o) => {
    const matchesSearch = 
      o.artistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.spoc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.source?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'All' || formatStatus(o.status) === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOnboardings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOnboardings = filteredOnboardings.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const stats = [
    { number: onboardings.length.toString(), label: 'Total Onboarding', icon: RiUserAddLine, bgColor: 'bg-surface-card', iconBg: 'bg-gradient-to-br from-brand-primary to-brand-secondary' },
    { number: onboardings.filter(o => o.status === 'closed-won').length.toString(), label: 'Closed Won', icon: RiUserAddLine, bgColor: 'bg-surface-card', iconBg: 'bg-gradient-to-br from-green-600 to-green-700' },
    { number: onboardings.filter(o => o.status === 'closed-lost').length.toString(), label: 'Closed Lost', icon: RiUserAddLine, bgColor: 'bg-surface-card', iconBg: 'bg-gradient-to-br from-red-800 to-red-900' },
    { number: onboardings.filter(o => o.status === 'cold-storage').length.toString(), label: 'Cold Storage', icon: RiUserAddLine, bgColor: 'bg-surface-card', iconBg: 'bg-gradient-to-br from-purple-600 to-purple-700' },
  ];

  const filters = [
    'All',
    'Hot',
    'Warm',
    'Cold',
    'Closed Won',
    'Closed Lost',
    'Cold Storage'
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Member Onboarding</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2 px-5 py-2.5"
        >
          <span>+</span>
          <span>Add New Onboarding</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} card card-hover shadow-lg shadow-brand-primary/5 border-border`}>
            <div className="flex items-start justify-between">
              <div className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-primary/30`}>
                <stat.icon className="text-2xl" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-text-primary text-3xl font-bold mb-1">{stat.number}</div>
              <div className="text-text-muted text-sm font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Section */}
      <div className="card shadow-lg shadow-brand-primary/10 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-sm" />
            <input
              type="text"
              placeholder="Search by artist name, SPOC, or source..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="input w-full text-sm pl-9"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/30'
                : 'bg-surface-lighter text-text-muted hover:bg-surface-card border border-border'
            }`}
          >
            {filter}
          </button>
        ))}
        </div>
      </div>

      {/* Table - Desktop View */}
      <div className="hidden lg:block card shadow-lg shadow-brand-primary/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-lighter border-b border-border">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                Task #
              </th>
              <th className="text-left px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                Artist Name
              </th>
              <th className="text-left px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                Start Date
              </th>
              <th className="text-left px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                Source
              </th>
              <th className="text-left px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                Tier
              </th>
              <th className="text-left px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                SPOC
              </th>
              <th className="text-left px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-text-muted">
                  Loading onboardings...
                </td>
              </tr>
            ) : currentOnboardings.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-text-muted">
                  No onboardings found. Click "Add New Onboarding" to create one.
                </td>
              </tr>
            ) : (
              currentOnboardings.map((item) => {
                const taskId = item.taskNumber || 'N/A';
                const startDate = new Date(item.createdAt).toISOString().split('T')[0];
                const memberName = item.artistName || item.member?.artistName || 'N/A';
                const source = item.member?.source || 'N/A';
                const tier = item.member?.tier || 'Tier 1';
                
                return (
                  <tr key={item._id} className="table-row">
                    <td className="px-4 py-2.5">
                      <span className="text-brand-accent font-semibold text-xs">{taskId}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-text-primary font-semibold text-xs">{memberName}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-text-secondary text-xs">{startDate}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-text-secondary text-xs">{source}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-block ${getTierColor(tier)}`}>
                        {tier}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-text-secondary text-xs">{item.spoc}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(item.status)}`}>
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleViewOnboarding(item)}
                          className="text-text-muted hover:text-brand-accent transition-colors p-1"
                        >
                          <RiEyeLine className="text-base" />
                        </button>
                        <button 
                          onClick={() => handleEditOnboarding(item)}
                          className="text-text-muted hover:text-brand-accent transition-colors p-1"
                        >
                          <RiEditLine className="text-base" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOnboarding(item._id)}
                          className="text-text-muted hover:text-red-400 transition-colors p-1"
                        >
                          <RiDeleteBinLine className="text-base" />
                        </button>
                        <button 
                          onClick={() => handleOpenL2Review(item)}
                          className="text-text-muted hover:text-emerald-400 transition-colors p-1"
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

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="card shadow-md text-center text-text-muted border-border">
            Loading onboardings...
          </div>
        ) : currentOnboardings.length === 0 ? (
          <div className="card shadow-md text-center text-text-muted border-border">
            No onboardings found. Click "Add New Onboarding" to create one.
          </div>
        ) : (
          currentOnboardings.map((item) => {
            const taskId = item.taskNumber || 'N/A';
            const startDate = new Date(item.createdAt).toISOString().split('T')[0];
            const memberName = item.artistName || item.member?.artistName || 'N/A';
            const source = item.member?.source || 'N/A';
            const tier = item.member?.tier || 'Tier 1';
            
            return (
              <div 
                key={item._id}
                className="card-hover shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-brand-accent font-bold text-sm">#{taskId}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(item.status)}`}>
                        {formatStatus(item.status)}
                      </span>
                    </div>
                    <div className="text-text-primary font-bold text-base">{memberName}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getTierColor(tier)}`}>
                    {tier}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <span className="text-text-muted font-medium">Start Date:</span>
                    <span className="text-text-primary ml-1">{startDate}</span>
                  </div>
                  <div>
                    <span className="text-text-muted font-medium">Source:</span>
                    <span className="text-text-primary ml-1">{source}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-muted font-medium">SPOC:</span>
                    <span className="text-text-primary ml-1">{item.spoc}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-3 border-t border-border">
                  <button 
                    onClick={() => handleViewOnboarding(item)}
                    className="flex-1 flex items-center justify-center space-x-1 text-text-muted hover:text-brand-accent py-2 transition-colors"
                  >
                    <RiEyeLine className="text-lg" />
                    <span className="text-sm font-medium">View</span>
                  </button>
                  <button 
                    onClick={() => handleEditOnboarding(item)}
                    className="flex-1 flex items-center justify-center space-x-1 text-text-muted hover:text-brand-accent py-2 transition-colors"
                  >
                    <RiEditLine className="text-lg" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteOnboarding(item._id)}
                    className="flex-1 flex items-center justify-center space-x-1 text-text-muted hover:text-red-400 py-2 transition-colors"
                  >
                    <RiDeleteBinLine className="text-lg" />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                  <button 
                    onClick={() => handleOpenL2Review(item)}
                    className="flex-1 flex items-center justify-center space-x-1 text-text-muted hover:text-emerald-400 py-2 transition-colors"
                  >
                    <RiSendPlaneLine className="text-lg" />
                    <span className="text-sm font-medium">Review</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {filteredOnboardings.length > 0 && (
        <div className="card shadow-lg shadow-brand-primary/10 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <div className="text-sm text-text-muted text-center sm:text-left font-medium">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredOnboardings.length)} of {filteredOnboardings.length} onboardings
          </div>
          <div className="flex items-center space-x-2 flex-wrap justify-center">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn-secondary px-3 md:px-4 py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {(() => {
              const pages = [];
              const showEllipsis = totalPages > 7;
              
              if (!showEllipsis) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                pages.push(1);
                
                if (currentPage > 3) {
                  pages.push('...');
                }
                
                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);
                
                for (let i = start; i <= end; i++) {
                  if (!pages.includes(i)) pages.push(i);
                }
                
                if (currentPage < totalPages - 2) {
                  pages.push('...');
                }
                
                if (!pages.includes(totalPages)) pages.push(totalPages);
              }
              
              return pages.map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-text-muted">...</span>
                ) : (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/30' 
                        : 'text-text-muted hover:text-text-primary hover:bg-surface-lighter border border-border'
                    }`}
                  >
                    {page}
                  </button>
                )
              ));
            })()}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary px-3 md:px-4 py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
