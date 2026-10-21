export interface EquipmentPresetItem {
  id: string;
  name: string;
  brand: string;
  category: 'software' | 'scanners' | 'cmm' | 'trackers' | 'cnc' | 'other';
  categoryLabel: string;
  type: 'ПО' | '3D-сканер' | 'КИМ' | 'Лазерный трекер' | 'Станок ЧПУ' | 'Прочее';
  description: string;
  defaultWarrantyMonths?: number;
}

export const EQUIPMENT_CATEGORIES: Array<{
  id: 'all' | 'software' | 'scanners' | 'cmm' | 'trackers' | 'cnc' | 'other';
  label: string;
  iconName: string;
  countBadge?: number;
}> = [
  { id: 'all', label: 'Все группы', iconName: 'Layers' },
  { id: 'software', label: 'ПО (CAD/CAM/CAE)', iconName: 'Monitor' },
  { id: 'scanners', label: '3D-сканеры', iconName: 'Scan' },
  { id: 'cmm', label: 'КИМ (Стационарные)', iconName: 'Crosshair' },
  { id: 'trackers', label: 'Трекеры и руки', iconName: 'Compass' },
  { id: 'cnc', label: 'Станки с ЧПУ', iconName: 'Cpu' },
  { id: 'other', label: 'Оснастка и датчики', iconName: 'Wrench' },
];

export const EQUIPMENT_PRESETS: EquipmentPresetItem[] = [
  // --- ПО ---
  {
    id: 'sw-polyworks-inspector',
    name: 'PolyWorks|Inspector™ Премиум',
    brand: 'InnovMetric Software',
    category: 'software',
    categoryLabel: 'ПО',
    type: 'ПО',
    description: 'Универсальная метрологическая 3D-платформа для контактных измерений и лазерного сканирования.',
    defaultWarrantyMonths: 12
  },
  {
    id: 'sw-polyworks-modeler',
    name: 'PolyWorks|Modeler™',
    brand: 'InnovMetric Software',
    category: 'software',
    categoryLabel: 'ПО',
    type: 'ПО',
    description: 'Модуль реверс-инжиниринга и прямого построения CAD-моделей по полигональным сеткам (NURBS).',
    defaultWarrantyMonths: 12
  },
  {
    id: 'sw-topsolid-cam',
    name: 'TopSolid 7 CAM (5-осевая мехобработка)',
    brand: 'TOPSOLID SAS',
    category: 'software',
    categoryLabel: 'ПО',
    type: 'ПО',
    description: 'Интегрированная CAD/CAM система сквозного проектирования и ЧПУ-обработки сложных корпусных деталей и штампов.',
    defaultWarrantyMonths: 12
  },
  {
    id: 'sw-geomagic-control-x',
    name: 'Geomagic Control X',
    brand: '3D Systems / Oqton',
    category: 'software',
    categoryLabel: 'ПО',
    type: 'ПО',
    description: 'Программное обеспечение контроля геометрии, анализа отклонений и подготовки протоколов GD&T.',
    defaultWarrantyMonths: 12
  },
  {
    id: 'sw-geomagic-design-x',
    name: 'Geomagic Design X',
    brand: '3D Systems / Oqton',
    category: 'software',
    categoryLabel: 'ПО',
    type: 'ПО',
    description: 'Флагманское ПО обратного инжиниринга с параметрическим деревом построения для SolidWorks/Inventor/NX.',
    defaultWarrantyMonths: 12
  },
  {
    id: 'sw-shining-inspect',
    name: 'SHINING 3D Inspect Suite',
    brand: 'SHINING 3D',
    category: 'software',
    categoryLabel: 'ПО',
    type: 'ПО',
    description: 'Специализированное метрологическое ПО для сканеров серий FreeScan и EinScan.',
    defaultWarrantyMonths: 24
  },

  // --- 3D-СКА irony ---
  {
    id: 'scan-freescan-combo',
    name: 'FreeScan Combo (Лазер + VCSEL)',
    brand: 'SHINING 3D',
    category: 'scanners',
    categoryLabel: '3D-сканеры',
    type: '3D-сканер',
    description: 'Гибридный метрологический 3D-сканер: 26 синих лазерных линий + инфракрасный VCSEL источник. Точность до 0.02 мм.',
    defaultWarrantyMonths: 24
  },
  {
    id: 'scan-freescan-ue-pro',
    name: 'FreeScan UE Pro (Фотограмметрия)',
    brand: 'SHINING 3D',
    category: 'scanners',
    categoryLabel: '3D-сканеры',
    type: '3D-сканер',
    description: 'Лазерный метрологический сканер со встроенной масштабной фотограмметрией для крупногабаритных объектов.',
    defaultWarrantyMonths: 24
  },
  {
    id: 'scan-einscan-hx',
    name: 'EinScan HX (Гибридный синий лазер + LED)',
    brand: 'SHINING 3D',
    category: 'scanners',
    categoryLabel: '3D-сканеры',
    type: '3D-сканер',
    description: 'Ручной цветной 3D-сканер для реверс-инжиниринга деталей сложной формы и черных/блестящих поверхностей.',
    defaultWarrantyMonths: 12
  },
  {
    id: 'scan-einscan-pro-hd',
    name: 'EinScan Pro HD Multi-Functional',
    brand: 'SHINING 3D',
    category: 'scanners',
    categoryLabel: '3D-сканеры',
    type: '3D-сканер',
    description: 'Многофункциональный модульный оптический 3D-сканер высокого разрешения со штативом и поворотным столом.',
    defaultWarrantyMonths: 12
  },
  {
    id: 'scan-autoscan-inspec',
    name: 'AutoScan Inspec (Автоматический лабораторный)',
    brand: 'SHINING 3D',
    category: 'scanners',
    categoryLabel: '3D-сканеры',
    type: '3D-сканер',
    description: '3-осевой автоматический настольный сканер для мелких высокоточных деталей и турбинных лопаток.',
    defaultWarrantyMonths: 24
  },

  // --- КИМ ---
  {
    id: 'cmm-pmt-future-plus',
    name: 'PMT Future Plus 9106 (Портальная КИМ)',
    brand: 'PMT Precision Metrology',
    category: 'cmm',
    categoryLabel: 'КИМ',
    type: 'КИМ',
    description: 'Высокоточная гранитная мостовая КИМ с ЧПУ (диапазон 900x1000x600 мм, MPEe от (1.4+3L/1000) мкм, Renishaw PH10M/SP25M).',
    defaultWarrantyMonths: 24
  },
  {
    id: 'cmm-pmt-prime',
    name: 'PMT Prime 8106 (Цеховая КИМ IP54)',
    brand: 'PMT Precision Metrology',
    category: 'cmm',
    categoryLabel: 'КИМ',
    type: 'КИМ',
    description: 'Высокоскоростная КИМ цехового применения с виброзащитой и термокомпенсацией от +15°C до +35°C.',
    defaultWarrantyMonths: 24
  },
  {
    id: 'cmm-global-s',
    name: 'Hexagon Global S Chrome 12.22.10',
    brand: 'Hexagon Manufacturing Intelligence',
    category: 'cmm',
    categoryLabel: 'КИМ',
    type: 'КИМ',
    description: 'Универсальная мостовая координатно-измерительная машина для цеховых и лабораторных измерений.',
    defaultWarrantyMonths: 24
  },
  {
    id: 'cmm-lk-altera',
    name: 'LK Metrology Altera M 15.10.8',
    brand: 'LK Metrology',
    category: 'cmm',
    categoryLabel: 'КИМ',
    type: 'КИМ',
    description: 'Прецизионная гранитная КИМ с керамической осью Z и бесконтактными лазерными датчиками.',
    defaultWarrantyMonths: 24
  },

  // --- ТРЕКЕРЫ И РУКИ ---
  {
    id: 'tracker-leica-at960',
    name: 'Leica Absolute Tracker AT960-MR',
    brand: 'Leica Geosystems / Hexagon',
    category: 'trackers',
    categoryLabel: 'Трекеры и руки',
    type: 'Лазерный трекер',
    description: 'Высокодинамичный лазерный трекер 6DoF с поддержкой T-Probe и T-Scan до 40 метров.',
    defaultWarrantyMonths: 24
  },
  {
    id: 'tracker-faro-vantage',
    name: 'FARO Vantage 6DoF Laser Tracker',
    brand: 'FARO Technologies',
    category: 'trackers',
    categoryLabel: 'Трекеры и руки',
    type: 'Лазерный трекер',
    description: 'Портативный лазерный трекер с дальностью до 80 м для контроля оснастки и сборки планеров.',
    defaultWarrantyMonths: 24
  },
  {
    id: 'arm-tomelleri-space',
    name: 'Измерительная рука Tomelleri SPACE Plus 2.5m (7 осей)',
    brand: 'Tomelleri Engineering',
    category: 'trackers',
    categoryLabel: 'Трекеры и руки',
    type: 'КИМ',
    description: 'Портативная 7-осевая шарнирная измерительная рука со сканирующей головкой и щупами.',
    defaultWarrantyMonths: 24
  },
  {
    id: 'handyprobe-creaform',
    name: 'Creaform HandyPROBE Black Elite',
    brand: 'Creaform / AMETEK',
    category: 'trackers',
    categoryLabel: 'Трекеры и руки',
    type: 'Лазерный трекер',
    description: 'Оптическая беспроводная портативная КИМ без механических связей и штативов.',
    defaultWarrantyMonths: 24
  },

  // --- СТАНКИ С ЧПУ ---
  {
    id: 'cnc-dmg-dmu50',
    name: 'DMG MORI DMU 50 3rd Gen (5-осевой ЧПУ)',
    brand: 'DMG MORI',
    category: 'cnc',
    categoryLabel: 'Станки с ЧПУ',
    type: 'Станок ЧПУ',
    description: '5-осевой универсальный фрезерно-обрабатывающий центр с поворотным столом и ЧПУ CELOS / Heidenhain.',
    defaultWarrantyMonths: 24
  },
  {
    id: 'cnc-mazak-integrex',
    name: 'Mazak INTEGREX i-200H S (Токарно-фрезерный)',
    brand: 'Yamazaki Mazak',
    category: 'cnc',
    categoryLabel: 'Станки с ЧПУ',
    type: 'Станок ЧПУ',
    description: 'Многоцелевой токарно-фрезерный обрабатывающий комплекс для комплексной обработки валов и корпусов за один установ.',
    defaultWarrantyMonths: 24
  },
  {
    id: 'cnc-hermle-c42',
    name: 'Hermle C 42 U MT Dynamic',
    brand: 'Maschinenfabrik Berthold Hermle AG',
    category: 'cnc',
    categoryLabel: 'Станки с ЧПУ',
    type: 'Станок ЧПУ',
    description: 'Высокодинамичный 5-осевой обрабатывающий центр для прецизионного фрезерования и шлифовки лопаток турбин.',
    defaultWarrantyMonths: 36
  },
  {
    id: 'cnc-haas-vf4',
    name: 'Haas VF-4SS (Высокоскоростной фрезерный)',
    brand: 'Haas Automation',
    category: 'cnc',
    categoryLabel: 'Станки с ЧПУ',
    type: 'Станок ЧПУ',
    description: 'Вертикально-фрезерный 3/4-осевой обрабатывающий центр с ЧПУ Haas NextGen.',
    defaultWarrantyMonths: 12
  },

  // --- ОСНАСТКА И ПРОЧЕЕ ---
  {
    id: 'oth-renishaw-ph10m',
    name: 'Моторизованная головка Renishaw PH10M Plus + SP25M',
    brand: 'Renishaw plc',
    category: 'other',
    categoryLabel: 'Оснастка и датчики',
    type: 'Прочее',
    description: 'Координатно-измерительная индексная головка с датчиком сканирования SP25M и модулем SM25.',
    defaultWarrantyMonths: 12
  },
  {
    id: 'oth-granite-plate',
    name: 'Гранитная поверочная плита 1600x1000 мм (Класс точности 00)',
    brand: 'ДС-Инжиниринг / Mitutoyo',
    category: 'other',
    categoryLabel: 'Оснастка и датчики',
    type: 'Прочее',
    description: 'Массивная гранитная плита с антивибрационными опорами для сборочно-метрологических работ.',
    defaultWarrantyMonths: 36
  },
  {
    id: 'oth-calib-sphere',
    name: 'Калибровочная сфера из оксида циркония Ø25.000 мм',
    brand: 'Renishaw plc',
    category: 'other',
    categoryLabel: 'Оснастка и датчики',
    type: 'Прочее',
    description: 'Эталонная керамическая сфера со свидетельством о первичной метрологической поверке.',
    defaultWarrantyMonths: 24
  },
  {
    id: 'oth-metrology-fixture',
    name: 'Комплект модульной метрологической оснастки Alufix / Carfit',
    brand: 'Witte Barskamp',
    category: 'other',
    categoryLabel: 'Оснастка и датчики',
    type: 'Прочее',
    description: 'Алюминиевая модульная оснастка для быстрого и повторяемого базирования деталей на КИМ.',
    defaultWarrantyMonths: 24
  }
];

export const searchEquipmentPresets = (
  query: string,
  categoryFilter: 'all' | 'software' | 'scanners' | 'cmm' | 'trackers' | 'cnc' | 'other' = 'all'
): EquipmentPresetItem[] => {
  const q = query.trim().toLowerCase();
  return EQUIPMENT_PRESETS.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q)
    );
  });
};
