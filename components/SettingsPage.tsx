import React from 'react';
import {
  IconEditProfile,
  IconClose,
  IconBack,
} from '../components/Icons';

// ─── LOCAL ICONS (settings-only) ─────────────────────────────

const KeyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="M21 2l-9.6 9.6" />
    <path d="M15.5 7.5l2 2" />
    <path d="M18 5l2 2" />
  </svg>
);

const TrashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

// ─── TYPES ────────────────────────────────────────────────────

interface SettingsPageProps {
  onLogout: () => void;
  onBack?: () => void;
}

// ─── SETTINGS ITEM ────────────────────────────────────────────

const SettingsItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isDestructive?: boolean;
  onClick?: () => void;
}> = ({ icon, label, isDestructive = false, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
      isDestructive ? 'hover:bg-red-500/20' : 'hover:bg-green-50/50'
    }`}
  >
    <div className="flex items-center">
      <div className={isDestructive ? 'text-red-400' : 'text-green-600'}>{icon}</div>
      <span className={`ml-4 font-medium ${isDestructive ? 'text-red-500' : 'text-gray-800'}`}>
        {label}
      </span>
    </div>
    {!isDestructive && <ChevronRightIcon />}
  </button>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout, onBack }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f0fdf4] font-sans">
      
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-95 transition-all"
        >
          <IconBack size={20} color="currentColor" />
        </button>
        <h1 className="text-gray-900 font-black text-xl tracking-tight">Settings</h1>
      </div>

      <div className="p-4 flex-1">
      <div className="w-full max-w-md mx-auto space-y-6">

        {/* Account */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <h2 className="text-xs font-bold uppercase text-gray-400 px-4 pt-2">Account</h2>
          <div className="mt-2 space-y-1">
            <SettingsItem icon={<IconEditProfile size={24} color="currentColor" />} label="Edit Profile" />
            <SettingsItem icon={<KeyIcon />}                                         label="Change Password" />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-2">
          <h2 className="text-xs font-bold uppercase text-red-400 px-4 pt-2">Danger Zone</h2>
          <div className="mt-2 space-y-1">
            <SettingsItem icon={<TrashIcon />} label="Delete Account" isDestructive />
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <SettingsItem icon={<LogoutIcon />} label="Log Out" onClick={onLogout} />
        </div>

      </div>
      </div>
    </div>
  );
};

export default SettingsPage;