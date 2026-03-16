import React from 'react';
import {
  IconEditProfile,
  IconClose,
  IconBack,
} from '../components/Icons';

// ─── LOCAL ICONS (settings-only) ─────────────────────────────

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="M21 2l-9.6 9.6" />
    <path d="M15.5 7.5l2 2" />
    <path d="M18 5l2 2" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
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
  iconBg?: string;
  label: string;
  sublabel?: string;
  isDestructive?: boolean;
  onClick?: () => void;
}> = ({ icon, iconBg = 'bg-green-100', label, sublabel, isDestructive = false, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[1rem] transition-all active:scale-[0.98] ${
      isDestructive ? 'hover:bg-red-50' : 'hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center gap-3.5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDestructive ? 'bg-red-100 text-red-500' : `${iconBg} text-green-700`}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className={`font-semibold text-sm ${isDestructive ? 'text-red-500' : 'text-gray-800'}`}>{label}</p>
        {sublabel && <p className="text-gray-400 text-xs mt-0.5">{sublabel}</p>}
      </div>
    </div>
    {!isDestructive && <ChevronRightIcon />}
  </button>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout, onBack }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="bg-green-500 rounded-b-[2rem] px-6 pt-12 pb-7 shadow-sm relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition-all border border-white/20"
          >
            <IconBack size={18} color="currentColor" />
          </button>
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight">Settings</h1>
            <p className="text-green-100 text-sm font-medium mt-0.5">Manage your account</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-28 space-y-4">

        {/* Account */}
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 mb-2">Account</p>
          <div className="bg-white rounded-[1.25rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <SettingsItem
              icon={<IconEditProfile size={18} color="currentColor" />}
              iconBg="bg-indigo-100"
              label="Edit Profile"
              sublabel="Change your name and avatar"
            />
            <SettingsItem
              icon={<KeyIcon />}
              iconBg="bg-blue-100"
              label="Change Password"
              sublabel="Update your login credentials"
            />
          </div>
        </div>

        {/* About */}
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 mb-2">About</p>
          <div className="bg-white rounded-[1.25rem] shadow-sm border border-gray-100 overflow-hidden">
            <SettingsItem
              icon={<InfoIcon />}
              iconBg="bg-gray-100"
              label="App Version"
              sublabel="EcoScan v1.0.0"
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <p className="text-[10px] text-red-400 font-black uppercase tracking-widest ml-1 mb-2">Danger Zone</p>
          <div className="bg-white rounded-[1.25rem] shadow-sm border border-red-100 overflow-hidden divide-y divide-red-50">
            <SettingsItem
              icon={<LogoutIcon />}
              label="Log Out"
              isDestructive
              onClick={onLogout}
            />
            <SettingsItem
              icon={<TrashIcon />}
              label="Delete Account"
              sublabel="This action cannot be undone"
              isDestructive
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;