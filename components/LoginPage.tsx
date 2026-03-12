import React, { useState } from 'react';
import { IconRecycle } from './Icons';
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

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (!regName.trim())     { setError('Please enter your name.'); return; }
    if (!regUsername.trim()) { setError('Please enter a username.'); return; }
    if (regUsername.includes(' ')) { setError('Username cannot contain spaces.'); return; }
    if (regPassword !== regConfirm) { setError('Passwords do not match.'); return; }
    if (regPassword.length < 6)    { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const cred = await registerUser(regEmail, regPassword, regName.trim(), regUsername.trim());
      // Initialize Firestore stats with username + default avatar
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
          <div className="inline-block bg-white/20 backdrop-blur-sm p-4 rounded-full shadow-lg border border-white/30">
            <IconRecycle className="h-16 w-16 text-green-300" />
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
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Email Address</label>
                <input
                  type="email" placeholder="you@example.com"
                  value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 transition"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Password</label>
                <input
                  type="password" placeholder="••••••••••••"
                  value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 transition"
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg disabled:opacity-50">
                {loading ? 'Signing in...' : 'Log In'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Full Name</label>
                <input
                  type="text" placeholder="Juan dela Cruz"
                  value={regName} onChange={(e) => setRegName(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 transition"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input
                    type="text" placeholder="juan_eco"
                    value={regUsername} onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))} required
                    className="w-full pl-7 pr-4 py-3 rounded-xl bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Email Address</label>
                <input
                  type="email" placeholder="you@example.com"
                  value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 transition"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Password</label>
                <input
                  type="password" placeholder="Min. 6 characters"
                  value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 transition"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Confirm Password</label>
                <input
                  type="password" placeholder="••••••••••••"
                  value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 transition"
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg disabled:opacity-50 mt-1">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* MODE SWITCH */}
          <div className="mt-5 text-center">
            {mode === 'login' ? (
              <p className="text-gray-300 text-sm">
                Don't have an account?{' '}
                <button onClick={() => switchMode('register')} className="text-green-300 font-bold hover:text-green-200 transition">
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-gray-300 text-sm">
                Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="text-green-300 font-bold hover:text-green-200 transition">
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