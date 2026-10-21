/**
 * РЕЕСТР РЕАЛЬНЫХ ИНЖИНИРИНГОВЫХ УСЛУГ КОМПАНИИ ООО «ДС-ИНЖИНИРИНГ»
 * 
 * Внимание: Все данные в данном файле строго соответствуют реальной производственной
 * деятельности, компетенциям и техническому парку компании «ДС-Инжиниринг» 
 * (Самара / Тольятти, технопарк в сфере высоких технологий «Жигулевская долина»).
 * 
 * Включает стационарную высокоточную КИМ Mitutoyo CRYSTA-Apex S в метрологическом зале компании
 * в технопарке «Жигулевская долина», мобильные КИМ-руки PMT Alpha Arm, оптические и синие
 * лазерные 3D-сканеры Shining 3D / ScanLine EasyScan Omni со свидетельствами ФГИС «АРШИН».
 */

import { ServiceItem, ServiceContact } from '../types';

// Реэкспорт и типизация интерфейсов услуг для чистого использования
export type { ServiceItem, ServiceContact };

export type ServiceCalculatorType = 
  | 'scanning' 
  | 'reverse' 
  | 'inspection' 
  | 'postprocessor' 
  | 'tooling' 
  | 'cmm_service';

export interface ServiceStep {
  stepNumber: number;
  title: string;
  desc: string;
}

export interface ServiceValidationError {
  field: keyof ServiceItem | 'equipment' | 'equipmentArray' | 'equipmentItem' | 'stepItem' | 'deliverableItem' | 'general' | 'contacts' | 'contactLink' | string;
  message: string;
}

export interface ServiceValidationResult {
  isValid: boolean;
  errors: ServiceValidationError[];
  errorMap: Record<string, string>;
}

export const VALID_CALCULATOR_TYPES: ServiceCalculatorType[] = [
  'scanning',
  'reverse',
  'inspection',
  'postprocessor',
  'tooling',
  'cmm_service'
];

/**
 * Штатные сертифицированные специалисты компании «ДС-Инжиниринг»
 */
export const COMPANY_SPECIALISTS: Record<string, ServiceContact> = {
  yarish: {
    id: 'c-yarish',
    name: 'Ярыш Иван Владимирович',
    role: 'Инженер-метролог (выездной 3D-контроль, поверка СИ, 3D-сканирование)',
    phone: '+7 (927) 748-46-58',
    email: 'yarish@ds-enginering.ru',
    location: 'Самара (ул. Свободы, 198) / Выездные группы по РФ'
  },
  skobelev: {
    id: 'c-skobelev',
    name: 'Скобелев Александр Сергеевич',
    role: 'Ведущий инженер САПР и 3D-моделирования (TopSolid 7, реверс-инжиниринг)',
    phone: '+7 (937) 984-61-51',
    email: 'a.skobelev@ds-enginering.ru',
    location: 'Самара (ул. Свободы, 198) / Тольятти'
  },
  nekrasov: {
    id: 'c-nekrasov',
    name: 'Некрасов Сергей Юрьевич',
    role: 'Технический директор (постпроцессоры ЧПУ, оснастка, аудит производств)',
    phone: '+7 (927) 208-25-54',
    email: 'nekrasov@ds-enginering.ru',
    location: 'Самара (ул. Свободы, 198) / Тольятти'
  }
};

/**
 * Парк реального измерительного оборудования и программных комплексов
 */
export const VERIFIED_EQUIPMENT_PARK = [
  'Мобильные координатно-измерительные машины (руки) Hexagon Absolute Arm 7-Axis и 6-Axis с контактными щупами Renishaw и лазерными сканерами AS1/RS5',
  'Лазерный трекер Leica Absolute Tracker AT403/AT960 (для крупногабаритных измерений до 80 м)',
  'Стационарная координатно-измерительная машина Mitutoyo CRYSTA-Apex S (метро-зал в технопарке «Жигулевская долина»)',
  'Оптический гибридный 3D-сканер ScanLine EasyScan Omni (Госреестр СИ ФГИС «АРШИН»)',
  'Метрологический лазерный 3D-сканер Shining 3D FreeScan Combo (Госреестр СИ ФГИС «АРШИН»)',
  'Прецизионный синий лазерный 3D-сканер Shining 3D FreeScan UE Pro со встроенной фотограмметрией',
  'Портативная координатно-измерительная машина (КИМ-рука) PMT Alpha Arm',
  'Метрологическое программное обеспечение PolyWorks|Inspector™ (контроль геометрии, GD&T)',
  'Интегрированная CAD/CAM/PDM среда TopSolid 7 (Франция)',
  'Специализированное ПО реверс-инжиниринга Geomagic Design X / TopSolid 7 Design',
  'Мобильные защищенные рабочие станции метролога для полевых измерений на объекте',
  'Наборы поверенных концевых мер длины (КМД), калибровочные сферы и базирующие системы',
  'Тактильные датчики, моторизованные головки и измерительные щупы Renishaw PH10M / TP20 / TP200'
];

/**
 * Список реальных инженерных услуг ООО «ДС-Инжиниринг»
 */
export const REAL_SERVICES: ServiceItem[] = [
  // 1. 3D-сканирование деталей и объектов (ОТДЕЛЬНО: оцифровка, облака точек, полигональные сетки STL/OBJ)
  {
    id: '3d-scanning',
    title: '3D-сканирование деталей и объектов',
    category: '3D-сканирование и оцифровка',
    shortDesc: 'Высокоточная лазерная и оптическая 3D-оцифровка геометрии изделий любых габаритов — от прецизионных деталей до крупногабаритных штампов, пресс-форм и станин с получением чистых полигональных сеток STL/OBJ/PLY и облаков точек.',
    fullDesc: 'Специализированная услуга бесконтактной и контактной оцифровки геометрии деталей. Применяем мобильные измерительные руки Hexagon Absolute Arm с лазерным сканером AS1, оптические системы ScanLine EasyScan Omni, метрологические лазерные сканеры Shining 3D FreeScan и трекеры Leica. Выполняем сканирование на объекте заказчика с оперативным выездом за 24–48 часов по всей РФ или на измерительной базе компании в Самаре и Тольятти. Результатом услуги является выверенная полигональная сетка (STL/OBJ) без шумов и артефактов с привязкой к базам детали, готовая для передачи в CAD/CAM или метрологический контроль.',
    iconName: 'Scan',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    basePriceText: 'от 5 000 ₽ / деталь',
    calculatorType: 'scanning',
    responsiblePerson: 'Ярыш Иван Владимирович (Инженер-метролог)',
    slaResponseTime: 'Ответ на заявку в течение 15 минут, выезд на объект за 24–48 ч',
    workLocationNote: 'Оперативный выезд инженера со сканером на объект заказчика по всей РФ или проведение работ на измерительной базе компании (Самара / Тольятти, технопарк «Жигулевская долина»)',
    contacts: [
      COMPANY_SPECIALISTS.yarish,
      COMPANY_SPECIALISTS.skobelev
    ],
    equipmentUsed: [
      'Мобильная КИМ Hexagon Absolute Arm 7-Axis со сканером Absolute Scanner AS1',
      'Лазерный 3D-сканер Shining 3D FreeScan Combo (в реестре ФГИС «АРШИН»)',
      'Прецизионный лазерный 3D-сканер Shining 3D FreeScan UE Pro',
      'Оптический гибридный 3D-сканер ScanLine EasyScan Omni',
      'Метрологическое ПО PolyWorks|Inspector™',
      'Мобильная рабочая станция метролога для выездных измерений'
    ],
    deliverables: [
      'Выверенная полигональная сетка (STL/OBJ/PLY) без шумов с привязкой к базам',
      'Высокоплотное облако точек с исходной ориентацией координат',
      'Позиционирование в базовой системе координат детали по базам и плоскостям',
      'Первичный метрологический протокол сходимости сканов'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Анализ ТЗ и выбор сканера',
        desc: 'Оценка габаритов, массы, материала, шероховатости поверхности детали и подбор оптимального сканера (синий лазер или оптическая сетка).'
      },
      {
        stepNumber: 2,
        title: 'Подготовка и нанесение позиционных меток',
        desc: 'Очистка поверхности детали, установка магнитных или самоклеящихся светоотражающих меток, калибровка сканирующей системы по эталону.'
      },
      {
        stepNumber: 3,
        title: '3D-сканирование объекта',
        desc: 'Послойная оцифровка геометрии с непрерывным контролем перекрытия кадров и встроенной фотограмметрией для исключения накопления объемной погрешности.'
      },
      {
        stepNumber: 4,
        title: 'Сшивка и фильтрация данных',
        desc: 'Объединение отдельных сканов в единую замкнутую полигональную сетку, удаление артефактов, оптимизация плотности сетки и экспорт в нейтральные форматы.'
      }
    ]
  },

  // 2. Обратный инжиниринг (ОТДЕЛЬНО: Mesh-to-CAD, твердотельные B-Rep модели STEP/IGES, чертежи по ЕСКД)
  {
    id: 'reverse-engineering',
    title: 'Обратный инжиниринг деталей и выпуск КД по ЕСКД',
    category: 'Реверс-инжиниринг и CAD',
    shortDesc: 'Построение точных твердотельных CAD-моделей (STEP AP242, Parasolid .x_t, IGES) по результатам замеров КИМ и 3D-сканирования деталей или оснастки с устранением износа и выпуском чертежей по ЕСКД.',
    fullDesc: '«ДС‑Инжиниринг» выполняет полный цикл обратного проектирования (реверс-инжиниринга) сложных промышленных изделий: литых корпусов, турбинных лопаток, крыльчаток, зубчатых колес, штамповой и пресс-форменной оснастки для задач импортозамещения или восстановления утраченной документации. Процесс основан на контактных замерах базовых плоскостей и отверстий мобильной КИМ Hexagon Absolute Arm, прецизионном сканировании сканерами Shining 3D FreeScan Combo и ScanLine EasyScan Omni, анализе конструкторских баз, определении номинальных геометрических примитивов и восстановлении исходной геометрии с устранением фактического износа и повреждений детали. Результатом работы является точная твердотельная CAD-модель (STEP AP242, IGES, Parasolid .x_t) для CAM/ЧПУ обработки, комплект рабочих чертежей по ЕСКД и протокол сходимости. Параметрические модели с полным деревом построения разрабатываются по отдельному ТЗ под конкретную САПР заказчика.',
    iconName: 'Cpu',
    image: 'https://images.unsplash.com/photo-158109226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    basePriceText: 'от 12 000 ₽ / деталь',
    calculatorType: 'reverse',
    responsiblePerson: 'Скобелев Александр Сергеевич (Ведущий инженер САПР)',
    slaResponseTime: 'Предварительная оценка трудоемкости за 2 часа по фото или STL',
    workLocationNote: 'Работы в инженерном центре в Самаре (ул. Свободы, 198) или с выездом со сканером на объект заказчика',
    contacts: [
      COMPANY_SPECIALISTS.skobelev,
      COMPANY_SPECIALISTS.yarish
    ],
    equipmentUsed: [
      'Мобильная КИМ Hexagon Absolute Arm 7-Axis со сканером AS1 и контактными щупами',
      'Лазерный 3D-сканер Shining 3D FreeScan Combo (в реестре ФГИС «АРШИН»)',
      'Оптический гибридный 3D-сканер ScanLine EasyScan Omni',
      'САПР TopSolid 7 Design (Франция)',
      'Специализированное ПО Geomagic Design X'
    ],
    deliverables: [
      'Точная твердотельная 3D CAD-модель (STEP AP214/AP242, Parasolid .x_t, IGES)',
      'Комплект рабочих чертежей по ЕСКД (DWG, DXF, PDF)',
      'Цветовая 3D-карта сходимости твердотельной модели с исходной полигональной сеткой скана',
      'Очищенная полигональная сетка (STL/OBJ/PLY) высокого разрешения'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Контактные замеры и 3D-сканирование детали',
        desc: 'Контактный замер баз и отверстий мобильной КИМ Hexagon, лазерное сканирование сложных поверхностей с получением плотной сетки STL.'
      },
      {
        stepNumber: 2,
        title: 'Сегментация и реконструкция геометрии',
        desc: 'Выделение конструкторских плоскостей, цилиндров, конусов и свободных поверхностей (NURBS); устранение дефектов износа и забоин.'
      },
      {
        stepNumber: 3,
        title: 'Твердотельное B-Rep моделирование',
        desc: 'Построение технологичной твердотельной CAD-модели в форматах STEP/Parasolid с соблюдением конструкторских баз, сопряжений и литейных уклонов.'
      },
      {
        stepNumber: 4,
        title: 'Контроль сходимости и оформление КД по ЕСКД',
        desc: 'Анализ отклонений CAD от скана (погрешность до 0.015 мм), оформление чертежей с простановкой шероховатостей, допусков и посадок.'
      }
    ]
  },

  // 3. Контроль геометрии на КИМ и анализ допусков GD&T (ОТДЕЛЬНО: метрология, протоколы FAI, карты отклонений)
  {
    id: 'parts-inspection',
    title: 'Контроль геометрии на КИМ и анализ допусков GD&T',
    category: 'Метрологический контроль',
    shortDesc: 'Метрологический 3D-контроль геометрических параметров деталей по CAD-модели: контактные замеры КИМ Mitutoyo/Hexagon, расчет допусков формы и расположения (GD&T), протоколы FAI, построение цветовых карт отклонений в PolyWorks|Inspector™.',
    fullDesc: 'Сравниваем фактическую геометрию изготовленной детали с номинальной CAD-моделью в PolyWorks|Inspector. Выполняем прецизионные контактные замеры базовых элементов и отверстий на стационарной КИМ Mitutoyo CRYSTA-Apex S и мобильной КИМ Hexagon Absolute Arm, сканируем криволинейные поверхности, строим цветовую карту отклонений, рассчитываем допуски формы и расположения (GD&T) и формируем официальный протокол контроля.',
    iconName: 'CheckCircle2',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    basePriceText: 'от 7 000 ₽ / деталь',
    calculatorType: 'inspection',
    responsiblePerson: 'Ярыш Иван Владимирович (Инженер-метролог)',
    slaResponseTime: 'Ответ на заявку в течение 15 минут, предоставление протокола за 24 ч',
    workLocationNote: 'Высокоточные измерения в демонстрационно-метрологическом зале в технопарке «Жигулевская долина» (г. Тольятти, стационарная КИМ Mitutoyo), инженерном центре в Самаре, либо оперативный выезд инженера с мобильной КИМ Hexagon Absolute Arm и сканером по всей РФ',
    contacts: [
      COMPANY_SPECIALISTS.yarish,
      COMPANY_SPECIALISTS.skobelev
    ],
    equipmentUsed: [
      'Стационарная координатно-измерительная машина Mitutoyo CRYSTA-Apex S (метро-зал в технопарке «Жигулевская долина»)',
      'Мобильная КИМ Hexagon Absolute Arm 7-Axis / 6-Axis с контактными щупами Renishaw и сканером AS1',
      'Портативная координатно-измерительная машина (рука) PMT Alpha Arm',
      'Метрологический 3D-сканер Shining 3D FreeScan Combo (в реестре ФГИС «АРШИН»)',
      'Метрологическое ПО PolyWorks|Inspector™',
      'Комплект поверенных концевых мер длины и контактных щупов Renishaw (PH10M/TP200)'
    ],
    deliverables: [
      'Официальный метрологический протокол измерений (PDF / Excel)',
      '3D-цветовая карта отклонений фактической геометрии от номинала CAD',
      'Таблица расчета допусков формы и расположения (GD&T: цилиндричность, плоскостность, позиционный допуск)',
      'Протокол первичной инспекции первого изделия FAI (First Article Inspection)',
      'Интерактивный 3D-отчет PolyWorks Reviewer для автономного просмотра инженерами цеха'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Загрузка номинальной CAD-модели и анализ чертежа',
        desc: 'Импорт конструкторской 3D-модели (STEP/IGES) в PolyWorks|Inspector™, перенос контролируемых размеров и допусков GD&T с чертежа заказчика.'
      },
      {
        stepNumber: 2,
        title: 'Метрологические измерения на КИМ или 3D-сканирование',
        desc: 'Высокоточные контактные измерения на стационарной КИМ Mitutoyo в метро-зале, портативной рукой PMT Alpha Arm или сплошная оцифровка лазерным сканером FreeScan Combo.'
      },
      {
        stepNumber: 3,
        title: 'Базирование и расчет отклонений GD&T',
        desc: 'Точное математическое совмещение измерений с CAD-моделью по базовым поверхностям (Best-Fit, Datum RPS, 3-2-1), расчет цветовой карты и GD&T.'
      },
      {
        stepNumber: 4,
        title: 'Формирование и передача протокола',
        desc: 'Генерация официального отчета по стандарту предприятия заказчика с анализом годности деталей и передача протокола главному метрологу.'
      }
    ]
  },

  // 4. Разработка постпроцессоров и управляющих программ для станков с ЧПУ (ОТДЕЛЬНО: CAM, кинематика, симуляция)
  {
    id: 'postprocessors-dev',
    title: 'Разработка постпроцессоров и управляющих программ ЧПУ',
    category: 'ЧПУ программирование и САПР',
    shortDesc: 'Разработка, отладка и внедрение постпроцессоров в среде TopSolid 7 для 3–5 осевых фрезерных, токарных, токарно-фрезерных ОЦ и электроэрозионных станков с ЧПУ с гарантией безаварийной работы.',
    fullDesc: 'Разрабатываем постпроцессоры и кинематические 3D-модели станков в TopSolid 7 CAM, Autodesk PowerMill, Autodesk FeatureCAM для 3–5 осевых фрезерных, токарных и многоцелевых центров со стойками Fanuc, Heidenhain, Siemens Sinumerik, Haas и прочее. Гарантируем обработку без столкновений.',
    iconName: 'Terminal',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    basePriceText: 'от 35 000 ₽ / станок',
    calculatorType: 'postprocessor',
    responsiblePerson: 'Некрасов Сергей Юрьевич (Технический директор)',
    slaResponseTime: 'Анализ кинематики станка за 24 ч, разработка от 5 рабочих дней',
    workLocationNote: 'Дистанционная отладка по картам кодов и очный выезд инженера на завод для внедрения постпроцессора на станке заказчика',
    contacts: [
      COMPANY_SPECIALISTS.nekrasov,
      COMPANY_SPECIALISTS.skobelev
    ],
    equipmentUsed: [
      'CAD/CAM среда TopSolid 7 CAM Pro (Франция)',
      'Кинематические модули верификации и симуляции обработки станка',
      'Комплексы проверки G-кода и виртуальные симуляторы ЧПУ контроллеров',
      'Диагностические интерфейсы RS-232 / Ethernet / DNC для станков'
    ],
    deliverables: [
      'Готовый протестированный постпроцессор для TopSolid 7 CAM Pro',
      'Точная кинематическая 3D-модель станка с защитой от коллизий узлов',
      'Технологическая карта наладки инструмента и нулевых точек (G54-G59)',
      'Отработанная тестовая контрольная деталь на станке заказчика с замером геометрии',
      'Акт успешного внедрения и бессрочная гарантийная техническая поддержка'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Сбор кинематических данных станка и ЧПУ',
        desc: 'Изучение руководства по программированию ЧПУ (Programming Manual), таблицы стандартных и M/G-кодов, кинематической схемы перемещений осей.'
      },
      {
        stepNumber: 2,
        title: 'Построение 3D-модели станка и программирование логики',
        desc: 'Создание твердотельной кинематической сборки станка в TopSolid 7, настройка алгоритмов круговой интерполяции, циклов сверления и смены инструмента.'
      },
      {
        stepNumber: 3,
        title: 'Виртуальная верификация и устранение коллизий',
        desc: 'Сквозная проверка траекторий на критических углах поворота стола/головы, контроль выходов за пределы концевиков осей (Software Limits).'
      },
      {
        stepNumber: 4,
        title: 'Внедрение на станке и изготовление тестовой детали',
        desc: 'Выезд инженера-технолога в цех заказчика, загрузка УП, пошаговая покадровая отработка на холостом ходу и фрезерование контрольной детали.'
      }
    ]
  },

  // 5. Сквозное проектирование технологической оснастки (штампы и пресс-формы)
  {
    id: 'tooling-design',
    title: 'Сквозное проектирование технологической оснастки',
    category: 'Проектирование оснастки',
    shortDesc: 'Проектирование и изготовление пресс-форм точного литья термопластов/металлов и штампов совмещенного/последовательного действия «под ключ» по ЕСКД.',
    fullDesc: '«ДС‑Инжиниринг» выполняет комплексное сквозное проектирование литьевых пресс-форм (холодноканальных, горячеканальных, многоместных) и штамповой оснастки любой сложности: вырубные, гибочные, вытяжные и последовательные штампы (Progressive Die). Разработка ведется в специализированных отраслевых модулях TopSolid 7 Mold и TopSolid 7 Progress. На этапе проектирования проводится DFM-анализ технологичности детали, кинематический расчет хода ползунов и шиберов, расчет усадки полимеров и компенсации пружинения листового металла. Проект включает полную конструкторскую документацию по ЕСКД, карты раскроя, кинематическую симуляцию работы оснастки и управляющие программы для ЧПУ фрезерных и электроэрозионных станков.',
    iconName: 'Wrench',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    basePriceText: 'от 50 000 ₽ / проект',
    calculatorType: 'tooling',
    responsiblePerson: 'Некрасов Сергей Юрьевич (Технический директор)',
    slaResponseTime: 'Анализ детали и коммерческое предложение за 24 часа',
    workLocationNote: 'Инженерный центр в Самаре (ул. Свободы, 198) с шеф-монтажом и испытаниями на площадке заказчика',
    contacts: [
      COMPANY_SPECIALISTS.nekrasov,
      COMPANY_SPECIALISTS.skobelev
    ],
    equipmentUsed: [
      'Специализированная САПР пресс-форм TopSolid 7 Mold',
      'Специализированная САПР листовой штамповки TopSolid 7 Progress',
      'Модули DFM-анализа технологичности литья и штамповки',
      'Парк мобильных 3D-сканеров для приемочного метрологического контроля'
    ],
    deliverables: [
      'Полная 3D CAD-сборка пресс-формы или штампа со стандартными пакетами (FODESCO, HASCO, DME)',
      'Комплект рабочей конструкторской документации по ЕСКД для инструментального цеха',
      'Готовые управляющие программы (УП) для станков с ЧПУ (фрезерование, электроэрозия)',
      'Протокол приемочных испытаний опытной партии отливок/штамповок'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'DFM-анализ изделия и выбор плоскости разъема',
        desc: 'Проверка углов уклона, поднутрений, разнотолщинности стенок детали, расчет объемной усадки и выбор расположения литниковой системы.'
      },
      {
        stepNumber: 2,
        title: 'Моделирование формообразующих и кинематики',
        desc: 'Построение пуансонов, матриц, шиберов, знаков и систем охлаждения/выталкивания в среде TopSolid 7 Mold/Progress.'
      },
      {
        stepNumber: 3,
        title: 'Кинематическая симуляция работы оснастки',
        desc: 'Проверка отсутствия соударений подвижных плит, толкателей и гидроцилиндров во всем диапазоне рабочих ходов пресса.'
      },
      {
        stepNumber: 4,
        title: 'Выпуск КД, УП и сопровождение изготовления',
        desc: 'Генерация спецификаций по ЕСКД, разработка управляющих программ для станков с ЧПУ и участие в испытаниях первой отливки.'
      }
    ]
  },

  // 6. Техническое обслуживание, модернизация и калибровка КИМ
  {
    id: 'cmm-maintenance',
    title: 'Техническое обслуживание, модернизация и поверка КИМ',
    category: 'Сервис и калибровка',
    shortDesc: 'Регламентное ТО, лазерная юстировка геометрической точности, организация поверки во ФГИС «АРШИН» и модернизация (ретрофит) координатно-измерительных машин и КИМ-рук.',
    fullDesc: 'Выполняем регламентное ТО, лазерную калибровку и ретрофит стационарных КИМ. Устанавливаем контроллеры и щупы Renishaw, переводим машины на ПО PolyWorks, организуем поверку в ФГИС «АРШИН».',
    iconName: 'Activity',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800&q=80',
    basePriceText: 'от 40 000 ₽ / прибор',
    calculatorType: 'cmm_service',
    responsiblePerson: 'Ярыш Иван Владимирович (Инженер-метролог)',
    slaResponseTime: 'Аварийный выезд сервисного инженера за 24–48 часов',
    workLocationNote: 'Выезд сервисных инженеров на производственную площадку заказчика по всей территории РФ',
    contacts: [
      COMPANY_SPECIALISTS.yarish,
      COMPANY_SPECIALISTS.nekrasov
    ],
    equipmentUsed: [
      'Поверенные лазерные интерферометрические измерительные системы',
      'Комплекты эталонных калибровочных сфер и ступенчатых мер длины',
      'Диагностические приборы Renishaw и наборы тестовых щупов',
      'Метрологическое ПО PolyWorks|Inspector™'
    ],
    deliverables: [
      'Акт выполненного регламентного технического обслуживания оборудования',
      'Протокол калибровки геометрической точности КИМ по ГОСТ Р ИСО 10360',
      'Свидетельство о поверке СИ с подтверждением во ФГИС «АРШИН»',
      'Рекомендации по безаварийной эксплуатации и регламент межповерочного интервала'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Входная диагностика и аудит состояния узлов',
        desc: 'Проверка пневматических опор, состояния направляющих, оптических энкодеров, измерительной головки и повторяемости срабатывания датчиков.'
      },
      {
        stepNumber: 2,
        title: 'Регламентное ТО и очистка систем',
        desc: 'Промывка и регулировка пневмоподшипников, очистка оптических линеек, смазка приводов и замена изношенных кабелей.'
      },
      {
        stepNumber: 3,
        title: 'Лазерная интерферометрическая юстировка',
        desc: 'Измерение прямолинейности, перпендикулярности и шаговой погрешности осей, ввод матрицы геометрических компенсаций (CAA Matrix).'
      },
      {
        stepNumber: 4,
        title: 'Приемочные тесты и сдача во ФГИС «АРШИН»',
        desc: 'Контрольные замеры эталонной сферы и мер по ГОСТ Р ИСО 10360, оформление метрологических протоколов и регистрация поверки.'
      }
    ]
  }
];

/**
 * Получить услугу по уникальному идентификатору
 */
export function getServiceById(serviceId: string): ServiceItem | undefined {
  if (serviceId === 'cmm-service' || serviceId === 'cmm-maintenance') {
    return REAL_SERVICES.find(s => s.id === 'cmm-maintenance' || s.id === 'cmm-service');
  }
  return REAL_SERVICES.find(s => s.id === serviceId);
}

/**
 * Проверка валидности формата URL-ссылки.
 * Поддерживает протоколы http://, https://, tg://, а также относительные пути (начиная с /).
 */
export function isValidUrl(
  urlString: unknown,
  options: { allowRelative?: boolean; allowedProtocols?: string[] } = {}
): boolean {
  if (typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (!trimmed) return false;

  const allowedProtocols = options.allowedProtocols || ['http:', 'https:', 'tg:'];
  const allowRelative = options.allowRelative ?? true;

  // Telegram-ссылки вида https://t.me/username, t.me/username, telegram.me/username
  if (/^(https?:\/\/)?(t\.me|telegram\.me)\/[a-zA-Z0-9_]{4,}/i.test(trimmed)) {
    return true;
  }

  // Telegram deep-links вида tg://resolve?domain=username
  if (/^tg:\/\/resolve\?domain=[a-zA-Z0-9_]{4,}/i.test(trimmed)) {
    return true;
  }

  // Проверка через стандартный URL-парсер
  try {
    const parsed = new URL(trimmed);
    return allowedProtocols.includes(parsed.protocol.toLowerCase());
  } catch {
    // Относительные пути (например, /files/catalog.pdf или /images/hero.jpg)
    if (allowRelative && trimmed.startsWith('/') && !trimmed.startsWith('//') && trimmed.length > 1) {
      return true;
    }
    return false;
  }
}

/**
 * Валидация отдельной ссылки контакта (веб-сайт, профиль, Telegram, соцсети)
 */
export function validateContactLink(
  url: unknown, 
  linkName: string = 'Контактная ссылка'
): { isValid: boolean; error?: string } {
  if (url === undefined || url === null || url === '') {
    return { isValid: true }; // Ссылка опциональна
  }
  if (typeof url !== 'string') {
    return { 
      isValid: false, 
      error: `${linkName} должна быть строкой (string), получен тип: ${typeof url}` 
    };
  }
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: `${linkName} не может состоять только из пробелов` };
  }

  // Проверка формата URL с допустимыми протоколами
  if (!isValidUrl(trimmed, { allowedProtocols: ['http:', 'https:', 'tg:'], allowRelative: false })) {
    return { 
      isValid: false, 
      error: `${linkName} имеет недопустимый формат URL («${trimmed}»). Ожидается полный адрес (например, https://t.me/ds_engineering или https://ds-enginering.ru)` 
    };
  }

  return { isValid: true };
}

/**
 * Валидация отдельного наименования измерительного оборудования или ПО.
 * Проверяет:
 * 1. Отсутствие пустых значений и минимальную длину (не менее 3 символов).
 * 2. Наличие буквенных символов (название модели, марки или категории).
 * 3. Отсутствие недопустимых / синтетических сущностей (демо-центров, вымышленных залов).
 * 4. Корректность символьного состава (исключение бессмысленных наборов спецсимволов).
 */
export function validateEquipmentItem(name: unknown): { isValid: boolean; error?: string } {
  if (name === null || name === undefined || typeof name !== 'string') {
    return { isValid: false, error: 'Наименование оборудования обязательно для заполнения и должно быть строкой' };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Поле оборудования не может быть пустым' };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Слишком короткое наименование оборудования (минимум 3 символа)' };
  }
  if (trimmed.length > 200) {
    return { isValid: false, error: 'Слишком длинное наименование оборудования (максимум 200 символов)' };
  }

  // Проверка на наличие букв (кириллица или латиница)
  if (!/[a-zA-Zа-яА-ЯёЁ]/.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Недопустимый формат: наименование должно содержать буквы и указывать марку, модель или тип прибора/ПО' 
    };
  }

  // Запрет на указание несуществующих демо-центров и сторонних вымышленных залов
  const forbiddenDemoTerms = [
    'демо-центр', 'демоцентр', 'демо зал', 'демо-зал', 
    'демонстрационный зал', 'демонстрационный центр'
  ];
  const lower = trimmed.toLowerCase();
  for (const term of forbiddenDemoTerms) {
    if (lower.includes(term)) {
      return { 
        isValid: false, 
        error: `Недопустимый формат: упоминание демо-центров («${term}») запрещено регламентом «ДС-Инжиниринг»` 
      };
    }
  }

  // Запрет на строки только из спецсимволов или знаков препинания
  if (/^[^a-zA-Zа-яА-ЯёЁ0-9]+$/.test(trimmed)) {
    return { isValid: false, error: 'Недопустимые специальные символы в наименовании оборудования' };
  }

  return { isValid: true };
}

/**
 * Валидация массива оборудования для инжиниринговой услуги с проверкой обязательных типов данных:
 * 1. Проверяет тип данных: строго Array<string>.
 * 2. Проверяет непустой массив (минимум 1 прибор или программный комплекс).
 * 3. Проверяет тип каждого элемента массива: строго string (никаких number, object, null, undefined).
 * 4. Проверяет отсутствие пустых или состоящих из пробелов строк.
 * 5. Проверяет корректность названий через validateEquipmentItem.
 */
export function validateEquipmentArray(equipment: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (equipment === undefined || equipment === null) {
    errors.push('Поле оборудования (equipment / equipmentUsed) обязательно для заполнения');
    return { isValid: false, errors };
  }

  // Проверка типа данных массива
  if (!Array.isArray(equipment)) {
    const receivedType = typeof equipment;
    errors.push(`Недопустимый тип данных для оборудования: ожидается массив строк (Array<string>), получен тип "${receivedType}"`);
    return { isValid: false, errors };
  }

  // Проверка непустого массива
  if (equipment.length === 0) {
    errors.push('Список оборудования не может быть пустым: укажите минимум 1 прибор или программный комплекс');
    return { isValid: false, errors };
  }

  // Поэлементная проверка типов данных и формата
  equipment.forEach((item, idx) => {
    const itemNum = idx + 1;
    if (typeof item !== 'string') {
      const actualType = item === null ? 'null' : (Array.isArray(item) ? 'array' : typeof item);
      errors.push(`Элемент оборудования #${itemNum} имеет недопустимый тип данных "${actualType}". Требуется строго строковый тип (string)`);
      return;
    }

    const trimmed = item.trim();
    if (trimmed.length === 0) {
      errors.push(`Элемент оборудования #${itemNum} не может быть пустой строкой`);
      return;
    }

    const res = validateEquipmentItem(trimmed);
    if (!res.isValid && res.error) {
      errors.push(`Прибор #${itemNum}: ${res.error}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Алиас для совместимости со старыми модулями
 */
export const validateEquipmentList = validateEquipmentArray;

/**
 * Валидация контакта инженера/специалиста по услуге:
 * 1. Обязательные непустые поля: name (ФИО), phone (телефон).
 * 2. Корректность адреса email при наличии.
 * 3. Проверка валидности форматов URL для контактных ссылок (url, link, telegramUrl, website).
 */
export function validateContact(contact: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!contact || typeof contact !== 'object' || Array.isArray(contact)) {
    errors.push('Контактные данные должны быть объектом');
    return { isValid: false, errors };
  }

  const c = contact as Record<string, unknown>;

  // 1. ФИО специалиста (обязательное непустое поле)
  if (c.name === undefined || c.name === null || typeof c.name !== 'string' || !c.name.trim()) {
    errors.push('ФИО специалиста обязательно для заполнения и не может быть пустым');
  } else if (c.name.trim().length < 2) {
    errors.push('ФИО специалиста слишком короткое (минимум 2 символа)');
  }

  // 2. Должность/роль специалиста
  if (c.role !== undefined && c.role !== null) {
    if (typeof c.role !== 'string' || !c.role.trim()) {
      errors.push('Должность/роль специалиста должна быть непустой строкой');
    }
  }

  // 3. Телефон специалиста (обязательное непустое поле)
  if (c.phone === undefined || c.phone === null || typeof c.phone !== 'string' || !c.phone.trim()) {
    errors.push('Контактный телефон специалиста обязателен для заполнения и не может быть пустым');
  } else if (c.phone.replace(/\D/g, '').length < 5) {
    errors.push('Некорректный формат контактного телефона (минимум 5 цифр)');
  }

  // 4. Email специалиста (если указан, должен быть валидным)
  if (c.email !== undefined && c.email !== null && c.email !== '') {
    if (typeof c.email !== 'string') {
      errors.push('Email специалиста должен быть строкой');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) {
      errors.push('Некорректный формат адреса электронной почты специалиста');
    }
  }

  // 5. Валидация URL-ссылок контакта
  const linkDefinitions: { key: string; label: string }[] = [
    { key: 'url', label: 'Ссылка на профиль специалиста (url)' },
    { key: 'link', label: 'Контактная ссылка (link)' },
    { key: 'telegramUrl', label: 'Ссылка на Telegram (telegramUrl)' },
    { key: 'website', label: 'Веб-сайт специалиста (website)' }
  ];

  for (const def of linkDefinitions) {
    const val = c[def.key];
    if (val !== undefined && val !== null && val !== '') {
      const linkVal = validateContactLink(val, def.label);
      if (!linkVal.isValid && linkVal.error) {
        errors.push(linkVal.error);
      }
    }
  }

  // Если передан список ссылок links (массив)
  if (c.links !== undefined && c.links !== null) {
    if (!Array.isArray(c.links)) {
      errors.push('Поле links контакта должно быть массивом ссылок');
    } else {
      c.links.forEach((linkItem, idx) => {
        const linkVal = validateContactLink(linkItem, `Контактная ссылка #${idx + 1}`);
        if (!linkVal.isValid && linkVal.error) {
          errors.push(linkVal.error);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Комплексная валидация инжиниринговой услуги перед сохранением через CMS:
 * 
 * 1. Проверка на отсутствие обязательных пустых полей:
 *    - title (наименование услуги)
 *    - category (категория)
 *    - shortDesc (краткое описание)
 *    - fullDesc (подробное описание)
 *    - calculatorType (тип калькулятора)
 *    - basePriceText (базовая стоимость)
 *    - deliverables (результаты для заказчика)
 *    - steps (этапы выполнения работ)
 * 2. Проверка обязательных типов данных для массива оборудования (validateEquipmentArray):
 *    - строго Array<string>
 *    - непустой список
 *    - каждый элемент строго строка без пустых значений
 * 3. Валидация форматов URL для контактных ссылок специалистов (validateContact / validateContactLink)
 * 4. Валидация URL брошюр, файлов и изображений (brochureUrl, fileUrl, image)
 * 5. Проверка отсутствия упоминания демо-центров и вымышленных залов
 */
export function validateServiceItem(item: unknown): ServiceValidationResult {
  const errors: ServiceValidationError[] = [];
  const errorMap: Record<string, string> = {};

  const addError = (field: ServiceValidationError['field'], message: string) => {
    errors.push({ field, message });
    if (!errorMap[field]) {
      errorMap[field] = message;
    }
  };

  if (!item || typeof item !== 'object') {
    addError('general', 'Данные услуги должны быть объектом');
    return { isValid: false, errors, errorMap };
  }

  const s = item as Record<string, unknown>;

  // 1. Наименование услуги (обязательное непустое строковое поле)
  if (s.title === undefined || s.title === null || typeof s.title !== 'string' || !s.title.trim()) {
    addError('title', 'Поле «Наименование услуги» обязательно для заполнения и не может быть пустым');
  } else {
    const trimmedTitle = s.title.trim();
    if (trimmedTitle.length < 3) {
      addError('title', 'Наименование услуги слишком короткое (минимум 3 символа)');
    } else if (trimmedTitle.length > 150) {
      addError('title', 'Наименование услуги не должно превышать 150 символов');
    }
  }

  // 2. Категория (обязательное непустое строковое поле)
  if (s.category === undefined || s.category === null || typeof s.category !== 'string' || !s.category.trim()) {
    addError('category', 'Поле «Категория услуги» обязательно для заполнения и не может быть пустым');
  }

  // 3. Краткое описание (обязательное непустое строковое поле)
  if (s.shortDesc === undefined || s.shortDesc === null || typeof s.shortDesc !== 'string' || !s.shortDesc.trim()) {
    addError('shortDesc', 'Поле «Краткое описание» обязательно для заполнения и не может быть пустым');
  } else {
    const trimmedShort = s.shortDesc.trim();
    if (trimmedShort.length < 10) {
      addError('shortDesc', 'Краткое описание слишком короткое (минимум 10 символов)');
    }
  }

  // 4. Подробное описание (обязательное непустое строковое поле)
  if (s.fullDesc === undefined || s.fullDesc === null || typeof s.fullDesc !== 'string' || !s.fullDesc.trim()) {
    addError('fullDesc', 'Поле «Подробное описание» обязательно для заполнения и не может быть пустым');
  } else {
    const trimmedFull = s.fullDesc.trim();
    if (trimmedFull.length < 20) {
      addError('fullDesc', 'Подробное описание должно содержать не менее 20 символов');
    }
  }

  // 5. Тип калькулятора (обязательное поле из разрешенного набора enum)
  if (!s.calculatorType || !VALID_CALCULATOR_TYPES.includes(s.calculatorType as ServiceCalculatorType)) {
    addError('calculatorType', `Недопустимый тип онлайн-калькулятора. Выберите одно из значений: ${VALID_CALCULATOR_TYPES.join(', ')}`);
  }

  // 6. Базовая цена (обязательное непустое строковое поле)
  if (s.basePriceText === undefined || s.basePriceText === null || typeof s.basePriceText !== 'string' || !s.basePriceText.trim()) {
    addError('basePriceText', 'Поле «Базовая цена» обязательно для заполнения (например, «от 5 000 ₽ / деталь» или «по запросу»)');
  }

  // 7. Проверка типа данных и структуры массива оборудования ('equipment' или 'equipmentUsed')
  const equipmentPayload = s.equipmentUsed !== undefined ? s.equipmentUsed : s.equipment;
  const eqResult = validateEquipmentArray(equipmentPayload);
  if (!eqResult.isValid) {
    addError('equipmentUsed', eqResult.errors.join('; '));
  }

  // 8. Перечень результатов для заказчика (deliverables) - непустой массив непустых строк
  if (!Array.isArray(s.deliverables) || s.deliverables.length === 0) {
    addError('deliverables', 'Перечень результатов для заказчика (deliverables) не может быть пустым (минимум 1 пункт)');
  } else {
    s.deliverables.forEach((deliv, idx) => {
      if (typeof deliv !== 'string') {
        addError('deliverables', `Результат #${idx + 1} должен быть строкой, получен тип ${typeof deliv}`);
      } else if (!deliv.trim()) {
        addError('deliverables', `Результат #${idx + 1} не может быть пустой строкой`);
      }
    });
  }

  // 9. Этапы выполнения работ (steps) - непустой массив валидных этапов
  if (!Array.isArray(s.steps) || s.steps.length === 0) {
    addError('steps', 'Этапы выполнения работ не могут быть пустыми (минимум 1 этап)');
  } else {
    s.steps.forEach((step, idx) => {
      const stepNum = idx + 1;
      if (!step || typeof step !== 'object') {
        addError('steps', `Этап #${stepNum}: некорректный формат данных (ожидается объект)`);
        return;
      }
      const st = step as Record<string, unknown>;
      if (typeof st.title !== 'string' || !st.title.trim()) {
        addError('steps', `Этап #${stepNum}: отсутствует или не заполнено название этапа`);
      }
      if (typeof st.desc !== 'string' || !st.desc.trim()) {
        addError('steps', `Этап #${stepNum}: отсутствует или не заполнено описание работ на этапе`);
      }
      if (st.stepNumber !== undefined && (typeof st.stepNumber !== 'number' || st.stepNumber <= 0)) {
        addError('steps', `Этап #${stepNum}: номер этапа должен быть положительным числом`);
      }
    });
  }

  // 10. Контакты специалистов и валидация форматов URL для контактных ссылок
  if (s.contacts !== undefined && s.contacts !== null) {
    if (!Array.isArray(s.contacts)) {
      addError('contacts', 'Поле contacts должно быть массивом специалистов');
    } else {
      s.contacts.forEach((contact, idx) => {
        const contactVal = validateContact(contact);
        if (!contactVal.isValid) {
          addError('contacts', `Специалист #${idx + 1}: ${contactVal.errors.join('; ')}`);
        }
      });
    }
  }

  // 11. Валидация URL ссылок документов и медиа услуги
  if (s.image !== undefined && s.image !== null && s.image !== '') {
    if (typeof s.image !== 'string' || !s.image.trim()) {
      addError('image', 'Изображение услуги должно быть непустой строкой URL');
    } else if (!isValidUrl(s.image.trim(), { allowRelative: true })) {
      addError('image', 'Некорректный формат URL изображения услуги');
    }
  }

  if (s.brochureUrl !== undefined && s.brochureUrl !== null && s.brochureUrl !== '') {
    if (typeof s.brochureUrl !== 'string' || !s.brochureUrl.trim()) {
      addError('brochureUrl', 'Ссылка на брошюру должна быть непустой строкой URL');
    } else if (!isValidUrl(s.brochureUrl.trim(), { allowRelative: true })) {
      addError('brochureUrl', 'Некорректный формат URL ссылки на брошюру услуги');
    }
  }

  if (s.fileUrl !== undefined && s.fileUrl !== null && s.fileUrl !== '') {
    if (typeof s.fileUrl !== 'string' || !s.fileUrl.trim()) {
      addError('fileUrl', 'Ссылка на файл должна быть непустой строкой URL');
    } else if (!isValidUrl(s.fileUrl.trim(), { allowRelative: true })) {
      addError('fileUrl', 'Некорректный формат URL ссылки на файл услуги');
    }
  }

  // 12. Проверка отсутствия упоминания демо-центров
  const forbiddenDemoTerms = [
    'демо-центр', 'демоцентр', 'демо зал', 'демо-зал', 
    'демонстрационный зал', 'демонстрационный центр'
  ];
  const allText = `${String(s.title || '')} ${String(s.shortDesc || '')} ${String(s.fullDesc || '')} ${String(s.workLocationNote || '')}`.toLowerCase();
  for (const term of forbiddenDemoTerms) {
    if (allText.includes(term)) {
      addError('general', `Обнаружено упоминание вымышленных демонстрационных центров («${term}»). Все работы проводятся на площадках компании в Самаре (ул. Свободы, 198), Тольятти (технопарк «Жигулевская долина», Южное шоссе, 161В) или на объекте заказчика.`);
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    errorMap
  };
}

/**
 * Комплексный валидатор инжиниринговой услуги (алиас для расширенного использования)
 */
export const validateComprehensiveServiceItem = validateServiceItem;
export const validateServiceData = validateServiceItem;

/**
 * Очистка и нормализация объекта услуги перед сохранением
 */
export function sanitizeServiceItem(raw: Partial<ServiceItem> & { equipment?: unknown }): ServiceItem {
  const cleanId = (raw.id || `serv-${Date.now()}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  
  const rawEquipment = raw.equipmentUsed !== undefined ? raw.equipmentUsed : raw.equipment;
  const sanitizedEquipment = Array.isArray(rawEquipment)
    ? rawEquipment
        .filter((e): e is string => typeof e === 'string')
        .map(e => e.trim())
        .filter(e => e.length > 0)
    : [];

  return {
    id: cleanId,
    title: (raw.title || '').trim(),
    category: (raw.category || 'Инжиниринговые услуги').trim(),
    shortDesc: (raw.shortDesc || '').trim(),
    fullDesc: (raw.fullDesc || raw.shortDesc || '').trim(),
    iconName: raw.iconName || 'Wrench',
    image: raw.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    calculatorType: (raw.calculatorType && VALID_CALCULATOR_TYPES.includes(raw.calculatorType)) 
      ? raw.calculatorType 
      : 'scanning',
    basePriceText: (raw.basePriceText || 'по запросу').trim(),
    equipmentUsed: sanitizedEquipment,
    deliverables: Array.isArray(raw.deliverables)
      ? raw.deliverables
          .filter((d): d is string => typeof d === 'string')
          .map(d => d.trim())
          .filter(d => d.length > 0)
      : [],
    steps: Array.isArray(raw.steps) && raw.steps.length > 0
      ? raw.steps.map((s, idx) => ({
          stepNumber: typeof s.stepNumber === 'number' && s.stepNumber > 0 ? s.stepNumber : idx + 1,
          title: (s.title || `Этап ${idx + 1}`).trim(),
          desc: (s.desc || '').trim()
        }))
      : [
          { stepNumber: 1, title: 'Анализ ТЗ', desc: 'Изучение исходных данных и требований заказчика' },
          { stepNumber: 2, title: 'Выполнение работ', desc: 'Проведение измерений или моделирования' },
          { stepNumber: 3, title: 'Сдача отчетности', desc: 'Предоставление официального протокола и CAD-данных' }
        ],
    contacts: Array.isArray(raw.contacts) ? raw.contacts : undefined,
    responsiblePerson: raw.responsiblePerson?.trim() || undefined,
    slaResponseTime: raw.slaResponseTime?.trim() || undefined,
    workLocationNote: raw.workLocationNote?.trim() || undefined,
    brochureUrl: raw.brochureUrl?.trim() || undefined,
    fileUrl: raw.fileUrl?.trim() || undefined,
  };
}

/**
 * Константы версионирования и истории изменений услуг
 */
export const SERVICES_STORAGE_KEY = 'ds_cms_services';
export const SERVICES_HISTORY_STORAGE_KEY = 'ds_cms_services_history';
export const MAX_SERVICES_HISTORY_VERSIONS = 5;

/**
 * Снимок версии реестра услуг для истории и отката
 */
export interface ServiceVersionSnapshot {
  id: string;
  versionNumber: number;
  timestamp: string;
  formattedDate: string;
  description: string;
  author?: string;
  servicesCount: number;
  services: ServiceItem[];
  metadata?: {
    changedServiceId?: string;
    action?: 'create' | 'update' | 'delete' | 'bulk_save' | 'restore' | 'init';
    reason?: string;
  };
}

/**
 * Получение истории сохраненных версий услуг из localStorage (до 5 последних версий)
 */
export function getServicesHistory(): ServiceVersionSnapshot[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(SERVICES_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is ServiceVersionSnapshot => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'string' &&
          Array.isArray(item.services)
        );
      })
      .slice(0, MAX_SERVICES_HISTORY_VERSIONS);
  } catch (err) {
    console.error('Ошибка при чтении истории версий услуг из localStorage:', err);
    return [];
  }
}

/**
 * Сохранение нового снимка версии услуг в localStorage (хранится ровно до 5 последних версий)
 */
export function saveServicesVersion(
  services: ServiceItem[],
  description: string = 'Сохранение изменений услуг',
  metadata?: ServiceVersionSnapshot['metadata']
): ServiceVersionSnapshot {
  const currentHistory = getServicesHistory();
  const nextVersionNumber = currentHistory.length > 0 
    ? (currentHistory[0].versionNumber || currentHistory.length) + 1 
    : 1;

  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(now);

  const snapshot: ServiceVersionSnapshot = {
    id: `ver-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}-${nextVersionNumber}`,
    versionNumber: nextVersionNumber,
    timestamp: now.toISOString(),
    formattedDate,
    description: description.trim() || `Версия #${nextVersionNumber}`,
    servicesCount: services.length,
    services: JSON.parse(JSON.stringify(services)),
    metadata: {
      action: 'update',
      ...metadata
    }
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Новая версия помещается в начало, ограничиваем 5 элементами
      const updatedHistory = [snapshot, ...currentHistory].slice(0, MAX_SERVICES_HISTORY_VERSIONS);
      localStorage.setItem(SERVICES_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    }
  } catch (err) {
    console.error('Ошибка при записи истории версий услуг в localStorage:', err);
  }

  return snapshot;
}

/**
 * Восстановление состояния услуг из указанного снимка версии
 */
export function restoreServicesVersion(versionId: string): ServiceItem[] | null {
  const history = getServicesHistory();
  const targetSnapshot = history.find(s => s.id === versionId);
  if (!targetSnapshot || !Array.isArray(targetSnapshot.services) || targetSnapshot.services.length === 0) {
    return null;
  }

  const restoredServices = JSON.parse(JSON.stringify(targetSnapshot.services)) as ServiceItem[];

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(restoredServices));
      
      // Записываем факт отката как новую версию в историю
      saveServicesVersion(
        restoredServices,
        `Откат к версии #${targetSnapshot.versionNumber} (${targetSnapshot.formattedDate})`,
        { action: 'restore', reason: `Откат к снимку ${targetSnapshot.id}` }
      );
    }
  } catch (err) {
    console.error('Ошибка при восстановлении версии услуг:', err);
  }

  return restoredServices;
}

/**
 * Быстрый откат к предыдущей версии (предшествующей текущей)
 */
export function rollbackToPreviousVersion(): {
  success: boolean;
  services?: ServiceItem[];
  message: string;
  restoredVersion?: ServiceVersionSnapshot;
} {
  const history = getServicesHistory();
  if (history.length < 2) {
    return {
      success: false,
      message: 'Предыдущие версии отсутствуют в истории (необходимо минимум 2 снимка)'
    };
  }

  const previousSnapshot = history[1]; // индекс 1 - предшествующая версия
  const restored = restoreServicesVersion(previousSnapshot.id);

  if (!restored) {
    return {
      success: false,
      message: 'Не удалось прочитать данные предыдущей версии'
    };
  }

  return {
    success: true,
    services: restored,
    restoredVersion: previousSnapshot,
    message: `Успешно выполнен откат к версии #${previousSnapshot.versionNumber} от ${previousSnapshot.formattedDate}`
  };
}

/**
 * Получение последней активной версии
 */
export function getLatestServicesVersion(): ServiceVersionSnapshot | null {
  const history = getServicesHistory();
  return history.length > 0 ? history[0] : null;
}

/**
 * Очистка истории версий (например, при сбросе к заводским настройкам)
 */
export function clearServicesHistory(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(SERVICES_HISTORY_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Ошибка при очистке истории версий услуг:', err);
  }
}

/**
 * Экспорт по умолчанию
 */
export default REAL_SERVICES;
