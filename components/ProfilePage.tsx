import React, { useState, useRef } from 'react';
import { Page } from '../types';
import { useAuth } from '../hooks/useAuth';
import { BADGES } from '../services/gamificationService';
import { logoutUser, updateDisplayName } from '../services/authService';
import { updateUserStats, updateLeaderboardEntry } from '../services/firestoreService';
import { getDefaultAvatar } from './LoginPage';

interface ProfilePageProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

// ─── BOTTOM NAV ICONS ─────────────────────────────────────────

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const MissionsIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);
const LeaderboardIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const ProfileNavIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const ScanCameraIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="white" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StatRow: React.FC<{ label: string; value: string | number; emoji: string }> = ({ label, value, emoji }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2">
      <span className="text-base">{emoji}</span>
      <span className="text-gray-600 text-sm font-medium">{label}</span>
    </div>
    <span className="text-gray-900 font-bold text-sm">{value}</span>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, currentPage }) => {
  const { user, userStats, unlockedBadgeIds, refreshStats } = useAuth();
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
      setEditError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logoutUser(); }
    catch (e) { setLoggingOut(false); }
  };

  const navItems = [
    { page: Page.DASHBOARD, label: 'Home',     icon: (a: boolean) => <HomeIcon active={a} /> },
    { page: Page.TIER,      label: 'Missions', icon: (a: boolean) => <MissionsIcon active={a} /> },
    { page: null,           label: 'Scan',     icon: () => null },
    { page: Page.PROFILE,   label: 'Leaders',  icon: (a: boolean) => <LeaderboardIcon active={a} /> },
    { page: Page.SETTINGS,  label: 'Profile',  icon: (a: boolean) => <ProfileNavIcon active={a} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f0fdf4] font-sans">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-gray-900 font-black text-xl tracking-tight">Profile</h1>
        <p className="text-gray-500 text-xs font-medium mt-0.5">Your EcoScan journey</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 space-y-4">

        {/* ── PROFILE CARD ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={currentAvatar}
                alt="avatar"
                className="w-18 h-18 rounded-full object-cover shadow-md"
                style={{ width: 72, height: 72 }}
              />
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-black text-lg truncate">
                {userStats?.displayName ?? 'EcoUser'}
              </p>
              <p className="text-green-600 text-sm font-semibold truncate">
                @{userStats?.username || 'username'}
              </p>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  Level {userStats?.level ?? 1}
                </span>
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {userStats?.streak ?? 0} 🔥
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={openEditModal}
            className="mt-4 w-full bg-green-50 border border-green-200 text-green-700 font-bold text-sm rounded-xl py-2.5 active:scale-95 transition hover:bg-green-100"
          >
            Edit Profile
          </button>
        </div>

        {/* ── ECO POINTS BANNER ──────────────────────────────── */}
        <div className="bg-green-500 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-green-100 text-xs font-semibold">Total EcoPoints</p>
            <p className="text-white font-black text-3xl leading-none">{userStats?.ecoPoints ?? 0}</p>
            <p className="text-green-200 text-xs mt-1">
              {100 - ((userStats?.ecoPoints ?? 0) % 100)} pts to Level {(userStats?.level ?? 1) + 1}
            </p>
          </div>
          <span className="text-5xl">🌿</span>
        </div>

        {/* ── SCAN STATS ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-900 font-bold text-sm mb-1">Scan Statistics</p>
          <StatRow label="Total Scans"     value={userStats?.totalScans ?? 0}                    emoji="📊" />
          <StatRow label="Correct Answers" value={userStats?.correctScans ?? 0}                  emoji="✅" />
          <StatRow label="Accuracy"        value={`${accuracy}%`}                               emoji="🎯" />
          <StatRow label="Badges Earned"   value={`${unlockedBadgeIds.length} / ${BADGES.length}`} emoji="🎖️" />
        </div>

        {/* ── ENVIRONMENTAL IMPACT ───────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="text-gray-900 font-bold text-sm mb-1">Environmental Impact</p>
          <StatRow label="Items Classified" value={`${userStats?.itemsClassified ?? 0} items`} emoji="🏅" />
          <StatRow label="CO₂ Saved"        value={`${userStats?.co2Saved ?? 0} kg`}           emoji="🌱" />
          <StatRow label="Waste Diverted"   value={`${userStats?.wasteDiverted ?? 0} kg`}       emoji="♻️" />
          <StatRow label="Trees Saved"      value={`${userStats?.treesSaved ?? 0}`}             emoji="🌳" />
        </div>

        {/* ── BADGES ─────────────────────────────────────────── */}
        {unlockedBadgeIds.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-100">
            <p className="text-gray-900 font-bold text-sm mb-3">Badges Earned</p>
            <div className="flex flex-wrap gap-2">
              {BADGES.filter(b => unlockedBadgeIds.includes(b.id)).map(badge => (
                <div key={badge.id} className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5">
                  <span className="text-sm">{badge.icon}</span>
                  <span className="text-xs font-bold text-yellow-700">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LOGOUT ─────────────────────────────────────────── */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full bg-white border border-red-200 text-red-500 font-bold rounded-2xl py-4 text-sm hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
        >
          {loggingOut ? 'Signing out...' : '🚪 Sign Out'}
        </button>

      </div>

      {/* ── EDIT PROFILE MODAL ─────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-900 font-black text-lg">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 text-2xl leading-none">×</button>
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
                  className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow"
                >
                  📷
                </button>
              </div>
              <p className="text-gray-400 text-xs">Tap camera to change avatar (max 500KB)</p>
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
              <label className="block text-gray-600 text-sm font-semibold mb-1.5">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 text-sm"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-gray-600 text-sm font-semibold mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                  placeholder="your_username"
                  className="w-full pl-7 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 text-sm"
                />
              </div>
            </div>

            {editError && <p className="text-red-500 text-sm text-center">{editError}</p>}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── BOTTOM NAVIGATION ──────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-20">
        <div className="flex items-end justify-around px-2 pt-2 pb-3">
          {navItems.map((item) => {
            if (item.page === null) {
              return (
                <div key="scan" className="flex flex-col items-center -mt-6">
                  <button
                    onClick={() => onNavigate(Page.SCAN)}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 flex items-center justify-center shadow-lg shadow-green-200 transition-all"
                  >
                    <ScanCameraIcon />
                  </button>
                  <span className="text-green-600 text-xs font-bold mt-1.5">Scan</span>
                </div>
              );
            }
            const isActive = currentPage === item.page;
            return (
              <button key={item.page} onClick={() => item.page && onNavigate(item.page)}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all">
                {item.icon(isActive)}
                <span className={`text-xs font-semibold transition-colors ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;