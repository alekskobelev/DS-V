import { TrainingCertificate } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Vector Logo Generators
export const generateHexagonLogoSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 68" width="168" height="48">
    <g transform="translate(6, 6)">
      <!-- Hexagon 3D isometric cube -->
      <polygon points="26,0 52,14 26,28 0,14" fill="#10b981" />
      <polygon points="0,14 26,28 26,56 0,42" fill="#06b6d4" />
      <polygon points="26,28 52,14 52,42 26,56" fill="#2563eb" />
    </g>
    <text x="68" y="34" font-family="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="25" font-weight="900" fill="#0f172a" letter-spacing="1.5">HEXAGON</text>
    <text x="69" y="50" font-family="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="7.5" font-weight="800" fill="#475569" letter-spacing="2">MANUFACTURING INTELLIGENCE</text>
  </svg>`;
};

export const generatePolyworksLogoSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 68" width="168" height="48">
    <g transform="translate(4, 8)">
      <!-- PolyWorks Red Sphere / Measuring Icon -->
      <circle cx="26" cy="26" r="24" fill="#dc2626" />
      <circle cx="26" cy="26" r="20" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-dasharray="6 3" />
      <path d="M16,26 L36,26 M26,16 L26,36" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
      <circle cx="26" cy="26" r="4.5" fill="#ffffff" />
    </g>
    <text x="64" y="33" font-family="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="24" font-weight="900" fill="#0f172a" letter-spacing="0.5">PolyWorks<tspan font-size="14" dy="-8">®</tspan></text>
    <text x="65" y="50" font-family="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="8.5" font-weight="700" fill="#64748b" letter-spacing="0.8">By InnovMetric Software Inc.</text>
  </svg>`;
};

export const generateDsEmblemSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="112" height="112">
    <!-- Circular outer ring with gear teeth -->
    <circle cx="80" cy="80" r="74" fill="#0369a1" stroke="#075985" stroke-width="3"/>
    <circle cx="80" cy="80" r="66" fill="#ffffff" />
    <circle cx="80" cy="80" r="62" fill="none" stroke="#0284c7" stroke-width="1.8"/>
    <circle cx="80" cy="80" r="48" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1.2"/>
    <!-- Gear & Caliper / Compass Symbols -->
    <g transform="translate(80,80)" stroke="#0369a1" fill="none" stroke-width="2">
      <!-- 8 gear tooth spokes -->
      <line x1="0" y1="-44" x2="0" y2="44" stroke-width="3.5" stroke="#0284c7"/>
      <line x1="-44" y1="0" x2="44" y2="0" stroke-width="3.5" stroke="#0284c7"/>
      <line x1="-31" y1="-31" x2="31" y2="31" stroke-width="3.5" stroke="#0284c7"/>
      <line x1="-31" y1="31" x2="31" y2="-31" stroke-width="3.5" stroke="#0284c7"/>
      <!-- Inner hub -->
      <circle cx="0" cy="0" r="28" fill="#ffffff" stroke="#0369a1" stroke-width="2.5"/>
      <circle cx="0" cy="0" r="19" fill="#0284c7" stroke="none"/>
      <!-- Engineering Compasses -->
      <path d="M-10,14 L0,-12 L10,14" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="-7" y1="4" x2="7" y2="4" stroke="#ffffff" stroke-width="2"/>
    </g>
    <!-- Text Along Ring Top and Bottom -->
    <path id="emblem-arc-top" fill="none" stroke="none" d="M 22,80 A 58,58 0 1,1 138,80"/>
    <text font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="900" fill="#0369a1" letter-spacing="1.2">
      <textPath href="#emblem-arc-top" startOffset="50%" text-anchor="middle">
        ИНЖИНИРИНГОВАЯ КОМПАНИЯ
      </textPath>
    </text>
    <path id="emblem-arc-bottom" fill="none" stroke="none" d="M 138,80 A 58,58 0 0,1 22,80"/>
    <text font-family="'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="900" fill="#0369a1" letter-spacing="1.5">
      <textPath href="#emblem-arc-bottom" startOffset="50%" text-anchor="middle">
        ★ ДС-ИНЖИНИРИНГ ★
      </textPath>
    </text>
  </svg>`;
};

export const generateShining3dLogoSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 68" width="168" height="48">
    <g transform="translate(6, 12)">
      <rect x="0" y="0" width="16" height="42" fill="#0284c7" rx="3" />
      <rect x="22" y="8" width="16" height="34" fill="#0ea5e9" rx="3" />
      <polygon points="44,16 60,8 60,38 44,46" fill="#38bdf8" />
    </g>
    <text x="76" y="34" font-family="'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#0f172a" letter-spacing="1">SHINING 3D</text>
    <text x="77" y="49" font-family="'Segoe UI', Roboto, sans-serif" font-size="8" font-weight="700" fill="#64748b" letter-spacing="1.5">FreeScan • 3D Metrology</text>
  </svg>`;
};

export const generateLeicaLogoSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 68" width="168" height="48">
    <circle cx="28" cy="34" r="20" fill="#dc2626" />
    <text x="28" y="41" font-family="'Brush Script MT', cursive, sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">Leica</text>
    <text x="60" y="34" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#0f172a">Geosystems</text>
    <text x="61" y="49" font-family="'Segoe UI', Roboto, sans-serif" font-size="8" font-weight="700" fill="#64748b" letter-spacing="1">HEXAGON METROLOGY DIVISION</text>
  </svg>`;
};

export const generateTopSolidLogoSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 68" width="168" height="48">
    <g transform="translate(4, 10)">
      <path d="M0,0 L32,0 L16,24 Z" fill="#ef4444" />
      <path d="M16,24 L48,24 L32,48 Z" fill="#b91c1c" />
    </g>
    <text x="60" y="34" font-family="'Segoe UI', Roboto, sans-serif" font-size="23" font-weight="900" fill="#0f172a">TopSolid<tspan fill="#ef4444"> 7</tspan></text>
    <text x="61" y="49" font-family="'Segoe UI', Roboto, sans-serif" font-size="8" font-weight="700" fill="#64748b" letter-spacing="1">Integrated CAD / CAM / PDM</text>
  </svg>`;
};

export const generateGeomagicLogoSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 68" width="168" height="48">
    <circle cx="26" cy="34" r="22" fill="#0284c7" />
    <text x="26" y="41" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">3D</text>
    <text x="60" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#0f172a">Geomagic<tspan fill="#0284c7">®</tspan></text>
    <text x="61" y="48" font-family="'Segoe UI', Roboto, sans-serif" font-size="8" font-weight="700" fill="#64748b" letter-spacing="1">Design X • 3D Systems</text>
  </svg>`;
};

export const generatePmtLogoSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 68" width="168" height="48">
    <rect x="4" y="14" width="48" height="40" fill="#0f766e" rx="4" />
    <text x="28" y="41" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">PMT</text>
    <text x="62" y="33" font-family="'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="900" fill="#0f172a">PMT ARM</text>
    <text x="63" y="49" font-family="'Segoe UI', Roboto, sans-serif" font-size="8" font-weight="700" fill="#64748b" letter-spacing="1">Precision Measuring Technology</text>
  </svg>`;
};

// Official Circular Company Stamp of OOO "DS-Engineering" (Samara)
export const generateCompanyStampSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="112" height="112" style="opacity:0.92;transform:rotate(-6deg);">
    <circle cx="80" cy="80" r="76" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-dasharray="6 2.5"/>
    <circle cx="80" cy="80" r="71" fill="none" stroke="#1d4ed8" stroke-width="1.8"/>
    <circle cx="80" cy="80" r="50" fill="none" stroke="#1d4ed8" stroke-width="1.4"/>
    <path id="stamp-curve-outer" fill="none" stroke="none" d="M 17,80 A 63,63 0 1,1 143,80"/>
    <text font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" font-weight="900" fill="#1d4ed8" letter-spacing="0.9">
      <textPath href="#stamp-curve-outer" startOffset="50%" text-anchor="middle">
        * РОССИЙСКАЯ ФЕДЕРАЦИЯ * ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ
      </textPath>
    </text>
    <path id="stamp-curve-bottom" fill="none" stroke="none" d="M 143,80 A 63,63 0 0,1 17,80"/>
    <text font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" font-weight="900" fill="#1d4ed8" letter-spacing="1">
      <textPath href="#stamp-curve-bottom" startOffset="50%" text-anchor="middle">
        * «ДС-ИНЖИНИРИНГ» * ОГРН 1156313012984 *
      </textPath>
    </text>
    <g transform="translate(80,80)" text-anchor="middle">
      <text y="-14" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#1d4ed8">г. САМАРА</text>
      <text y="-2" font-family="'Segoe UI', Arial, sans-serif" font-size="8.5" font-weight="900" fill="#1e3a8a" letter-spacing="1.2">ДЛЯ СВИДЕТЕЛЬСТВ</text>
      <text y="10" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" font-weight="900" fill="#1e3a8a" letter-spacing="0.8">И УДОСТОВЕРЕНИЙ</text>
      <text y="24" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="900" fill="#1d4ed8">№ 1</text>
    </g>
  </svg>`;
};

// Facsimile signature representation of General Director S.Y. Nekrasov
export const generateSignatureSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="130" height="42" style="display:block;margin:0 auto -10px auto;opacity:0.92;">
    <path d="M12,42 Q32,4 58,36 T92,18 Q122,48 148,14 T184,32 Q164,56 132,40" fill="none" stroke="#1e40af" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M46,28 Q72,8 96,26" fill="none" stroke="#1e40af" stroke-width="1.9" stroke-linecap="round"/>
    <path d="M126,22 Q152,4 176,20" fill="none" stroke="#1e40af" stroke-width="1.9" stroke-linecap="round"/>
  </svg>`;
};

// Equipment Watermark Generators (Precision Technical Vectors)
export const generateHexagonGlobalWatermarkSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
    <!-- Granite surface plate (base) -->
    <polygon points="60,280 440,280 390,360 10,360" fill="#475569" stroke="#334155" stroke-width="2.5" />
    <polygon points="10,360 390,360 390,380 10,380" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
    <polygon points="390,360 440,280 440,300 390,380" fill="#334155" stroke="#1e293b" stroke-width="2" />
    
    <!-- Table grid holes -->
    <g fill="#0f172a" opacity="0.6">
      <circle cx="100" cy="305" r="2.5"/><circle cx="150" cy="305" r="2.5"/><circle cx="200" cy="305" r="2.5"/><circle cx="250" cy="305" r="2.5"/><circle cx="300" cy="305" r="2.5"/><circle cx="350" cy="305" r="2.5"/><circle cx="400" cy="305" r="2.5"/>
      <circle cx="80" cy="330" r="2.5"/><circle cx="130" cy="330" r="2.5"/><circle cx="180" cy="330" r="2.5"/><circle cx="230" cy="330" r="2.5"/><circle cx="280" cy="330" r="2.5"/><circle cx="330" cy="330" r="2.5"/><circle cx="380" cy="330" r="2.5"/>
    </g>

    <!-- Calibration Reference Sphere -->
    <circle cx="120" cy="275" r="14" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
    <rect x="116" y="289" width="8" height="24" fill="#64748b" stroke="#334155" stroke-width="1.5"/>

    <!-- Left Pillar (Y-axis guide) -->
    <polygon points="90,140 140,110 140,290 90,320" fill="#e2e8f0" stroke="#64748b" stroke-width="2.5"/>
    <polygon points="140,110 160,120 160,270 140,290" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>

    <!-- Right Pillar -->
    <polygon points="350,140 400,110 400,250 350,280" fill="#cbd5e1" stroke="#64748b" stroke-width="2.5"/>
    <polygon points="400,110 420,120 420,230 400,250" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>

    <!-- Bridge Crossbeam (X-axis beam) with Hexagon Branding -->
    <polygon points="80,135 410,105 410,165 80,195" fill="#f8fafc" stroke="#475569" stroke-width="3"/>
    <polygon points="80,195 410,165 410,185 80,215" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
    <rect x="180" y="140" width="130" height="24" transform="rotate(-4.5, 245, 152)" fill="#0284c7" rx="3"/>
    <text x="245" y="157" transform="rotate(-4.5, 245, 152)" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">HEXAGON GLOBAL</text>

    <!-- Central Z-Axis Carriage -->
    <rect x="230" y="125" width="46" height="58" fill="#e2e8f0" stroke="#334155" stroke-width="2.5" rx="3"/>
    
    <!-- Vertical Z-Ram (Spindle column) -->
    <rect x="246" y="165" width="14" height="95" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
    
    <!-- Motorized Probe Head (Renishaw PH10M) -->
    <rect x="241" y="260" width="24" height="20" fill="#0f172a" rx="2"/>
    <circle cx="253" cy="270" r="5" fill="#0284c7"/>
    <!-- Stylus with ruby ball -->
    <line x1="253" y1="280" x2="253" y2="306" stroke="#475569" stroke-width="2.5"/>
    <circle cx="253" cy="308" r="4.5" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/>
  </svg>`;
};

export const generateHexagonArmWatermarkSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
    <!-- Tripod / Stand base -->
    <polygon points="200,380 300,380 260,330 240,330" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
    <rect x="244" y="270" width="12" height="60" fill="#475569" stroke="#1e293b" stroke-width="2"/>
    <circle cx="250" cy="265" r="16" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
    
    <!-- Arm Tube 1 (Lower carbon fiber) -->
    <line x1="250" y1="265" x2="180" y2="150" stroke="#0f172a" stroke-width="18" stroke-linecap="round"/>
    <line x1="250" y1="265" x2="180" y2="150" stroke="#334155" stroke-width="12" stroke-linecap="round"/>
    <!-- Elbow joint -->
    <circle cx="180" cy="150" r="18" fill="#0284c7" stroke="#0f172a" stroke-width="3"/>
    
    <!-- Arm Tube 2 (Upper carbon fiber) -->
    <line x1="180" y1="150" x2="310" y2="90" stroke="#0f172a" stroke-width="16" stroke-linecap="round"/>
    <line x1="180" y1="150" x2="310" y2="90" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
    <!-- Wrist joint -->
    <circle cx="310" cy="90" r="15" fill="#0284c7" stroke="#0f172a" stroke-width="3"/>
    
    <!-- Scanner head / Probe -->
    <rect x="315" y="78" width="35" height="24" fill="#0f172a" rx="4"/>
    <line x1="350" y1="90" x2="375" y2="90" stroke="#64748b" stroke-width="3"/>
    <circle cx="377" cy="90" r="4" fill="#ef4444"/>
  </svg>`;
};

export const generateShiningFreescanWatermarkSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
    <!-- Handheld 3D Laser Scanner Body -->
    <g transform="translate(140, 80)">
      <rect x="50" y="30" width="120" height="90" rx="12" fill="#0f172a" stroke="#334155" stroke-width="4"/>
      <!-- Dual optical cameras -->
      <circle cx="75" cy="75" r="16" fill="#1e293b" stroke="#0284c7" stroke-width="3"/>
      <circle cx="75" cy="75" r="8" fill="#38bdf8"/>
      <circle cx="145" cy="75" r="16" fill="#1e293b" stroke="#0284c7" stroke-width="3"/>
      <circle cx="145" cy="75" r="8" fill="#38bdf8"/>
      <!-- Laser emitter aperture -->
      <rect x="95" y="65" width="30" height="20" rx="4" fill="#0284c7"/>
      <line x1="100" y1="75" x2="120" y2="75" stroke="#ffffff" stroke-width="2"/>
      <line x1="110" y1="67" x2="110" y2="83" stroke="#ffffff" stroke-width="2"/>
      <!-- Ergonomic handle -->
      <path d="M100,120 L95,210 Q95,225 110,225 L125,225 Q140,225 140,210 L135,120 Z" fill="#1e293b" stroke="#0f172a" stroke-width="4"/>
      <rect x="85" y="145" width="12" height="24" rx="3" fill="#ef4444"/> <!-- Trigger -->
    </g>
  </svg>`;
};

export const generateLeicaTrackerWatermarkSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
    <!-- Leica Absolute Tracker on Tripod -->
    <g transform="translate(160, 60)">
      <!-- Motorized tracker head -->
      <circle cx="90" cy="70" r="44" fill="#0f172a" stroke="#dc2626" stroke-width="4"/>
      <circle cx="90" cy="70" r="28" fill="#1e293b"/>
      <circle cx="90" cy="70" r="14" fill="#dc2626"/>
      <!-- Laser optic emitter -->
      <circle cx="90" cy="70" r="6" fill="#ffffff"/>
      <!-- Yoke base -->
      <path d="M55,90 L60,130 L120,130 L125,90 Z" fill="#334155" stroke="#0f172a" stroke-width="3"/>
      <rect x="75" y="130" width="30" height="25" fill="#1e293b"/>
      <!-- Tripod legs -->
      <line x1="80" y1="155" x2="10" y2="310" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
      <line x1="90" y1="155" x2="90" y2="315" stroke="#334155" stroke-width="8" stroke-linecap="round"/>
      <line x1="100" y1="155" x2="170" y2="310" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
    </g>
  </svg>`;
};

export const generateTopSolidCncWatermarkSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
    <!-- 5-Axis CNC Machine Center -->
    <rect x="90" y="70" width="320" height="260" rx="8" fill="#f1f5f9" stroke="#334155" stroke-width="4"/>
    <rect x="120" y="90" width="260" height="180" rx="4" fill="#0f172a" stroke="#475569" stroke-width="3"/>
    <!-- Observation window glass -->
    <rect x="140" y="105" width="220" height="150" fill="#0284c7" opacity="0.3" stroke="#38bdf8" stroke-width="2"/>
    <!-- 5-Axis Trunnion Table -->
    <circle cx="250" cy="220" r="32" fill="#475569" stroke="#94a3b8" stroke-width="3"/>
    <rect x="235" y="210" width="30" height="20" fill="#cbd5e1"/>
    <!-- Milling spindle & cutter -->
    <rect x="242" y="120" width="16" height="48" fill="#cbd5e1" stroke="#334155" stroke-width="2"/>
    <polygon points="244,168 256,168 250,186" fill="#ef4444"/>
  </svg>`;
};

// Render Watermark layer based on cert config
export const getCertificateWatermarkSvg = (cert: TrainingCertificate): string => {
  const type = cert.watermarkType || 'hexagon_global_cmm';
  if (type === 'none') return '';
  if (type === 'custom' && cert.watermarkUrl) {
    return `<img src="${cert.watermarkUrl}" style="max-width:85%;max-height:85%;object-fit:contain;pointer-events:none;" alt="Watermark"/>`;
  }
  if (type === 'hexagon_arm') return generateHexagonArmWatermarkSvg();
  if (type === 'shining_freescan') return generateShiningFreescanWatermarkSvg();
  if (type === 'leica_tracker') return generateLeicaTrackerWatermarkSvg();
  if (type === 'topsolid_cnc') return generateTopSolidCncWatermarkSvg();
  // Default: Hexagon Global Bridge CMM (matching Image 3)
  return generateHexagonGlobalWatermarkSvg();
};

// Render Left Logo based on cert config
export const getLeftLogoSvg = (cert: TrainingCertificate): string => {
  const logo = cert.leftLogo || 'hexagon';
  if (logo === 'none') return '';
  if (logo === 'custom' && cert.customLeftLogoUrl) {
    return `<img src="${cert.customLeftLogoUrl}" style="max-height:50px;max-width:180px;object-fit:contain;" alt="Left Logo"/>`;
  }
  if (logo === 'ds_engineering') return generateDsEmblemSvg();
  if (logo === 'shining3d') return generateShining3dLogoSvg();
  if (logo === 'leica') return generateLeicaLogoSvg();
  if (logo === 'pmt') return generatePmtLogoSvg();
  if (logo === 'topsolid') return generateTopSolidLogoSvg();
  if (logo === '3dsystems') return generateGeomagicLogoSvg();
  return generateHexagonLogoSvg();
};

// Render Right Logo based on cert config
export const getRightLogoSvg = (cert: TrainingCertificate): string => {
  const logo = cert.rightLogo || 'polyworks';
  if (logo === 'none') return '';
  if (logo === 'custom' && cert.customRightLogoUrl) {
    return `<img src="${cert.customRightLogoUrl}" style="max-height:50px;max-width:180px;object-fit:contain;" alt="Right Logo"/>`;
  }
  if (logo === 'geomagic') return generateGeomagicLogoSvg();
  if (logo === 'topsolid') return generateTopSolidLogoSvg();
  if (logo === 'arshin') {
    return `<div style="text-align:right;"><div style="font-size:18px;font-weight:900;color:#0f766e;">ФГИС «АРШИН»</div><div style="font-size:8px;font-weight:700;color:#64748b;">Росстандарт РФ</div></div>`;
  }
  return generatePolyworksLogoSvg();
};

// Russian Date Formatter (removes raw ISO strings like 2026-05-29T00:00:00.000Z)
export const formatRussianDate = (rawDate?: string): string => {
  if (!rawDate) return '29 мая 2026 г.';
  const cleaned = rawDate.replace(/[TZ].*$/i, '').replace(/г\.?$/i, '').trim();
  const parts = cleaned.split(/[-./]/);
  if (parts.length === 3) {
    let year = 0, month = 0, day = 0;
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else if (parts[2].length === 4) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
    if (year && month >= 0 && month <= 11 && day) {
      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
      return `${day} ${months[month]} ${year} г.`;
    }
  }
  return rawDate.includes('г') ? rawDate : `${rawDate} г.`;
};

export const generateCertificateHtml = (
  cert: TrainingCertificate,
  options?: { hideFloatingActionBtn?: boolean }
): string => {
  const theme = cert.templateTheme || 'classic_engineering';
  const primaryColor = cert.customPrimaryColor || (
    theme === 'corporate_gold' ? '#0369a1' :
    theme === 'modern_polyworks' ? '#1e3a8a' :
    theme === 'tech_scanning' ? '#334155' : '#0f172a'
  );
  
  const accentColor = theme === 'corporate_gold' ? '#d97706' : 
                      theme === 'modern_polyworks' ? '#dc2626' : primaryColor;

  const defaultBody = `<p>Настоящее свидетельство подтверждает то, что специалист <strong>${cert.customer || 'ООО «АВТОСВЕТ»'}</strong>, прошёл теоретический и практический курс обучения по правилам эксплуатации, технологической безопасности и работе со стационарной координатно-измерительной машиной <strong>HEXAGON GLOBAL</strong> с использованием программного обеспечения <strong>PolyWorks Metrology Probing++</strong>, и допущен к работе на данном оборудовании.</p>`;

  const bodyContent = cert.trainingProgramText || defaultBody;
  const watermarkOpacity = (cert.watermarkOpacity !== undefined ? cert.watermarkOpacity : 20) / 100;
  const watermarkMarkup = getCertificateWatermarkSvg(cert);
  const leftLogoMarkup = getLeftLogoSvg(cert);
  const rightLogoMarkup = getRightLogoSvg(cert);

  const signatoryName = cert.signatoryName || 'С.Ю. Некрасов';
  const signatoryPosition = cert.signatoryPosition || 'Генеральный директор';
  const signatoryCompany = cert.signatoryCompany || 'ООО «ДС-Инжиниринг»';
  const traineeFontSize = cert.traineeNameFontSize || 26;
  const bodyTextFontSize = cert.bodyTextFontSize || 14;
  const bodyTextMarginTop = cert.bodyTextMarginTop !== undefined ? cert.bodyTextMarginTop : 7;
  const hideBtn = options?.hideFloatingActionBtn !== undefined ? options.hideFloatingActionBtn : false;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Свидетельство_${cert.certificateNumber}</title>
  <style>
    @page { 
      size: A4 landscape; 
      margin: 0; 
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    html, body { 
      font-family: "Segoe UI", Roboto, Arial, "Helvetica Neue", sans-serif; 
      margin: 0 !important; 
      padding: 0 !important; 
      width: 297mm !important; 
      height: 210mm !important; 
      background: #ffffff; 
      color: #0f172a;
      overflow: hidden !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box !important;
    }
    .page-sheet {
      width: 297mm;
      height: 210mm;
      padding: 10mm; /* Strictly 10 mm from the borders of A4 sheet */
      position: relative;
      background: #ffffff;
      overflow: hidden !important;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
    /* Themed border frame */
    .certificate-border-frame {
      width: 100%;
      height: 100%;
      ${theme === 'classic_engineering' ? `
        border: 4px double #000000;
        padding: 5mm 11mm 3.5mm 11mm;
      ` : theme === 'corporate_gold' ? `
        border: 2pt solid ${primaryColor};
        box-shadow: inset 0 0 0 1pt #ffffff, inset 0 0 0 2pt ${accentColor};
        padding: 5.5mm 11.5mm 4mm 11.5mm;
      ` : theme === 'modern_polyworks' ? `
        border-top: 4pt solid ${primaryColor};
        border-bottom: 4pt solid ${accentColor};
        border-left: 1pt solid #cbd5e1;
        border-right: 1pt solid #cbd5e1;
        padding: 6mm 12mm 4.5mm 12mm;
      ` : `
        border: 2pt solid ${primaryColor};
        padding: 6mm 12mm 4.5mm 12mm;
      `}
      position: relative;
      background: #ffffff;
      overflow: hidden;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Central technical watermark layer */
    .watermark-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 65%;
      height: 65%;
      opacity: ${watermarkOpacity};
      pointer-events: none;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Content wrapper sitting above watermark */
    .cert-content {
      position: relative;
      z-index: 3;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    /* Header with Partner Logos */
    .cert-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 2mm;
    }
    .logo-left-box {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      min-width: 55mm;
      min-height: 15mm;
    }
    .logo-right-box {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 55mm;
      min-height: 15mm;
      text-align: right;
    }

    /* Title section: bold black "СВИДЕТЕЛЬСТВО", subtitle "выдано" */
    .cert-hero {
      text-align: center;
      margin: 1.5mm 0 1mm 0;
    }
    .cert-heading {
      font-size: 34px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #0f172a;
      margin: 0;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .cert-subheading {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
      letter-spacing: 0.5px;
    }

    /* Trainee name: large bold */
    .trainee-container {
      text-align: center;
      margin: 1.5mm auto 2mm auto;
      width: 92%;
    }
    .trainee-name {
      font-size: ${traineeFontSize}px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.3px;
      line-height: 1.2;
    }

    /* Program body text - lowered down with customizable font size and margin */
    .cert-body-text {
      font-size: ${bodyTextFontSize}px;
      line-height: 1.65;
      color: #0f172a;
      text-align: center;
      margin-top: ${bodyTextMarginTop}mm;
      margin-bottom: 3.5mm;
      padding: 0 8mm;
      max-width: 254mm;
      margin-left: auto;
      margin-right: auto;
    }
    .cert-body-text p {
      margin: 0 0 2mm 0;
    }
    .cert-body-text strong {
      font-weight: 800;
    }
    .cert-body-text ul {
      margin: 1.5mm 0 2mm 0;
      padding-left: 6mm;
      text-align: left;
      display: inline-block;
    }
    .cert-body-text li {
      margin-bottom: 1.2mm;
    }

    /* Footer: 3 columns matching classic engineering certificate layout */
    .cert-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 3mm;
      margin-top: auto;
    }
    .footer-left-col {
      width: 65mm;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 3mm;
      position: relative;
    }
    .footer-center-col {
      text-align: center;
      flex: 1;
      padding: 0 4mm;
    }
    .sig-box {
      display: inline-block;
      text-align: center;
      min-width: 65mm;
      position: relative;
    }
    .sig-wrapper {
      position: relative;
      z-index: 2;
    }
    /* Official circular stamp placed directly OVER the signature line */
    .stamp-on-sig {
      position: absolute;
      top: -26px;
      left: -22px;
      width: 104px;
      height: 104px;
      pointer-events: none;
      z-index: 5;
      opacity: 0.90;
      mix-blend-mode: multiply;
      transform: rotate(-5deg);
    }
    .sig-line {
      border-bottom: 0.5mm solid #0f172a;
      margin-bottom: 2mm;
      width: 60mm;
      margin-left: auto;
      margin-right: auto;
    }
    .sig-name {
      font-size: 14.5px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 1px;
    }
    .sig-position {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      line-height: 1.3;
    }
    .sig-company {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
    }

    .footer-right-col {
      width: 65mm;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: flex-end;
      text-align: right;
    }
    .cert-date-series {
      font-size: 12.5px;
      font-weight: 700;
      line-height: 1.45;
      color: #0f172a;
    }

    /* Bottom footnote */
    .bottom-footnote {
      text-align: center;
      font-size: 8.5px;
      color: #64748b;
      margin-top: 2.5mm;
      border-top: 0.3mm solid #cbd5e1;
      padding-top: 1.5mm;
      letter-spacing: 0.2px;
    }

    /* Floating print action button (hidden in actual print) */
    .no-print-bar {
      position: fixed;
      top: 15px;
      right: 15px;
      display: flex;
      gap: 10px;
      z-index: 9999;
    }
    .action-btn {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);
      font-family: inherit;
    }
    .action-btn:hover {
      background: #0369a1;
    }

    @media print {
      .no-print-bar { display: none !important; }
      html, body { 
        width: 297mm !important; 
        height: 210mm !important; 
        margin: 0 !important; 
        padding: 0 !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }
      .page-sheet { 
        width: 297mm !important;
        height: 210mm !important;
        padding: 10mm !important; /* Exactly 10mm from A4 border */
        overflow: hidden !important;
        box-sizing: border-box !important;
      }
      .certificate-border-frame {
        box-sizing: border-box !important;
        overflow: hidden !important;
        ${theme === 'classic_engineering' ? `
          border: 4px double #000000 !important;
          padding: 5mm 11mm 3.5mm 11mm !important;
        ` : theme === 'corporate_gold' ? `
          border: 2pt solid ${primaryColor} !important;
          box-shadow: inset 0 0 0 1pt #ffffff, inset 0 0 0 2pt ${accentColor} !important;
          padding: 5.5mm 11.5mm 4mm 11.5mm !important;
        ` : theme === 'modern_polyworks' ? `
          border-top: 4pt solid ${primaryColor} !important;
          border-bottom: 4pt solid ${accentColor} !important;
          border-left: 1pt solid #cbd5e1 !important;
          border-right: 1pt solid #cbd5e1 !important;
          padding: 6mm 12mm 4.5mm 12mm !important;
        ` : `
          border: 2pt solid ${primaryColor} !important;
          padding: 6mm 12mm 4.5mm 12mm !important;
        `}
      }
    }
  </style>
</head>
<body>
  ${!hideBtn ? `
  <div class="no-print-bar">
    <button class="action-btn" onclick="window.print()">🖨️ Распечатать свидетельство</button>
  </div>
  ` : ''}

  <div class="page-sheet" id="certificate-print-area">
    <div class="certificate-border-frame">
      <!-- Central Equipment Watermark Layer -->
      ${watermarkMarkup ? `
        <div class="watermark-container">
          ${watermarkMarkup}
        </div>
      ` : ''}

      <div class="cert-content">
          <!-- Top Header: Left Partner Logo & Right Partner Logo -->
          <div class="cert-header">
            <div class="logo-left-box">
              ${leftLogoMarkup}
            </div>
            <div class="logo-right-box">
              ${rightLogoMarkup}
            </div>
          </div>

          <!-- Certificate Title & Subtitle -->
          <div class="cert-hero">
            <h1 class="cert-heading">
              ${cert.certificateTitle || (
                cert.certificateType === 'briefing' ? 'СВИДЕТЕЛЬСТВО ОБ ИНСТРУКТАЖЕ' :
                cert.certificateType === 'qualification' ? 'УДОСТОВЕРЕНИЕ О КВАЛИФИКАЦИИ' :
                cert.certificateType === 'software_cert' ? 'СЕРТИФИКАТ ПОЛЬЗОВАТЕЛЯ ПО' : 'СВИДЕТЕЛЬСТВО'
              )}
            </h1>
            <div class="cert-subheading">
              ${cert.certificateGivenToText || cert.headerSubtitle || 'выдано'}
            </div>
          </div>

          <!-- Trainee Info -->
          <div class="trainee-container">
            <div class="trainee-name">${cert.traineeName || 'ФИО Обучающегося'}</div>
          </div>

          <!-- Body Text (WYSIWYG formatted text) -->
          <div class="cert-body-text">
            ${bodyContent}
          </div>

          <!-- Footer Area: DS Logo, General Director Signature with Stamp, Date & Series -->
          <div class="cert-footer">
            <!-- Left: DS Engineering Emblem -->
            <div class="footer-left-col">
              ${cert.showDsLogoBottom !== false ? (
                cert.customDsLogoUrl ? `<img src="${cert.customDsLogoUrl}" style="width:80px;height:80px;object-fit:contain;" alt="DS Logo"/>` :
                `<img src="/images/emblem.svg" style="width:80px;height:80px;object-fit:contain;" alt="DS Logo" onerror="this.onerror=null;this.parentElement.innerHTML='${generateDsEmblemSvg().replace(/"/g, '&quot;')}';"/>`
              ) : '<div style="width:80px;height:80px;"></div>'}
            </div>

            <!-- Center: Signature of General Director with Official Stamp on signature -->
            <div class="footer-center-col">
              <div class="sig-box">
                ${cert.showStamp !== false ? `
                  <div class="stamp-on-sig">
                    ${cert.customStampUrl ? `<img src="${cert.customStampUrl}" style="width:104px;height:104px;object-fit:contain;" alt="Печать"/>` :
                    generateCompanyStampSvg()}
                  </div>
                ` : ''}

                <div class="sig-wrapper">
                  ${cert.showSignature !== false ? (
                    cert.customSignatureUrl ? `<img src="${cert.customSignatureUrl}" style="width:130px;height:45px;object-fit:contain;display:block;margin:0 auto -10px auto;position:relative;z-index:2;" alt="Signature"/>` :
                    generateSignatureSvg()
                  ) : '<div style="height:35px;"></div>'}
                  <div class="sig-line"></div>
                </div>

                <div class="sig-name">${signatoryName}</div>
                <div class="sig-position">${signatoryPosition}</div>
                <div class="sig-company">${signatoryCompany}</div>
              </div>
            </div>

            <!-- Right: Date and Series Number (Clean Russian format) -->
            <div class="footer-right-col">
              <div class="cert-date-series">
                <div>Дата: ${formatRussianDate(cert.date)}</div>
                <div>Серия: № ${cert.certificateNumber || '2026-000142'}</div>
                ${cert.validUntil && cert.validUntil !== 'Бессрочно' ? `<div style="font-size:10.5px;color:#64748b;margin-top:2px;">Срок: ${cert.validUntil}</div>` : ''}
              </div>
            </div>
          </div>

          <!-- Bottom-most footnote with company address and website -->
          <div class="bottom-footnote">
            ${cert.footerAddressText || cert.footerNote || 'ООО «ДС-Инжиниринг», 443051, г. Самара, ул. Свободы, 198, 8 (846) 954-02-92, info@ds-enginering.ru, http://ds-enginering.ru'}
          </div>
        </div>
      </div>
    </div>
</body>
</html>`;
};

// Direct print in new window or printable frame
export const printCertificateInWindow = (cert: TrainingCertificate): void => {
  const html = generateCertificateHtml(cert);
  const printWindow = window.open('', '_blank', 'width=1150,height=820,menubar=no,toolbar=no,location=no,status=no');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 450);
  } else {
    // Fallback if popups blocked: inject print container into current document
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.top = '0';
    printFrame.style.left = '0';
    printFrame.style.width = '100%';
    printFrame.style.height = '100%';
    printFrame.style.zIndex = '99999';
    printFrame.style.border = 'none';
    printFrame.style.background = '#fff';
    document.body.appendChild(printFrame);
    
    const doc = printFrame.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 3000);
      }, 500);
    }
  }
};

// Download self-contained HTML file for offline viewing and instant printing
export const downloadCertificateHtml = (cert: TrainingCertificate): void => {
  const html = generateCertificateHtml(cert);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Свидетельство_${cert.certificateNumber.replace(/[\s/\\:]+/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// High-resolution PDF download using DOM element rendering
export const downloadCertificatePdf = async (cert: TrainingCertificate, targetElement?: HTMLElement | null): Promise<void> => {
  let el = targetElement;
  let tempWrapper: HTMLDivElement | null = null;

  if (!el) {
    tempWrapper = document.createElement('div');
    tempWrapper.style.position = 'fixed';
    tempWrapper.style.top = '0';
    tempWrapper.style.left = '0';
    tempWrapper.style.width = '297mm';
    tempWrapper.style.height = '210mm';
    tempWrapper.style.zIndex = '-9999';
    tempWrapper.style.opacity = '0.01';
    tempWrapper.style.pointerEvents = 'none';
    tempWrapper.innerHTML = generateCertificateHtml(cert);
    document.body.appendChild(tempWrapper);
    el = (tempWrapper.querySelector('#certificate-print-area') as HTMLElement) || tempWrapper;
  }

  try {
    const canvas = await html2canvas(el, {
      scale: 2, // 300 DPI equivalent
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
    pdf.save(`Свидетельство_${cert.certificateNumber.replace(/[\s/\\:]+/g, '_')}.pdf`);
  } catch (error) {
    console.error('PDF Canvas generation error, falling back to HTML download:', error);
    downloadCertificateHtml(cert);
    throw error;
  } finally {
    if (tempWrapper && document.body.contains(tempWrapper)) {
      document.body.removeChild(tempWrapper);
    }
  }
};

// High-resolution PNG image download
export const downloadCertificatePng = async (cert: TrainingCertificate, targetElement?: HTMLElement | null): Promise<void> => {
  let el = targetElement;
  let tempWrapper: HTMLDivElement | null = null;

  if (!el) {
    tempWrapper = document.createElement('div');
    tempWrapper.style.position = 'fixed';
    tempWrapper.style.top = '0';
    tempWrapper.style.left = '0';
    tempWrapper.style.width = '297mm';
    tempWrapper.style.height = '210mm';
    tempWrapper.style.zIndex = '-9999';
    tempWrapper.style.opacity = '0.01';
    tempWrapper.innerHTML = generateCertificateHtml(cert);
    document.body.appendChild(tempWrapper);
    el = (tempWrapper.querySelector('#certificate-print-area') as HTMLElement) || tempWrapper;
  }

  try {
    const canvas = await html2canvas(el, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Свидетельство_${cert.certificateNumber.replace(/[\s/\\:]+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  } finally {
    if (tempWrapper && document.body.contains(tempWrapper)) {
      document.body.removeChild(tempWrapper);
    }
  }
};
