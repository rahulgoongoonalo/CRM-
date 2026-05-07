import { useState, useEffect, useMemo } from 'react';
import { RiCloseLine, RiFileWord2Line, RiEyeLine, RiAlertLine } from 'react-icons/ri';
import {
  PLACEHOLDER_FIELDS,
  generateFilledDocx,
  renderPreviewHtml,
  downloadBlob,
} from '../utils/docxFiller';
import { useToast } from './ToastNotification';
import { onboardingAPI } from '../services/api';

// Pull pre-fillable values from the onboarding record's L1 questionnaire.
function deriveInitialValues(onboarding) {
  const l1 = onboarding?.l1QuestionnaireData || {};
  return {
    artistName: onboarding?.artistName || onboarding?.member?.artistName || l1.artistName || '',
    panNumber: l1.panNumber || '',
    gstNumber: l1.gstNumber || '',
    aadharNumber: l1.aadharNumber || '',
    address: l1.address || l1.cityCountry || onboarding?.member?.location || '',
    accountName: l1.accountName || '',
    accountNumber: l1.accountNumber || '',
    bankName: l1.bankName || '',
    ifscCode: l1.ifscCode || '',
    branchName: l1.branchName || '',
  };
}

// Map form keys -> L1QuestionnaireData keys (only the ones the schema knows about).
const FORM_TO_L1 = {
  panNumber: 'panNumber',
  gstNumber: 'gstNumber',
  aadharNumber: 'aadharNumber',
  address: 'address',
  accountName: 'accountName',
  accountNumber: 'accountNumber',
  bankName: 'bankName',
  ifscCode: 'ifscCode',
  branchName: 'branchName',
};

const GenerateDocumentModal = ({ isOpen, onClose, onboarding, onSaved }) => {
  const toast = useToast();
  const [values, setValues] = useState({});
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (isOpen && onboarding) {
      setValues(deriveInitialValues(onboarding));
      setPreviewHtml('');
      setIsPreviewing(false);
    }
  }, [isOpen, onboarding]);

  const missingRequired = useMemo(() => {
    return PLACEHOLDER_FIELDS
      .filter(f => f.required && !String(values[f.dbKey] || '').trim())
      .map(f => f.label);
  }, [values]);

  if (!isOpen || !onboarding) return null;

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const validate = () => {
    if (missingRequired.length > 0) {
      toast.error(`Please fill required fields: ${missingRequired.join(', ')}`);
      return false;
    }
    return true;
  };

  const safeFileName = () => {
    const name = (values.artistName || 'Agreement').replace(/[\\/:*?"<>|]+/g, '_').trim();
    return `${name}_Music_Licensing_Agreement`;
  };

  const persistToL1 = async () => {
    const existingL1 = onboarding?.l1QuestionnaireData || {};
    const merged = { ...existingL1 };
    let changed = false;
    for (const [formKey, l1Key] of Object.entries(FORM_TO_L1)) {
      const newVal = String(values[formKey] ?? '').trim();
      if (!newVal) continue;
      if (existingL1[l1Key] !== newVal) {
        merged[l1Key] = newVal;
        changed = true;
      }
    }
    if (!changed) return false;
    try {
      await onboardingAPI.saveL1Progress(onboarding._id, merged);
      return true;
    } catch (e) {
      console.error('Failed to persist L1 fields:', e);
      toast.error('Document generated, but saving fields to record failed');
      return false;
    }
  };

  const handleDownloadDocx = async () => {
    if (!validate()) return;
    try {
      setIsWorking(true);
      const blob = await generateFilledDocx(values);
      downloadBlob(blob, `${safeFileName()}.docx`);
      const saved = await persistToL1();
      toast.success(saved ? 'DOCX downloaded & data saved' : 'DOCX downloaded');
      if (saved && typeof onSaved === 'function') onSaved();
    } catch (e) {
      console.error(e);
      toast.error(`Failed to generate DOCX: ${e.message}`);
    } finally {
      setIsWorking(false);
    }
  };

  const handlePreview = async () => {
    if (!validate()) return;
    try {
      setIsWorking(true);
      const html = await renderPreviewHtml(values);
      setPreviewHtml(html);
      setIsPreviewing(true);
    } catch (e) {
      console.error(e);
      toast.error(`Preview failed: ${e.message}`);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className={`relative bg-surface-card rounded-lg shadow-2xl shadow-brand-primary/20 w-full ${isPreviewing ? 'max-w-5xl' : 'max-w-3xl'} max-h-[92vh] overflow-hidden border border-border flex flex-col`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 flex items-center justify-between shadow-lg">
          <div>
            <h2 className="text-xl font-bold text-white">Generate Music Licensing Agreement</h2>
            <p className="text-white/80 text-xs mt-0.5">{onboarding.artistName || onboarding.member?.artistName}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all">
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {!isPreviewing ? (
          <>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              {missingRequired.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
                  <RiAlertLine className="text-lg flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-0.5">Fields needed before generating:</div>
                    <div className="text-amber-300/90">{missingRequired.join(', ')}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLACEHOLDER_FIELDS.map(f => (
                  <div key={f.dbKey} className={f.dbKey === 'address' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                      {f.label}
                      {f.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {f.dbKey === 'address' ? (
                      <textarea
                        rows={2}
                        value={values[f.dbKey] || ''}
                        onChange={e => handleChange(f.dbKey, e.target.value)}
                        className="input w-full text-sm"
                      />
                    ) : (
                      <input
                        type={f.isDate ? 'date' : 'text'}
                        value={values[f.dbKey] || ''}
                        onChange={e => handleChange(f.dbKey, e.target.value)}
                        className="input w-full text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-text-muted pt-2 border-t border-border">
                On Generate, any new values typed here are saved into the artist's L1 questionnaire so they are pre-filled next time.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-border bg-surface-light/30 flex flex-wrap items-center justify-end gap-2">
              <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
              <button
                onClick={handlePreview}
                disabled={isWorking || missingRequired.length > 0}
                title={missingRequired.length > 0 ? 'Fill all required fields first' : ''}
                className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RiEyeLine /> Preview
              </button>
              <button
                onClick={handleDownloadDocx}
                disabled={isWorking || missingRequired.length > 0}
                title={missingRequired.length > 0 ? 'Fill all required fields first' : ''}
                className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RiFileWord2Line /> Generate &amp; Download Word
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 bg-neutral-300 p-6">
              {/* Word page-like surface — mirrors the actual .docx layout */}
              <div
                className="mx-auto bg-white text-black shadow-xl"
                style={{
                  width: '8.5in',
                  maxWidth: '100%',
                  minHeight: '11in',
                  padding: '1in',
                  fontFamily: 'Times New Roman, Times, serif',
                  fontSize: '12pt',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
              <p className="text-center text-xs text-text-muted mt-3">
                Filled values shown in <span className="text-red-500 font-semibold">red</span> for review only — exported Word file uses the document's original colors.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-border bg-surface-light/30 flex flex-wrap items-center justify-end gap-2">
              <button onClick={() => setIsPreviewing(false)} className="btn-secondary px-4 py-2 text-sm">Back to Edit</button>
              <button
                onClick={handleDownloadDocx}
                disabled={isWorking || missingRequired.length > 0}
                className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RiFileWord2Line /> Generate &amp; Download Word
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerateDocumentModal;
