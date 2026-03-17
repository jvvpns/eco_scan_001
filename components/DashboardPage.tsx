import React, { useState, useEffect, useCallback } from 'react';
import { ScanRecord, Page, Notification } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getRecentScans, deleteScanRecord, deductScanPoints } from '../services/firestoreService';
import { getNotifications, clearAllNotifications, markAsRead, addNotification, checkStreakReminderNeeded } from '../services/notificationService';
import { useToast, ToastContainer } from './Toast';
import {
  IconHome, IconMissions, IconLeaderboard, IconProfile,
  IconScanNav, IconNotifications, IconRecycling, IconOrganic,
  IconEcoPoints, IconStreak, IconScan, IconDeleteScan,
  PilotBrandIcon, IconInfo, IconClose, IconFlame,
  IconTarget, IconTrophy, IconAlert, IconChecklist,
  IconCo2, IconWeight, IconTree, IconSpecialWaste, IconResidual
} from './Icons';

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

// ─── CATEGORY COLOR MAP ───────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Residual':          'bg-gray-100 text-gray-600',
  'Special':           'bg-red-100 text-red-600',
  'Non-Biodegradable': 'bg-orange-100 text-orange-600',
  'Biodegradable':     'bg-green-100 text-green-600',
};


// ─── SUB COMPONENTS ───────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: string | number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 ${color}`}>
    <div className="text-white mb-1">
      {icon}
    </div>
    <span className="text-white font-black text-xl leading-none">{value}</span>
    <span className="text-white/80 text-[10px] uppercase font-black tracking-wider mt-0.5">{label}</span>
  </div>
);

const ImpactCard: React.FC<{ label: string; value: string | number; unit: string; icon: React.ReactNode; bg: string; iconBg: string }> = ({ label, value, unit, icon, bg, iconBg }) => (
  <div className={`flex-1 rounded-[1.25rem] p-4 flex flex-col gap-3 ${bg} border border-white shadow-sm`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} shadow-sm`}>
      {icon}
    </div>
    <div>
      <div className="flex items-baseline gap-1">
        <span className="font-black text-gray-900 text-xl leading-none">{value}</span>
        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{unit}</span>
      </div>
      <p className="text-gray-500 text-[11px] font-bold mt-1 uppercase tracking-tight">{label}</p>
    </div>
  </div>
);

const EnvironmentalImpactSection: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-gray-900 font-bold text-lg tracking-tight">Environmental Impact</p>
      <div className="h-px flex-1 bg-gray-100 ml-4 opacity-50" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <ImpactCard 
        label="Items Sorted" 
        value={stats.itemsClassified} 
        unit="items" 
        icon={<IconChecklist size={20} color="#3b82f6" />} 
        bg="bg-blue-50/30"
        iconBg="bg-blue-100/50"
      />
      <ImpactCard 
        label="CO₂ Saved" 
        value={stats.co2Saved} 
        unit="kg" 
        icon={<IconCo2 size={20} color="#10b981" />} 
        bg="bg-emerald-50/30"
        iconBg="bg-emerald-100/50"
      />
      <ImpactCard 
        label="Waste Diverted" 
        value={stats.wasteDiverted} 
        unit="kg" 
        icon={<IconWeight size={20} color="#06b6d4" />} 
        bg="bg-cyan-50/30"
        iconBg="bg-cyan-100/50"
      />
      <ImpactCard 
        label="Trees Saved" 
        value={stats.treesSaved} 
        unit="trees" 
        icon={<IconTree size={20} color="#15803d" />} 
        bg="bg-green-50/30"
        iconBg="bg-green-100/50"
      />
    </div>
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

// ─── WASTE TYPES DATA ─────────────────────────────────────────

const WASTE_TYPES_DATA = [
  {
    id: 'Biodegradable',
    label: 'Biodegradable',
    bgActive: 'bg-green-500',
    bgIdle: 'bg-green-100',
    textIdle: 'text-green-700',
    borderColor: 'border-green-200',
    description: 'Organic waste that decomposes naturally through microorganisms.',
    examples: ['Food scraps', 'Fruit peels', 'Vegetable waste', 'Leaves & garden waste'],
    tip: 'Can be composted or placed in biodegradable waste bins.',
    icon: (active: boolean) => (
      <IconOrganic size={22} color={active ? 'white' : '#15803d'} />
    ),
  },
  {
    id: 'Non-Biodegradable',
    label: 'Non-Biodegradable',
    bgActive: 'bg-orange-500',
    bgIdle: 'bg-orange-100',
    textIdle: 'text-orange-700',
    borderColor: 'border-orange-200',
    description: 'Materials that do not decompose naturally and persist in the environment.',
    examples: ['Plastic bottles', 'Glass containers', 'Metal cans', 'Styrofoam'],
    tip: 'Separate and recycle when possible.',
    icon: (active: boolean) => (
      <IconRecycling size={22} color={active ? 'white' : '#c2410c'} />
    ),
  },
  {
    id: 'Residual',
    label: 'Residual',
    bgActive: 'bg-gray-600',
    bgIdle: 'bg-gray-100',
    textIdle: 'text-gray-700',
    borderColor: 'border-gray-200',
    description: 'Waste that cannot be recycled or composted — typically goes to landfill.',
    examples: ['Contaminated packaging', 'Used tissues', 'Disposable hygiene products'],
    tip: 'Dispose properly in residual waste bins.',
    icon: (active: boolean) => (
      <IconResidual size={22} color={active ? 'white' : '#374151'} />
    ),
  },
  {
    id: 'Special',
    label: 'Special',
    bgActive: 'bg-red-500',
    bgIdle: 'bg-red-100',
    textIdle: 'text-red-700',
    borderColor: 'border-red-200',
    description: 'Waste requiring special disposal due to environmental or safety risks.',
    examples: ['Batteries', 'Electronics', 'Light bulbs', 'Chemicals'],
    tip: 'Bring to designated special waste collection points.',
    icon: (active: boolean) => (
      <IconSpecialWaste size={22} color={active ? 'white' : '#b91c1c'} />
    ),
  },
];

// ─── WASTE TYPES SECTION (expandable accordion) ───────────────

const WasteTypesSection: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const toggle = (id: string) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedTypes(new Set());
      setIsAllExpanded(false);
    } else {
      setExpandedTypes(new Set(WASTE_TYPES_DATA.map(t => t.id)));
      setIsAllExpanded(true);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-900 font-bold text-lg tracking-tight">Waste Types</p>
        <button 
          onClick={toggleAll}
          className="text-green-600 text-sm font-semibold hover:text-green-700 transition"
        >
          {isAllExpanded ? 'Collapse All' : 'View All'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {WASTE_TYPES_DATA.map(type => {
          const isOpen = expandedTypes.has(type.id);
          return (
            <button
              key={type.id}
              onClick={() => toggle(type.id)}
              className={`text-left rounded-[1.25rem] border transition-all duration-300 active:scale-[0.98] overflow-hidden shadow-sm ${
                isOpen
                  ? `${type.bgActive} border-transparent shadow-lg`
                  : `bg-white ${type.borderColor} hover:shadow-md`
              }`}
              aria-expanded={isOpen}
            >
              {/* ── Always-visible header row ─────────────────── */}
              <div className="flex items-center gap-3 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  isOpen ? 'bg-white/20' : type.bgIdle
                }`}>
                  {type.icon(isOpen)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm leading-tight transition-colors duration-300 ${
                    isOpen ? 'text-white' : type.textIdle
                  }`}>{type.label}</p>
                  {!isOpen && (
                    <p className="text-gray-400 text-[10px] font-medium mt-0.5">Tap to learn more</p>
                  )}
                </div>
                {/* Chevron arrow */}
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={isOpen ? 'rgba(255,255,255,0.75)' : '#9ca3af'}
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {/* ── Expandable detail panel ───────────────────── */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 pb-4 space-y-3">
                  <div className="border-t border-white/20" />

                  {/* Description */}
                  <p className="text-white/90 text-xs font-medium leading-relaxed">
                    {type.description}
                  </p>

                  {/* Examples */}
                  <div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1.5">Examples</p>
                    <div className="flex flex-wrap gap-1.5">
                      {type.examples.map(ex => (
                        <span key={ex} className="bg-white/20 text-white/95 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tip card */}
                  <div className="bg-white/15 rounded-xl p-2.5 flex gap-2 items-start border border-white/20">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className="shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4" />
                      <circle cx="12" cy="16" r="0.75" fill="rgba(255,255,255,0.85)" stroke="none" />
                    </svg>
                    <p className="text-white/90 text-[10px] font-semibold leading-relaxed">{type.tip}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────

const DashboardPage: React.FC<DashboardPageProps> = ({
  onScanClick,
  onNavigate,
  currentPage,
  refreshTrigger = 0,
}) => {
  const [tipDismissed, setTipDismissed] = useState(false);
  const [tipIndex, setTipIndex] = useState(() => new Date().getDay() % MOCK_ECO_TIPS.length);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [scansLoading, setScansLoading] = useState(true);
  const [scansError, setScansError] = useState(false);

  const { userStats, loading, user, refreshStats } = useAuth();
  const { toasts, showToast, dismissToast } = useToast();
  const [showScansOverlay, setShowScansOverlay] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  
  // ── Dynamic Greeting Logic ────────────────────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const greeting = getGreeting();

  // Rotate eco tip every 10 seconds
  useEffect(() => {
    if (tipDismissed) return;
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % MOCK_ECO_TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [tipDismissed]);

  const dailyTip = MOCK_ECO_TIPS[tipIndex];

  // ── Fetch recent scans from Firestore ─────────────────────
  const fetchRecentScans = useCallback(async () => {
    if (!user) return;
    setScansLoading(true);
    setScansError(false);
    try {
      const scans = await getRecentScans(user.uid, 5);
      setRecentScans(scans);
    } catch (e) {
      console.error('Failed to fetch recent scans:', e);
      setScansError(true);
    } finally {
      setScansLoading(false);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getNotifications(user.uid);
      setNotifications(data);
      setHasUnread(data.some(n => !n.read));
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  }, [user]);

  const checkStreakReminder = useCallback(async () => {
    if (!user || !userStats) return;
    try {
      const needed = await checkStreakReminderNeeded(user.uid, userStats.lastScanDate);
      if (needed) {
        await addNotification(user.uid, "Don't forget to scan today to keep your streak alive!", 'streak');
        fetchNotifications();
      }
    } catch (e) {
      console.error('Failed to check streak reminder:', e);
    }
  }, [user, userStats, fetchNotifications]);

  // Fetch on mount and whenever a new scan completes (refreshTrigger bumped)
  useEffect(() => {
    if (user) {
      fetchRecentScans();
      fetchNotifications();
    }
  }, [user, fetchRecentScans, fetchNotifications, refreshTrigger]);

  useEffect(() => {
    if (userStats) {
      checkStreakReminder();
    }
  }, [userStats, checkStreakReminder]);

  // ── Delete scan ───────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteScan = async (scan: ScanRecord) => {
    if (!user || deletingId) return;
    setDeletingId(scan.id);
    // Optimistic removal
    setRecentScans(prev => prev.filter(s => s.id !== scan.id));
    try {
      await deleteScanRecord(scan.id);
      await deductScanPoints(user.uid, scan.pointsEarned, scan.isCorrect);
      await refreshStats();
      showToast('Scan deleted.', 'success');
    } catch (e) {
      console.error('Delete failed:', e);
      showToast('Failed to delete scan. Please try again.', 'error');
      // Rollback on failure
      fetchRecentScans();
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    if (!user) return;
    try {
      await markAsRead(user.uid, notificationId);
      fetchNotifications(); // Re-fetch to update UI
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
      showToast('Failed to mark notification as read.', 'error');
    }
  };

  const handleClearNotifications = async () => {
    if (!user) return;
    try {
      await clearAllNotifications(user.uid);
      fetchNotifications(); // Re-fetch to update UI
      showToast('All notifications cleared.', 'success');
    } catch (e) {
      console.error('Failed to clear notifications:', e);
      showToast('Failed to clear notifications.', 'error');
    }
  };

  const stats = {
    ecoPoints:       userStats?.ecoPoints       ?? 0,
    level:           userStats?.level           ?? 1,
    streak:          userStats?.streak          ?? 0,
    itemsClassified: userStats?.itemsClassified ?? 0,
    co2Saved:        userStats?.co2Saved        ?? 0,
    wasteDiverted:   userStats?.wasteDiverted   ?? 0,
    treesSaved:      userStats?.treesSaved      ?? 0,
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── SPLASH HEADER ─────────────────────────────────────────── */}
      <div className="bg-green-500 rounded-b-[2rem] px-6 pt-12 pb-8 shadow-sm relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-400/20 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium mb-0.5">
              {greeting},
            </p>
            <h1 className="text-white font-black text-2xl tracking-tight">
              {user?.displayName ? user.displayName.split(' ')[0] : 'Eco Warrior'} 👋
            </h1>
          </div>
          <button 
            onClick={() => setShowNotifications(true)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition-all border border-white/20 shadow-sm relative"
          >
            <IconNotifications size={20} color="currentColor" />
            {hasUnread && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </button>
        </div>

      </div>

      {/* ── SCROLLABLE CONTENT ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-48 pb-safe space-y-6">

        {/* WASTE TYPES (CATEGORIES) */}
        <WasteTypesSection onNavigate={onNavigate} />

        {/* GAMIFICATION STATS */}
        <div className="flex gap-3">
          {loading ? (
            <><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
          ) : (
            <>
              <StatCard label="EcoPoints" value={stats.ecoPoints}     color="bg-gradient-to-br from-green-500 to-green-600 shadow-md shadow-green-200/50"  icon={<IconEcoPoints size={20} color="white" />} />
              <StatCard label="Level"     value={stats.level}         color="bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-200/50"   icon={<IconLeaderboard size={20} color="white" />} />
              <StatCard label="Streak"    value={`${stats.streak}/3`} color="bg-gradient-to-br from-orange-400 to-orange-500 shadow-md shadow-orange-200/50" icon={<IconStreak size={20} color="white" />}   />
            </>
          )}
        </div>

        {/* ENVIRONMENTAL IMPACT SECTION */}
        <EnvironmentalImpactSection stats={stats} />

        {/* DAILY ECO TIP */}
        {!tipDismissed && (
          <div className="bg-white rounded-[1.25rem] p-4 shadow-sm shadow-gray-200/50 border border-amber-100 flex gap-4 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-xl">💡</span>
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-gray-900 font-bold text-sm">Daily Eco Tip</p>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed font-medium">{dailyTip}</p>
            </div>
            <button onClick={() => setTipDismissed(true)} className="text-gray-300 hover:text-gray-500 text-lg leading-none mt-1 shrink-0 transition-colors">×</button>
          </div>
        )}

        {/* RECENT SCANS — from Firestore */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-900 font-bold text-lg tracking-tight">Recent Scans</p>
            {recentScans.length > 0 && (
              <button 
                onClick={() => setShowScansOverlay(true)}
                className="text-green-600 text-sm font-semibold hover:text-green-700 transition"
              >
                See all
              </button>
            )}
          </div>

          {scansLoading ? (
            <div className="space-y-3">
              <ScanSkeleton />
              <ScanSkeleton />
            </div>
          ) : scansError ? (
            <div className="bg-white rounded-[1.25rem] p-6 flex flex-col items-center gap-3 shadow-sm border border-red-100">
              <span className="text-3xl">⚠️</span>
              <p className="text-gray-700 font-bold text-sm">Failed to load scans</p>
              <p className="text-gray-400 text-xs text-center">Check your connection and try again.</p>
              <button
                onClick={fetchRecentScans}
                className="mt-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-green-200/50"
              >
                Retry
              </button>
            </div>
          ) : recentScans.length > 0 ? (
            <div className="space-y-3">
              {recentScans.map(scan => {
                const categoryColor = CATEGORY_COLORS[scan.aiAnswer] ?? 'bg-gray-100 text-gray-600';
                const isDeleting = deletingId === scan.id;
                return (
                  <div key={scan.id} className={`bg-white rounded-[1.25rem] p-3 flex items-center gap-3.5 shadow-sm shadow-gray-200/50 border border-gray-100/50 transition-opacity ${isDeleting ? 'opacity-40' : 'opacity-100'}`}>
                    {/* Thumbnail or fallback */}
                    {scan.imageUrl ? (
                      <img src={scan.imageUrl} alt={scan.itemName} className="w-16 h-16 rounded-[1rem] object-cover shrink-0 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-[1rem] bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shrink-0 text-2xl shadow-sm border border-green-200/30">♻️</div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0 py-1">
                      <p className="text-gray-900 font-black text-sm truncate">{scan.itemName || 'Unknown Item'}</p>
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 mb-1 tracking-wide ${categoryColor}`}>
                        {scan.aiAnswer}
                      </span>
                      <p className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {formatTimestamp(scan.timestamp)}
                      </p>
                    </div>

                    {/* Points & Actions */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pr-1">
                      <div className="text-right">
                        <p className={`font-black text-lg leading-none ${scan.isCorrect ? 'text-green-600' : 'text-gray-300'}`}>
                          {scan.isCorrect ? `+${scan.pointsEarned}` : '—'}
                        </p>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{scan.isCorrect ? 'pts' : 'missed'}</p>
                      </div>
                      
                      {/* Delete button (small and subtle) */}
                      <button
                        onClick={() => handleDeleteScan(scan)}
                        disabled={!!deletingId}
                        className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 active:scale-90 transition-all disabled:opacity-30"
                        aria-label="Delete scan"
                      >
                        {isDeleting ? (
                          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[1.25rem] p-8 flex flex-col items-center gap-3 shadow-sm border border-gray-100 border-dashed">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-3xl mb-1">🗑️</div>
              <p className="text-gray-700 font-bold text-sm">No scans yet</p>
              <p className="text-gray-400 text-xs text-center font-medium max-w-[200px]">
                Tap the scan button below to classify your first item!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── RECENT SCANS OVERLAY ────────────────────────────── */}
      {showScansOverlay && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[2.5rem] w-full max-w-lg p-6 pb-12 pb-safe space-y-6 animate-slide-up max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <IconRecycling size={22} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-black text-xl tracking-tight leading-none">Scan History</h3>
                  <p className="text-gray-400 text-xs font-semibold mt-1 uppercase tracking-wider">Your complete records</p>
                </div>
              </div>
              <button 
                onClick={() => setShowScansOverlay(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
              >
                <span className="text-2xl text-gray-400">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
              {recentScans.length > 0 ? (
                recentScans.map(scan => {
                  const categoryColor = CATEGORY_COLORS[scan.aiAnswer] ?? 'bg-gray-100 text-gray-600';
                  return (
                    <div key={scan.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm transition-all hover:border-green-100/60 group">
                      {scan.imageUrl ? (
                        <img src={scan.imageUrl} alt={scan.itemName} className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm border border-gray-50" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-2xl border border-gray-100">♻️</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-black text-sm truncate uppercase tracking-tight">{scan.itemName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide ${categoryColor}`}>
                            {scan.aiAnswer}
                          </span>
                          <p className="text-gray-400 text-[10px] font-bold flex items-center gap-1">
                            {formatTimestamp(scan.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0 pr-1">
                        <div className="text-right">
                          <p className={`font-black text-lg leading-none ${scan.isCorrect ? 'text-green-600' : 'text-gray-300'}`}>
                            {scan.isCorrect ? `+${scan.pointsEarned}` : '—'}
                          </p>
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">{scan.isCorrect ? 'pts' : 'missed'}</p>
                        </div>
                        
                        {/* Delete button (matching recent scans) */}
                        <button
                          onClick={() => handleDeleteScan(scan)}
                          disabled={!!deletingId}
                          className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 active:scale-90 transition-all disabled:opacity-30"
                          aria-label="Delete scan history item"
                        >
                          {deletingId === scan.id ? (
                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                          ) : (
                            <IconDeleteScan size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 flex flex-col items-center gap-4 text-center">
                  <div className="text-5xl opacity-40">📭</div>
                  <p className="text-gray-400 font-bold text-sm">No scans found in your history.</p>
                </div>
              )}
            </div>

            <div className="pt-2 shrink-0">
              <button 
                onClick={() => setShowScansOverlay(false)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-gray-200"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATION OVERLAY ─────────────────────────────────── */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowNotifications(false)}
          />
          
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Notifications</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Stay updated with your progress</p>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 text-gray-400 hover:text-gray-600 active:scale-90 transition-all"
              >
                <IconClose size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <IconNotifications size={32} color="#d1d5db" />
                  </div>
                  <p className="font-bold text-gray-900">All caught up!</p>
                  <p className="text-sm text-gray-400 mt-1">No new notifications at the moment.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => !n.read && handleMarkRead(n.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      n.read 
                        ? 'bg-white border-gray-100 opacity-60' 
                        : 'bg-green-50/40 border-green-100 shadow-sm'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        n.type === 'streak' ? 'bg-orange-100' :
                        n.type === 'mission' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {n.type === 'streak' ? (
                          <IconFlame size={20} color="#f97316" />
                        ) : n.type === 'mission' ? (
                          n.message.toLowerCase().includes('accuracy') ? (
                            <IconTarget size={20} color="#3b82f6" />
                          ) : (
                            <IconTrophy size={20} color="#eab308" />
                          )
                        ) : (
                          <IconAlert size={20} color="#10b981" />
                        )}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className={`text-sm tracking-tight ${n.read ? 'text-gray-600' : 'text-gray-900 font-bold'}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5 opacity-80">
                           {n.timestamp?.toDate ? n.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                <button 
                  onClick={handleClearNotifications}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-gray-200 rounded-2xl text-red-500 font-bold text-sm hover:bg-red-50 active:scale-95 transition-all shadow-sm"
                >
                  <IconDeleteScan size={16} color="#ef4444" />
                  Clear All Notifications
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;