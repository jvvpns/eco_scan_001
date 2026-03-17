/**
 * Pilot Icon System
 * ---------------------------------------------------------------------------
 * All icons are inline SVG, viewBox="0 0 24 24", stroke-width 2,
 * stroke-linecap round, stroke-linejoin round.
 *
 * Usage:
 *   import { IconHome, IconScan, IconPlastic } from '@/components/icons';
 *   <IconHome size={24} color="#1D9E75" />
 *
 * Defaults: size=24, color="currentColor"
 */

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const base = (paths: React.ReactNode, size: number, color: string, className?: string) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {paths}
  </svg>
);

// ─── NAVIGATION ───────────────────────────────────────────────

export const IconHome: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
      <path d="M12 7v.01" />
    </>,
    size, color, className
  );

export const IconMissions: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M12 2v3m0 14v3M5 12H2m20 0h-3" strokeOpacity="0.5" />
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </>,
    size, color, className
  );

export const IconScanNav: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="12" x2="12.01" y2="12" />
    </> ,
    size, color, className
  );

export const IconLeaderboard: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M6 20v-4m6 4V10m6 10V4" />
      <path d="M3 20h18" strokeOpacity="0.5" />
    </>,
    size, color, className
  );

export const IconProfile: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>,
    size, color, className
  );

// ─── WASTE CATEGORIES ─────────────────────────────────────────

export const IconPlastic: React.FC<IconProps> = ({ size = 24, color = '#378ADD', className }) =>
  base(
    <>
      <path d="M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" stroke={color} />
      <path d="M12 7v4m0 4v.01" stroke={color} />
    </>,
    size, color, className
  );

export const IconPaper: React.FC<IconProps> = ({ size = 24, color = '#63A9D9', className }) =>
  base(
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} />
      <path d="M6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5" stroke={color} />
      <path d="M10 7h6" stroke={color} strokeOpacity="0.5" />
      <path d="M10 11h6" stroke={color} strokeOpacity="0.5" />
    </>,
    size, color, className
  );

export const IconMetal: React.FC<IconProps> = ({ size = 24, color = '#888780', className }) =>
  base(
    <>
      <path d="M17 12a5 5 0 1 1-10 0V4h10v8z" stroke={color} />
      <path d="M10 2l4 4" stroke={color} strokeOpacity="0.5" />
      <path d="M12 10v4" stroke={color} />
    </>,
    size, color, className
  );

export const IconGlass: React.FC<IconProps> = ({ size = 24, color = '#5DCAA5', className }) =>
  base(
    <>
      <path d="M9 3h6v4l2 3v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10l2-3V3z" stroke={color} />
      <path d="M9 10h6" stroke={color} strokeOpacity="0.5" />
      <path d="M12 14v4" stroke={color} strokeOpacity="0.5" />
    </>,
    size, color, className
  );

export const IconOrganic: React.FC<IconProps> = ({ size = 24, color = '#639922', className }) =>
  base(
    <>
      <path d="M12 2L5 9c0 3.866 3.134 7 7 7s7-3.134 7-7L12 2z" stroke={color} />
      <path d="M12 16v5" stroke={color} />
      <path d="M8 21h8" stroke={color} />
    </>,
    size, color, className
  );

export const IconSpecialWaste: React.FC<IconProps> = ({ size = 24, color = '#E24B4A', className }) =>
  base(
    <>
      <path d="M12 3L2 21h20L12 3z" stroke={color} />
      <path d="M12 9v4" stroke={color} />
      <path d="M12 17h.01" stroke={color} />
    </>,
    size, color, className
  );

// ─── ACTIONS ──────────────────────────────────────────────────

export const IconScan: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 12h.01" />
    </>,
    size, color, className
  );

export const IconDeleteScan: React.FC<IconProps> = ({ size = 24, color = '#E24B4A', className }) =>
  base(
    <>
      <path d="M3 6h18" stroke={color} />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} />
      <path d="M10 11v6" stroke={color} strokeOpacity="0.5" />
      <path d="M14 11v6" stroke={color} strokeOpacity="0.5" />
    </>,
    size, color, className
  );

export const IconEditProfile: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M12 20h9" strokeOpacity="0.5" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </>,
    size, color, className
  );

export const IconUploadAvatar: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeOpacity="0.5" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>,
    size, color, className
  );

/**
 * IconImageUpload — Photo frame with an upward arrow, used for "Upload from Gallery"
 * actions on the Scanner page. Distinct from IconUploadAvatar (which is avatar-specific).
 */
export const IconImageUpload: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" strokeOpacity="0.5" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </>,
    size, color, className
  );

export const IconRecycling: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <polyline points="7 11 2 9 7 7" />
      <path d="M21 12a9 9 0 1 1-9-9" />
    </>,
    size, color, className
  );

export const IconPoints: React.FC<IconProps> = ({ size = 24, color = '#EF9F27', className }) =>
  base(
    <>
      <circle cx="12" cy="12" r="10" stroke={color} />
      <path d="M12 8v8" stroke={color} />
      <path d="M8 12h8" stroke={color} />
    </>,
    size, color, className
  );

export const IconBadge: React.FC<IconProps> = ({ size = 24, color = '#EF9F27', className }) =>
  base(
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} />,
    size, color, className
  );

export const IconStreak: React.FC<IconProps> = ({ size = 24, color = '#EF9F27', className }) =>
  base(
    <>
      <path d="M13 3l-4 9h3l-1 9 4.5-9h-3.5L13 3z" />
      <path d="M10 12h4" strokeOpacity="0.5" />
    </>,
    size, color, className
  );

export const IconFlame: React.FC<IconProps> = ({ size = 24, color = '#EF4444', className }) =>
  base(
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3 0 0-5 4.5-2 11 0 0-2-1-2-4 0-1.06.56-2 1.5-3.5a9 9 0 0 1 1.5-2c1.76 1.76 3 4.18 3 7a5 5 0 1 1-10 0c0-1.38.5-2-1-3" stroke={color} />,
    size, color, className
  );

export const IconTarget: React.FC<IconProps> = ({ size = 24, color = '#3B82F6', className }) =>
  base(
    <>
      <circle cx="12" cy="12" r="10" stroke={color} />
      <circle cx="12" cy="12" r="6" stroke={color} />
      <circle cx="12" cy="12" r="2" stroke={color} />
    </>,
    size, color, className
  );

export const IconTrophy: React.FC<IconProps> = ({ size = 24, color = '#F59E0B', className }) =>
  base(
    <>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke={color} />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke={color} />
      <path d="M4 22h16" stroke={color} />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" stroke={color} />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" stroke={color} />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" stroke={color} />
    </>,
    size, color, className
  );

export const IconAlert: React.FC<IconProps> = ({ size = 24, color = '#EF4444', className }) =>
  base(
    <>
      <circle cx="12" cy="12" r="10" stroke={color} />
      <line x1="12" y1="8" x2="12" y2="12" stroke={color} />
      <line x1="12" y1="16" x2="12.01" y2="16" stroke={color} />
    </>,
    size, color, className
  );

export const IconChecklist: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M9 11l3 3L22 4" stroke={color} />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke={color} />
    </>,
    size, color, className
  );

export const IconCo2: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M4.5 19c-2.4 0-4.5-2-4.5-4.5s2.1-4.5 4.5-4.5c.3 0 .5 0 .8.1C6.4 6.4 9.9 4 14 4c4.6 0 8.4 3.4 9 7.8 1.7.5 3 2 3 3.7 0 2.2-1.8 4-4 4" stroke={color} />
      <path d="M8 12h2" stroke={color} />
      <path d="M14 12h2" stroke={color} />
    </>,
    size, color, className
  );

export const IconWeight: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M6 3h12l4 18H2L6 3z" stroke={color} />
      <path d="M9 11a3 3 0 0 1 6 0" stroke={color} />
    </>,
    size, color, className
  );

export const IconTree: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M12 13v8" stroke={color} />
      <path d="M12 2L5 13h14L12 2z" stroke={color} />
      <path d="M12 2L8 8h8L12 2z" stroke={color} />
    </>,
    size, color, className
  );

export const IconEcoPoints: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" strokeOpacity="0.5" />
      <path d="M12 7v5l-3 3" />
      <path d="M12 12l3 3" />
    </>,
    size, color, className
  );

// ─── UTILITY ──────────────────────────────────────────────────

export const IconSettings: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" strokeOpacity="1" />
      <circle cx="12" cy="12" r="3" strokeOpacity="0.8" />
    </>,
    size, color, className
  );

export const IconNotifications: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeOpacity="0.5" />
    </>,
    size, color, className
  );

export const IconSearch: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>,
    size, color, className
  );

export const IconInfo: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>,
    size, color, className
  );

export const IconBack: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M19 12H5" />
      <polyline points="12 19 5 12 12 5" />
    </>,
    size, color, className
  );

export const IconClose: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>,
    size, color, className
  );

export const IconInstall: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeOpacity="0.5" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>,
    size, color, className
  );

export const IconMenu: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>,
    size, color, className
  );

// ─── APP BRAND ICON (for splash / install banner) ─────────────
export const PilotBrandIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <img 
    src="/icons/icon-192x192.png" 
    alt="Pilot Logo" 
    width={size} 
    height={size} 
    className={className} 
    style={{ objectFit: 'contain' }}
  />
);

// ─── ALIASES & SPECIALTY ICONS ───────────────────────────────

export const IconBiodegradable: React.FC<IconProps>    = IconOrganic;
export const IconNonBiodegradable: React.FC<IconProps> = IconRecycling;
export const IconSpecial: React.FC<IconProps>          = IconSpecialWaste;

export const IconResidual: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M19 6L18 20H6L5 6h14z" />
      <path d="M10 11v5" strokeOpacity="0.5" />
      <path d="M14 11v5" strokeOpacity="0.5" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeOpacity="0.8" />
    </>,
    size, color, className
  );
export const IconRefresh: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M23 4v6h-6" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </>,
    size, color, className
  );
