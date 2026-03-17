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
  IconFlame, IconTarget, IconTrophy, IconAlert, IconRefresh
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
      const isAccuracyChallenge = mission.id === 'accuracy_challenge';
      const currentTarget = (mission.id === 'scan_master' && userStats?.scanMasterGoal) 
        ? userStats.scanMasterGoal 
        : mission.target;

      const liveProgress = userStats ? mission.getProgress(userStats) : (record?.progress ?? 0);
      const liveCompleted = record?.completed ?? (liveProgress >= currentTarget);
      const pct = Math.min((liveProgress / currentTarget) * 100, 100);

      // Accuracy calculation for UI
      const accuracy = isAccuracyChallenge
        ? (userStats?.accuracyChallengeScans > 0 
           ? Math.round((userStats.accuracyChallengeCorrect / userStats.accuracyChallengeScans) * 100)
           : 0)
        : 0;

      let statusLabel = liveCompleted ? 'Completed' : 'In Progress';
      if (isAccuracyChallenge && !liveCompleted && record?.progress === 8) {
        statusLabel = 'Failed (Try Again)';
      }

      return (
        <div key={mission.id} className={`bg-white rounded-[1.25rem] p-4 shadow-sm border transition-colors ${liveCompleted ? 'border-green-200/80 bg-gradient-to-br from-green-50 to-emerald-50/50' : 'border-gray-100'
          }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 flex-1">
              <div className={`w-12 h-12 rounded-[0.875rem] flex items-center justify-center shrink-0 shadow-sm ${liveCompleted ? 'bg-green-100 shadow-green-200/50' : 'bg-orange-50'
                }`}>
                {mission.id === 'daily_streak' ? (
                  <IconFlame size={24} />
                ) : mission.id === 'accuracy_challenge' ? (
                  <IconTarget size={24} />
                ) : (
                  <IconTrophy size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 text-sm tracking-tight">{mission.name}</p>
                <p className="text-gray-400 text-xs font-medium mt-0.5">{mission.description}</p>
                {isAccuracyChallenge && !liveCompleted && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Accuracy: {accuracy}%</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusLabel.includes('Failed') ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'}`}>{statusLabel}</span>
                  </div>
                )}
                {mission.id === 'daily_streak' && !liveCompleted && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Daily Streak: {liveProgress} / 3 days</span>
                  </div>
                )}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className={`font-black text-sm ${liveCompleted ? 'text-green-600' : 'text-orange-500'}`}>+{mission.points}</span>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">pts</p>
            </div>
          </div>
          <div className="mt-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {isAccuracyChallenge ? 'Scan Progress' : 'Progress'}
              </span>
              <span className={`text-[10px] font-black ${liveCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                {isAccuracyChallenge ? `Scans: ${liveProgress} / ${currentTarget}` : `${Math.min(liveProgress, currentTarget)} / ${currentTarget}`}
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${liveCompleted
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
            <div key={badge.id} className={`rounded-[1.25rem] p-4 flex flex-col items-center gap-2 border text-center transition-all ${isUnlocked
              ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/70 shadow-sm shadow-amber-100/50'
              : 'bg-gray-50 border-gray-100 opacity-50'
              }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-inner ${isUnlocked ? 'bg-amber-100' : 'bg-gray-200'
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
  const [fetchLimit, setFetchLimit] = useState(10);
  const [fetchError, setFetchError] = useState(false);

  const fetchLeaderboard = useCallback(async (limit: number) => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await getLeaderboard(limit);
      setEntries(data as LeaderboardEntry[]);
    } catch (e) {
      console.error('Leaderboard fetch error:', e);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(fetchLimit);
  }, [fetchLimit, fetchLeaderboard]);

  const userRank = entries.findIndex(e => e.userId === userId) + 1;
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Check if we should show "Show More"
  // If we fetched X and got X, there might be more... but we cap at 50 for performance
  const canShowMore = entries.length >= fetchLimit && fetchLimit < 50;

  return (
    <div className="relative pb-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-900 font-bold text-lg tracking-tight">Global Rankings</p>
        <button
          onClick={() => fetchLeaderboard(fetchLimit)}
          disabled={loading}
          className="w-9 h-9 rounded-full bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition-all disabled:opacity-40 border border-green-100"
          aria-label="Refresh leaderboard"
        >
          <IconRefresh size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && entries.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-[1.25rem] animate-pulse" />)}
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <span className="text-3xl">⚠️</span>
          <p className="text-gray-600 font-bold text-sm">Failed to load leaderboard</p>
          <button
            onClick={() => fetchLeaderboard(fetchLimit)}
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md"
          >
            Retry
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <span className="text-5xl">🌿</span>
          <p className="text-gray-600 font-bold text-sm text-center">No active players yet.<br /><span className="text-gray-400 font-normal text-xs">Be the first to scan and lead the board!</span></p>
        </div>
      ) : (
        <>
          {/* PODIUM — Top 3 */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-2 mb-8 mt-2 px-1">
              {/* 2nd place */}
              {top3[1] && (() => {
                const e = top3[1];
                const av = e.avatarUrl || getDefaultAvatar(e.username || e.displayName || 'E');
                const isCurrent = e.userId === userId;
                return (
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="relative mb-1">
                      <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-tr from-gray-300 to-gray-100">
                        <img src={av} className="w-full h-full rounded-full object-cover border-2 border-white shadow" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-base bg-white rounded-full shadow-sm w-6 h-6 flex items-center justify-center border border-gray-50">🥈</span>
                    </div>
                    <p className={`text-[10px] font-black truncate max-w-[70px] text-center ${isCurrent ? 'text-indigo-600' : 'text-gray-700'}`}>{e.username ? `@${e.username}` : e.displayName}</p>
                    <div className="w-full bg-slate-200/80 rounded-t-[1.25rem] h-16 flex items-center justify-center border-t border-x border-slate-300/30">
                      <span className="text-slate-600 font-black text-lg">{e.ecoPoints}</span>
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
                    <div className="relative mb-1">
                      <div className="w-20 h-20 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-amber-200/50 shadow-lg">
                        <img src={av} className="w-full h-full rounded-full object-cover border-2 border-white" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-2xl bg-white rounded-full shadow-md w-9 h-9 flex items-center justify-center border border-amber-50">🥇</span>
                    </div>
                    <p className={`text-xs font-black truncate max-w-[100px] text-center mb-0.5 ${isCurrent ? 'text-indigo-600' : 'text-gray-900'}`}>{e.username ? `@${e.username}` : e.displayName}</p>
                    <div className="w-full bg-gradient-to-b from-amber-400 to-amber-500 rounded-t-[1.5rem] h-24 flex items-center justify-center shadow-md border-t border-x border-white/20">
                      <span className="text-white font-black text-2xl drop-shadow-sm">{e.ecoPoints}</span>
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
                    <div className="relative mb-1">
                      <div className="w-12 h-12 rounded-full p-1 bg-gradient-to-tr from-orange-300 to-orange-100">
                        <img src={av} className="w-full h-full rounded-full object-cover border-2 border-white shadow" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full shadow-sm w-5 h-5 flex items-center justify-center border border-orange-50">🥉</span>
                    </div>
                    <p className={`text-[10px] font-black truncate max-w-[70px] text-center ${isCurrent ? 'text-indigo-600' : 'text-gray-700'}`}>{e.username ? `@${e.username}` : e.displayName}</p>
                    <div className="w-full bg-orange-100/60 rounded-t-[1.25rem] h-12 flex items-center justify-center border-t border-x border-orange-200/30">
                      <span className="text-orange-700 font-black text-sm">{e.ecoPoints}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Remaining players */}
          <div className="space-y-2.5 pb-4">
            {rest.map((entry, idx) => {
              const isCurrentUser = entry.userId === userId;
              const usernameLabel = entry.username ? `@${entry.username}` : entry.displayName || 'User';
              const avatar = entry.avatarUrl || getDefaultAvatar(entry.username || entry.displayName || 'E');
              const realRank = idx + 4;

              return (
                <div key={entry.userId} className={`rounded-[1.25rem] px-4 py-3 flex items-center gap-3.5 border transition-all ${isCurrentUser
                  ? 'bg-indigo-50 border-indigo-200/60 shadow-md scale-[1.02]'
                  : 'bg-white border-gray-100'
                  }`}>
                  <div className="w-8 text-center shrink-0">
                    <span className={`font-black text-sm ${isCurrentUser ? 'text-indigo-600' : 'text-gray-400'}`}>#{realRank}</span>
                  </div>
                  <div className="relative shrink-0">
                    <img src={avatar} alt={usernameLabel} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm" />
                    {isCurrentUser && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm truncate tracking-tight ${isCurrentUser ? 'text-indigo-700' : 'text-gray-900'}`}>
                      {usernameLabel}{isCurrentUser ? ' (You)' : ''}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase tracking-wide">Lv. {entry.level}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-black text-gray-900 text-base leading-none tracking-tight">{entry.ecoPoints}</p>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">EcoPts</p>
                  </div>
                </div>
              );
            })}
          </div>

          {canShowMore && (
            <button
              onClick={() => setFetchLimit(prev => Math.min(prev + 10, 50))}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[1.5rem] text-gray-400 font-black text-xs uppercase tracking-widest hover:border-green-300 hover:text-green-500 transition-all flex items-center justify-center gap-2 group mb-10"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={3}>
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Show More Rankings
            </button>
          )}

          {/* Sticky My Rank Footer */}
          {userRank > 0 && (
            <div className="fixed bottom-24 left-5 right-5 z-20 pointer-events-none">
              <div className="bg-indigo-600 rounded-2xl p-4 shadow-xl shadow-indigo-200/50 flex items-center justify-between border-t border-indigo-400/30 transform transition-all animate-in slide-in-from-bottom-4 pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/50 flex items-center justify-center border border-white/20">
                    <span className="text-white font-black text-sm">#{userRank}</span>
                  </div>
                  <div>
                    <p className="text-white font-black text-sm tracking-tight leading-none">Your Rank</p>
                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider mt-1">Live Global Status (PH 🇵🇭)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-lg leading-none">{entries.find(e => e.userId === userId)?.ecoPoints ?? 0}</p>
                  <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider mt-1">Pts</p>
                </div>
              </div>
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
    { id: 'missions', label: 'Missions', emoji: '🏆' },
    { id: 'badges', label: 'Badges', emoji: '🎖️' },
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
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                ? 'bg-green-500 text-white shadow-sm shadow-green-200/50'
                : 'text-gray-500 hover:text-gray-800'
                }`}>
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-2">
        {activeTab === 'missions' && <MissionsTab userMissions={userMissions} userStats={userStats} />}
        {activeTab === 'badges' && <BadgesTab unlockedBadgeIds={unlockedBadgeIds} userStats={userStats} />}
        {activeTab === 'leaderboard' && user && <LeaderboardTab userId={user.uid} />}
      </div>
    </div>
  );
};

export default MissionsPage;