import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowLeftLine, RiFilterLine, RiSearchLine, RiDownloadLine, RiFileExcel2Line } from 'react-icons/ri';
import { getOnboardingStatusReport, getFullExportData } from '../services/api';

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
      'Hot': 'bg-red-500/10 text-red-400 border-red-400/20',
      'Warm': 'bg-amber-500/10 text-amber-400 border-amber-400/20',
      'Cold': 'bg-blue-500/10 text-blue-400 border-blue-400/20'
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

  const [fullExportLoading, setFullExportLoading] = useState(false);

  const exportFullData = async () => {
    try {
      setFullExportLoading(true);
      const response = await getFullExportData();
      if (!response.success || !response.data.length) {
        alert('No data available for export');
        return;
      }

      const data = response.data;

      // Define all column headers grouped by section
      const headers = [
        // Onboarding Info
        'S.No', 'Task No', 'Artist Name', 'SPOC', 'Onboarding Status', 'ETA Closure', 'Days from ETA',
        'Onboarding Description', 'Onboarding Notes',
        // Member Data
        'Member No', 'Email', 'Phone', 'Alternate Number', 'Location', 'Country',
        'Contact Name', 'Category', 'Tier', 'Primary Role', 'Talent Type', 'Primary Genres',
        'Source', 'Biography', 'Member Status', 'Join Date',
        'Instagram Followers', 'Spotify Monthly Listeners', 'YouTube Subscribers',
        'Facebook Followers', 'Twitter Followers', 'SoundCloud Followers',
        'Bank Name', 'Account Number', 'IFSC Code', 'PAN Number', 'Aadhar Number',
        // Step 1
        'Step1 - Source', 'Step1 - Contact Status', 'Step1 - Notes',
        // L1 Questionnaire
        'L1 - Artist Name', 'L1 - Primary Contact', 'L1 - Email', 'L1 - Phone',
        'L1 - City/Country', 'L1 - Years Active', 'L1 - Artist Bio', 'L1 - Listener Region',
        'L1 - Has Manager', 'L1 - Manager Name', 'L1 - Has Label', 'L1 - Label Name',
        'L1 - Primary Role', 'L1 - Primary Genres', 'L1 - Languages', 'L1 - Sub Genre',
        'L1 - Streaming Link', 'L1 - YouTube', 'L1 - Instagram', 'L1 - Facebook',
        'L1 - Twitter', 'L1 - SoundCloud', 'L1 - Other Platforms',
        'L1 - Has Distributor', 'L1 - Distributor Name', 'L1 - Has Contracts', 'L1 - Contract Valid Until',
        'L1 - Exclusive Releases', 'L1 - Open To Collabs', 'L1 - Perform Live',
        'L1 - Upcoming Project', 'L1 - Interested In Gatecrash', 'L1 - Why Goongoonalo',
        'L1 - How Heard', 'L1 - Other Info',
        'L1 - Bank Name', 'L1 - Account Number', 'L1 - IFSC Code', 'L1 - PAN Number', 'L1 - Aadhar Number',
        'L1 - Confirm Rights', 'L1 - Accept Terms', 'L1 - Consent Editorial', 'L1 - Understand Payout',
        // L2 Review
        'L2 - Meeting Scheduled On', 'L2 - Meeting Type',
        'L2 - Catalog Review', 'L2 - Rights Ownership', 'L2 - Commercial Data',
        'L2 - Contract Discussion', 'L2 - Tech Onboarding', 'L2 - Content Ingestion',
        'L2 - Membership Type', 'L2 - Notes', 'L2 - Closure Checklist',
        'L2 - Documents Count', 'L2 - Document Titles'
      ];

      const rows = data.map(item => [
        item.serialNo, item.taskNumber, item.artistName, item.spoc,
        item.onboardingStatus, item.etaClosure, item.daysFromETA,
        item.onboardingDescription, item.onboardingNotes,
        // Member
        item.memberNumber, item.email, item.phone, item.alternateNumber,
        item.location, item.country, item.contactName, item.category,
        item.tier, item.primaryRole, item.talentType, item.primaryGenres,
        item.source, item.biography, item.memberStatus, item.joinDate,
        item.instagramFollowers, item.spotifyMonthlyListeners, item.youtubeSubscribers,
        item.facebookFollowers, item.twitterFollowers, item.soundcloudFollowers,
        item.bankName, item.accountNumber, item.ifscCode, item.panNumber, item.aadharNumber,
        // Step 1
        item.step1Source, item.step1ContactStatus, item.step1Notes,
        // L1
        item.l1ArtistName, item.l1PrimaryContact, item.l1Email, item.l1Phone,
        item.l1CityCountry, item.l1YearsActive, item.l1ArtistBio, item.l1ListenerRegion,
        item.l1HasManager, item.l1ManagerName, item.l1HasLabel, item.l1LabelName,
        item.l1PrimaryRole, item.l1PrimaryGenres, item.l1Languages, item.l1SubGenre,
        item.l1StreamingLink, item.l1Youtube, item.l1Instagram, item.l1Facebook,
        item.l1Twitter, item.l1Soundcloud, item.l1OtherPlatforms,
        item.l1HasDistributor, item.l1DistributorName, item.l1HasContracts, item.l1ContractValidUntil,
        item.l1ExclusiveReleases, item.l1OpenToCollabs, item.l1PerformLive,
        item.l1UpcomingProject, item.l1InterestedInGatecrash, item.l1WhyGoongoonalo,
        item.l1HowHeard, item.l1OtherInfo,
        item.l1BankName, item.l1AccountNumber, item.l1IfscCode, item.l1PanNumber, item.l1AadharNumber,
        item.l1ConfirmRights, item.l1AcceptTerms, item.l1ConsentEditorial, item.l1UnderstandPayout,
        // L2
        item.l2MeetingScheduledOn, item.l2MeetingType,
        item.l2CatalogReview, item.l2RightsOwnership, item.l2CommercialData,
        item.l2ContractDiscussion, item.l2TechOnboarding, item.l2ContentIngestion,
        item.l2MembershipType, item.l2Notes, item.l2ClosureChecklist,
        item.l2DocumentsCount, item.l2DocumentTitles
      ]);

      // Escape CSV values
      const escapeCSV = (val) => {
        const str = val == null ? '' : String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return '"' + str + '"';
      };

      const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
      ].join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `full_member_onboarding_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting full data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setFullExportLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        {/* <button
          onClick={() => navigate('/reporting')}
          className="flex items-center text-text-secondary hover:text-brand-accent transition-colors mb-4"
        >
          <RiArrowLeftLine className="mr-2" />
          Back to Reports
        </button> */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Member Onboarding Status</h1>
            <p className="text-text-secondary">Comprehensive overview of all member onboarding activities</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportFullData}
              disabled={fullExportLoading}
              className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-wait text-white rounded-lg transition-colors"
            >
              <RiFileExcel2Line className="mr-2" />
              {fullExportLoading ? 'Exporting...' : 'Export All Data'}
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg transition-colors"
            >
              <RiDownloadLine className="mr-2" />
              Export CSV
            </button>
          </div>
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
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
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
