/**
 * ИНЖЕНЕРНО-ТЕХНИЧЕСКИЙ ГЛОССАРИЙ («ДС-ИНЖИНИРИНГ»)
 * Профессиональный справочник метрологических, CAD/CAM и технологических терминов
 * для главных инженеров, метрологов, технологов и операторов ЧПУ.
 */

import { PageId } from '../types';

export interface GlossaryTerm {
  id: string;
  term: string;
  termEn?: string;
  termRu: string;
  category: 'gdt_standards' | 'metrology_cmm' | 'cad_cam' | 'cnc_postprocessors' | 'reverse_scanning';
  categoryLabel: string;
  letter: string;
  shortDefinition: string;
  fullDescription: string;
  keyStandards: string[];
  practicalApplication: string;
  exampleSymbols?: string[];
  relatedTerms?: string[];
  actionLink?: {
    text: string;
    page: PageId;
    detailId?: string;
  };
}

export const GLOSSARY_CATEGORIES = [
  { id: 'all', label: 'Все термины' },
  { id: 'gdt_standards', label: 'GD&T и Нормативы' },
  { id: 'metrology_cmm', label: 'Метрология и КИМ' },
  { id: 'cnc_postprocessors', label: 'Станки ЧПУ и Постпроцессоры' },
  { id: 'cad_cam', label: 'САПР (CAD/CAM/PDM)' },
  { id: 'reverse_scanning', label: '3D-сканирование и Реверс' },
] as const;

export const ENGINEERING_GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'gdt',
    term: 'GD&T',
    termEn: 'Geometric Dimensioning and Tolerancing',
    termRu: 'Геометрические размеры и допуски',
    category: 'gdt_standards',
    categoryLabel: 'GD&T и Нормативы',
    letter: 'G',
    shortDefinition: 'Стандартизированная международная система символьного обозначения предельных геометрических отклонений формы, ориентации, местоположения и биения поверхностей деталей.',
    fullDescription: 'В отличие от традиционного координатного проставления размеров с двусторонними линейными полями (±Δ), система GD&T описывает теоретически точную геометрию (Basic Dimensions) и задает трехмерные зоны допуска (цилиндрические, сферические или полосовые). Это позволяет увеличить технологическое поле годности деталей до 57% за счет круговой зоны позиционного допуска вместо квадратной, снижая брак на механообработке и гарантируя 100% собираемость без пригонки.',
    keyStandards: ['ASME Y14.5-2018', 'ISO 1101:2017', 'ГОСТ Р 53442-2015'],
    practicalApplication: 'В ПО PolyWorks|Inspector™ и Geomagic Control X расчет допусков GD&T выполняется автоматически на основе математического анализа совмещения со щуповыми контактами КИМ и плотными сетками 3D-сканирования.',
    exampleSymbols: ['⌖ Позиционный допуск', '⟂ Перпендикулярность', '⌯ Симметричность', '◎ Концентричность', '⏥ Плоскостность', '↗ Радиальное биение'],
    relatedTerms: ['iso-1101', 'datum', 'fai', 'pmi'],
    actionLink: {
      text: 'Услуги метрологического контроля GD&T',
      page: 'services',
      detailId: 'parts-inspection',
    },
  },
  {
    id: 'iso-1101',
    term: 'ISO 1101',
    termEn: 'Geometrical product specifications (GPS) — Geometrical tolerancing',
    termRu: 'Геометрические характеристики изделий (GPS) — Допуски формы, ориентации, местоположения и биения',
    category: 'gdt_standards',
    categoryLabel: 'GD&T и Нормативы',
    letter: 'I',
    shortDefinition: 'Базовый международный норматив, устанавливающий фундаментальный синтаксис, правила указания и математическую интерпретацию геометрических допусков в конструкторской документации и 3D CAD-моделях (PMI/MBD).',
    fullDescription: 'Стандарт ISO 1101 определяет принципы независимости требований, модификаторы материального состояния (MMC / Ⓜ — максимум материала, LMC / Ⓛ — минимум материала), правила построения систем баз (Datum Reference Frame) и правила применения общих допусков. Служит основой для гармонизированных российских стандартов Единой системы конструкторской документации (ЕСКД).',
    keyStandards: ['ISO 1101:2017', 'ISO 5459:2011 (Базы и системы баз)', 'ISO 14405-1 (Линейные размеры)'],
    practicalApplication: 'Применяется инженерами «ДС-Инжиниринг» при инспекции первого изделия (FAI) и составлении юридически значимых метрологических актов разногласий между поставщиками литья/поковок и сборочными заводами.',
    exampleSymbols: ['Ⓜ Maximum Material Condition', 'Ⓛ Least Material Condition', 'Ⓟ Projected Tolerance Zone', 'CZ Combined Zone'],
    relatedTerms: ['gdt', 'pmi', 'fai'],
    actionLink: {
      text: 'Контроль геометрических допусков',
      page: 'services',
      detailId: 'parts-inspection',
    },
  },
  {
    id: 'kinematic-machine-model',
    term: 'Кинематическая модель станка',
    termEn: 'Kinematic Machine Simulation / Digital Twin',
    termRu: 'Кинематическая 3D-модель станка (Цифровой двойник)',
    category: 'cnc_postprocessors',
    categoryLabel: 'Станки ЧПУ и Постпроцессоры',
    letter: 'К',
    shortDefinition: 'Точная трехмерная сборка станочного комплекса со всеми подвижными звеньями, шпинделями, приводами и зажимными приспособлениями для 100% предиктивной симуляции обработки и защиты от столкновений в CAM-системе.',
    fullDescription: 'Включает математическое дерево сопряжения подвижных линейных (X, Y, Z) и поворотных (A, B, C) осей, пределы перемещений (Machine Stroke Limits), динамику ускорений и виртуальное окружение зоны резания. Позволяет верифицировать перемещения режущего инструмента, державки и элементов станка до вывода УП в цех, исключая дорогостоящие аварии шпиндельных узлов.',
    keyStandards: ['ISO 10791 (Испытания обрабатывающих центров)', 'ISO 230 (Нормы точности станков)'],
    practicalApplication: 'В среде TopSolid 7 CAM кинематический цифровой двойник проверяет каждую строчку траектории, предупреждает оператора о выходе за пределы концевиков осей и автоматически подбирает оптимальный наклон поворотной головы.',
    relatedTerms: ['postprocessor', 'rtcp', 'g-code'],
    actionLink: {
      text: 'Внедрение TopSolid 7 CAM',
      page: 'software',
      detailId: 'topsolid-7',
    },
  },
  {
    id: 'postprocessor',
    term: 'Постпроцессор',
    termEn: 'CAM Post-Processor',
    termRu: 'Постпроцессор для станка с ЧПУ',
    category: 'cnc_postprocessors',
    categoryLabel: 'Станки ЧПУ и Постпроцессоры',
    letter: 'П',
    shortDefinition: 'Специализированный программный модуль трансляции, преобразующий инвариантную траекторию инструмента (CL-data) из CAM-системы в исполняемый управляющий код (G-код) под конкретную стойку ЧПУ.',
    fullDescription: 'Учитывает особенности диалекта системы ЧПУ (Fanuc, Heidenhain, Siemens Sinumerik, Haas, Балт-Систем), кинематику поворотной механики, стоечные циклы сверления/нарезания резьбы, режимы RTCP/TCPM (G43.4, TRAORI, M128), пространственные трансформации плоскостей обработки (CYCLE800, PLANE SPATIAL, G68.2) и алгоритмы сглаживания траектории (Cycle 32, High-Speed Machining).',
    keyStandards: ['ISO 6983 (Кодирование управляющих программ)', 'DIN 66025', 'ГОСТ 20999-83'],
    practicalApplication: 'Инженеры «ДС-Инжиниринг» с 1995 года разработали более 500 сертифицированных постпроцессоров для 3-, 4- и 5-осевых фрезерных, токарно-фрезерных ОЦ и автоматов продольного точения Swiss-type.',
    relatedTerms: ['kinematic-machine-model', 'rtcp', 'g-code'],
    actionLink: {
      text: 'Заказать разработку постпроцессора',
      page: 'services',
      detailId: 'postprocessors-dev',
    },
  },
  {
    id: 'b-rep',
    term: 'B-Rep',
    termEn: 'Boundary Representation',
    termRu: 'Граничное представление твердого тела',
    category: 'cad_cam',
    categoryLabel: 'САПР (CAD/CAM/PDM)',
    letter: 'B',
    shortDefinition: 'Математический метод описания объемных трехмерных тел в CAD-системах через замкнутое множество топологически связанных ограничивающих поверхностей, ребер и вершин.',
    fullDescription: 'В отличие от полигональных фасеточных сеток (STL, где объект состоит из плоских треугольников), модели B-Rep содержат идеальную математическую геометрию: цилиндры, конусы, плоскости и сплайновые лоскуты с точным описанием их топологических границ. B-Rep лежит в основе ведущих геометрических ядер моделирования (Parasolid, ACIS) и универсальных нейтральных обменных форматов STEP (.stp) и Parasolid (.x_t).',
    keyStandards: ['ISO 10303-21 (STEP Physical File)', 'ISO 10303-242 (STEP AP242 MBD)'],
    practicalApplication: 'Основной промышленный результат реверс-инжиниринга от «ДС-Инжиниринг». B-Rep модели гарантируют отсутствие полигональной ступенчатости при последующем расчете траекторий ЧПУ и проектировании оснастки.',
    relatedTerms: ['nurbs', 'step-format', 'reverse-engineering'],
    actionLink: {
      text: 'Реверс-инжиниринг в твердые тела B-Rep',
      page: 'services',
      detailId: 'reverse-engineering',
    },
  },
  {
    id: 'nurbs',
    term: 'NURBS',
    termEn: 'Non-Uniform Rational B-Splines',
    termRu: 'Неоднородные рациональные B-сплайны',
    category: 'cad_cam',
    categoryLabel: 'САПР (CAD/CAM/PDM)',
    letter: 'N',
    shortDefinition: 'Математический аппарат моделирования гладких кривых и поверхностей свободной формы (Freeform Surfaces) с возможностью локального управления формой через контрольные полюса и веса.',
    fullDescription: 'NURBS позволяет с аналитической гладкостью описывать как стандартные конические сечения (окружности, эллипсы, параболы), так и сложные аэродинамические формы (лопатки турбин, обтекатели, автомобильные кузовные панели, формообразующие пресс-форм). В реверс-инжиниринге алгоритмы AutoSurface натягивают сеть NURBS-лоскутов на полигональную сетку 3D-сканирования с контролем гладкости по касательной (G1) и кривизне (G2).',
    keyStandards: ['ISO 10303-42 (Геометрическое и топологическое представление)'],
    practicalApplication: 'Применяется в Geomagic Design X и TopSolid 7 при восстановлении проточной части центробежных насосов, лопаточных аппаратов и штамповой оснастки со сложными переходами.',
    relatedTerms: ['b-rep', 'reverse-engineering'],
    actionLink: {
      text: 'САПР Geomagic Design X',
      page: 'software',
      detailId: 'geomagic-design-x',
    },
  },
  {
    id: 'mpe',
    term: 'MPE',
    termEn: 'Maximum Permissible Error',
    termRu: 'Предельно допускаемая погрешность КИМ',
    category: 'metrology_cmm',
    categoryLabel: 'Метрология и КИМ',
    letter: 'M',
    shortDefinition: 'Предельное значение погрешности измерений координатно-измерительной машины, гарантированное производителем и подтвержденное протоколами поверки по стандарту ISO 10360.',
    fullDescription: 'Обозначается формулой вида MPE_E = ±(A + L/K) мкм, где A — базовая инструментальная погрешность прибора, L — измеряемый линейный размер в миллиметрах, K — масштабный делитель. Для контактных щупов мобильных рук регламентируется погрешность формы SPAT (Single Point Articulation Test, MPE_P), а для сканирующих систем — погрешность триангуляции MPE_CP.',
    keyStandards: ['ISO 10360-2 (Стационарные КИМ)', 'ISO 10360-12 (Шарнирные КИМ типа «рука»)', 'ГОСТ Р ИСО 10360'],
    practicalApplication: 'Все поставляемые компанией КИМ Hexagon Absolute Arm и PMT проходят первичную государственную поверку MPE с занесением свидетельства в Государственный реестр СИ (ФГИС «АРШИН»).',
    relatedTerms: ['cmm-arm', 'probe-qualification', 'arshin'],
    actionLink: {
      text: 'Каталог поверенных КИМ',
      page: 'hardware',
    },
  },
  {
    id: 'thermal-compensation',
    term: 'Температурная компенсация (20 °C)',
    termEn: 'Thermal Error Compensation',
    termRu: 'Математическая температурная компенсация измерений',
    category: 'metrology_cmm',
    categoryLabel: 'Метрология и КИМ',
    letter: 'Т',
    shortDefinition: 'Процедура автоматического приведения измеренных геометрических координат к нормальной метрологической температуре 20.0 °C на основе физического коэффициента теплового расширения (КЛТР) детали.',
    fullDescription: 'Поскольку все допуски чертежа нормируются строго при 20 °C (293.15 K), колебания температуры в цеховых условиях (от +12 °C зимой до +32 °C летом) вызывают тепловое расширение металла: ΔL = L · α · ΔT. Для 6-метровой стальной детали изменение температуры на 8 °C дает удлинение более 0.55 мм. Магнитные контактные термодатчики передают температуру заготовки в ПО PolyWorks, которое динамически пересчитывает вектор координат каждого щупового контакта.',
    keyStandards: ['ISO 1 (Нормальная температура для геометрических измерений: 20 °C)', 'ГОСТ 8.050-73'],
    practicalApplication: 'Обязательный этап выездного контроля «ДС-Инжиниринг» при измерениях крупногабаритных рам, станин прессов и штампов на предприятиях машиностроения.',
    relatedTerms: ['cltr', 'mpe', 'leapfrog'],
    actionLink: {
      text: 'Выездные измерения с термокомпенсацией',
      page: 'services',
      detailId: 'parts-inspection',
    },
  },
  {
    id: 'rtcp',
    term: 'RTCP / TCPM',
    termEn: 'Rotation Tool Center Point / Tool Center Point Management',
    termRu: 'Управление положением вершины инструмента при 5-осевой обработке',
    category: 'cnc_postprocessors',
    categoryLabel: 'Станки ЧПУ и Постпроцессоры',
    letter: 'R',
    shortDefinition: 'Функция ЧПУ-контроллера, автоматически компенсирующая пространственное смещение вершины режущей кромки инструмента при повороте поворотных осей станка (A, B или C).',
    fullDescription: 'В системах ЧПУ разных производителей реализуется командами G43.4 / G43.5 (Fanuc), TRAORI (Siemens Sinumerik), M128 / FUNCTION TCPM (Heidenhain). Позволяет технологу программировать перемещения вершины фрезы относительно контура детали независимо от расстояния вылета инструмента и плеча качания шпинделя.',
    keyStandards: ['ISO 6983', 'Heidenhain TNC Guide', 'Siemens Advanced Surface Manual'],
    practicalApplication: 'Настраивается и верифицируется в постпроцессорах TopSolid 7 CAM для высокоскоростной пятиосевой обработки штампов, лопаток и импеллеров.',
    relatedTerms: ['kinematic-machine-model', 'postprocessor'],
    actionLink: {
      text: 'Разработка 5-осевых постпроцессоров',
      page: 'services',
      detailId: 'postprocessors-dev',
    },
  },
  {
    id: 'rps',
    term: 'RPS-базирование',
    termEn: 'Reference Point System',
    termRu: 'Система опорных базовых точек',
    category: 'gdt_standards',
    categoryLabel: 'GD&T и Нормативы',
    letter: 'R',
    shortDefinition: 'Методика однозначного координатного базирования нежестких деталей сложной формы (штамповки, отливки, кузовные элементы) по 6 локальным точкам касания по правилу 3-2-1.',
    fullDescription: 'Вместо протяженных плоских баз (которые могут иметь прогиб, литейные уклоны или коробление) задаются строго определенные координаты точек касания с упорами или сферическими наконечниками: 3 точки фиксируют плоскость (Z, Rx, Ry), 2 точки фиксируют направление (Y, Rz), 1 точка фиксирует упор (X). Это устраняет неопределенность выравнивания детали при контроле на КИМ.',
    keyStandards: ['DIN 16742', 'VDA 2007 (RPS Richtlinie)', 'ISO 5459'],
    practicalApplication: 'Стандартный инструмент в PolyWorks|Inspector при контроле штампованной кузовной оснастки АВТОВАЗ, КАМАЗ и деталей авиационной обшивки.',
    relatedTerms: ['gdt', 'iso-1101', 'datum'],
    actionLink: {
      text: 'Метрологический софт PolyWorks',
      page: 'software',
      detailId: 'polyworks-inspector',
    },
  },
  {
    id: 'leapfrog',
    term: 'Leapfrog (Перебазирование)',
    termEn: 'Leapfrog CMM Relocation',
    termRu: 'Шаговый перенос базы мобильной КИМ',
    category: 'metrology_cmm',
    categoryLabel: 'Метрология и КИМ',
    letter: 'L',
    shortDefinition: 'Методология расширения измерительного объема мобильной КИМ или лазерного трекера путем последовательного переноса прибора по жестким реперным точкам.',
    fullDescription: 'Позволяет с помощью портативной измерительной руки с радиусом 2.5–3.5 м обмерять крупногабаритные объекты длиной 10–20 метров (лонжероны, стапели, железнодорожные рамы). На детали фиксируются минимум 3–5 магнитных конических гнезд (Nest). Прибор переставляется на новую позицию и повторно измеряет общие реперы. Алгоритм Best-Fit совмещает координаты с контролем невязки трансформации (обычно не более 0.012–0.015 мм).',
    keyStandards: ['ISO 10360-12', 'VDI/VDE 2617'],
    practicalApplication: 'Применяется сервисной группой «ДС-Инжиниринг» при выездных обмерах крупногабаритных металлоконструкций на объектах заказчиков.',
    relatedTerms: ['mpe', 'thermal-compensation'],
    actionLink: {
      text: 'Мобильные КИМ Hexagon Absolute Arm',
      page: 'hardware',
      detailId: 'hexagon-absolute-arm-7axis',
    },
  },
  {
    id: 'fai',
    term: 'FAI',
    termEn: 'First Article Inspection',
    termRu: 'Инспекция первого изделия (Протокол FAI)',
    category: 'gdt_standards',
    categoryLabel: 'GD&T и Нормативы',
    letter: 'F',
    shortDefinition: 'Формализованная процедура полной метрологической верификации первой детали установочной партии перед запуском в серийное производство.',
    fullDescription: 'Включает 100% замер всех размеров чертежа, проверку соответствия допусков формы и расположения (GD&T), контроль шероховатости Ra, проверку сертификатов на металл и термообработку. Формируется развернутый протокол с указанием номинала, фактического замера, поля допуска и статуса соответствия (Pass/Fail).',
    keyStandards: ['AS9102 (Аэрокосмический стандарт FAI)', 'ISO 9001', 'ГОСТ Р ИСО 9001'],
    practicalApplication: 'Инженеры «ДС-Инжиниринг» готовят официальные FAI-отчеты в PolyWorks|Inspector для поставщиков авиационного двигателестроения и автопрома.',
    relatedTerms: ['gdt', 'iso-1101'],
    actionLink: {
      text: 'Оформление протоколов FAI',
      page: 'services',
      detailId: 'parts-inspection',
    },
  },
  {
    id: 'point-cloud',
    term: 'Облако точек',
    termEn: 'Point Cloud',
    termRu: 'Координатное облако точек (3D Point Cloud)',
    category: 'reverse_scanning',
    categoryLabel: '3D-сканирование и Реверс',
    letter: 'О',
    shortDefinition: 'Массив из сотен тысяч или миллионов дискретных пространственных точек (X, Y, Z), описывающих физическую поверхность оцифрованного объекта.',
    fullDescription: 'Формируется в результате оптической триангуляции синим лазером или структурированным подсчетом 3D-сканеров (Shining 3D FreeScan, Hexagon AS1). Каждая точка может содержать нормали (I, J, K) и значение интенсивности отражения. В процессе предобработки облако фильтруется от шумов и преобразуется в триангулированную полигональную сетку (STL, OBJ, PLY) для последующего CAD-моделирования или контроля отклонений.',
    keyStandards: ['ASTM E2807 (Standard Specification for 3D Imaging Data Exchange - E57)'],
    practicalApplication: 'Сбор облаков точек выполняется прецизионными сканерами Shining 3D FreeScan Combo со скоростью до 1.86 млн точек в секунду.',
    relatedTerms: ['b-rep', 'reverse-engineering'],
    actionLink: {
      text: 'Услуги прецизионного 3D-сканирования',
      page: 'services',
      detailId: '3d-scanning',
    },
  },
  {
    id: 'pdm-system',
    term: 'Сквозная PDM-система',
    termEn: 'Product Data Management',
    termRu: 'Управление инженерными данными об изделии',
    category: 'cad_cam',
    categoryLabel: 'САПР (CAD/CAM/PDM)',
    letter: 'P',
    shortDefinition: 'Интегрированная система управления жизненным циклом конструкторско-технологических данных: версионирование деталей, спецификации, права доступа и электронный архив.',
    fullDescription: 'В отличие от файлового хранения в папках Windows, встроенная PDM в TopSolid 7 хранит данные в защищенной базе. При изменении детали PDM автоматически отслеживает все связанные чертежи, сборки оснастки, технологические переходы и постпроцессированные УП, исключая изготовление брака по устаревшим ревизиям.',
    keyStandards: ['ISO 10303 (STEP)', 'ГОСТ 2.051-2013 (Электронные документы ЕСКД)'],
    practicalApplication: 'Внедряется специалистами «ДС-Инжиниринг» на машиностроительных предприятиях для организации безбумажного сквозного производства.',
    relatedTerms: ['kinematic-machine-model', 'postprocessor'],
    actionLink: {
      text: 'Архитектура PDM в TopSolid 7',
      page: 'software',
      detailId: 'topsolid-7',
    },
  },
  {
    id: 'pmi-mbd',
    term: 'PMI / MBD',
    termEn: 'Product and Manufacturing Information / Model-Based Definition',
    termRu: 'Производственная информация об изделии / Бесчертежное проектирование',
    category: 'gdt_standards',
    categoryLabel: 'GD&T и Нормативы',
    letter: 'P',
    shortDefinition: 'Внедрение семантических 3D-аннотаций непосредственно в CAD-модель: геометрические допуски (GD&T), базы, шероховатость Ra и технические требования без создания плоских 2D-чертежей.',
    fullDescription: 'Технология MBD исключает дублирование и человеческий фактор при чтении чертежей. Метрологическое ПО (PolyWorks, Geomagic) напрямую считывает PMI-аннотации из CAD-модели, автоматически генерируя план измерений КИМ и контрольные номиналы со всеми допусками формы и расположения.',
    keyStandards: ['ISO 16792:2021', 'ASME Y14.41-2019', 'ГОСТ Р 2.052-2021'],
    practicalApplication: 'Специалисты «ДС-Инжиниринг» настраивают сквозной экспорт PMI в формате STEP AP242 для автоматизированной инспекции на КИМ Hexagon и PMT.',
    relatedTerms: ['gdt', 'iso-1101', 'step-ap242'],
    actionLink: {
      text: 'Метрологический софт PolyWorks',
      page: 'software',
      detailId: 'polyworks-inspector',
    },
  },
  {
    id: 'cltr',
    term: 'КЛТР (α, ppm/°C)',
    termEn: 'Coefficient of Linear Thermal Expansion (CTE)',
    termRu: 'Коэффициент линейного теплового расширения',
    category: 'metrology_cmm',
    categoryLabel: 'Метрология и КИМ',
    letter: 'К',
    shortDefinition: 'Физическая константа материала, определяющая относительное изменение линейных размеров заготовки при изменении температуры на 1 °C (кельвин).',
    fullDescription: 'Используется для математического приведения результатов цеховых измерений к нормальной метрологической температуре 20.0 °C по формуле ΔL = L₀ · α · (T - 20). Типовые значения: углеродистая сталь — 11.5 ppm/°C, нержавеющая сталь 12Х18Н10Т — 16.5 ppm/°C, алюминий Д16Т — 23.0 ppm/°C, чугун СЧ20 — 10.5 ppm/°C, титан ВТ6 — 8.6 ppm/°C, инвар — ~1.2 ppm/°C. На 10-метровой детали перепад в 5 °C дает искажение более 0.5 мм.',
    keyStandards: ['ISO 1:2016', 'ГОСТ 8.050-73'],
    practicalApplication: 'Вводится оператором «ДС-Инжиниринг» в модуль термокомпенсации PolyWorks при выездных замерах станин, прессов и крупногабаритных сварных рам.',
    relatedTerms: ['thermal-compensation', 'mpe', 'leapfrog'],
    actionLink: {
      text: 'Выездные измерения с термокомпенсацией',
      page: 'services',
      detailId: 'parts-inspection',
    },
  },
  {
    id: 'probe-qualification',
    term: 'Квалификация щупа (SPAT)',
    termEn: 'Probe Qualification / Single Point Articulation Test',
    termRu: 'Аттестация контактного щупа по эталонной сфере',
    category: 'metrology_cmm',
    categoryLabel: 'Метрология и КИМ',
    letter: 'К',
    shortDefinition: 'Процедура точного определения фактического эффективного диаметра рубинового шарика и пространственного вектора вылета щупа мобильной или стационарной КИМ.',
    fullDescription: 'Выполняется ощупыванием аттестованной калибровочной сферы (отклонение формы <0.2 мкм) в 9–15 точках под различными углами наклона последнего шарнира руки. Проверяется погрешность формы сферы (SPAT / Form Error), которая для исправной руки не должна превышать 0.005–0.008 мм. Предотвращает систематические погрешности при смене конфигурации удлинителей и наконечников.',
    keyStandards: ['ISO 10360-12', 'ГОСТ Р ИСО 10360-5'],
    practicalApplication: 'Обязательный шаг перед началом каждой измерительной смены на КИМ Hexagon Absolute Arm и PMT.',
    relatedTerms: ['mpe', 'cmm-arm'],
    actionLink: {
      text: 'Мобильные КИМ Hexagon Absolute Arm',
      page: 'hardware',
      detailId: 'hexagon-absolute-arm-7axis',
    },
  },
  {
    id: 'color-map',
    term: 'Цветовая карта отклонений',
    termEn: '3D Color Deviation Map / Surface Inspection',
    termRu: 'Цветовая карта пространственных отклонений от CAD',
    category: 'reverse_scanning',
    categoryLabel: '3D-сканирование и Реверс',
    letter: 'Ц',
    shortDefinition: 'Наглядная трехмерная градиентная визуализация отклонений фактической поверхности детали (по скану или КИМ) относительно номинальной математической CAD-модели.',
    fullDescription: 'Зеленая зона соответствует попаданию в технологический допуск (например, ±0.05 мм), теплые тона (желтый, красный) показывают избыток материала (плюсовые отклонения, припуск под мехобработку), холодные (голубой, синий) — дефицит материала (недолив, коробление, прогиб). Позволяет мгновенно локализовать зоны брака без рутинного анализа числовых таблиц.',
    keyStandards: ['ISO 1101 (Профиль поверхности)', 'ASME Y14.5'],
    practicalApplication: 'Формируется инженерами «ДС-Инжиниринг» в ПО PolyWorks|Inspector и Geomagic Control X с выводом аннотационных флажков в критических сечениях.',
    relatedTerms: ['point-cloud', 'gdt', 'iso-1101'],
    actionLink: {
      text: 'Контроль геометрии и протоколы FAI',
      page: 'services',
      detailId: 'parts-inspection',
    },
  },
  {
    id: 'g-code',
    term: 'G-код (ISO 6983)',
    termEn: 'RS-274 / Numerical Control Programming',
    termRu: 'Управляющая программа для станков с ЧПУ (G-код)',
    category: 'cnc_postprocessors',
    categoryLabel: 'Станки ЧПУ и Постпроцессоры',
    letter: 'G',
    shortDefinition: 'Стандартизированный машинно-ориентированный язык кодирования геометрических перемещений инструмента и технологических команд станка с ЧПУ.',
    fullDescription: 'G-коды (G00 — ускоренное позиционирование, G01 — линейная интерполяция, G02/G03 — круговая интерполяция, G43 — компенсация длины инструмента) задают пространственную траекторию, а M-коды (M03 — пуск шпинделя, M08 — подача СОЖ) управляют технологической автоматикой. Генерируется постпроцессором из нейтрального CL-data файла CAM-системы.',
    keyStandards: ['ISO 6983-1', 'DIN 66025', 'ГОСТ 20999-83'],
    practicalApplication: 'TopSolid 7 CAM формирует высокооптимизированный G-код для стоек Fanuc, Heidenhain, Sinumerik, Haas и отечественных систем Балт-Систем.',
    relatedTerms: ['postprocessor', 'rtcp', 'kinematic-machine-model'],
    actionLink: {
      text: 'Разработка постпроцессоров ЧПУ',
      page: 'services',
      detailId: 'postprocessors-dev',
    },
  },
  {
    id: 'step-ap242',
    term: 'STEP AP242',
    termEn: 'ISO 10303-242: Managed model-based 3D engineering',
    termRu: 'Протокол бесчертежного обмена 3D CAD/CAM данными с семантикой PMI',
    category: 'cad_cam',
    categoryLabel: 'САПР (CAD/CAM/PDM)',
    letter: 'S',
    shortDefinition: 'Современный нейтральный международный формат данных, объединяющий твердотельную геометрию B-Rep, семантические допуски GD&T, структуру сборок и метаданные PDM.',
    fullDescription: 'В отличие от устаревших версий STEP AP203/AP214, протокол AP242 передает геометрические допуски в машиночитаемом (Semantic) виде. Это дает возможность измерительному программному обеспечению (PolyWorks, PC-DMIS) автоматически импортировать базы, номиналы и зоны допуска прямо из файла детали без ручного ввода оператором.',
    keyStandards: ['ISO 10303-242:2020', 'LOTAR International (Long Term Archiving)'],
    practicalApplication: 'Основной формат обмена данными между САПР TopSolid 7, измерительными КИМ и внешними заказчиками «ДС-Инжиниринг».',
    relatedTerms: ['b-rep', 'pmi-mbd', 'gdt'],
    actionLink: {
      text: 'Внедрение TopSolid 7 CAD/CAM',
      page: 'software',
      detailId: 'topsolid-7',
    },
  },
];

/**
 * Получить список доступных первых букв для алфавитного фильтра
 */
export function getGlossaryAlphabet(): string[] {
  const letters = new Set<string>();
  ENGINEERING_GLOSSARY_TERMS.forEach((item) => {
    letters.add(item.letter.toUpperCase());
  });
  return Array.from(letters).sort((a, b) => a.localeCompare(b, 'ru'));
}

/**
 * Поиск терминов по ключевому запросу и категории
 */
export function searchGlossaryTerms(
  query = '',
  category = 'all',
  letter = ''
): GlossaryTerm[] {
  const q = query.toLowerCase().trim();
  const activeLetter = letter.toUpperCase().trim();

  return ENGINEERING_GLOSSARY_TERMS.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesLetter = !activeLetter || item.letter.toUpperCase() === activeLetter;
    const matchesQuery =
      !q ||
      item.term.toLowerCase().includes(q) ||
      item.termRu.toLowerCase().includes(q) ||
      (item.termEn && item.termEn.toLowerCase().includes(q)) ||
      item.shortDefinition.toLowerCase().includes(q) ||
      item.fullDescription.toLowerCase().includes(q) ||
      item.keyStandards.some((s) => s.toLowerCase().includes(q)) ||
      (item.exampleSymbols && item.exampleSymbols.some((sym) => sym.toLowerCase().includes(q)));

    return matchesCategory && matchesLetter && matchesQuery;
  });
}
