export interface ManufacturerLogo {
  id: string;
  name: string;
  shortName: string;
  category: 'cmm' | 'scanner' | 'software' | 'arm' | 'tracker' | 'corporate';
  svgPath: string;
  description: string;
}

export const MANUFACTURER_LOGOS: ManufacturerLogo[] = [
  {
    id: 'hexagon',
    name: 'Hexagon Manufacturing Intelligence',
    shortName: 'Hexagon',
    category: 'cmm',
    svgPath: '/logos/manufacturers/hexagon.svg',
    description: 'Стационарные КИМ GLOBAL, DEA, Leitz, портативные руки Absolute Arm'
  },
  {
    id: 'polyworks',
    name: 'PolyWorks (InnovMetric Software Inc.)',
    shortName: 'PolyWorks',
    category: 'software',
    svgPath: '/logos/manufacturers/polyworks.svg',
    description: 'Универсальная 3D-метрологическая платформа PolyWorks|Inspector™ & Probing++'
  },
  {
    id: 'shining3d',
    name: 'Shining 3D FreeScan & EinScan',
    shortName: 'Shining 3D',
    category: 'scanner',
    svgPath: '/logos/manufacturers/shining3d.svg',
    description: 'Метрологические лазерные и оптические 3D-сканеры FreeScan Combo'
  },
  {
    id: 'leica',
    name: 'Leica Geosystems (Hexagon Metrology)',
    shortName: 'Leica Geosystems',
    category: 'tracker',
    svgPath: '/logos/manufacturers/leica.svg',
    description: 'Лазерные трекеры крупногабаритных измерений Leica Absolute Tracker AT960'
  },
  {
    id: 'geomagic',
    name: '3D Systems Geomagic (Design X / Control X)',
    shortName: 'Geomagic',
    category: 'software',
    svgPath: '/logos/manufacturers/geomagic.svg',
    description: 'ПО параметрического реверс-инжиниринга и контроля геометрии по CAD'
  },
  {
    id: 'topsolid',
    name: 'TopSolid 7 (Integrated CAD/CAM/PDM)',
    shortName: 'TopSolid',
    category: 'software',
    svgPath: '/logos/manufacturers/topsolid.svg',
    description: 'Многоосевая 5D/ЧПУ обработка, проектирование пресс-форм и штампов'
  },
  {
    id: 'pmt',
    name: 'PMT Precision Measuring Technology',
    shortName: 'PMT Arm',
    category: 'arm',
    svgPath: '/logos/manufacturers/pmt.svg',
    description: 'Высокоточные шарнирные измерительные руки и координатные системы'
  },
  {
    id: 'ds_engineering',
    name: 'ООО «ДС-Инжиниринг» (Самара)',
    shortName: 'ДС-Инжиниринг',
    category: 'corporate',
    svgPath: '/logos/manufacturers/ds_engineering.svg',
    description: 'Официальный инженерно-технический интегратор и метрологический сервис'
  },
  {
    id: 'arshin',
    name: 'ФГИС «АРШИН» (Росстандарт)',
    shortName: 'ФГИС АРШИН',
    category: 'corporate',
    svgPath: '/logos/manufacturers/arshin.svg',
    description: 'Федеральный информационный фонд по обеспечению единства измерений'
  }
];
