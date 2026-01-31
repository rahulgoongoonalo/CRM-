import { useState, useEffect } from 'react';
import { RiSearchLine, RiEyeLine, RiEditLine, RiAddLine, RiDeleteBinLine } from 'react-icons/ri';
import AddMemberModal from '../components/AddMemberModal';
import ViewMemberModal from '../components/ViewMemberModal';
import EditMemberModal from '../components/EditMemberModal';
import { membersAPI } from '../services/api';

const MemberManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [tierFilter, setTierFilter] = useState('All Tiers');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const itemsPerPage = 5;

  // Filter members based on search query, status, and tier
  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Map status filter to backend enum values
    let matchesStatus = true;
    if (statusFilter !== 'All Status') {
      const filterStatus = statusFilter.toLowerCase();
      const memberStatus = member.status?.toLowerCase();
      
      if (filterStatus === 'active') {
        matchesStatus = memberStatus === 'active';
      } else if (filterStatus === 'on hold') {
        matchesStatus = memberStatus === 'inactive';
      } else if (filterStatus === 'pending') {
        matchesStatus = memberStatus === 'pending';
      }
    }
    
    // Map tier filter to membership type
    let matchesTier = true;
    if (tierFilter !== 'All Tiers') {
      if (tierFilter === 'Tier 1') {
        matchesTier = member.membershipType === 'premium';
      } else if (tierFilter === 'Tier 2') {
        matchesTier = member.membershipType === 'basic';
      } else if (tierFilter === 'Tier 3') {
        matchesTier = member.membershipType === 'vip';
      }
    }
    
    return matchesSearch && matchesStatus && matchesTier;
  });

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
        name: newMemberData.fullName,
        email: newMemberData.email,
        phone: newMemberData.contactNumber,
        alternateNumber: newMemberData.alternateNumber,
        address: newMemberData.country,
        aliasName: newMemberData.aliasName,
        category: newMemberData.category,
        tier: newMemberData.tier,
        talentRole: newMemberData.talentRole,
        talentType: newMemberData.talentType,
        genre: newMemberData.genre,
        source: newMemberData.source,
        spoc: newMemberData.spoc,
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
        alert('Member added successfully!');
        fetchMembers(); // Refresh the list
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert(error.response?.data?.message || 'Failed to add member. Please try again.');
    }
  };

  const handleViewMember = (member) => {
    // Add IPRS ID and tier for display
    const iprsId = `IPR${member._id?.slice(-4).toUpperCase()}` || 'N/A';
    const tier = member.membershipType === 'premium' ? 'Tier 1' : 
                member.membershipType === 'basic' ? 'Tier 2' : 'Tier 3';
    
    const transformedMember = {
      ...member,
      iprsId,
      tier
    };
    
    setSelectedMember(transformedMember);
    setIsDetailModalOpen(true);
  };

  const handleEditMember = async (updatedData) => {
    try {
      // Map status values to match backend enum
      let backendStatus = updatedData.status?.toLowerCase() || 'active';
      if (backendStatus === 'on hold') {
        backendStatus = 'inactive';
      }

      const memberPayload = {
        name: updatedData.fullName,
        email: updatedData.email,
        phone: updatedData.contactNumber,
        alternateNumber: updatedData.alternateNumber,
        address: updatedData.country,
        aliasName: updatedData.aliasName,
        category: updatedData.category,
        tier: updatedData.tier,
        talentRole: updatedData.talentRole,
        talentType: updatedData.talentType,
        genre: updatedData.genre,
        source: updatedData.source,
        spoc: updatedData.spoc,
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
        alert('Member updated successfully!');
        fetchMembers(); // Refresh the list
        setIsEditModalOpen(false);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      alert(error.response?.data?.message || 'Failed to update member. Please try again.');
    }
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to delete ${memberName}? This action cannot be undone.`)) {
      try {
        const response = await membersAPI.delete(memberId);
        if (response.success) {
          await fetchMembers();
          alert('Member deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Failed to delete member');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'On Hold':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Tier 1':
        return 'bg-amber-600 text-white';
      case 'Tier 2':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-slate-800 rounded-lg p-4">
        {/* Search and Add Button Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-slate-700 text-white text-sm pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add Member Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
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
            className="flex-1 bg-slate-700 text-white text-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>On Hold</option>
            <option>Pending</option>
          </select>

          <select
            value={tierFilter}
            onChange={handleFilterChange(setTierFilter)}
            className="flex-1 bg-slate-700 text-white text-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option>All Tiers</option>
            <option>Tier 1</option>
            <option>Tier 2</option>
            <option>Tier 3</option>
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
      <div className="hidden lg:block bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full table-fixed">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[22%]">
                Member
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[11%]">
                Genre
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[11%]">
                Note
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[11%]">
                Talent Role
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[10%]">
                Tier
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[11%]">
                Source
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[11%]">
                Status
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[13%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                  Loading members...
                </td>
              </tr>
            ) : currentMembers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                  No members found. Click "Add Member" to create one.
                </td>
              </tr>
            ) : (
              currentMembers.map((member) => {
                const avatar = member.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';
                const genre = member.genre || 'N/A';
                const spoc = member.spoc || 'N/A';
                const talentRole = member.talentRole || 'N/A';
                const source = member.source || 'N/A';
                const tier = member.membershipType === 'premium' ? 'Tier 1' : 
                            member.membershipType === 'basic' ? 'Tier 2' : 'Tier 3';
                
                return (
                  <tr 
                    key={member._id} 
                    onClick={() => handleViewMember(member)}
                    className="hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-shrink-0">
                          <div className="bg-slate-700 text-white font-semibold w-9 h-9 rounded-full flex items-center justify-center text-xs">
                            {avatar}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-slate-800"></div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-medium text-sm truncate">{member.name}</div>
                          <div className="text-gray-400 text-xs truncate">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-gray-300 text-sm">{genre}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-gray-300 text-sm truncate block">{spoc}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-gray-300 text-sm truncate block">{talentRole}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getTierColor(tier)}`}>
                        {tier}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-gray-300 text-sm truncate block">{source}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(member.status)}`}>
                        {member.status?.charAt(0).toUpperCase() + member.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMember(member);
                          }}
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <RiEyeLine className="text-lg" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(member);
                          }}
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <RiEditLine className="text-lg" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMember(member._id, member.name);
                          }}
                          className="text-gray-400 hover:text-red-400 transition-colors"
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
          <div className="bg-slate-800 rounded-lg p-6 text-center text-gray-400">
            Loading members...
          </div>
        ) : currentMembers.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-6 text-center text-gray-400">
            No members found. Click "Add Member" to create one.
          </div>
        ) : (
          currentMembers.map((member) => {
            const avatar = member.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';
            const tier = member.membershipType === 'premium' ? 'Tier 1' : 
                        member.membershipType === 'basic' ? 'Tier 2' : 'Tier 3';
            
            return (
              <div 
                key={member._id}
                onClick={() => handleViewMember(member)}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="bg-slate-700 text-white font-semibold w-12 h-12 rounded-full flex items-center justify-center text-sm">
                        {avatar}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-3 h-3 rounded-full border-2 border-slate-800"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-semibold text-base truncate">{member.name}</div>
                      <div className="text-gray-400 text-sm truncate">{member.email || 'No email'}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getTierColor(tier)}`}>
                    {tier}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <span className="text-gray-400">Genre:</span>
                    <span className="text-white ml-1">{member.genre || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Role:</span>
                    <span className="text-white ml-1">{member.talentRole || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Source:</span>
                    <span className="text-white ml-1">{member.source || 'N/A'}</span>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(member.status)}`}>
                      {member.status?.charAt(0).toUpperCase() + member.status?.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-3 border-t border-slate-700">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewMember(member);
                    }}
                    className="flex-1 flex items-center justify-center space-x-1 text-gray-400 hover:text-blue-400 py-2 transition-colors"
                  >
                    <RiEyeLine className="text-lg" />
                    <span className="text-sm">View</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(member);
                    }}
                    className="flex-1 flex items-center justify-center space-x-1 text-gray-400 hover:text-blue-400 py-2 transition-colors"
                  >
                    <RiEditLine className="text-lg" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMember(member._id, member.name);
                    }}
                    className="flex-1 flex items-center justify-center space-x-1 text-gray-400 hover:text-red-400 py-2 transition-colors"
                  >
                    <RiDeleteBinLine className="text-lg" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="bg-slate-800 rounded-lg px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-700">
        <div className="text-sm text-gray-400 text-center sm:text-left">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} members
        </div>
        <div className="flex items-center space-x-2 flex-wrap justify-center">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 md:px-4 py-2 text-xs md:text-sm border border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 hover:border-slate-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-slate-600"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button 
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white border border-blue-500' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700 border border-slate-600 hover:border-slate-500'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 md:px-4 py-2 text-xs md:text-sm border border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 hover:border-slate-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-slate-600"
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
