import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { VisualSparkle, SvgCloudQueue } from './TutorialVisuals';

const ReloadPrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 minutes
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  // Check for updates when user returns to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Checking for updates on tab focus...');
        // We can't easily get the registration object here without storing it, 
        // but useRegisterSW handles the registration.
        // Actually, the plugin's virtual module doesn't expose the registration easily outside onRegistered.
        // But we can just use the registration stored in the browser.
        navigator.serviceWorker?.ready.then(r => r.update());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  useEffect(() => {
    if (offlineReady) {
      console.log('App is ready to work offline');
    }
  }, [offlineReady]);

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/80 backdrop-blur-xl border border-green-100 shadow-2xl rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            {needRefresh ? (
              <span className="text-green-600"><VisualSparkle size={20} /></span>
            ) : (
              <span className="text-green-600"><SvgCloudQueue size={20} /></span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-green-900">
              {needRefresh ? 'New version available!' : 'Ready for offline use'}
            </h3>
            <p className="text-xs text-green-700 leading-relaxed">
              {needRefresh 
                ? 'A fresh update for Pilot is ready. Click update to get the latest features and fixes.' 
                : 'Pilot is now cached and will work even without an internet connection.'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <button
            onClick={close}
            className="px-4 py-2 text-xs font-semibold text-green-600 hover:bg-green-50 rounded-xl transition"
          >
            {needRefresh ? 'Later' : 'Close'}
          </button>
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-4 py-2 text-xs font-semibold bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 active:scale-95 transition-all"
            >
              Update Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReloadPrompt;
