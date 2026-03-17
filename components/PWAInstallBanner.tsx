import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ─── PILOT ICON ────────
const PilotIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <img 
    src="/icons/icon-192x192.png" 
    alt="Pilot Logo" 
    width={size} 
    height={size} 
    style={{ objectFit: 'contain' }}
  />
);

// ─── CLOSE ICON ────────────────────────────────────────────────
const CloseIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 6L18 18M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── DOWNLOAD / INSTALL ICON ───────────────────────────────────
const InstallIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3V15M12 15L8 11M12 15L16 11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 17V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── COMPONENT ────────────────────────────────────────────────
const PWAInstallBanner: React.FC = () => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible]           = useState(false);
  const [installed, setInstalled]       = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-banner-dismissed', '1');
    setVisible(false);
  };

  if (!visible || installed) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-4 flex items-center gap-3">

        {/* App icon — uses inline SVG from icon system */}
        <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0 shadow-sm shadow-green-200">
          <PilotIcon size={28} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-800 text-sm leading-tight">
            Add Pilot to Home Screen
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            Install for the best experience
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-600 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <InstallIcon />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-400 text-xs font-semibold px-3 py-1 rounded-lg hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
          >
            <CloseIcon />
            Not now
          </button>
        </div>

      </div>
    </div>
  );
};

export default PWAInstallBanner;