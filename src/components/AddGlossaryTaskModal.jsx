import { RiCloseLine, RiUploadCloud2Line, RiFileTextLine, RiDeleteBinLine } from 'react-icons/ri';
import { useState, useRef } from 'react';

const AddGlossaryTaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    accountable: '',
    createdBy: '',
    createdDate: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('accountable', formData.accountable);
      data.append('createdBy', formData.createdBy);
      if (formData.createdDate) data.append('createdDate', formData.createdDate);
      if (selectedFile) {
        data.append('file', selectedFile);
      }
      await onSubmit(data);
      setFormData({
        title: '',
        description: '',
        accountable: '',
        createdBy: '',
        createdDate: '',
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error creating glossary task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Create New SOP</h2>
            <p className="text-sm text-text-muted mt-0.5">Fill in the details to create a new SOP</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-surface-lighter"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                SOP Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Follow up to get contract signed"
                className="w-full px-4 py-3 bg-surface-lighter border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Brief description of the task..."
                className="w-full px-4 py-3 bg-surface-lighter border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all resize-none text-sm"
              />
            </div>

            {/* Accountable & Created By */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Accountable <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="accountable"
                  value={formData.accountable}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Jason Johnson"
                  className="w-full px-4 py-3 bg-surface-lighter border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Created By
                </label>
                <input
                  type="text"
                  name="createdBy"
                  value={formData.createdBy}
                  onChange={handleChange}
                  placeholder="e.g. John Winner"
                  className="w-full px-4 py-3 bg-surface-lighter border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-sm"
                />
              </div>
            </div>

            {/* Created Date */}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Created Date
              </label>
              <input
                type="date"
                name="createdDate"
                value={formData.createdDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-lighter border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-sm"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Upload Document
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.jpg,.jpeg,.png"
              />

              {!selectedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border hover:border-brand-primary/50 rounded-xl p-6 flex flex-col items-center gap-2 transition-all hover:bg-brand-primary/5 group"
                >
                  <RiUploadCloud2Line className="text-3xl text-text-muted group-hover:text-brand-primary transition-colors" />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors font-medium">
                    Click to browse files
                  </span>
                  <span className="text-xs text-text-muted">
                    PDF, DOC, XLS, PPT, Images, ZIP (Max 50MB)
                  </span>
                </button>
              ) : (
                <div className="flex items-center justify-between bg-surface-lighter border border-border rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                      <RiFileTextLine className="text-xl text-brand-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{selectedFile.name}</p>
                      <p className="text-xs text-text-muted">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                  >
                    <RiDeleteBinLine className="text-lg" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons - Fixed at bottom */}
          <div className="px-6 py-4 border-t border-border flex gap-3 bg-surface-card">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-xl text-text-secondary hover:bg-surface-lighter transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl hover:shadow-lg hover:shadow-brand-primary/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating...
                </span>
              ) : 'Create SOP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGlossaryTaskModal;
