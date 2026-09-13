import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  X,
  FileText,
  Video,
  Code2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ContentType } from '../../types';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZES } from '../../lib/validation';
import { useAuth } from '../../context/AuthContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (type: 'success' | 'error' | 'warning', title: string, message?: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onToast,
}) => {
  const { user, isAdmin, fetchWithAuth } = useAuth();
  const [type, setType] = useState<ContentType>('VIDEO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Security Training');
  const [tagsInput, setTagsInput] = useState('Security, Zero-Trust, Architecture');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [adminSubmitForReview, setAdminSubmitForReview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setUploadProgress(0);
    setFormError(null);
    setAdminSubmitForReview(false);
  };

  // Instant demo sample file generators
  const attachSampleFile = async (sampleType: ContentType) => {
    setFormError(null);
    setType(sampleType);

    if (sampleType === 'PDF') {
      const pdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 72 >> stream
BT
/F1 20 Tf
50 720 Td
(NEXUS Enclave: SOC-2 & Zero Trust Hardening Procedure) Tj
ET
endstream endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000234 00000 n 
0000000305 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
428
%%EOF`;
      const file = new File([pdfContent], 'soc2-security-procedure.pdf', { type: 'application/pdf' });
      setSelectedFile(file);
      setTitle('SOC-2 Compliance & Verification Checklist');
      setDescription('Mandatory protocol document covering key rotation, audit trail retention, and encrypted ingress controls.');
      setCategory('Compliance & SOP');
      setTagsInput('SOC2, Compliance, Audit, Security');
    } else if (sampleType === 'HTML') {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Zero Trust Architecture Matrix</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; background: #0c1117; color: #f1f5f9; padding: 2.5rem; line-height: 1.6; }
    h1 { color: #10b981; font-size: 1.75rem; margin-bottom: 0.5rem; }
    p.lead { color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
    .card { background: #131b26; border: 1px solid #1e293b; border-radius: 12px; padding: 1.25rem; }
    .card h3 { color: #38bdf8; font-size: 1rem; margin-top: 0; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: rgba(16, 185, 129, 0.15); color: #34d399; }
  </style>
</head>
<body>
  <h1>NEXUS Zero Trust Architecture Matrix</h1>
  <p class="lead">Authenticated interactive specification for enterprise runtime micro-segmentation.</p>
  <div class="grid">
    <div class="card">
      <span class="badge">ENCRYPTED</span>
      <h3>1. Mutual TLS Handshake</h3>
      <p>All microservices enforce strict mTLS certificate validation with automated 24-hour rotation.</p>
    </div>
    <div class="card">
      <span class="badge">VERIFIED</span>
      <h3>2. Ephemeral Storage Enclaves</h3>
      <p>Data stored in isolation with granular byte-range streaming tokens.</p>
    </div>
  </div>
</body>
</html>`;
      const file = new File([htmlContent], 'zero-trust-architecture-matrix.html', { type: 'text/html' });
      setSelectedFile(file);
      setTitle('Zero Trust Architecture Matrix');
      setDescription('Interactive visual matrix detailing mTLS configurations, microsegmentation boundaries, and audit logging.');
      setCategory('Architecture Briefings');
      setTagsInput('Zero-Trust, Architecture, mTLS, Enclave');
    } else {
      // Sample Video
      try {
        const streamRes = await fetch('/api/content/cnt_001/stream');
        if (streamRes.ok) {
          const blob = await streamRes.blob();
          const file = new File([blob], 'zero-trust-training-briefing.mp4', { type: 'video/mp4' });
          setSelectedFile(file);
        } else {
          throw new Error('Fallback buffer');
        }
      } catch {
        const minimalMp4 = new Uint8Array([0,0,0,32,102,116,121,112,105,115,111,109,0,0,2,0,105,115,111,109,105,115,111,50,97,118,99,49,109,112,52,49]);
        const file = new File([minimalMp4], 'zero-trust-training-briefing.mp4', { type: 'video/mp4' });
        setSelectedFile(file);
      }
      setTitle('Zero Trust Principles & Architecture Briefing');
      setDescription('High-level architectural walk-through covering defense-in-depth, privilege de-escalation, and secure vaulting.');
      setCategory('Security Training');
      setTagsInput('Training, Zero-Trust, Video, SecOps');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setFormError(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const allowed = ALLOWED_EXTENSIONS[type] as readonly string[];

    if (!allowed.includes(ext)) {
      setFormError(`File type mismatch: ${ext} is not valid for ${type}. Allowed: ${allowed.join(', ')}`);
      return;
    }

    const maxSize = MAX_FILE_SIZES[type];
    if (file.size > maxSize) {
      setFormError(`File exceeds maximum limit of ${Math.round(maxSize / (1024 * 1024))} MB.`);
      return;
    }

    setSelectedFile(file);
    if (!title) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim()) {
      setFormError('Please provide both title and description.');
      return;
    }

    if (!selectedFile) {
      setFormError('Please select a file to upload into the secure vault.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (tags.length === 0) {
      setFormError('Please provide at least one tag.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category.trim());
      formData.append('tags', JSON.stringify(tags));
      formData.append('type', type);
      formData.append('file', selectedFile);
      if (isAdmin && adminSubmitForReview) {
        formData.append('submitForReview', 'true');
      }

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 15;
        });
      }, 150);

      const res = await fetchWithAuth('/api/content/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with HTTP status ${res.status}`);
      }

      const data = await res.json();
      setUploadProgress(100);

      if (isAdmin && !adminSubmitForReview) {
        onToast('success', 'Published to Vault', `"${title}" was auto-approved and published directly to the content library.`);
      } else {
        onToast('success', 'Submitted for Review', `"${title}" was submitted successfully. An administrator can now accept or reject it in the Approval Queue.`);
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Upload error:', err);
      setFormError((err as Error).message || 'Something went wrong while uploading.');
      onToast('error', 'Upload Error', (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isUploading ? undefined : onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl bg-[#0f151c] border border-emerald-500/20 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {isAdmin ? 'Upload & Publish Resource' : 'Submit Resource for Review'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAdmin
                      ? 'Admin Direct Publish • Auto-approved and made available organization-wide.'
                      : 'Member Submission • Uploaded to the Admin Approval Queue for verification.'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={isUploading}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submitter Note for Viewers */}
            {!isAdmin && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Approval Workflow:</strong> Your upload will be held in <strong>Pending Review</strong> until accepted by the administrator. You can monitor the approval status anytime in <em>My Submissions</em>.
                </span>
              </div>
            )}

            {/* Error Alert */}
            {formError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Content Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Resource Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'VIDEO', label: 'Video (MP4/WebM)', icon: Video, color: 'text-amber-400' },
                    { id: 'PDF', label: 'PDF Document', icon: FileText, color: 'text-emerald-400' },
                    { id: 'HTML', label: 'HTML Guide', icon: Code2, color: 'text-teal-400' },
                  ].map((t) => {
                    const Icon = t.icon;
                    const active = type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setType(t.id as ContentType);
                          setSelectedFile(null);
                          setFormError(null);
                        }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          active
                            ? 'bg-[#141d27] border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${t.color}`} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Threat Modeling Handbook"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-emerald-500 transition-colors"
                  >
                    <option value="Security Training">Security Training</option>
                    <option value="Compliance & SOP">Compliance & SOP</option>
                    <option value="Engineering Docs">Engineering Docs</option>
                    <option value="Architecture Briefings">Architecture Briefings</option>
                    <option value="Tutorials & Guides">Tutorials & Guides</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summarize the resource content and learning objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Zero-Trust, Cloud, CIS Benchmark"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Drag & Drop File Upload Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">File Asset</label>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Quick Sample:</span>
                    <button
                      type="button"
                      onClick={() => attachSampleFile('VIDEO')}
                      className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 cursor-pointer transition-colors"
                    >
                      Video
                    </button>
                    <button
                      type="button"
                      onClick={() => attachSampleFile('PDF')}
                      className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 cursor-pointer transition-colors"
                    >
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => attachSampleFile('HTML')}
                      className="px-2 py-0.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 cursor-pointer transition-colors"
                    >
                      HTML
                    </button>
                  </div>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-emerald-400 bg-emerald-950/20'
                      : selectedFile
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={(ALLOWED_EXTENSIONS[type] as readonly string[]).join(',')}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                  />

                  {selectedFile ? (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white truncate max-w-sm">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for upload
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-500 mb-2" />
                      <p className="text-sm font-medium text-slate-300">
                        Drop your <span className="text-emerald-400">{type}</span> file here or <span className="underline">browse</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Allowed extensions: {(ALLOWED_EXTENSIONS[type] as readonly string[]).join(', ')} • Max:{' '}
                        {Math.round(MAX_FILE_SIZES[type] / (1024 * 1024))} MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Admin test queue toggle */}
              {isAdmin && (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Test Administrator Review Flow</p>
                      <p className="text-[11px] text-slate-400">
                        Submit this file to the Pending Approval Queue instead of publishing directly.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminSubmitForReview}
                      onChange={(e) => setAdminSubmitForReview(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
              )}

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-emerald-300 font-mono">
                    <span>ENCRYPTING &amp; TRANSFERRING TO VAULT...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isUploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading securely...
                    </>
                  ) : isAdmin && !adminSubmitForReview ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Direct Publish to Enclave</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Submit for Admin Approval</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

