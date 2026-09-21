import { Model3DItem } from '../types';

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
      {
        id: 'p1',
        name: 'Входная кромка пера L1 (Leading Edge)',
        coords: [1.6, 0.45, 1.25],
        deviation: 0.028,
        status: 'nominal',
        surfaceName: 'Аэродинамический профиль NACA-65 R32'
      },
      {
        id: 'p2',
        name: 'Ступица Ø45H7 (Посадочная база А)',
        coords: [0.0, -0.65, 0.0],
        deviation: -0.015,
        status: 'nominal',
        surfaceName: 'Цилиндрическая база вала Ø45'
      },
      {
        id: 'p3',
        name: 'Межлопаточный канал C4 (Flow Channel)',
        coords: [-1.15, 0.25, 1.35],
        deviation: 0.018,
        status: 'nominal',
        surfaceName: 'CAD-модель: поверхность сопряжения канала'
      },
      {
        id: 'p4',
        name: 'Выходная кромка (Trailing Edge)',
        coords: [2.05, 0.12, -0.75],
        deviation: -0.024,
        status: 'nominal',
        surfaceName: 'Тонкостенное ребро 0.8 мм'
      },
      {
        id: 'p5',
        name: 'Наружный обод венца Ø160',
        coords: [-1.85, 0.05, -1.1],
        deviation: -0.042,
        status: 'warning',
        surfaceName: 'Торцевой балансировочный поясок'
      }
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
      {
        id: 'p1',
        name: 'Формообразующий пуансон M1',
        coords: [0.0, 0.75, 0.0],
        deviation: 0.024,
        status: 'nominal',
        surfaceName: 'Литьевая полость детали (Ra 0.2 мкм)'
      },
      {
        id: 'p2',
        name: 'Линия разъема (Партийный стык B)',
        coords: [1.75, 0.0, 1.75],
        deviation: 0.011,
        status: 'nominal',
        surfaceName: 'Базовая плоскость смыкания полуматриц'
      },
      {
        id: 'p3',
        name: 'Направляющая втулка Ø32H7 (DME)',
        coords: [-1.45, -0.35, -1.45],
        deviation: -0.014,
        status: 'nominal',
        surfaceName: 'Посадочное отверстие колонки'
      },
      {
        id: 'p4',
        name: 'Канал охлаждения Ø10 (Контур 1)',
        coords: [1.65, -0.6, -1.2],
        deviation: -0.015,
        status: 'nominal',
        surfaceName: 'Герметичный штуцер контура охлаждения'
      },
      {
        id: 'p5',
        name: 'Уклон боковой стенки 1.5°',
        coords: [1.2, 0.55, -1.15],
        deviation: -0.035,
        status: 'warning',
        surfaceName: 'Зона повышенного трения формовки'
      }
    ]
  },
  {
    id: 'housing',
    name: 'Корпус двухступенчатого редуктора',
    category: 'Корпусные детали и отливки',
    geometryType: 'procedural_housing',
    description: 'Литой корпус промышленного редуктора с развитыми ребрами жесткости, ступенчатыми расточками под радиально-упорные подшипники, 8-точечным присоединительным фланцем и резьбовыми бобышками.',
    material: 'Алюминиевый литейный сплав АК12М2 / Чугун СЧ20',
    manufacturingProcess: 'Координатная расточка на ЧПУ ОЦ + Лазерный трекер и измерительная рука PMT Arm',
    pointCount: 242800,
    triangleCount: 485600,
    minTolerance: -0.05,
    maxTolerance: 0.05,
    orderIndex: 2,
    isDefault: true,
    createdAt: '2026-08-10T00:00:00.000Z',
    inspectionPoints: [
      {
        id: 'p1',
        name: 'Посадочное место подшипника Ø80H7',
        coords: [0.0, 0.0, 1.45],
        deviation: -0.017,
        status: 'nominal',
        surfaceName: 'Главная расточная база вала A'
      },
      {
        id: 'p2',
        name: 'Привалочный фланец разъема',
        coords: [1.75, -0.95, 0.0],
        deviation: 0.012,
        status: 'nominal',
        surfaceName: 'Плоскость стыка полукорпусов'
      },
      {
        id: 'p3',
        name: 'Межосевое расстояние валов 140.00 мм',
        coords: [0.0, 1.35, 0.0],
        deviation: 0.027,
        status: 'nominal',
        surfaceName: 'Ось зубчатого зацепления 2-й ступени'
      },
      {
        id: 'p4',
        name: 'Монтажные лапы с пазами крепления',
        coords: [-1.55, -0.85, 1.35],
        deviation: 0.028,
        status: 'nominal',
        surfaceName: 'Опорная плоскость станины'
      },
      {
        id: 'p5',
        name: 'Резьбовые бобышки смотровой крышки М10',
        coords: [-1.2, 0.95, -1.1],
        deviation: -0.038,
        status: 'warning',
        surfaceName: 'Фланец сервисного люка'
      }
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
      {
        id: 'p1',
        name: 'Рабочий профиль зуба №1 (Drive Face)',
        coords: [1.2, 0.65, 0.45],
        deviation: 0.023,
        status: 'nominal',
        surfaceName: 'Эвольвентная спиральная поверхность'
      },
      {
        id: 'p2',
        name: 'Шлицевой венец вала Z=24',
        coords: [0.0, -1.3, 0.0],
        deviation: -0.014,
        status: 'nominal',
        surfaceName: 'Эвольвентный шлиц DIN 5480'
      },
      {
        id: 'p3',
        name: 'Шейка под подшипник 305 Ø25js6',
        coords: [0.0, -0.5, 0.0],
        deviation: 0.021,
        status: 'nominal',
        surfaceName: 'Цилиндрическая шейка под запрессовку'
      },
      {
        id: 'p4',
        name: 'Впадина зуба (Root Fillet Radius)',
        coords: [0.85, 0.35, -0.65],
        deviation: -0.021,
        status: 'warning',
        surfaceName: 'Радиус переходной кривой галтели'
      }
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
      {
        id: 'p1',
        name: 'Напорный фланец Ду50 Ру16',
        coords: [1.6, 1.15, 0.0],
        deviation: 0.029,
        status: 'nominal',
        surfaceName: 'Присоединительный фланец ГОСТ 33259'
      },
      {
        id: 'p2',
        name: 'Входной всасывающий патрубок Ду80',
        coords: [0.0, 0.0, 1.25],
        deviation: -0.018,
        status: 'nominal',
        surfaceName: 'Входной направляющий конфузор'
      },
      {
        id: 'p3',
        name: 'Язык диффузора (Volute Cutwater)',
        coords: [-0.65, 0.4, 0.0],
        deviation: 0.022,
        status: 'nominal',
        surfaceName: 'Критическая гидравлическая кромка R3'
      },
      {
        id: 'p4',
        name: 'Спиральный канал (Volute Throat)',
        coords: [-1.4, -0.6, 0.0],
        deviation: -0.036,
        status: 'warning',
        surfaceName: 'Гидравлическое сечение канала'
      }
    ]
  }
];
