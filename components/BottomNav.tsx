import React from 'react';
import { Page } from '../types';
import { IconHome, IconMissions, IconLeaderboard, IconProfile, IconScanNav } from './Icons';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onScanClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate, onScanClick }) => {
  const navItems = [
    { page: Page.DASHBOARD, label: 'Home',     icon: (a: boolean) => <IconHome        size={24} color={a ? '#16a34a' : '#9ca3af'} /> },
    { page: Page.TIER,      label: 'Missions', icon: (a: boolean) => <IconMissions    size={24} color={a ? '#16a34a' : '#9ca3af'} /> },
    { page: null,           label: 'Scan',     icon: () => null },
    { page: Page.PROFILE,   label: 'Leaders',  icon: (a: boolean) => <IconLeaderboard size={24} color={a ? '#16a34a' : '#9ca3af'} /> },
    { page: Page.SETTINGS,  label: 'Profile',  icon: (a: boolean) => <IconProfile     size={24} color={a ? '#16a34a' : '#9ca3af'} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-50">
      <div className="flex items-end justify-around px-2 pt-2 pb-5">
        {navItems.map((item, idx) => {
          if (item.page === null) {
            return (
              <div key="scan" className="flex flex-col items-center -mt-8 relative z-10 w-[72px]">
                <button 
                  onClick={onScanClick}
                  className="w-[68px] h-[68px] rounded-full bg-gradient-to-tr from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 active:scale-95 flex items-center justify-center shadow-lg shadow-green-200/50 transition-all border-4 border-white"
                  aria-label="Scan waste"
                >
                  <IconScanNav size={30} color="white" />
                </button>
              </div>
            );
          }
          const isActive = currentPage === item.page;
          return (
            <button 
              key={item.page || idx} 
              onClick={() => item.page && onNavigate(item.page)}
              className="flex flex-col items-center gap-1.5 px-3 py-1 rounded-xl transition-all w-16"
            >
              {item.icon(isActive)}
              <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
