import { useState } from 'react';
import { RiCloseLine, RiUploadCloud2Line, RiDeleteBin6Line, RiFileTextLine } from 'react-icons/ri';
import { useToast } from './ToastNotification';
import { onboardingAPI } from '../services/api';
import { usePicklist } from '../hooks/usePicklist';

const L2ReviewModal = ({ isOpen, onClose, onboarding, onSubmit }) => {
  const { items: meetingTypes } = usePicklist('meetingType');
  const { items: membershipTypes } = usePicklist('membershipType');

  const [formData, setFormData] = useState({
    meetingScheduledOn: '',
    meetingType: 'In-Person',
    catalogReview: false,
    rightsOwnership: false,
    commercialData: false,
    contractDiscussion: false,
    techOnboarding: false,
    contentIngestion: false,
    membershipType: '',
    notes: ''
  });
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState(onboarding?.l2ReviewData?.documents || []);
  const toast = useToast();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (status) => {
    // Validation: Check if all required fields are filled
    if (!formData.meetingScheduledOn) {
      toast.warning('Please select a meeting date');
      return;
    }

    if (!formData.membershipType) {
      toast.warning('Please select a membership type');
      return;
    }

    // Validation: Check if all checklist items are checked
    const allChecklistChecked = 
      formData.catalogReview &&
      formData.rightsOwnership &&
      formData.commercialData &&
      formData.contractDiscussion &&
      formData.techOnboarding &&
      formData.contentIngestion;

    if (!allChecklistChecked) {
      toast.warning('Please complete all 6 checklist items before submitting');
      return;
    }

    const dataToSubmit = {
      ...formData,
      status,
      l2ReviewData: {
        meetingScheduledOn: formData.meetingScheduledOn,
        meetingType: formData.meetingType,
        checklist: {
          catalogReview: formData.catalogReview,
          rightsOwnership: formData.rightsOwnership,
          commercialData: formData.commercialData,
          contractDiscussion: formData.contractDiscussion,
          techOnboarding: formData.techOnboarding,
          contentIngestion: formData.contentIngestion
        },
        membershipType: formData.membershipType,
        notes: formData.notes
      }
    };
    
    onSubmit(dataToSubmit);
    
    // Reset form
    setFormData({
      meetingScheduledOn: '',
      meetingType: 'In-Person',
      catalogReview: false,
      rightsOwnership: false,
      commercialData: false,
      contractDiscussion: false,
      techOnboarding: false,
      contentIngestion: false,
      membershipType: '',
      notes: ''
    });
  };

  const taskId = `ONB-${onboarding?._id?.slice(-4).toUpperCase()}`;
  const artistName = onboarding?.member?.name || 'N/A';

  const handleUploadDocument = async () => {
    if (!docTitle.trim()) {
      toast.warning('Please enter a document title');
      return;
    }
    if (!docFile) {
      toast.warning('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('document', docFile);
      formDataUpload.append('title', docTitle);
      formDataUpload.append('description', docDescription);

      const response = await onboardingAPI.uploadDocument(onboarding._id, formDataUpload);
      if (response.success) {
        setUploadedDocs(response.data.l2ReviewData?.documents || []);
        setDocTitle('');
        setDocDescription('');
        setDocFile(null);
        toast.success('Document uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docIndex) => {
    try {
      const response = await onboardingAPI.deleteDocument(onboarding._id, docIndex);
      if (response.success) {
        setUploadedDocs(response.data.l2ReviewData?.documents || []);
        toast.success('Document deleted');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      ></div>

      {/* Modal */}
      <div 
        className="relative bg-surface-card rounded-lg shadow-2xl shadow-orange-600/20 w-full max-w-3xl max-h-[90vh] overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 flex items-center justify-between shadow-lg">
          <div>
            <h2 className="text-xl font-bold text-white">L2 Review - Core Group Approval</h2>
            <p className="text-orange-100 text-sm">{artistName} • {taskId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
          >
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
          {/* Meeting Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Meeting Scheduled On <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="meetingScheduledOn"
                value={formData.meetingScheduledOn}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Meeting Type <span className="text-red-400">*</span>
              </label>
              <select
                name="meetingType"
                value={formData.meetingType}
                onChange={handleChange}
                className="select w-full"
              >
                {meetingTypes.map(item => (
                  <option key={item._id} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 3 CHECKLIST */}
          <div>
            <h3 className="text-yellow-500 font-bold text-sm mb-4">STEP 3 CHECKLIST</h3>
            <div className="space-y-4">
              {/* Checkbox 3.1 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="catalogReview"
                    checked={formData.catalogReview}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.1 Catalog & Rights Review</div>
                    <div className="text-gray-400 text-xs mt-1">
                      What is your complete music catalog? How many original songs, covers, unreleased tracks?
                    </div>
                  </div>
                </label>
              </div>

              {/* Checkbox 3.2 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rightsOwnership"
                    checked={formData.rightsOwnership}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.2 Rights Ownership</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Do you own 100% rights to your music? Any co-writers, producers, or labels with claims?
                    </div>
                  </div>
                </label>
              </div>

              {/* Checkbox 3.3 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="commercialData"
                    checked={formData.commercialData}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.3 Commercial Data</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Current streaming numbers & revenue? Existing royalty agreements or advances?
                    </div>
                  </div>
                </label>
              </div>

              {/* Checkbox 3.4 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="contractDiscussion"
                    checked={formData.contractDiscussion}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.4 Contract Discussion</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Review terms & partnership agreement. Clarify revenue splits, exclusivity, term duration.
                    </div>
                  </div>
                </label>
              </div>

              {/* Checkbox 3.5 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="techOnboarding"
                    checked={formData.techOnboarding}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.5 Tech Onboarding</div>
                    <div className="text-gray-400 text-xs mt-1">
                      App installation & walkthrough. Profile creation & setup training.
                    </div>
                  </div>
                </label>
              </div>

              {/* Checkbox 3.6 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="contentIngestion"
                    checked={formData.contentIngestion}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.6 Content Ingestion</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Initiate catalog upload process. Verify metadata, artwork, audio quality.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Membership Type */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Membership Type <span className="text-red-400">*</span>
            </label>
            <select
              name="membershipType"
              value={formData.membershipType}
              onChange={handleChange}
              className="select w-full"
              required
            >
              <option value="">Select membership type</option>
              {membershipTypes.map(item => (
                <option key={item._id} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          {/* Upload Documents Section */}
          <div>
            <h3 className="text-yellow-500 font-bold text-sm mb-4">UPLOAD DOCUMENTS</h3>
            
            {/* Upload Form */}
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Contract Agreement"
                    className="input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={docDescription}
                    onChange={(e) => setDocDescription(e.target.value)}
                    placeholder="Brief description..."
                    className="input w-full text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-[#2d3748] border border-dashed border-slate-500 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                  <RiUploadCloud2Line className="text-orange-400 text-lg" />
                  <span className="text-sm text-text-secondary truncate">
                    {docFile ? docFile.name : 'Choose file (max 10MB)'}
                  </span>
                  <input
                    type="file"
                    onChange={(e) => setDocFile(e.target.files[0])}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleUploadDocument}
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg shadow-orange-600/30 disabled:opacity-50 whitespace-nowrap text-sm"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>

            {/* Uploaded Documents List */}
            {uploadedDocs.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedDocs.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-4 py-3 border border-slate-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <RiFileTextLine className="text-orange-400 text-lg flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-white text-sm font-medium truncate">{doc.title}</div>
                        <div className="text-gray-400 text-xs truncate">
                          {doc.fileName} • {formatFileSize(doc.fileSize)}
                          {doc.description && ` • ${doc.description}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <a
                        href={`http://localhost:5000${doc.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs underline"
                      >
                        View
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <RiDeleteBin6Line size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              placeholder="Meeting notes, observations, next steps..."
              rows="4"
              className="input w-full resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-6 py-2.5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('review-l2')}
              className="btn-primary px-6 py-2.5 shadow-lg shadow-brand-primary/30"
            >
              Save Progress
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('closed-won')}
              className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-600/30"
            >
              Closed Won
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('closed-lost')}
              className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-600/30"
            >
              Closed Lost
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('review-l2')}
              className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-brand-accent to-brand-highlight text-white hover:from-brand-accent/90 hover:to-brand-highlight/90 transition-all shadow-lg shadow-brand-accent/30"
            >
              Cold Storage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default L2ReviewModal;
