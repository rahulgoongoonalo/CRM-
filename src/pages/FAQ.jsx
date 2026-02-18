import { useState, useEffect } from 'react';
import { RiQuestionAnswerLine, RiAddLine, RiSearchLine, RiDeleteBinLine, RiArrowDownSLine, RiCloseLine, RiEditLine } from 'react-icons/ri';
import { faqAPI } from '../services/api';
import { useToast, useConfirm } from '../components/ToastNotification';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await faqAPI.getAll();
      if (response.success) {
        setFaqs(response.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingFaq) {
        const response = await faqAPI.update(editingFaq._id, formData);
        if (response.success) {
          await fetchFaqs();
          toast.success('FAQ updated successfully');
        }
      } else {
        const response = await faqAPI.create(formData);
        if (response.success) {
          await fetchFaqs();
          toast.success('FAQ created successfully');
        }
      }
      closeModal();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Failed to save FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (faqId) => {
    const confirmed = await confirm({
      title: 'Delete FAQ',
      message: 'Are you sure you want to delete this FAQ? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (confirmed) {
      try {
        const response = await faqAPI.delete(faqId);
        if (response.success) {
          await fetchFaqs();
          if (expandedId === faqId) setExpandedId(null);
          toast.success('FAQ deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        toast.error('Failed to delete FAQ');
      }
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({ question: faq.question, answer: faq.answer });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
    setFormData({ question: '', answer: '' });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = faqs.filter(faq => {
    if (!searchTerm) return true;
    return faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">FAQ</h1>
          <p className="text-text-muted text-sm mt-1">Frequently asked questions and answers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl hover:shadow-lg hover:shadow-brand-primary/25 transition-all font-semibold text-sm"
        >
          <RiAddLine className="text-lg" />
          New FAQ
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <RiSearchLine className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search questions or answers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/40 transition-all text-sm"
        />
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-primary border-t-transparent"></div>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-20 bg-surface-card rounded-xl border border-border">
            <RiQuestionAnswerLine className="text-4xl text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">No FAQs found</p>
            <p className="text-text-muted text-sm mt-1">Create a new FAQ to get started</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq._id}
              className="bg-surface-card rounded-xl border border-border overflow-hidden transition-all"
            >
              {/* Question Row */}
              <div
                onClick={() => toggleExpand(faq._id)}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-lighter/60 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-primary font-bold text-sm">Q</span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary group-hover:text-brand-accent transition-colors truncate">
                    {faq.question}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(faq); }}
                    className="p-1.5 text-text-muted hover:text-brand-accent hover:bg-brand-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Edit"
                  >
                    <RiEditLine className="text-base" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(faq._id); }}
                    className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <RiDeleteBinLine className="text-base" />
                  </button>
                  <RiArrowDownSLine
                    className={`text-xl text-text-muted transition-transform duration-300 ${
                      expandedId === faq._id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Answer (Expandable) */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedId === faq._id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 pb-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-400 font-bold text-sm">A</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed pt-1.5 whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer count */}
      {!loading && filteredFaqs.length > 0 && (
        <p className="text-xs text-text-muted">
          Showing {filteredFaqs.length} of {faqs.length} FAQs
        </p>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            className="bg-surface-card border border-border rounded-2xl w-full max-w-lg shadow-2xl shadow-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-text-primary">{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</h2>
                <p className="text-sm text-text-muted mt-0.5">
                  {editingFaq ? 'Update the question and answer' : 'Add a new question and answer'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-text-muted hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-surface-lighter"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Question <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    required
                    placeholder="Enter the question..."
                    className="w-full px-4 py-3 bg-surface-lighter border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Answer <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                    required
                    rows={5}
                    placeholder="Enter the answer..."
                    className="w-full px-4 py-3 bg-surface-lighter border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all resize-none text-sm"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
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
                      {editingFaq ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : editingFaq ? 'Update FAQ' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQ;
