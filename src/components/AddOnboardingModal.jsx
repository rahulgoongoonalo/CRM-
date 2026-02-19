import { RiCloseLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import Step1Modal from './Step1Modal';
import { membersAPI } from '../services/api';

const AddOnboardingModal = ({ isOpen, onClose, onSubmit }) => {
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
  const [loading, setLoading] = useState(false);

  // Fetch members from MongoDB
  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get the artist name before submitting
      const selectedMember = members.find(m => m._id === formData.member);
      const artistName = selectedMember?.artistName || '';
      
      // Call onSubmit which returns the created onboarding ID
      const createdId = await onSubmit({
        ...formData,
        artistName
      });
      
      if (createdId) {
        const taskId = `ONB-${createdId.slice(-4).toUpperCase()}`;
        
        // Set state and open Step1Modal
        setCreatedOnboardingId(createdId);
        setSavedMemberName(artistName);
        setNewTaskId(taskId);
        setIsStep1ModalOpen(true);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
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
        onClick={onClose}
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
          <form onSubmit={handleSubmit}>
            {/* Select Member */}
            <div className="mb-4">
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
                  Assign SPOC
                </label>
                <select
                  name="spoc"
                  value={formData.spoc}
                  onChange={handleChange}
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
                  <option>Vaishali</option>
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
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
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
                className="btn-primary px-6 py-2.5 shadow-lg shadow-brand-primary/30"
              >
                Create & Continue to Step 1
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
