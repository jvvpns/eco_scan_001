import React from 'react';
import { IconBack } from '../Icons';
import { SvgTarget } from '../TutorialVisuals';

interface CategoryItem {
  id:          string;
  label:       string;
  description: string;
  color:       string;
  hover:       string;
}

interface CategoryPickerProps {
  imagePreview: string | null;
  error:        string | null;
  categories:   CategoryItem[];
  onSelect:     (categoryId: string) => void;
  onBack:       () => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  imagePreview, error, categories, onSelect, onBack,
}) => (
  <div className="flex flex-col min-h-screen bg-[#f8fafc]">
    <div className="flex items-center gap-3 p-5 pt-safe bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative z-10">
      <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
        <IconBack size={24} color="#1f2937" />
      </button>
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Select Category</h2>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">What's in the picture?</p>
      </div>
    </div>

    {imagePreview && (
      <div className="mx-4 mt-4 rounded-xl overflow-hidden h-44 bg-black shadow-md">
        <img src={imagePreview} alt="Captured item" className="w-full h-full object-cover" />
      </div>
    )}

    {error && <p className="text-red-500 text-center mx-4 mt-3 text-sm font-medium">{error}</p>}

    <div className="flex flex-col gap-3 p-5 mt-2 flex-1">
      {categories.map(cat => (
        <button key={cat.id} onClick={() => onSelect(cat.id)}
          className={`${cat.color} ${cat.hover} text-white rounded-2xl py-4 px-5 text-left transition-all active:scale-[0.98] shadow-md`}>
          <div className="flex items-center justify-between">
            <p className="font-black text-lg">{cat.label}</p>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </div>
          <p className="text-xs opacity-90 font-medium mt-1 pr-8">{cat.description}</p>
        </button>
      ))}
    </div>

    <p className="text-center text-xs text-gray-400 pb-6 flex items-center justify-center gap-1.5">
      <SvgTarget size={14} className="text-gray-400" /> Match your selection with the AI scanner to earn points!
    </p>
  </div>
);

export default CategoryPicker;
