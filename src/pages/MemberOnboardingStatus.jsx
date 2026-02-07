import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowLeftLine, RiFilterLine, RiSearchLine, RiDownloadLine } from 'react-icons/ri';
import { getOnboardingStatusReport } from '../services/api';

const MemberOnboardingStatus = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchReportData();
  }, []);

  useEffect(() => {
    filterData();
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filterStatus, filterTier, reportData]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await getOnboardingStatusReport();
      if (response.success) {
        setReportData(response.data);
        setFilteredData(response.data);
      }
    } catch (error) {
      console.error('Error fetching onboarding status report:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...reportData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.spoc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.onboardingStatus === filterStatus);
    }

    // Tier filter
    if (filterTier !== 'all') {
      filtered = filtered.filter(item => item.tier.toLowerCase() === filterTier.toLowerCase());
    }

    setFilteredData(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Contact Established': 'bg-blue-500/10 text-blue-400 border-blue-400/20',
      'SPOC Assigned': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
      'Review L2': 'bg-yellow-500/10 text-yellow-400 border-yellow-400/20',
      'Closed Won': 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
      'Closed Lost': 'bg-red-500/10 text-red-400 border-red-400/20',
      'Pending': 'bg-orange-500/10 text-orange-400 border-orange-400/20'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-400/20';
  };

  const getTierColor = (tier) => {
    const tierKey = tier.toLowerCase();
    const colors = {
      'tier1': 'bg-yellow-500/10 text-yellow-400',
      'tier2': 'bg-purple-500/10 text-purple-400',
      'tier3': 'bg-blue-500/10 text-blue-400',
      'tier4': 'bg-green-500/10 text-green-400',
      'tier5': 'bg-orange-500/10 text-orange-400',
      'tier6': 'bg-pink-500/10 text-pink-400',
      'tier7': 'bg-cyan-500/10 text-cyan-400',
      'tier8': 'bg-gray-500/10 text-gray-400'
    };
    return colors[tierKey] || 'bg-gray-500/10 text-gray-400';
  };

  const getTierLabel = (tier) => {
    if (tier === 'N/A') return 'N/A';
    const tierKey = tier.toLowerCase();
    const match = tierKey.match(/tier(\d+)/);
    return match ? `Tier ${match[1]}` : tier.toUpperCase();
  };

  const getDaysColor = (days) => {
    if (days === 'N/A') return 'text-text-secondary';
    const numDays = parseInt(days);
    if (numDays > 0) return 'text-red-400'; // Overdue
    if (numDays < 0 && numDays >= -7) return 'text-yellow-400'; // Due soon
    return 'text-emerald-400'; // On track
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Number of page buttons to show
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const exportToCSV = () => {
    const headers = ['Serial No', 'Artist Name', 'Genre', 'Source', 'SPOC', 'Tier', 'Onboarding Status', 'ETA Closure', 'Days from ETA'];
    const csvData = filteredData.map(item => [
      item.serialNo,
      item.artistName,
      item.genre,
      item.source,
      item.spoc,
      item.tier,
      item.onboardingStatus,
      item.etaClosure,
      item.daysFromETA
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `member_onboarding_status_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/reporting')}
          className="flex items-center text-text-secondary hover:text-brand-accent transition-colors mb-4"
        >
          <RiArrowLeftLine className="mr-2" />
          Back to Reports
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Member Onboarding Status</h1>
            <p className="text-text-secondary">Comprehensive overview of all member onboarding activities</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg transition-colors"
          >
            <RiDownloadLine className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-card rounded-lg p-4 border border-border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by artist, genre, or SPOC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-lighter border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-lighter border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Contact Established">Contact Established</option>
              <option value="SPOC Assigned">SPOC Assigned</option>
              <option value="Review L2">Review L2</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>

          {/* Tier Filter */}
          <div className="relative">
            <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-lighter border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="tier1">Tier 1</option>
              <option value="tier2">Tier 2</option>
              <option value="tier3">Tier 3</option>
              <option value="tier4">Tier 4</option>
              <option value="tier5">Tier 5</option>
              <option value="tier6">Tier 6</option>
              <option value="tier7">Tier 7</option>
              <option value="tier8">Tier 8</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-card rounded-lg p-4 border border-border">
          <div className="text-text-secondary text-sm mb-1">Total Records</div>
          <div className="text-2xl font-bold text-text-primary">{filteredData.length}</div>
        </div>
        <div className="bg-surface-card rounded-lg p-4 border border-border">
          <div className="text-text-secondary text-sm mb-1">Active Onboarding</div>
          <div className="text-2xl font-bold text-brand-accent">
            {filteredData.filter(item => !['Closed Won', 'Closed Lost'].includes(item.onboardingStatus)).length}
          </div>
        </div>
        <div className="bg-surface-card rounded-lg p-4 border border-border">
          <div className="text-text-secondary text-sm mb-1">Closed Won</div>
          <div className="text-2xl font-bold text-emerald-400">
            {filteredData.filter(item => item.onboardingStatus === 'Closed Won').length}
          </div>
        </div>
        <div className="bg-surface-card rounded-lg p-4 border border-border">
          <div className="text-text-secondary text-sm mb-1">Overdue</div>
          <div className="text-2xl font-bold text-red-400">
            {filteredData.filter(item => typeof item.daysFromETA === 'number' && item.daysFromETA > 0).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              No onboarding records found
            </div>
          ) : (
            <table className="w-full table-fixed">
              <thead className="bg-surface-lighter border-b border-border sticky top-0">
                <tr>
                  <th className="w-16 px-3 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">S.No</th>
                  <th className="w-48 px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Artist Name</th>
                  <th className="w-56 px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Genre</th>
                  <th className="w-32 px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Source</th>
                  <th className="w-32 px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">SPOC</th>
                  <th className="w-24 px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Tier</th>
                  <th className="w-40 px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="w-32 px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">ETA Closure</th>
                  <th className="w-32 px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Days from ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface-card">
                {paginatedData.map((item, index) => (
                  <tr key={index} className="hover:bg-surface-lighter transition-colors">
                    <td className="px-3 py-4 text-sm text-text-primary font-medium">{item.serialNo}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-text-primary font-medium truncate" title={item.artistName}>
                        {item.artistName}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-text-secondary line-clamp-2" title={item.genre}>
                        {item.genre}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-text-secondary truncate" title={item.source}>
                        {item.source}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-text-secondary truncate" title={item.spoc}>
                        {item.spoc}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getTierColor(item.tier)}`}>
                        {getTierLabel(item.tier)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(item.onboardingStatus)}`}>
                        {item.onboardingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-secondary whitespace-nowrap">{item.etaClosure}</td>
                    <td className="px-4 py-4">
                      <span className={`text-sm font-bold whitespace-nowrap ${getDaysColor(item.daysFromETA)}`}>
                        {item.daysFromETA !== 'N/A' ? `${item.daysFromETA} days` : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-text-secondary">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} records
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-text-secondary">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 bg-surface-lighter border border-border rounded text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded bg-surface-lighter border border-border text-text-primary hover:bg-surface-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-2 rounded border transition-colors ${
                    currentPage === page
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-surface-lighter border-border text-text-primary hover:bg-surface-card'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded bg-surface-lighter border border-border text-text-primary hover:bg-surface-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberOnboardingStatus;
