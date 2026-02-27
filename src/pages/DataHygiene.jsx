import { useState, useEffect, useRef, useMemo } from 'react';
import { RiShieldCheckLine, RiSearchLine, RiEditLine, RiCheckLine, RiPencilLine, RiArrowUpSLine, RiArrowDownSLine, RiFilterLine, RiCloseLine, RiDownloadLine, RiUploadLine } from 'react-icons/ri';
import { membersAPI } from '../services/api';
import { useToast } from '../components/ToastNotification';

const SOCIAL_COLUMNS = [
  { key: 'instagramFollowers', label: 'Instagram Followers' },
  { key: 'spotifyMonthlyListeners', label: 'Spotify Monthly Listeners' },
  { key: 'youtubeSubscribers', label: 'YouTube Subscribers' },
  { key: 'facebookFollowers', label: 'Facebook Followers' },
  { key: 'twitterFollowers', label: 'Twitter Followers' },
  { key: 'soundcloudFollowers', label: 'SoundCloud Followers' },
];

const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return '—';
  return Number(num).toLocaleString('en-IN');
};

const EditableCell = ({ value, memberId, field, onSave, editing: rowEditing, onEditAttempt }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const startEdit = () => {
    if (!rowEditing) {
      onEditAttempt?.();
      return;
    }
    setEditValue(value !== null && value !== undefined ? String(value) : '');
    setEditing(true);
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = async () => {
    const numValue = editValue.trim() === '' ? null : Number(editValue);
    if (editValue.trim() !== '' && isNaN(numValue)) {
      setEditing(false);
      return;
    }
    if (numValue === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(memberId, field, numValue);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') setEditing(false);
  };

  const isEmpty = value === null || value === undefined || value === 0;

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={save}
        disabled={saving}
        className="w-full px-2.5 py-1.5 bg-surface border-2 border-brand-primary/60 rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    );
  }

  return (
    <div
      onClick={startEdit}
      className={`px-2.5 py-1.5 rounded-lg text-sm text-center transition-all cursor-pointer ${
        isEmpty
          ? 'bg-red-500/8 text-text-muted border border-dashed border-red-500/20'
          : 'text-text-primary font-medium'
      } ${rowEditing && !isEmpty ? 'hover:bg-brand-primary/10 hover:ring-1 hover:ring-brand-primary/30' : ''}
        ${rowEditing && isEmpty ? 'hover:bg-red-500/15 hover:border-red-500/40' : ''}
        ${!rowEditing ? 'hover:bg-surface-lighter/60' : ''}`}
    >
      {formatNumber(value)}
    </div>
  );
};

const SortIcon = ({ active, direction }) => {
  if (!active) {
    return (
      <div className="flex flex-col -space-y-1.5 text-text-muted/40">
        <RiArrowUpSLine className="text-xs" />
        <RiArrowDownSLine className="text-xs" />
      </div>
    );
  }
  return (
    <div className="flex flex-col -space-y-1.5">
      <RiArrowUpSLine className={`text-xs ${direction === 'asc' ? 'text-brand-primary' : 'text-text-muted/30'}`} />
      <RiArrowDownSLine className={`text-xs ${direction === 'desc' ? 'text-brand-primary' : 'text-text-muted/30'}`} />
    </div>
  );
};

const DataHygiene = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRowId, setEditingRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // key: column key, direction: 'asc' | 'desc'
  const [sourceFilter, setSourceFilter] = useState(''); // '' means all
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const sourceDropdownRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const editNotifyRef = useRef(null);

  // --- CSV FUNCTIONS ---
  const CSV_HEADERS = ['Member Number', 'Artist Name', ...SOCIAL_COLUMNS.map(c => c.label)];

  const escapeCsvField = (val) => {
    const str = val === null || val === undefined ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleDownloadSampleCSV = () => {
    if (members.length === 0) {
      toast.error('No members available to export');
      return;
    }
    const header = CSV_HEADERS.join(',');
    const rows = members.map(m => {
      const fields = [
        m.memberNumber || '',
        escapeCsvField(m.artistName || ''),
        ...SOCIAL_COLUMNS.map(col => m[col.key] !== null && m[col.key] !== undefined ? m[col.key] : '')
      ];
      return fields.join(',');
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_hygiene_sample_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Sample CSV downloaded with ${members.length} members`);
  };

  const parseCsvLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleUploadCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = '';

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a .csv file');
      return;
    }

    setUploading(true);
    setUploadErrors([]);

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

      if (lines.length < 2) {
        toast.error('CSV file is empty or has no data rows');
        setUploading(false);
        return;
      }

      // Validate header
      const headerFields = parseCsvLine(lines[0]);
      const expectedCols = CSV_HEADERS.length;
      if (headerFields.length < expectedCols) {
        toast.error(`CSV must have ${expectedCols} columns. Found ${headerFields.length}. Please use the Sample CSV format.`);
        setUploading(false);
        return;
      }

      // Build member lookup by memberNumber
      const memberMap = {};
      members.forEach(m => {
        if (m.memberNumber) memberMap[m.memberNumber] = m;
      });

      const errors = [];
      const updates = [];
      const seenNumbers = new Set();

      for (let i = 1; i < lines.length; i++) {
        const rowNum = i + 1;
        const fields = parseCsvLine(lines[i]);

        if (fields.length < 2) {
          errors.push(`Row ${rowNum}: Too few columns`);
          continue;
        }

        const memberNum = fields[0].trim();
        const artistName = fields[1].trim();

        if (!memberNum) {
          errors.push(`Row ${rowNum}: Member Number is missing`);
          continue;
        }

        const numVal = Number(memberNum);
        if (isNaN(numVal)) {
          errors.push(`Row ${rowNum}: Member Number "${memberNum}" is not a valid number`);
          continue;
        }

        if (seenNumbers.has(numVal)) {
          errors.push(`Row ${rowNum}: Duplicate Member Number ${numVal}`);
          continue;
        }
        seenNumbers.add(numVal);

        const member = memberMap[numVal];
        if (!member) {
          errors.push(`Row ${rowNum}: Member Number ${numVal} not found in database`);
          continue;
        }

        // Validate artist name matches
        if (artistName.toLowerCase() !== (member.artistName || '').toLowerCase()) {
          errors.push(`Row ${rowNum}: Artist Name "${artistName}" does not match "${member.artistName}" for Member #${numVal}`);
          continue;
        }

        // Parse social media values
        const data = {};
        let hasData = false;
        for (let j = 0; j < SOCIAL_COLUMNS.length; j++) {
          const rawVal = fields[j + 2]?.trim();
          if (rawVal === '' || rawVal === undefined) continue; // skip empty - no change
          const num = Number(rawVal);
          if (isNaN(num)) {
            errors.push(`Row ${rowNum}: "${rawVal}" is not a valid number for ${SOCIAL_COLUMNS[j].label}`);
            break;
          }
          if (num < 0) {
            errors.push(`Row ${rowNum}: ${SOCIAL_COLUMNS[j].label} cannot be negative`);
            break;
          }
          data[SOCIAL_COLUMNS[j].key] = num;
          hasData = true;
        }

        // If this row had an error in social columns, skip it
        if (errors.length > 0 && errors[errors.length - 1].startsWith(`Row ${rowNum}:`)) {
          const lastErr = errors[errors.length - 1];
          if (lastErr.includes('not a valid number') || lastErr.includes('cannot be negative')) continue;
        }

        if (hasData) {
          updates.push({ memberId: member._id, data });
        }
      }

      if (errors.length > 0) {
        setUploadErrors(errors);
        setShowErrorModal(true);
        setUploading(false);
        return;
      }

      if (updates.length === 0) {
        toast.info('No data to update. All social media fields were empty in the CSV.');
        setUploading(false);
        return;
      }

      // Call bulk update API
      const response = await membersAPI.bulkUpdate(updates);
      if (response.success) {
        if (response.updated > 0 && response.skipped > 0) {
          toast.success(`Updated ${response.updated} member(s). ${response.skipped} already had the same data.`);
        } else if (response.updated > 0) {
          toast.success(`Successfully updated ${response.updated} member(s)`);
        }
        if (response.errors?.length > 0) {
          toast.error(`${response.errors.length} error(s) during update`);
        }
        await fetchMembers(); // Refresh data
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      const msg = error.response?.data?.message;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Failed to process CSV file');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEditAttempt = () => {
    // Debounce so rapid clicks don't spam toasts
    if (editNotifyRef.current) return;
    toast.info('Please click the edit button first to modify values');
    editNotifyRef.current = setTimeout(() => { editNotifyRef.current = null; }, 2000);
  };

  // Close source dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(e.target)) {
        setShowSourceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await membersAPI.getAll({ limit: 10000 });
      if (response.success) setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (memberId, field, value) => {
    try {
      await membersAPI.update(memberId, { [field]: value });
      setMembers(prev => prev.map(m => m._id === memberId ? { ...m, [field]: value } : m));
      toast.success('Updated successfully');
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update');
    }
  };

  // Get unique sources for filter dropdown
  const uniqueSources = useMemo(() => {
    const sources = [...new Set(members.map(m => m.source).filter(Boolean))];
    return sources.sort((a, b) => a.localeCompare(b));
  }, [members]);

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        // Cycle: asc -> desc -> none
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  const filteredMembers = useMemo(() => {
    let result = members.filter(m => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!(m.artistName || '').toLowerCase().includes(q)) return false;
      }
      if (sourceFilter) {
        if ((m.source || '') !== sourceFilter) return false;
      }
      return true;
    });

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        if (sortConfig.key === 'artistName') {
          return dir * (a.artistName || '').localeCompare(b.artistName || '');
        }
        // Numeric sort for social columns
        const aVal = a[sortConfig.key] ?? -1;
        const bVal = b[sortConfig.key] ?? -1;
        return dir * (aVal - bVal);
      });
    }

    return result;
  }, [members, searchQuery, sourceFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredMembers.slice(startIndex, endIndex);

  const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    if (endPage - startPage < showPages - 1) startPage = Math.max(1, endPage - showPages + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  useEffect(() => { setCurrentPage(1); }, [searchQuery, sourceFilter]);

  const totalFields = filteredMembers.length * SOCIAL_COLUMNS.length;
  const filledFields = filteredMembers.reduce((acc, m) => {
    return acc + SOCIAL_COLUMNS.filter(col => m[col.key] !== null && m[col.key] !== undefined && m[col.key] !== 0).length;
  }, 0);
  const completionPercent = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  const getMemberCompletion = (member) => {
    const filled = SOCIAL_COLUMNS.filter(col => member[col.key] !== null && member[col.key] !== undefined && member[col.key] !== 0).length;
    return Math.round((filled / SOCIAL_COLUMNS.length) * 100);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <RiShieldCheckLine className="text-brand-primary" />
            Data Hygiene
          </h1>
          <p className="text-text-muted text-sm mt-1">Track and manage social media stats for all members</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSampleCSV}
            disabled={loading || members.length === 0}
            className="h-9 flex items-center gap-1.5 px-4 bg-surface-card border border-border rounded-lg text-xs font-medium text-text-primary hover:bg-surface-lighter hover:border-brand-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RiDownloadLine className="text-sm text-green-400" />
            Sample CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || uploading || members.length === 0}
            className="h-9 flex items-center gap-1.5 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg text-xs font-medium hover:shadow-md hover:shadow-brand-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RiUploadLine className="text-sm" />
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleUploadCSV}
            className="hidden"
          />
          <div className="h-9 flex items-center gap-2.5 px-4 bg-surface-card rounded-lg border border-border">
            <div>
              <p className="text-[10px] text-text-muted leading-tight">Completion</p>
              <p className="text-sm font-bold text-text-primary">{completionPercent}%</p>
            </div>
            <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionPercent >= 75 ? 'bg-green-500' :
                  completionPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Info */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative max-w-md flex-1">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member by name..."
            className="input w-full pl-10"
          />
        </div>
        {sourceFilter && (
          <div className="flex items-center gap-1.5 text-xs text-brand-primary bg-brand-primary/10 px-3 py-2 rounded-lg border border-brand-primary/20">
            <RiFilterLine className="text-sm" />
            Source: {sourceFilter}
            <button
              onClick={() => setSourceFilter('')}
              className="ml-1 p-0.5 hover:bg-brand-primary/20 rounded transition-colors"
            >
              <RiCloseLine className="text-sm" />
            </button>
          </div>
        )}
        {sortConfig.key && (
          <div className="flex items-center gap-1.5 text-xs text-brand-primary bg-brand-primary/10 px-3 py-2 rounded-lg border border-brand-primary/20">
            {sortConfig.direction === 'asc' ? <RiArrowUpSLine className="text-sm" /> : <RiArrowDownSLine className="text-sm" />}
            Sorted: {sortConfig.key === 'artistName' ? 'Member' : SOCIAL_COLUMNS.find(c => c.key === sortConfig.key)?.label}
            <button
              onClick={() => setSortConfig({ key: null, direction: null })}
              className="ml-1 p-0.5 hover:bg-brand-primary/20 rounded transition-colors"
            >
              <RiCloseLine className="text-sm" />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface-card rounded-xl border border-border overflow-hidden shadow-lg shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/5 border-b-2 border-brand-primary/20">
                {/* Member - sortable */}
                <th
                  onClick={() => handleSort('artistName')}
                  className="text-left px-4 py-3.5 text-xs font-bold text-text-primary uppercase tracking-wider sticky left-0 bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 z-10 w-[200px] cursor-pointer select-none hover:bg-brand-primary/15 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Member
                    <SortIcon active={sortConfig.key === 'artistName'} direction={sortConfig.direction} />
                  </div>
                </th>
                {/* Source - filterable */}
                <th className="text-left px-3 py-3.5 text-xs font-bold text-text-primary uppercase tracking-wider w-[120px] relative" ref={sourceDropdownRef}>
                  <div
                    onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                    className="flex items-center gap-1 cursor-pointer select-none hover:text-brand-primary transition-colors"
                  >
                    Source
                    <RiFilterLine className={`text-sm ${sourceFilter ? 'text-brand-primary' : 'text-text-muted'}`} />
                    {sourceFilter && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                    )}
                  </div>
                  {showSourceDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-surface-card border border-border rounded-lg shadow-xl z-30 min-w-[160px] py-1 max-h-52 overflow-y-auto">
                      <div
                        onClick={() => { setSourceFilter(''); setShowSourceDropdown(false); }}
                        className={`px-3 py-2 text-xs cursor-pointer transition-colors ${!sourceFilter ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-text-secondary hover:bg-surface-lighter'}`}
                      >
                        All Sources
                      </div>
                      {uniqueSources.map(source => (
                        <div
                          key={source}
                          onClick={() => { setSourceFilter(source); setShowSourceDropdown(false); }}
                          className={`px-3 py-2 text-xs cursor-pointer transition-colors ${sourceFilter === source ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-text-secondary hover:bg-surface-lighter'}`}
                        >
                          {source}
                        </div>
                      ))}
                    </div>
                  )}
                </th>
                {/* Social columns - sortable */}
                {SOCIAL_COLUMNS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="text-center px-3 py-3.5 text-xs font-bold text-text-primary uppercase tracking-wider min-w-[140px] cursor-pointer select-none hover:bg-brand-primary/10 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {col.label}
                      <SortIcon active={sortConfig.key === col.key} direction={sortConfig.direction} />
                    </div>
                  </th>
                ))}
                <th className="text-center px-3 py-3.5 text-xs font-bold text-text-primary uppercase tracking-wider w-[70px] sticky right-0 bg-gradient-to-l from-brand-primary/10 to-brand-primary/5 z-10">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3 + SOCIAL_COLUMNS.length} className="text-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent mx-auto"></div>
                    <p className="text-text-muted text-sm mt-3">Loading members...</p>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={3 + SOCIAL_COLUMNS.length} className="text-center py-20">
                    <RiShieldCheckLine className="text-4xl text-text-muted mx-auto mb-3" />
                    <p className="text-text-secondary font-medium">No members found</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((member, idx) => {
                  const isEditing = editingRowId === member._id;
                  const completion = getMemberCompletion(member);
                  return (
                    <tr
                      key={member._id}
                      className={`border-b border-border/30 transition-all duration-200 ${
                        isEditing
                          ? 'bg-brand-primary/8 shadow-[inset_3px_0_0_0] shadow-brand-primary'
                          : idx % 2 === 0 ? 'bg-transparent' : 'bg-surface-lighter/15'
                      } hover:bg-surface-lighter/40`}
                    >
                      {/* Member Info */}
                      <td className="px-4 py-3 sticky left-0 bg-inherit z-10 w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-brand-primary">
                              {(member.artistName || '?')[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate max-w-[130px]" title={member.artistName}>
                              {member.artistName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="w-12 h-1 bg-surface-lighter rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    completion >= 75 ? 'bg-green-500' :
                                    completion >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${completion}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-text-muted">{completion}%</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-3 py-3">
                        {member.source ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-medium border border-brand-primary/15">
                            {member.source}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted italic">N/A</span>
                        )}
                      </td>

                      {/* Social Stats */}
                      {SOCIAL_COLUMNS.map(col => (
                        <td key={col.key} className="px-2 py-2">
                          <EditableCell
                            value={member[col.key]}
                            memberId={member._id}
                            field={col.key}
                            onSave={handleSave}
                            editing={isEditing}
                            onEditAttempt={handleEditAttempt}
                          />
                        </td>
                      ))}

                      {/* Edit */}
                      <td className="px-3 py-3 text-center sticky right-0 bg-inherit z-10">
                        <button
                          onClick={() => setEditingRowId(isEditing ? null : member._id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            isEditing
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 ring-1 ring-green-500/30'
                              : 'bg-surface-lighter text-text-muted hover:text-brand-primary hover:bg-brand-primary/15 hover:shadow-sm'
                          }`}
                          title={isEditing ? 'Save & Close' : 'Edit Row'}
                        >
                          {isEditing ? <RiCheckLine className="text-base" /> : <RiPencilLine className="text-base" />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredMembers.length > 0 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface-lighter/30">
            <div className="flex items-center gap-4">
              <div className="text-sm text-text-secondary">
                Showing <span className="font-semibold text-text-primary">{startIndex + 1}</span> to <span className="font-semibold text-text-primary">{Math.min(endIndex, filteredMembers.length)}</span> of <span className="font-semibold text-text-primary">{filteredMembers.length}</span>
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

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-surface-card border border-border text-text-primary text-sm hover:bg-surface-lighter disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Prev
              </button>
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 rounded-lg border text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/25'
                      : 'bg-surface-card border-border text-text-primary hover:bg-surface-lighter'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-surface-card border border-border text-text-primary text-sm hover:bg-surface-lighter disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {!loading && filteredMembers.length > 0 && (
        <div className="flex items-center gap-5 text-xs text-text-muted bg-surface-card/50 px-4 py-2.5 rounded-lg border border-border/30">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-dashed border-red-500/30 bg-red-500/10 inline-block"></span>
            Missing data
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-brand-primary/15 border border-brand-primary/20 inline-block"></span>
            Editing active
          </span>
        </div>
      )}

      {/* CSV Upload Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowErrorModal(false)}></div>
          <div className="relative bg-surface-card rounded-lg shadow-2xl w-full max-w-lg border border-border">
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-lg font-bold text-red-400">CSV Upload Errors</h3>
              <button onClick={() => setShowErrorModal(false)} className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-lighter transition-all">
                <RiCloseLine className="text-xl" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-text-secondary mb-3">
                The following errors were found in your CSV. Please fix them and try again:
              </p>
              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {uploadErrors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-400 bg-red-500/5 px-3 py-2 rounded-lg border border-red-500/10">
                    <span className="font-bold text-red-500 flex-shrink-0">{i + 1}.</span>
                    <span>{err}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="btn-secondary px-5 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataHygiene;
