import { useState } from 'react';
import { RiSearchLine, RiEyeLine, RiEditLine, RiAddLine } from 'react-icons/ri';
import AddMemberModal from '../components/AddMemberModal';
import MemberDetailModal from '../components/MemberDetailModal';
import EditMemberModal from '../components/EditMemberModal';

const MemberManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [tierFilter, setTierFilter] = useState('All Tiers');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Sunidhi Chauhan',
      email: 'scofficial@gmail.com',
      avatar: 'SC',
      iprsId: 'IPR4556B',
      category: 'Premier',
      talentRole: 'Singer, Music Composer',
      tier: 'Tier 1',
      source: 'Personal Reference',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Arijit Singh',
      email: 'arijit.official@gmail.com',
      avatar: 'AS',
      iprsId: 'IPR7823A',
      category: 'Premier',
      talentRole: 'Singer, Composer',
      tier: 'Tier 1',
      source: 'Curated Artist',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Shreya Ghoshal',
      email: 'shreya.music@gmail.com',
      avatar: 'SG',
      iprsId: 'IPR9012C',
      category: 'Premier',
      talentRole: 'Singer',
      tier: 'Tier 1',
      source: 'Open Inbound',
      status: 'Active',
    },
    {
      id: 4,
      name: 'Badshah',
      email: 'badshah.rap@gmail.com',
      avatar: 'BD',
      iprsId: 'IPR3456D',
      category: 'Elite',
      talentRole: 'Rapper, Composer',
      tier: 'Tier 2',
      source: 'Special Curated',
      status: 'On Hold',
    },
    {
      id: 5,
      name: 'Neha Kakkar',
      email: 'neha.singer@gmail.com',
      avatar: 'NK',
      iprsId: 'IPR5678E',
      category: 'Premier',
      talentRole: 'Singer',
      tier: 'Tier 1',
      source: 'Open Inbound',
      status: 'Pending',
    },
    {
      id: 6,
      name: 'Vishal Dadlani',
      email: 'vishal.music@gmail.com',
      avatar: 'VD',
      iprsId: 'IPR6789F',
      category: 'Premier',
      talentRole: 'Singer, Composer',
      tier: 'Tier 1',
      source: 'Curated Artist',
      status: 'Active',
    },
    {
      id: 7,
      name: 'Neeti Mohan',
      email: 'neeti.singer@gmail.com',
      avatar: 'NM',
      iprsId: 'IPR7890G',
      category: 'Premier',
      talentRole: 'Singer',
      tier: 'Tier 2',
      source: 'Personal Reference',
      status: 'Active',
    },
    {
      id: 8,
      name: 'Armaan Malik',
      email: 'armaan.music@gmail.com',
      avatar: 'AM',
      iprsId: 'IPR8901H',
      category: 'Premier',
      talentRole: 'Singer',
      tier: 'Tier 1',
      source: 'Open Inbound',
      status: 'Active',
    },
    {
      id: 9,
      name: 'Yo Yo Honey Singh',
      email: 'yoyo.rapper@gmail.com',
      avatar: 'YY',
      iprsId: 'IPR9012I',
      category: 'Elite',
      talentRole: 'Rapper, Music Producer',
      tier: 'Tier 1',
      source: 'Special Curated',
      status: 'On Hold',
    },
    {
      id: 10,
      name: 'Tulsi Kumar',
      email: 'tulsi.singer@gmail.com',
      avatar: 'TK',
      iprsId: 'IPR0123J',
      category: 'Premier',
      talentRole: 'Singer',
      tier: 'Tier 2',
      source: 'Personal Reference',
      status: 'Active',
    },
  ]);

  const itemsPerPage = 5;

  // Filter members based on search query, status, and tier
  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.iprsId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || member.status === statusFilter;
    const matchesTier = tierFilter === 'All Tiers' || member.tier === tierFilter;
    
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

  const handleAddMember = (newMemberData) => {
    const newMember = {
      id: members.length + 1,
      name: newMemberData.fullName,
      email: newMemberData.email,
      avatar: newMemberData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      iprsId: `IPR${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      category: newMemberData.category,
      talentRole: newMemberData.talentRole,
      tier: newMemberData.tier,
      source: newMemberData.source,
      status: newMemberData.status,
    };
    
    setMembers([newMember, ...members]);
    setIsModalOpen(false);
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
  };

  const handleEditMember = (updatedData) => {
    setMembers(members.map(member => 
      member.id === updatedData.id 
        ? { 
            ...member, 
            name: updatedData.fullName,
            email: updatedData.email,
            category: updatedData.category,
            talentRole: updatedData.talentRole,
            tier: updatedData.tier,
            source: updatedData.source,
            status: updatedData.status,
            avatar: updatedData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          }
        : member
    ));
    setIsEditModalOpen(false);
    setSelectedMember(null);
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
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
    <div className="p-6">
      {/* Filters Section */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Left Section - Search and Filters */}
          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative w-72">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-slate-700 text-white text-sm pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              className="bg-slate-700 text-white text-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>On Hold</option>
              <option>Pending</option>
            </select>

            <select
              value={tierFilter}
              onChange={handleFilterChange(setTierFilter)}
              className="bg-slate-700 text-white text-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option>All Tiers</option>
              <option>Tier 1</option>
              <option>Tier 2</option>
              <option>Tier 3</option>
            </select>
          </div>

          {/* Right Section - Add Member Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <RiAddLine className="text-lg" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMember}
      />

      {/* Member Detail Modal */}
      <MemberDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        member={selectedMember}
      />

      {/* Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full table-fixed">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[18%]">
                Member
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[10%]">
                IPRS ID
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[10%]">
                Category
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[14%]">
                Talent Role
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[8%]">
                Tier
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[13%]">
                Source
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[10%]">
                Status
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[8%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {currentMembers.map((member) => (
              <tr 
                key={member.id} 
                onClick={() => handleViewMember(member)}
                className="hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-shrink-0">
                      <div className="bg-slate-700 text-white font-semibold w-9 h-9 rounded-full flex items-center justify-center text-xs">
                        {member.avatar}
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
                  <span className="text-blue-400 font-medium text-sm">{member.iprsId}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-gray-300 text-sm">{member.category}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-gray-300 text-sm truncate block">{member.talentRole}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getTierColor(member.tier)}`}>
                    {member.tier}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-gray-300 text-sm truncate block">{member.source}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(member.status)}`}>
                    {member.status}
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-t border-slate-700">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} members
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 hover:border-slate-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-slate-600"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
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
              className="px-4 py-2 text-sm border border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 hover:border-slate-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-slate-600"
            >
              Next
            </button>
          </div>
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
