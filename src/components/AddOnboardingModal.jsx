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
      // Call onSubmit which returns the created onboarding ID
      const createdId = await onSubmit(formData);
      
      if (createdId) {
        // Get the member name
        const selectedMember = members.find(m => m._id === formData.member);
        const memberName = selectedMember?.name || '';
        const taskId = `ONB-${createdId.slice(-4).toUpperCase()}`;
        
        // Set state and open Step1Modal
        setCreatedOnboardingId(createdId);
        setSavedMemberName(memberName);
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
      <div className={`relative bg-[#1e2a3a] rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-blue-600 rounded-t-lg">
          <h2 className="text-white text-lg font-semibold">Add New Onboarding</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            {/* Select Member */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Select Member <span className="text-red-400">*</span>
              </label>
              <select
                name="member"
                value={formData.member}
                onChange={handleChange}
                required
                className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
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
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of onboarding"
                rows="1"
                className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Assign SPOC */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Assign SPOC <span className="text-red-400">*</span>
                </label>
                <select
                  name="spoc"
                  value={formData.spoc}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="">Select SPOC</option>
                  <option>Vishal Onkar</option>
                  <option>Soumini Paul</option>
                  <option>Aayan De</option>
                  <option>Joshua Singh</option>
                  <option>Rahul Sharma</option>
                </select>
              </div>

              {/* ETA to Closure */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  ETA to Closure
                </label>
                <input
                  type="date"
                  name="etaClosure"
                  value={formData.etaClosure}
                  onChange={handleChange}
                  className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
                rows="2"
                className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-start space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
