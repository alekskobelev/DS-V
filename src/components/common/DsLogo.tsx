import React from 'react';

interface DsLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
  customSrc?: string;
}

export const DsLogo: React.FC<DsLogoProps> = ({ 
  className = '', 
  size = 48,
  showText = false,
  textClassName = '',
  customSrc = '/logo.svg'
}) => {
  return (
    <div className={`inline-flex items-center gap-3 shrink-0 ${className}`}>
      <div 
        style={{ width: size, height: size }} 
        className="relative shrink-0 select-none flex items-center justify-center rounded-full overflow-hidden bg-white"
      >
        <img
          src={customSrc}
          alt="ДС‑Инжиниринг"
          width={size}
          height={size}
          className="w-full h-full object-contain pointer-events-none drop-shadow-xs rounded-full"
          style={{ mixBlendMode: 'normal' }}
          draggable={false}
        />
      </div>

      {showText && (
        <div className={`shrink-0 ${textClassName}`}>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-[#003882] leading-none whitespace-nowrap">
            ДС‑ИНЖИНИРИНГ
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 font-normal leading-tight mt-1">
            Инжиниринговые услуги и измерительное оборудование
          </div>
        </div>
      )}
    </div>
  );
};

