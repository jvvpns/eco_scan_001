import React, { useState, useEffect, useCallback } from 'react';
import { ScanRecord, Page } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getRecentScans } from '../services/firestoreService';

// ─── PROPS ────────────────────────────────────────────────────

interface DashboardPageProps {
  onScanClick: () => void;
  onNavigate: (page: Page) => void;
  currentPage: Page;
  refreshTrigger?: number; // incremented by App.tsx after each scan to re-fetch
}

// ─── ECO TIPS ─────────────────────────────────────────────────

const MOCK_ECO_TIPS = [
  "Special waste like batteries should never go in regular bins.",
  "Reducing waste is even better than recycling — choose reusable items!",
  "Clean plastic containers before recycling to avoid contamination.",
  "Biodegradable waste can be composted to enrich your garden soil.",
  "One ton of recycled paper saves 17 trees and 7,000 gallons of water.",
];

const getDailyTip = () => MOCK_ECO_TIPS[new Date().getDay() % MOCK_ECO_TIPS.length];

// ─── CATEGORY COLOR MAP ───────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Residual':          'bg-gray-100 text-gray-600',
  'Special':           'bg-red-100 text-red-600',
  'Non-Biodegradable': 'bg-orange-100 text-orange-600',
  'Biodegradable':     'bg-green-100 text-green-600',
};

// ─── ICONS ────────────────────────────────────────────────────

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
const ProfileIcon = ({ active }: { active: boolean }) => (
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
const BellIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// ─── SUB COMPONENTS ───────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: string | number; color: string; emoji: string }> = ({ label, value, color, emoji }) => (
  <div className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 ${color}`}>
    <span className="text-xl">{emoji}</span>
    <span className="text-white font-black text-xl leading-none">{value}</span>
    <span className="text-white/80 text-xs font-medium">{label}</span>
  </div>
);

const ImpactCard: React.FC<{ label: string; value: string | number; unit: string; emoji: string; bg: string }> = ({ label, value, unit, emoji, bg }) => (
  <div className={`flex-1 rounded-2xl p-3 flex flex-col items-center gap-1 ${bg}`}>
    <span className="text-2xl">{emoji}</span>
    <div className="text-center">
      <p className="font-black text-gray-800 text-lg leading-none">{value}</p>
      <p className="text-gray-500 text-xs">{unit}</p>
    </div>
    <p className="text-gray-600 text-xs font-semibold text-center leading-tight">{label}</p>
  </div>
);

const StatSkeleton = () => (
  <div className="flex-1 rounded-2xl p-3 flex flex-col items-center gap-1 bg-gray-200 animate-pulse">
    <div className="w-6 h-6 bg-gray-300 rounded-full" />
    <div className="w-10 h-5 bg-gray-300 rounded" />
    <div className="w-14 h-3 bg-gray-300 rounded" />
  </div>
);

const ScanSkeleton = () => (
  <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm border border-gray-100 animate-pulse">
    <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-2 bg-gray-200 rounded w-1/2" />
    </div>
    <div className="w-10 h-6 bg-gray-200 rounded" />
  </div>
);

// ─── TIMESTAMP FORMATTER ──────────────────────────────────────

const formatTimestamp = (ts: any): string => {
  if (!ts) return '';
  try {
    // Firestore Timestamp object
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  } catch { return ''; }
};

// ─── MAIN COMPONENT ───────────────────────────────────────────

const DashboardPage: React.FC<DashboardPageProps> = ({
  onScanClick,
  onNavigate,
  currentPage,
  refreshTrigger = 0,
}) => {
  const [tipDismissed, setTipDismissed] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [scansLoading, setScansLoading] = useState(true);

  const { userStats, loading, user } = useAuth();
  const dailyTip = getDailyTip();

  // ── Fetch recent scans from Firestore ─────────────────────
  const fetchRecentScans = useCallback(async () => {
    if (!user) return;
    setScansLoading(true);
    try {
      const scans = await getRecentScans(user.uid, 5);
      setRecentScans(scans);
    } catch (e) {
      console.error('Failed to fetch recent scans:', e);
    } finally {
      setScansLoading(false);
    }
  }, [user]);

  // Fetch on mount and whenever a new scan completes (refreshTrigger bumped)
  useEffect(() => {
    fetchRecentScans();
  }, [fetchRecentScans, refreshTrigger]);

  const stats = {
    ecoPoints:       userStats?.ecoPoints       ?? 0,
    level:           userStats?.level           ?? 1,
    streak:          userStats?.streak          ?? 0,
    itemsClassified: userStats?.itemsClassified ?? 0,
    co2Saved:        userStats?.co2Saved        ?? 0,
    wasteDiverted:   userStats?.wasteDiverted   ?? 0,
    treesSaved:      userStats?.treesSaved      ?? 0,
  };

  const navItems = [
    { page: Page.DASHBOARD, label: 'Home',     icon: (a: boolean) => <HomeIcon active={a} /> },
    { page: Page.TIER,      label: 'Missions', icon: (a: boolean) => <MissionsIcon active={a} /> },
    { page: null,           label: 'Scan',     icon: () => null },
    { page: Page.PROFILE,   label: 'Leaders',  icon: (a: boolean) => <LeaderboardIcon active={a} /> },
    { page: Page.SETTINGS,  label: 'Profile',  icon: (a: boolean) => <ProfileIcon active={a} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f0fdf4] font-sans">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-3 bg-[#f0fdf4] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-md">
            <span className="text-xl">♻️</span>
          </div>
          <div>
            <h1 className="text-gray-900 font-black text-lg leading-tight tracking-tight">
              EcoScanner
            </h1>
            <p className="text-gray-500 text-xs font-medium">
              {user?.displayName
                ? `Welcome, ${user.displayName.split(' ')[0]}!`
                : 'Learn, Play, and Save the Planet'}
            </p>
          </div>
        </div>
        <button className="relative w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 transition">
          <BellIcon />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>

      {/* ── SCROLLABLE CONTENT ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pb-28 space-y-4">

        {/* GAMIFICATION STATS */}
        <div className="flex gap-3">
          {loading ? (
            <><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
          ) : (
            <>
              <StatCard label="EcoPoints" value={stats.ecoPoints}     color="bg-green-500"  emoji="🌿" />
              <StatCard label="Level"     value={stats.level}         color="bg-blue-500"   emoji="⭐" />
              <StatCard label="Streak"    value={`${stats.streak}🔥`} color="bg-orange-500" emoji=""   />
            </>
          )}
        </div>

        {/* DAILY ECO TIP */}
        {!tipDismissed && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 flex gap-3 items-start">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-lg">💡</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-bold text-sm">Daily Eco Tip</p>
              <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{dailyTip}</p>
            </div>
            <button onClick={() => setTipDismissed(true)} className="text-gray-300 hover:text-gray-500 text-lg leading-none mt-0.5 shrink-0">×</button>
          </div>
        )}

        {/* ENVIRONMENTAL IMPACT */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🌍</span>
            <div>
              <p className="text-gray-900 font-bold text-sm">Your Environmental Impact</p>
              <p className="text-gray-400 text-xs">Making a difference, one scan at a time</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ImpactCard label="Items Classified" value={stats.itemsClassified} unit="items" emoji="🏅" bg="bg-blue-50"    />
            <ImpactCard label="CO₂ Saved"        value={stats.co2Saved}        unit="kg"    emoji="🌱" bg="bg-green-50"   />
            <ImpactCard label="Waste Diverted"   value={stats.wasteDiverted}   unit="kg"    emoji="♻️" bg="bg-purple-50"  />
            <ImpactCard label="Trees Saved"      value={stats.treesSaved}      unit="trees" emoji="🌳" bg="bg-emerald-50" />
          </div>
        </div>

        {/* RECENT SCANS — from Firestore */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-900 font-bold text-sm">Recent Scans</p>
            {recentScans.length > 0 && (
              <button className="text-green-600 text-xs font-semibold">See all</button>
            )}
          </div>

          {scansLoading ? (
            <div className="space-y-2">
              <ScanSkeleton />
              <ScanSkeleton />
            </div>
          ) : recentScans.length > 0 ? (
            <div className="space-y-2">
              {recentScans.map(scan => {
                const categoryColor = CATEGORY_COLORS[scan.aiAnswer] ?? 'bg-gray-100 text-gray-600';
                return (
                  <div key={scan.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm border border-gray-100">
                    {/* Thumbnail or fallback icon */}
                    {scan.imageUrl ? (
                      <img src={scan.imageUrl} alt={scan.itemName} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center shrink-0 text-2xl">♻️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-bold text-sm truncate">{scan.itemName || 'Unknown Item'}</p>
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${categoryColor}`}>
                        {scan.aiAnswer}
                      </span>
                      <p className="text-gray-300 text-xs mt-0.5">{formatTimestamp(scan.timestamp)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-black text-lg ${scan.isCorrect ? 'text-green-600' : 'text-gray-300'}`}>
                        {scan.isCorrect ? `+${scan.pointsEarned}` : '—'}
                      </p>
                      <p className="text-gray-400 text-xs">{scan.isCorrect ? 'pts' : 'missed'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-2 shadow-sm border border-gray-100">
              <span className="text-4xl">🗑️</span>
              <p className="text-gray-700 font-bold text-sm">No scans yet</p>
              <p className="text-gray-400 text-xs text-center">
                Tap the scan button below to classify your first item!
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ── BOTTOM NAVIGATION ──────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-20">
        <div className="flex items-end justify-around px-2 pt-2 pb-3">
          {navItems.map((item) => {
            if (item.page === null) {
              return (
                <div key="scan" className="flex flex-col items-center -mt-6">
                  <button onClick={onScanClick}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 flex items-center justify-center shadow-lg shadow-green-200 transition-all"
                    aria-label="Scan waste">
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

export default DashboardPage;