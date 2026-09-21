import { Product } from '../types.ts';

export type AccuracyTier = 'ultra' | 'high' | 'basic';
export type FormFactor = 'stationary' | 'portable';

export interface ProductFacetData {
  accMm: number;
  accuracyTier: AccuracyTier;
  formFactor: FormFactor;
  isGostReestr: boolean;
}

export const ACCURACY_TIER_CONFIG: Record<
  AccuracyTier,
  { label: string; description: string; range: string }
> = {
  ultra: {
    label: 'Сверхточные (до 0,01 мм)',
    description: 'Метрологический высший класс (КИМ, оптические микросканеры)',
    range: '≤ 0,01 мм (до 10 мкм)',
  },
  high: {
    label: 'Высокоточные (0,01 мм — 0,05 мм)',
    description: 'Промышленные лазерные сканеры, мобильные КИМ и трекеры',
    range: '0,01 — 0,05 мм (10 — 50 мкм)',
  },
  basic: {
    label: 'Базовые (от 0,05 мм и выше)',
    description: 'Универсальные портативные сканеры и дальномерные системы',
    range: '> 0,05 мм',
  },
};

export const FORM_FACTOR_CONFIG: Record<
  FormFactor,
  { label: string; description: string }
> = {
  stationary: {
    label: 'Стационарные',
    description: 'Мостовые, стационарные КИМ, настольные сканеры с поворотным столом',
  },
  portable: {
    label: 'Портативные',
    description: 'Ручные лазерные сканеры, измерительные руки, трекеры',
  },
};

/**
 * Extracts metrology properties (accuracy in mm, form factor, and state register status)
 * for a hardware product.
 */
export function getProductMetrology(product: Product): ProductFacetData {
  const specsStr = product.specs ? JSON.stringify(product.specs) : '';
  const featuresStr = product.features ? product.features.join(' ') : '';
  const fullText = (
    product.name +
    ' ' +
    (product.badge || '') +
    ' ' +
    (product.categoryLabel || '') +
    ' ' +
    (product.shortDescription || '') +
    ' ' +
    (product.fullDescription || '') +
    ' ' +
    featuresStr +
    ' ' +
    specsStr
  ).toLowerCase();

  // 1. Numerical Accuracy Extraction (in mm)
  let accMm: number | null = null;

  // Check specs values for accuracy/error
  const candidateTexts: string[] = [];
  if (product.specs) {
    for (const [k, v] of Object.entries(product.specs)) {
      if (/точность|погрешность|mpe/i.test(k)) {
        candidateTexts.push(v);
      }
    }
  }
  if (product.badge) candidateTexts.push(product.badge);
  if (product.shortDescription) candidateTexts.push(product.shortDescription);
  candidateTexts.push(product.name);

  for (const text of candidateTexts) {
    if (!text) continue;

    // Look for microns: e.g. "0.9 + L/450 мкм", "5 мкм", "8 мкм", "10 мкм", "15 мкм", "16 мкм", "25 мкм"
    const mkmMatch = text.match(/([0-9]+(?:[\.,][0-9]+)?)\s*(?:\+\s*[^\s]+\s*)?мкм/i);
    if (mkmMatch) {
      const valMkm = parseFloat(mkmMatch[1].replace(',', '.'));
      accMm = valMkm / 1000;
      break;
    }

    // Look for millimeters: e.g. "0.020 мм", "0,014 мм", "0.005 мм", "±0.015 мм", "0.05 мм", "0.1 мм"
    const mmMatch = text.match(/([0-9]+[\.,][0-9]+)\s*мм/i);
    if (mmMatch) {
      accMm = parseFloat(mmMatch[1].replace(',', '.'));
      break;
    }
  }

  // Smart heuristic fallback based on product category & naming
  if (accMm === null) {
    if (product.category === 'cmm' || product.category === 'stationary_cmm') {
      accMm = 0.0015; // 1.5 мкм
    } else if (/staticscan|autoscan|inspec/i.test(product.name + ' ' + product.id)) {
      accMm = 0.010;
    } else if (/einstar/i.test(product.name + ' ' + product.id)) {
      accMm = 0.100;
    } else if (/trackerscan|tracker/i.test(product.name + ' ' + product.id)) {
      accMm = 0.035;
    } else if (/freescan|easyscan|rigil/i.test(product.name + ' ' + product.id)) {
      accMm = 0.020;
    } else if (/arm|рука/i.test(product.name + ' ' + product.id)) {
      accMm = 0.020;
    } else {
      accMm = 0.025;
    }
  }

  // Classify into exact tiers:
  // - Сверхточные (до 0,01 мм)
  // - Высокоточные (0,01 мм — 0,05 мм)
  // - Базовые (от 0,05 мм и выше)
  let accuracyTier: AccuracyTier = 'high';
  if (accMm <= 0.010001) {
    accuracyTier = 'ultra';
  } else if (accMm <= 0.050001) {
    accuracyTier = 'high';
  } else {
    accuracyTier = 'basic';
  }

  // 2. Form Factor
  // - Стационарные (мостовые, стационарные КИМ, настольные сканеры с поворотным столом, SLM принтеры, цеховые компараторы)
  // - Портативные (ручные сканеры, мобильные КИМ-руки, лазерные трекеры, портативные щупы)
  const isStationary =
    product.category === 'cmm' ||
    product.category === 'stationary_cmm' ||
    product.category === 'printers' ||
    (/staticscan|autoscan|robotscan|стационарн|мостов|портал|поворотн|настольн|equator|crysta/i.test(
      product.name + ' ' + product.id + ' ' + product.categoryLabel + ' ' + (product.badge || '')
    ) && !(product.category === 'scanners' && !/staticscan|autoscan/i.test(product.name + ' ' + product.id))) ||
    /einscan-se|einscan-sp/i.test(product.id);

  const formFactor: FormFactor = isStationary ? 'stationary' : 'portable';

  // 3. Metrological Status (Госреестр СИ РФ)
  const isGostReestr =
    /реестр|гост|поверк|свидетельство|iso 10360|приказ росстандарт|внесен|аршин/i.test(fullText) ||
    /pmt-|hexagon-|scanline-easyscan-ue|scanline-easyscan-combo|leica-|crysta/i.test(product.id);

  return {
    accMm,
    accuracyTier,
    formFactor,
    isGostReestr,
  };
}

export interface DetailedMetrologyMetrics {
  errorMicrons: number; // Погрешность MPE (в мкм, например 0.9, 1.7, 15, 20)
  speedKpts: number; // Скорость сканирования/измерений (тыс. точек/сек, например 3600, 1200, 50)
  resolutionMicrons: number; // Разрешение / шаг сетки (в мкм, например 10, 20, 50)
  rangeMm: number; // Рабочий диапазон / зона контроля (в мм, например 1200, 2500)
  weightKg: number; // Масса оборудования/датчика (в кг)
  // Нормализованные баллы 0-100 для лепестковой диаграммы (Radar)
  scorePrecision: number; // Прецизионность (меньше MPE = больше балл)
  scoreSpeed: number; // Производительность сбора данных
  scoreResolution: number; // Детализация мелких элементов
  scoreRange: number; // Охват рабочей зоны
  scoreMobility: number; // Мобильность и цеховая приспособленность
}

/**
 * Extracts normalized quantitative engineering metrics for Recharts comparison charts.
 */
export function getDetailedMetrologyMetrics(product: Product): DetailedMetrologyMetrics {
  const facet = getProductMetrology(product);
  const specsStr = product.specs ? JSON.stringify(product.specs) : '';
  const featuresStr = product.features ? product.features.join(' ') : '';
  const fullText = (
    product.name +
    ' ' +
    (product.badge || '') +
    ' ' +
    (product.shortDescription || '') +
    ' ' +
    (product.fullDescription || '') +
    ' ' +
    featuresStr +
    ' ' +
    specsStr
  ).toLowerCase();

  // 1. Error in microns (MPE)
  const errorMicrons = Math.round(facet.accMm * 1000 * 10) / 10;

  // 2. Speed (kpts/s)
  let speedKpts = 200; // default
  const speedMatch = fullText.match(/([0-9\s]+)\s*точек\/с/);
  if (speedMatch) {
    const rawVal = parseInt(speedMatch[1].replace(/\s+/g, ''), 10);
    if (!isNaN(rawVal) && rawVal > 0) {
      speedKpts = Math.round(rawVal / 1000);
    }
  } else if (facet.formFactor === 'stationary') {
    speedKpts = /revo|sp25/i.test(fullText) ? 150 : 50; // high-speed continuous CMM tactile scanning
  } else if (/рука|arm/i.test(fullText)) {
    speedKpts = 100; // tactile arm trigger rate
  }

  // 3. Resolution (microns)
  let resolutionMicrons = 50;
  if (facet.formFactor === 'stationary' && facet.accuracyTier === 'ultra') {
    resolutionMicrons = 0.01; // Renishaw submicron scale
  } else {
    const resMmMatch = fullText.match(/(?:разрешение|шаг|расстояние между точками)[^0-9]*([0-9]+(?:[\.,][0-9]+)?)\s*мм/i);
    if (resMmMatch) {
      resolutionMicrons = Math.round(parseFloat(resMmMatch[1].replace(',', '.')) * 1000);
    } else {
      const resMkmMatch = fullText.match(/(?:разрешение|шаг)[^0-9]*([0-9]+(?:[\.,][0-9]+)?)\s*мкм/i);
      if (resMkmMatch) {
        resolutionMicrons = parseFloat(resMkmMatch[1].replace(',', '.'));
      } else if (facet.accuracyTier === 'ultra') {
        resolutionMicrons = 10;
      } else if (facet.accuracyTier === 'high') {
        resolutionMicrons = 20;
      } else {
        resolutionMicrons = 100;
      }
    }
  }

  // 4. Measuring Range (mm)
  let rangeMm = 1500;
  const rangeMatch = fullText.match(/(?:диапазон|рабоч|объем|зона)[^0-9]*([0-9]+)\s*(?:х|×|\*)\s*([0-9]+)/i);
  if (rangeMatch) {
    const v1 = parseInt(rangeMatch[1], 10);
    const v2 = parseInt(rangeMatch[2], 10);
    rangeMm = Math.max(v1, v2);
  } else {
    const meterMatch = fullText.match(/([0-9]+(?:[\.,][0-9]+)?)\s*м(?:\s*\(|[,\s]|$)/i);
    if (meterMatch && parseFloat(meterMatch[1].replace(',', '.')) >= 1 && parseFloat(meterMatch[1].replace(',', '.')) <= 80) {
      rangeMm = Math.round(parseFloat(meterMatch[1].replace(',', '.')) * 1000);
    } else if (/tracker/i.test(product.id + product.name)) {
      rangeMm = 30000;
    } else if (/loong/i.test(product.id)) {
      rangeMm = 10000;
    } else if (facet.formFactor === 'stationary') {
      rangeMm = 1500;
    } else if (/arm|рука/i.test(product.name + product.id)) {
      rangeMm = 2500;
    } else {
      rangeMm = 800;
    }
  }

  // 5. Weight (kg)
  let weightKg = 1.0;
  const weightMatch = fullText.match(/(?:вес|масса)[^0-9]*([0-9]+(?:[\.,][0-9]+)?)\s*(кг|г)/i);
  if (weightMatch) {
    const num = parseFloat(weightMatch[1].replace(',', '.'));
    weightKg = weightMatch[2].toLowerCase() === 'г' ? num / 1000 : num;
  } else if (facet.formFactor === 'stationary') {
    weightKg = /loong/i.test(product.id) ? 3500 : 1200;
  } else if (/arm|рука/i.test(product.name + product.id)) {
    weightKg = 8.5;
  } else {
    weightKg = 0.85;
  }

  // 6. Normalized Scores (0-100) for Spider Radar
  // Precision: lower error = higher score
  let scorePrecision = Math.min(100, Math.max(25, Math.round(100 - (facet.accMm / 0.1) * 75)));
  if (facet.accMm <= 0.002) scorePrecision = 99; // Mitutoyo / PMT Future Plus
  else if (facet.accMm <= 0.006) scorePrecision = 95;
  else if (facet.accMm <= 0.015) scorePrecision = 90;
  else if (facet.accMm <= 0.025) scorePrecision = 84;
  else if (facet.accMm <= 0.050) scorePrecision = 72;
  else scorePrecision = 45;

  // Speed: higher kpts = higher score
  let scoreSpeed = 50;
  if (speedKpts >= 3000) scoreSpeed = 98;
  else if (speedKpts >= 1800) scoreSpeed = 92;
  else if (speedKpts >= 1000) scoreSpeed = 85;
  else if (speedKpts >= 500) scoreSpeed = 75;
  else if (speedKpts >= 100) scoreSpeed = 65;
  else scoreSpeed = 50; // tactile CMM

  // Resolution: finer resolution = higher score
  let scoreResolution = 70;
  if (resolutionMicrons <= 0.1) scoreResolution = 99;
  else if (resolutionMicrons <= 10) scoreResolution = 94;
  else if (resolutionMicrons <= 25) scoreResolution = 88;
  else if (resolutionMicrons <= 50) scoreResolution = 78;
  else scoreResolution = 55;

  // Range: larger zone = higher score
  let scoreRange = 60;
  if (rangeMm >= 20000) scoreRange = 98;
  else if (rangeMm >= 8000) scoreRange = 92;
  else if (rangeMm >= 2500) scoreRange = 85;
  else if (rangeMm >= 1200) scoreRange = 74;
  else scoreRange = 55;

  // Mobility: portable handheld = 98, arms = 82, stationary = 35
  let scoreMobility = 50;
  if (weightKg <= 1.0) scoreMobility = 98;
  else if (weightKg <= 10) scoreMobility = 82; // mobile arm
  else if (/prime/i.test(product.id)) scoreMobility = 50; // shop-floor CMM
  else scoreMobility = 35; // metrology room CMM

  return {
    errorMicrons,
    speedKpts,
    resolutionMicrons,
    rangeMm,
    weightKg,
    scorePrecision,
    scoreSpeed,
    scoreResolution,
    scoreRange,
    scoreMobility,
  };
}
