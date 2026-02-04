import { RiCloseLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import { membersAPI } from '../services/api';
import EditStep1Modal from './EditStep1Modal';
import EditL1QuestionnaireModal from './EditL1QuestionnaireModal';

const EditOnboardingModal = ({ isOpen, onClose, onboarding, onSubmit }) => {
  const [formData, setFormData] = useState({
    member: '',
    description: '',
    spoc: '',
    etaClosure: '',
    notes: '',
    status: 'contact-established'
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStep1Open, setIsStep1Open] = useState(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

  useEffect(() => {
    if (isOpen && onboarding) {
      setFormData({
        member: onboarding.member?._id || '',
        description: onboarding.description || '',
        spoc: onboarding.spoc || '',
        etaClosure: onboarding.etaClosure ? new Date(onboarding.etaClosure).toISOString().split('T')[0] : '',
        notes: onboarding.notes || '',
        status: onboarding.status || 'contact-established'
      });
      fetchMembers();
    }
  }, [isOpen, onboarding]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await membersAPI.getAll();
      if (response.success) {
        setMembers(response.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen || !onboarding) return null;

  const taskId = onboarding.taskNumber || 'N/A';
  const memberName = onboarding.memberName || onboarding.member?.name || 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-surface-card rounded-lg shadow-2xl shadow-brand-primary/20 w-full max-w-2xl max-h-[90vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 flex items-center justify-between shadow-lg">
          <h2 className="text-xl font-bold text-white">Edit Onboarding</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
          >
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
            <div className="p-6 space-y-4">
              {/* Select Member */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Select Artist <span className="text-red-400">*</span>
                </label>
                <select
                  name="member"
                  value={formData.member}
                  onChange={handleChange}
                  required
                  className="select w-full cursor-pointer"
                >
                  <option value="">Choose a Artist</option>
                  {loading ? (
                    <option disabled>Loading members...</option>
                  ) : (
                    members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.artistName} - {member.email}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
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

              <div className="grid grid-cols-2 gap-4">
                {/* SPOC */}
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
                    <option>Vishal Onkar</option>
                    <option>Soumini Paul</option>
                    <option>Aayan De</option>
                    <option>Joshua Singh</option>
                    <option>Racheal Singh</option>
                    <option>Aayush Jain</option>
                    <option>Pooja Gupta</option>
                    <option>Rahul Jadhav</option>
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
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Status <span className="text-red-400">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="select w-full cursor-pointer"
                >
                  <option value="contact-established">Contact Established</option>
                  <option value="spoc-assigned">SPOC Assigned</option>
                  <option value="review-l2">Review for L2</option>
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
                </select>
              </div>

              {/* Notes */}
              <div>
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
            </div>
          </div>

          {/* Footer */}
          <div className="bg-surface-lighter px-6 py-4 flex justify-between border-t border-border">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsStep1Open(true)}
                className="btn-primary px-6 py-2.5 shadow-lg shadow-brand-primary/30"
              >
                Edit Step 1
              </button>
              <button
                type="button"
                onClick={() => setIsQuestionnaireOpen(true)}
                className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-600/30"
              >
                Edit L1 Questionnaire
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-6 py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-6 py-2.5 shadow-lg shadow-brand-primary/30"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Step1 Modal */}
      <EditStep1Modal
        isOpen={isStep1Open}
        onClose={(dataUpdated) => {
          setIsStep1Open(false);
          if (dataUpdated && typeof onClose === 'function') {
            onClose(true); // Propagate update to parent
          }
        }}
        onboarding={onboarding}
      />
      
      {/* L1 Questionnaire Modal */}
      <EditL1QuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={(dataUpdated) => {
          setIsQuestionnaireOpen(false);
          if (dataUpdated && typeof onClose === 'function') {
            onClose(true); // Propagate update to parent
          }
        }}
        onboarding={onboarding}
      />
    </div>
  );
};

export default EditOnboardingModal;
