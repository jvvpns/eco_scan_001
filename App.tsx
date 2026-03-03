import React, { useEffect, useState, useCallback, useMemo } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ScanPage from './components/ScanPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import TierPage from './components/TierPage';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import { Page, ScannedItem } from './types';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { logoutUser } from "./services/authService";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 🔐 Listen to Firebase Auth state
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
    setIsMenuOpen(false);
  }, []);

  // 🔐 Proper Firebase logout
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
          />
        );

      case Page.SCAN:
        return (
          <ScanPage
            onScanComplete={addScannedItem}
            onBack={() => navigateTo(Page.DASHBOARD)}
          />
        );

      case Page.PROFILE:
        return <ProfilePage user={firebaseUser} />;

      case Page.SETTINGS:
        return <SettingsPage onLogout={handleLogout} />;

      case Page.TIER:
        return <TierPage totalScore={totalScore} />;

      default:
        return <LoginPage />;
    }
  };

  const pageTitle = useMemo(() => {
    const titles: { [key in Page]?: string } = {
      [Page.DASHBOARD]: 'Dashboard',
      [Page.SCAN]: 'Scan Garbage',
      [Page.PROFILE]: 'Profile',
      [Page.SETTINGS]: 'Settings',
      [Page.TIER]: 'Tiers',
    };
    return titles[currentPage] || 'EcoScan';
  }, [currentPage]);

  // ⏳ Auth loading guard
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  // 🔑 If not authenticated, always show login
  if (!firebaseUser) {
    return <LoginPage />;
  }

  return (
    <div className="relative min-h-screen w-full font-sans flex flex-col antialiased text-white">
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={navigateTo}
      />
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        title={pageTitle}
      />
      <main className="flex-1 w-full overflow-y-auto pt-16 pb-20">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;