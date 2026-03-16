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

  const navItems = [
    { page: Page.DASHBOARD, label: 'Home',     icon: (a: boolean) => <IconHome        size={24} color={a ? '#16a34a' : '#9ca3af'} /> },
    { page: Page.TIER,      label: 'Missions', icon: (a: boolean) => <IconMissions    size={24} color={a ? '#16a34a' : '#9ca3af'} /> },
    { page: null,           label: 'Scan',     icon: () => null },
    { page: Page.PROFILE,   label: 'Leaders',  icon: (a: boolean) => <IconLeaderboard size={24} color={a ? '#16a34a' : '#9ca3af'} /> },
    { page: Page.SETTINGS,  label: 'Profile',  icon: (a: boolean) => <IconProfile     size={24} color={a ? '#16a34a' : '#9ca3af'} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f0fdf4] font-sans">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-black text-xl tracking-tight">Profile</h1>
          <p className="text-gray-500 text-xs font-medium mt-0.5">Your EcoScan journey</p>
        </div>
        <button
          onClick={() => onNavigate(Page.APP_SETTINGS)}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 active:scale-95 transition-all"
        >
          <IconSettings size={22} color="currentColor" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 space-y-4">

        {/* ── SKELETON WHILE LOADING ─────────────────────────── */}
        {loading ? (
          <>
            {/* Profile card skeleton */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-[72px] h-[72px] rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="mt-4 h-10 bg-gray-100 rounded-xl" />
            </div>
            {/* EcoPoints banner skeleton */}
            <div className="bg-gray-200 rounded-2xl h-24 animate-pulse" />
            {/* Stats skeleton */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-50">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/6" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
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
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <IconEcoPoints size={10} color="#15803d" /> Level {userStats?.level ?? 1}
                </span>
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <IconStreak size={10} color="#ea580c" /> {userStats?.streak ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={openEditModal}
            className="mt-4 w-full bg-green-50 border border-green-200 text-green-700 font-bold text-sm rounded-xl py-2.5 active:scale-95 transition hover:bg-green-100 flex items-center justify-center gap-2"
          >
            <IconEditProfile size={16} color="#15803d" /> Edit Profile
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
          <IconOrganic size={52} color="rgba(255,255,255,0.8)" />
        </div>

        {/* ── SCAN STATS ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-900 font-bold text-sm mb-1">Scan Statistics</p>
          <StatRow label="Total Scans"     value={userStats?.totalScans ?? 0}                       icon={<IconScan      size={16} color="#3b82f6" />} />
          <StatRow label="Correct Answers" value={userStats?.correctScans ?? 0}                     icon={<IconRecycling size={16} color="#16a34a" />} />
          <StatRow label="Accuracy"        value={`${accuracy}%`}                                  icon={<IconEcoPoints size={16} color="#6366f1" />} />
          <StatRow label="Badges Earned"   value={`${unlockedBadgeIds.length} / ${BADGES.length}`} icon={<IconBadge     size={16} color="#d97706" />} />
        </div>

        {/* ── ENVIRONMENTAL IMPACT ───────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="text-gray-900 font-bold text-sm mb-1">Environmental Impact</p>
          <StatRow label="Items Classified" value={`${userStats?.itemsClassified ?? 0} items`} icon={<IconScan     size={16} color="#3b82f6" />} />
          <StatRow label="CO₂ Saved"        value={`${userStats?.co2Saved ?? 0} kg`}          icon={<IconOrganic  size={16} color="#16a34a" />} />
          <StatRow label="Waste Diverted"   value={`${userStats?.wasteDiverted ?? 0} kg`}      icon={<IconRecycling size={16} color="#06b6d4" />} />
          <StatRow label="Trees Saved"      value={`${userStats?.treesSaved ?? 0}`}            icon={<IconOrganic  size={16} color="#15803d" />} />
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
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>

          </> )} {/* end loading ternary */}
      </div>

      {/* ── EDIT PROFILE MODAL ─────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-900 font-black text-lg">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 p-1 hover:text-gray-600 transition">
                <IconClose size={22} color="currentColor" />
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
                    <IconScanNav size={28} color="white" />
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