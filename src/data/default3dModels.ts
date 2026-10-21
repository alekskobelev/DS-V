import { Model3DItem } from '../types.ts';

export const DEFAULT_3D_MODELS: Model3DItem[] = [
  {
    id: 'impeller',
    name: 'Крыльчатка турбокомпрессора (5 осей, Blisk)',
    category: '5-осевая ЧПУ обработка',
    geometryType: 'procedural_impeller',
    description: 'Высокооборотное колесо компрессора с 14 пространственно-скрученными аэродинамическими лопатками (7 основных + 7 промежуточных сплиттеров) и профилированной ступицей с замковым шпоночным пазом.',
    material: 'Титановый сплав ВТ6 (Ti-6Al-4V) / AL 7075-T6',
    manufacturingProcess: '5-осевое непрерывное фрезерование ЧПУ + Лазерное сканирование Shining 3D FreeScan UE11',
    pointCount: 184620,
    triangleCount: 368400,
    minTolerance: -0.05,
    maxTolerance: 0.05,
    orderIndex: 0,
    isDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    inspectionPoints: [
      { id: 'p1', name: 'Кромка пера лопатки (R32)', coords: [1.60, 0.45, 1.25], deviation: 0.012, status: 'nominal', surfaceName: 'Перо лопатки №1' },
      { id: 'p2', name: 'Ступица входного вала Ø32H7', coords: [0.00, 1.25, 0.00], deviation: 0.005, status: 'nominal', surfaceName: 'Базовое отверстие H7' },
      { id: 'p3', name: 'Выходной фланец диска Ø180', coords: [1.75, -0.65, 0.00], deviation: -0.018, status: 'nominal', surfaceName: 'Наружный диаметр диска' },
      { id: 'p4', name: 'Корыто лопатки №3 (Давление)', coords: [0.85, 0.15, 0.85], deviation: 0.038, status: 'warning', surfaceName: 'Профиль пера (прогиб)' },
      { id: 'p5', name: 'Привалочный торец ступицы', coords: [0.00, -1.18, 0.00], deviation: -0.008, status: 'nominal', surfaceName: 'Опорная база A' }
    ]
  },
  {
    id: 'mold',
    name: 'Блок матрицы пресс-формы (Die & Mold)',
    category: 'Пресс-формы и штампы',
    geometryType: 'procedural_mold',
    description: 'Формообразующий блок литьевой пресс-формы с глубокими ступенчатыми полостями, контурами водяного охлаждения, посадочными втулками направляющих колонок DME/Hasco и боковыми пазами прихватов.',
    material: 'Инструментальная сталь 4Х5МФС (1.2343 ESR, 52 HRC)',
    manufacturingProcess: 'Высокоскоростная 3D-обработка (HSM) + Прошивная электроэрозия (EDM) + Метрологический контроль на КИМ PMT Arm',
    pointCount: 215400,
    triangleCount: 428900,
    minTolerance: -0.03,
    maxTolerance: 0.03,
    orderIndex: 1,
    isDefault: true,
    createdAt: '2026-08-05T00:00:00.000Z',
    inspectionPoints: [
      { id: 'm1', name: 'Базовая направляющая колонка Ø25', coords: [1.80, 0.85, 1.30], deviation: 0.006, status: 'nominal', surfaceName: 'Колонка направляющая' },
      { id: 'm2', name: 'Полость формообразующей матрицы', coords: [0.00, -0.40, 0.00], deviation: -0.015, status: 'nominal', surfaceName: 'Литьевая полость' },
      { id: 'm3', name: 'Плоскость разъема пресс-формы', coords: [1.20, 0.50, -1.20], deviation: 0.028, status: 'warning', surfaceName: 'Плоскость PL' },
      { id: 'm4', name: 'Втулка выталкивателя Ø12', coords: [-1.40, -0.20, 0.80], deviation: 0.008, status: 'nominal', surfaceName: 'Цилиндрическая расточка' },
      { id: 'm5', name: 'Литниковый впускной канал', coords: [0.00, 0.20, 0.60], deviation: -0.032, status: 'warning', surfaceName: 'Канал впрыска' }
    ]
  },
  {
    id: 'housing',
    name: 'Корпус редуктора привода (Литье + ЧПУ)',
    category: 'Корпусные детали и литье',
    geometryType: 'procedural_housing',
    description: 'Силовой литой картер редуктора с точными расточками под подшипники валов, посадочными плоскостями разъема с уплотнительным лабиринтом и резьбовыми крепежными отверстиями.',
    material: 'Алюминиевый литейный сплав АК12 (АЛ2) / Серый чугун СЧ20',
    manufacturingProcess: 'Литье в кокиль + Точная фрезерная ЧПУ доработка + 3D-сканирование FreeScan UE Pro',
    pointCount: 192800,
    triangleCount: 385600,
    minTolerance: -0.04,
    maxTolerance: 0.04,
    orderIndex: 2,
    isDefault: true,
    createdAt: '2026-08-10T00:00:00.000Z',
    inspectionPoints: [
      { id: 'h1', name: 'Расточка подшипника Ø120H7', coords: [0.00, 0.00, 1.60], deviation: 0.008, status: 'nominal', surfaceName: 'Диаметр подшипника' },
      { id: 'h2', name: 'Привалочный фланец крышки', coords: [1.50, 0.80, -0.50], deviation: -0.012, status: 'nominal', surfaceName: 'Плоскость разъема' },
      { id: 'h3', name: 'Крепежная бобышка M12', coords: [-1.60, -1.20, 0.00], deviation: 0.035, status: 'warning', surfaceName: 'Крепежная плоскость' },
      { id: 'h4', name: 'Масляный карман картера', coords: [-0.50, -0.80, -1.20], deviation: -0.022, status: 'warning', surfaceName: 'Литая стенка' },
      { id: 'h5', name: 'Вторичная расточка вала Ø90', coords: [0.00, 0.00, -1.60], deviation: 0.005, status: 'nominal', surfaceName: 'База вала' }
    ]
  },
  {
    id: 'bevel_gear',
    name: 'Вал-шестерня с круговым зубом (Эвольвента)',
    category: 'Зубчатые передачи и валы',
    geometryType: 'procedural_bevel_gear',
    description: 'Коническая гипоидная вал-шестерня дифференциала с 18 круговыми спиральными зубьями Gleason, эвольвентным шлицевым пояском DIN 5480 и прецизионными опорными шейками под подшипники качения.',
    material: 'Легированная цементуемая сталь 20Х2Н4А (HRC 58-62)',
    manufacturingProcess: 'Зубофрезерование + Зубошлифование по ГОСТ 19326-73 + Проверка профиля зуба на КИМ',
    pointCount: 165300,
    triangleCount: 330600,
    minTolerance: -0.025,
    maxTolerance: 0.025,
    orderIndex: 3,
    isDefault: true,
    createdAt: '2026-08-15T00:00:00.000Z',
    inspectionPoints: [
      { id: 'g1', name: 'Эвольвентный профиль зуба', coords: [1.20, 0.40, 0.60], deviation: 0.014, status: 'nominal', surfaceName: 'Рабочая поверхность зуба' },
      { id: 'g2', name: 'Посадочная шейка вала k6', coords: [0.00, 1.50, 0.00], deviation: 0.004, status: 'nominal', surfaceName: 'Диаметр вала k6' },
      { id: 'g3', name: 'Базовый упорный торец венца', coords: [0.90, -0.20, -0.90], deviation: -0.009, status: 'nominal', surfaceName: 'Опорный торец' },
      { id: 'g4', name: 'Впадина зуба венца (Корень)', coords: [0.70, 0.20, 1.10], deviation: 0.042, status: 'critical', surfaceName: 'Корень зуба (концентратор)' },
      { id: 'g5', name: 'Шлицевой паз приводного вала', coords: [0.00, -1.20, 0.30], deviation: -0.018, status: 'nominal', surfaceName: 'Шлицевое соединение' }
    ]
  },
  {
    id: 'volute',
    name: 'Спиральный корпус насоса (Улитка)',
    category: 'Гидравлические и турбинные узлы',
    geometryType: 'procedural_volute',
    description: 'Коррозионностойкий спиральный диффузор насоса высокого давления с плавным расширением сечения, тангенциальным напорным фланцем Ду50 Ру16 и входным конфузором.',
    material: 'Нержавеющая сталь 12Х18Н10Т (AISI 321)',
    manufacturingProcess: '5-осевая многокоординатная ЧПУ обработка проточной части + 3D-контроль геометрии',
    pointCount: 198200,
    triangleCount: 396400,
    minTolerance: -0.05,
    maxTolerance: 0.05,
    orderIndex: 4,
    isDefault: true,
    createdAt: '2026-08-20T00:00:00.000Z',
    inspectionPoints: [
      { id: 'v1', name: 'Входной фланец улитки Ø150', coords: [0.00, 1.60, 0.00], deviation: 0.011, status: 'nominal', surfaceName: 'Входной патрубок' },
      { id: 'v2', name: 'Напорный диффузор Ø100', coords: [1.80, 0.30, 0.50], deviation: -0.016, status: 'nominal', surfaceName: 'Выходной фланец' },
      { id: 'v3', name: 'Спиральная камера улитки', coords: [0.80, -0.60, 1.20], deviation: 0.032, status: 'warning', surfaceName: 'Проточная часть' },
      { id: 'v4', name: 'Язык диффузора (Клин)', coords: [-0.90, 0.40, 0.20], deviation: -0.038, status: 'warning', surfaceName: 'Разделительный клин' },
      { id: 'v5', name: 'Привалочный фланец корпуса', coords: [0.00, -1.40, -0.50], deviation: 0.007, status: 'nominal', surfaceName: 'Базовый торец' }
    ]
  }
];
