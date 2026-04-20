import React, { useState, useRef, useEffect, useCallback } from 'react';
import { classifyAndScore, getCooldownSecondsLeft, startCooldown, makeThumbnail } from '../services/scanService';
import { startCamera, stopCamera, captureFrame } from '../services/cameraService';
import { useAuth } from '../hooks/useAuth';
import { useToast, ToastContainer } from './Toast';

// Sub-components
import CameraBlockedView from './scan/CameraBlockedView';
import CameraView from './scan/CameraView';
import CategoryPicker from './scan/CategoryPicker';
import ScanningView from './scan/ScanningView';
import ScanStatusView from './scan/ScanStatusView';
import ScanResultView from './scan/ScanResultView';

// ─── CONSTANTS ────────────────────────────────────────────────

const COOLDOWN_SECONDS  = 30;
const REDIRECT_SECONDS  = 5;

// ─── TYPES ────────────────────────────────────────────────────

type ScanStep = 'camera' | 'classify' | 'scanning' | 'result' | 'no_waste' | 'queued' | 'error_fallback';

interface ScanResult {
  isCorrect:           boolean;
  userAnswer:          string;
  aiAnswer:            string;
  itemName:            string;
  pointsEarned:        number;
  newlyUnlockedBadges: string[];
}

interface ScanPageProps {
  onScanComplete: () => void;
  onBack:         () => void;
}

// ─── CATEGORY CONFIG ──────────────────────────────────────────

const CATEGORIES = [
  { id: 'Residual',          label: 'Residual',          description: 'General waste that cannot be recycled',    color: 'bg-gray-500',   hover: 'hover:bg-gray-600' },
  { id: 'Special',           label: 'Special',           description: 'Hazardous or special handling required',   color: 'bg-red-500',    hover: 'hover:bg-red-600' },
  { id: 'Non-Biodegradable', label: 'Non-Biodegradable', description: 'Materials that do not decompose naturally', color: 'bg-orange-500', hover: 'hover:bg-orange-600' },
  { id: 'Biodegradable',     label: 'Biodegradable',     description: 'Organic materials that decompose naturally',color: 'bg-green-500',  hover: 'hover:bg-green-600' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────

const ScanPage: React.FC<ScanPageProps> = ({ onScanComplete, onBack }) => {
  const { user, refreshStats } = useAuth();

  // ── State ─────────────────────────────────────────────────
  const [step, setStep]                       = useState<ScanStep>('camera');
  const [imagePreview, setImagePreview]       = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scanResult, setScanResult]           = useState<ScanResult | null>(null);
  const [error, setError]                     = useState<string | null>(null);
  const [isCameraInitializing, setIsCameraInitializing] = useState(true);
  const [isCameraReady, setIsCameraReady]     = useState(false);
  const [isCapturing, setIsCapturing]         = useState(false);
  const [showBadgeAnim, setShowBadgeAnim]     = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(REDIRECT_SECONDS);
  const [cooldownLeft, setCooldownLeft]       = useState(0);
  const [cameraBlocked, setCameraBlocked]     = useState(false);

  // ── Refs ──────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const streamRef    = useRef<MediaStream | null>(null);

  const { toasts, showToast, dismissToast } = useToast();

  // ── Cooldown ticker ───────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const tick = () => setCooldownLeft(getCooldownSecondsLeft(user.uid));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [user]);

  // ── Camera lifecycle ──────────────────────────────────────
  const handleStopCamera = useCallback(() => {
    stopCamera(streamRef.current, videoRef.current ?? undefined);
    streamRef.current = null;
    setIsCameraReady(false);
  }, []);

  useEffect(() => {
    if (step !== 'camera' || imagePreview) { handleStopCamera(); return; }

    let mounted = true;
    setIsCameraInitializing(true);
    setError(null);

    (async () => {
      if (!videoRef.current) return;
      const cameraResult = await startCamera(videoRef.current);

      if (!mounted) {
        if (cameraResult.success === true) {
          stopCamera(cameraResult.stream);
        }
        return;
      }

      if (cameraResult.success === true) {
        streamRef.current = cameraResult.stream;
        setIsCameraReady(true);
      } else if (cameraResult.success === false) {
        setError(cameraResult.message);
        if (cameraResult.errorType === 'permission_denied') setCameraBlocked(true);
      }
      setIsCameraInitializing(false);
    })();

    return () => {
      mounted = false;
      handleStopCamera();
    };
  }, [step, imagePreview, handleStopCamera]);

  // ── Auto-redirect after result ────────────────────────────
  useEffect(() => {
    if (step !== 'result') return;

    if (scanResult?.newlyUnlockedBadges.length) {
      setShowBadgeAnim(scanResult.newlyUnlockedBadges[0]);
      setTimeout(() => setShowBadgeAnim(null), 2500);
    }

    setRedirectCountdown(REDIRECT_SECONDS);
    const interval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onScanComplete(); // Navigate to Dashboard and trigger refresh
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, scanResult, onScanComplete]);

  // ── Capture ───────────────────────────────────────────────
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;
    setIsCapturing(true);
    const dataUrl = captureFrame(videoRef.current, canvasRef.current);
    if (dataUrl) {
      setImagePreview(dataUrl);
      handleStopCamera();
      setStep('classify');
    }
    setTimeout(() => setIsCapturing(false), 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleStopCamera();
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => { setImagePreview(reader.result as string); setStep('classify'); };
    reader.readAsDataURL(file);
  };

  // ── Category selection + scan ─────────────────────────────
  const handleCategorySelect = async (categoryId: string) => {
    if (!imagePreview || !user) return;

    setSelectedCategory(categoryId);
    setStep('scanning');
    setError(null);

    try {
      const thumbnail = await makeThumbnail(imagePreview);
      const result = await classifyAndScore(imagePreview, categoryId, thumbnail);

      if (result.queued) {
        showToast('No internet — scan saved. It will be processed when you\'re back online.', 'info');
        setStep('queued');
        return;
      }

      if (result.noWasteDetected) {
        setStep('no_waste');
        return;
      }

      startCooldown(user.uid);
      setCooldownLeft(COOLDOWN_SECONDS);
      await refreshStats();
      // Note: onScanComplete() is called after the result screen
      // auto-redirect countdown ends (see useEffect above)

      setScanResult({
        isCorrect:           result.isCorrect,
        userAnswer:          categoryId,
        aiAnswer:            result.aiAnswer ?? '',
        itemName:            result.itemName,
        pointsEarned:        result.pointsEarned,
        newlyUnlockedBadges: result.newlyUnlockedBadges,
      });
      setStep('result');
    } catch (err: any) {
      console.error('Scan Error:', err);
      setError(err instanceof Error ? err.message : 'AI scan failed');
      setStep('error_fallback');
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

  // ─── RENDERING ────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-[#f8fafc]">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {step === 'camera' && (
        cameraBlocked ? (
          <CameraBlockedView 
            onRetry={() => { setCameraBlocked(false); setError(null); }}
            onUpload={() => fileInputRef.current?.click()}
            onFileChange={handleFileChange}
            fileInputRef={fileInputRef}
          />
        ) : (
          <CameraView 
            videoRef={videoRef}
            canvasRef={canvasRef}
            fileInputRef={fileInputRef}
            cooldownLeft={cooldownLeft}
            isCameraReady={isCameraReady}
            isCameraInitializing={isCameraInitializing}
            isCapturing={isCapturing}
            error={error}
            onCapture={handleCapture}
            onFileChange={handleFileChange}
            onBack={onBack}
          />
        )
      )}

      {step === 'classify' && (
        <CategoryPicker 
          imagePreview={imagePreview}
          error={error}
          categories={CATEGORIES}
          onSelect={handleCategorySelect}
          onBack={resetScan}
        />
      )}

      {step === 'scanning' && (
        <ScanningView 
          imagePreview={imagePreview}
          selectedCategory={selectedCategory}
        />
      )}

      {(step === 'queued' || step === 'error_fallback' || step === 'no_waste') && (
        <ScanStatusView 
          status={step}
          imagePreview={imagePreview}
          selectedCategory={selectedCategory}
          error={error}
          onReset={resetScan}
          onRetry={() => selectedCategory && handleCategorySelect(selectedCategory)}
          onBack={onBack}
        />
      )}

      {step === 'result' && scanResult && (
        <ScanResultView 
          scanResult={scanResult}
          image={imagePreview}
          showBadgeAnim={showBadgeAnim}
          redirectCountdown={redirectCountdown}
          cooldownSeconds={COOLDOWN_SECONDS}
          onScanComplete={onScanComplete}
        />
      )}
    </div>
  );
};

export default ScanPage;