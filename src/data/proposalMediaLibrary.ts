/**
 * Curated Industrial Media Library for Commercial Proposals (ТКП / ТЗ)
 * ООО «ДС-Инжиниринг»
 */

export interface MediaLibraryItem {
  id: string;
  title: string;
  category: 'equipment' | 'schemes' | 'software' | 'logos';
  categoryLabel: string;
  url: string;
  description?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export const PROPOSAL_MEDIA_LIBRARY: MediaLibraryItem[] = [
  // 1. Equipment & Instruments
  {
    id: 'med-pmt-future-plus',
    title: 'КИМ PMT Future Plus 9106',
    category: 'equipment',
    categoryLabel: 'Координатно-измерительные машины',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'Стационарная портальная КИМ ЧПУ с точностью MPEE от (1.4 + 3L/1000) мкм'
  },
  {
    id: 'med-scanline-easyscan',
    title: 'Оптический 3D-сканер ScanLine EasyScan Omni / Shining 3D',
    category: 'equipment',
    categoryLabel: '3D-сканеры и оцифровка',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    description: 'Многолучевой лазерный оптический 3D-сканер со статусом СИ в ФГИС «АРШИН»'
  },
  {
    id: 'med-hexagon-arm',
    title: 'Мобильная измерительная рука Hexagon Absolute Arm 8520 + RS6',
    category: 'equipment',
    categoryLabel: 'Мобильные КИМ («Руки»)',
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    description: '7-осевая измерительная рука с лазерным 3D-сканером для цехового контроля'
  },
  {
    id: 'med-pmt-gamma',
    title: 'Портальная прецизионная КИМ PMT GAMMA+ (синий лазер)',
    category: 'equipment',
    categoryLabel: 'Координатно-измерительные машины',
    url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    description: 'Высокоточная гранитная портальная КИМ с оптико-лазерными датчиками'
  },
  {
    id: 'med-leica-tracker',
    title: 'Лазерный трекер Leica Absolute Tracker AT960',
    category: 'equipment',
    categoryLabel: 'Лазерные трекеры',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    description: 'Метрологический лазерный трекер для крупногабаритных объектов до 60 метров'
  },

  // 2. Technical Schemes & GD&T
  {
    id: 'med-gdt-colormap',
    title: 'Карта цветовых отклонений GD&T (PolyWorks / Geomagic)',
    category: 'schemes',
    categoryLabel: 'Схемы и протоколы контроля',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    description: 'Протокол контроля формы, расположения и допусков с выносными флажками'
  },
  {
    id: 'med-cad-part-scheme',
    title: 'CAD-модель детали и контрольные сечения (CAD/CAM)',
    category: 'schemes',
    categoryLabel: 'Схемы и протоколы контроля',
    url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
    description: 'Схема базирования детали A|B|C и траектории измерений'
  },
  {
    id: 'med-arshin-cert',
    title: 'Свидетельство метрологической поверки ФГИС «АРШИН»',
    category: 'schemes',
    categoryLabel: 'Метрологические свидетельства',
    url: '/logos/manufacturers/arshin.svg',
    description: 'Официальный знак внесения в реестр средств измерений РФ'
  },

  // 3. Software
  {
    id: 'med-polyworks-software',
    title: 'Метрологическое ПО PolyWorks|Inspector™',
    category: 'software',
    categoryLabel: 'Программное обеспечение',
    url: '/logos/manufacturers/polyworks.svg',
    description: 'Универсальная метрологическая 3D-платформа анализа геометрии'
  },
  {
    id: 'med-topsolid-software',
    title: 'Интегрированная CAD/CAM/PDM система TopSolid 7',
    category: 'software',
    categoryLabel: 'Программное обеспечение',
    url: '/logos/manufacturers/topsolid.svg',
    description: 'Французская САПР для ЧПУ механообработки и проектирования оснастки'
  },
  {
    id: 'med-geomagic-software',
    title: 'ПО обратного инжиниринга Geomagic Design X / Control X',
    category: 'software',
    categoryLabel: 'Программное обеспечение',
    url: '/logos/manufacturers/geomagic.svg',
    description: 'Реверс-инжиниринг из сеток сканирования в параметрические CAD-твердые тела'
  }
];
