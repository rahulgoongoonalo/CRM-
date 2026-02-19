import { useState, useEffect } from 'react';
import { RiListSettingsLine, RiAddLine, RiDeleteBinLine, RiArrowDownSLine, RiCloseLine } from 'react-icons/ri';
import { picklistAPI } from '../services/api';
import { usePicklists } from '../hooks/usePicklist';
import { useAuth } from '../context/AuthContext';
import { useToast, useConfirm } from '../components/ToastNotification';

const Picklist = () => {
  const [picklists, setPicklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedName, setExpandedName] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [newItem, setNewItem] = useState({ value: '', label: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { refetch } = usePicklists();
  const toast = useToast();
  const confirm = useConfirm();
  const isAdmin = user?.role === 'administrator';

  useEffect(() => {
    fetchPicklists();
  }, []);

  const fetchPicklists = async () => {
    try {
      setLoading(true);
      const response = await picklistAPI.getAll();
      if (response.success) {
        setPicklists(response.data);
      }
    } catch (error) {
      console.error('Error fetching picklists:', error);
      toast.error('Failed to load picklists');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (name) => {
    setExpandedName(expandedName === name ? null : name);
    setAddingTo(null);
    setNewItem({ value: '', label: '' });
  };

  const handleAddItem = async (picklistName) => {
    if (!newItem.value.trim()) return;
    setSubmitting(true);
    try {
      const itemData = {
        value: newItem.value.trim(),
        label: newItem.label.trim() || newItem.value.trim()
      };
      const response = await picklistAPI.addItem(picklistName, itemData);
      if (response.success) {
        await fetchPicklists();
        await refetch();
        setNewItem({ value: '', label: '' });
        setAddingTo(null);
        toast.success('Item added successfully');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(error.response?.data?.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (picklistName, itemId, itemLabel) => {
    const confirmed = await confirm({
      title: 'Delete Picklist Item',
      message: `Are you sure you want to remove "${itemLabel}" from the list? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (confirmed) {
      try {
        const response = await picklistAPI.deleteItem(picklistName, itemId);
        if (response.success) {
          await fetchPicklists();
          await refetch();
          toast.success('Item removed successfully');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error(error.response?.data?.message || 'Failed to delete item');
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Picklist Management</h1>
        <p className="text-text-muted text-sm mt-1">
          Manage all dropdown options used across the application
          {!isAdmin && <span className="ml-2 text-brand-accent">(Staff can add items only)</span>}
        </p>
      </div>

      {/* Picklist Sections */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-primary border-t-transparent"></div>
          </div>
        ) : picklists.length === 0 ? (
          <div className="text-center py-20 bg-surface-card rounded-xl border border-border">
            <RiListSettingsLine className="text-4xl text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">No picklists found</p>
            <p className="text-text-muted text-sm mt-1">Picklists will be auto-created on server start</p>
          </div>
        ) : (
          picklists.map((picklist) => {
            const activeItems = picklist.items
              .filter(i => i.isActive)
              .sort((a, b) => a.order - b.order);
            const isExpanded = expandedName === picklist.name;

            return (
              <div
                key={picklist._id}
                className="bg-surface-card rounded-xl border border-border overflow-hidden transition-all"
              >
                {/* Picklist Header */}
                <div
                  onClick={() => toggleExpand(picklist.name)}
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-lighter/60 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                      <RiListSettingsLine className="text-brand-primary text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-brand-accent transition-colors">
                        {picklist.label}
                      </p>
                      <p className="text-xs text-text-muted">{activeItems.length} items</p>
                    </div>
                  </div>
                  <RiArrowDownSLine
                    className={`text-xl text-text-muted transition-transform duration-300 flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {/* Expanded Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-4 space-y-2">
                    {/* Items List */}
                    {activeItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between px-4 py-2.5 bg-surface-lighter rounded-lg group/item"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-sm text-text-primary">{item.label}</span>
                          {item.value !== item.label && (
                            <span className="text-xs text-text-muted ml-2">({item.value})</span>
                          )}
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteItem(picklist.name, item._id, item.label)}
                            className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover/item:opacity-100"
                            title="Delete item"
                          >
                            <RiDeleteBinLine className="text-sm" />
                          </button>
                        )}
                      </div>
                    ))}

                    {activeItems.length === 0 && (
                      <p className="text-sm text-text-muted text-center py-4">No items in this list</p>
                    )}

                    {/* Add Item Section */}
                    {addingTo === picklist.name ? (
                      <div className="mt-3 p-4 bg-surface-lighter/50 rounded-xl border border-border space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                            Value <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={newItem.value}
                            onChange={(e) => setNewItem(prev => ({ ...prev, value: e.target.value, label: prev.label || '' }))}
                            placeholder="Enter value..."
                            className="w-full px-3 py-2 bg-surface-card border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/40 transition-all text-sm"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                            Display Label <span className="text-text-muted font-normal normal-case">(optional, defaults to value)</span>
                          </label>
                          <input
                            type="text"
                            value={newItem.label}
                            onChange={(e) => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="Enter display label..."
                            className="w-full px-3 py-2 bg-surface-card border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/40 transition-all text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setAddingTo(null); setNewItem({ value: '', label: '' }); }}
                            className="flex-1 px-3 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface-lighter transition-all text-sm font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddItem(picklist.name)}
                            disabled={!newItem.value.trim() || submitting}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg hover:shadow-lg hover:shadow-brand-primary/25 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {submitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Adding...
                              </span>
                            ) : 'Add Item'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setAddingTo(picklist.name); }}
                        className="mt-2 flex items-center gap-2 px-4 py-2 text-sm text-brand-accent hover:bg-brand-primary/10 rounded-lg transition-all font-medium w-full"
                      >
                        <RiAddLine className="text-base" />
                        Add New Item
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {!loading && picklists.length > 0 && (
        <p className="text-xs text-text-muted">
          {picklists.length} picklists available
        </p>
      )}
    </div>
  );
};

export default Picklist;
