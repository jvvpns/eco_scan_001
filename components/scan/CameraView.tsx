import React from 'react';
import { IconBack, IconImageUpload } from '../Icons';
import ScannerTutorial from '../ScannerTutorial';
import { SvgTimer } from '../TutorialVisuals';

interface CameraViewProps {
  videoRef:              React.RefObject<HTMLVideoElement | null>;
  canvasRef:             React.RefObject<HTMLCanvasElement | null>;
  fileInputRef:          React.RefObject<HTMLInputElement | null>;
  cooldownLeft:          number;
  isCameraReady:         boolean;
  isCameraInitializing:  boolean;
  isCapturing:           boolean;
  error:                 string | null;
  onCapture:             () => void;
  onFileChange:          (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack:                () => void;
}

const CameraView: React.FC<CameraViewProps> = ({
  videoRef, canvasRef, fileInputRef,
  cooldownLeft, isCameraReady, isCameraInitializing, isCapturing, error,
  onCapture, onFileChange, onBack,
}) => (
  <div className="relative h-[100dvh] w-full bg-black overflow-hidden">
    <ScannerTutorial />
    
    {/* Top Back Button */}
    <div className="absolute top-0 left-0 p-4 pt-safe z-30">
      <button onClick={onBack} className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition shadow-lg">
        <IconBack size={24} color="white" />
      </button>
    </div>

    {/* Cooldown Timer */}
    {cooldownLeft > 0 && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 p-4 pt-safe z-30">
        <div className="bg-orange-500/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <SvgTimer size={14} />
          <span>Next scan in {cooldownLeft}s</span>
        </div>
      </div>
    )}

    {/* Full Screen Camera View */}
    <div className="absolute inset-0 z-0 bg-black flex justify-center items-center">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

      {/* Scanner Overlay Guide */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-72 h-72 border-2 border-white/40 rounded-[2rem] relative shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-[2rem]" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-[2rem]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-[2rem]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-[2rem]" />
        </div>
      </div>

      {isCapturing && <div className="absolute inset-0 bg-white opacity-80 animate-pulse z-20" />}
      {isCameraInitializing && !error && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
            <p className="text-white font-medium tracking-wide text-sm">Accessing camera...</p>
          </div>
        </div>
      )}
    </div>

    {/* Floating Bottom Controls */}
    <div className="absolute bottom-0 left-0 w-full px-6 pt-16 pb-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col items-center pb-safe">
      <p className="text-white/90 text-sm font-medium text-center mb-6 tracking-wide drop-shadow-md">
        Position waste item inside the frame
      </p>
      
      {error && <p className="text-red-400 text-center mb-4 text-sm font-medium bg-red-900/50 px-4 py-2 rounded-xl backdrop-blur-md">{error}</p>}

      <div className="flex w-full items-center justify-between max-w-sm">
        {/* Empty space for balance */}
        <div className="w-14 h-14" />
        
        {/* Capture Button */}
        <button
          onClick={onCapture}
          disabled={!isCameraReady || !!error || cooldownLeft > 0}
          className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md p-1.5 flex items-center justify-center transition-transform active:scale-90 shadow-xl disabled:opacity-40 border border-white/30"
          aria-label="Capture image"
        >
          {cooldownLeft > 0 ? (
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="text-black font-black text-xl">{cooldownLeft}</span>
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-white shadow-inner" />
          )}
        </button>
        
        {/* Library / Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={cooldownLeft > 0}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 disabled:opacity-40 transition-colors shadow-lg"
          aria-label="Upload from library"
        >
          <IconImageUpload size={24} color="white" />
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  </div>
);

export default CameraView;
