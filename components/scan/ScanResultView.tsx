import React from 'react';
import { SvgEcoCelebrate, SvgThinkLearn, SvgLeafBulb, SvgMedal, SvgTimer } from '../TutorialVisuals';
import { BADGES } from '../../services/gamificationService';

interface ScanResult {
  isCorrect:           boolean;
  userAnswer:          string;
  aiAnswer:            string;
  itemName:            string;
  pointsEarned:        number;
  newlyUnlockedBadges: string[];
}

interface ScanResultViewProps {
  scanResult: ScanResult;
  image: string | null;
  showBadgeAnim: string | null;
  redirectCountdown: number;
  cooldownSeconds: number;
  onScanComplete: () => void;
}

const ScanResultView: React.FC<ScanResultViewProps> = ({
  scanResult,
  image,
  showBadgeAnim,
  redirectCountdown,
  cooldownSeconds,
  onScanComplete,
}) => {
  const { isCorrect, userAnswer, aiAnswer, itemName, pointsEarned, newlyUnlockedBadges } = scanResult;
  const unlockedBadge = newlyUnlockedBadges.length ? BADGES.find(b => b.id === newlyUnlockedBadges[0]) : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <div className={`pt-12 pb-10 px-6 rounded-b-[3rem] shadow-xl relative overflow-hidden shrink-0 transition-all duration-700 flex flex-col items-center text-center ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

        {showBadgeAnim && unlockedBadge && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center gap-3 shadow-2xl mx-6 animate-slide-up">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center shadow-inner mb-2">
                <div className="scale-[1.5]">{unlockedBadge.icon}</div>
              </div>
              <p className="text-yellow-500 font-black text-xl tracking-tight uppercase">Badge Unlocked!</p>
              <p className="font-bold text-gray-900 text-2xl text-center leading-tight">{unlockedBadge.name}</p>
              <p className="text-gray-500 text-sm text-center font-medium mt-1">{unlockedBadge.description}</p>
            </div>
          </div>
        )}

        {/* New "Scan Completed" Header */}
        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Scan Process Completed</p>
        </div>

        <div className="relative z-10">
          <div className="w-32 h-32 mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/40 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 bg-black">
            {image ? (
              <img src={image} alt="Scanned item" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                {isCorrect ? <SvgEcoCelebrate size={56} /> : <SvgThinkLearn size={56} />}
              </div>
            )}
          </div>
          
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-md">
            {isCorrect ? 'Spot On!' : 'Almost There!'}
          </h2>
          
          <p className="text-white/90 text-sm font-bold tracking-wide max-w-xs mx-auto leading-relaxed">
            {isCorrect 
              ? "You guessed the correct waste category and earned eco-points!" 
              : "The AI has a different insight for this item. Let's learn together!"}
          </p>

          {itemName && (
            <div className="mt-4 bg-black/15 backdrop-blur-sm px-4 py-1.5 rounded-2xl border border-white/10 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <p className="text-white/90 text-[11px] font-black uppercase tracking-wider">{itemName}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-10 flex flex-col gap-4">
        <div className="flex gap-4 w-full">
          <div className="flex-1 rounded-[1.25rem] p-4 text-center bg-white shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Your Answer</p>
            <p className={`font-black text-lg ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>{userAnswer}</p>
          </div>
          <div className="flex-1 rounded-[1.25rem] p-4 text-center bg-white shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">AI Match</p>
            <p className="font-black text-blue-600 text-lg">{aiAnswer}</p>
          </div>
        </div>

        {!isCorrect && (
          <div className="w-full bg-amber-50 border border-amber-100 rounded-[1.25rem] p-4 flex gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
              <SvgLeafBulb size={16} />
            </div>
            <div>
              <p className="text-amber-900 font-bold text-sm">Learning Tip</p>
              <p className="text-amber-700/80 text-xs font-semibold mt-0.5">
                The correct category for this item is <span className="font-black text-amber-900">{aiAnswer}</span>. Next time you'll get it!
              </p>
            </div>
          </div>
        )}

        {newlyUnlockedBadges.length > 0 && !showBadgeAnim && (
          <div className="w-full bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-[1.25rem] p-4 flex items-center justify-center gap-2 shadow-sm">
            <SvgMedal size={22} className="text-yellow-600" />
            <p className="text-sm font-black text-yellow-800 tracking-tight">
              New Badge: {BADGES.find(b => b.id === newlyUnlockedBadges[0])?.name}
            </p>
          </div>
        )}

        <div className="mt-auto pt-6 flex flex-col gap-3">
          <div className="w-full bg-gray-100 rounded-full px-4 py-2 flex items-center justify-center gap-1.5">
            <SvgTimer size={14} className="text-gray-500" />
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
              Next scan available in <span className="text-gray-900">{cooldownSeconds}s</span>
            </p>
          </div>
          <button onClick={onScanComplete}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
            Back to Dashboard
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{redirectCountdown}s</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanResultView;
