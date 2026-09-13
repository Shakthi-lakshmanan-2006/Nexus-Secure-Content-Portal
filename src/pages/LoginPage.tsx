import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Lock,
  CheckCircle2,
  ArrowRight,
  Globe,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  X,
  Mail,
  KeyRound,
  User,
  UploadCloud,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loading } = useAuth();

  // Mobile portal tab toggle ('both' on large screens, 'admin' or 'user' on small screens)
  const [activePortalTab, setActivePortalTab] = useState<'admin' | 'user'>('admin');

  // User login form state (user's own mail ID)
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userError, setUserError] = useState<string | null>(null);

  // Admin login form state
  const [adminEmailInput, setAdminEmailInput] = useState('sakthilakshman521@gmail.com');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showCustomAdmin, setShowCustomAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Guide modal & Google setup state
  const [showVercelGuide, setShowVercelGuide] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [customClientId, setCustomClientId] = useState(() => {
    return localStorage.getItem('nexus_custom_google_client_id') || '';
  });
  const [clientIdSaved, setClientIdSaved] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  // Determine effective Google Client ID
  const envClientId = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_CLIENT_ID || '';
  const effectiveClientId = customClientId.trim() || envClientId;

  // Initialize authentic Google Identity Services if client ID is configured
  useEffect(() => {
    if (typeof window === 'undefined' || !window.google?.accounts?.id || !effectiveClientId) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: effectiveClientId,
        callback: async (response: { credential?: string }) => {
          if (response.credential) {
            await loginWithGoogle(undefined, undefined, undefined, response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: 320,
        });
      }
    } catch (err) {
      console.warn('[Google Identity Services Init Warning]:', err);
    }
  }, [effectiveClientId, loginWithGoogle]);

  const handleCopyOrigin = () => {
    if (currentOrigin) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2000);
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('nexus_custom_google_client_id', customClientId.trim());
    setClientIdSaved(true);
    setTimeout(() => setClientIdSaved(false), 2500);
  };

  // --- Handlers for Admin Portal ---
  const handleAdminGoogleLogin = async () => {
    setAdminError(null);
    await loginWithGoogle('sakthilakshman521@gmail.com', 'Sakthi Lakshmanan (Admin)');
  };

  const handleCustomAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    const cleanEmail = adminEmailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAdminError('Please enter a valid administrator email address.');
      return;
    }
    // Sakthi Lakshmanan is the designated administrator
    const name = cleanEmail === 'sakthilakshman521@gmail.com' ? 'Sakthi Lakshmanan (Admin)' : 'Administrator';
    await loginWithGoogle(cleanEmail, name);
  };

  // --- Handlers for User Portal ---
  const handleUserEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    const cleanEmail = userEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setUserError('Please enter a valid email address.');
      return;
    }
    const cleanName = userName.trim() || cleanEmail.split('@')[0];
    await loginWithGoogle(cleanEmail, cleanName);
  };

  const handleUserGoogleLogin = async () => {
    setUserError(null);
    if (window.google?.accounts?.id && effectiveClientId) {
      window.google.accounts.id.prompt();
    } else {
      // Default to team user Google login if no client ID set
      await loginWithGoogle('team.member@nexus.internal', 'Team Member');
    }
  };

  const handleQuickDemoUser = async () => {
    setUserError(null);
    await loginWithGoogle('viewer.demo@nexus.internal', 'Alex Morgan (Member)');
  };

  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-200">
      {/* Subtle atmospheric ambient glows */}
      <div className="absolute top-1/6 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/6 right-1/4 translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-5 flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-950/40">
            <Shield className="w-5 h-5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wider text-white">NEXUS</h1>
            <p className="text-[10px] font-mono tracking-tight text-emerald-400 font-semibold">
              SECURE ENCLAVE PORTAL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-vercel-guide"
            onClick={() => setShowVercelGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium hidden sm:inline">Deployment &amp; Google Auth Guide</span>
            <span className="font-medium sm:hidden">Guide</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px] hidden sm:inline">ZERO-TRUST RBAC</span>
          </div>
        </div>
      </header>

      {/* Main Dual Authentication Showcase */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 z-10 max-w-6xl mx-auto w-full">
        {/* Top Titles */}
        <div className="text-center max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono font-medium text-emerald-300 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SELECT AUTHENTICATION PORTAL</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Role-Enforced Enterprise Portal
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Choose your login below: <strong>Admin Portal</strong> to review, approve, or reject user uploads, or <strong>User Portal</strong> to sign in with your email or Google account and upload files to be stored.
          </p>

          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden items-center justify-center gap-2 mt-5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-xs mx-auto">
            <button
              onClick={() => setActivePortalTab('admin')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activePortalTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
            <button
              onClick={() => setActivePortalTab('user')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activePortalTab === 'user'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>User Login</span>
            </button>
          </div>
        </div>

        {/* Dual Login Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-stretch">
          {/* ========================================================================= */}
          {/* 1. ADMINISTRATOR LOGIN PORTAL                                            */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-[#0d131a]/95 border-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative backdrop-blur-xl ${
              activePortalTab === 'admin' ? 'border-amber-500/50 shadow-amber-950/20' : 'border-slate-800 hidden lg:flex'
            }`}
          >
            <div>
              {/* Card Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>ADMINISTRATOR PORTAL</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                  FULL PERMISSIONS
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Admin Sign In
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Super-administrative clearance to <strong>approve or reject files</strong> uploaded by users, oversee protected vault storage, and audit security events.
              </p>

              {/* Primary 1-Click Google Sign-In for Admin */}
              <div className="mt-6 space-y-3">
                <button
                  id="btn-login-google-admin"
                  onClick={handleAdminGoogleLogin}
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm flex items-center justify-between shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer border border-white/80"
                >
                  <div className="flex items-center gap-3">
                    {/* Official Google 4-Color G Logo */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900">Sign In as Administrator (Google)</div>
                      <div className="text-[11px] font-mono text-slate-500">sakthilakshman521@gmail.com</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[11px] font-mono font-bold">
                    ADMIN
                  </span>
                </button>

                {/* Optional Custom Admin Form Toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomAdmin(!showCustomAdmin)}
                    className="text-xs text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{showCustomAdmin ? 'Hide Custom Admin Credentials' : 'Or sign in with custom Admin Email / Key'}</span>
                  </button>

                  {showCustomAdmin && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onSubmit={handleCustomAdminSubmit}
                      className="mt-3 space-y-2.5"
                    >
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">
                          Admin Email Address:
                        </label>
                        <input
                          type="email"
                          required
                          value={adminEmailInput}
                          onChange={(e) => setAdminEmailInput(e.target.value)}
                          placeholder="sakthilakshman521@gmail.com"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">
                          Admin Passcode / Security Key (Optional):
                        </label>
                        <input
                          type="password"
                          value={adminPasscode}
                          onChange={(e) => setAdminPasscode(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono"
                        />
                      </div>
                      {adminError && (
                        <p className="text-xs text-rose-400">{adminError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <span>Authorize Administrator</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.form>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Capabilities List */}
            <div className="mt-8 pt-5 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
              <div className="text-[11px] font-mono uppercase text-amber-400/90 font-bold tracking-wider mb-2">
                Administrator Permissions:
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Approve or Reject:</strong> Inspect user-uploaded files, approve for publication, or reject with feedback notes.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Approval Queue:</strong> Real-time alert badges when members upload new video, PDF, or HTML assets.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Full Storage Control:</strong> Directly upload &amp; publish resources, edit metadata, or purge vaulted assets.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Security &amp; Audit Logs:</strong> Access tamper-evident activity logs, IP records, and run enclave tests.</span>
              </div>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* 2. USER / MEMBER LOGIN PORTAL                                            */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-[#0d131a]/95 border-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative backdrop-blur-xl ${
              activePortalTab === 'user' ? 'border-emerald-500/50 shadow-emerald-950/20' : 'border-slate-800 hidden lg:flex'
            }`}
          >
            <div>
              {/* Card Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>USER / MEMBER PORTAL</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                  FILE UPLOAD &amp; STORAGE
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                User Sign In
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Log in through your <strong>own email ID</strong> or <strong>Google authentication</strong> to upload and safely store training videos, PDF briefs, and documents.
              </p>

              {/* Login Form: User's Own Mail ID */}
              <form onSubmit={handleUserEmailSubmit} className="mt-6 space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-200">
                    Your Mail ID:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      id="input-user-email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="e.g. yourname@company.com or personal@gmail.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-200">
                    Your Full Name <span className="text-slate-400 font-normal">(Optional)</span>:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      id="input-user-name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {userError && (
                  <p className="text-xs text-rose-400">{userError}</p>
                )}

                <button
                  type="submit"
                  id="btn-login-user-email"
                  disabled={loading}
                  className="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Sign In with Mail ID &amp; Upload Files</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </form>

              {/* Alternative User Logins: Google Authentication & Demo */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Or connect via:</span>
                </div>

                {/* Google Native Container (if Client ID present) */}
                {effectiveClientId && (
                  <div className="flex justify-center my-2">
                    <div ref={googleBtnRef} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleUserGoogleLogin}
                    disabled={loading}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Google Auth</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoUser}
                    disabled={loading}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Demo User (Alex)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* User Permissions & Workflow List */}
            <div className="mt-8 pt-5 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
              <div className="text-[11px] font-mono uppercase text-emerald-400/90 font-bold tracking-wider mb-2">
                User Workflow &amp; File Storage:
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Upload Files to Store:</strong> Securely upload training videos (.mp4), PDF documents, and HTML briefs.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Admin Review Routing:</strong> Uploads are held in <em>Pending Review</em> for Admin approval.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Submission Tracking:</strong> Track whether files are Approved or Rejected (with feedback notes).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Vault Access:</strong> Browse organization-approved content in the protected Zero-Trust viewer enclave.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-900 text-center text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <span>NEXUS ENCLAVE v1.0 • ROLE-BASED ACCESS CONTROL ENFORCED</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowVercelGuide(true)}
            className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <HelpCircle className="w-3 h-3" />
            Deployment &amp; Google Cloud OAuth Guide
          </button>
        </div>
      </footer>

      {/* VERCEL DEPLOYMENT & GOOGLE OAUTH SETUP MODAL */}
      <AnimatePresence>
        {showVercelGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative text-left"
            >
              <button
                type="button"
                id="btn-close-vercel-guide"
                onClick={() => setShowVercelGuide(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Google OAuth &amp; Deployment Configuration
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ORIGIN VERIFICATION &amp; GOOGLE CLOUD CREDENTIALS
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-200">
                  <div className="flex items-center gap-2 font-semibold text-white mb-1">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Two Login Workflows Supported:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-cyan-100">
                    <li>
                      <strong>Administrator Login:</strong> Granted to <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-300">sakthilakshman521@gmail.com</code> with full rights to approve or reject user-uploaded files.
                    </li>
                    <li>
                      <strong>User / Member Login:</strong> Any user can sign in using their own mail ID or Google credentials and immediately upload files for storage.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    Your Current App URL:
                  </h4>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-mono text-xs text-cyan-300 flex-1 truncate">{currentOrigin}</span>
                    <button
                      type="button"
                      onClick={handleCopyOrigin}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedOrigin ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Origin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    Google Client ID (Optional):
                  </h4>
                  <p className="text-xs text-slate-400">
                    If you have a Google Client ID from Google Cloud Console, enter it here to enable native Google Identity popup on this domain:
                  </p>
                  <form onSubmit={handleSaveClientId} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="xxxx.apps.googleusercontent.com"
                      value={customClientId}
                      onChange={(e) => setCustomClientId(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      {clientIdSaved ? 'Saved!' : 'Save ID'}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
