/**
 * EcoScan Icon System
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
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="1.5" />
      <polyline points="9 22 9 12 15 12 15 22" strokeWidth="1.5" />
    </>,
    size, color, className
  );

export const IconMissions: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="1.5" strokeLinejoin="miter" />,
    size, color, className
  );

export const IconScanNav: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M4 8V6a2 2 0 0 1 2-2h2" strokeWidth="2" />
      <path d="M4 16v2a2 2 0 0 0 2 2h2" strokeWidth="2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v2" strokeWidth="2" />
      <path d="M16 20h2a2 2 0 0 0 2-2v-2" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
    </>,
    size, color, className
  );

export const IconLeaderboard: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <rect x="14" y="5" width="4" height="15" rx="1" strokeWidth="1.5" />
      <rect x="6" y="11" width="4" height="9" rx="1" strokeWidth="1.5" />
      <path d="M10 20h8" strokeWidth="1.5" />
      <path d="M6 20h4" strokeWidth="1.5" />
    </>,
    size, color, className
  );

export const IconProfile: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="1.5" />
      <circle cx="12" cy="7" r="4" strokeWidth="1.5" />
    </>,
    size, color, className
  );

// ─── WASTE CATEGORIES ─────────────────────────────────────────

export const IconPlastic: React.FC<IconProps> = ({ size = 24, color = '#378ADD', className }) =>
  base(
    <>
      <path d="M8 4H7C5.9 4 5 4.9 5 6V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6C19 4.9 18.1 4 17 4H16" stroke={color} />
      <rect x="9" y="3" width="6" height="3" rx="1.5" stroke={color} />
      <path d="M9 12C9 10.9 9.9 10 11 10H13C14.1 10 15 10.9 15 12V15C15 16.1 14.1 17 13 17H11C9.9 17 9 16.1 9 15V12Z" stroke={color} />
    </>,
    size, color, className
  );

export const IconPaper: React.FC<IconProps> = ({ size = 24, color = '#63A9D9', className }) =>
  base(
    <>
      <path d="M4 4H20V16C20 17.1 19.1 18 18 18H6C4.9 18 4 17.1 4 16V4Z" stroke={color} />
      <path d="M4 8H20" stroke={color} />
      <path d="M9 21L7.5 18" stroke={color} />
      <path d="M15 21L16.5 18" stroke={color} />
      <path d="M8 12H16" stroke={color} />
    </>,
    size, color, className
  );

export const IconMetal: React.FC<IconProps> = ({ size = 24, color = '#888780', className }) =>
  base(
    <>
      <path d="M7 4H17L19 8H5L7 4Z" stroke={color} />
      <rect x="6" y="8" width="12" height="12" rx="2" stroke={color} />
      <path d="M9 12H15M9 15H12" stroke={color} />
    </>,
    size, color, className
  );

export const IconGlass: React.FC<IconProps> = ({ size = 24, color = '#5DCAA5', className }) =>
  base(
    <>
      <path d="M9 3H15V6C15 6 17 7 17 10V19C17 20.1 16.1 21 15 21H9C7.9 21 7 20.1 7 19V10C7 7 9 6 9 6V3Z" stroke={color} />
      <path d="M9 8H15" stroke={color} />
      <path d="M10 13C10 12.45 10.45 12 11 12H13C13.55 12 14 12.45 14 13V17C14 17.55 13.55 18 13 18H11C10.45 18 10 17.55 10 17V13Z" stroke={color} />
    </>,
    size, color, className
  );

export const IconOrganic: React.FC<IconProps> = ({ size = 24, color = '#639922', className }) =>
  base(
    <>
      <path d="M12 3C12 3 7 7 7 13C7 16.3 9.2 19 12 19C14.8 19 17 16.3 17 13C17 7 12 3 12 3Z" stroke={color} />
      <path d="M12 19V22" stroke={color} />
      <path d="M9 21H15" stroke={color} />
      <path d="M12 10C12 10 9.5 12 9.5 14" stroke={color} strokeWidth="1.5" />
    </>,
    size, color, className
  );

export const IconSpecialWaste: React.FC<IconProps> = ({ size = 24, color = '#E24B4A', className }) =>
  base(
    <>
      <path d="M12 3L22 8.5V15.5L12 21L2 15.5V8.5L12 3Z" stroke={color} />
      <path d="M12 8V12" stroke={color} />
      <circle cx="12" cy="15" r="1" fill={color} stroke={color} />
    </>,
    size, color, className
  );

// ─── ACTIONS ──────────────────────────────────────────────────

export const IconScan: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 17.5H21M17.5 14V21" />
    </>,
    size, color, className
  );

export const IconDeleteScan: React.FC<IconProps> = ({ size = 24, color = '#E24B4A', className }) =>
  base(
    <>
      <path d="M3 6H21" stroke={color} />
      <path d="M8 6V4H16V6" stroke={color} />
      <path d="M19 6L18 20H6L5 6" stroke={color} />
      <path d="M10 11V16M14 11V16" stroke={color} />
    </>,
    size, color, className
  );

export const IconEditProfile: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20C4 17.2 7.6 15 12 15" />
      <path d="M15 19L16.5 20.5L19.5 17.5" />
    </>,
    size, color, className
  );

export const IconUploadAvatar: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M3 21C3 17.7 7 15 12 15C17 15 21 17.7 21 21" />
      <path d="M16 3L18 5L21 2" />
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
      {/* Photo frame */}
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.75" />
      {/* Mountain landscape inside frame */}
      <path d="M3 15l4-4 4 4 3-3 5 5" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Upload arrow pointing up-right from corner */}
      <path d="M16 3l4 0 0 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 3l-5 5" strokeWidth="2" strokeLinecap="round" />
    </>,
    size, color, className
  );

export const IconRecycling: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M12 3L8.5 8H11V13H13V8H15.5L12 3Z" />
      <path d="M5.5 10.5L3.5 15H6.5L8 19H11L9 15H12L9.5 10.5H5.5Z" />
      <path d="M18.5 10.5L20.5 15H17.5L16 19H13L15 15H12L14.5 10.5H18.5Z" />
    </>,
    size, color, className
  );

export const IconPoints: React.FC<IconProps> = ({ size = 24, color = '#EF9F27', className }) =>
  base(
    <>
      <path d="M8.5 14.5L4 19" stroke={color} />
      <circle cx="13" cy="9" r="5" stroke={color} />
      <path d="M13 7V9L14.5 10.5" stroke={color} />
      <circle cx="19.5" cy="19.5" r="2.5" fill={color} stroke={color} />
      <path d="M18.5 19.5H20.5M19.5 18.5V20.5" stroke="white" strokeWidth="1.5" />
    </>,
    size, color, className
  );

export const IconBadge: React.FC<IconProps> = ({ size = 24, color = '#EF9F27', className }) =>
  base(
    <path d="M12 3L14.5 8.5L21 9.3L16.5 13.6L17.6 20L12 17L6.4 20L7.5 13.6L3 9.3L9.5 8.5L12 3Z" stroke={color} />,
    size, color, className
  );

export const IconStreak: React.FC<IconProps> = ({ size = 24, color = '#EF9F27', className }) =>
  base(
    <path d="M13 3L8.5 12H12L11 21L15.5 12H12L13 3Z" stroke={color} />,
    size, color, className
  );

export const IconEcoPoints: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M5 3C5 3 4 8 6 11C8 14 12 14 12 14C12 14 16 14 18 11C20 8 19 3 19 3" />
      <path d="M5 3H19" />
      <path d="M12 14V21" />
      <path d="M8 21H16" />
    </>,
    size, color, className
  );

// ─── UTILITY ──────────────────────────────────────────────────

export const IconSettings: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>,
    size, color, className
  );

export const IconNotifications: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M18 8A6 6 0 0 0 6 8C6 14 3 16 3 16H21C21 16 18 14 18 8Z" />
      <path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.7 21.9 12.36 22 12 22C11.64 22 11.3 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21" />
    </>,
    size, color, className
  );

export const IconSearch: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21L16.7 16.7" />
    </>,
    size, color, className
  );

export const IconInfo: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8V12" />
      <circle cx="12" cy="15.5" r="0.75" fill={color} stroke={color} strokeWidth="0.5" />
    </>,
    size, color, className
  );

export const IconBack: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <path d="M19 12H5M5 12L12 19M5 12L12 5" />,
    size, color, className
  );

export const IconClose: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <path d="M6 6L18 18M18 6L6 18" />,
    size, color, className
  );

export const IconInstall: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M12 3V15M12 15L8 11M12 15L16 11" />
      <path d="M4 17V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V17" />
    </>,
    size, color, className
  );

export const IconMenu: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <path d="M4 6H20M4 12H20M4 18H12" />,
    size, color, className
  );

// ─── APP BRAND ICON (for splash / install banner) ─────────────
export const EcoScanBrandIcon: React.FC<IconProps> = ({ size = 32, color = 'white', className }) =>
  base(
    <>
      <path d="M12 3L8.5 8H11V13H13V8H15.5L12 3Z" stroke={color} />
      <path d="M5.5 10.5L3.5 15H6.5L8 19H11L9 15H12L9.5 10.5H5.5Z" stroke={color} />
      <path d="M18.5 10.5L20.5 15H17.5L16 19H13L15 15H12L14.5 10.5H18.5Z" stroke={color} />
    </>,
    size, color, className
  );

// ─── ALIASES & SPECIALTY ICONS ───────────────────────────────

export const IconBiodegradable: React.FC<IconProps>    = IconOrganic;
export const IconNonBiodegradable: React.FC<IconProps> = IconRecycling;
export const IconSpecial: React.FC<IconProps>          = IconSpecialWaste;

export const IconResidual: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) =>
  base(
    <>
      <path d="M3 6H21" stroke={color} />
      <path d="M8 6V4H16V6" stroke={color} />
      <path d="M19 6L18 20H6L5 6" stroke={color} />
      <path d="M10 11V16M14 11V16" stroke={color} />
    </>,
    size, color, className
  );