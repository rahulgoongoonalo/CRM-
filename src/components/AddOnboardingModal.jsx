import { RiCloseLine, RiSearchLine, RiUserLine, RiAlertLine } from 'react-icons/ri';
import { useState, useEffect, useRef, useMemo } from 'react';
import Step1Modal from './Step1Modal';
import { membersAPI, onboardingAPI } from '../services/api';
import { usePicklist } from '../hooks/usePicklist';
import { useToast } from './ToastNotification';

const AddOnboardingModal = ({ isOpen, onClose, onSubmit }) => {
  const { items: spocOptions } = usePicklist('spoc');
  const { items: onboardingStatuses } = usePicklist('onboardingStatus');
  const toast = useToast();

  const [formData, setFormData] = useState({
    member: '',
    description: '',
    spoc: '',
    etaClosure: '',
    status: 'warm',
    notes: '',
  });
  const [isStep1ModalOpen, setIsStep1ModalOpen] = useState(false);
  const [newTaskId, setNewTaskId] = useState('');
  const [savedMemberName, setSavedMemberName] = useState('');
  const [createdOnboardingId, setCreatedOnboardingId] = useState('');
  const [members, setMembers] = useState([]);
  const [onboardedMap, setOnboardedMap] = useState({}); // { memberId: { artistName, taskNumber } }
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const searchRef = useRef(null);

  // Fetch members + onboarded IDs from MongoDB
  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      fetchOnboardedIds();
      setSearchQuery('');
      setSelectedMember(null);
      setShowDropdown(false);
    }
  }, [isOpen]);

  const fetchOnboardedIds = async () => {
    try {
      const res = await onboardingAPI.getOnboardedMemberIds();
      if (res.success) {
        const map = {};
        res.data.forEach(r => { map[r.memberId] = { artistName: r.artistName, taskNumber: r.taskNumber }; });
        setOnboardedMap(map);
      }
    } catch (e) {
      console.error('Failed to fetch onboarded member IDs:', e);
    }
  };

  const isMemberOnboarded = (memberId) => Boolean(onboardedMap[memberId]);
  const selectedDuplicate = useMemo(() => {
    return selectedMember ? onboardedMap[selectedMember._id] : null;
  }, [selectedMember, onboardedMap]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMembers = members.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (m.artistName || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q);
  }).slice(0, 20);

  const handleSelectMember = (member) => {
    const dup = onboardedMap[member._id];
    if (dup) {
      toast.error(`"${member.artistName}" already has an onboarding entry (Task #${dup.taskNumber}). Open it from the list instead.`);
      return;
    }
    setSelectedMember(member);
    setFormData(prev => ({ ...prev, member: member._id }));
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setFormData(prev => ({ ...prev, member: '' }));
    setSearchQuery('');
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await membersAPI.getList();
      if (response.success) {
        setMembers(response.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!selectedMember) {
      toast.error('Please select an artist.');
      return;
    }
    if (!formData.spoc) {
      toast.error('Please assign a SPOC.');
      return;
    }
    // Final client-side guard before backend dup-check
    if (onboardedMap[selectedMember._id]) {
      toast.error(`"${selectedMember.artistName}" already has an onboarding entry. Cannot create duplicate.`);
      return;
    }

    try {
      setSubmitting(true);
      const artistName = selectedMember.artistName || '';
      const createdId = await onSubmit({ ...formData, artistName });

      if (createdId) {
        const taskId = `ONB-${createdId.slice(-4).toUpperCase()}`;
        setCreatedOnboardingId(createdId);
        setSavedMemberName(artistName);
        setNewTaskId(taskId);
        setIsStep1ModalOpen(true);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
    {isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      ></div>

      {/* Modal */}
      <div className="relative bg-surface-card rounded-lg shadow-2xl shadow-brand-primary/20 w-full max-w-2xl border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 flex items-center justify-between rounded-t-lg shadow-lg">
          <h2 className="text-xl font-bold text-white">Add New Onboarding</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
          >
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedDuplicate && (
            <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              <RiAlertLine className="text-lg flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-0.5">Already onboarded</div>
                <div className="text-red-300/90">
                  An onboarding entry for this artist already exists (Task #{selectedDuplicate.taskNumber}). Open it from the list instead of creating a duplicate.
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Select Member - Searchable */}
            <div className="mb-4" ref={searchRef}>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Select Artist <span className="text-red-400">*</span>
              </label>
              {selectedMember ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-surface-lighter border border-border rounded-lg">
                  <RiUserLine className="text-brand-primary flex-shrink-0" />
                  <span className="text-sm text-text-primary flex-1 truncate">
                    {selectedMember.artistName} - {selectedMember.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearMember}
                    className="p-0.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                  >
                    <RiCloseLine className="text-lg" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search artist by name or email..."
                      className="input w-full pl-9"
                      autoComplete="off"
                    />
                  </div>
                  {showDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface-card border border-border rounded-lg shadow-xl max-h-52 overflow-y-auto">
                      {loading ? (
                        <div className="px-4 py-3 text-sm text-text-muted text-center">Loading artists...</div>
                      ) : filteredMembers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-text-muted text-center">No artists found</div>
                      ) : (
                        filteredMembers.map((member) => {
                          const onboarded = isMemberOnboarded(member._id);
                          return (
                            <div
                              key={member._id}
                              onClick={() => !onboarded && handleSelectMember(member)}
                              className={`px-4 py-2.5 transition-colors border-b border-border/50 last:border-b-0 ${
                                onboarded
                                  ? 'opacity-50 cursor-not-allowed bg-surface-light/30'
                                  : 'hover:bg-brand-primary/10 cursor-pointer'
                              }`}
                              title={onboarded ? `Already onboarded (Task #${onboardedMap[member._id].taskNumber})` : ''}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-text-primary truncate">{member.artistName}</p>
                                  <p className="text-xs text-text-muted truncate">{member.email}</p>
                                </div>
                                {onboarded && (
                                  <span className="flex-shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Already Onboarded
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Hidden required input for form validation */}
              <input type="hidden" name="member" value={formData.member} required />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of onboarding"
                rows="1"
                className="input w-full resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Assign SPOC */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Assign SPOC <span className="text-red-400">*</span>
                </label>
                <select
                  name="spoc"
                  value={formData.spoc}
                  onChange={handleChange}
                  required
                  className="select w-full cursor-pointer"
                >
                  <option value="">Select SPOC</option>
                  {spocOptions.map(item => (
                    <option key={item._id} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              {/* ETA to Closure */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  ETA to Closure
                </label>
                <input
                  type="date"
                  name="etaClosure"
                  value={formData.etaClosure}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select w-full cursor-pointer"
              >
                {onboardingStatuses.map(item => (
                  <option key={item._id} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
                rows="2"
                className="input w-full resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-start space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-6 py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedMember || Boolean(selectedDuplicate)}
                className="btn-primary px-6 py-2.5 shadow-lg shadow-brand-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create & Continue to Step 1'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    )}

      {/* Step 1 Modal */}
      <Step1Modal
        isOpen={isStep1ModalOpen}
        onClose={() => {
          setIsStep1ModalOpen(false);
          setCreatedOnboardingId('');
        }}
        onboardingId={createdOnboardingId}
        memberName={savedMemberName}
        taskId={newTaskId}
      />
    </>
  );
};

export default AddOnboardingModal;
