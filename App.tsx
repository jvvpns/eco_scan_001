import React, { useEffect, useState, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ScanPage from './components/ScanPage';
import MissionsPage from './components/MissionsPage';
import ProfilePage from './components/ProfilePage';
import { Page } from './types';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // Incremented after each scan so DashboardPage re-fetches recent scans
  const [scanRefreshTrigger, setScanRefreshTrigger] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      setCurrentPage(user ? Page.DASHBOARD : Page.LOGIN);
    });
    return () => unsubscribe();
  }, []);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleScanComplete = useCallback(() => {
    // Bump trigger so dashboard re-fetches scans from Firestore
    setScanRefreshTrigger(n => n + 1);
    navigateTo(Page.DASHBOARD);
  }, [navigateTo]);

  const renderPage = () => {
    switch (currentPage) {
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

      default:
        return <LoginPage />;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0fdf4]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500" />
          <p className="text-green-700 font-semibold text-sm">Loading EcoScan...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) return <LoginPage />;

  return (
    <div className="relative min-h-screen w-full font-sans antialiased">
      {renderPage()}
    </div>
  );
}

export default App;