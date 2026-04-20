import React, { useState, useEffect } from 'react';
import * as Visuals from './TutorialVisuals';

const STEPS = [
  {
    title: "Open the App",
    description: "Install or use it in your browser to start your journey.",
    visual: Visuals.VisualAppLaunch,
    color: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-200"
  },
  {
    title: "Tap & Scan",
    description: "Tap the prominent camera button to open the AI lens.",
    visual: Visuals.VisualCamera,
    color: "bg-purple-100",
    textColor: "text-purple-700",
    borderColor: "border-purple-200"
  },
  {
    title: "Scan Your Plastic Waste",
    description: "Point and scan the item. Keep it steady for the best result.",
    visual: Visuals.VisualWaste,
    color: "bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200"
  },
  {
    title: "What Type Is It?",
    description: "Choose the category you think fits best.",
    visual: Visuals.VisualCategory,
    color: "bg-orange-100",
    textColor: "text-orange-700",
    borderColor: "border-orange-200"
  },
  {
    title: "AI in Action",
    description: "Watch as our advanced AI validates your choice.",
    visual: Visuals.VisualAIRobot,
    color: "bg-emerald-100",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200"
  },
  {
    title: "Check Your Results",
    description: "View your scan history and earn eco-points.",
    visual: Visuals.VisualResults,
    color: "bg-orange-100",
    textColor: "text-orange-700",
    borderColor: "border-orange-200"
  },
  {
    title: "Try Again!",
    description: "Missed it? No worries! Scan and try again to improve.",
    visual: Visuals.VisualRefresh,
    color: "bg-red-100",
    textColor: "text-red-700",
    borderColor: "border-red-200"
  }
];

const AppTutorial: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = sessionStorage.getItem('pilot_app_tutorial_seen');
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    sessionStorage.setItem('pilot_app_tutorial_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const Visual = step.visual;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header Illustration Area */}
        <div className={`h-48 flex items-center justify-center transition-colors duration-500 ${step.color}`}>
          <Visual className="animate-in slide-in-from-bottom-8 duration-500" size={140} />
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="flex justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-green-600' : 'w-1.5 bg-gray-200'}`}
              />
            ))}
          </div>

          <h2 className={`text-2xl font-bold mb-3 ${step.textColor}`}>
            {currentStep + 1}. {step.title}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            {step.description}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleNext}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-200 active:scale-95 transition-all"
            >
              {currentStep === STEPS.length - 1 ? "Get Started" : "Next Step"}
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 text-xs font-semibold hover:text-gray-600 transition"
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppTutorial;
