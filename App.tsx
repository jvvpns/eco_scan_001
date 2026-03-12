import React, { useEffect, useState, useCallback, useMemo } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ScanPage from './components/ScanPage';
import MissionsPage from './components/MissionsPage';
import ProfilePage from './components/ProfilePage';
import { Page, ScannedItem } from './types';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { logoutUser } from "./services/authService";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      if (user) {
        setCurrentPage(Page.DASHBOARD);
      } else {
        setCurrentPage(Page.LOGIN);
      }
    });
    return () => unsubscribe();
  }, []);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    setScannedItems([]);
  }, []);

  const addScannedItem = useCallback(
    (item: Omit<ScannedItem, 'id' | 'timestamp'>) => {
      setScannedItems((prevItems) => [
        {
          ...item,
          id: `item-${Date.now()}`,
          timestamp: new Date(),
        },
        ...prevItems,
      ]);
    },
    []
  );

  const totalScore = useMemo(() => {
    return scannedItems.reduce((total, item) => total + item.points, 0);
  }, [scannedItems]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.LOGIN:
        return <LoginPage />;

      case Page.DASHBOARD:
        return (
          <DashboardPage
            scannedItems={scannedItems}
            totalScore={totalScore}
            onScanClick={() => navigateTo(Page.SCAN)}
            onNavigate={navigateTo}
            currentPage={currentPage}
          />
        );

      case Page.SCAN:
        return (
          <ScanPage
            onScanComplete={addScannedItem}
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

      // Placeholders — will be replaced in later phases
      case Page.PROFILE:
        return (
          <DashboardPage
            scannedItems={scannedItems}
            totalScore={totalScore}
            onScanClick={() => navigateTo(Page.SCAN)}
            onNavigate={navigateTo}
            currentPage={currentPage}
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

  if (!firebaseUser) {
    return <LoginPage />;
  }

  return (
    <div className="relative min-h-screen w-full font-sans antialiased">
      {renderPage()}
    </div>
  );
}

export default App;