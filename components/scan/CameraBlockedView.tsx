import React from 'react';
import { SvgCameraBlocked } from '../TutorialVisuals';

interface CameraBlockedViewProps {
  onRetry:      () => void;
  onUpload:     () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const CameraBlockedView: React.FC<CameraBlockedViewProps> = ({
  onRetry, onUpload, onFileChange, fileInputRef,
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8 gap-5">
    <div className="w-20 h-20 rounded-full bg-red-900/40 flex items-center justify-center text-red-300">
      <SvgCameraBlocked size={40} />
    </div>
    <div className="text-center">
      <p className="text-white font-black text-xl">Camera Access Denied</p>
      <p className="text-gray-400 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
        Pilot needs camera access to classify waste items. Please enable it in your device settings and try again.
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
        onClick={onRetry}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all"
      >
        Try Again
      </button>
      <button
        onClick={onUpload}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-2xl active:scale-95 transition-all"
      >
        Upload from Gallery Instead
      </button>
    </div>
    <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
  </div>
);

export default CameraBlockedView;
