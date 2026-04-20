import React, { useState, useEffect } from 'react';
import { VisualSparkle, SvgPointCapture, SvgVerifyCheck } from './TutorialVisuals';

const ScannerTutorial: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenScannerTutorial = localStorage.getItem('pilot_scanner_tutorial_seen');
    if (!hasSeenScannerTutorial) {
      setIsOpen(true);
    }
  }, []);

  const handleStart = () => {
    localStorage.setItem('pilot_scanner_tutorial_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
      <div className="bg-[#0B1311] text-[#F3EFE0] rounded-[3rem] shadow-2xl w-full max-w-sm p-8 border border-emerald-500/10 animate-in fade-in zoom-in duration-500">
        
        {/* Header Icons */}
        <div className="flex justify-center gap-1 mb-6 text-[#FBBF24]">
          <VisualSparkle size={24} className="mt-4" />
          <VisualSparkle size={36} />
          <VisualSparkle size={24} className="mt-4" />
        </div>

        <h1 className="text-center text-[#FBBF24] font-black tracking-[0.2em] text-xl mb-10">
          SCANNER BRIEFING
        </h1>

        {/* Steps */}
        <div className="space-y-10 mb-12">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center shrink-0 border border-emerald-500/10 text-[#FBBF24]">
              <SvgPointCapture size={24} />
            </div>
            <div>
              <h3 className="text-[#FBBF24] font-bold text-sm tracking-wide mb-1">1. POINT & CAPTURE</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Aim your lens at the waste item and capture it clearly for the AI to analyze.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center shrink-0 border border-emerald-500/10 text-[#FBBF24]">
              <SvgVerifyCheck size={24} />
            </div>
            <div>
              <h3 className="text-[#FBBF24] font-bold text-sm tracking-wide mb-1">2. VERIFY CATEGORY</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Choose what type of plastic you think it is. The AI will double-check your guess.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center shrink-0 border border-emerald-500/10 text-[#FBBF24]">
              <VisualSparkle size={20} />
            </div>
            <div>
              <h3 className="text-[#FBBF24] font-bold text-sm tracking-wide mb-1">3. AI WASTE INSIGHTS</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Get instant feedback, learn about recyclability, and earn your eco-points.
              </p>
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleStart}
          className="w-full py-5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0B1311] font-black rounded-2xl shadow-xl shadow-black/40 active:scale-95 transition-all tracking-widest text-sm uppercase"
        >
          Begin Scanning
        </button>
      </div>
    </div>
  );
};

export default ScannerTutorial;
