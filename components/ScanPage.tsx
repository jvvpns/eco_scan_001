import React, { useState, useRef, useEffect, useCallback } from 'react';
import { identifyGarbage } from '../services/geminiService';
import { processScanResult, BADGES } from '../services/gamificationService';
import { saveScanRecord } from '../services/firestoreService';
import { IconCamera, IconArrowLeft, IconUpload, IconRecycle, IconTrash } from './Icons';
import { GarbageType } from '../types';
import { useAuth } from '../hooks/useAuth';

// ─── TYPES ────────────────────────────────────────────────────

type ScanStep = 'camera' | 'classify' | 'scanning' | 'result';

interface ScanResult {
  isCorrect: boolean;
  userAnswer: string;
  aiAnswer: string;
  pointsEarned: number;
  newlyUnlockedBadges: string[];
}

interface ScanPageProps {
  onScanComplete: () => void;  // just signals completion; data is in Firestore
  onBack: () => void;
}

// ─── CATEGORY CONFIG ──────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'Residual',
    label: 'Residual',
    description: 'General waste that cannot be recycled',
    color: 'bg-gray-500',
    hoverColor: 'hover:bg-gray-600',
  },
  {
    id: 'Special',
    label: 'Special',
    description: 'Hazardous or special handling required',
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
  },
  {
    id: 'Non-Biodegradable',
    label: 'Non-Biodegradable',
    description: 'Materials that do not decompose naturally',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
  },
  {
    id: 'Biodegradable',
    label: 'Biodegradable',
    description: 'Organic materials that decompose naturally',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
  },
];

// ─── IMAGE COMPRESSION ────────────────────────────────────────
// Resizes a base64 image to a small thumbnail for Firestore storage

const compressImage = (dataUrl: string, maxSize: number = 120): string => {
  try {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = dataUrl;
    const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.6);
  } catch {
    return dataUrl;
  }
};

// ─── MAIN COMPONENT ───────────────────────────────────────────

const ScanPage: React.FC<ScanPageProps> = ({ onScanComplete, onBack }) => {
  const { user, unlockedBadgeIds, refreshStats } = useAuth(); // ← added refreshStats

  const [step, setStep] = useState<ScanStep>('camera');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraInitializing, setIsCameraInitializing] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showBadgeAnim, setShowBadgeAnim] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ─── CAMERA ─────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraReady(false);
    }
  }, []);

  useEffect(() => {
    if (step !== 'camera' || imagePreview) {
      stopCamera();
      return;
    }

    const startCamera = async () => {
      setIsCameraInitializing(true);
      setIsCameraReady(false);
      setError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraReady(true);
          }
        } catch {
          setError('Could not access camera. Please ensure permissions are granted.');
        }
      } finally {
        setIsCameraInitializing(false);
      }
    };

    startCamera();
    return () => stopCamera();
  }, [step, imagePreview, stopCamera]);

  // ─── AUTO REDIRECT AFTER RESULT ─────────────────────────────

  useEffect(() => {
    if (step !== 'result') return;

    if (scanResult?.newlyUnlockedBadges.length) {
      const badgeId = scanResult.newlyUnlockedBadges[0];
      setShowBadgeAnim(badgeId);
      setTimeout(() => setShowBadgeAnim(null), 2500);
    }

    setRedirectCountdown(3);
    const interval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // ─── HANDLERS ───────────────────────────────────────────────

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        stopCamera();
        setStep('classify');
      }
      setTimeout(() => setIsCapturing(false), 100);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      stopCamera();
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setStep('classify');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    if (!imagePreview || !user) return;

    setSelectedCategory(categoryId);
    setStep('scanning');
    setIsLoading(true);
    setError(null);

    try {
      // 1. Call Gemini to classify
      const base64Data = imagePreview.split(',')[1];
      const result = await identifyGarbage(base64Data);

      const aiAnswer = result.garbageType;
      const isCorrect = categoryId.toLowerCase() === aiAnswer.toLowerCase();

      // 2. Process gamification (points, streak, badges, missions)
      const { pointsEarned, newlyUnlockedBadges } =
        await processScanResult(user.uid, isCorrect, unlockedBadgeIds ?? []);

      // 3. Save scan record to Firestore (with item name + compressed thumbnail)
      const thumbnail = compressImage(imagePreview, 120);
      await saveScanRecord(user.uid, user.displayName ?? 'Anonymous', {
        itemName: result.itemName ?? 'Unknown Item',
        userAnswer: categoryId,
        aiAnswer,
        isCorrect,
        pointsEarned,
        imageUrl: thumbnail,
      });

      // 4. Refresh dashboard stats live ← NEW
      await refreshStats();

      // 5. Signal completion to App (data is already in Firestore)
      onScanComplete();

      setScanResult({
        isCorrect,
        userAnswer: categoryId,
        aiAnswer,
        pointsEarned,
        newlyUnlockedBadges,
      });

      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
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

  // ─── RENDER ─────────────────────────────────────────────────

  // STEP: CAMERA
  if (step === 'camera') {
    return (
      <div className="flex flex-col h-full bg-black">
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-black bg-opacity-40 text-white hover:bg-opacity-60 transition"
          >
            <IconArrowLeft className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 relative flex justify-center items-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isCapturing && (
            <div className="absolute inset-0 bg-white opacity-70 animate-pulse" />
          )}
          {isCameraInitializing && !error && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
              <p className="text-white">Starting camera...</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-black bg-opacity-30">
          {error && <p className="text-red-400 text-center mb-4 font-medium">{error}</p>}
          <div className="flex w-full items-center justify-around">
            <div className="w-16 h-16" />
            <button
              onClick={handleCapture}
              disabled={!isCameraReady || !!error}
              className="w-20 h-20 rounded-full bg-white p-1 flex items-center justify-center transition-transform transform active:scale-90 shadow-lg disabled:opacity-50"
              aria-label="Capture image"
            >
              <div className="w-full h-full rounded-full border-4 border-black" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-700 bg-opacity-50 hover:bg-opacity-70"
              aria-label="Upload from library"
            >
              <IconUpload className="h-7 w-7 text-white" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    );
  }

  // STEP: CLASSIFY
  if (step === 'classify') {
    return (
      <div className="flex flex-col min-h-full bg-gray-50">
        <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
          <button
            onClick={resetScan}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <IconArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Choose a Category</h2>
            <p className="text-sm text-gray-500">What type of waste is this?</p>
          </div>
        </div>

        {imagePreview && (
          <div className="mx-4 mt-4 rounded-xl overflow-hidden h-40 bg-black">
            <img src={imagePreview} alt="Captured item" className="w-full h-full object-contain" />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-center mx-4 mt-3 text-sm font-medium">{error}</p>
        )}

        <div className="flex flex-col gap-3 p-4 mt-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`${cat.color} ${cat.hoverColor} text-white rounded-xl py-4 px-5 text-left transition-transform active:scale-95 shadow-md`}
            >
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

  // STEP: SCANNING
  if (step === 'scanning') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-gray-50 gap-6 p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500" />
        <div className="text-center">
          <p className="text-gray-800 text-lg font-semibold">AI is analyzing...</p>
          <p className="text-gray-500 text-sm mt-1">Comparing with your selection</p>
        </div>
        {imagePreview && (
          <div className="w-40 h-40 rounded-xl overflow-hidden shadow-md">
            <img src={imagePreview} alt="Scanning" className="w-full h-full object-contain bg-black" />
          </div>
        )}
        {selectedCategory && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
            <p className="text-sm text-gray-500 text-center">Your Selection</p>
            <p className="font-bold text-blue-600 text-center">{selectedCategory}</p>
          </div>
        )}
      </div>
    );
  }

  // STEP: RESULT
  if (step === 'result' && scanResult) {
    const { isCorrect, userAnswer, aiAnswer, pointsEarned, newlyUnlockedBadges } = scanResult;
    const unlockedBadge = newlyUnlockedBadges.length
      ? BADGES.find(b => b.id === newlyUnlockedBadges[0])
      : null;

    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-white p-6 gap-5 relative">

        {showBadgeAnim && unlockedBadge && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70 animate-fade-in">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 shadow-2xl animate-bounce-in">
              <p className="text-4xl">{unlockedBadge.icon}</p>
              <p className="text-yellow-500 font-extrabold text-xl">Badge Unlocked!</p>
              <p className="font-bold text-gray-800 text-lg">{unlockedBadge.name}</p>
              <p className="text-gray-500 text-sm text-center">{unlockedBadge.description}</p>
            </div>
          </div>
        )}

        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <span className="text-4xl">{isCorrect ? '✅' : '❌'}</span>
        </div>

        <div className="text-center">
          <p className={`text-2xl font-extrabold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
            {isCorrect ? 'Correct! 🎉' : 'Not quite right'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {isCorrect ? `You've earned ${pointsEarned} points!` : "Don't worry, keep learning!"}
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <div className={`flex-1 rounded-xl p-4 text-center border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-xs text-gray-500 mb-1">Your Answer</p>
            <p className="font-bold text-gray-800">{userAnswer}</p>
          </div>
          <div className="flex-1 rounded-xl p-4 text-center bg-blue-50 border border-blue-200">
            <p className="text-xs text-gray-500 mb-1">AI Classification</p>
            <p className="font-bold text-blue-600">{aiAnswer}</p>
          </div>
        </div>

        {!isCorrect && (
          <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
            <p className="text-sm text-gray-600 text-center">
              💡 <span className="font-medium">Tip:</span> The correct category for this item is{' '}
              <span className="text-blue-600 font-semibold">{aiAnswer}</span>
            </p>
          </div>
        )}

        {newlyUnlockedBadges.length > 0 && !showBadgeAnim && (
          <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-center">
            <p className="text-sm font-bold text-yellow-700">
              🏅 Badge Unlocked: {BADGES.find(b => b.id === newlyUnlockedBadges[0])?.name}
            </p>
          </div>
        )}

        <div className="bg-gray-100 rounded-full px-6 py-2">
          <p className="text-gray-700 font-semibold text-sm">
            Returning to Dashboard in {redirectCountdown}s...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default ScanPage;