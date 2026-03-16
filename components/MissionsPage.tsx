import React, { useState, useEffect, useCallback } from 'react';
import { Page } from '../types';
import { useAuth } from '../hooks/useAuth';
import { BADGES, MISSIONS } from '../services/gamificationService';
import { getLeaderboard, getUserMissions } from '../services/firestoreService';
import { getDefaultAvatar } from './LoginPage';
import { useToast, ToastContainer } from './Toast';
import {
  IconHome, IconMissions, IconLeaderboard, IconProfile, IconScanNav,
  IconEcoPoints, IconBadge, IconRecycling, IconStreak,
} from './Icons';

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

// ─── MISSIONS TAB ─────────────────────────────────────────────

const MissionsTab: React.FC<{ userMissions: MissionRecord[]; userStats: any }> = ({ userMissions, userStats }) => (
  <div className="space-y-3 pb-2">
    <div className="flex items-center justify-between mb-2">
      <p className="text-gray-900 font-bold text-lg tracking-tight">Active Missions</p>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {MISSIONS.filter(m => userStats && m.getProgress(userStats) >= m.target).length}/{MISSIONS.length} Done
      </span>
    </div>
    {MISSIONS.map(mission => {
      const record = userMissions.find(m => m.id === mission.id);
      const liveProgress = userStats ? mission.getProgress(userStats) : (record?.progress ?? 0);
      const liveCompleted = liveProgress >= mission.target;
      const pct = Math.min((liveProgress / mission.target) * 100, 100);

      return (
        <div key={mission.id} className={`bg-white rounded-[1.25rem] p-4 shadow-sm border transition-colors ${
          liveCompleted ? 'border-green-200/80 bg-gradient-to-br from-green-50 to-emerald-50/50' : 'border-gray-100'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 flex-1">
              <div className={`w-12 h-12 rounded-[0.875rem] flex items-center justify-center text-2xl shrink-0 shadow-sm ${
                liveCompleted ? 'bg-green-100 shadow-green-200/50' : 'bg-orange-50'
              }`}>
                {liveCompleted ? '✅' : mission.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 text-sm tracking-tight">{mission.name}</p>
                <p className="text-gray-400 text-xs font-medium mt-0.5">{mission.description}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className={`font-black text-sm ${liveCompleted ? 'text-green-600' : 'text-orange-500'}`}>+{mission.points}</span>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">pts</p>
            </div>
          </div>
          <div className="mt-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Progress</span>
              <span className={`text-[10px] font-black ${liveCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                {Math.min(liveProgress, mission.target)} / {mission.target}
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  liveCompleted
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : 'bg-gradient-to-r from-orange-300 to-orange-400'
                }`}
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
  const effectiveUnlocked = BADGES
    .filter(b => unlockedBadgeIds.includes(b.id) || (userStats && b.check(userStats)))
    .map(b => b.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-900 font-bold text-lg tracking-tight">My Badges</p>
        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
          {effectiveUnlocked.length}/{BADGES.length} Unlocked
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map(badge => {
          const isUnlocked = effectiveUnlocked.includes(badge.id);
          return (
            <div key={badge.id} className={`rounded-[1.25rem] p-4 flex flex-col items-center gap-2 border text-center transition-all ${
              isUnlocked
                ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/70 shadow-sm shadow-amber-100/50'
                : 'bg-gray-50 border-gray-100 opacity-50'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-inner ${
                isUnlocked ? 'bg-amber-100' : 'bg-gray-200'
              }`}>
                {isUnlocked ? badge.icon : '🔒'}
              </div>
              <p className={`font-black text-sm tracking-tight mt-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-400'}`}>{badge.name}</p>
              <p className={`text-[11px] leading-tight font-medium ${isUnlocked ? 'text-gray-500' : 'text-gray-400'}`}>{badge.description}</p>
              {isUnlocked && <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Unlocked ✓</span>}
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
  const [fetchError, setFetchError] = useState(false);

  // Re-fetch leaderboard whenever this tab becomes visible
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await getLeaderboard(10);
      setEntries(data as LeaderboardEntry[]);
    } catch (e) {
      console.error('Leaderboard fetch error:', e);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const rankEmojis = ['🥇', '🥈', '🥉'];
  const userRank = entries.findIndex(e => e.userId === userId) + 1;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-900 font-bold text-lg tracking-tight">Leaderboard</p>
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="w-9 h-9 rounded-full bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition-all disabled:opacity-40 border border-green-100"
          aria-label="Refresh leaderboard"
        >
          <svg viewBox="0 0 24 24" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {userRank > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-[1.25rem] px-4 py-3 mb-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-black text-sm">#{userRank}</span>
            </div>
            <span className="text-gray-700 text-sm font-bold">Your Current Rank</span>
          </div>
          <span className="text-gray-400 text-xs font-semibold">Keep scanning! 🚀</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-[1.25rem] animate-pulse" />)}
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <span className="text-3xl">⚠️</span>
          <p className="text-gray-600 font-bold text-sm">Failed to load leaderboard</p>
          <p className="text-gray-400 text-xs text-center">Check your connection and try again.</p>
          <button
            onClick={fetchLeaderboard}
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-all shadow-md"
          >
            Retry
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <span className="text-5xl">🌿</span>
          <p className="text-gray-600 font-bold text-sm">No players yet</p>
          <p className="text-gray-400 text-xs">Be the first to scan!</p>
        </div>
      ) : (
        <>
          {/* PODIUM — Top 3 */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-2 mb-6 px-2">
              {/* 2nd place */}
              {top3[1] && (() => {
                const e = top3[1];
                const av = e.avatarUrl || getDefaultAvatar(e.username || e.displayName || 'E');
                const isCurrent = e.userId === userId;
                return (
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="relative">
                      <img src={av} className="w-12 h-12 rounded-full border-4 border-gray-200 object-cover shadow" />
                      <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full shadow border border-white">🥈</span>
                    </div>
                    <p className={`text-[10px] font-black truncate max-w-[70px] text-center ${isCurrent ? 'text-indigo-600' : 'text-gray-700'}`}>{e.username ? `@${e.username}` : e.displayName}</p>
                    <div className="w-full bg-gray-300 rounded-t-xl h-14 flex items-center justify-center">
                      <span className="text-white font-black text-lg">{e.ecoPoints}</span>
                    </div>
                  </div>
                );
              })()}
              {/* 1st place */}
              {top3[0] && (() => {
                const e = top3[0];
                const av = e.avatarUrl || getDefaultAvatar(e.username || e.displayName || 'E');
                const isCurrent = e.userId === userId;
                return (
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="relative">
                      <img src={av} className="w-16 h-16 rounded-full border-4 border-amber-300 object-cover shadow-lg" />
                      <span className="absolute -bottom-1 -right-1 text-xl bg-white rounded-full shadow border border-white">🥇</span>
                    </div>
                    <p className={`text-xs font-black truncate max-w-[80px] text-center ${isCurrent ? 'text-indigo-600' : 'text-gray-900'}`}>{e.username ? `@${e.username}` : e.displayName}</p>
                    <div className="w-full bg-gradient-to-b from-amber-400 to-amber-500 rounded-t-xl h-20 flex items-center justify-center shadow-md shadow-amber-200">
                      <span className="text-white font-black text-xl">{e.ecoPoints}</span>
                    </div>
                  </div>
                );
              })()}
              {/* 3rd place */}
              {top3[2] && (() => {
                const e = top3[2];
                const av = e.avatarUrl || getDefaultAvatar(e.username || e.displayName || 'E');
                const isCurrent = e.userId === userId;
                return (
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="relative">
                      <img src={av} className="w-10 h-10 rounded-full border-4 border-orange-200 object-cover shadow" />
                      <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full shadow border border-white">🥉</span>
                    </div>
                    <p className={`text-[10px] font-black truncate max-w-[70px] text-center ${isCurrent ? 'text-indigo-600' : 'text-gray-700'}`}>{e.username ? `@${e.username}` : e.displayName}</p>
                    <div className="w-full bg-orange-300 rounded-t-xl h-10 flex items-center justify-center">
                      <span className="text-white font-black text-sm">{e.ecoPoints}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Remaining players */}
          {rest.length > 0 && (
            <div className="space-y-2.5">
              {rest.map((entry, idx) => {
                const isCurrentUser = entry.userId === userId;
                const usernameLabel = entry.username ? `@${entry.username}` : entry.displayName || 'User';
                const avatar = entry.avatarUrl || getDefaultAvatar(entry.username || entry.displayName || 'E');
                const realRank = idx + 4;
                return (
                  <div key={entry.userId} className={`rounded-[1.25rem] px-4 py-3 flex items-center gap-3.5 border transition-colors ${
                    isCurrentUser
                      ? 'bg-indigo-50 border-indigo-100 shadow-sm'
                      : 'bg-white border-gray-100'
                  }`}>
                    <div className="w-8 text-center shrink-0">
                      <span className={`font-black text-sm ${isCurrentUser ? 'text-indigo-500' : 'text-gray-400'}`}>#{realRank}</span>
                    </div>
                    <img src={avatar} alt={usernameLabel} className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className={`font-black text-sm truncate tracking-tight ${isCurrentUser ? 'text-indigo-700' : 'text-gray-900'}`}>
                        {usernameLabel}{isCurrentUser ? ' (You)' : ''}
                      </p>
                      <p className="text-gray-400 text-[11px] font-semibold">Lv. {entry.level}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-black text-gray-900 text-base leading-none">{entry.ecoPoints}</p>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────

const MissionsPage: React.FC<MissionsPageProps> = ({ onNavigate, currentPage, defaultTab }) => {
  const { user, userStats, unlockedBadgeIds } = useAuth();
  const { toasts, showToast, dismissToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab ?? 'missions');
  const [userMissions, setUserMissions] = useState<MissionRecord[]>([]);

  // Because this component is persistent in DOM during transitions (re-used for two routes),
  // we must update "activeTab" if the parent explicitly passes a new "defaultTab".
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Re-fetch missions from Firestore whenever userStats changes
  // (covers both new scans and deletions)
  useEffect(() => {
    if (!user) return;
    getUserMissions(user.uid)
      .then(setUserMissions)
      .catch(() => showToast('Failed to load missions. Please try again.', 'error'));
  }, [user, userStats]);

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'missions',    label: 'Missions',    emoji: '🏆' },
    { id: 'badges',      label: 'Badges',      emoji: '🎖️' },
    { id: 'leaderboard', label: 'Leaderboard', emoji: '🏅' },
  ];



  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="bg-green-500 rounded-b-[2rem] px-6 pt-12 pb-6 shadow-sm relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-white font-black text-2xl tracking-tight">EcoMissions 🏆</h1>
          <p className="text-green-100 text-sm font-medium mt-1">Complete challenges, earn EcoPoints</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="px-5 pt-4 mb-2">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white shadow-sm shadow-green-200/50'
                  : 'text-gray-500 hover:text-gray-800'
              }`}>
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-2">
        {activeTab === 'missions'    && <MissionsTab userMissions={userMissions} userStats={userStats} />}
        {activeTab === 'badges'      && <BadgesTab unlockedBadgeIds={unlockedBadgeIds} userStats={userStats} />}
        {activeTab === 'leaderboard' && user && <LeaderboardTab userId={user.uid} />}
      </div>
    </div>
  );
};

export default MissionsPage;