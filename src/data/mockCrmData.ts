import { ProjectContract, CommercialProposal, SupportTicketItem, LicenseItem, CurrencyCode, ProjectDocument } from '../types.ts';
export interface DealItemSpec {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit?: 'шт.' | 'компл.' | 'усл.' | 'час.' | 'лиц.' | string;
  price: number; // Цена за единицу без НДС
  paymentStatus: 'pending' | 'prepaid_50' | 'paid_100';
}

export interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  author: string;
  type: 'system' | 'status_change' | 'comment' | 'document' | 'return_to_work';
  comment?: string;
}

export interface ClientEquipment {
  model: string;
  serialNumber: string;
  warrantyUntil: string;
  verificationDate: string; // Метрологическая поверка
  daysUntilVerification?: number;
}

export interface UtmTags {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
}

export type { ProjectDocument };

export interface ExtendedDeal {
  id: string;
  title?: string;
  customerName: string;
  customerPost?: string;
  companyName: string;
  company?: string;
  companyId?: string;
  contactId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  inn?: string;
  kpp?: string;
  address?: string;
  ceoName?: string;
  ceoPost?: string;
  phone: string;
  email: string;
  funnel: 'services' | 'equipment' | 'support';
  stage: string;
  serviceType: string;
  details: string;
  estimatedPrice: number;
  amount?: number;
  proposalSentDate?: string;
  currency?: CurrencyCode;
  vatRate?: number; // Ставка НДС (по умолчанию 22%, 0% для экспорта / соседних стран)
  vatMode?: 'standard' | 'export_zero' | 'no_vat' | 'custom';
  customerCountry?: string; // Страна заказчика (например, Россия, Казахстан, Беларусь)
  cadFormat?: string;
  createdAt: string;
  updatedAt: string;
  lossReason?: string;
  returnReason?: string;
  clientEquipment?: ClientEquipment;
  utm?: UtmTags;
  items?: DealItemSpec[];
  timeline: TimelineEntry[];
  documents: ProjectDocument[];
  createdByManager?: string;
  responsibleManager?: string;
}

export const INITIAL_CRM_DEALS: ExtendedDeal[] = [
  {
    id: 'СДЕЛКА-2026-001',
    customerName: 'Королев Виктор Михайлович (Главный инженер)',
    companyName: 'ПАО «ОДК-Кузнецов»',
    inn: '6312004455',
    phone: '+7 (846) 270-80-00',
    email: 'v.korolev@odk-kuznetsov.ru',
    funnel: 'equipment',
    stage: 'closed_won',
    serviceType: 'Генеральный контракт: Прецизионная мостовая КИМ Mitutoyo CRYSTA-Apex V9168 + 10 лицензий TopSolid 7 Cam',
    details: 'Стратегический государственный контракт на комплексное переоснащение опытно-экспериментального цеха газотурбинных двигателей. Поставка тяжелой мостовой КИМ Mitutoyo, лазерного трекера Leica AT960, внедрение САПР TopSolid 7 CAM 5-Axis с разработкой кинематических моделей станков.',
    estimatedPrice: 28500000,
    cadFormat: 'TopSolid 7 / STEP / PolyWorks',
    createdAt: '2026-07-10T09:00:00Z',
    updatedAt: '2026-08-25T17:45:00Z',
    createdByManager: 'Некрасов С.Ю.',
    responsibleManager: 'Некрасов С.Ю.',
    clientEquipment: {
      model: 'Mitutoyo CRYSTA-Apex V9168 + Leica AT960',
      serialNumber: 'MIT-CRX-2026-001-KUZ',
      warrantyUntil: '2029-08-25',
      verificationDate: '2027-08-25',
      daysUntilVerification: 356,
    },
    utm: {
      source: 'direct',
      medium: 'director_network',
      campaign: 'strategic_gk_odk'
    },
    items: [
      { id: 'i1', name: 'Прецизионная мостовая КИМ Mitutoyo CRYSTA-Apex V9168', category: 'Оборудование', quantity: 1, price: 19500000, paymentStatus: 'paid_100' },
      { id: 'i2', name: 'Пакет сетевых лицензий TopSolid 7 CAM 5-Axis Pro (10 р.м.)', category: 'ПО', quantity: 1, price: 6200000, paymentStatus: 'paid_100' },
      { id: 'i3', name: 'Комплекс ПНР, юстировка лазерным интерферометром и обучение', category: 'Услуги', quantity: 1, price: 2800000, paymentStatus: 'paid_100' }
    ],
    timeline: [
      { id: 't1', date: '10.07.2026 09:00', title: 'Генеральные переговоры на уровне руководства ОДК', author: 'Некрасов С.Ю. (Ген. директор)', type: 'system' },
      { id: 't2', date: '25.07.2026 14:00', title: 'Утверждение спецификации и протокола испытаний', author: 'Некрасов С.Ю.', type: 'comment', comment: 'Согласована поставка КИМ V9168 с термокомпенсацией 16–26°C.' },
      { id: 't3', date: '15.08.2026 11:30', title: 'Подписан государственный контракт ГЕН-2026/001', author: 'Юр. служба', type: 'status_change' },
      { id: 't4', date: '25.08.2026 17:45', title: 'Сделка закрыта / Поставка и внедрение успешно завершены', author: 'Некрасов С.Ю.', type: 'status_change', comment: 'Акт сдачи-приемки подписан, оплата 100% поступила на р/с.' }
    ],
    documents: [
      { id: 'd1', name: 'Генеральный_Контракт_ОДК-Кузнецов_ГЕН-001.pdf', type: 'contract', size: '6.4 MB', date: '15.08.2026' },
      { id: 'd2', name: 'Акт_сдачи_приемки_КИМ_Mitutoyo_ОДК.pdf', type: 'spec', size: '1.9 MB', date: '25.08.2026' }
    ]
  },
  {
    id: 'СДЕЛКА-2026-015',
    customerName: 'Белозеров Андрей Игоревич (Директор по производству)',
    companyName: 'АО «Тяжмаш» (г. Сызрань)',
    inn: '6325001234',
    phone: '+7 (8464) 98-44-10',
    email: 'belozerov.ai@tyazhmash.com',
    funnel: 'equipment',
    stage: 'contract',
    serviceType: 'Портальная КИМ PMT крупного диапазона + Метрологический комплекс PolyWorks|Inspector Enterprise',
    details: 'Модернизация контроля крупногабаритных гидротурбинных деталей и зубчатых венцов диаметром до 4500 мм. Согласование условий поставки и договора расширенной гарантии 3 года.',
    estimatedPrice: 18200000,
    cadFormat: 'STEP / IGES / PolyWorks',
    createdAt: '2026-08-02T11:00:00Z',
    updatedAt: '2026-08-31T15:20:00Z',
    createdByManager: 'Некрасов С.Ю.',
    responsibleManager: 'Некрасов С.Ю.',
    utm: {
      source: 'direct',
      medium: 'exhibition',
      campaign: 'metalloborabotka_direct'
    },
    items: [
      { id: 'i1', name: 'Портальная КИМ PMT Bridge 203015 с оптической головкой', category: 'Оборудование', quantity: 1, price: 14900000, paymentStatus: 'prepaid_50' },
      { id: 'i2', name: 'Пакет PolyWorks|Inspector Enterprise с выездным обучением', category: 'ПО', quantity: 1, price: 2100000, paymentStatus: 'prepaid_50' },
      { id: 'i3', name: 'Виброизолирующий фундамент и шефмонтаж', category: 'Услуги', quantity: 1, price: 1200000, paymentStatus: 'pending' }
    ],
    timeline: [
      { id: 't1', date: '02.08.2026 11:00', title: 'Прямой запрос руководства АО Тяжмаш', author: 'Некрасов С.Ю.', type: 'system' },
      { id: 't2', date: '18.08.2026 16:00', title: 'Технико-коммерческие переговоры в Сызрани', author: 'Некрасов С.Ю.', type: 'comment', comment: 'Проведен совместный аудит фундаментной плиты цеха.' },
      { id: 't3', date: '31.08.2026 15:20', title: 'Проект генерального договора направлен на согласование', author: 'Юр. служба', type: 'status_change' }
    ],
    documents: [
      { id: 'd1', name: 'Проект_Договора_Тяжмаш_ДС-2026-118.pdf', type: 'contract', size: '4.1 MB', date: '31.08.2026' }
    ]
  },
  {
    id: 'СДЕЛКА-2026-081',
    customerName: 'Семенов Андрей Викторович',
    companyName: 'ПАО «Авиаагрегат»',
    inn: '6312002341',
    phone: '+7 (846) 207-15-44',
    email: 'semenov.av@aviaagregat.ru',
    funnel: 'equipment',
    stage: 'audit',
    serviceType: 'Поставка стационарной КИМ Mitutoyo CRYSTA-Apex S + ПО PolyWorks|Inspector',
    details: 'Требуется модернизация измерительной лаборатории цеха прецизионной механической обработки. Контроль посадочных шеек валов с допуском до 0.002 мм в метрологическом пакете PolyWorks|Inspector.',
    estimatedPrice: 14850000,
    cadFormat: 'STEP / IGES / PolyWorks',
    createdAt: '2026-08-18T10:15:00Z',
    updatedAt: '2026-08-29T14:30:00Z',
    createdByManager: 'Скобелев А.С.',
    responsibleManager: 'Скобелев А.С.',
    clientEquipment: {
      model: 'Mitutoyo CRYSTA-Apex S 9106',
      serialNumber: 'MIT-APX-88412',
      warrantyUntil: '2027-08-30',
      verificationDate: '2027-08-30'
    },
    utm: {
      source: 'yandex_direct',
      medium: 'cpc',
      campaign: 'prom_metrology_crysta',
      term: 'купить ким mitutoyo'
    },
    items: [
      { id: 'i1', name: 'Стационарная КИМ Mitutoyo CRYSTA-Apex S 9106', category: 'Оборудование', quantity: 1, price: 12200000, paymentStatus: 'pending' },
      { id: 'i2', name: 'Лицензия PolyWorks|Inspector Pro (Метрология и GD&T)', category: 'ПО', quantity: 1, price: 1000000, paymentStatus: 'pending' },
      { id: 'i3', name: 'Набор измерительных щупов Renishaw SP25M', category: 'Оснастка', quantity: 1, price: 950000, paymentStatus: 'pending' },
      { id: 'i4', name: 'Пусконаладочные работы и инструктаж метрологов (Самара)', category: 'Услуги', quantity: 1, price: 700000, paymentStatus: 'pending' }
    ],
    timeline: [
      { id: 't1', date: '18.08.2026 10:15', title: 'Входящая заявка с сайта', author: 'Система', type: 'system' },
      { id: 't2', date: '21.08.2026 12:00', title: 'Квалификация: подтвержден бюджет цеха №4', author: 'Менеджер (Ковалев А.)', type: 'comment', comment: 'Согласована встреча с главным метрологом на 28.08.' },
      { id: 't3', date: '29.08.2026 14:30', title: 'Перевод на этап «Технический аудит и Бенчмаркинг»', author: 'Инженер (Метрологический зал Тольятти)', type: 'status_change', comment: 'Получены контрольные чертежи детали «Вал-шестерня». Выполняется тестовый промер в PolyWorks.' }
    ],
    documents: [
      { id: 'd1', name: 'ТКП_Авиаагрегат_Mitutoyo_v2.pdf', type: 'proposal', size: '2.4 MB', date: '25.08.2026' },
      { id: 'd2', name: 'Соглашение_NDA_Авиаагрегат_подписано.pdf', type: 'nda', size: '820 KB', date: '22.08.2026' },
      { id: 'd3', name: 'Акт_первичного_аудита_чертежей.pdf', type: 'spec', size: '1.1 MB', date: '29.08.2026' }
    ]
  },
  {
    id: 'СДЕЛКА-2026-074',
    customerName: 'Морозов Дмитрий Сергеевич',
    companyName: 'ООО «Тольяттинский Завод Автоагрегатов»',
    inn: '6321458902',
    phone: '+7 (8482) 75-90-12',
    email: 'morozov@tza-samara.ru',
    funnel: 'equipment',
    stage: 'contract',
    serviceType: 'Лазерный 3D-сканер Shining3D FreeScan Combo + ПО PolyWorks|Inspector & Modeler',
    details: 'Оснащение инструментального участка мобильным лазерным сканером для 3D-контроля штамповой оснастки, анализа отклонений GD&T и реверс-инжиниринга пресс-форм в метрологическом ПО PolyWorks.',
    estimatedPrice: 4850000,
    cadFormat: 'PolyWorks / STEP / STL',
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-08-30T16:20:00Z',
    createdByManager: 'Ярыш А.В.',
    responsibleManager: 'Ярыш А.В.',
    clientEquipment: {
      model: 'FreeScan Combo Hybrid',
      serialNumber: 'SHN-CMB-2026-901',
      warrantyUntil: '2028-08-01',
      verificationDate: '2027-08-01',
      daysUntilVerification: 334
    },
    utm: {
      source: 'organic',
      medium: 'search',
      campaign: 'freescan_combo_catalog'
    },
    items: [
      { id: 'i1', name: 'Лазерный 3D-сканер FreeScan Combo', category: 'Оборудование', quantity: 1, price: 3450000, paymentStatus: 'prepaid_50' },
      { id: 'i2', name: 'Лицензия PolyWorks|Inspector & Modeler Pro', category: 'ПО', quantity: 1, price: 1100000, paymentStatus: 'prepaid_50' },
      { id: 'i3', name: 'Курс технического инструктажа инженеров (20 ак. часов)', category: 'Обучение', quantity: 1, price: 300000, paymentStatus: 'pending' }
    ],
    timeline: [
      { id: 't1', date: '05.08.2026 09:00', title: 'Регистрация запроса на выездное демо', author: 'Система', type: 'system' },
      { id: 't2', date: '12.08.2026 14:00', title: 'Успешная выездная демонстрация в Тольятти', author: 'Инженер (Самара)', type: 'comment', comment: 'Отсканирована пресс-форма 1200х800 мм. Точность в PolyWorks удовлетворила гл. технолога.' },
      { id: 't3', date: '22.08.2026 11:30', title: 'Победа в коммерческом тендере', author: 'Менеджер', type: 'status_change' },
      { id: 't4', date: '30.08.2026 16:20', title: 'Договор подписан, выставлен счет на аванс 50%', author: 'Бухгалтерия', type: 'status_change', comment: 'Платеж ожидается до 05.09.2026' }
    ],
    documents: [
      { id: 'd1', name: 'Договор_Поставки_ТЗА_DS-2026-44.pdf', type: 'contract', size: '3.8 MB', date: '29.08.2026' },
      { id: 'd2', name: 'Спецификация_FreeScan_Combo.pdf', type: 'spec', size: '940 KB', date: '28.08.2026' }
    ]
  },
  {
    id: 'СДЕЛКА-2026-092',
    customerName: 'Калинин Игорь Олегович',
    companyName: 'АО «Салют-Энерго»',
    inn: '7701982345',
    phone: '+7 (495) 640-11-22',
    email: 'kalinin@salut-energo.ru',
    funnel: 'services',
    stage: 'nda',
    serviceType: 'Реверс-инжиниринг лопаток газотурбинного двигателя и 3D-контроль в Geomagic Design X',
    details: 'Оптическое сканирование и замеры мобильной КИМ 8 ступеней лопаточного венца с построением точной твердотельной CAD-модели (NURBS-поверхности, точность отклонения < 0.015 мм) в Geomagic Design X.',
    estimatedPrice: 820000,
    cadFormat: 'Parasolid (.x_t) / STEP',
    createdAt: '2026-08-25T11:40:00Z',
    updatedAt: '2026-08-31T09:15:00Z',
    createdByManager: 'Ярыш И.В.',
    responsibleManager: 'Ярыш И.В.',
    utm: {
      source: 'vk.ru/ds_engineering',
      medium: 'social',
      campaign: 'reverse_engineering_cases'
    },
    items: [
      { id: 'i1', name: 'Метрологическое 3D-сканирование и обмер лопаток (8 шт)', category: 'Услуги', quantity: 1, price: 320000, paymentStatus: 'pending' },
      { id: 'i2', name: 'Построение твердотельной CAD-модели (STEP/Parasolid) в САПР Geomagic', category: 'Услуги', quantity: 1, price: 500000, paymentStatus: 'pending' }
    ],
    timeline: [
      { id: 't1', date: '25.08.2026 11:40', title: 'Расчет трудоемкости в инженерном калькуляторе', author: 'Система', type: 'system' },
      { id: 't2', date: '27.08.2026 15:00', title: 'Оценка ведущего инженера по реверсу', author: 'Инженер (Дьяконов М.)', type: 'comment', comment: 'Срок выполнения — 10 рабочих дней после получения образцов.' },
      { id: 't3', date: '31.08.2026 09:15', title: 'Отправлен шаблон двустороннего соглашения о конфиденциальности (NDA)', author: 'Юр. отдел', type: 'status_change' }
    ],
    documents: [
      { id: 'd1', name: 'Проект_NDA_Салют-Энерго.docx', type: 'nda', size: '210 KB', date: '31.08.2026' },
      { id: 'd2', name: 'Методика_сканирования_профиля_лопаток.pdf', type: 'spec', size: '1.4 MB', date: '27.08.2026' }
    ]
  },
  {
    id: 'СДЕЛКА-2026-065',
    customerName: 'Егоров Валентин Николаевич',
    companyName: 'ОАО «Кузнецов-Турбо»',
    inn: '6312445123',
    phone: '+7 (846) 992-33-10',
    email: 'egorov@kuznetsov-motors.ru',
    funnel: 'support',
    stage: 'maintenance',
    serviceType: 'ТО КИМ и метрологическая калибровка измерительной руки Hexagon Absolute Arm',
    details: 'Требуется ТО КИМ: калибровка лазерного сканера AS1/RS6, юстировка угловых энкодеров и выписка протокола поверки с внесением в ФГИС «АРШИН».',
    estimatedPrice: 380000,
    createdAt: '2026-08-10T08:30:00Z',
    updatedAt: '2026-08-30T10:00:00Z',
    createdByManager: 'Морозов В.Г.',
    responsibleManager: 'Морозов В.Г.',
    clientEquipment: {
      model: 'Hexagon Absolute Arm 8520 + AS1',
      serialNumber: 'HEX-8520-SAM-044',
      warrantyUntil: '2027-04-15',
      verificationDate: '2026-09-28',
      daysUntilVerification: 27,
    },
    utm: {
      source: 'direct',
      medium: 'direct',
      campaign: 'lead_form'
    },
    items: [
      { id: 'i1', name: 'ТО КИМ: регламентное обслуживание измерительной руки Hexagon ARM', category: 'Сервис', quantity: 1, price: 180000, paymentStatus: 'paid_100' },
      { id: 'i2', name: 'Метрологическая поверка с внесением в ФГИС «АРШИН»', category: 'Метрология', quantity: 1, price: 200000, paymentStatus: 'paid_100' }
    ],
    timeline: [
      { id: 't1', date: '10.08.2026 08:30', title: 'Регламентное ТО КИМ', author: 'Система', type: 'system' },
      { id: 't2', date: '15.08.2026 14:20', title: 'Согласован выезд поверителя в метрологический зал', author: 'Сервис-инженер', type: 'comment' },
      { id: 't3', date: '30.08.2026 10:00', title: 'Оборудование доставлено в корп. 3.2 (Жигулевская долина)', author: 'Метрологический зал Тольятти', type: 'status_change' }
    ],
    documents: [
      { id: 'd1', name: 'Предыдущее_Свидетельство_Поверки_2025.pdf', type: 'certificate', size: '1.8 MB', date: '10.08.2026' },
      { id: 'd2', name: 'Счет_Оферта_на_ТО_и_Поверку.pdf', type: 'proposal', size: '650 KB', date: '12.08.2026' }
    ]
  },
  {
    id: 'СДЕЛКА-2026-059',
    customerName: 'Белов Артем Станиславович',
    companyName: 'ООО «ПромДетальСервис»',
    inn: '5001994411',
    phone: '+7 (495) 880-99-00',
    email: 'belov@promdetal.ru',
    funnel: 'services',
    stage: 'implementation',
    serviceType: 'Разработка 5-осевого постпроцессора для станка DMG MORI DMU 50 в САПР TopSolid 7 CAM',
    details: 'Написание и верификация кинематического постпроцессора для TopSolid 7 CAM (стойка Heidenhain TNC 640) с симуляцией съема материала и контролем столкновений шпинделя.',
    estimatedPrice: 450000,
    cadFormat: 'TopSolid 7 Cam / ISO G-code',
    createdAt: '2026-08-01T12:00:00Z',
    updatedAt: '2026-08-28T17:00:00Z',
    createdByManager: 'Скобелев А.С.',
    responsibleManager: 'Скобелев А.С.',
    utm: {
      source: 'direct',
      medium: 'none',
      campaign: 'postprocessors_portal'
    },
    items: [
      { id: 'i1', name: 'Разработка постпроцессора DMG DMU 50 (Heidenhain 640)', category: 'Услуги', quantity: 1, price: 350000, paymentStatus: 'prepaid_50' },
      { id: 'i2', name: 'Кинематическая 3D-модель станка с таблицей инструмента в TopSolid 7', category: 'Услуги', quantity: 1, price: 100000, paymentStatus: 'prepaid_50' }
    ],
    timeline: [
      { id: 't1', date: '01.08.2026 12:00', title: 'Получена кинематическая схема станка и примеры УП', author: 'Система', type: 'system' },
      { id: 't2', date: '08.08.2026 16:30', title: 'Подписан договор и получен аванс 50%', author: 'Менеджер', type: 'status_change' },
      { id: 't3', date: '28.08.2026 17:00', title: 'Постпроцессор написан, проводится виртуальная верификация в симуляторе TopSolid', author: 'Ведущий CAM-инженер', type: 'comment', comment: 'Тестовая обработка контрольной детали назначена на четверг.' }
    ],
    documents: [
      { id: 'd1', name: 'Кинематический_паспорт_DMU50.pdf', type: 'spec', size: '5.2 MB', date: '01.08.2026' },
      { id: 'd2', name: 'Техническое_Задание_Постпроцессор_DMU50.pdf', type: 'spec', size: '1.2 MB', date: '04.08.2026' }
    ]
  },
  {
    id: 'СДЕЛКА-2026-104',
    customerName: 'Гордеев Алексей Павлович (Главный метролог)',
    companyName: 'ООО «Самара-АвиаТех»',
    inn: '6316223344',
    phone: '+7 (846) 310-44-55',
    email: 'gordeev@samara-aviatech.ru',
    funnel: 'equipment',
    stage: 'lead',
    serviceType: 'Портативная измерительная рука PMT Alpha Arm 7-Axis + ПО PolyWorks|Inspector',
    details: 'Срочный запрос на мобильный контроль деталей авиационного крепежа и кронштейнов в цехе мехобработки. Требуется портативная КИМ высокой точности с выездной демонстрацией.',
    estimatedPrice: 3850000,
    cadFormat: 'STEP / IGES',
    createdAt: '2026-09-02T09:30:00Z',
    updatedAt: '2026-09-02T15:00:00Z',
    createdByManager: 'Скобелев А.С.',
    responsibleManager: 'Скобелев А.С.',
    utm: {
      source: 'yandex_direct',
      medium: 'cpc',
      campaign: 'pmt_portable_arm'
    },
    items: [
      { id: 'i1', name: 'Портативная КИМ-рука PMT Alpha Arm 7-Axis (2.5 м)', category: 'Оборудование', quantity: 1, price: 2950000, paymentStatus: 'pending' },
      { id: 'i2', name: 'Базовая лицензия PolyWorks|Inspector Standard', category: 'ПО', quantity: 1, price: 900000, paymentStatus: 'pending' }
    ],
    timeline: [
      { id: 't1', date: '02.09.2026 09:30', title: 'Входящая заявка через онлайн-инженер', author: 'Система', type: 'system' },
      { id: 't2', date: '02.09.2026 15:00', title: 'Первичный звонок: подтверждена потребность в демо', author: 'Скобелев А.С.', type: 'comment', comment: 'Выезд на предприятие запланирован на пятницу.' }
    ],
    documents: []
  },
  {
    id: 'СДЕЛКА-2025-012',
    customerName: 'Сорокин Валерий Дмитриевич (Технический директор)',
    companyName: 'АО «ОДК-Климов» (г. Санкт-Петербург)',
    inn: '7814012399',
    phone: '+7 (812) 450-77-88',
    email: 'sorokin.vd@klimov.ru',
    funnel: 'equipment',
    stage: 'tkp',
    serviceType: 'Комплексная программа переоснащения цехового контроля: Мостовые КИМ + 3D-сканеры',
    details: 'Масштабная стратегическая программа модернизации метрологической инфраструктуры двигателестроительного производства. Разработка проектного решения, поставка КИМ Mitutoyo и системы лазерного контроля лопаток.',
    estimatedPrice: 34500000,
    cadFormat: 'TopSolid 7 / STEP / PolyWorks',
    createdAt: '2025-04-15T09:00:00Z',
    updatedAt: '2026-08-20T11:00:00Z',
    createdByManager: 'Некрасов С.Ю.',
    responsibleManager: 'Некрасов С.Ю.',
    utm: {
      source: 'direct',
      medium: 'partner',
      campaign: 'strategic_gk_klimov'
    },
    items: [
      { id: 'i1', name: 'Прецизионная мостовая КИМ Mitutoyo CRYSTA-Apex V122010', category: 'Оборудование', quantity: 1, price: 24500000, paymentStatus: 'pending' },
      { id: 'i2', name: 'Лазерный оптический сканер для контроля пера лопаток', category: 'Оборудование', quantity: 1, price: 6800000, paymentStatus: 'pending' },
      { id: 'i3', name: 'Корпоративный пакет PolyWorks Enterprise (5 лицензий)', category: 'ПО', quantity: 1, price: 3200000, paymentStatus: 'pending' }
    ],
    timeline: [
      { id: 't1', date: '15.04.2025 09:00', title: 'Инициация стратегической программы перевооружения', author: 'Некрасов С.Ю.', type: 'system' },
      { id: 't2', date: '10.11.2025 14:00', title: 'Согласование предварительного технического задания', author: 'Некрасов С.Ю.', type: 'comment' },
      { id: 't3', date: '20.08.2026 11:00', title: 'Подготовлено обновленное технико-коммерческое предложение', author: 'Скобелев А.С.', type: 'status_change', comment: 'ТКП передано на согласование тендерному комитету ОДК.' }
    ],
    documents: [
      { id: 'd1', name: 'ТКП_ОДК-Климов_Модернизация_КИМ_2026.pdf', type: 'proposal', size: '7.8 MB', date: '20.08.2026' }
    ]
  }
];

export const LOSS_REASONS = [
  'Выбрали китайский аналог / более дешевое решение',
  'Перенос бюджета на следующий финансовый год',
  'Не прошли по точности / допуску на тех. аудите',
  'Отмена или несостоявшийся тендер (44-ФЗ / 223-ФЗ)',
  'Заморозка проекта со стороны руководства заказчика',
  'Сроки поставки превышают требования проекта',
  'Другая причина'
];

export const RETURN_REASONS = [
  'Возобновление финансирования / разблокировка бюджета заказчиком',
  'Повторный запрос после доработки технического задания',
  'Успешная апелляция / перезапуск тендерной процедуры',
  'Решение главного инженера о возобновлении проекта'
];


export type CrmDeal = ExtendedDeal;
export type CommercialContract = ProjectContract;
export type { CommercialProposal, ProjectContract };

export const INITIAL_PROPOSALS: CommercialProposal[] = [
  {
    id: 'cp_0',
    outgoingNumber: 'КП-2026/08/10-01',
    date: '10.08.2026',
    toCompany: 'ПАО «ОДК-Кузнецов»',
    content: 'Генеральная поставка прецизионной мостовой КИМ Mitutoyo CRYSTA-Apex V9168 и 10 лицензий TopSolid 7 CAM Pro',
    preparedBy: 'Некрасов С.Ю.',
    note: 'ТКП утверждено Генеральным директором. Контракт ГЕН-2026/001 подписан.',
    internalNotes: 'Стратегический контракт выполнен, оборудование сдано заказчику',
    contactPerson: 'Королев Виктор Михайлович (Главный инженер)',
    contactPhone: '+7 (846) 270-80-00',
    dealId: 'СДЕЛКА-2026-001',
    dealTitle: 'Генеральный контракт: КИМ Mitutoyo CRYSTA-Apex V9168 + TopSolid 7',
    dealStage: 'closed_won',
    dealFunnel: 'equipment',
    amount: 28500000,
    isAlternative: false,
    versions: [
      {
        id: 'ver_0_1',
        version: 1,
        name: 'ТКП_ОДК-Кузнецов_Mitutoyo_TopSolid_v1.pdf',
        size: '3.2 MB',
        uploadedAt: '10.08.2026',
        uploadedBy: 'Некрасов С.Ю.'
      }
    ]
  },
  {
    id: 'cp_1',
    outgoingNumber: 'КП-2026/08/25-01',
    date: '25.08.2026',
    toCompany: 'ПАО «Авиаагрегат»',
    content: 'Поставка стационарной КИМ Mitutoyo CRYSTA-Apex S 9106 + ПО PolyWorks|Inspector Pro',
    preparedBy: 'Скобелев А.С.',
    note: 'ТКП_Авиаагрегат_Mitutoyo_v2.pdf отправлено гл. метрологу',
    internalNotes: 'Ожидаем результатов тестового промера детали «Вал-шестерня»',
    contactPerson: 'Семенов Андрей Викторович',
    contactPhone: '+7 (846) 207-15-44',
    dealId: 'СДЕЛКА-2026-081',
    dealTitle: 'Поставка стационарной КИМ Mitutoyo CRYSTA-Apex S',
    dealStage: 'audit',
    dealFunnel: 'equipment',
    amount: 14850000,
    isAlternative: false,
    versions: [
      {
        id: 'ver_1_1',
        version: 1,
        name: 'ТКП_Авиаагрегат_Mitutoyo_v1.pdf',
        size: '2.8 MB',
        uploadedAt: '22.08.2026',
        uploadedBy: 'Скобелев А.С.'
      },
      {
        id: 'ver_1_2',
        version: 2,
        name: 'ТКП_Авиаагрегат_Mitutoyo_v2_Уточненное.pdf',
        size: '3.1 MB',
        uploadedAt: '25.08.2026',
        uploadedBy: 'Скобелев А.С.'
      }
    ]
  },
  {
    id: 'cp_2',
    outgoingNumber: 'КП-2026/08/20-04',
    date: '20.08.2026',
    toCompany: 'ООО «Тольяттинский Завод Автоагрегатов»',
    content: 'Лазерный 3D-сканер Shining3D FreeScan Combo + ПО PolyWorks|Inspector & Modeler',
    preparedBy: 'Ярыш А.В.',
    note: 'Тендерная оферта согласована, ожидается аванс 50%',
    internalNotes: 'Победа в тендере, договор подписан',
    contactPerson: 'Морозов Дмитрий Сергеевич',
    contactPhone: '+7 (8482) 75-90-12',
    dealId: 'СДЕЛКА-2026-074',
    dealTitle: 'Лазерный 3D-сканер Shining3D FreeScan Combo',
    dealStage: 'contract',
    dealFunnel: 'equipment',
    amount: 4850000,
    isAlternative: false,
    versions: [
      {
        id: 'ver_2_1',
        version: 1,
        name: 'ТКП-2026-08-20-04_FreeScan_Combo_Основное.pdf',
        size: '2.4 MB',
        uploadedAt: '20.08.2026',
        uploadedBy: 'Ярыш А.В.'
      }
    ]
  },
  {
    id: 'cp_2_alt',
    outgoingNumber: 'КП-2026/08/21-04/АКП',
    date: '21.08.2026',
    toCompany: 'ООО «Тольяттинский Завод Автоагрегатов»',
    content: 'АКП (Альтернативный вариант): Оптический 3D-сканер Shining3D EinScan Pro HD с поворотным столом + ПО EXScan Pro (Бюджетная альтернатива)',
    preparedBy: 'Ярыш А.В.',
    note: 'АКП отправлено в коммерческую службу по запросу на оптимизацию бюджета',
    internalNotes: 'Альтернатива к основному FreeScan Combo. Предложено для тендерного сравнения',
    contactPerson: 'Морозов Дмитрий Сергеевич',
    contactPhone: '+7 (8482) 75-90-12',
    dealId: 'СДЕЛКА-2026-074',
    dealTitle: 'Лазерный 3D-сканер Shining3D FreeScan Combo',
    dealStage: 'contract',
    dealFunnel: 'equipment',
    amount: 2150000,
    isAlternative: true,
    akpPurpose: 'alternative_supply',
    versions: [
      {
        id: 'ver_2_alt_1',
        version: 1,
        name: 'АКП-2026-08-21-04_Альтернатива_EinScan_Pro_HD.pdf',
        size: '1.9 MB',
        uploadedAt: '21.08.2026',
        uploadedBy: 'Ярыш А.В.'
      }
    ]
  },
  {
    id: 'cp_partner_alt_1',
    outgoingNumber: 'КП-2026/08/25-07/АКП',
    date: '25.08.2026',
    toCompany: 'ООО «ПромТехСнаб» (Партнер)',
    content: 'АКП для партнера: Поставка TopSolid 7 Design & Cam 5-Axis (Для участия в тендере ПАО «КАМАЗ»)',
    preparedBy: 'Ярыш А.В.',
    note: 'АКП предоставлено партнеру под тендерные процедуры по запросу',
    internalNotes: 'Специальные партнерские скидки учтены для тендерной заявки',
    contactPerson: 'Кузнецов Сергей Петрович',
    contactPhone: '+7 (846) 310-44-88',
    dealId: 'СДЕЛКА-2026-071',
    dealTitle: 'Внедрение TopSolid 7 5-Axis',
    dealStage: 'commercial',
    dealFunnel: 'software',
    amount: 1850000,
    isAlternative: true,
    akpPurpose: 'partner_tender',
    versions: [
      {
        id: 'ver_part_alt_1',
        version: 1,
        name: 'АКП-2026-08-25-07_Партнер_Тендер_ПромТехСнаб.pdf',
        size: '1.4 MB',
        uploadedAt: '25.08.2026',
        uploadedBy: 'Ярыш А.В.'
      }
    ]
  },
  {
    id: 'cp_3',
    outgoingNumber: 'КП-2026/08/28-02',
    date: '28.08.2026',
    toCompany: 'АО «Салют-Энерго»',
    content: 'Реверс-инжиниринг лопаток газотурбинного двигателя (8 ступеней) в Geomagic Design X',
    preparedBy: 'Ярыш И.В.',
    note: 'Расчет трудоемкости отправлен вместе с шаблоном NDA',
    internalNotes: 'Ждем подписанный NDA от заказчика',
    contactPerson: 'Калинин Игорь Олегович',
    contactPhone: '+7 (495) 640-11-22',
    dealId: 'СДЕЛКА-2026-092',
    dealTitle: 'Реверс-инжиниринг лопаток ГТД',
    dealStage: 'nda',
    dealFunnel: 'services',
    amount: 820000,
    isAlternative: false,
    versions: [
      {
        id: 'ver_3_1',
        version: 1,
        name: 'КП_СалютЭнерго_Реверс_Лопатки_ГТД.pdf',
        size: '1.6 MB',
        uploadedAt: '28.08.2026',
        uploadedBy: 'Ярыш И.В.'
      }
    ]
  },
  {
    id: 'cp_4',
    outgoingNumber: 'КП-2026/08/12-07',
    date: '12.08.2026',
    toCompany: 'ОАО «Кузнецов-Турбо»',
    content: 'Регламентное ТО КИМ Hexagon ARM 8520 и поверка с внесением в ФГИС «АРШИН»',
    preparedBy: 'Морозов В.Г.',
    note: 'Счет-оферта оплачена на 100%',
    internalNotes: 'Оборудование принято в метрологический зал технопарка «Жигулевская долина»',
    contactPerson: 'Егоров Валентин Николаевич',
    contactPhone: '+7 (846) 992-33-10',
    dealId: 'СДЕЛКА-2026-065',
    dealTitle: 'ТО КИМ Hexagon ARM 8520',
    dealStage: 'maintenance',
    dealFunnel: 'support',
    amount: 380000,
    isAlternative: false,
    versions: [
      {
        id: 'ver_4_1',
        version: 1,
        name: 'Счет_Оферта_ТО_КИМ_Hexagon_АРШИН.pdf',
        size: '1.1 MB',
        uploadedAt: '12.08.2026',
        uploadedBy: 'Морозов В.Г.'
      }
    ]
  },
  {
    id: 'cp_5',
    outgoingNumber: 'КП-2026/08/03-11',
    date: '03.08.2026',
    toCompany: 'ООО «ПромДетальСервис»',
    content: 'Разработка 5-осевого постпроцессора DMG DMU 50 (Heidenhain TNC 640) в TopSolid 7',
    preparedBy: 'Скобелев А.С.',
    note: 'Договор заключен, аванс 50% получен',
    internalNotes: 'Идет симуляция кинематики станка',
    contactPerson: 'Белов Артем Станиславович',
    contactPhone: '+7 (495) 880-99-00',
    dealId: 'СДЕЛКА-2026-059',
    dealTitle: 'Постпроцессор DMG DMU 50 в TopSolid 7',
    dealStage: 'implementation',
    dealFunnel: 'services',
    amount: 450000,
    isAlternative: false,
    versions: [
      {
        id: 'ver_5_1',
        version: 1,
        name: 'КП_Постпроцессор_DMG_TopSolid7.pdf',
        size: '1.4 MB',
        uploadedAt: '03.08.2026',
        uploadedBy: 'Скобелев А.С.'
      }
    ]
  }
];

export const INITIAL_CONTRACTS: ProjectContract[] = [
  {
    id: 'cnt-01',
    number: 'ДОГ-2026/014',
    title: 'Внедрение TopSolid 7 + 2 лицензии TopSolid\'CAM 7 (5-axis) + PDM',
    company: 'АО «Авиаагрегат-Самара»',
    date: '15.01.2026',
    status: 'Действует',
    statusColor: 'emerald',
    supportUntil: '15.01.2027',
    curator: 'Скобелев Александр Сергеевич',
    curatorPhone: '+7 (937) 984-61-51',
    amount: 'По договору',
    scope: 'Поставка лицензий TopSolid\'CAM 7, развертывание защищенного PDM-хранилища, разработка постпроцессоров DMU 50 и Hermle C40, технический инструктаж технологов.',
    documents: [
      {
        id: 'doc-cnt-101',
        name: 'Договор_Поставки_ПО_ДОГ-2026-014.pdf',
        category: 'Договор и приложения',
        size: '2.4 MB',
        uploadedAt: '15.01.2026',
        uploadedBy: 'Юридический отдел',
      },
      {
        id: 'doc-cnt-102',
        name: 'Спецификация_и_ТЗ_на_постпроцессор_DMU50.pdf',
        category: 'Спецификация и смета',
        size: '1.2 MB',
        uploadedAt: '16.01.2026',
        uploadedBy: 'Скобелев А.С.',
      },
      {
        id: 'doc-cnt-103',
        name: 'Акт_приема_передачи_прав_на_ПО.pdf',
        category: 'Акт сдачи-приемки',
        size: '890 KB',
        uploadedAt: '28.01.2026',
        uploadedBy: 'Бухгалтерия',
      },
    ],
  },
  {
    id: 'cnt-02',
    number: 'ДОГ-2025/189',
    title: 'Поставка мобильной КИМ Hexagon ROMER Absolute Arm 7525SE + PolyWorks',
    company: 'ПАО «ОДК-Кузнецов»',
    date: '10.11.2025',
    status: 'Выполнен (На гарантии)',
    statusColor: 'blue',
    supportUntil: '10.11.2027',
    curator: 'Ярыш Иван Владимирович',
    curatorPhone: '+7 (927) 748-46-58',
    amount: '6 850 000 ₽',
    scope: 'Поставка 7-осевой измерительной руки с лазерным сканером RS6, комплект калибровочных сфер, ПО PolyWorks|Inspector Premium и первичная поверка.',
    documents: [
      {
        id: 'doc-cnt-201',
        name: 'Контракт_Hexagon_7525SE_ДС-189.pdf',
        category: 'Договор и приложения',
        size: '3.1 MB',
        uploadedAt: '10.11.2025',
        uploadedBy: 'Коммерческий отдел',
      },
      {
        id: 'doc-cnt-202',
        name: 'Свидетельство_поверки_АРШИН_Hexagon.pdf',
        category: 'Паспорт и сертификат',
        size: '1.4 MB',
        uploadedAt: '18.11.2025',
        uploadedBy: 'Метрологическая служба',
      },
      {
        id: 'doc-cnt-203',
        name: 'Акт_ввода_в_эксплуатацию_КИМ.pdf',
        category: 'Акт сдачи-приемки',
        size: '950 KB',
        uploadedAt: '25.11.2025',
        uploadedBy: 'Ярыш И.В.',
      },
    ],
  },
  {
    id: 'cnt-03',
    number: 'ДОГ-2025/112',
    title: 'Проектирование и изготовление комплекта технологической оснастки и штампов',
    company: 'ООО «Самарский резервуарный завод»',
    date: '14.06.2025',
    status: 'Сдан в эксплуатацию',
    statusColor: 'gray',
    supportUntil: '14.06.2026',
    curator: 'Морозов Владимир Георгиевич',
    curatorPhone: '+7 (902) 371-20-16',
    amount: '2 400 000 ₽',
    scope: 'Разработка КД, математическое моделирование штамповки в TopSolid, изготовление формообразующих вставок и испытания опытной партии.',
    documents: [
      {
        id: 'doc-cnt-301',
        name: 'Договор_на_оснастку_ДОГ-112.pdf',
        category: 'Договор и приложения',
        size: '1.8 MB',
        uploadedAt: '14.06.2025',
        uploadedBy: 'Морозов В.Г.',
      },
      {
        id: 'doc-cnt-302',
        name: 'Контрольный_протокол_измерений_штампа.pdf',
        category: 'Паспорт и сертификат',
        size: '4.2 MB',
        uploadedAt: '02.08.2025',
        uploadedBy: 'ОТК',
      },
    ],
  },
  {
    id: 'cnt-04',
    number: 'ДОГ-2026/044',
    title: 'Поставка лазерного 3D-сканера Shining3D FreeScan Combo + ПО PolyWorks',
    company: 'ООО «Тольяттинский Завод Автоагрегатов»',
    date: '29.08.2026',
    status: 'Исполняется',
    statusColor: 'blue',
    supportUntil: '29.08.2028',
    curator: 'Ярыш Александр Владимирович',
    curatorPhone: '+7 (927) 748-46-58',
    amount: '4 850 000 ₽',
    scope: 'Лазерный 3D-сканер FreeScan Combo, лицензия PolyWorks|Inspector & Modeler, инструктаж инженеров.',
    dealId: 'СДЕЛКА-2026-074',
    dealTitle: 'Лазерный 3D-сканер Shining3D FreeScan Combo',
    documents: [
      {
        id: 'doc-cnt-401',
        name: 'Договор_Поставки_ТЗА_DS-2026-44.pdf',
        category: 'Договор и приложения',
        size: '3.8 MB',
        uploadedAt: '29.08.2026',
        uploadedBy: 'Ярыш А.В.',
      },
      {
        id: 'doc-cnt-402',
        name: 'Спецификация_FreeScan_Combo.pdf',
        category: 'Спецификация и смета',
        size: '940 KB',
        uploadedAt: '28.08.2026',
        uploadedBy: 'Ярыш А.В.',
      }
    ],
  }
];
export const INITIAL_SUPPORT_TICKETS: SupportTicketItem[] = [
  {
    id: 'TCK-2026-1042',
    subject: 'Консультация по настройке кинематики поворотного стола B/C в TopSolid\'CAM 7',
    product: 'TopSolid 7',
    clientCompany: 'АО «Авиаагрегат-Самара»',
    clientName: 'Петров Дмитрий Николаевич',
    date: '20.02.2026',
    status: 'in_progress',
    priority: 'Средний',
    description: 'При генерации траектории одновременной 5-осевой обработки лопатки станок выдает ограничение по оси C. Требуется скорректировать постпроцессор и пределы кинематики.',
    assignedEngineer: 'Скобелев Александр Сергеевич',
    lastReply: 'Инженер Скобелев А.С. подготовил обновленный файл кинематического узла станка. Проверьте симуляцию в PDM.',
    messages: [
      {
        id: 'msg-1',
        author: 'Петров Дмитрий (АО «Авиаагрегат»)',
        authorRole: 'client',
        text: 'Здравствуйте! Возникает ошибка кинематики при выходе на угол C=+120°. Скриншот и лог симулятора прикрепил.',
        date: '20.02.2026 10:15',
      },
      {
        id: 'msg-2',
        author: 'Скобелев Александр Сергеевич',
        authorRole: 'engineer',
        text: 'Добрый день! Проверили конфигурацию кинематической головки станка. Внесли поправку в пределы поворота стола и обновили файл станка.',
        date: '20.02.2026 14:30',
      },
    ],
    attachments: [
      {
        id: 'tck-att-1',
        name: 'Screen_Collision_5axis.png',
        category: 'Лог ошибки / Скриншот',
        size: '1.1 MB',
        uploadedAt: '20.02.2026',
        uploadedBy: 'Петров Д.Н.',
      },
      {
        id: 'tck-att-2',
        name: 'Blade_Test_Project.top',
        category: 'CAD-модель / Чертеж',
        size: '14.5 MB',
        uploadedAt: '20.02.2026',
        uploadedBy: 'Петров Д.Н.',
      },
    ],
  },
  {
    id: 'TCK-2026-1029',
    subject: 'Запрос калибровочного сертификата для мобильной КИМ Hexagon Absolute Arm',
    product: 'Hexagon ROMER Arm',
    clientCompany: 'ПАО «ОДК-Кузнецов»',
    clientName: 'Михайлов И.В.',
    date: '15.01.2026',
    status: 'resolved',
    priority: 'Низкий',
    description: 'Для прохождения аудита СМК требуется электронная копия заводского калибровочного сертификата ISO 10360-12 на измерительную руку Hexagon 7525SE.',
    assignedEngineer: 'Ярыш Иван Владимирович',
    lastReply: 'Сертификат поверки и калибровочный протокол выгружены в карточку заявки.',
    messages: [
      {
        id: 'msg-3',
        author: 'Михайлов И.В. (ОДК-Кузнецов)',
        authorRole: 'client',
        text: 'Просьба предоставить протокол калибровки за 2025 год.',
        date: '15.01.2026 09:20',
      },
      {
        id: 'msg-4',
        author: 'Ярыш Иван Владимирович',
        authorRole: 'engineer',
        text: 'Файл сертификата поверки прикреплен к заявке. Вопрос закрыт.',
        date: '15.01.2026 11:45',
      },
    ],
    attachments: [
      {
        id: 'tck-att-3',
        name: 'Hexagon_7525SE_ISO10360_Calibration.pdf',
        category: 'Паспорт и сертификат',
        size: '2.8 MB',
        uploadedAt: '15.01.2026',
        uploadedBy: 'Ярыш И.В.',
      },
    ],
  },
  {
    id: 'TCK-2025-0994',
    subject: 'Ошибка выравнивания по базам RPS в PolyWorks|Inspector v2025',
    product: 'PolyWorks|Inspector',
    clientCompany: 'АО «Авиаагрегат-Самара»',
    clientName: 'Петров Дмитрий Николаевич',
    date: '02.12.2025',
    status: 'resolved',
    priority: 'Высокий',
    description: 'При совмещении скана корпусной детали по 6 точкам RPS система выдает предупреждение о расходимости итераций Best-Fit.',
    assignedEngineer: 'Ярыш Иван Владимирович',
    lastReply: 'Проблема устранена путем задания весовых коэффициентов и направления векторов нормалей точек RPS.',
    messages: [],
    attachments: [
      {
        id: 'tck-att-4',
        name: 'RPS_Alignment_Guide_PolyWorks.pdf',
        category: 'Инструкция по установке',
        size: '1.6 MB',
        uploadedAt: '03.12.2025',
        uploadedBy: 'Ярыш И.В.',
      },
    ],
  },
];
export const INITIAL_LICENSES: LicenseItem[] = [
  {
    id: 'lic-01',
    title: 'TopSolid 7 PDM Server & CAM 5-Axis Bundle',
    productName: 'TopSolid 7 (v7.18)',
    type: 'Сетевая лицензия PDM',
    status: 'Активна',
    company: 'АО «Авиаагрегат-Самара»',
    haspId: '#849204-SAMARA-01',
    seatsCount: '8 CAD Design / 4 CAM 5-Axis / 1 PDM Server',
    licenseServer: '192.168.1.50:1947 (Sentinel HASP Net)',
    hardwareModel: 'Сервер Dell PowerEdge R640 / Клиентские станции',
    validUntil: 'Бессрочно (Перманентная лицензия)',
    supportUntil: '15.01.2027',
    notes: 'Основной корпоративный пакет ПО для КБ и технологического отдела механической обработки.',
    files: [
      {
        id: 'lic-f-1',
        name: 'License_Key_TopSolid7_849204.v2c',
        category: 'Файл лицензии (.v2c / .lic)',
        size: '32 KB',
        uploadedAt: '15.01.2026',
        uploadedBy: 'Центр лицензирования ДС',
      },
      {
        id: 'lic-f-2',
        name: 'HASP_Sentinel_Runtime_Driver_v8.15.exe',
        category: 'Драйвер ключа / Утилита',
        size: '22.4 MB',
        uploadedAt: '15.01.2026',
        uploadedBy: 'ИТ-отдел',
      },
      {
        id: 'lic-f-3',
        name: 'Инструкция_по_активации_PDM_Server.pdf',
        category: 'Инструкция по установке',
        size: '1.2 MB',
        uploadedAt: '15.01.2026',
        uploadedBy: 'Скобелев А.С.',
      },
    ],
  },
  {
    id: 'lic-02',
    title: 'PolyWorks|Inspector™ Premium Metrology Suite',
    productName: 'PolyWorks|Inspector',
    type: 'Локальный Dongle USB',
    status: 'Активна',
    company: 'ПАО «ОДК-Кузнецов»',
    haspId: 'Sentinel HL #492817',
    seatsCount: '1 Рабочее место (Full Premium + AR Plugin)',
    licenseServer: 'USB Dongle Hardware Key',
    hardwareModel: 'Мобильная КИМ Hexagon ROMER Absolute Arm 7525SE',
    validUntil: 'Бессрочно',
    supportUntil: '10.11.2027',
    notes: 'Лицензия привязана к физическому USB-ключу Sentinel HL с модулем лазерного сканирования.',
    files: [
      {
        id: 'lic-f-4',
        name: 'PolyWorks_Inspector_License_Dump.lic',
        category: 'Файл лицензии (.v2c / .lic)',
        size: '18 KB',
        uploadedAt: '10.11.2025',
        uploadedBy: 'Ярыш И.В.',
      },
      {
        id: 'lic-f-5',
        name: 'Паспорт_USB_Ключа_Sentinel_HL.pdf',
        category: 'Паспорт и сертификат',
        size: '780 KB',
        uploadedAt: '10.11.2025',
        uploadedBy: 'ДС‑Инжиниринг',
      },
    ],
  },
  {
    id: 'lic-03',
    title: 'SHINING 3D Inspect & ScanLine Metrology Module',
    productName: 'ScanLine / Shining3D',
    type: 'Sentinel HASP HL',
    status: 'Активна',
    company: 'АО «Авиаагрегат-Самара»',
    haspId: 'HASP-SL-993021',
    seatsCount: '2 Рабочих места (AutoInspect + GD&T)',
    licenseServer: 'USB Hardware Key',
    hardwareModel: '3D-сканер Shining3D FreeScan Combo',
    validUntil: 'Бессрочно',
    supportUntil: '30.06.2026',
    notes: 'Программное обеспечение метрологического контроля и оценки допусков формы и расположения.',
    files: [
      {
        id: 'lic-f-6',
        name: 'ScanLine_Inspect_Key_Update.v2c',
        category: 'Файл лицензии (.v2c / .lic)',
        size: '24 KB',
        uploadedAt: '30.06.2025',
        uploadedBy: 'Ярыш А.В.',
      },
    ],
  },
];

export const INITIAL_COMPANY_FLEET = [
  {
    id: 'fleet-dev-1',
    catalogProductId: 'scanline-easyscan-omni',
    modelName: '3D-сканер ScanLine EasyScan Omni',
    brand: 'ScanLine 3D / Shining 3D',
    category: 'Оптические и лазерные 3D-сканеры',
    serialNumber: 'SL-OMNI-2025-084',
    inventoryNumber: 'ИНВ-ДС-031',
    status: 'in_office' as const,
    statusLabel: 'В офисе / Метрологическом зале',
    verificationNumber: 'С-СПБ/14-07-2025/08412-АРШИН',
    verificationDate: '2025-07-14',
    verificationValidUntil: '2026-11-20',
    accuracy: 'до 0.020 мм',
    measuringRange: 'Поле сканирования до 550 × 600 мм',
    currentLocation: 'Главный офис в Самаре (ул. Свободы, 198) / Метрологический зал',
    responsiblePerson: 'Скобелев А.С. (Инженер по внедрению CAD/CAM и постпроцессорам)',
    notes: 'Комплект: ручной сканер EasyScan Omni, калибровочная пластина, набор магнитных меток, транспортный защитный кейс Pelicase.',
    photoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'fleet-dev-2',
    catalogProductId: 'hexagon-absolute-arm-8520',
    modelName: 'Портативная измерительная машина Hexagon Absolute ARM 8520 со сканером RS6',
    brand: 'Hexagon Manufacturing Intelligence',
    category: 'Измерительные руки',
    serialNumber: '8520-7A-4491-RU',
    inventoryNumber: 'ИНВ-ДС-042',
    status: 'in_office' as const,
    statusLabel: 'В офисе / Метрологическом зале',
    verificationNumber: 'С-МСК/24-08-2025/119044-АРШИН',
    verificationDate: '2025-08-24',
    verificationValidUntil: '2026-12-15',
    accuracy: '0.018 мм (щуп) / 0.026 мм (сканер RS6)',
    measuringRange: 'Сфера диаметром 2.0 м',
    currentLocation: 'Офис в Тольятти (Южное шоссе, 165, корп. 2.3)',
    responsiblePerson: 'Ярыш И.В. (Инженер-метролог)',
    notes: '7-осевая измерительная рука с абсолютными энкодерами, синий лазерный сканер Hexagon RS6 (1.2 млн тчк/с), комплект контактных щупов Renishaw Ruby Ø3, Ø5, Ø6 мм, магнитное основание.',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'fleet-dev-3',
    catalogProductId: 'leica-at403',
    modelName: 'Лазерный трекер Leica AT403',
    brand: 'Leica Geosystems / Hexagon',
    category: 'Лазерные трекеры',
    serialNumber: 'AT403-9120-CH',
    inventoryNumber: 'ИНВ-ДС-018',
    status: 'on_site' as const,
    statusLabel: 'На выезде у заказчика',
    verificationNumber: 'С-ВНИИМС/05-11-2025/44120-АРШИН',
    verificationDate: '2025-11-05',
    verificationValidUntil: '2026-11-05',
    accuracy: '±15 мкм + 6 мкм/м',
    measuringRange: 'Сфера диаметром до 320 м',
    currentLocation: 'ПАО «ОДК-Кузнецов» (Самара, контроль крупногабаритной оснастки)',
    responsiblePerson: 'Некрасов С.Ю. (Генеральный директор)',
    notes: 'Ультрапортативный лазерный трекер с технологией PowerLock, отражатели RRR 1.5", метеостанция MeteoStation, штатив углепластиковый Brunson, влагозащита IP54.',
    photoUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'fleet-dev-4',
    catalogProductId: 'mitutoyo-crysta-apex-s',
    modelName: 'Стационарная высокоточная измерительная машина Mitutoyo CRYSTA-Apex S',
    brand: 'Mitutoyo Corporation (Япония)',
    category: 'Координатно-измерительные машины',
    serialNumber: 'MIT-APEX-9106-JP',
    inventoryNumber: 'ИНВ-ДС-007',
    status: 'in_office' as const,
    statusLabel: 'В офисе / Метрологическом зале',
    verificationNumber: 'С-СПБ/10-01-2026/01229-АРШИН',
    verificationDate: '2026-01-10',
    verificationValidUntil: '2027-01-10',
    accuracy: 'E0,MPE = (1.7 + 3L/1000) мкм',
    measuringRange: '900 × 1000 × 600 мм',
    currentLocation: 'Метрологический зал в технопарке «Жигулевская долина» (г. Тольятти, Южное шоссе, 165)',
    responsiblePerson: 'Ярыш И.В. (Инженер-метролог)',
    notes: 'Стационарная мостовая КИМ на гранитном основании в метро-зале технопарка «Жигулевская долина», ЧПУ контроллер, моторизованная головка Renishaw PH10MQ Plus с датчиком TP200, модуль динамической температурной компенсации.',
    photoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
  }
];

export interface VatCountryOverride {
  id: string;
  country: string;
  code: string;
  code_iso?: string;
  vatRate: number;
  isExport: boolean;
  legalReason: string;
  enabled: boolean;
  currency?: string;
  notes?: string;
}

export interface VatCategoryOverride {
  id: string;
  categoryName: string;
  targetCategory: string; // 'equipment' | 'software' | 'services' | 'support' | 'training'
  vatRate: number;
  isExempt: boolean;
  legalReason: string;
  enabled: boolean;
  notes?: string;
}

export interface CrmTaxSettings {
  defaultVatRate: number; // Базовая ставка (22%)
  allowVatOverride: boolean; // Разрешить ручное переопределение в сделках
  neighboringCountriesVatZero: boolean; // 0% для ЕАЭС/СНГ
  exportVatRate: number; // Ставка для экспорта (0%)
  exportZeroRateEnabled: boolean; // Включен ли режим 0% для экспорта
  autoDetectCountryRate: boolean; // Автоопределение ставки по стране
  requireExportDocuments: boolean; // Требовать подтверждающие документы ВЭД
  showVatBreakdownInProposals: boolean; // Показывать расшифровку в КП
  countryOverrides: VatCountryOverride[];
  categoryOverrides: VatCategoryOverride[];
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_COUNTRY_VAT_OVERRIDES: VatCountryOverride[] = [
  {
    id: 'vat-kz',
    country: 'Казахстан',
    code: 'KZ',
    vatRate: 0,
    isExport: true,
    legalReason: 'ст. 164 НК РФ, Приложение № 18 к Договору о ЕАЭС (Протокол о взимании косвенных налогов)',
    enabled: true,
    currency: 'RUB / KZT',
    notes: 'Государство-член ЕАЭС. Нулевая ставка НДС 0% при подтверждении вывоза в течение 180 дней.'
  },
  {
    id: 'vat-by',
    country: 'Беларусь',
    code: 'BY',
    code_iso: 'BY',
    vatRate: 0,
    isExport: true,
    legalReason: 'ст. 164 НК РФ, Приложение № 18 к Договору о ЕАЭС (Протокол о взимании косвенных налогов)',
    enabled: true,
    currency: 'RUB / BYN',
    notes: 'Государство-член ЕАЭС. Ставка 0% для оборудования и инжиниринговых услуг.'
  },
  {
    id: 'vat-uz',
    country: 'Узбекистан',
    code: 'UZ',
    vatRate: 0,
    isExport: true,
    legalReason: 'пп. 1 п. 1 ст. 164 НК РФ (Экспорт товаров и трансграничных услуг в страны СНГ)',
    enabled: true,
    currency: 'RUB / UZS',
    notes: 'Страна СНГ. Экспортные поставки с таможенным декларированием по ставке 0%.'
  },
  {
    id: 'vat-am',
    country: 'Армения',
    code: 'AM',
    vatRate: 0,
    isExport: true,
    legalReason: 'ст. 164 НК РФ, Приложение № 18 к Договору о ЕАЭС',
    enabled: true,
    currency: 'RUB / AMD',
    notes: 'Государство-член ЕАЭС. Ставка 0% при наличии заявления о ввозе товаров.'
  },
  {
    id: 'vat-kg',
    country: 'Кыргызстан',
    code: 'KG',
    vatRate: 0,
    isExport: true,
    legalReason: 'ст. 164 НК РФ, Приложение № 18 к Договору о ЕАЭС',
    enabled: true,
    currency: 'RUB / KGS',
    notes: 'Государство-член ЕАЭС. Ставка 0% для метрологических приборов и инжиниринга.'
  },
  {
    id: 'vat-tj',
    country: 'Таджикистан',
    code: 'TJ',
    vatRate: 0,
    isExport: true,
    legalReason: 'пп. 1 п. 1 ст. 164 НК РФ (Экспорт товаров и услуг)',
    enabled: true,
    currency: 'RUB / TJS',
    notes: 'Экспортные контракты в СНГ по ставке 0%.'
  },
  {
    id: 'vat-az',
    country: 'Азербайджан',
    code: 'AZ',
    vatRate: 0,
    isExport: true,
    legalReason: 'пп. 1 п. 1 ст. 164 НК РФ (ВЭД экспорт)',
    enabled: true,
    currency: 'RUB / AZN',
    notes: 'Прямой экспорт из РФ по ставке 0%.'
  },
  {
    id: 'vat-cn',
    country: 'Китай',
    code: 'CN',
    vatRate: 0,
    isExport: true,
    legalReason: 'пп. 1 п. 1 ст. 164 НК РФ (Международный экспорт ВЭД)',
    enabled: true,
    currency: 'CNY / RUB',
    notes: 'Внешнеторговые контракты поставки в КНР по ставке 0%.'
  },
  {
    id: 'vat-ae',
    country: 'ОАЭ',
    code: 'AE',
    vatRate: 0,
    isExport: true,
    legalReason: 'пп. 1 п. 1 ст. 164 НК РФ (Международный экспорт)',
    enabled: true,
    currency: 'AED / USD',
    notes: 'Поставки оборудования и услуг в ОАЭ по ставке 0%.'
  },
  {
    id: 'vat-ru',
    country: 'Россия',
    code: 'RU',
    vatRate: 22,
    isExport: false,
    legalReason: 'п. 3 ст. 164 НК РФ (Базовая ставка НДС для операций на территории РФ)',
    enabled: true,
    currency: 'RUB',
    notes: 'Основной внутренний рынок Российской Федерации. Стандартное налогообложение 22%.'
  }
];

export const DEFAULT_CATEGORY_VAT_OVERRIDES: VatCategoryOverride[] = [
  {
    id: 'vat-cat-sw-reestr',
    categoryName: 'Отечественное ПО из единого реестра программ РФ (CAD/Inspect)',
    targetCategory: 'software',
    vatRate: 0,
    isExempt: true,
    legalReason: 'пп. 26 п. 2 ст. 149 НК РФ (Освобождение от НДС передачи прав на программы из реестра Минцифры)',
    enabled: true,
    notes: 'Передача неисключительных лицензий на ПО PolyWorks / Shining 3D / отечественные модули.'
  },
  {
    id: 'vat-cat-equipment',
    categoryName: 'Контрольно-измерительные машины, 3D-сканеры и лазерные трекеры',
    targetCategory: 'equipment',
    vatRate: 22,
    isExempt: false,
    legalReason: 'п. 3 ст. 164 НК РФ (Реализация технологического оборудования)',
    enabled: true,
    notes: 'Поставки по РФ облагаются базовой ставкой 22%, экспорт переопределяется правилом страны.'
  },
  {
    id: 'vat-cat-services',
    categoryName: 'Услуги 3D-сканирования, контроля геометрии и реверс-инжиниринга',
    targetCategory: 'services',
    vatRate: 22,
    isExempt: false,
    legalReason: 'п. 3 ст. 164 НК РФ (Инжиниринговые и метрологические услуги в РФ)',
    enabled: true,
    notes: 'Базовые инжиниринговые работы в РФ.'
  },
  {
    id: 'vat-cat-support',
    categoryName: 'Сервисное ТО, калибровка КИМ и метрологическая аттестация',
    targetCategory: 'support',
    vatRate: 22,
    isExempt: false,
    legalReason: 'п. 3 ст. 164 НК РФ (Сервисно-техническое обслуживание)',
    enabled: true,
    notes: 'Техническая поддержка и калибровка оборудования.'
  },
  {
    id: 'vat-cat-training',
    categoryName: 'Курсы обучения операторов КИМ по образовательной лицензии',
    targetCategory: 'training',
    vatRate: 0,
    isExempt: true,
    legalReason: 'пп. 14 п. 2 ст. 149 НК РФ (Услуги в сфере образования)',
    enabled: false,
    notes: 'Применяется при наличии действующей государственной образовательной лицензии.'
  }
];

export const DEFAULT_CRM_TAX_SETTINGS: CrmTaxSettings = {
  defaultVatRate: 22,
  allowVatOverride: true,
  neighboringCountriesVatZero: true,
  exportVatRate: 0,
  exportZeroRateEnabled: true,
  autoDetectCountryRate: true,
  requireExportDocuments: false,
  showVatBreakdownInProposals: true,
  countryOverrides: DEFAULT_COUNTRY_VAT_OVERRIDES,
  categoryOverrides: DEFAULT_CATEGORY_VAT_OVERRIDES,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Администратор системы'
};


