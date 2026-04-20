import React from 'react';
import { SvgAIRobot } from '../TutorialVisuals';

interface ScanningViewProps {
  imagePreview:     string | null;
  selectedCategory: string | null;
}

const ScanningView: React.FC<ScanningViewProps> = ({ imagePreview, selectedCategory }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] gap-8 p-8 relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

    <div className="relative z-10 bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col items-center w-full max-w-sm">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-30 animate-pulse"></div>
        <div className="animate-spin rounded-full h-24 w-24 border-[5px] border-gray-100 border-t-green-500 relative z-10" />
        <span className="absolute inset-0 flex items-center justify-center z-20 text-green-600"><SvgAIRobot size={32} /></span>
      </div>

      <div className="text-center w-full">
        <p className="text-gray-900 text-xl font-black tracking-tight">AI is analyzing</p>
        <p className="text-gray-500 text-sm font-medium mt-1 mb-6">Comparing image with your selection</p>
      </div>

      <div className="flex w-full items-center gap-4">
        {imagePreview && (
          <div className="flex-1 aspect-[4/3] rounded-[1rem] overflow-hidden shadow-sm border border-gray-100 bg-black">
            <img src={imagePreview} alt="Scanning" className="w-full h-full object-cover" />
          </div>
        )}
        {selectedCategory && (
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[1rem] p-3 flex flex-col justify-center items-center h-full">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Your Match</p>
            <p className="font-black text-blue-600 text-center leading-tight text-sm">{selectedCategory}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ScanningView;
