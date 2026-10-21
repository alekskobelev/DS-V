import React, { useState } from 'react';
import { PhoneCall, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CallbackFloatingButton: React.FC = () => {
  const { openCallbackModal, isCallbackModalOpen } = useApp();
  const [isHovered, setIsHovered] = useState(false);

  // If modal is already open, do not distract with the floating trigger
  if (isCallbackModalOpen) return null;

  return (
    <div 
      className="relative flex items-center justify-center group w-11 h-11 sm:w-14 sm:h-14 shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Continuous radiating sonar / radar pulse waves (Alive & interactive on tablets/desktop) */}
      <span className="hidden sm:block absolute -inset-1 rounded-full bg-blue-500/35 dark:bg-blue-400/30 animate-floating-pulse-1 pointer-events-none" />
      <span className="hidden sm:block absolute -inset-1 rounded-full bg-blue-400/25 dark:bg-blue-300/20 animate-floating-pulse-2 pointer-events-none" />

      {/* Main Interactive Translucent Button */}
      <button
        id="floating-callback-btn"
        type="button"
        onClick={() => openCallbackModal()}
        className="relative flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 bg-[#1E3A8A]/90 hover:bg-[#1E3A8A] dark:bg-[#1E3A8A]/80 dark:hover:bg-[#1E3A8A] backdrop-blur-md text-white rounded-full shadow-[0_4px_14px_rgba(30,58,138,0.35)] hover:shadow-[0_8px_28px_rgba(37,99,235,0.45)] border-2 border-white/60 dark:border-white/40 hover:border-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400/30 cursor-pointer select-none active:scale-90 hover:scale-105"
        aria-label="Заказать обратный звонок инженера"
      >
        {/* Animated Phone Icon with ringing wiggle */}
        <div className="relative flex items-center justify-center">
          <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-phone-ring transition-transform duration-300 group-hover:scale-115" />
          
          {/* Animated online status dot with pulsing ping wave */}
          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 rounded-full bg-emerald-400">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </span>
        </div>
      </button>

      {/* Floating Hover Tooltip on Desktop */}
      <div 
        className={`hidden md:block absolute left-full ml-4 px-4 py-2 bg-gray-900/90 backdrop-blur-md text-white text-xs rounded-xl shadow-sm border border-gray-700/80 whitespace-nowrap transition-all duration-200 pointer-events-none ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
        }`}
      >
        <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          Экспресс-связь с инженером
        </div>
        <div className="text-[11px] text-gray-300 mt-0.5">
          Консультация дежурного инженера
        </div>
      </div>
    </div>
  );
};
