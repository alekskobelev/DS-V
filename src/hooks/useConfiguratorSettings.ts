import { useState, useEffect, useCallback } from 'react';
import { fetchWithCsrf } from '../services/csrfService';

export interface SiEquipmentCategoryConfig {
  id: string; // 'cmm_bridge' | 'optical_scanner' | 'laser_tracker' | 'measuring_arm' | etc.
  name: string;
  category: string;
  brand: string;
  enabled: boolean;
  accuracyFormula: string;
  mpeUm: number;
  // ROI Technical Coefficients:
  capexRub: number;
  manualInspectionTimeMin: number;
  autoInspectionTimeMin: number;
  scrapReductionPercent: number;
  cncDowntimeReductionHoursPerMonth: number;
  annualMaintenancePercent: number;
}

export interface MetrologyConfiguratorSettings {
  // Default Part Dimensions & Properties in Configurator
  defaultLengthMm: number;
  defaultWidthMm: number;
  defaultHeightMm: number;
  defaultWeightKg: number;
  defaultPartType: 'housing' | 'mold_die' | 'impeller_blade' | 'frame_weldment' | 'sheet_metal' | 'tooling_shaft';
  defaultSurfaceType: 'machined_matte' | 'mirror_glossy' | 'dark_carbon' | 'transparent';
  defaultWorkshopEnvironment: 'metrology_lab' | 'shop_floor' | 'on_machine' | 'onsite_field';
  defaultScanDensityNeed: 'inspection_points' | 'full_colormap' | 'both';

  // Tolerances & RMG 29 Ratios
  it5Um: number;
  it7Um: number;
  it9Um: number;
  it12Um: number;
  optimalReserveRatio: number; // e.g. 3.0x
  acceptableReserveRatio: number; // e.g. 1.8x
  cmmMpeFormula: string;
  scannerMpeUm: number;
  armMpeUm: number;
  trackerMpeFormula: string;
  climateStandardText: string;
  probeCalibrationText: string;
  datumAlignmentText: string;

  // Available SI Categories & ROI Coefficients
  categories: SiEquipmentCategoryConfig[];
}

export interface RoiCalculatorSettings {
  hourlyLaborRateRub: number;
  defaultScrapRatePercent: number;
  scrapReductionTargetPercent: number;
  defaultPartScrapCostRub: number;
  cmmCapexRub: number;
  scannerCapexRub: number;
  trackerCapexRub: number;
  armCapexRub: number;
  paybackTargetMonths: number;
}

export interface ServiceCalculatorSettings {
  scanBaseSmallRub: number;
  scanBaseMediumRub: number;
  scanBaseLargeRub: number;
  scanBaseHugeRub: number;
  onsiteMinTotalRub: number;
  onsiteExtraFeeRub: number;
  reverseBasePrismaticRub: number;
  reverseBaseCastRub: number;
  reverseBaseFreeformRub: number;
  defaultVatRatePercent: number;
}

export interface ConfiguratorsGlobalSettings {
  metrology: MetrologyConfiguratorSettings;
  roi: RoiCalculatorSettings;
  services: ServiceCalculatorSettings;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_SI_CATEGORIES: SiEquipmentCategoryConfig[] = [
  {
    id: 'cmm_bridge',
    name: 'Стационарные мостовые КИМ с ЧПУ (PMT Alpha / Horizon)',
    category: 'Мостовые координатно-измерительные машины',
    brand: 'PMT (Пекин / Самара)',
    enabled: true,
    accuracyFormula: 'MPEE = 1.2 + L / 350 мкм (ГОСТ Р ИСО 10360-2)',
    mpeUm: 2.1,
    capexRub: 8500000,
    manualInspectionTimeMin: 40,
    autoInspectionTimeMin: 7,
    scrapReductionPercent: 65,
    cncDowntimeReductionHoursPerMonth: 28,
    annualMaintenancePercent: 3.5
  },
  {
    id: 'optical_scanner',
    name: 'Метрологические лазерные 3D-сканеры (Shining 3D FreeScan / ScanLine)',
    category: 'Ручные и оптические лазерные 3D-сканеры',
    brand: 'Shining 3D / ScanLine',
    enabled: true,
    accuracyFormula: 'Объемная точность до 0.020 мм + 0.040 мм/м',
    mpeUm: 18,
    capexRub: 4200000,
    manualInspectionTimeMin: 50,
    autoInspectionTimeMin: 10,
    scrapReductionPercent: 70,
    cncDowntimeReductionHoursPerMonth: 32,
    annualMaintenancePercent: 4.0
  },
  {
    id: 'laser_tracker',
    name: 'Лазерные трекеры и интерферометры (Leica Absolute Tracker AT960)',
    category: 'Лазерные трекеры и интерферометры',
    brand: 'Leica Geosystems (Hexagon)',
    enabled: true,
    accuracyFormula: 'U = 15 мкм + 6 мкм/м (ГОСТ Р ИСО 10360-10)',
    mpeUm: 25,
    capexRub: 16500000,
    manualInspectionTimeMin: 120,
    autoInspectionTimeMin: 25,
    scrapReductionPercent: 75,
    cncDowntimeReductionHoursPerMonth: 45,
    annualMaintenancePercent: 3.0
  },
  {
    id: 'measuring_arm',
    name: 'Шарнирные измерительные руки КИМ (PMT Alpha Arm 7-Axis)',
    category: 'Шарнирные мобильные измерительные руки',
    brand: 'PMT Arm',
    enabled: true,
    accuracyFormula: 'Точность одной точки 0.018 мм, объемная 0.025 мм',
    mpeUm: 22,
    capexRub: 6800000,
    manualInspectionTimeMin: 35,
    autoInspectionTimeMin: 8,
    scrapReductionPercent: 60,
    cncDowntimeReductionHoursPerMonth: 22,
    annualMaintenancePercent: 4.5
  }
];

export const DEFAULT_CONFIGURATOR_SETTINGS: ConfiguratorsGlobalSettings = {
  metrology: {
    defaultLengthMm: 450,
    defaultWidthMm: 320,
    defaultHeightMm: 180,
    defaultWeightKg: 25,
    defaultPartType: 'housing',
    defaultSurfaceType: 'machined_matte',
    defaultWorkshopEnvironment: 'shop_floor',
    defaultScanDensityNeed: 'full_colormap',

    it5Um: 4,
    it7Um: 15,
    it9Um: 45,
    it12Um: 180,
    optimalReserveRatio: 3.0,
    acceptableReserveRatio: 1.8,
    cmmMpeFormula: 'MPEE = 1.2 + L / 350 мкм',
    scannerMpeUm: 18,
    armMpeUm: 22,
    trackerMpeFormula: 'U = 15 мкм + 6 мкм/м',
    climateStandardText: 'Термостатирование заготовки в ЦЗЛ при 20 ± 0.5 °C не менее 8 часов перед чистовым контролем.',
    probeCalibrationText: 'Калибровка щупа по эталонной сферической калибровочной мере Ø19 мм с фиксацией отклонений формы.',
    datumAlignmentText: 'Определение координатных баз по правилу 3-2-1 в строго зафиксированной системе координат детали [A][B][C].',
    categories: DEFAULT_SI_CATEGORIES
  },
  roi: {
    hourlyLaborRateRub: 850,
    defaultScrapRatePercent: 4.5,
    scrapReductionTargetPercent: 65,
    defaultPartScrapCostRub: 14500,
    cmmCapexRub: 8500000,
    scannerCapexRub: 4200000,
    trackerCapexRub: 16500000,
    armCapexRub: 6800000,
    paybackTargetMonths: 18
  },
  services: {
    scanBaseSmallRub: 5000,
    scanBaseMediumRub: 9000,
    scanBaseLargeRub: 18000,
    scanBaseHugeRub: 35000,
    onsiteMinTotalRub: 25000,
    onsiteExtraFeeRub: 12000,
    reverseBasePrismaticRub: 16000,
    reverseBaseCastRub: 30000,
    reverseBaseFreeformRub: 52000,
    defaultVatRatePercent: 22
  }
};

export function useConfiguratorSettings() {
  const [settings, setSettings] = useState<ConfiguratorsGlobalSettings>(DEFAULT_CONFIGURATOR_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchWithCsrf('/api/cms/store/configurators_settings');
      if (res.ok) {
        const json = await res.json();
        const raw = json?.value || json?.data || json;
        if (raw && raw.metrology) {
          setSettings({
            metrology: { 
              ...DEFAULT_CONFIGURATOR_SETTINGS.metrology, 
              ...raw.metrology,
              categories: Array.isArray(raw.metrology?.categories) && raw.metrology.categories.length > 0 
                ? raw.metrology.categories 
                : DEFAULT_SI_CATEGORIES
            },
            roi: { ...DEFAULT_CONFIGURATOR_SETTINGS.roi, ...raw.roi },
            services: { ...DEFAULT_CONFIGURATOR_SETTINGS.services, ...raw.services },
            updatedAt: raw.updatedAt,
            updatedBy: raw.updatedBy
          });
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('[useConfiguratorSettings] Error fetching API, falling back to localStorage:', err);
    }

    // LocalStorage fallback
    try {
      const local = localStorage.getItem('ds_configurator_settings');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && parsed.metrology) {
          setSettings({
            metrology: { 
              ...DEFAULT_CONFIGURATOR_SETTINGS.metrology, 
              ...parsed.metrology,
              categories: Array.isArray(parsed.metrology?.categories) && parsed.metrology.categories.length > 0
                ? parsed.metrology.categories
                : DEFAULT_SI_CATEGORIES
            },
            roi: { ...DEFAULT_CONFIGURATOR_SETTINGS.roi, ...parsed.roi },
            services: { ...DEFAULT_CONFIGURATOR_SETTINGS.services, ...parsed.services },
            updatedAt: parsed.updatedAt,
            updatedBy: parsed.updatedBy
          });
        }
      }
    } catch (e) {
      console.warn('[useConfiguratorSettings] Error parsing localStorage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return { settings, isLoading, reload: loadSettings };
}
