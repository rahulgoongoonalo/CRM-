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

  const taskId = `ONB-${onboarding._id?.slice(-4).toUpperCase()}`;
  const memberName = onboarding.member?.name || 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Edit Onboarding</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-lg p-1 transition-colors"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Member <span className="text-red-400">*</span>
                </label>
                <select
                  name="member"
                  value={formData.member}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Choose a member</option>
                  {loading ? (
                    <option disabled>Loading members...</option>
                  ) : (
                    members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} - {member.email}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of onboarding"
                  rows="2"
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* SPOC */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SPOC <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="spoc"
                    value={formData.spoc}
                    onChange={handleChange}
                    required
                    placeholder="Enter SPOC name"
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ETA to Closure */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ETA to Closure
                  </label>
                  <input
                    type="date"
                    name="etaClosure"
                    value={formData.etaClosure}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status <span className="text-red-400">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes..."
                  rows="3"
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-900 px-6 py-4 flex justify-between border-t border-slate-700">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsStep1Open(true)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Step 1
              </button>
              <button
                type="button"
                onClick={() => setIsQuestionnaireOpen(true)}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Edit L1 Questionnaire
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        onClose={() => setIsStep1Open(false)}
        onboarding={onboarding}
        memberName={memberName}
        taskId={taskId}
      />
      
      {/* L1 Questionnaire Modal */}
      <EditL1QuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        onboarding={onboarding}
        memberName={memberName}
        taskId={taskId}
      />
    </div>
  );
};

export default EditOnboardingModal;
