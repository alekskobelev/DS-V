import React from 'react';

interface BrandLogoProps {
  brandId: string;
  className?: string;
  variant?: 'full' | 'icon' | 'badge';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ brandId, className = 'h-8 w-auto', variant = 'full' }) => {
  const normalizedId = brandId.toLowerCase();

  // 1. SCANLINE 3D (Authentic logo matching uploaded image 3)
  if (normalizedId.includes('scanline')) {
    return (
      <svg viewBox="0 0 280 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Left Circle Icon */}
        <g>
          <circle cx="30" cy="30" r="22" stroke="#1E3A8A" strokeWidth="7" fill="none" strokeDasharray="120 20" strokeDashoffset="10" />
          <circle cx="24" cy="30" r="10" fill="#1E3A8A" />
          <path d="M24 30 H42" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
        </g>
        {/* SCANLINE Text */}
        <text x="66" y="38" fill="#1E293B" className="dark:fill-white" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="27" letterSpacing="2.5">
          SCANLINE
        </text>
        <text x="238" y="38" fill="#2563EB" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="22" letterSpacing="1">
          3D
        </text>
      </svg>
    );
  }

  // 2. PMT (Precision Measuring Technology, matching uploaded image 4)
  if (normalizedId.includes('pmt')) {
    return (
      <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Orange top-left accent square */}
        <rect x="5" y="6" width="13" height="13" fill="#FF5E00" />
        {/* P */}
        <path d="M23 6 H58 C72 6 80 14 80 26 C80 38 72 46 58 46 H38 V64 H23 V6 Z M38 20 V32 H55 C61 32 65 29 65 26 C65 23 61 20 55 20 H38 Z" fill="#003E7E" className="dark:fill-blue-400" />
        {/* M */}
        <path d="M88 6 H105 L121 44 L137 6 H154 V64 H140 V23 L127 54 H115 L102 23 V64 H88 V6 Z" fill="#003E7E" className="dark:fill-blue-400" />
        {/* T with split diamond */}
        <path d="M162 6 H228 V20 H202 V64 H188 V20 H162 V6 Z" fill="#003E7E" className="dark:fill-blue-400" />
        <rect x="190" y="6" width="10" height="10" fill="white" className="dark:fill-slate-900" transform="rotate(45 195 11)" />
        {/* Subtitle / Micro text */}
        <text x="5" y="70" fill="#64748B" className="dark:fill-slate-400" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="7.5" letterSpacing="1.8">
          PRECISION MEASURING TECHNOLOGY
        </text>
      </svg>
    );
  }

  // 3. HEXAGON (Authentic geometric cube logo matching uploaded image 5)
  if (normalizedId.includes('hexagon') && !normalizedId.includes('geomagic') && !normalizedId.includes('leica')) {
    return (
      <svg viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Origami geometric cube mark */}
        <g transform="translate(4, 4)">
          <path d="M26 0 L52 14 L26 28 L0 14 Z" fill="#0096B7" />
          <path d="M0 14 L26 28 V56 L0 42 Z" fill="#60C2D6" />
          <path d="M26 28 L52 14 V42 L26 56 Z" fill="#9ACD32" />
          <path d="M14 21 L38 34 L26 48 Z" fill="#007A99" opacity="0.4" />
        </g>
        {/* HEXAGON Text */}
        <text x="68" y="38" fill="#0F172A" className="dark:fill-white" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="28" letterSpacing="2.5">
          HEXAGON
        </text>
      </svg>
    );
  }

  // 4. SHINING 3D (Authentic diamond crystal orb matching uploaded image 6)
  if (normalizedId.includes('shining')) {
    return (
      <svg viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Crystal Orb Icon */}
        <g transform="translate(6, 6)">
          <circle cx="24" cy="24" r="23" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="24" cy="24" r="20" fill="#0284C7" />
          <path d="M24 6 L34 16 L24 26 L14 16 Z" fill="#38BDF8" />
          <path d="M14 16 L24 26 L24 42 L8 30 Z" fill="#0EA5E9" />
          <path d="M34 16 L40 30 L24 42 L24 26 Z" fill="#7DD3FC" />
          <path d="M24 6 L24 26 L8 30 Z" fill="#BAE6FD" opacity="0.8" />
        </g>
        {/* SHINING 3D Text */}
        <text x="66" y="38" fill="#0072CE" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="26" letterSpacing="1.5">
          SHINING 3D
        </text>
      </svg>
    );
  }

  // 5. TopSolid (TopSolid SAS - France)
  if (normalizedId.includes('topsolid')) {
    return (
      <svg viewBox="0 0 230 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g transform="translate(6, 8)">
          <rect width="44" height="44" rx="10" fill="#E11D48" />
          <text x="22" y="30" fill="white" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="20" textAnchor="middle">
            TS
          </text>
          <circle cx="36" cy="12" r="4" fill="#FDE047" />
        </g>
        <text x="62" y="38" fill="#0F172A" className="dark:fill-white" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="25" letterSpacing="1">
          TopSolid
        </text>
        <text x="182" y="24" fill="#E11D48" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="12">
          7
        </text>
      </svg>
    );
  }

  // 6. PolyWorks (InnovMetric Software)
  if (normalizedId.includes('polyworks') || normalizedId.includes('innovmetric')) {
    return (
      <svg viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g transform="translate(6, 8)">
          <rect width="44" height="44" rx="10" fill="#0284C7" />
          <path d="M12 34 L22 14 L32 34" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22" cy="14" r="3" fill="#38BDF8" />
          <circle cx="12" cy="34" r="3" fill="#38BDF8" />
          <circle cx="32" cy="34" r="3" fill="#38BDF8" />
          <circle cx="22" cy="26" r="3" fill="#F59E0B" />
        </g>
        <text x="60" y="37" fill="#0F172A" className="dark:fill-white" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="24" letterSpacing="1">
          PolyWorks
        </text>
        <text x="60" y="49" fill="#0284C7" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="9" letterSpacing="1.5">
          INNOVMETRIC
        </text>
      </svg>
    );
  }

  // 7. Geomagic (HEXAGON / 3D Systems)
  if (normalizedId.includes('geomagic')) {
    return (
      <svg viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g transform="translate(6, 8)">
          <rect width="44" height="44" rx="10" fill="#DC2626" />
          <path d="M14 22 L22 14 L30 22 L22 30 Z" fill="white" />
          <path d="M22 22 L30 14 L38 22 L30 30 Z" fill="#FCA5A5" opacity="0.7" />
          <path d="M18 30 L26 22 L34 30 L26 38 Z" fill="#FEE2E2" opacity="0.8" />
        </g>
        <text x="60" y="37" fill="#0F172A" className="dark:fill-white" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="24" letterSpacing="0.8">
          Geomagic
        </text>
        <text x="60" y="49" fill="#DC2626" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="9" letterSpacing="1.5">
          DESIGN X / CONTROL X
        </text>
      </svg>
    );
  }

  // 8. Autodesk (USA)
  if (normalizedId.includes('autodesk') || normalizedId.includes('delcam')) {
    return (
      <svg viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g transform="translate(10, 10)">
          <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="#0696D7" />
          <path d="M20 0 L40 20 L40 40 L20 20 Z" fill="#005C8A" />
          <path d="M0 20 L20 20 L20 40 L0 40 Z" fill="#002D42" />
        </g>
        <text x="60" y="36" fill="#0F172A" className="dark:fill-white" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="24" letterSpacing="1">
          AUTODESK
        </text>
        <text x="60" y="49" fill="#0696D7" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="9" letterSpacing="1.5">
          POWERMILL / FEATURECAM
        </text>
      </svg>
    );
  }

  // 9. Leica Geosystems (HEXAGON)
  if (normalizedId.includes('leica')) {
    return (
      <svg viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g transform="translate(6, 8)">
          <circle cx="22" cy="22" r="21" fill="#DC2626" />
          <text x="22" y="27" fill="white" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="bold" fontSize="16" textAnchor="middle">
            Leica
          </text>
        </g>
        <text x="58" y="34" fill="#0F172A" className="dark:fill-white" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="21" letterSpacing="0.8">
          Leica Geosystems
        </text>
        <text x="58" y="47" fill="#64748B" className="dark:fill-slate-400" fontFamily="system-ui, sans-serif" fontWeight="600" fontSize="9" letterSpacing="1">
          PART OF HEXAGON
        </text>
      </svg>
    );
  }

  // Fallback
  return (
    <div className={`flex items-center gap-2 font-bold text-slate-800 dark:text-white ${className}`}>
      <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">{brandId.slice(0, 3).toUpperCase()}</span>
      <span>{brandId}</span>
    </div>
  );
};
