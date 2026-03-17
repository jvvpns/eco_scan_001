import React, { useEffect, useState, useCallback, useRef } from 'react';
import PWAInstallBanner from './components/PWAInstallBanner';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ScanPage from './components/ScanPage';
import MissionsPage from './components/MissionsPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import { Page } from './types';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { logoutUser } from './services/authService';
import BottomNav from './components/BottomNav';

// ─── PAGE TRANSITION DURATION (ms) ───────────────────────────
const TRANSITION_MS = 220;

// ─── RENDER A PAGE NODE ───────────────────────────────────────
function buildPage(
  page: Page,
  navigateTo: (p: Page) => void,
  handleScanComplete: () => void,
  scanRefreshTrigger: number,
  currentPage: Page,
) {
  switch (page) {
    case Page.LOGIN:
      return <LoginPage />;

    case Page.DASHBOARD:
      return (
        <DashboardPage
          onScanClick={() => navigateTo(Page.SCAN)}
          onNavigate={navigateTo}
          currentPage={currentPage}
          refreshTrigger={scanRefreshTrigger}
        />
      );

    case Page.SCAN:
      return (
        <ScanPage
          onScanComplete={handleScanComplete}
          onBack={() => navigateTo(Page.DASHBOARD)}
        />
      );

    case Page.TIER:
      return (
        <MissionsPage
          onNavigate={navigateTo}
          currentPage={currentPage}
        />
      );

    case Page.PROFILE:
      return (
        <MissionsPage
          onNavigate={navigateTo}
          currentPage={currentPage}
          defaultTab="leaderboard"
        />
      );

    case Page.SETTINGS:
      return (
        <ProfilePage
          onNavigate={navigateTo}
          currentPage={currentPage}
        />
      );

    case Page.APP_SETTINGS:
      return (
        <SettingsPage 
          onLogout={async () => {
            await logoutUser();
          }}
          onBack={() => navigateTo(Page.SETTINGS)}
        />
      );

    default:
      return <LoginPage />;
  }
}

// ─── APP ──────────────────────────────────────────────────────
function App() {
  const [currentPage, setCurrentPage]         = useState<Page>(Page.LOGIN);
  const [displayedPage, setDisplayedPage]     = useState<Page>(Page.LOGIN);
  const [firebaseUser, setFirebaseUser]       = useState<User | null>(null);
  const [authLoading, setAuthLoading]         = useState(true);
  const [scanRefreshTrigger, setScanRefreshTrigger] = useState(0);

  // Transition state: 'idle' | 'fading-out' | 'fading-in'
  const [transState, setTransState]           = useState<'idle' | 'fading-out' | 'fading-in'>('idle');
  const pendingPageRef                        = useRef<Page | null>(null);
  const timerRef                              = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // DIAGNOSTIC LOGGING
    console.log('Firebase Project ID (Client):', (auth.app.options as any).projectId);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase Auth State Change:', user ? `User Logged In (UID: ${user.uid})` : 'User Logged Out');
      setFirebaseUser(user);
      setAuthLoading(false);
      const target = user ? Page.DASHBOARD : Page.LOGIN;
      setCurrentPage(target);
      setDisplayedPage(target);
    });
    return () => unsubscribe();
  }, []);

  // Clean up any running timers on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const navigateTo = useCallback((page: Page) => {
    // If already there or mid-transition to same page, skip
    if (page === currentPage) return;

    pendingPageRef.current = page;
    setCurrentPage(page);       // track logical page immediately for nav highlights
    setTransState('fading-out');

    timerRef.current = setTimeout(() => {
      // Swap displayed page at the midpoint (screen is fully transparent)
      setDisplayedPage(page);
      setTransState('fading-in');

      timerRef.current = setTimeout(() => {
        setTransState('idle');
      }, TRANSITION_MS);
    }, TRANSITION_MS);
  }, [currentPage]);

  const handleScanComplete = useCallback(() => {
    setScanRefreshTrigger(n => n + 1);
    navigateTo(Page.DASHBOARD);
  }, [navigateTo]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0fdf4]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500" />
          <p className="text-green-700 font-semibold text-sm">Loading Pilot...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) return <LoginPage />;

  // Opacity class driven by transition state
  const opacityClass =
    transState === 'fading-out' ? 'opacity-0' :
    transState === 'fading-in'  ? 'opacity-100' :
    'opacity-100';

  const isNavVisible = [Page.DASHBOARD, Page.TIER, Page.PROFILE, Page.SETTINGS].includes(displayedPage);

  return (
    <div className="relative min-h-screen w-full font-sans antialiased bg-[#f8fafc]">
      <div
        className={`transition-opacity ${opacityClass} pb-${isNavVisible ? '24' : '0'}`}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
      >
        {buildPage(displayedPage, navigateTo, handleScanComplete, scanRefreshTrigger, currentPage)}
      </div>
      
      {isNavVisible && (
        <BottomNav 
          currentPage={currentPage}
          onNavigate={navigateTo}
          onScanClick={() => navigateTo(Page.SCAN)}
        />
      )}
      
      <PWAInstallBanner />
    </div>
  );
}

export default App;