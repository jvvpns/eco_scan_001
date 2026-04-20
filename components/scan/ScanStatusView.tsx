import React from 'react';
import { SvgCloudQueue, SvgCameraInline, SvgWarning, SvgRetry, SvgSearchLeaf, SvgLeafBulb } from '../TutorialVisuals';

interface ScanStatusViewProps {
  status: 'queued' | 'error_fallback' | 'no_waste';
  imagePreview: string | null;
  selectedCategory: string | null;
  error: string | null;
  onReset: () => void;
  onRetry: () => void;
  onBack: () => void;
}

const ScanStatusView: React.FC<ScanStatusViewProps> = ({
  status,
  imagePreview,
  selectedCategory,
  error,
  onReset,
  onRetry,
  onBack,
}) => {
  if (status === 'queued') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] gap-5 p-8">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
          <SvgCloudQueue size={48} />
        </div>
        <div className="text-center">
          <p className="text-gray-900 text-2xl font-black">Scan Queued</p>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
            You're offline. Your scan has been saved and will be processed automatically when your internet connection returns.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button onClick={onReset}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2">
            <SvgCameraInline size={18} /> Scan Another Item
          </button>
          <button onClick={onBack}
            className="w-full bg-white border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl active:scale-95 transition-all">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error_fallback') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] gap-5 p-8">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-red-500">
          <SvgWarning size={48} />
        </div>
        <div className="text-center">
          <p className="text-gray-900 text-2xl font-black">AI Scan Interrupted</p>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
            We encountered a temporary server glitch while analyzing the image.
          </p>
          {error && (
            <p className="text-red-500 text-[10px] font-bold uppercase mt-2 bg-red-50 px-3 py-1 rounded-full inline-block">
              {error}
            </p>
          )}
        </div>
        
        {imagePreview && (
          <div className="w-32 h-32 rounded-xl overflow-hidden shadow-md border-2 border-white relative">
            <img src={imagePreview} alt="Retry preview" className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur-sm py-1">
              <p className="text-[10px] font-black text-white text-center uppercase tracking-wider">
                {selectedCategory}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-sm mt-2">
          <button 
            onClick={onRetry}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <SvgRetry size={18} /> Retry Scan
          </button>
          <button onClick={onReset}
            className="w-full bg-white border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl active:scale-95 transition-all">
            Start New Scan
          </button>
        </div>
      </div>
    );
  }

  if (status === 'no_waste') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-5 p-8">
        <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
          <SvgSearchLeaf size={48} />
        </div>
        <div className="text-center">
          <p className="text-gray-900 text-2xl font-black">No Waste Found</p>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
            The AI couldn't identify a waste item in the image. Make sure the item is clearly visible and centred in the frame.
          </p>
        </div>
        {imagePreview && (
          <div className="w-40 h-40 rounded-xl overflow-hidden shadow-md border border-gray-200">
            <img src={imagePreview} alt="No waste detected" className="w-full h-full object-contain bg-black" />
          </div>
        )}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 w-full max-w-sm">
          <p className="text-yellow-800 font-bold text-sm mb-2 flex items-center gap-1.5"><SvgLeafBulb size={16} className="text-yellow-700" /> Tips for better results</p>
          <ul className="text-yellow-700 text-xs space-y-1">
            <li>• Hold the item close to the camera</li>
            <li>• Ensure good lighting</li>
            <li>• Centre the item in the frame</li>
            <li>• Avoid blurry or dark images</li>
          </ul>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button onClick={onReset}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2">
            <SvgCameraInline size={18} /> Try Again
          </button>
          <button onClick={onBack}
            className="w-full bg-white border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl active:scale-95 transition-all">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ScanStatusView;
