import { useState, useEffect, useMemo } from 'react';
import { RiSearchLine, RiEyeLine, RiEditLine, RiAddLine, RiDeleteBinLine, RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri';
import AddMemberModal from '../components/AddMemberModal';
import ViewMemberModal from '../components/ViewMemberModal';
import EditMemberModal from '../components/EditMemberModal';
import { membersAPI } from '../services/api';
import { useToast, useConfirm } from '../components/ToastNotification';
import { usePicklist } from '../hooks/usePicklist';

const SortIcon = ({ active, direction }) => {
  if (!active) {
    return (
      <div className="inline-flex flex-col -space-y-1.5 text-text-muted/40 ml-1">
        <RiArrowUpSLine className="text-xs" />
        <RiArrowDownSLine className="text-xs" />
      </div>
    );
  }
  return (
    <div className="inline-flex flex-col -space-y-1.5 ml-1">
      <RiArrowUpSLine className={`text-xs ${direction === 'asc' ? 'text-brand-primary' : 'text-text-muted/30'}`} />
      <RiArrowDownSLine className={`text-xs ${direction === 'desc' ? 'text-brand-primary' : 'text-text-muted/30'}`} />
    </div>
  );
};

const MemberManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [tierFilter, setTierFilter] = useState('All Tiers');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const toast = useToast();
  const confirm = useConfirm();
  const { items: sourceOptions } = usePicklist('source');
  const { items: tierOptions } = usePicklist('tier');

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  // Fetch members from backend
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await membersAPI.getAll();
      if (response.success) {
        setMembers(response.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let result = members.filter((member) => {
      const matchesSearch =
        member.artistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter !== 'All Status') {
        const filterStatus = statusFilter.toLowerCase();
        const memberStatus = member.status?.toLowerCase();

        if (filterStatus === 'updated') {
          matchesStatus = memberStatus === 'active' || memberStatus === 'updated';
        } else if (filterStatus === 'on hold') {
          matchesStatus = memberStatus === 'inactive';
        } else if (filterStatus === 'pending') {
          matchesStatus = memberStatus === 'pending';
        }
      }

      let matchesTier = true;
      if (tierFilter !== 'All Tiers') {
        const memberTier = member.tier?.toLowerCase() || '';
        const filterTier = tierFilter.toLowerCase();
        matchesTier = memberTier.includes(filterTier.split(' - ')[0].toLowerCase());
      }

      let matchesSource = true;
      if (sourceFilter !== 'All Sources') {
        matchesSource = (member.source || '') === sourceFilter;
      }

      return matchesSearch && matchesStatus && matchesTier && matchesSource;
    });

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (typeof valA === 'string') return dir * valA.localeCompare(valB);
        return dir * ((valA || 0) - (valB || 0));
      });
    }

    return result;
  }, [members, searchQuery, statusFilter, tierFilter, sourceFilter, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleAddMember = async (newMemberData) => {
    try {
      // Map status values to match backend enum
      let backendStatus = newMemberData.status?.toLowerCase() || 'pending';
      if (backendStatus === 'on hold') {
        backendStatus = 'inactive';
      }

      const memberPayload = {
        artistName: newMemberData.fullName,
        email: newMemberData.email,
        phone: newMemberData.contactNumber,
        alternateNumber: newMemberData.alternateNumber,
        location: newMemberData.country,
        contactName: newMemberData.aliasName,
        category: newMemberData.category,
        tier: newMemberData.tier,
        primaryRole: newMemberData.talentRole,
        talentType: newMemberData.talentType,
        primaryGenres: newMemberData.genre,
        source: newMemberData.source,
        notes: newMemberData.notes,
        biography: newMemberData.biography,
        bankName: newMemberData.bankName,
        accountNumber: newMemberData.accountNumber,
        ifscCode: newMemberData.ifscCode,
        panNumber: newMemberData.panNumber,
        aadharNumber: newMemberData.aadharNumber,
        membershipType: newMemberData.tier?.toLowerCase().includes('tier 1') ? 'premium' : 
                       newMemberData.tier?.toLowerCase().includes('tier 2') ? 'basic' : 'vip',
        status: backendStatus
      };

      const response = await membersAPI.create(memberPayload);
      
      if (response.success) {
        toast.success('Member added successfully!');
        fetchMembers(); // Refresh the list
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.message || 'Failed to add member. Please try again.');
    }
  };

  const handleViewMember = (member) => {
    // Add member ID for display
    const memberId = member.memberNumber || 'N/A';
    const tier = member.tier || 'Tier 1';
    
    const transformedMember = {
      ...member,
      memberId,
      tier
    };
    
    setSelectedMember(transformedMember);
    setIsDetailModalOpen(true);
  };

  const handleEditMember = async (updatedData) => {
    try {
      // Map status values to match backend enum
      let backendStatus = updatedData.status?.toLowerCase() || 'updated';
      if (backendStatus === 'on hold') {
        backendStatus = 'inactive';
      }

      const memberPayload = {
        artistName: updatedData.fullName,
        email: updatedData.email,
        phone: updatedData.contactNumber,
        alternateNumber: updatedData.alternateNumber,
        location: updatedData.country,
        contactName: updatedData.aliasName,
        category: updatedData.category,
        tier: updatedData.tier,
        primaryRole: updatedData.talentRole,
        talentType: updatedData.talentType,
        primaryGenres: updatedData.genre,
        source: updatedData.source,
        notes: updatedData.notes,
        biography: updatedData.biography,
        bankName: updatedData.bankName,
        accountNumber: updatedData.accountNumber,
        ifscCode: updatedData.ifscCode,
        panNumber: updatedData.panNumber,
        aadharNumber: updatedData.aadharNumber,
        membershipType: updatedData.tier?.toLowerCase().includes('tier 1') ? 'premium' : 
                       updatedData.tier?.toLowerCase().includes('tier 2') ? 'basic' : 'vip',
        status: backendStatus
      };

      const response = await membersAPI.update(updatedData.id, memberPayload);
      
      if (response.success) {
        toast.success('Member updated successfully!');
        fetchMembers(); // Refresh the list
        setIsEditModalOpen(false);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error(error.response?.data?.message || 'Failed to update member. Please try again.');
    }
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleDeleteMember = async (memberId, memberName) => {
    const confirmed = await confirm({
      title: 'Delete Member',
      message: `Are you sure you want to delete ${memberName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (confirmed) {
      try {
        const response = await membersAPI.delete(memberId);
        if (response.success) {
          await fetchMembers();
          toast.success('Member deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting member:', error);
        toast.error('Failed to delete member');
      }
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase() || '';
    
    if (normalizedStatus === 'active' || normalizedStatus === 'updated') {
      return 'badge-success';
    } else if (normalizedStatus === 'inactive' || normalizedStatus === 'on hold') {
      return 'badge-warning';
    } else if (normalizedStatus === 'pending') {
      return 'badge-warning';
    } else {
      return 'badge bg-surface-lighter/50 text-text-muted border border-border';
    }
  };

  const getStatusDisplay = (status) => {
    const normalizedStatus = status?.toLowerCase() || '';
    
    if (normalizedStatus === 'active' || normalizedStatus === 'updated') {
      return 'Updated';
    } else if (normalizedStatus === 'inactive') {
      return 'On Hold';
    } else if (normalizedStatus === 'pending') {
      return 'Pending';
    } else {
      return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  // Clean and normalize tier values
  const cleanTierValue = (tier) => {
    if (!tier || tier === 'N/A') return 'N/A';
    const tierStr = tier.toString().toLowerCase();
    // Extract tier number from formats like "tier 3 - 500k" or "tier3"
    const tierMatch = tierStr.match(/tier\s*(\d+)/);
    if (tierMatch) {
      return `Tier ${tierMatch[1]}`;
    }
    return tier;
  };

  // Clean genre values - truncate long genre lists
  const cleanGenreValue = (genre) => {
    if (!genre || genre === 'N/A') return 'N/A';
    // If genre is too long, take first 2-3 genres
    const genreList = genre.split(',').map(g => g.trim());
    if (genreList.length > 2) {
      return genreList.slice(0, 2).join(', ') + '...';
    }
    return genre;
  };

  const getTierColor = (tier) => {
    const cleanTier = cleanTierValue(tier);
    switch (cleanTier) {
      case 'Tier 1':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-400/30';
      case 'Tier 2':
        return 'bg-purple-500/10 text-purple-400 border border-purple-400/30';
      case 'Tier 3':
        return 'bg-blue-500/10 text-blue-400 border border-blue-400/30';
      case 'Tier 4':
        return 'bg-green-500/10 text-green-400 border border-green-400/30';
      case 'Tier 5':
        return 'bg-orange-500/10 text-orange-400 border border-orange-400/30';
      case 'Tier 6':
        return 'bg-pink-500/10 text-pink-400 border border-pink-400/30';
      case 'Tier 7':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/30';
      case 'Tier 8':
        return 'bg-gray-500/10 text-gray-400 border border-gray-400/30';
      default:
        return 'bg-surface-lighter text-text-secondary border border-border';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="card shadow-lg shadow-brand-primary/10">
        {/* Search and Add Button Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-sm" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="input w-full text-sm pl-9"
            />
          </div>

          {/* Add Member Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center justify-center space-x-2 px-5 py-2 text-sm whitespace-nowrap"
          >
            <RiAddLine className="text-lg" />
            <span>Add Member</span>
          </button>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            className="select flex-1"
          >
            <option>All Status</option>
            <option>Updated</option>
            <option>On Hold</option>
            <option>Pending</option>
          </select>

          <select
            value={sourceFilter}
            onChange={handleFilterChange(setSourceFilter)}
            className="select flex-1"
          >
            <option>All Sources</option>
            {sourceOptions.map(item => (
              <option key={item._id} value={item.value}>{item.label}</option>
            ))}
          </select>

          <select
            value={tierFilter}
            onChange={handleFilterChange(setTierFilter)}
            className="select flex-1"
          >
            <option>All Tiers</option>
            {tierOptions.map(item => (
              <option key={item._id} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMember}
      />

      {/* View Member Modal */}
      <ViewMemberModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        member={selectedMember}
      />

      {/* Table - Desktop View */}
      <div className="hidden lg:block card shadow-lg shadow-brand-primary/10 overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-surface-lighter border-b border-border">
            <tr>
              <th onClick={() => handleSort('artistName')} className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider w-[22%] cursor-pointer select-none hover:text-text-primary transition-colors">
                <div className="flex items-center">Member<SortIcon active={sortConfig.key === 'artistName'} direction={sortConfig.direction} /></div>
              </th>
              <th className="text-left px-3 py-3 text-xs font-bold text-text-muted uppercase tracking-wider w-[11%]">
                Genre
              </th>
              <th className="text-left px-3 py-3 text-xs font-bold text-text-muted uppercase tracking-wider w-[11%]">
                Note
              </th>
              <th className="text-left px-3 py-3 text-xs font-bold text-text-muted uppercase tracking-wider w-[11%]">
                Talent Role
              </th>
              <th className="text-left px-3 py-3 text-xs font-bold text-text-muted uppercase tracking-wider w-[10%]">
                Tier
              </th>
              <th className="text-left px-3 py-3 text-xs font-bold text-text-muted uppercase tracking-wider w-[11%]">
                Source
              </th>
              <th className="text-left px-3 py-3 text-xs font-bold text-text-muted uppercase tracking-wider w-[11%]">
                Status
              </th>
              <th className="text-left px-3 py-3 text-xs font-bold text-text-muted uppercase tracking-wider w-[13%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-text-muted">
                  Loading members...
                </td>
              </tr>
            ) : currentMembers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-text-muted">
                  No members found. Click "Add Member" to create one.
                </td>
              </tr>
            ) : (
              currentMembers.map((member) => {
                const avatar = member.artistName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';
                const genre = cleanGenreValue(member.primaryGenres || 'N/A');
                const notes = member.notes || '';
                const talentRole = member.primaryRole || 'N/A';
                const source = member.source || 'N/A';
                const tier = cleanTierValue(member.tier || 'Tier 1');
                
                return (
                  <tr 
                    key={member._id} 
                    onClick={() => handleViewMember(member)}
                    className="table-row cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-shrink-0">
                          <div className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-bold w-9 h-9 rounded-full flex items-center justify-center text-xs shadow-md shadow-brand-primary/30">
                            {avatar}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-2.5 h-2.5 rounded-full border-2 border-surface"></div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-text-primary font-semibold text-sm truncate">{member.artistName}</div>
                          <div className="text-text-muted text-xs truncate">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-text-secondary text-sm truncate block max-w-[150px]" title={member.primaryGenres}>{genre}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-text-secondary text-sm truncate block">{notes}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-text-secondary text-sm truncate block">{talentRole}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${getTierColor(tier)}`}>
                        {tier}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-text-secondary text-sm truncate block">{source}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`${getStatusColor(member.status)}`}>
                        {getStatusDisplay(member.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMember(member);
                          }}
                          className="text-text-muted hover:text-brand-accent transition-colors"
                        >
                          <RiEyeLine className="text-lg" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(member);
                          }}
                          className="text-text-muted hover:text-brand-accent transition-colors"
                        >
                          <RiEditLine className="text-lg" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMember(member._id, member.artistName);
                          }}
                          className="text-text-muted hover:text-red-400 transition-colors"
                        >
                          <RiDeleteBinLine className="text-lg" />
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
          <div className="card shadow-md text-center text-text-muted">
            Loading members...
          </div>
        ) : currentMembers.length === 0 ? (
          <div className="card shadow-md text-center text-text-muted">
            No members found. Click "Add Member" to create one.
          </div>
        ) : (
          currentMembers.map((member) => {
            const avatar = member.artistName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';
            const tier = cleanTierValue(member.tier || 'Tier 1');
            
            return (
              <div 
                key={member._id}
                onClick={() => handleViewMember(member)}
                className="card-hover shadow-md cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-bold w-12 h-12 rounded-full flex items-center justify-center text-sm shadow-md shadow-brand-primary/30">
                        {avatar}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-3 h-3 rounded-full border-2 border-surface"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-text-primary font-bold text-base truncate">{member.artistName}</div>
                      <div className="text-text-muted text-sm truncate">{member.email || 'No email'}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getTierColor(tier)}`}>
                    {tier}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <span className="text-text-muted font-medium">Genre:</span>
                    <span className="text-text-primary ml-1">{member.primaryGenres || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted font-medium">Role:</span>
                    <span className="text-text-primary ml-1">{member.primaryRole || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted font-medium">Source:</span>
                    <span className="text-text-primary ml-1">{member.source || 'N/A'}</span>
                  </div>
                  <div>
                    <span className={`${getStatusColor(member.status)}`}>
                      {getStatusDisplay(member.status)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-3 border-t border-border">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewMember(member);
                    }}
                    className="flex-1 flex items-center justify-center space-x-1 text-text-muted hover:text-brand-accent py-2 transition-colors"
                  >
                    <RiEyeLine className="text-lg" />
                    <span className="text-sm font-medium">View</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(member);
                    }}
                    className="flex-1 flex items-center justify-center space-x-1 text-text-muted hover:text-brand-accent py-2 transition-colors"
                  >
                    <RiEditLine className="text-lg" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMember(member._id, member.artistName);
                    }}
                    className="flex-1 flex items-center justify-center space-x-1 text-text-muted hover:text-red-400 py-2 transition-colors"
                  >
                    <RiDeleteBinLine className="text-lg" />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="card shadow-lg shadow-brand-primary/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="text-sm text-text-muted font-medium">
            Showing <span className="font-semibold text-text-primary">{startIndex + 1}</span> to <span className="font-semibold text-text-primary">{Math.min(endIndex, filteredMembers.length)}</span> of <span className="font-semibold text-text-primary">{filteredMembers.length}</span> members
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">Per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2.5 py-1 bg-surface-card border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
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
              if (currentPage > 3) pages.push('...');
              const start = Math.max(2, currentPage - 1);
              const end = Math.min(totalPages - 1, currentPage + 1);
              for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
              }
              if (currentPage < totalPages - 2) pages.push('...');
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

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}
        onSubmit={handleEditMember}
        member={selectedMember}
      />
    </div>
  );
};

export default MemberManagement;
