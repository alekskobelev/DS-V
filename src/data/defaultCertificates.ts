import { TrainingCertificate } from '../types.ts';

export const DEFAULT_CERTIFICATES: TrainingCertificate[] = [
  {
    id: 'cert-2026-001',
    certificateNumber: 'СВ-2026/042',
    date: '12.02.2026',
    traineeName: 'Иванов Алексей Михайлович',
    traineePosition: 'Ведущий инженер-метролог',
    customer: 'ПАО «ОДК-Кузнецов»',
    instructor: 'Некрасов Сергей Юрьевич',
    trainingTopic: 'Стационарная КИМ HEXAGON GLOBAL S Chrome и ПО PolyWorks|Inspector™ 2026',
    hoursTotal: 72,
    protocolNumber: 'ПР-АТТ-14/26',
    protocolDate: '11.02.2026',
    validUntil: 'Бессрочно',
    certificateType: 'training',
    templateTheme: 'corporate_gold',
    customPrimaryColor: '#0284c7',
    showStamp: true,
    showSignature: true,
    showQrCode: true,
    leftLogo: 'hexagon',
    rightLogo: 'polyworks',
    headerSubtitle: 'О прохождении специализированного курса обучения и допуска к эксплуатации оборудования',
    trainingProgramText: `<p>Настоящее свидетельство подтверждает, что специалист <strong>Иванов Алексей Михайлович</strong> успешно освоил расширенный теоретический и практический курс:</p>
<ul>
  <li>Кинематика и калибровка поворотно-индексируемых измерительных головок Renishaw PH10M/SP25M;</li>
  <li>Создание автоматизированных траекторий контроля сложной геометрии лопаток ГТД в среде PolyWorks|Inspector™;</li>
  <li>Анализ геометрических допусков GD&T согласно ГОСТ Р 53442-2015 (ISO 1101) и формирование протоколов контроля серии деталей.</li>
</ul>
<p>Специалист допущен к самостоятельной работе на координатно-измерительных машинах портального типа.</p>`,
    footerNote: 'ООО «ДС-Инжиниринг», 443051, г. Самара, ул. Свободы, 198, 8 (846) 954-02-92, info@ds-enginering.ru, http://ds-enginering.ru',
    files: [
      {
        id: 'file-cert-01',
        name: 'Скан_Свидетельства_СВ-2026_042_подписан.pdf',
        category: 'Скан свидетельства (PDF)',
        size: '1.8 MB',
        uploadedAt: '12.02.2026',
        uploadedBy: 'Некрасов С.Ю.',
        fileType: 'pdf'
      },
      {
        id: 'file-cert-02',
        name: 'Протокол_аттестации_ОДК_Кузнецов.pdf',
        category: 'Доп. материалы',
        size: '840 KB',
        uploadedAt: '12.02.2026',
        uploadedBy: 'Инженерный отдел',
        fileType: 'pdf'
      }
    ]
  },
  {
    id: 'cert-2026-002',
    certificateNumber: 'СВ-2026/038',
    date: '28.01.2026',
    traineeName: 'Смирнова Екатерина Дмитриевна',
    traineePosition: 'Инженер-конструктор 1 категории',
    customer: 'АО «Авиаагрегат-Самара»',
    instructor: 'Некрасов Сергей Юрьевич',
    signatoryName: 'С.Ю. Некрасов',
    signatoryPosition: 'Генеральный директор',
    signatoryCompany: 'ООО «ДС-Инжиниринг»',
    trainingTopic: 'Реверс-инжиниринг сложных поверхностей и твердотельное параметрическое моделирование в Geomagic Design X',
    hoursTotal: 40,
    protocolNumber: 'ПР-АТТ-09/26',
    protocolDate: '27.01.2026',
    validUntil: 'Бессрочно',
    certificateType: 'software_cert',
    templateTheme: 'classic_engineering',
    customPrimaryColor: '#0f172a',
    watermarkType: 'shining_freescan',
    watermarkOpacity: 18,
    showStamp: true,
    showSignature: true,
    showQrCode: false,
    leftLogo: 'shining3d',
    rightLogo: 'geomagic',
    headerSubtitle: 'выдано',
    trainingProgramText: `<p>Настоящее свидетельство подтверждает то, что специалист <strong>АО «Авиаагрегат-Самара»</strong>, прошёл теоретический и практический курс обучения по правилам эксплуатации, технологической безопасности и работе с оптической сканирующей системой <strong>Shining 3D FreeScan</strong> с использованием программного обеспечения <strong>Geomagic Design X</strong>, и допущен к работе на данном оборудовании.</p>`,
    footerNote: 'ООО «ДС-Инжиниринг», 443051, г. Самара, ул. Свободы, 198, 8 (846) 954-02-92, info@ds-enginering.ru, http://ds-enginering.ru',
    files: []
  },
  {
    id: 'cert-2025-089',
    date: '19.12.2025',
    certificateNumber: 'СВ-2025/115',
    traineeName: 'Захарова Светлана Николаевна',
    traineePosition: 'Инженер отдела контроля качества',
    customer: 'ООО «АВТОСВЕТ»',
    instructor: 'Некрасов Сергей Юрьевич',
    signatoryName: 'С.Ю. Некрасов',
    signatoryPosition: 'Генеральный директор',
    signatoryCompany: 'ООО «ДС-Инжиниринг»',
    trainingTopic: 'Стационарная КИМ HEXAGON GLOBAL и ПО PolyWorks Metrology Probing++',
    hoursTotal: 72,
    protocolNumber: 'ПР-2025/88-АС',
    protocolDate: '18.12.2025',
    validUntil: 'Бессрочно',
    certificateType: 'training',
    templateTheme: 'classic_engineering',
    customPrimaryColor: '#0f172a',
    watermarkType: 'hexagon_global_cmm',
    watermarkOpacity: 20,
    showStamp: true,
    showSignature: true,
    showQrCode: false,
    leftLogo: 'hexagon',
    rightLogo: 'polyworks',
    headerSubtitle: 'выдано',
    trainingProgramText: `<p>Настоящее свидетельство подтверждает то, что специалист <strong>ООО «АВТОСВЕТ»</strong>, прошёл теоретический и практический курс обучения по правилам эксплуатации, технологической безопасности и работе со стационарной координатно-измерительной машиной <strong>HEXAGON GLOBAL</strong> с использованием программного обеспечения <strong>PolyWorks Metrology Probing++</strong>, и допущен к работе на данном оборудовании.</p>`,
    footerNote: 'ООО «ДС-Инжиниринг», 443051, г. Самара, ул. Свободы, 198, 8 (846) 954-02-92, info@ds-enginering.ru, http://ds-enginering.ru',
    files: []
  }
];

export const CERTIFICATE_TEMPLATES_CATALOG = [
  {
    id: 'classic_engineering',
    name: 'Классический «ДС-Инжиниринг» (как в оригинале)',
    description: 'Официальный бланк с двойной черной прецизионной рамкой, подложкой оборудования по центру и логотипами Hexagon / PolyWorks',
    borderStyle: 'double-solid',
    primaryColor: '#0f172a',
    accentColor: '#334155'
  },
  {
    id: 'corporate_gold',
    name: 'Корпоративный синий (ДС-Инжиниринг)',
    description: 'Фирменный строгий стиль с глубоким темно-синим обрамлением, золотистыми углами и подложкой оборудования',
    borderStyle: 'double-gold',
    primaryColor: '#0369a1',
    accentColor: '#d97706'
  },
  {
    id: 'modern_polyworks',
    name: 'PolyWorks High-Tech Red & Blue',
    description: 'Современный технологичный шаблон для курсов координатного контроля, анализа GD&T и лазерного трекинга',
    borderStyle: 'tech-blue',
    primaryColor: '#1e3a8a',
    accentColor: '#dc2626'
  },
  {
    id: 'tech_scanning',
    name: '3D-Сканирование и САПР TopSolid',
    description: 'Инженерный стиль для курсов пятиосевой ЧПУ обработки, реверс-инжиниринга и аддитивных технологий',
    borderStyle: 'cad-slate',
    primaryColor: '#334155',
    accentColor: '#0284c7'
  }
];

export const PRESET_COURSE_TOPICS = [
  {
    id: 'cmm_global_polyworks',
    title: 'Стационарная КИМ HEXAGON GLOBAL + ПО PolyWorks Metrology Probing++',
    hours: 72,
    topic: 'Стационарная КИМ HEXAGON GLOBAL и ПО PolyWorks Metrology Probing++',
    leftLogo: 'hexagon',
    rightLogo: 'polyworks',
    watermark: 'hexagon_global_cmm',
    defaultText: `<p>Настоящее свидетельство подтверждает то, что специалист <strong>{{CUSTOMER}}</strong>, прошёл теоретический и практический курс обучения по правилам эксплуатации, технологической безопасности и работе со стационарной координатно-измерительной машиной <strong>HEXAGON GLOBAL</strong> с использованием программного обеспечения <strong>PolyWorks Metrology Probing++</strong>, и допущен к работе на данном оборудовании.</p>`
  },
  {
    id: 'arm_absolute_polyworks',
    title: 'Портативная КИМ-рука Hexagon Absolute Arm + ПО PolyWorks|Inspector™',
    hours: 48,
    topic: 'Портативный измерительный манипулятор Hexagon Absolute Arm и ПО PolyWorks|Inspector™',
    leftLogo: 'hexagon',
    rightLogo: 'polyworks',
    watermark: 'hexagon_arm',
    defaultText: `<p>Настоящее свидетельство подтверждает то, что специалист <strong>{{CUSTOMER}}</strong>, прошёл теоретический и практический курс обучения по правилам эксплуатации, технологической безопасности и координатным измерениям на портативном измерительном манипуляторе <strong>Hexagon Absolute Arm</strong> с использованием программного обеспечения <strong>PolyWorks|Inspector™</strong>, и допущен к самостоятельной работе на данном оборудовании.</p>`
  },
  {
    id: 'scan_shining_geomagic',
    title: '3D-сканирование Shining 3D FreeScan + Geomagic Design X',
    hours: 40,
    topic: '3D-сканирование Shining 3D FreeScan и реверс-инжиниринг в Geomagic Design X',
    leftLogo: 'shining3d',
    rightLogo: 'geomagic',
    watermark: 'shining_freescan',
    defaultText: `<p>Настоящее свидетельство подтверждает то, что специалист <strong>{{CUSTOMER}}</strong>, прошёл теоретический и практический курс обучения по правилам эксплуатации, технологической безопасности и работе со сканирующей системой <strong>Shining 3D FreeScan</strong> с использованием программного обеспечения <strong>Geomagic Design X</strong>, и допущен к работе на данном оборудовании.</p>`
  },
  {
    id: 'gdt_polyworks',
    title: 'Контроль геометрических допусков GD&T в PolyWorks|Inspector™',
    hours: 40,
    topic: 'Геометрический контроль и анализ GD&T по ISO 1101 и ГОСТ Р 53442 в ПО PolyWorks|Inspector™',
    leftLogo: 'ds_engineering',
    rightLogo: 'polyworks',
    watermark: 'hexagon_global_cmm',
    defaultText: `<p>Настоящее свидетельство удостоверяет, что специалист <strong>{{CUSTOMER}}</strong> успешно освоил курс углубленного геометрического контроля изделий по CAD-моделям, анализа допусков формы и расположения (GD&T) согласно стандартам ISO 1101 и ГОСТ Р 53442 в программном комплексе <strong>PolyWorks|Inspector™</strong>.</p>`
  },
  {
    id: 'reverse_geomagic',
    title: 'Реверс-инжиниринг и CAD-моделирование в Geomagic Design X',
    hours: 40,
    topic: 'Реверс-инжиниринг полигональных сеток и CAD-моделирование в Geomagic Design X',
    leftLogo: 'ds_engineering',
    rightLogo: 'geomagic',
    watermark: 'shining_freescan',
    defaultText: `<p>Настоящее свидетельство удостоверяет, что специалист <strong>{{CUSTOMER}}</strong> успешно завершил курс параметрического реверс-инжиниринга полигональных сеток, извлечения аналитической геометрии и построения твердотельных CAD-моделей в среде <strong>Geomagic Design X</strong>.</p>`
  },
  {
    id: 'cam_topsolid_5axis',
    title: '5-осевая ЧПУ-обработка и CAM-программирование в TopSolid 7',
    hours: 72,
    topic: '5-осевая фрезерная обработка на станках с ЧПУ и CAM-программирование в TopSolid 7',
    leftLogo: 'topsolid',
    rightLogo: 'topsolid',
    watermark: 'topsolid_cnc',
    defaultText: `<p>Настоящее свидетельство подтверждает, что специалист <strong>{{CUSTOMER}}</strong> прошёл обучение по разработке управляющих программ для 5-осевых фрезерных станков с ЧПУ, симуляции кинематики станка и верификации траекторий в CAD/CAM системе <strong>TopSolid 7</strong>.</p>`
  },
  {
    id: 'tracker_leica_at960',
    title: 'Прецизионные измерения лазерным трекером Leica Absolute Tracker',
    hours: 48,
    topic: 'Координатные измерения крупногабаритных объектов лазерным трекером Leica Absolute Tracker AT960',
    leftLogo: 'leica',
    rightLogo: 'polyworks',
    watermark: 'leica_tracker',
    defaultText: `<p>Настоящее свидетельство подтверждает, что специалист <strong>{{CUSTOMER}}</strong> прошёл практический курс прецизионных пространственных измерений крупногабаритных конструкций с применением лазерной трекерной системы <strong>Leica Absolute Tracker AT960</strong> и ПО <strong>PolyWorks|Inspector™</strong>.</p>`
  },
  {
    id: 'pmt_arm_polyworks',
    title: 'Портативные КИМ-руки PMT Arm + ПО PolyWorks|Inspector™',
    hours: 40,
    topic: 'Эксплуатация шарнирных измерительных манипуляторов PMT Arm и ПО PolyWorks|Inspector™',
    leftLogo: 'pmt',
    rightLogo: 'polyworks',
    watermark: 'hexagon_arm',
    defaultText: `<p>Настоящее свидетельство подтверждает то, что специалист <strong>{{CUSTOMER}}</strong> прошёл обучение по правилам эксплуатации, калибровке щупов и координатным контактным измерениям на манипуляторе <strong>PMT Arm</strong> в программной среде <strong>PolyWorks|Inspector™</strong>.</p>`
  },
  {
    id: 'optical_control_x',
    title: 'Автоматизированный контроль геометрии в Geomagic Control X',
    hours: 40,
    topic: 'Автоматизированный оптический контроль качества и построение карт отклонений в Geomagic Control X',
    leftLogo: 'shining3d',
    rightLogo: 'geomagic',
    watermark: 'shining_freescan',
    defaultText: `<p>Настоящее свидетельство удостоверяет, что специалист <strong>{{CUSTOMER}}</strong> освоил методику автоматизированного метрологического контроля деталей по 3D-сканам, анализ цветовых карт отклонений и генерацию протоколов контроля в среде <strong>Geomagic Control X</strong>.</p>`
  },
  {
    id: 'mill_turn_topsolid',
    title: 'Многоканальная токарно-фрезерная ЧПУ-обработка в TopSolid 7',
    hours: 60,
    topic: 'Многоканальная токарно-фрезерная обработка и кинематическая симуляция станков в TopSolid 7',
    leftLogo: 'topsolid',
    rightLogo: 'topsolid',
    watermark: 'topsolid_cnc',
    defaultText: `<p>Настоящее свидетельство подтверждает, что специалист <strong>{{CUSTOMER}}</strong> прошёл обучение по программированию сложных токарно-фрезерных обрабатывающих центров с противошпинделем и несколькими револьверными головками в CAM-системе <strong>TopSolid 7</strong>.</p>`
  },
  {
    id: 'pcdmis_cmm',
    title: 'Программирование КИМ в среде PC-DMIS (Hexagon)',
    hours: 72,
    topic: 'Автоматизированное программирование координатно-измерительных машин в ПО PC-DMIS CAD++',
    leftLogo: 'hexagon',
    rightLogo: 'ds_engineering',
    watermark: 'hexagon_global_cmm',
    defaultText: `<p>Настоящее свидетельство подтверждает то, что специалист <strong>{{CUSTOMER}}</strong> прошёл обучение по созданию автоматизированных измерительных программ, юстировке контактных и триггерных датчиков и работе в измерительном пакете <strong>PC-DMIS CAD++</strong>.</p>`
  },
  {
    id: 'metrology_arshin',
    title: 'Метрологическое обеспечение и поверка КИМ (ФГИС «АРШИН»)',
    hours: 32,
    topic: 'Метрологическое обеспечение координатных измерений, калибровка КИМ и интеграция с ФГИС «АРШИН»',
    leftLogo: 'ds_engineering',
    rightLogo: 'arshin',
    watermark: 'hexagon_global_cmm',
    defaultText: `<p>Настоящее свидетельство удостоверяет, что специалист <strong>{{CUSTOMER}}</strong> прошёл теоретический и практический курс по поверке и калибровке координатно-измерительных машин по ГОСТ Р ИСО 10360 и передаче сведений в Федеральный информационный фонд <strong>ФГИС «АРШИН»</strong>.</p>`
  },
  {
    id: 'safety_maintenance',
    title: 'Технологическая безопасность и регламент обслуживания КИМ',
    hours: 16,
    topic: 'Технологическая безопасность, регламентное обслуживание и правила эксплуатации КИМ',
    leftLogo: 'ds_engineering',
    rightLogo: 'none',
    watermark: 'hexagon_global_cmm',
    defaultText: `<p>Настоящее свидетельство подтверждает, что специалист <strong>{{CUSTOMER}}</strong> успешно сдал зачет по технологической безопасности, регламентному техническому обслуживанию координатно-измерительных машин и правилам безаварийной эксплуатации оборудования.</p>`
  },
  {
    id: 'custom_user_course',
    title: '✏️ Пользовательский курс (произвольная тема обучения)',
    hours: 40,
    topic: '',
    leftLogo: 'ds_engineering',
    rightLogo: 'polyworks',
    watermark: 'hexagon_global_cmm',
    defaultText: `<p>Настоящее свидетельство подтверждает то, что специалист <strong>{{CUSTOMER}}</strong> успешно прошёл обучение по индивидуальной инженерно-технической программе, освоил практические навыки работы и допущен к самостоятельной эксплуатации оборудования.</p>`
  }
];
