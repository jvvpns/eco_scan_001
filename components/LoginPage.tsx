import React, { useState } from 'react';
import { EcoScanBrandIcon, IconProfile, IconSearch } from './Icons';
import { loginUser, registerUser } from '../services/authService';
import { initUserStats } from '../services/firestoreService';

type AuthMode = 'login' | 'register';

// ─── AVATAR HELPER ────────────────────────────────────────────

export const getDefaultAvatar = (name: string): string => {
  const colors = ['#16a34a','#2563eb','#d97706','#dc2626','#7c3aed','#0891b2'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const initial = name.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <rect width="100" height="100" rx="50" fill="${color}"/>
    <text x="50" y="67" text-anchor="middle" font-size="44" font-family="Arial,sans-serif" font-weight="bold" fill="white">${initial}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// ─── EMAIL ICON (form field — small, inline only) ─────────────

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M2 8l10 6 10-6" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-2.8 3.6-5 8-5s8 2.2 8 5" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin inline-block mr-2" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// ─── INPUT WRAPPER ────────────────────────────────────────────

const FormInput: React.FC<{
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  prefix?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ type, placeholder, value, onChange, required, prefix, icon }) => (
  <div className="relative flex items-center">
    {icon && (
      <span className="absolute left-3 text-gray-400 pointer-events-none">
        {icon}
      </span>
    )}
    {prefix && (
      <span className="absolute left-3 text-gray-400 text-sm pointer-events-none">
        {prefix}
      </span>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={`w-full py-3 rounded-xl bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 transition ${icon ? 'pl-9 pr-4' : prefix ? 'pl-7 pr-4' : 'px-4'}`}
    />
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName,     setRegName]     = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail,    setRegEmail]    = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm,  setRegConfirm]  = useState('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const resetForm = () => {
    setRegName(''); setRegUsername(''); setRegEmail('');
    setRegPassword(''); setRegConfirm('');
    setLoginEmail(''); setLoginPassword('');
    setError(null);
  };

  const switchMode = (next: AuthMode) => { resetForm(); setMode(next); };

  // ── LOGIN ──────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginUser(loginEmail, loginPassword);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER ───────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim())            { setError('Please enter your name.'); return; }
    if (!regUsername.trim())        { setError('Please enter a username.'); return; }
    if (regUsername.includes(' '))  { setError('Username cannot contain spaces.'); return; }
    if (regPassword !== regConfirm) { setError('Passwords do not match.'); return; }
    if (regPassword.length < 6)     { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const cred = await registerUser(regEmail, regPassword, regName.trim(), regUsername.trim());
      const avatarUrl = getDefaultAvatar(regName.trim());
      await initUserStats(
        cred.user.uid,
        regName.trim(),
        regEmail,
        regUsername.trim().toLowerCase(),
        avatarUrl
      );
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-br from-green-800 via-green-700 to-emerald-600">
      <div className="w-full max-w-sm mx-auto">

        {/* ── LOGO ─────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm p-4 rounded-full shadow-lg border border-white/30">
            <EcoScanBrandIcon size={64} color="#86efac" />
          </div>
          <h1 className="mt-4 text-4xl font-bold text-white tracking-wider">EcoScan</h1>
          <p className="text-green-200 mt-2 text-sm">Identify garbage, earn points.</p>
        </div>

        {/* ── CARD ─────────────────────────────────────────── */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">
                  Email Address
                </label>
                <FormInput
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  required
                  icon={<EmailIcon />}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">
                  Password
                </label>
                <FormInput
                  type="password"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  required
                  icon={<LockIcon />}
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg disabled:opacity-50"
              >
                {loading ? <><SpinnerIcon />Signing in...</> : 'Log In'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">
                  Full Name
                </label>
                <FormInput
                  type="text"
                  placeholder="Juan dela Cruz"
                  value={regName}
                  onChange={setRegName}
                  required
                  icon={<UserIcon />}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">
                  Username
                </label>
                <FormInput
                  type="text"
                  placeholder="juan_eco"
                  value={regUsername}
                  onChange={(v) => setRegUsername(v.toLowerCase().replace(/\s/g, '_'))}
                  required
                  prefix="@"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">
                  Email Address
                </label>
                <FormInput
                  type="email"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={setRegEmail}
                  required
                  icon={<EmailIcon />}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">
                  Password
                </label>
                <FormInput
                  type="password"
                  placeholder="Min. 6 characters"
                  value={regPassword}
                  onChange={setRegPassword}
                  required
                  icon={<LockIcon />}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">
                  Confirm Password
                </label>
                <FormInput
                  type="password"
                  placeholder="••••••••••••"
                  value={regConfirm}
                  onChange={setRegConfirm}
                  required
                  icon={<LockIcon />}
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg disabled:opacity-50 mt-1"
              >
                {loading ? <><SpinnerIcon />Creating account...</> : 'Create Account'}
              </button>
            </form>
          )}

          {/* MODE SWITCH */}
          <div className="mt-5 text-center">
            {mode === 'login' ? (
              <p className="text-gray-300 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-green-300 font-bold hover:text-green-200 transition"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-gray-300 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-green-300 font-bold hover:text-green-200 transition"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;