import React, { useState, useRef } from 'react';
import { Page } from '../types';
import { useAuth } from '../hooks/useAuth';
import { BADGES } from '../services/gamificationService';
import { logoutUser, updateDisplayName } from '../services/authService';
import { updateUserStats, updateLeaderboardEntry } from '../services/firestoreService';
import { getDefaultAvatar } from './LoginPage';
import { useToast, ToastContainer } from './Toast';

interface ProfilePageProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

import {
  IconHome, IconMissions, IconLeaderboard, IconProfile, IconScanNav,
  IconEcoPoints, IconStreak, IconBadge, IconRecycling, IconOrganic,
  IconUploadAvatar, IconEditProfile, IconClose, IconScan, IconSettings,
} from './Icons';

const StatRow: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2">
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="text-gray-600 text-sm font-medium">{label}</span>
    </div>
    <span className="text-gray-900 font-bold text-sm">{value}</span>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, currentPage }) => {
  const { user, userStats, unlockedBadgeIds, refreshStats, loading } = useAuth();
  const { toasts, showToast, dismissToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loggingOut, setLoggingOut] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const accuracy = userStats && userStats.totalScans > 0
    ? Math.round((userStats.correctScans / userStats.totalScans) * 100)
    : 0;

  const currentAvatar = userStats?.avatarUrl || getDefaultAvatar(userStats?.displayName || 'E');

  const openEditModal = () => {
    setEditName(userStats?.displayName ?? '');
    setEditUsername(userStats?.username ?? '');
    setEditAvatar(userStats?.avatarUrl ?? '');
    setEditError(null);
    setShowEditModal(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setEditError('Image too large. Please choose one under 500KB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setEditAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim())     { setEditError('Name cannot be empty.'); return; }
    if (!editUsername.trim()) { setEditError('Username cannot be empty.'); return; }
    if (editUsername.includes(' ')) { setEditError('Username cannot contain spaces.'); return; }
    if (!user) return;

    setSaving(true);
    setEditError(null);
    try {
      await updateDisplayName(editName.trim());
      await updateUserStats(user.uid, {
        displayName: editName.trim(),
        username: editUsername.trim().toLowerCase(),
        avatarUrl: editAvatar,
      });
      // Sync to leaderboard
      await updateLeaderboardEntry(user.uid, {
        displayName: editName.trim(),
        username: editUsername.trim().toLowerCase(),
        avatarUrl: editAvatar,
        ecoPoints: userStats?.ecoPoints ?? 0,
        level: userStats?.level ?? 1,
        correctScans: userStats?.correctScans ?? 0,
        totalScans: userStats?.totalScans ?? 0,
      });
      await refreshStats();
      setShowEditModal(false);
    } catch (e) {
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logoutUser(); }
    catch (e) { setLoggingOut(false); }
  };



  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── SPLASH HEADER ───────────────────────────────── */}
      <div className="bg-green-500 rounded-b-[2rem] px-6 pt-12 pb-10 shadow-sm relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-green-400/20 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

        {/* Settings icon */}
        <button
          onClick={() => onNavigate(Page.APP_SETTINGS)}
          className="absolute top-12 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition-all border border-white/20 z-20"
        >
          <IconSettings size={20} color="currentColor" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center gap-3 animate-pulse relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/30" />
            <div className="h-4 w-32 bg-white/30 rounded" />
            <div className="h-3 w-24 bg-white/20 rounded" />
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center text-center gap-2">
            <div className="relative">
              <img
                src={currentAvatar}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button
                onClick={openEditModal}
                className="absolute bottom-0 right-0 w-7 h-7 bg-green-400 hover:bg-green-300 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors"
              >
                <IconEditProfile size={13} color="white" />
              </button>
            </div>
            <div>
              <p className="text-white font-black text-xl tracking-tight">{userStats?.displayName ?? 'EcoUser'}</p>
              <p className="text-green-100 text-sm font-semibold">@{userStats?.username || 'username'}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                ⭐ Level {userStats?.level ?? 1}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                🔥 {userStats?.streak ?? 0} Streak
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-28 space-y-4">
        {loading ? (
          <>
            <div className="bg-white rounded-[1.25rem] h-28 animate-pulse border border-gray-100" />
            <div className="bg-white rounded-[1.25rem] h-44 animate-pulse border border-gray-100" />
          </>
        ) : (
          <>
          {/* ── ECO POINTS BANNER ──────────────────────────────── */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-[1.25rem] p-5 flex items-center justify-between shadow-md shadow-green-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-green-100 text-xs font-bold uppercase tracking-wider">Total EcoPoints</p>
              <p className="text-white font-black text-4xl leading-none mt-1">{userStats?.ecoPoints ?? 0}</p>
              <p className="text-green-200 text-xs mt-1.5 font-medium">
                {100 - ((userStats?.ecoPoints ?? 0) % 100)} pts to Level {(userStats?.level ?? 1) + 1}
              </p>
            </div>
            <div className="relative z-10">
              <IconOrganic size={56} color="rgba(255,255,255,0.7)" />
            </div>
          </div>

          {/* ── SCAN STATS ─────────────────────────────────────── */}
          <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-gray-100">
            <p className="text-gray-900 font-bold text-base mb-3 tracking-tight">Scan Statistics</p>
            <StatRow label="Total Scans"     value={userStats?.totalScans ?? 0}                       icon={<IconScan      size={16} color="#3b82f6" />} />
            <StatRow label="Correct Answers" value={userStats?.correctScans ?? 0}                     icon={<IconRecycling size={16} color="#16a34a" />} />
            <StatRow label="Accuracy"        value={`${accuracy}%`}                                  icon={<IconEcoPoints size={16} color="#6366f1" />} />
            <StatRow label="Badges Earned"   value={`${unlockedBadgeIds.length} / ${BADGES.length}`} icon={<IconBadge     size={16} color="#d97706" />} />
          </div>

          {/* ── ENVIRONMENTAL IMPACT ───────────────────────────── */}
          <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-green-100">
            <p className="text-gray-900 font-bold text-base mb-3 tracking-tight">Environmental Impact</p>
            <StatRow label="Items Classified" value={`${userStats?.itemsClassified ?? 0} items`} icon={<IconScan     size={16} color="#3b82f6" />} />
            <StatRow label="CO₂ Saved"        value={`${userStats?.co2Saved ?? 0} kg`}          icon={<IconOrganic  size={16} color="#16a34a" />} />
            <StatRow label="Waste Diverted"   value={`${userStats?.wasteDiverted ?? 0} kg`}      icon={<IconRecycling size={16} color="#06b6d4" />} />
            <StatRow label="Trees Saved"      value={`${userStats?.treesSaved ?? 0}`}            icon={<IconOrganic  size={16} color="#15803d" />} />
          </div>

          {/* ── BADGES ─────────────────────────────────────────── */}
          {unlockedBadgeIds.length > 0 && (
            <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-amber-100">
              <p className="text-gray-900 font-bold text-base mb-3 tracking-tight">Badges Earned</p>
              <div className="flex flex-wrap gap-2">
                {BADGES.filter(b => unlockedBadgeIds.includes(b.id)).map(badge => (
                  <div key={badge.id} className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
                    <span className="text-sm">{badge.icon}</span>
                    <span className="text-xs font-bold text-amber-800">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LOGOUT ─────────────────────────────────────────── */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full bg-white border border-red-200 text-red-500 font-bold rounded-[1.25rem] py-4 text-sm hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
          >
            {loggingOut ? 'Signing out...' : '→ Sign Out'}
          </button>

          </> /* end loading ternary */
        )}
      </div>

      {/* ── EDIT PROFILE MODAL ─────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-[2rem] w-full max-w-lg p-6 pb-10 space-y-5 animate-slide-up max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900 font-black text-xl tracking-tight">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                <IconClose size={22} color="#6b7280" />
              </button>
            </div>

            {/* Avatar picker */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img
                  src={editAvatar || getDefaultAvatar(editName || 'E')}
                  alt="avatar preview"
                  className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-green-200"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow"
                >
                  <IconUploadAvatar size={14} color="white" />
                </button>
              </div>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <IconUploadAvatar size={12} color="#9ca3af" />
                Tap camera to change avatar (max 500KB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 text-gray-800 placeholder-gray-400 font-medium transition-all text-sm"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">@</span>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                  placeholder="your_username"
                  className="w-full pl-8 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 text-gray-800 placeholder-gray-400 font-medium transition-all text-sm"
                />
              </div>
            </div>

            {editError && <p className="text-red-500 text-sm text-center font-medium">{editError}</p>}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-500/20 text-white font-black text-base py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-green-500/30 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;