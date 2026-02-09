import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { RiCheckboxCircleFill, RiErrorWarningFill, RiInformationFill, RiCloseCircleFill, RiCloseLine, RiDeleteBinLine, RiAlertLine } from 'react-icons/ri';

// ─── Toast Context ───
const ToastContext = createContext(null);

// ─── Confirm Context ───
const ConfirmContext = createContext(null);

// Toast types configuration matching the CRM theme
const toastConfig = {
  success: {
    icon: RiCheckboxCircleFill,
    bg: 'bg-gradient-to-r from-emerald-500/15 to-emerald-600/5',
    border: 'border-emerald-500/40',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    progressBar: 'bg-gradient-to-r from-emerald-400 to-emerald-300',
    glow: 'shadow-xl shadow-emerald-500/15',
    title: 'Success',
  },
  error: {
    icon: RiCloseCircleFill,
    bg: 'bg-gradient-to-r from-red-500/15 to-red-600/5',
    border: 'border-red-500/40',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    progressBar: 'bg-gradient-to-r from-red-400 to-red-300',
    glow: 'shadow-xl shadow-red-500/15',
    title: 'Error',
  },
  warning: {
    icon: RiErrorWarningFill,
    bg: 'bg-gradient-to-r from-amber-500/15 to-amber-600/5',
    border: 'border-amber-500/40',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    progressBar: 'bg-gradient-to-r from-amber-400 to-amber-300',
    glow: 'shadow-xl shadow-amber-500/15',
    title: 'Warning',
  },
  info: {
    icon: RiInformationFill,
    bg: 'bg-gradient-to-r from-brand-primary/15 to-brand-secondary/5',
    border: 'border-brand-primary/40',
    iconBg: 'bg-brand-primary/20',
    iconColor: 'text-brand-accent',
    progressBar: 'bg-gradient-to-r from-brand-accent to-brand-highlight',
    glow: 'shadow-xl shadow-brand-primary/15',
    title: 'Info',
  },
};

// ─── Individual Toast Component (Bigger Modal-Style) ───
const Toast = ({ id, type = 'info', message, duration = 4500, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(id), 300);
  }, [id, onRemove]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, handleClose]);

  return (
    <div
      className={`
        relative flex items-start gap-4 px-5 py-4 rounded-2xl border backdrop-blur-xl
        ${config.glow} w-[420px] max-w-[90vw]
        ${config.bg} ${config.border}
        ${isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}
        transition-all duration-300
      `}
      role="alert"
    >
      {/* Icon with background circle */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center`}>
        <Icon size={22} className={config.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={`text-sm font-bold ${config.iconColor} mb-0.5`}>{config.title}</p>
        <p className="text-sm text-text-secondary font-medium leading-relaxed">
          {message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-white/10 p-1.5 -mt-1 -mr-1"
      >
        <RiCloseLine size={18} />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-3 right-3 h-[3px] bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${config.progressBar} rounded-full`}
          style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
        />
      </div>
    </div>
  );
};

// ─── Confirmation Modal Component ───
const ConfirmModal = ({ isOpen, title, message, confirmText, cancelText, type, onConfirm, onCancel }) => {
  const [isExiting, setIsExiting] = useState(false);

  if (!isOpen) return null;

  const handleCancel = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onCancel();
    }, 200);
  };

  const handleConfirm = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onConfirm();
    }, 200);
  };

  const typeStyles = {
    danger: {
      icon: RiDeleteBinLine,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      confirmBtn: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25',
      headerGlow: 'shadow-red-500/10',
    },
    warning: {
      icon: RiAlertLine,
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      confirmBtn: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-500/25',
      headerGlow: 'shadow-amber-500/10',
    },
    info: {
      icon: RiInformationFill,
      iconBg: 'bg-brand-primary/20',
      iconColor: 'text-brand-accent',
      confirmBtn: 'bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-accent shadow-lg shadow-brand-primary/25',
      headerGlow: 'shadow-brand-primary/10',
    },
  };

  const style = typeStyles[type] || typeStyles.info;
  const Icon = style.icon;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${isExiting ? 'animate-confirm-backdrop-exit' : 'animate-confirm-backdrop-enter'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />

      {/* Modal */}
      <div className={`relative bg-surface-card rounded-2xl border border-border w-full max-w-md shadow-2xl ${style.headerGlow} ${isExiting ? 'animate-confirm-exit' : 'animate-confirm-enter'}`}>
        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl ${style.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon size={32} className={style.iconColor} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-text-primary mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-5 py-2.5 rounded-xl bg-surface-lighter border border-border text-text-secondary font-semibold
                hover:bg-surface-light hover:text-text-primary active:scale-[0.98] transition-all duration-200"
            >
              {cancelText || 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-5 py-2.5 rounded-xl text-white font-semibold
                active:scale-[0.98] transition-all duration-200 ${style.confirmBtn}`}
            >
              {confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Toast Container & Provider ───
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    type: 'info',
    resolve: null,
  });

  const addToast = useCallback((type, message, duration = 4500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (msg, dur) => addToast('success', msg, dur),
    error: (msg, dur) => addToast('error', msg, dur),
    warning: (msg, dur) => addToast('warning', msg, dur),
    info: (msg, dur) => addToast('info', msg, dur),
  }), [addToast]);

  const confirm = useCallback(({ title, message, confirmText, cancelText, type = 'danger' } = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: title || 'Are you sure?',
        message: message || 'This action cannot be undone.',
        confirmText: confirmText || 'Delete',
        cancelText: cancelText || 'Cancel',
        type,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    confirmState.resolve?.(true);
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    confirmState.resolve?.(false);
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, [confirmState]);

  return (
    <ToastContext.Provider value={toast}>
      <ConfirmContext.Provider value={confirm}>
        {children}

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          type={confirmState.type}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />

        {/* Toast Container - Top Right */}
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast
                id={t.id}
                type={t.type}
                message={t.message}
                duration={t.duration}
                onRemove={removeToast}
              />
            </div>
          ))}
        </div>
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Hook to use confirmation modal
export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ToastProvider');
  }
  return context;
};

export default Toast;
