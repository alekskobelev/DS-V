export interface SiteLibraryImage {
  id: string;
  title: string;
  category: 'equipment' | 'gdt_metrology' | 'parts' | 'lab';
  categoryLabel: string;
  url: string;
  description: string;
  aspectRatio?: string;
}

export const SITE_IMAGE_LIBRARY: SiteLibraryImage[] = [
  // 1. Оборудование и КИМ
  {
    id: 'img-eq-1',
    title: 'КИМ PMT Future Plus 9106',
    category: 'equipment',
    categoryLabel: 'Оборудование и КИМ',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    description: 'Портальная координатно-измерительная машина ЧПУ для цеховых и лабораторных измерений (MPEE от 1.4 мкм).'
  },
  {
    id: 'img-eq-2',
    title: 'Оптический 3D-сканер ScanLine EasyScan Omni',
    category: 'equipment',
    categoryLabel: 'Оборудование и КИМ',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80',
    description: 'Отечественный метрологический 3D-сканер со статусом СИ в ФГИС «АРШИН» и встроенной фотограмметрией.'
  },
  {
    id: 'img-eq-3',
    title: 'Лазерный трекер и измерительная рука',
    category: 'equipment',
    categoryLabel: 'Оборудование и КИМ',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80',
    description: 'Мобильный измерительный комплекс с контактным щупом Renishaw для контроля крупногабаритных узлов.'
  },
  {
    id: 'img-eq-4',
    title: 'Прецизионная измерительная головка Renishaw PH20',
    category: 'equipment',
    categoryLabel: 'Оборудование и КИМ',
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=80',
    description: '5-осевая система скоростных измерений "на лету" с непрерывным позиционированием.'
  },

  // 2. Метрология и GD&T
  {
    id: 'img-gdt-1',
    title: 'Цветовая 3D-карта отклонений (GD&T Color Map)',
    category: 'gdt_metrology',
    categoryLabel: 'Метрология и GD&T',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    description: 'Наглядный протокол сравнения сканированного облака точек с эталонной CAD-моделью STEP/IGES.'
  },
  {
    id: 'img-gdt-2',
    title: 'Контроль формы и профиля сложного сечения',
    category: 'gdt_metrology',
    categoryLabel: 'Метрология и GD&T',
    url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1000&q=80',
    description: 'Сечения, отклонения от плоскостности, соосности расточек и цилиндричности по ГОСТ Р 53442-2015.'
  },
  {
    id: 'img-gdt-3',
    title: 'Метрологическое ПО PolyWorks / MCOSMOS',
    category: 'gdt_metrology',
    categoryLabel: 'Метрология и GD&T',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80',
    description: 'Скриншот интерфейса формирования метрологических отчетов и программ автоматического контроля.'
  },

  // 3. Контролируемые детали и изделия
  {
    id: 'img-part-1',
    title: 'Корпус турбокомпрессора ТК-140',
    category: 'parts',
    categoryLabel: 'Контролируемые детали',
    url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1000&q=80',
    description: 'Сложнопрофильная отливка из алюминиевого сплава АК7ч. Базирование A|B|C, расточки подшипников.'
  },
  {
    id: 'img-part-2',
    title: 'Пресс-форма для точного литья под давлением',
    category: 'parts',
    categoryLabel: 'Контролируемые детали',
    url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1000&q=80',
    description: 'Формообразующая вставка и матрица из инструментальной стали 40Х13 с допуском IT6.'
  },
  {
    id: 'img-part-3',
    title: 'Лопатка турбины газотурбинного двигателя (ГТД)',
    category: 'parts',
    categoryLabel: 'Контролируемые детали',
    url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1000&q=80',
    description: 'Аэродинамический профиль пера, входная/выходная кромки и замковая часть с точностью до 0.005 мм.'
  },

  // 4. Метрологическая лаборатория
  {
    id: 'img-lab-1',
    title: 'Климатическая метрологическая лаборатория (+20 °C)',
    category: 'lab',
    categoryLabel: 'Лаборатория и калибровка',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80',
    description: 'Прецизионное помещение с термостабилизацией ± 0.5 °C и виброизолированным фундаментом по ГОСТ 8.050-73.'
  },
  {
    id: 'img-lab-2',
    title: 'Лазерная интерферометрическая калибровка КИМ',
    category: 'lab',
    categoryLabel: 'Лаборатория и калибровка',
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1000&q=80',
    description: 'Юстировка лазерным интерферометром Renishaw XL-80 с поверкой во ФГИС «АРШИН».'
  }
];
