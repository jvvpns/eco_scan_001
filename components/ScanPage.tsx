import React, { useState, useRef, useEffect, useCallback } from 'react';
import { identifyGarbage } from '../services/geminiService';
import { processScanResult, BADGES } from '../services/gamificationService';
import { saveScanRecord } from '../services/firestoreService';
import { IconBack, IconUploadAvatar } from './Icons';
import { useAuth } from '../hooks/useAuth';
import { useToast, ToastContainer } from './Toast';

// ─── CONSTANTS ────────────────────────────────────────────────

const COOLDOWN_SECONDS = 30;
const REDIRECT_SECONDS = 5;

// ─── TYPES ────────────────────────────────────────────────────

type ScanStep = 'camera' | 'classify' | 'scanning' | 'result' | 'no_waste';

interface ScanResult {
  isCorrect: boolean;
  userAnswer: string;
  aiAnswer: string;
  itemName: string;
  pointsEarned: number;
  newlyUnlockedBadges: string[];
}

interface ScanPageProps {
  onScanComplete: () => void;
  onBack: () => void;
}

// ─── CATEGORY CONFIG ──────────────────────────────────────────

const CATEGORIES = [
  { id: 'Residual',          label: 'Residual',          description: 'General waste that cannot be recycled',    color: 'bg-gray-500',   hover: 'hover:bg-gray-600'   },
  { id: 'Special',           label: 'Special',           description: 'Hazardous or special handling required',   color: 'bg-red-500',    hover: 'hover:bg-red-600'    },
  { id: 'Non-Biodegradable', label: 'Non-Biodegradable', description: 'Materials that do not decompose naturally', color: 'bg-orange-500', hover: 'hover:bg-orange-600' },
  { id: 'Biodegradable',     label: 'Biodegradable',     description: 'Organic materials that decompose naturally',color: 'bg-green-500',  hover: 'hover:bg-green-600'  },
];

// ─── COOLDOWN HELPERS ─────────────────────────────────────────
// Stored in localStorage so cooldown survives page navigation

const getCooldownKey = (userId: string) => `ecoscan_cooldown_${userId}`;

const getCooldownSecondsLeft = (userId: string): number => {
  try {
    const stored = localStorage.getItem(getCooldownKey(userId));
    if (!stored) return 0;
    const expiresAt = parseInt(stored, 10);
    const left = Math.ceil((expiresAt - Date.now()) / 1000);
    return left > 0 ? left : 0;
  } catch { return 0; }
};

const startCooldown = (userId: string) => {
  try {
    localStorage.setItem(getCooldownKey(userId), String(Date.now() + COOLDOWN_SECONDS * 1000));
  } catch {}
};

// ─── IMAGE COMPRESSION ────────────────────────────────────────

const compressImage = (dataUrl: string, maxSize = 120): string => {
  try {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = dataUrl;
    const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    canvas.width  = Math.round(img.width  * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.6);
  } catch { return dataUrl; }
};

// ─── MAIN COMPONENT ───────────────────────────────────────────

const ScanPage: React.FC<ScanPageProps> = ({ onScanComplete, onBack }) => {
  const { user, unlockedBadgeIds, refreshStats } = useAuth();

  const [step, setStep]                   = useState<ScanStep>('camera');
  const [imagePreview, setImagePreview]   = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scanResult, setScanResult]       = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [isCameraInitializing, setIsCameraInitializing] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing]     = useState(false);
  const [showBadgeAnim, setShowBadgeAnim] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(REDIRECT_SECONDS);
  const [cooldownLeft, setCooldownLeft]   = useState(0);
  const [cameraBlocked, setCameraBlocked] = useState(false);

  const { toasts, showToast, dismissToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const streamRef    = useRef<MediaStream | null>(null);

  // ── Cooldown ticker ───────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const tick = () => setCooldownLeft(getCooldownSecondsLeft(user.uid));
    tick(); // immediate
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [user]);

  // ── Camera ────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setIsCameraReady(false);
    }
  }, []);

  useEffect(() => {
    if (step !== 'camera' || imagePreview) { stopCamera(); return; }

    const startCamera = async () => {
      setIsCameraInitializing(true);
      setIsCameraReady(false);
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraReady(true); }
      } catch {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraReady(true); }
        } catch {
          setError('Could not access camera. Please ensure permissions are granted.');
          setCameraBlocked(true);
        }
      } finally {
        setIsCameraInitializing(false);
      }
    };

    startCamera();
    return () => stopCamera();
  }, [step, imagePreview, stopCamera]);

  // ── Auto-redirect after result ────────────────────────────
  useEffect(() => {
    if (step !== 'result') return;

    if (scanResult?.newlyUnlockedBadges.length) {
      const badgeId = scanResult.newlyUnlockedBadges[0];
      setShowBadgeAnim(badgeId);
      setTimeout(() => setShowBadgeAnim(null), 2500);
    }

    setRedirectCountdown(REDIRECT_SECONDS);
    const interval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); onBack(); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // ── Handlers ──────────────────────────────────────────────
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;
    setIsCapturing(true);
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setImagePreview(canvas.toDataURL('image/jpeg'));
      stopCamera();
      setStep('classify');
    }
    setTimeout(() => setIsCapturing(false), 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => { setImagePreview(reader.result as string); setStep('classify'); };
    reader.readAsDataURL(file);
  };

  const handleCategorySelect = async (categoryId: string) => {
    if (!imagePreview || !user) return;

    setSelectedCategory(categoryId);
    setStep('scanning');
    setIsLoading(true);
    setError(null);

    try {
      // 1. Call Gemini
      const base64Data = imagePreview.split(',')[1];
      const result = await identifyGarbage(base64Data);

      // 2. No waste detected — skip scoring, show retry screen
      if (result.noWasteDetected) {
        setStep('no_waste');
        return;
      }

      const aiAnswer  = result.garbageType;
      const isCorrect = categoryId.toLowerCase() === aiAnswer.toLowerCase();

      // 3. Gamification
      const { pointsEarned, newlyUnlockedBadges } =
        await processScanResult(user.uid, isCorrect, unlockedBadgeIds ?? []);

      // 4. Save to Firestore
      const thumbnail = compressImage(imagePreview, 120);
      await saveScanRecord(user.uid, user.displayName ?? 'Anonymous', {
        itemName:  result.itemName ?? 'Unknown Item',
        userAnswer: categoryId,
        aiAnswer,
        isCorrect,
        pointsEarned,
        imageUrl:  thumbnail,
      });

      // 5. Start cooldown AFTER successful scan
      startCooldown(user.uid);
      setCooldownLeft(COOLDOWN_SECONDS);

      // 6. Refresh stats & signal completion
      await refreshStats();
      onScanComplete();

      setScanResult({ isCorrect, userAnswer: categoryId, aiAnswer, itemName: result.itemName, pointsEarned, newlyUnlockedBadges });
      setStep('result');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'AI scan failed. Please try again.', 'error');
      setStep('classify');
    } finally {
      setIsLoading(false);
    }
  };

  const resetScan = () => {
    setImagePreview(null);
    setSelectedCategory(null);
    setScanResult(null);
    setError(null);
    setStep('camera');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── RENDER: CAMERA ───────────────────────────────────────

  if (step === 'camera') {
    // ── Full-screen fallback: camera permanently blocked ──
    if (cameraBlocked) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8 gap-5">
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
          <div className="w-20 h-20 rounded-full bg-red-900/40 flex items-center justify-center">
            <span className="text-4xl">📷</span>
          </div>
          <div className="text-center">
            <p className="text-white font-black text-xl">Camera Access Denied</p>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
              EcoScan needs camera access to classify waste items. Please enable it in your device settings and try again.
            </p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 w-full max-w-sm">
            <p className="text-gray-300 font-bold text-xs mb-2">How to fix:</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• iOS: Settings → Safari → Camera → Allow</li>
              <li>• Android: Settings → Apps → Browser → Permissions</li>
              <li>• Chrome: Click 🔒 in address bar → Camera → Allow</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={() => { setCameraBlocked(false); setError(null); }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-2xl active:scale-95 transition-all"
            >
              Upload from Gallery Instead
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-black min-h-screen">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <div className="absolute top-4 left-4 z-20">
          <button onClick={onBack} className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
            <IconBack size={24} color="white" />
          </button>
        </div>

        {/* Cooldown banner */}
        {cooldownLeft > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <span>⏱️</span>
            <span>Next scan in {cooldownLeft}s</span>
          </div>
        )}

        <div className="flex-1 relative flex justify-center items-center overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

          {/* Scan frame overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-white/60 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />
            </div>
          </div>

          {isCapturing && <div className="absolute inset-0 bg-white opacity-70 animate-pulse" />}
          {isCameraInitializing && !error && (
            <div className="absolute inset-0 flex justify-center items-center bg-black/50">
              <p className="text-white text-sm font-semibold">Starting camera...</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/30">
          <p className="text-white/60 text-xs text-center mb-3">
            Position waste item inside the frame
          </p>
          {error && <p className="text-red-400 text-center mb-4 text-sm font-medium">{error}</p>}

          <div className="flex w-full items-center justify-around">
            <div className="w-16 h-16" />
            {/* Capture button — disabled during cooldown */}
            <button
              onClick={handleCapture}
              disabled={!isCameraReady || !!error || cooldownLeft > 0}
              className="w-20 h-20 rounded-full bg-white p-1 flex items-center justify-center transition-transform active:scale-90 shadow-lg disabled:opacity-40"
              aria-label="Capture image"
            >
              {cooldownLeft > 0 ? (
                <div className="w-full h-full rounded-full border-4 border-orange-400 flex items-center justify-center">
                  <span className="text-orange-500 font-black text-lg">{cooldownLeft}</span>
                </div>
              ) : (
                <div className="w-full h-full rounded-full border-4 border-black" />
              )}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={cooldownLeft > 0}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-700/50 hover:bg-gray-700/70 disabled:opacity-40"
              aria-label="Upload from library"
            >
              <IconUploadAvatar size={28} color="white" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    );
  }

  // ─── RENDER: CLASSIFY ─────────────────────────────────────

  if (step === 'classify') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
          <button onClick={resetScan} className="p-2 rounded-full hover:bg-gray-100 transition">
            <IconBack size={24} color="#374151" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Choose a Category</h2>
            <p className="text-sm text-gray-500">What type of waste is this?</p>
          </div>
        </div>

        {imagePreview && (
          <div className="mx-4 mt-4 rounded-xl overflow-hidden h-44 bg-black shadow-md">
            <img src={imagePreview} alt="Captured item" className="w-full h-full object-contain" />
          </div>
        )}

        {error && <p className="text-red-500 text-center mx-4 mt-3 text-sm font-medium">{error}</p>}

        <div className="flex flex-col gap-3 p-4 mt-2">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => handleCategorySelect(cat.id)}
              className={`${cat.color} ${cat.hover} text-white rounded-xl py-4 px-5 text-left transition-transform active:scale-95 shadow-md`}>
              <p className="font-bold text-base">{cat.label}</p>
              <p className="text-sm opacity-80 mt-0.5">{cat.description}</p>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">
          🎯 Match your selection with the AI scanner to earn points!
        </p>
      </div>
    );
  }

  // ─── RENDER: SCANNING ─────────────────────────────────────

  if (step === 'scanning') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-6 p-8">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-500" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">♻️</span>
        </div>
        <div className="text-center">
          <p className="text-gray-800 text-lg font-bold">AI is analyzing...</p>
          <p className="text-gray-500 text-sm mt-1">Comparing with your selection</p>
        </div>
        {imagePreview && (
          <div className="w-40 h-40 rounded-xl overflow-hidden shadow-md">
            <img src={imagePreview} alt="Scanning" className="w-full h-full object-contain bg-black" />
          </div>
        )}
        {selectedCategory && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
            <p className="text-xs text-gray-500 text-center">Your Selection</p>
            <p className="font-bold text-blue-600 text-center">{selectedCategory}</p>
          </div>
        )}
      </div>
    );
  }

  // ─── RENDER: NO WASTE DETECTED ────────────────────────────

  if (step === 'no_waste') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-5 p-8">
        <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center">
          <span className="text-5xl">🔍</span>
        </div>

        <div className="text-center">
          <p className="text-gray-900 text-2xl font-black">No Waste Found</p>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
            The AI couldn't identify a waste item in the image. Make sure the item is clearly visible and centered in the frame.
          </p>
        </div>

        {imagePreview && (
          <div className="w-40 h-40 rounded-xl overflow-hidden shadow-md border border-gray-200">
            <img src={imagePreview} alt="No waste detected" className="w-full h-full object-contain bg-black" />
          </div>
        )}

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 w-full max-w-sm">
          <p className="text-yellow-800 font-bold text-sm mb-2">💡 Tips for better results</p>
          <ul className="text-yellow-700 text-xs space-y-1">
            <li>• Hold the item close to the camera</li>
            <li>• Ensure good lighting</li>
            <li>• Center the item in the frame</li>
            <li>• Avoid blurry or dark images</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button onClick={resetScan}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-sm">
            📷 Try Again
          </button>
          <button onClick={onBack}
            className="w-full bg-white border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl active:scale-95 transition-all">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── RENDER: RESULT ───────────────────────────────────────

  if (step === 'result' && scanResult) {
    const { isCorrect, userAnswer, aiAnswer, itemName, pointsEarned, newlyUnlockedBadges } = scanResult;
    const unlockedBadge = newlyUnlockedBadges.length ? BADGES.find(b => b.id === newlyUnlockedBadges[0]) : null;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 gap-5 relative overflow-hidden">

        {/* Badge unlock overlay */}
        {showBadgeAnim && unlockedBadge && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 shadow-2xl">
              <p className="text-5xl">{unlockedBadge.icon}</p>
              <p className="text-yellow-500 font-extrabold text-xl">Badge Unlocked!</p>
              <p className="font-bold text-gray-800 text-lg">{unlockedBadge.name}</p>
              <p className="text-gray-500 text-sm text-center">{unlockedBadge.description}</p>
            </div>
          </div>
        )}

        {/* Result icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <span className="text-4xl">{isCorrect ? '✅' : '❌'}</span>
        </div>

        {/* Verdict */}
        <div className="text-center">
          <p className={`text-2xl font-extrabold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
            {isCorrect ? 'Correct! 🎉' : 'Not quite right'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {isCorrect ? `You've earned ${pointsEarned} points!` : "Don't worry, keep learning!"}
          </p>
          {itemName && (
            <p className="text-gray-400 text-xs mt-1 italic">"{itemName}"</p>
          )}
        </div>

        {/* Answer comparison */}
        <div className="flex gap-3 w-full">
          <div className={`flex-1 rounded-xl p-4 text-center border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-xs text-gray-500 mb-1">Your Answer</p>
            <p className="font-bold text-gray-800 text-sm">{userAnswer}</p>
          </div>
          <div className="flex-1 rounded-xl p-4 text-center bg-blue-50 border border-blue-200">
            <p className="text-xs text-gray-500 mb-1">AI Classification</p>
            <p className="font-bold text-blue-600 text-sm">{aiAnswer}</p>
          </div>
        </div>

        {/* Tip on wrong answer */}
        {!isCorrect && (
          <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
            <p className="text-sm text-gray-600 text-center">
              💡 <span className="font-medium">Tip:</span> The correct category for this item is{' '}
              <span className="text-blue-600 font-semibold">{aiAnswer}</span>
            </p>
          </div>
        )}

        {/* Badge unlocked note */}
        {newlyUnlockedBadges.length > 0 && !showBadgeAnim && (
          <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-center">
            <p className="text-sm font-bold text-yellow-700">
              🏅 Badge Unlocked: {BADGES.find(b => b.id === newlyUnlockedBadges[0])?.name}
            </p>
          </div>
        )}

        {/* Cooldown notice */}
        <div className="w-full bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-center">
          <p className="text-orange-600 text-xs font-semibold">
            ⏱️ Next scan available in {COOLDOWN_SECONDS}s
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-gray-100 rounded-full px-6 py-2">
          <p className="text-gray-700 font-semibold text-sm">
            Returning to Dashboard in {redirectCountdown}s...
          </p>
        </div>

        {/* Manual back button */}
        <button onClick={onBack}
          className="text-gray-400 text-xs underline underline-offset-2 hover:text-gray-600 transition">
          Go now
        </button>
      </div>
    );
  }

  return null;
};

export default ScanPage;