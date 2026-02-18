import { useState, useEffect, useRef } from 'react';
import { RiBookOpenLine, RiAddLine, RiSearchLine, RiDownloadLine, RiDeleteBinLine, RiMore2Fill } from 'react-icons/ri';
import { glossaryAPI } from '../services/api';
import { useToast, useConfirm } from '../components/ToastNotification';
import AddGlossaryTaskModal from '../components/AddGlossaryTaskModal';
import ViewGlossaryTaskModal from '../components/ViewGlossaryTaskModal';

const Glossary = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchTasks();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await glossaryAPI.getAll();
      if (response.success) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Error fetching glossary tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data) => {
    try {
      const response = await glossaryAPI.create(data);
      if (response.success) {
        await fetchTasks();
        setIsCreateModalOpen(false);
        toast.success('SOP created successfully');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create SOP');
    }
  };

  const handleDeleteTask = async (taskId) => {
    setOpenMenuId(null);
    const confirmed = await confirm({
      title: 'Delete SOP',
      message: 'Are you sure you want to delete this SOP? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (confirmed) {
      try {
        const response = await glossaryAPI.delete(taskId);
        if (response.success) {
          await fetchTasks();
          toast.success('SOP deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete SOP');
      }
    }
  };

  const handleDownload = (e, task) => {
    e.stopPropagation();
    if (task.fileId) {
      const url = glossaryAPI.download(task._id);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', task.fileOriginalName || 'document');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('No document attached to this task');
    }
  };

  const handleRowClick = (task) => {
    if (openMenuId) return;
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredTasks = tasks.filter(task => {
    if (!searchTerm) return true;
    return task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.accountable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.createdBy && task.createdBy.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Glossary & SOPs</h1>
          <p className="text-text-muted text-sm mt-1">Manage tasks, SOPs, guidelines, and policies</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl hover:shadow-lg hover:shadow-brand-primary/25 transition-all font-semibold text-sm"
        >
          <RiAddLine className="text-lg" />
          New SOP
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <RiSearchLine className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by SOP title, name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-card border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/40 transition-all text-sm"
        />
      </div>

      {/* Task List */}
      <div className="bg-surface-card rounded-xl border border-border overflow-visible">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-primary border-t-transparent"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <RiBookOpenLine className="text-4xl text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">No SOPs found</p>
            <p className="text-text-muted text-sm mt-1">Create a new SOP to get started</p>
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-lighter border-b border-border rounded-t-xl text-xs font-semibold text-text-muted uppercase tracking-wider">
              <div className="col-span-4">SOP</div>
              <div className="col-span-3">Accountable</div>
              <div className="col-span-2">Created Date</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-border">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleRowClick(task)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-lighter/60 transition-all cursor-pointer group"
                >
                  {/* Task Info */}
                  <div className="col-span-4 min-w-0">
                    <span className="text-sm font-semibold text-text-primary truncate block group-hover:text-brand-accent transition-colors">
                      {task.title}
                    </span>
                    {task.description && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">{task.description}</p>
                    )}
                  </div>

                  {/* Accountable */}
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm text-brand-accent font-medium truncate">{task.accountable}</p>
                    {task.createdBy && (
                      <p className="text-xs text-text-muted mt-0.5">created by {task.createdBy}</p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary">{task.createdDate ? formatDate(task.createdDate) : '—'}</p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    {task.fileId && (
                      <button
                        onClick={(e) => handleDownload(e, task)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/15 text-brand-accent rounded-lg text-xs font-semibold hover:bg-brand-primary/25 transition-all"
                        title="Download"
                      >
                        <RiDownloadLine className="text-sm" />
                        <span>Download</span>
                      </button>
                    )}

                    {/* 3-dot menu */}
                    <div className="relative" ref={openMenuId === task._id ? menuRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === task._id ? null : task._id);
                        }}
                        className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-lighter rounded-lg transition-all"
                      >
                        <RiMore2Fill className="text-lg" />
                      </button>

                      {openMenuId === task._id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-surface-card border border-border rounded-xl shadow-2xl shadow-black/30 z-30 overflow-hidden py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task._id);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2.5"
                          >
                            <RiDeleteBinLine className="text-base" />
                            Delete SOP
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer count */}
        {!loading && filteredTasks.length > 0 && (
          <div className="px-6 py-3 border-t border-border">
            <p className="text-xs text-text-muted">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddGlossaryTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <ViewGlossaryTaskModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedTask(null); }}
        task={selectedTask}
      />
    </div>
  );
};

export default Glossary;
