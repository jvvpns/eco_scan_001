import React from 'react';

interface VisualProps {
  className?: string;
  size?: number;
}

// 1. Open the App
export const VisualAppLaunch: React.FC<VisualProps> = ({ className, size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="30" y="15" width="40" height="70" rx="8" stroke="#16a34a" strokeWidth="3" />
    <path d="M45 20H55" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
    <circle cx="50" cy="78" r="3" fill="#16a34a" />
    <path d="M40 45L50 55L60 45" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M50 35V55" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
    <rect x="35" y="60" width="30" height="4" rx="2" fill="#16a34a" opacity="0.3" />
  </svg>
);

// 2. Tap & Scan
export const VisualCamera: React.FC<VisualProps> = ({ className, size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="25" y="35" width="50" height="35" rx="6" stroke="#8b5cf6" strokeWidth="3" />
    <path d="M40 35L45 28H55L60 35" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="52.5" r="10" stroke="#8b5cf6" strokeWidth="3" />
    <circle cx="68" cy="42" r="2" fill="#8b5cf6" />
    <path d="M15 50H20" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
    <path d="M80 50H85" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 3. Scan Waste
export const VisualWaste: React.FC<VisualProps> = ({ className, size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 30V25C20 22.2386 22.2386 20 25 20H30" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
    <path d="M70 20H75C77.7614 20 80 22.2386 80 25V30" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
    <path d="M80 70V75C80 77.7614 77.7614 80 75 80H70" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
    <path d="M30 80H25C22.2386 80 20 77.7614 20 75V70" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
    <path d="M42 35H58V65H42V35Z" stroke="#eab308" strokeWidth="3" />
    <path d="M45 35L48 25H52L55 35" stroke="#eab308" strokeWidth="3" />
    <path d="M45 50H55" stroke="#eab308" strokeWidth="2" opacity="0.5" />
  </svg>
);

// 4. Category
export const VisualCategory: React.FC<VisualProps> = ({ className, size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="35" stroke="#f97316" strokeWidth="3" strokeDasharray="5 5" />
    <path d="M40 45C40 40 45 35 50 35C55 35 60 40 60 45C60 55 50 55 50 60" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="72" r="3" fill="#f97316" />
    <path d="M75 25L80 20" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 75L25 80" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 5. AI Action
export const VisualAIRobot: React.FC<VisualProps> = ({ className, size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="30" y="35" width="40" height="35" rx="10" stroke="#16a34a" strokeWidth="3" />
    <circle cx="42" cy="50" r="3" fill="#16a34a" />
    <circle cx="58" cy="50" r="3" fill="#16a34a" />
    <path d="M45 60C45 60 47 63 50 63C53 63 55 60 55 60" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
    <path d="M50 35V25M50 25L45 30M50 25L55 30" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
    <path d="M25 52H30M70 52H75" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
    <path d="M35 70L30 80M65 70L70 80" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="18" r="4" fill="#16a34a" opacity="0.4" />
  </svg>
);

// 6. Results
export const VisualResults: React.FC<VisualProps> = ({ className, size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="25" y="25" width="50" height="50" rx="4" stroke="#f59e0b" strokeWidth="3" />
    <path d="M35 40H65" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <path d="M35 50H65" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <path d="M35 60H50" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <circle cx="75" cy="75" r="15" fill="#22c55e" />
    <path d="M68 75L73 80L82 71" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 7. Refresh
export const VisualRefresh: React.FC<VisualProps> = ({ className, size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M80 50C80 66.5685 66.5685 80 50 80C33.4315 80 20 66.5685 20 50C20 33.4315 33.4315 20 50 20C60 20 68 25 74 32" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
    <path d="M75 15V32H58" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="5" fill="#ef4444" />
  </svg>
);

// Sparkle for "Chef's Briefing" style
export const VisualSparkle: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
  </svg>
);

// ─── INLINE ICONS (for buttons, badges, status indicators) ───

// Eco-leaf celebration (replaces 🎉) — leaf with sparkle lines
export const SvgEcoCelebrate: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M17 8C8 10 5 18 5 18C5 18 11 14 17 8Z" fill="currentColor" opacity="0.15" />
    <path d="M17 8C8 10 5 18 5 18C5 18 11 14 17 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 13L9 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2 2L4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M22 2L20 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 22L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Thinking/learning (replaces 🤔) — magnifier with question mark
export const SvgThinkLearn: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 9C9 7.89543 9.89543 7 11 7C12.1046 7 13 7.89543 13 9C13 10.5 11 10.5 11 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="11" cy="14" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
  </svg>
);

// Learning tip bulb (replaces 💡) — lightbulb with leaf accent
export const SvgLeafBulb: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 3C8.13401 3 5 6.13401 5 10C5 12.76 6.67 15.11 9 16.2V17H15V16.2C17.33 15.11 19 12.76 19 10C19 6.13401 15.866 3 12 3Z" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7V11L14 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Camera blocked (replaces 📷) — camera with slash
export const SvgCameraBlocked: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
    <path d="M8 7L10 3H14L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
    <path d="M4 22L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Offline / Cloud queue (replaces 📶) — cloud with arrow
export const SvgCloudQueue: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M18 10H16.74C16.3659 8.55014 15.5928 7.23588 14.5086 6.20497C13.4245 5.17405 12.0727 4.46724 10.606 4.16525C9.13921 3.86325 7.61714 3.97824 6.21287 4.49672C4.80861 5.0152 3.57956 5.91596 2.66478 7.09784C1.75001 8.27971 1.18624 9.69412 1.03522 11.1805C0.884195 12.6669 1.15217 14.1647 1.80771 15.505C2.46326 16.8453 3.48044 17.9748 4.74416 18.7673C6.00787 19.5598 7.46805 19.9839 8.96 20H18C19.3261 20 20.5979 19.4732 21.5355 18.5355C22.4732 17.5979 23 16.3261 23 15C23 13.6739 22.4732 12.4021 21.5355 11.4645C20.5979 10.5268 19.3261 10 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 13V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 15L12 17L14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Warning triangle (replaces ⚠️) — triangle with exclamation
export const SvgWarning: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M10.29 3.86L1.82 18A2 2 0 003.64 21H20.36A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

// Search / No waste found (replaces 🔍) — magnifying glass with leaf
export const SvgSearchLeaf: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M21 21L15.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M13 7C9 9 8 13 8 13C8 13 10 11 13 7Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Medal/badge (replaces 🏅) — medal with ribbon
export const SvgMedal: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
    <path d="M12 5V8L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// AI Robot inline (replaces 🤖) — robot face
export const SvgAIRobot: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="8" width="16" height="12" rx="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="9" cy="14" r="1.5" fill="currentColor" />
    <circle cx="15" cy="14" r="1.5" fill="currentColor" />
    <path d="M10 18C10 18 11 19 12 19C13 19 14 18 14 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 8V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="3" r="1.5" fill="currentColor" />
    <path d="M2 14H4M20 14H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Timer / Cooldown (replaces ⏱️) — clock with arrow
export const SvgTimer: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M12 9V13L15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 2H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 7L21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Target / Match (replaces 🎯) — crosshair with leaf
export const SvgTarget: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Retry / Refresh inline (replaces 🔄) — circular arrow
export const SvgRetry: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.49 15A9 9 0 1118.36 5.64L23 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Camera inline (replaces 📷 in button text) — simple camera
export const SvgCameraInline: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
    <path d="M8 7L10 3H14L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
  </svg>
);

// Eco checkmark (replaces ✅) — check with leaf wreath
export const SvgEcoCheck: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 5C14 7 13 3 13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// Scan point/capture (replaces scan step icon in ScannerTutorial)
export const SvgPointCapture: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 7V5a2 2 0 012-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 3h2a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M21 17v2a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 21H5a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8V4M12 20V16M8 12H4M20 12H16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
  </svg>
);

// Verify check (replaces verify step icon in ScannerTutorial)
export const SvgVerifyCheck: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 3L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Eco-wave (replaces 👋) — waving hand with leaf sparkle
export const SvgEcoWave: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M18 11V7C18 5.89543 17.1046 5 16 5C14.8954 5 14 5.89543 14 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 7C14 5.89543 13.1046 5 12 5C10.8954 5 10 5.89543 10 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 9V7C10 5.89543 9.10457 5 8 5C6.89543 5 6 5.89543 6 7V14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 14.5C6 17.5376 8.46243 20 11.5 20C14.5376 20 17 17.5376 17 14.5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 11C19.1046 11 20 11.8954 20 13V15.5C20 18.5376 17.5376 21 14.5 21H10.5C7.46243 21 5 18.5376 5 15.5V11C5 9.89543 5.89543 9 7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    <path d="M22 6L20 8M18 4L20 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Eco-bin (replaces 🗑️) — bin with recycle symbol
export const SvgEcoBin: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M19 6L18 20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 11V17M9 14L12 17L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Empty mailbox/queue (replaces 📭) — box with leaf
export const SvgEmptyMailbox: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M22 12V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M2 12L12 15L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
    <path d="M10 7C7 9 7 11 7 11C7 11 9 10 12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Eco-seed (replaces 🌱) — small sprout
export const SvgEcoSeed: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 11C12 11 12 7 16 7C16 7 17 11 12 11Z" fill="currentColor" opacity="0.2" />
    <path d="M12 11C12 11 12 7 16 7C16 7 17 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15C12 15 12 12 8 12C8 12 7 15 12 15Z" fill="currentColor" opacity="0.2" />
    <path d="M12 15C12 15 12 12 8 12C8 12 7 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Lock (replaces 🔒) — lock with eco accent
export const SvgLock: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

// Trophy (replaces 🏆) — eco trophy
export const SvgTrophy: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 9V7C6 5.89543 6.89543 5 8 5H16C17.1046 5 18 5.89543 18 7V9C18 12.3137 15.3137 15 12 15C8.68629 15 6 12.3137 6 9Z" stroke="currentColor" strokeWidth="2" />
    <path d="M6 7H4V10C4 11.1046 4.89543 12 6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 7H20V10C20 11.1046 19.1046 12 18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 9L13 11L15 11L13.5 12.5L14 14.5L12 13.5L10 14.5L10.5 12.5L9 11L11 11L12 9Z" fill="currentColor" />
  </svg>
);

// Eco-flame (replaces 🔥) — flame with leaf center
export const SvgEcoFlame: React.FC<VisualProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C12 2 15 6 15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10C5 6 8 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5 11C14.5 11 19 14 19 18C19 20.2091 17.2091 22 15 22C12.7909 22 11 20.2091 11 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <path d="M9.5 11C9.5 11 5 14 5 18C5 20.2091 6.79086 22 9 22C11.2091 22 13 20.2091 13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <path d="M12 11C10 13 10 15 10 15C10 15 12 14 14 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
