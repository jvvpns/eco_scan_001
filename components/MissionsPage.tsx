import React, { useState, useEffect, useCallback } from 'react';
import { Page } from '../types';
import { useAuth } from '../hooks/useAuth';
import { BADGES, MISSIONS } from '../services/gamificationService';
import { getLeaderboard, getUserMissions } from '../services/firestoreService';
import { getDefaultAvatar } from './LoginPage';

// ─── TYPES ────────────────────────────────────────────────────

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  ecoPoints: number;
  level: number;
  correctScans: number;
  totalScans: number;
}

interface MissionRecord {
  id: string;
  progress: number;
  completed: boolean;
}

interface MissionsPageProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
  defaultTab?: Tab;
}

type Tab = 'missions' | 'badges' | 'leaderboard';

// ─── BOTTOM NAV ICONS ─────────────────────────────────────────

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const MissionsNavIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);
const LeaderboardNavIcon = ({ active }: { active: boolean }) => (
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

// ─── MISSIONS TAB ─────────────────────────────────────────────

const MissionsTab: React.FC<{ userMissions: MissionRecord[]; userStats: any }> = ({ userMissions, userStats }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xl">🏆</span>
      <h2 className="text-gray-900 font-black text-lg">EcoMissions</h2>
    </div>
    {MISSIONS.map(mission => {
      const record = userMissions.find(m => m.id === mission.id);

      // Always derive progress + completed live from userStats so deletes
      // are immediately reflected without a separate Firestore re-fetch
      const liveProgress = userStats ? mission.getProgress(userStats) : (record?.progress ?? 0);
      const liveCompleted = liveProgress >= mission.target;
      const pct = Math.min((liveProgress / mission.target) * 100, 100);

      return (
        <div key={mission.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${liveCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${liveCompleted ? 'bg-green-100' : 'bg-orange-50'}`}>
                {liveCompleted ? '✅' : mission.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{mission.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{mission.description}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-green-600 font-black text-sm">+{mission.points}</span>
              <p className="text-gray-400 text-xs">points</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-semibold text-gray-600">
                {Math.min(liveProgress, mission.target)} / {mission.target}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${liveCompleted ? 'bg-green-500' : 'bg-orange-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// ─── BADGES TAB ───────────────────────────────────────────────

const BadgesTab: React.FC<{ unlockedBadgeIds: string[]; userStats: any }> = ({ unlockedBadgeIds, userStats }) => {
  // Re-evaluate each badge live against current userStats so deletes that
  // drop stats below a badge threshold reflect immediately
  const effectiveUnlocked = BADGES
    .filter(b => unlockedBadgeIds.includes(b.id) || (userStats && b.check(userStats)))
    .map(b => b.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎖️</span>
          <h2 className="text-gray-900 font-black text-lg">Badges</h2>
        </div>
        <span className="text-gray-500 text-sm font-semibold">
          {effectiveUnlocked.length} / {BADGES.length} Unlocked
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map(badge => {
          const isUnlocked = effectiveUnlocked.includes(badge.id);
          return (
            <div key={badge.id} className={`rounded-2xl p-4 flex flex-col items-center gap-2 border text-center ${isUnlocked ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${isUnlocked ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                {isUnlocked ? badge.icon : '🔒'}
              </div>
              <p className={`font-bold text-sm ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>{badge.name}</p>
              <p className={`text-xs leading-tight ${isUnlocked ? 'text-gray-500' : 'text-gray-400'}`}>{badge.description}</p>
              {isUnlocked && <span className="text-xs text-yellow-600 font-bold bg-yellow-100 px-2 py-0.5 rounded-full">Unlocked ✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── LEADERBOARD TAB ──────────────────────────────────────────

const LeaderboardTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-fetch leaderboard whenever this tab becomes visible
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(10);
      setEntries(data as LeaderboardEntry[]);
    } catch (e) {
      console.error('Leaderboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const rankEmojis = ['🥇', '🥈', '🥉'];
  const userRank = entries.findIndex(e => e.userId === userId) + 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏅</span>
          <div>
            <h2 className="text-gray-900 font-black text-lg">Leaderboard</h2>
            <p className="text-gray-400 text-xs">Top Eco Champions</p>
          </div>
        </div>
        {/* Manual refresh button */}
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition-all disabled:opacity-40"
          aria-label="Refresh leaderboard"
        >
          <svg viewBox="0 0 24 24" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {userRank > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-purple-500 font-black text-lg">#{userRank}</span>
            <span className="text-gray-600 text-sm font-semibold">Your Rank</span>
          </div>
          <span className="text-gray-500 text-xs">Keep scanning to climb!</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12">
          <span className="text-4xl">🌿</span>
          <p className="text-gray-500 text-sm font-semibold">No players yet — be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const isCurrentUser = entry.userId === userId;
            const usernameLabel = entry.username ? `@${entry.username}` : entry.displayName || 'User';
            const avatarSeed = entry.username || entry.displayName || 'E';
            const avatar = entry.avatarUrl || getDefaultAvatar(avatarSeed);

            return (
              <div key={entry.userId} className={`rounded-2xl px-4 py-3 flex items-center gap-3 border ${isCurrentUser ? 'bg-purple-50 border-purple-200 shadow-sm' : index < 3 ? 'bg-amber-50 border-amber-100' : 'bg-white border-gray-100'}`}>
                <div className="w-8 text-center shrink-0">
                  {index < 3
                    ? <span className="text-xl">{rankEmojis[index]}</span>
                    : <span className="text-gray-500 font-black text-sm">#{index + 1}</span>
                  }
                </div>
                <img src={avatar} alt={usernameLabel} className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${isCurrentUser ? 'text-purple-700' : 'text-gray-800'}`}>
                    {usernameLabel}{isCurrentUser ? ' (You)' : ''}
                  </p>
                  <p className="text-gray-400 text-xs">Level {entry.level}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-black text-gray-800 text-sm">{entry.ecoPoints}</p>
                  <p className="text-gray-400 text-xs">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────

const MissionsPage: React.FC<MissionsPageProps> = ({ onNavigate, currentPage, defaultTab }) => {
  const { user, userStats, unlockedBadgeIds } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab ?? 'missions');
  const [userMissions, setUserMissions] = useState<MissionRecord[]>([]);

  // Re-fetch missions from Firestore whenever userStats changes
  // (covers both new scans and deletions)
  useEffect(() => {
    if (!user) return;
    getUserMissions(user.uid).then(setUserMissions).catch(console.error);
  }, [user, userStats]);

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'missions',    label: 'Missions',    emoji: '🏆' },
    { id: 'badges',      label: 'Badges',      emoji: '🎖️' },
    { id: 'leaderboard', label: 'Leaderboard', emoji: '🏅' },
  ];

  const navItems = [
    { page: Page.DASHBOARD, label: 'Home',     icon: (a: boolean) => <HomeIcon active={a} /> },
    { page: Page.TIER,      label: 'Missions', icon: (a: boolean) => <MissionsNavIcon active={a} /> },
    { page: null,           label: 'Scan',     icon: () => null },
    { page: Page.PROFILE,   label: 'Leaders',  icon: (a: boolean) => <LeaderboardNavIcon active={a} /> },
    { page: Page.SETTINGS,  label: 'Profile',  icon: (a: boolean) => <ProfileNavIcon active={a} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f0fdf4] font-sans">

      <div className="px-5 pt-6 pb-3 bg-[#f0fdf4]">
        <h1 className="text-gray-900 font-black text-xl tracking-tight">EcoMissions</h1>
        <p className="text-gray-500 text-xs font-medium mt-0.5">Complete challenges to earn EcoPoints</p>
      </div>

      <div className="px-5 mb-3">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <span className="hidden sm:inline">{tab.emoji} </span>{tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {activeTab === 'missions'    && <MissionsTab userMissions={userMissions} userStats={userStats} />}
        {activeTab === 'badges'      && <BadgesTab unlockedBadgeIds={unlockedBadgeIds} userStats={userStats} />}
        {activeTab === 'leaderboard' && user && <LeaderboardTab userId={user.uid} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-20">
        <div className="flex items-end justify-around px-2 pt-2 pb-3">
          {navItems.map((item) => {
            if (item.page === null) {
              return (
                <div key="scan" className="flex flex-col items-center -mt-6">
                  <button onClick={() => onNavigate(Page.SCAN)}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 flex items-center justify-center shadow-lg shadow-green-200 transition-all">
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
                <span className={`text-xs font-semibold transition-colors ${isActive ? 'text-green-600' : 'text-gray-400'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MissionsPage;