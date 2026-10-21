import { Express, Request, Response } from 'express';
import { eq, desc, asc, and, sql } from 'drizzle-orm';
import { db, isDbConfigured } from '../db/index.ts';
import * as schema from '../db/schema.ts';
import { dispatchManagerNotification } from './notificationModule.ts';
import { logRealtimeEvent } from './logger.ts';
import { validateBody } from './schemas/validator.ts';
import { 
  
  
  
  
  CrmCompany, 
  CrmContact, 
  UserTask, 
  CalendarEvent, 
  ClientSegmentList, 
  TaskChecklistItem 
} from '../types.ts';
import {
  INITIAL_SUPPORT_TICKETS,
  INITIAL_LICENSES,
  INITIAL_CRM_DEALS,
  INITIAL_PROPOSALS,
  INITIAL_CONTRACTS,
  ExtendedDeal,
  CommercialProposal,
  ProjectContract
} from '../data/mockCrmData.ts';
import {
  TrainingCertificate,
  SupportTicketItem,
  LicenseItem
} from '../types.ts';


import { 
  INITIAL_CRM_COMPANIES, 
  INITIAL_CRM_CONTACTS, 
  INITIAL_USER_TASKS, 
  INITIAL_CALENDAR_EVENTS, 
  INITIAL_CLIENT_LISTS 
} from '../data/mockCrmEntities.ts';

// In-memory runtime cache / fallback
let companiesStore: CrmCompany[] = [...INITIAL_CRM_COMPANIES];
let contactsStore: CrmContact[] = [...INITIAL_CRM_CONTACTS];
let tasksStore: UserTask[] = [...INITIAL_USER_TASKS];
let calendarEventsStore: CalendarEvent[] = [...INITIAL_CALENDAR_EVENTS];
let clientListsStore: ClientSegmentList[] = [...INITIAL_CLIENT_LISTS];

let dealsStore: ExtendedDeal[] = [...INITIAL_CRM_DEALS];
let proposalsStore: CommercialProposal[] = [...INITIAL_PROPOSALS];
let contractsStore: ProjectContract[] = [...INITIAL_CONTRACTS];
let certificatesStore: TrainingCertificate[] = [
  {
    id: 'cert-1',
    certificateNumber: '2026-000142',
    date: '2026-05-29T00:00:00.000Z',
    traineeName: 'Захарова Светлана Николаевна',
    customer: 'ООО «АВТОСВЕТ»',
    instructor: 'С.Ю. Некрасов',
    files: []
  }
];

import fs from 'fs';
import path from 'path';

const CRM_DATA_DIR = path.join(process.cwd(), 'data');
const FLEET_FILE_PATH = path.join(CRM_DATA_DIR, 'crm_fleet_devices.json');
const REPORTS_FILE_PATH = path.join(CRM_DATA_DIR, 'crm_metrology_reports.json');
const FUNNELS_FILE_PATH = path.join(CRM_DATA_DIR, 'crm_funnels.json');
const CRM_SETTINGS_FILE_PATH = path.join(CRM_DATA_DIR, 'crm_settings.json');

export const INITIAL_COMPANY_FLEET: any[] = [
  {
    id: 'fleet-dev-1',
    catalogProductId: 'scanline-easyscan-omni',
    modelName: '3D-сканер ScanLine EasyScan Omni',
    brand: 'ScanLine 3D / Shining 3D',
    category: 'Оптические и лазерные 3D-сканеры',
    serialNumber: 'SL-OMNI-2025-084',
    inventoryNumber: 'ИНВ-ДС-031',
    status: 'in_office',
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
    catalogProductId: 'freescan-combo',
    modelName: 'Метрологический лазерный 3D-сканер Shining 3D FreeScan Combo',
    brand: 'Shining 3D',
    category: 'Оптические и лазерные 3D-сканеры',
    serialNumber: 'FSC-2025-091',
    inventoryNumber: 'ИНВ-ДС-042',
    status: 'in_office',
    statusLabel: 'В офисе (Самара)',
    verificationNumber: 'С-МСК/24-08-2025/119044-АРШИН',
    verificationDate: '2025-08-24',
    verificationValidUntil: '2026-12-15',
    accuracy: 'до 0.020 мм',
    measuringRange: 'Поле сканирования до 600 × 550 мм',
    currentLocation: 'Центральный офис в Самаре (ул. Свободы, 198)',
    responsiblePerson: 'Ярыш И.В. (Инженер-метролог)',
    notes: 'Гибридный источник света: синий лазер (26 линий) + VCSEL фотограмметрия для сканирования крупногабаритных объектов без потери точности.',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'fleet-dev-3',
    catalogProductId: 'freescan-ue-pro',
    modelName: 'Прецизионный синий лазерный 3D-сканер Shining 3D FreeScan UE Pro',
    brand: 'Shining 3D',
    category: 'Оптические и лазерные 3D-сканеры',
    serialNumber: 'FS-UEPRO-2025-018',
    inventoryNumber: 'ИНВ-ДС-018',
    status: 'on_site',
    statusLabel: 'На выезде у заказчика',
    verificationNumber: 'С-ВНИИМС/05-11-2025/44120-АРШИН',
    verificationDate: '2025-11-05',
    verificationValidUntil: '2026-11-05',
    accuracy: 'до 0.020 мм, объемная точность 0.020 + 0.035 мм/м',
    measuringRange: 'Высокоточное сканирование деталей от 50 мм до 4000 мм',
    currentLocation: 'ПАО «ОДК-Кузнецов» (Самара, контроль крупногабаритной оснастки)',
    responsiblePerson: 'Ярыш И.В. (Инженер-метролог)',
    notes: 'Интегрированная фотограмметрия высокой точности, лазерные перекрестия высокой четкости, мобильный чемодан для выездных измерений.',
    photoUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'fleet-dev-4',
    catalogProductId: 'pmt-alpha-arm',
    modelName: 'Портативная координатно-измерительная машина PMT Alpha Arm',
    brand: 'PMT Measurement',
    category: 'Измерительные руки',
    serialNumber: 'PMT-ARM-2500-RU',
    inventoryNumber: 'ИНВ-ДС-007',
    status: 'in_office',
    statusLabel: 'В офисе (Самара)',
    verificationNumber: 'С-СПБ/10-01-2026/01229-АРШИН',
    verificationDate: '2026-01-10',
    verificationValidUntil: '2027-01-10',
    accuracy: 'до 0.018 мм',
    measuringRange: 'Сфера измерения диаметром 2.5 м',
    currentLocation: 'Центральный офис в Самаре (ул. Свободы, 198)',
    responsiblePerson: 'Скобелев А.С. (Инженер по ПО и 3D-моделированию)',
    notes: 'Портативная рука-КИМ с противовесом, датчики Renishaw TP20, магнитная стойка для установки прямо на станину станка.',
    photoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'fleet-dev-5',
    catalogProductId: 'mitutoyo-crysta-apex-s',
    modelName: 'Стационарная высокоточная измерительная машина Mitutoyo CRYSTA-Apex S',
    brand: 'Mitutoyo Corporation (Япония)',
    category: 'Координатно-измерительные машины',
    serialNumber: 'MIT-APEX-9106-JP',
    inventoryNumber: 'ИНВ-ДС-008',
    status: 'in_office',
    statusLabel: 'В метрологическом зале',
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

export const INITIAL_METROLOGY_REPORTS: any[] = [
  {
    id: 'report-1',
    reportNumber: 'МЕТ-2026-001',
    date: '2026-06-15T00:00:00.000Z',
    objectName: 'Лопатка турбины ЛП-04 (ТВ7-117СТ)',
    customer: 'ПАО «ОДК-Кузнецов»',
    engineer: 'Ярыш И.В. (Инженер-метролог)',
    equipment: 'Метрологический лазерный 3D-сканер Shining 3D FreeScan Combo',
    fleetDeviceId: 'fleet-dev-2',
    equipmentSerial: 'FSC-2025-091',
    inventoryNumber: 'ИНВ-ДС-042',
    verificationCertificate: 'С-МСК/24-08-2025/119044-АРШИН',
    verificationValidUntil: '2026-12-15',
    isVerificationExpired: false,
    status: 'issued',
    contactPerson: 'Захаров В.С.',
    files: []
  },
  {
    id: 'report-2',
    reportNumber: 'МЕТ-2026-002',
    date: '2026-07-20T00:00:00.000Z',
    objectName: 'Штамп глубокой вытяжки кузовной панели',
    customer: 'АО «АВТОВАЗ»',
    engineer: 'Скобелев А.С. (Инженер по внедрению CAD/CAM и постпроцессорам)',
    equipment: '3D-сканер ScanLine EasyScan Omni',
    fleetDeviceId: 'fleet-dev-1',
    equipmentSerial: 'SL-OMNI-2025-084',
    inventoryNumber: 'ИНВ-ДС-031',
    verificationCertificate: 'С-СПБ/14-07-2025/08412-АРШИН',
    verificationValidUntil: '2026-11-20',
    isVerificationExpired: false,
    status: 'issued',
    contactPerson: 'Иванов М.К.',
    files: []
  },
  {
    id: 'report-3',
    reportNumber: 'МЕТ-2026-003',
    date: '2026-08-10T00:00:00.000Z',
    objectName: 'Корпус редуктора вертолета Ка-62',
    customer: 'АО «Вертолеты России»',
    engineer: 'Ярыш И.В. (Инженер-метролог)',
    equipment: 'Портативная координатно-измерительная машина PMT Alpha Arm',
    fleetDeviceId: 'fleet-dev-4',
    equipmentSerial: 'PMT-ARM-2500-RU',
    inventoryNumber: 'ИНВ-ДС-007',
    verificationCertificate: 'С-СПБ/10-01-2026/01229-АРШИН',
    verificationValidUntil: '2027-01-10',
    isVerificationExpired: false,
    status: 'issued',
    contactPerson: 'Смирнов Д.А.',
    files: []
  },
  {
    id: 'report-4',
    reportNumber: 'МЕТ-2026-004',
    date: '2026-08-28T00:00:00.000Z',
    objectName: 'Сборочный стапель фюзеляжа самолета',
    customer: 'АО «Авиастар-СП»',
    engineer: 'Некрасов С.Ю. (Генеральный директор)',
    equipment: 'Лазерный трекер Leica AT403',
    fleetDeviceId: 'fleet-dev-3',
    equipmentSerial: 'AT403-9120-CH',
    inventoryNumber: 'ИНВ-ДС-018',
    verificationCertificate: 'С-ВНИИМС/05-11-2025/44120-АРШИН',
    verificationValidUntil: '2026-11-05',
    isVerificationExpired: false,
    status: 'issued',
    contactPerson: 'Григорьев Е.П.',
    files: []
  }
];

function loadFleetFromDisk(): any[] {
  try {
    if (fs.existsSync(FLEET_FILE_PATH)) {
      const raw = fs.readFileSync(FLEET_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load fleet from disk:', e);
  }
  return [...INITIAL_COMPANY_FLEET];
}

function saveFleetToDisk(data: any[]) {
  try {
    if (!fs.existsSync(CRM_DATA_DIR)) {
      fs.mkdirSync(CRM_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FLEET_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save fleet to disk:', e);
  }
}

function loadReportsFromDisk(): any[] {
  try {
    if (fs.existsSync(REPORTS_FILE_PATH)) {
      const raw = fs.readFileSync(REPORTS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load metrology reports from disk:', e);
  }
  return [...INITIAL_METROLOGY_REPORTS];
}

function saveReportsToDisk(data: any[]) {
  try {
    if (!fs.existsSync(CRM_DATA_DIR)) {
      fs.mkdirSync(CRM_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(REPORTS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save metrology reports to disk:', e);
  }
}

export const DEFAULT_CRM_FUNNELS_SERVER: any[] = [
  {
    id: 'equipment',
    name: 'Оборудование и ПО',
    description: 'КИМ, 3D-сканеры, ПО PolyWorks, САПР TopSolid 7 для ЧПУ',
    accentColor: 'blue',
    icon: 'Cpu',
    stages: [
      { id: 'lead', label: '1. Входящий лид (Квалификация)', shortLabel: 'Лид', winRate: 10, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'audit', label: '2. Технический аудит и Бенчмаркинг', shortLabel: 'Тех. аудит', winRate: 25, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'tender', label: '3. ТКП и Тендерная подготовка', shortLabel: 'ТКП / Тендер', winRate: 45, color: 'border-cyan-200 bg-cyan-50/50 text-cyan-800' },
      { id: 'demo', label: '4. Выездная демо и Согласование NDA', shortLabel: 'Выездная демо', winRate: 60, color: 'border-purple-200 bg-purple-50/50 text-purple-800' },
      { id: 'contract', label: '5. Договор и Аванс', shortLabel: 'Договор и аванс', winRate: 80, color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
      { id: 'logistics', label: '6. Логистика и Таможня', shortLabel: 'Логистика', winRate: 90, color: 'border-orange-200 bg-orange-50/50 text-orange-800' },
      { id: 'implementation', label: '7. Внедрение и Инструктаж', shortLabel: 'Внедрение', winRate: 95, color: 'border-teal-200 bg-teal-50/50 text-teal-800' },
      { id: 'closed_won', label: '8. Закрыто / Поставка выполнена', shortLabel: 'Закрыто / Успех', winRate: 100, color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800', isWon: true },
      { id: 'lost', label: 'Отменено / Отказ', shortLabel: 'Отказ / Архив', winRate: 0, color: 'border-rose-200 bg-rose-50/50 text-rose-800', isLost: true }
    ]
  },
  {
    id: 'services',
    name: 'Инжиниринг',
    description: '3D-сканирование, реверс, постпроцессоры',
    accentColor: 'amber',
    icon: 'Settings',
    stages: [
      { id: 'new', label: '1. Заявка из калькулятора', shortLabel: 'Заявка', winRate: 15, color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
      { id: 'estimate', label: '2. Оценка трудоемкости инженером', shortLabel: 'Оценка', winRate: 35, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'nda', label: '3. Утверждение методики и NDA', shortLabel: 'Методика / NDA', winRate: 60, color: 'border-purple-200 bg-purple-50/50 text-purple-800' },
      { id: 'implementation', label: '4. Выполнение работ (Сканы/Постпроцессор)', shortLabel: 'Реализация', winRate: 85, color: 'border-teal-200 bg-teal-50/50 text-teal-800' },
      { id: 'cross_sell', label: '5. Перевод в продажу оборудования', shortLabel: 'Кросс-продажа', winRate: 95, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'completed', label: '6. Завершено / Сдача проекта', shortLabel: 'Сдано', winRate: 100, color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800', isWon: true },
      { id: 'lost', label: 'Отменено / Архив', shortLabel: 'Архив', winRate: 0, color: 'border-rose-200 bg-rose-50/50 text-rose-800', isLost: true }
    ]
  },
  {
    id: 'support',
    name: 'Сервис и ТО',
    description: 'ТО КИМ, поверка, калибровка и ремонт',
    accentColor: 'emerald',
    icon: 'LifeBuoy',
    stages: [
      { id: 'ticket', label: '1. Обращение / Заводской номер', shortLabel: 'Обращение', winRate: 20, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'diagnostics', label: '2. Диагностика проблемы инженером', shortLabel: 'Диагностика', winRate: 45, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'maintenance', label: '3. ТО КИМ и калибровка', shortLabel: 'ТО КИМ', winRate: 75, color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
      { id: 'resolution', label: '4. Решение обращения / Продление техподдержки', shortLabel: 'Решение', winRate: 90, color: 'border-teal-200 bg-teal-50/50 text-teal-800' },
      { id: 'closed_won', label: '5. Выполнено / Подписано', shortLabel: 'Выполнено', winRate: 100, color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800', isWon: true },
      { id: 'lost', label: 'Архив / Отклонено', shortLabel: 'Архив', winRate: 0, color: 'border-rose-200 bg-rose-50/50 text-rose-800', isLost: true }
    ]
  }
];

export const DEFAULT_CRM_SETTINGS_SERVER: any = {
  defaultVatRate: 22,
  allowVatOverride: true,
  neighboringCountriesVatZero: true,
  exportVatRate: 0,
  exportZeroRateEnabled: true,
  autoDetectCountryRate: true,
  requireExportDocuments: false,
  showVatBreakdownInProposals: true,
  countryOverrides: [
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
  ],
  categoryOverrides: [
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
  ],
  updatedAt: new Date().toISOString()
};

function loadFunnelsFromDisk(): any[] {
  try {
    if (fs.existsSync(FUNNELS_FILE_PATH)) {
      const raw = fs.readFileSync(FUNNELS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load funnels from disk:', e);
  }
  return [...DEFAULT_CRM_FUNNELS_SERVER];
}

function saveFunnelsToDisk(data: any[]) {
  try {
    if (!fs.existsSync(CRM_DATA_DIR)) {
      fs.mkdirSync(CRM_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FUNNELS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save funnels to disk:', e);
  }
}

function loadCrmSettingsFromDisk(): any {
  try {
    if (fs.existsSync(CRM_SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(CRM_SETTINGS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.defaultVatRate === 'number') return parsed;
    }
  } catch (e) {
    console.error('Failed to load CRM settings from disk:', e);
  }
  return { ...DEFAULT_CRM_SETTINGS_SERVER };
}

function saveCrmSettingsToDisk(data: any) {
  try {
    if (!fs.existsSync(CRM_DATA_DIR)) {
      fs.mkdirSync(CRM_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CRM_SETTINGS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save CRM settings to disk:', e);
  }
}

let funnelsStore: any[] = loadFunnelsFromDisk();
let crmSettingsStore: any = loadCrmSettingsFromDisk();

let metrologyReportsStore: any[] = loadReportsFromDisk();
let companyFleetStore: any[] = loadFleetFromDisk();

let ticketsStore: any[] = [...INITIAL_SUPPORT_TICKETS];
let licensesStore: any[] = [...INITIAL_LICENSES];

export function registerCrmRoutes(app: Express, serviceRequestsStoreRef?: any[]) {
  // ==========================================
  // 0. ЭКСПРЕСС-ОБРАТНЫЙ ЗВОНОК С САЙТА (QUICK CALLBACK)
  // ==========================================
  app.post('/api/crm/quick-callback', validateBody('quickCallback'), async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const {
        customerName,
        phone,
        companyName,
        email,
        topic,
        preferredTime,
        comment
      } = req.body;

      if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
        logRealtimeEvent({
          category: 'ERROR',
          level: 'WARN',
          action: 'CALLBACK_VALIDATION_FAILED',
          summary: 'Отклонен заказ звонка: некорректное имя заказчика'
        });
        return res.status(400).json({ success: false, error: 'Пожалуйста, укажите ваше имя (не менее 2 символов).' });
      }

      const cleanPhone = String(phone || '').replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        logRealtimeEvent({
          category: 'ERROR',
          level: 'WARN',
          action: 'CALLBACK_VALIDATION_FAILED',
          summary: `Отклонен заказ звонка от "${customerName}": некорректный телефон (${phone})`
        });
        return res.status(400).json({ success: false, error: 'Пожалуйста, укажите корректный номер телефона (не менее 10 цифр).' });
      }

      const safeName = customerName.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
      const safePhone = String(phone).replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
      const safeCompany = companyName && typeof companyName === 'string' && companyName.trim()
        ? companyName.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim()
        : 'Частное лицо / Заказчик';
      const safeEmail = email && typeof email === 'string' && email.includes('@') ? email.trim() : '';
      const safeTopic = topic && typeof topic === 'string' ? topic.trim() : 'Консультация дежурного инженера';
      const safeTime = preferredTime && typeof preferredTime === 'string' ? preferredTime.trim() : 'В течение 10-15 минут (срочно)';
      const safeComment = comment && typeof comment === 'string' ? comment.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim() : '';

      const callId = `CALL-2026-${Math.floor(100 + Math.random() * 900)}`;
      const nowIso = new Date().toISOString();

      logRealtimeEvent({
        category: 'CRM_REQUEST',
        level: 'INFO',
        requestId: callId,
        action: 'INCOMING_QUICK_CALLBACK',
        summary: `Поступил заказ обратного звонка от ${safeName} (${safeCompany}), тел: ${safePhone}`,
        details: {
          callId,
          customerName: safeName,
          companyName: safeCompany,
          phone: safePhone,
          email: safeEmail,
          topic: safeTopic,
          preferredTime: safeTime,
          comment: safeComment
        }
      });

      // 1. Создаем RFQ / ServiceRequest
      const serviceRequestRecord = {
        id: callId,
        customerName: safeName,
        companyName: safeCompany,
        email: safeEmail || `call-${cleanPhone.slice(-6)}@ds-enginering.ru`,
        phone: safePhone,
        serviceType: 'callback',
        details: `[Срочный звонок] Тема: ${safeTopic}. Желаемое время: ${safeTime}.${safeComment ? ` Примечание: ${safeComment}` : ''}`,
        estimatedPrice: null,
        cadFormat: null,
        status: 'pending',
        metadata: {
          source: 'floating_callback_button',
          callId,
          preferredTime: safeTime,
          topic: safeTopic,
          requestedAt: nowIso
        },
        createdAt: nowIso,
        updatedAt: nowIso
      };

      if (serviceRequestsStoreRef) {
        serviceRequestsStoreRef.unshift(serviceRequestRecord);
      }

      if (isDbConfigured()) {
        try {
          await db.insert(schema.serviceRequests).values({
            id: callId,
            customerName: serviceRequestRecord.customerName,
            companyName: serviceRequestRecord.companyName,
            email: serviceRequestRecord.email,
            phone: serviceRequestRecord.phone,
            serviceType: 'callback',
            details: serviceRequestRecord.details,
            status: 'pending',
            metadata: serviceRequestRecord.metadata
          }).onConflictDoNothing();

          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'SUCCESS',
            requestId: callId,
            action: 'CALLBACK_SERVICE_REQ_DB_SAVED',
            summary: `Заявка обратного звонка ${callId} сохранена в PostgreSQL (service_requests)`,
            dbStatus: 'SAVED_POSTGRESQL'
          });
        } catch (dbErr: any) {
          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'WARN',
            requestId: callId,
            action: 'CALLBACK_DB_FALLBACK',
            summary: `Не удалось сохранить заявку в PostgreSQL: ${dbErr?.message}. Данные сохранены в памяти.`,
            dbStatus: 'DB_FALLBACK'
          });
        }
      }

      // 2. Создаем сделку в CRM воронке
      const dealId = `deal-call-${Date.now()}`;
      let targetFunnel = 'funnel-supply';
      const topicLower = safeTopic.toLowerCase();
      if (topicLower.includes('topsolid') || topicLower.includes('cam') || topicLower.includes('софт')) {
        targetFunnel = 'funnel-software';
      } else if (topicLower.includes('сервис') || topicLower.includes('поверк') || topicLower.includes('сканирован') || topicLower.includes('реверс')) {
        targetFunnel = 'funnel-services';
      }

      const newDeal: ExtendedDeal = {
        id: dealId,
        title: `Обратный звонок: ${safeName} (${safeTopic})`,
        customer: safeName,
        company: safeCompany,
        phone: safePhone,
        email: safeEmail,
        stage: 'lead',
        funnelId: targetFunnel,
        budget: 0,
        source: 'Обратный звонок (виджет)',
        priority: 'high',
        createdAt: nowIso,
        updatedAt: nowIso,
        items: [],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            type: 'stage_change',
            title: 'Поступил заказ обратного звонка',
            description: `Заявка через плавающую кнопку. Выбранное время: ${safeTime}. Тема: ${safeTopic}`,
            author: 'CRM Сервис сайта',
            date: nowIso
          }
        ]
      } as any;

      dealsStore.unshift(newDeal);
      if (isDbConfigured()) {
        try {
          await db.insert(schema.deals).values({
            ...newDeal,
            createdAt: new Date(),
            updatedAt: new Date()
          } as any).onConflictDoNothing();

          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'SUCCESS',
            requestId: callId,
            action: 'CALLBACK_DEAL_DB_SAVED',
            summary: `Сделка ${dealId} сохранена в воронке продаж CRM (PostgreSQL)`,
            dbStatus: 'SAVED_POSTGRESQL'
          });
        } catch (dbDealErr: any) {
          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'WARN',
            requestId: callId,
            action: 'CALLBACK_DEAL_DB_FALLBACK',
            summary: `Сделка ${dealId} сохранена в памяти (ошибка DB: ${dbDealErr?.message})`,
            dbStatus: 'DB_FALLBACK'
          });
        }
      }

      // 3. Создаем персональную задачу дежурному инженеру с чек-листом
      const taskId = `task-call-${Date.now()}`;
      const dueDateTime = safeTime.includes('10-15')
        ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
        : new Date(Date.now() + 60 * 60 * 1000).toISOString();

      const newTask: UserTask = {
        id: taskId,
        title: `📞 Перезвонить: ${safeName} (${safePhone})`,
        description: `Заказ обратного звонка с сайта.\n• Клиент: ${safeName}\n• Организация: ${safeCompany}\n• Телефон: ${safePhone}\n• Тема: ${safeTopic}\n• Время звонка: ${safeTime}\n• Примечание: ${safeComment || '—'}`,
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: new Date(dueDateTime).toTimeString().substring(0, 5),
        dueDateTime,
        priority: 'urgent',
        status: 'new',
        checklist: [
          { id: 'chk-1', text: `Набрать клиента по номеру ${safePhone}`, completed: false },
          { id: 'chk-2', text: `Уточнить детали задачи: ${safeTopic}`, completed: false },
          { id: 'chk-3', text: `Согласовать коммерческое предложение / выезд инженера`, completed: false }
        ],
        targetType: 'deal',
        targetId: dealId,
        targetTitle: `Обратный звонок: ${safeName}`,
        dealId,
        managerId: 'adm-01',
        managerName: 'Дежурный инженер «ДС-Инжиниринг»',
        reminder: 'at_due',
        reminderTriggered: false,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      tasksStore.unshift(newTask);
      if (isDbConfigured()) {
        try {
          await db.insert(schema.userTasks).values({
            ...newTask,
            checklist: newTask.checklist,
            dueDateTime: new Date(newTask.dueDateTime),
            createdAt: new Date(),
            updatedAt: new Date()
          } as any).onConflictDoNothing();
        } catch (dbTaskErr) {
          console.warn('DB insert task error:', dbTaskErr);
        }
      }

      // Dispatch real-time manager alerts (Telegram, Email, Webhook, In-Browser Pop-up)
      dispatchManagerNotification({
        type: 'callback',
        title: `📞 Обратный звонок: ${safeName}`,
        customerName: safeName,
        phone: safePhone,
        companyName: safeCompany,
        email: safeEmail,
        topic: safeTopic,
        preferredTime: safeTime,
        comment: safeComment,
        callId,
        dealId,
        taskId
      }).then(() => {
        logRealtimeEvent({
          category: 'NOTIFICATION',
          level: 'SUCCESS',
          requestId: callId,
          action: 'CALLBACK_ALERT_DISPATCHED',
          summary: `Уведомления о звонке ${callId} успешно отправлены дежурным инженерам`,
          durationMs: Date.now() - startTime
        });
      }).catch(err => {
        logRealtimeEvent({
          category: 'NOTIFICATION',
          level: 'WARN',
          requestId: callId,
          action: 'CALLBACK_ALERT_FAILED',
          summary: `Ошибка рассылки уведомления о звонке: ${err?.message || err}`
        });
      });

      res.status(201).json({
        success: true,
        callId,
        dealId,
        taskId,
        message: `Заявка на обратный звонок № ${callId} успешно зарегистрирована! Дежурный инженер свяжется с вами.`
      });
    } catch (e: any) {
      logRealtimeEvent({
        category: 'ERROR',
        level: 'ERROR',
        action: 'CALLBACK_FATAL_ERROR',
        summary: `Критический сбой обработки звонка: ${e?.message || e}`,
        durationMs: Date.now() - startTime
      });
      console.error('Error handling quick callback request:', e);
      res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера при оформлении звонка.' });
    }
  });
  // ==========================================
  // 1. ЗАДАЧИ МЕНЕДЖЕРА (USER TASKS)
  // ==========================================

  // GET /api/crm/tasks
  app.get('/api/crm/tasks', async (req: Request, res: Response) => {
    try {
      const { managerId, status, priority, targetType } = req.query;

      if (isDbConfigured()) {
        try {
          const conditions: any[] = [];
          if (managerId && typeof managerId === 'string') {
            conditions.push(eq(schema.userTasks.managerId, managerId));
          }
          if (status && typeof status === 'string') {
            conditions.push(eq(schema.userTasks.status, status));
          }
          if (priority && typeof priority === 'string') {
            conditions.push(eq(schema.userTasks.priority, priority));
          }
          if (targetType && typeof targetType === 'string') {
            conditions.push(eq(schema.userTasks.targetType, targetType));
          }

          const query = conditions.length > 0 ? and(...conditions) : undefined;
          const rows = await db
            .select()
            .from(schema.userTasks)
            .where(query)
            .orderBy(asc(schema.userTasks.dueDateTime));

          if (rows.length > 0) {
            const formatted: UserTask[] = rows.map((r: any) => ({
              ...r,
              checklist: (r.checklist as TaskChecklistItem[]) || [],
              dueDateTime: r.dueDateTime ? new Date(r.dueDateTime).toISOString() : new Date().toISOString(),
              createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
            }));
            return res.json({ success: true, data: formatted, count: formatted.length });
          }
        } catch (dbErr) {
          console.warn('PostgreSQL task query notice, falling back to memory store:', dbErr);
        }
      }

      // Memory filter
      let result = [...tasksStore];
      if (managerId && typeof managerId === 'string') {
        result = result.filter(t => t.managerId === managerId);
      }
      if (status && typeof status === 'string') {
        result = result.filter(t => t.status === status);
      }
      if (priority && typeof priority === 'string') {
        result = result.filter(t => t.priority === priority);
      }
      if (targetType && typeof targetType === 'string') {
        result = result.filter(t => t.targetType === targetType);
      }

      // Sort by dueDateTime asc
      result.sort((a, b) => new Date(a.dueDateTime).getTime() - new Date(b.dueDateTime).getTime());

      res.json({ success: true, data: result, count: result.length });
    } catch (err: any) {
      console.error('GET /api/crm/tasks error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // POST /api/crm/tasks
  app.post('/api/crm/tasks', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.title || !body.dueDate) {
        return res.status(400).json({ success: false, error: 'Название задачи и срок обязательны' });
      }

      const id = body.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const dueTime = body.dueTime || '18:00';
      const dueDateTime = body.dueDateTime || new Date(`${body.dueDate}T${dueTime}:00`).toISOString();

      const newTask: UserTask = {
        id,
        title: String(body.title).trim(),
        description: body.description ? String(body.description).trim() : '',
        dueDate: body.dueDate,
        dueTime,
        dueDateTime,
        priority: body.priority || 'medium',
        status: body.status || 'new',
        checklist: Array.isArray(body.checklist) ? body.checklist : [],
        targetType: body.targetType || 'personal',
        targetId: body.targetId || undefined,
        targetTitle: body.targetTitle || undefined,
        dealId: body.dealId || undefined,
        companyId: body.companyId || undefined,
        contactId: body.contactId || undefined,
        managerId: body.managerId || 'adm-01',
        managerName: body.managerName || 'Некрасов С.Ю.',
        reminder: body.reminder || '15_min_before',
        reminderTriggered: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isDbConfigured()) {
        try {
          await db.insert(schema.userTasks).values({
            id: newTask.id,
            title: newTask.title,
            description: newTask.description,
            dueDate: newTask.dueDate,
            dueTime: newTask.dueTime,
            dueDateTime: new Date(newTask.dueDateTime),
            priority: newTask.priority,
            status: newTask.status,
            checklist: newTask.checklist,
            targetType: newTask.targetType,
            targetId: newTask.targetId,
            targetTitle: newTask.targetTitle,
            dealId: newTask.dealId,
            companyId: newTask.companyId,
            contactId: newTask.contactId,
            managerId: newTask.managerId,
            managerName: newTask.managerName,
            reminder: newTask.reminder,
            reminderTriggered: false,
          });
        } catch (dbErr) {
          console.warn('PostgreSQL task insert notice:', dbErr);
        }
      }

      tasksStore.unshift(newTask);
      res.status(201).json({ success: true, data: newTask, message: 'Задача успешно создана' });
    } catch (err: any) {
      console.error('POST /api/crm/tasks error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // Handler for updating a task (supports both PUT and PATCH)
  const handleUpdateTask = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      let idx = tasksStore.findIndex(t => t.id === id);
      if (idx === -1) {
        // If not found in memory store, create if minimal data exists or return 404
        if (updates.title) {
          const newTask: UserTask = {
            id,
            title: String(updates.title).trim(),
            description: updates.description ? String(updates.description).trim() : '',
            dueDate: updates.dueDate || new Date().toISOString().split('T')[0],
            dueTime: updates.dueTime || '18:00',
            dueDateTime: updates.dueDateTime || new Date().toISOString(),
            priority: updates.priority || 'medium',
            status: updates.status || 'new',
            checklist: Array.isArray(updates.checklist) ? updates.checklist : [],
            targetType: updates.targetType || 'personal',
            targetId: updates.targetId,
            targetTitle: updates.targetTitle,
            dealId: updates.dealId,
            companyId: updates.companyId,
            contactId: updates.contactId,
            managerId: updates.managerId || 'adm-01',
            managerName: updates.managerName || 'Некрасов С.Ю.',
            reminder: updates.reminder || '15_min_before',
            reminderTriggered: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          tasksStore.unshift(newTask);
          return res.json({ success: true, data: newTask, message: 'Задача сохранена' });
        }
        return res.status(404).json({ success: false, error: 'Задача не найдена' });
      }

      const existing = tasksStore[idx];
      const updated: UserTask = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (updates.dueDate || updates.dueTime) {
        const dueDate = updates.dueDate || existing.dueDate;
        const dueTime = updates.dueTime || existing.dueTime;
        updated.dueDate = dueDate;
        updated.dueTime = dueTime;
        updated.dueDateTime = new Date(`${dueDate}T${dueTime}:00`).toISOString();
      }

      tasksStore[idx] = updated;

      if (isDbConfigured()) {
        try {
          await db
            .update(schema.userTasks)
            .set({
              title: updated.title,
              description: updated.description,
              dueDate: updated.dueDate,
              dueTime: updated.dueTime,
              dueDateTime: new Date(updated.dueDateTime),
              priority: updated.priority,
              status: updated.status,
              checklist: updated.checklist,
              targetType: updated.targetType,
              targetId: updated.targetId,
              targetTitle: updated.targetTitle,
              dealId: updated.dealId,
              companyId: updated.companyId,
              contactId: updated.contactId,
              reminder: updated.reminder,
              reminderTriggered: updated.reminderTriggered,
              updatedAt: new Date(),
            })
            .where(eq(schema.userTasks.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL task update notice:', dbErr);
        }
      }

      res.json({ success: true, data: updated, message: 'Задача успешно сохранена' });
    } catch (err: any) {
      console.error('Update /api/crm/tasks/:id error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  };

  // PUT /api/crm/tasks/:id
  app.put('/api/crm/tasks/:id', handleUpdateTask);

  // PATCH /api/crm/tasks/:id
  app.patch('/api/crm/tasks/:id', handleUpdateTask);

  // PATCH /api/crm/tasks/:id/checklist
  app.patch('/api/crm/tasks/:id/checklist', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { itemId, completed } = req.body;

      const task = tasksStore.find(t => t.id === id);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Задача не найдена' });
      }

      const item = task.checklist.find(i => i.id === itemId);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Пункт чек-листа не найден' });
      }

      item.completed = Boolean(completed);
      task.updatedAt = new Date().toISOString();

      // Check if all subtasks are completed, if so optionally prompt or update
      const allDone = task.checklist.length > 0 && task.checklist.every(i => i.completed);

      if (isDbConfigured()) {
        try {
          await db
            .update(schema.userTasks)
            .set({
              checklist: task.checklist,
              updatedAt: new Date(),
            })
            .where(eq(schema.userTasks.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL checklist update notice:', dbErr);
        }
      }

      res.json({ 
        success: true, 
        data: task, 
        allDone,
        message: 'Пункт чек-листа обновлен' 
      });
    } catch (err: any) {
      console.error('PATCH /api/crm/tasks/:id/checklist error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // DELETE /api/crm/tasks/:id
  app.delete('/api/crm/tasks/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      tasksStore = tasksStore.filter(t => t.id !== id);

      if (isDbConfigured()) {
        try {
          await db.delete(schema.userTasks).where(eq(schema.userTasks.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL task delete notice:', dbErr);
        }
      }

      res.json({ success: true, message: 'Задача удалена' });
    } catch (err: any) {
      console.error('DELETE /api/crm/tasks/:id error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // POST /api/crm/tasks/bulk
  app.post('/api/crm/tasks/bulk', async (req: Request, res: Response) => {
    try {
      const { tasks } = req.body;
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ success: false, error: 'Массив задач пуст' });
      }

      const created: UserTask[] = [];
      for (const t of tasks) {
        const id = t.id || `task-bulk-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const dueTime = t.dueTime || '18:00';
        const dueDateTime = t.dueDateTime || new Date(`${t.dueDate}T${dueTime}:00`).toISOString();

        const taskItem: UserTask = {
          id,
          title: t.title,
          description: t.description || '',
          dueDate: t.dueDate,
          dueTime,
          dueDateTime,
          priority: t.priority || 'medium',
          status: t.status || 'new',
          checklist: Array.isArray(t.checklist) ? t.checklist : [],
          targetType: t.targetType || 'company',
          targetId: t.targetId,
          targetTitle: t.targetTitle,
          companyId: t.companyId,
          contactId: t.contactId,
          dealId: t.dealId,
          managerId: t.managerId || 'adm-01',
          managerName: t.managerName || 'Некрасов С.Ю.',
          reminder: t.reminder || '1_hour_before',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        tasksStore.unshift(taskItem);
        created.push(taskItem);

        if (isDbConfigured()) {
          try {
            await db.insert(schema.userTasks).values({
              id: taskItem.id,
              title: taskItem.title,
              description: taskItem.description,
              dueDate: taskItem.dueDate,
              dueTime: taskItem.dueTime,
              dueDateTime: new Date(taskItem.dueDateTime),
              priority: taskItem.priority,
              status: taskItem.status,
              checklist: taskItem.checklist,
              targetType: taskItem.targetType,
              targetId: taskItem.targetId,
              targetTitle: taskItem.targetTitle,
              dealId: taskItem.dealId,
              companyId: taskItem.companyId,
              contactId: taskItem.contactId,
              managerId: taskItem.managerId,
              managerName: taskItem.managerName,
              reminder: taskItem.reminder,
              reminderTriggered: taskItem.reminderTriggered,
            });
          } catch (e) {
            // continue
          }
        }
      }

      res.json({ success: true, count: created.length, data: created, message: `Создано ${created.length} задач` });
    } catch (err: any) {
      console.error('POST /api/crm/tasks/bulk error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // ==========================================
  // 2. КАЛЕНДАРЬ СОБЫТИЙ (CALENDAR EVENTS)
  // ==========================================

  // GET /api/crm/calendar/events
  app.get('/api/crm/calendar/events', async (req: Request, res: Response) => {
    try {
      const { type, managerId } = req.query;

      if (isDbConfigured()) {
        try {
          const rows = await db.select().from(schema.calendarEvents).orderBy(asc(schema.calendarEvents.startDateTime));
          if (rows.length > 0) {
            const formatted: CalendarEvent[] = rows.map((r: any) => ({
              ...r,
              startDateTime: r.startDateTime ? new Date(r.startDateTime).toISOString() : new Date().toISOString(),
              endDateTime: r.endDateTime ? new Date(r.endDateTime).toISOString() : new Date().toISOString(),
              createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
            }));
            return res.json({ success: true, data: formatted, count: formatted.length });
          }
        } catch (dbErr) {
          console.warn('PostgreSQL calendar query notice:', dbErr);
        }
      }

      let result = [...calendarEventsStore];
      if (type && typeof type === 'string') {
        result = result.filter(e => e.type === type);
      }
      if (managerId && typeof managerId === 'string') {
        result = result.filter(e => e.managerId === managerId);
      }

      result.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
      res.json({ success: true, data: result, count: result.length });
    } catch (err: any) {
      console.error('GET /api/crm/calendar/events error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // POST /api/crm/calendar/events
  app.post('/api/crm/calendar/events', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.title || !body.startDateTime || !body.endDateTime) {
        return res.status(400).json({ success: false, error: 'Название, начало и окончание события обязательны' });
      }

      const id = body.id || `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newEvent: CalendarEvent = {
        id,
        title: String(body.title).trim(),
        description: body.description ? String(body.description).trim() : '',
        type: body.type || 'meeting',
        startDateTime: body.startDateTime,
        endDateTime: body.endDateTime,
        location: body.location || '',
        companyId: body.companyId || undefined,
        companyName: body.companyName || undefined,
        contactId: body.contactId || undefined,
        contactName: body.contactName || undefined,
        dealId: body.dealId || undefined,
        dealTitle: body.dealTitle || undefined,
        managerId: body.managerId || 'adm-01',
        managerName: body.managerName || 'Некрасов С.Ю.',
        status: body.status || 'scheduled',
        color: body.color || 'blue',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isDbConfigured()) {
        try {
          await db.insert(schema.calendarEvents).values({
            id: newEvent.id,
            title: newEvent.title,
            description: newEvent.description,
            type: newEvent.type,
            startDateTime: new Date(newEvent.startDateTime),
            endDateTime: new Date(newEvent.endDateTime),
            location: newEvent.location,
            companyId: newEvent.companyId,
            companyName: newEvent.companyName,
            contactId: newEvent.contactId,
            contactName: newEvent.contactName,
            dealId: newEvent.dealId,
            dealTitle: newEvent.dealTitle,
            managerId: newEvent.managerId,
            managerName: newEvent.managerName,
            status: newEvent.status,
            color: newEvent.color,
          });
        } catch (dbErr) {
          console.warn('PostgreSQL event insert notice:', dbErr);
        }
      }

      calendarEventsStore.push(newEvent);
      res.status(201).json({ success: true, data: newEvent, message: 'Событие календаря создано' });
    } catch (err: any) {
      console.error('POST /api/crm/calendar/events error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // PATCH /api/crm/calendar/events/:id
  app.patch('/api/crm/calendar/events/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const idx = calendarEventsStore.findIndex(e => e.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Событие календаря не найдено' });
      }

      const updated: CalendarEvent = {
        ...calendarEventsStore[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      calendarEventsStore[idx] = updated;

      if (isDbConfigured()) {
        try {
          await db
            .update(schema.calendarEvents)
            .set({
              title: updated.title,
              description: updated.description,
              type: updated.type,
              startDateTime: new Date(updated.startDateTime),
              endDateTime: new Date(updated.endDateTime),
              location: updated.location,
              companyId: updated.companyId,
              companyName: updated.companyName,
              contactId: updated.contactId,
              contactName: updated.contactName,
              dealId: updated.dealId,
              dealTitle: updated.dealTitle,
              status: updated.status,
              color: updated.color,
              updatedAt: new Date(),
            })
            .where(eq(schema.calendarEvents.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL event update notice:', dbErr);
        }
      }

      res.json({ success: true, data: updated, message: 'Событие обновлено' });
    } catch (err: any) {
      console.error('PATCH /api/crm/calendar/events/:id error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // DELETE /api/crm/calendar/events/:id
  app.delete('/api/crm/calendar/events/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      calendarEventsStore = calendarEventsStore.filter(e => e.id !== id);

      if (isDbConfigured()) {
        try {
          await db.delete(schema.calendarEvents).where(eq(schema.calendarEvents.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL event delete notice:', dbErr);
        }
      }

      res.json({ success: true, message: 'Событие календаря удалено' });
    } catch (err: any) {
      console.error('DELETE /api/crm/calendar/events/:id error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // ==========================================
  // 3. КОМПАНИИ КОНТРАГЕНТЫ (COMPANIES)
  // ==========================================

  // GET /api/crm/companies
  app.get('/api/crm/companies', async (req: Request, res: Response) => {
    try {
      const { search, industry, city, status } = req.query;

      if (isDbConfigured()) {
        try {
          const rows = await db.select().from(schema.companies).orderBy(asc(schema.companies.name));
          if (rows.length > 0) {
            const formatted: CrmCompany[] = rows.map((r: any) => ({
              ...r,
              assignedEquipment: r.assignedEquipment || [],
              createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
            }));
            return res.json({ success: true, data: formatted, count: formatted.length });
          }
        } catch (dbErr) {
          console.warn('PostgreSQL companies query notice:', dbErr);
        }
      }

      let result = [...companiesStore];
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        result = result.filter(c => 
          c.name.toLowerCase().includes(q) || 
          c.inn.includes(q) || 
          (c.city && c.city.toLowerCase().includes(q))
        );
      }
      if (industry && typeof industry === 'string') {
        result = result.filter(c => c.industry === industry);
      }
      if (city && typeof city === 'string') {
        result = result.filter(c => c.city === city);
      }
      if (status && typeof status === 'string') {
        result = result.filter(c => c.status === status);
      }

      res.json({ success: true, data: result, count: result.length });
    } catch (err: any) {
      console.error('GET /api/crm/companies error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // POST /api/crm/companies
  app.post('/api/crm/companies', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.name || !body.inn) {
        return res.status(400).json({ success: false, error: 'Название компании и ИНН обязательны' });
      }

      const id = body.id || `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newCompany: CrmCompany = {
        id,
        name: String(body.name).trim(),
        inn: String(body.inn).trim(),
        kpp: body.kpp ? String(body.kpp).trim() : '',
        industry: body.industry || 'Машиностроение',
        city: body.city || 'Самара',
        address: body.address || '',
        status: body.status || 'active',
        assignedEquipment: Array.isArray(body.assignedEquipment) ? body.assignedEquipment : [],
        phone: body.phone || '',
        email: body.email || '',
        contactPerson: body.contactPerson || '',
        notes: body.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isDbConfigured()) {
        try {
          await db.insert(schema.companies).values({
            ...newCompany,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } catch (dbErr) {
          console.warn('PostgreSQL company insert notice:', dbErr);
        }
      }

      companiesStore.unshift(newCompany);
      res.status(201).json({ success: true, data: newCompany, message: 'Компания успешно добавлена' });
    } catch (err: any) {
      console.error('POST /api/crm/companies error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // PATCH /api/crm/companies/:id
  app.patch('/api/crm/companies/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const idx = companiesStore.findIndex(c => c.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Компания не найдена' });
      }

      const updated: CrmCompany = {
        ...companiesStore[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      companiesStore[idx] = updated;

      if (isDbConfigured()) {
        try {
          await db
            .update(schema.companies)
            .set({
              name: updated.name,
              inn: updated.inn,
              kpp: updated.kpp,
              industry: updated.industry,
              city: updated.city,
              address: updated.address,
              status: updated.status,
              assignedEquipment: updated.assignedEquipment,
              phone: updated.phone,
              email: updated.email,
              contactPerson: updated.contactPerson,
              notes: updated.notes,
              updatedAt: new Date(),
            })
            .where(eq(schema.companies.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL company update notice:', dbErr);
        }
      }

      res.json({ success: true, data: updated, message: 'Данные компании обновлены' });
    } catch (err: any) {
      console.error('PATCH /api/crm/companies/:id error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // DELETE /api/crm/companies/:id
  app.delete('/api/crm/companies/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      companiesStore = companiesStore.filter(c => c.id !== id);

      if (isDbConfigured()) {
        try {
          await db.delete(schema.companies).where(eq(schema.companies.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL company delete notice:', dbErr);
        }
      }

      res.json({ success: true, message: 'Компания удалена' });
    } catch (err: any) {
      console.error('DELETE /api/crm/companies/:id error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // ==========================================
  // 4. КОНТАКТНЫЕ ЛИЦА (CONTACTS)
  // ==========================================

  // GET /api/crm/contacts
  app.get('/api/crm/contacts', async (req: Request, res: Response) => {
    try {
      const { companyId, search, isDecisionMaker } = req.query;

      if (isDbConfigured()) {
        try {
          const rows = await db.select().from(schema.contacts).orderBy(asc(schema.contacts.fullName));
          if (rows.length > 0) {
            const formatted: CrmContact[] = rows.map((r: any) => ({
              ...r,
              interactionHistory: r.interactionHistory || [],
              createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
            }));
            return res.json({ success: true, data: formatted, count: formatted.length });
          }
        } catch (dbErr) {
          console.warn('PostgreSQL contacts query notice:', dbErr);
        }
      }

      let result = [...contactsStore];
      if (companyId && typeof companyId === 'string') {
        result = result.filter(c => c.companyId === companyId);
      }
      if (isDecisionMaker !== undefined) {
        const isLpr = String(isDecisionMaker) === 'true';
        result = result.filter(c => c.isDecisionMaker === isLpr);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        result = result.filter(c => 
          c.fullName.toLowerCase().includes(q) || 
          c.companyName.toLowerCase().includes(q) || 
          c.position.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        );
      }

      res.json({ success: true, data: result, count: result.length });
    } catch (err: any) {
      console.error('GET /api/crm/contacts error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // POST /api/crm/contacts
  app.post('/api/crm/contacts', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.fullName || !body.companyName) {
        return res.status(400).json({ success: false, error: 'ФИО контакта и компания обязательны' });
      }

      const id = body.id || `cont-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newContact: CrmContact = {
        id,
        companyId: body.companyId || undefined,
        companyName: String(body.companyName).trim(),
        fullName: String(body.fullName).trim(),
        position: body.position || 'Специалист',
        department: body.department || '',
        workPhone: body.workPhone || '',
        mobilePhone: body.mobilePhone || '',
        email: body.email || '',
        isDecisionMaker: Boolean(body.isDecisionMaker),
        notes: body.notes || '',
        interactionHistory: Array.isArray(body.interactionHistory) ? body.interactionHistory : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isDbConfigured()) {
        try {
          await db.insert(schema.contacts).values({
            ...newContact,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } catch (dbErr) {
          console.warn('PostgreSQL contact insert notice:', dbErr);
        }
      }

      contactsStore.unshift(newContact);
      res.status(201).json({ success: true, data: newContact, message: 'Контакт успешно добавлен' });
    } catch (err: any) {
      console.error('POST /api/crm/contacts error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // PATCH /api/crm/contacts/:id
  app.patch('/api/crm/contacts/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const idx = contactsStore.findIndex(c => c.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Контакт не найден' });
      }

      const updated: CrmContact = {
        ...contactsStore[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      contactsStore[idx] = updated;

      if (isDbConfigured()) {
        try {
          await db
            .update(schema.contacts)
            .set({
              companyId: updated.companyId,
              companyName: updated.companyName,
              fullName: updated.fullName,
              position: updated.position,
              department: updated.department,
              workPhone: updated.workPhone,
              mobilePhone: updated.mobilePhone,
              email: updated.email,
              isDecisionMaker: updated.isDecisionMaker,
              notes: updated.notes,
              interactionHistory: updated.interactionHistory,
              updatedAt: new Date(),
            })
            .where(eq(schema.contacts.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL contact update notice:', dbErr);
        }
      }

      res.json({ success: true, data: updated, message: 'Контакт обновлен' });
    } catch (err: any) {
      console.error('PATCH /api/crm/contacts/:id error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // POST /api/crm/contacts/:id/interactions
  app.post('/api/crm/contacts/:id/interactions', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { type, comment, author } = req.body;

      const contact = contactsStore.find(c => c.id === id);
      if (!contact) {
        return res.status(404).json({ success: false, error: 'Контакт не найден' });
      }

      const newInteraction = {
        id: `h-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: type || 'call',
        comment: comment || 'Взаимодействие зафиксировано',
        author: author || 'Некрасов С.Ю.',
      };

      contact.interactionHistory.unshift(newInteraction);
      contact.updatedAt = new Date().toISOString();

      if (isDbConfigured()) {
        try {
          await db
            .update(schema.contacts)
            .set({
              interactionHistory: contact.interactionHistory,
              updatedAt: new Date(),
            })
            .where(eq(schema.contacts.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL interaction update notice:', dbErr);
        }
      }

      res.status(201).json({ success: true, data: newInteraction, contact, message: 'Взаимодействие сохранено' });
    } catch (err: any) {
      console.error('POST /api/crm/contacts/:id/interactions error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // DELETE /api/crm/contacts/:id
  app.delete('/api/crm/contacts/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      contactsStore = contactsStore.filter(c => c.id !== id);

      if (isDbConfigured()) {
        try {
          await db.delete(schema.contacts).where(eq(schema.contacts.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL contact delete notice:', dbErr);
        }
      }

      res.json({ success: true, message: 'Контакт удален' });
    } catch (err: any) {
      console.error('DELETE /api/crm/contacts/:id error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // ==========================================
  // 5. СЕГМЕНТИРОВАННЫЕ СПИСКИ КЛИЕНТОВ (CLIENT LISTS)
  // ==========================================

  // GET /api/crm/client-lists
  app.get('/api/crm/client-lists', async (_req: Request, res: Response) => {
    try {
      if (isDbConfigured()) {
        try {
          const rows = await db.select().from(schema.clientLists).orderBy(desc(schema.clientLists.createdAt));
          if (rows.length > 0) {
            const formatted: ClientSegmentList[] = rows.map((r: any) => ({
              ...r,
              filters: r.filters || {},
              companyIds: (r.companyIds as string[]) || [],
              createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
            }));
            return res.json({ success: true, data: formatted });
          }
        } catch (dbErr) {
          console.warn('PostgreSQL client lists query notice:', dbErr);
        }
      }

      res.json({ success: true, data: clientListsStore });
    } catch (err: any) {
      console.error('GET /api/crm/client-lists error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // POST /api/crm/client-lists
  app.post('/api/crm/client-lists', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.name) {
        return res.status(400).json({ success: false, error: 'Название списка обязательно' });
      }

      const id = body.id || `list-${Date.now()}`;
      const newList: ClientSegmentList = {
        id,
        name: String(body.name).trim(),
        description: body.description || '',
        filters: body.filters || {},
        companyIds: Array.isArray(body.companyIds) ? body.companyIds : [],
        createdBy: body.createdBy || 'Некрасов С.Ю.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isDbConfigured()) {
        try {
          await db.insert(schema.clientLists).values({
            ...newList,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } catch (dbErr) {
          console.warn('PostgreSQL client list insert notice:', dbErr);
        }
      }

      clientListsStore.unshift(newList);
      res.status(201).json({ success: true, data: newList, message: 'Список сегментации сохранен' });
    } catch (err: any) {
      console.error('POST /api/crm/client-lists error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // PATCH /api/crm/client-lists/:id
  app.patch('/api/crm/client-lists/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const idx = clientListsStore.findIndex(l => l.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Список не найден' });
      }

      const updated: ClientSegmentList = {
        ...clientListsStore[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      clientListsStore[idx] = updated;

      if (isDbConfigured()) {
        try {
          await db
            .update(schema.clientLists)
            .set({
              name: updated.name,
              description: updated.description,
              filters: updated.filters,
              companyIds: updated.companyIds,
              updatedAt: new Date(),
            })
            .where(eq(schema.clientLists.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL client list update notice:', dbErr);
        }
      }

      res.json({ success: true, data: updated, message: 'Список обновлен' });
    } catch (err: any) {
      console.error('PATCH /api/crm/client-lists/:id error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // DELETE /api/crm/client-lists/:id
  app.delete('/api/crm/client-lists/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      clientListsStore = clientListsStore.filter(l => l.id !== id);

      if (isDbConfigured()) {
        try {
          await db.delete(schema.clientLists).where(eq(schema.clientLists.id, id));
        } catch (dbErr) {
          console.warn('PostgreSQL client list delete notice:', dbErr);
        }
      }

      res.json({ success: true, message: 'Список удален' });
    } catch (err: any) {
      console.error('DELETE /api/crm/client-lists/:id error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // POST /api/crm/client-lists/:id/bulk-task (Массовое создание типовой задачи по списку компаний)
  app.post('/api/crm/client-lists/:id/bulk-task', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { taskTemplate } = req.body;

      if (!taskTemplate || !taskTemplate.title || !taskTemplate.dueDate) {
        return res.status(400).json({ success: false, error: 'Шаблон задачи должен содержать название и срок' });
      }

      const list = clientListsStore.find(l => l.id === id);
      if (!list) {
        return res.status(404).json({ success: false, error: 'Сегмент компаний не найден' });
      }

      const targetCompanies = companiesStore.filter(c => list.companyIds.includes(c.id));
      if (targetCompanies.length === 0) {
        return res.status(400).json({ success: false, error: 'В выбранном списке нет компаний' });
      }

      const createdTasks: UserTask[] = [];
      for (const comp of targetCompanies) {
        const taskId = `task-bulk-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const dueTime = taskTemplate.dueTime || '18:00';
        const dueDateTime = new Date(`${taskTemplate.dueDate}T${dueTime}:00`).toISOString();

        const newTask: UserTask = {
          id: taskId,
          title: `${taskTemplate.title}: ${comp.name}`,
          description: taskTemplate.description || `Массовая кампания по сегменту «${list.name}».`,
          dueDate: taskTemplate.dueDate,
          dueTime,
          dueDateTime,
          priority: taskTemplate.priority || 'medium',
          status: 'new',
          checklist: Array.isArray(taskTemplate.checklist) 
            ? taskTemplate.checklist.map((c: any, i: number) => ({ id: `sub-${i + 1}`, text: typeof c === 'string' ? c : c.text, completed: false }))
            : [
                { id: 'sub-1', text: `Связаться с ответственным лицом (${comp.contactPerson || 'секретариат'})`, completed: false },
                { id: 'sub-2', text: 'Направить коммерческое предложение / уведомить об акции', completed: false },
                { id: 'sub-3', text: 'Зафиксировать результат звонка в CRM', completed: false },
              ],
          targetType: 'company',
          targetId: comp.id,
          targetTitle: comp.name,
          companyId: comp.id,
          managerId: taskTemplate.managerId || 'adm-01',
          managerName: taskTemplate.managerName || 'Некрасов С.Ю.',
          reminder: taskTemplate.reminder || '1_hour_before',
          reminderTriggered: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        tasksStore.unshift(newTask);
        createdTasks.push(newTask);

        if (isDbConfigured()) {
          try {
            await db.insert(schema.userTasks).values({
              id: newTask.id,
              title: newTask.title,
              description: newTask.description,
              dueDate: newTask.dueDate,
              dueTime: newTask.dueTime,
              dueDateTime: new Date(newTask.dueDateTime),
              priority: newTask.priority,
              status: newTask.status,
              checklist: newTask.checklist,
              targetType: newTask.targetType,
              targetId: newTask.targetId,
              targetTitle: newTask.targetTitle,
              dealId: newTask.dealId,
              companyId: newTask.companyId,
              contactId: newTask.contactId,
              managerId: newTask.managerId,
              managerName: newTask.managerName,
              reminder: newTask.reminder,
              reminderTriggered: newTask.reminderTriggered,
            });
          } catch (e) {
            // continue
          }
        }
      }

      res.json({
        success: true,
        count: createdTasks.length,
        message: `Успешно поставлена типовая задача «${taskTemplate.title}» для ${createdTasks.length} предприятий сегмента «${list.name}»!`,
        data: createdTasks,
      });
    } catch (err: any) {
      console.error('POST /api/crm/client-lists/:id/bulk-task error:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // ==========================================
  // DEALS
  // ==========================================
  app.get('/api/crm/deals', async (_req, res) => {
    try {
      if (isDbConfigured()) {
        const data = await db.select().from(schema.deals).orderBy(desc(schema.deals.createdAt));
        if (data && data.length > 0) {
          dealsStore = data as any[];
        }
      }
      const seenDealIds = new Set<string>();
      const uniqueDeals = dealsStore.filter((d: any) => {
        if (!d?.id || seenDealIds.has(d.id)) return false;
        seenDealIds.add(d.id);
        return true;
      });
      res.json({ success: true, data: uniqueDeals });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post(
    '/api/crm/deals',
    (req, _res, next) => {
      if (req.body && typeof req.body === 'object') {
        const b = req.body;
        const derivedTitle = b.title || b.serviceType || (b.companyName ? `Сделка: ${b.companyName}` : 'Инжиниринговый проект');
        b.title = derivedTitle;
        b.serviceType = b.serviceType || derivedTitle;
        if (!b.companyName) {
          b.companyName = b.customerCompany || 'ООО «Заказчик»';
        }
      }
      next();
    },
    validateBody('crmDeal'),
    async (req, res) => {
    try {
      const deal = req.body;
      const existingIdx = dealsStore.findIndex(d => d.id === deal.id);
      if (existingIdx >= 0) {
        dealsStore[existingIdx] = { ...dealsStore[existingIdx], ...deal };
      } else {
        dealsStore.unshift(deal);
      }
      if (isDbConfigured()) {
        await db.insert(schema.deals).values({
          ...deal,
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }
      res.status(201).json({ success: true, data: deal });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/deals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = dealsStore.findIndex(d => d.id === id);
      if (idx !== -1) dealsStore[idx] = { ...dealsStore[idx], ...updates, updatedAt: new Date().toISOString() };
      if (isDbConfigured()) {
        await db.update(schema.deals).set({ ...updates, updatedAt: new Date() }).where(eq(schema.deals.id, id));
      }
      res.json({ success: true, data: dealsStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/deals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      dealsStore = dealsStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.deals).where(eq(schema.deals.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  
  // ==========================================
  // CRM FUNNELS & STAGES (Dynamic stages management)
  // ==========================================
  app.get('/api/crm/funnels', async (_req, res) => {
    try {
      if (isDbConfigured()) {
        const funnels = await db.select().from(schema.crmFunnels).orderBy(asc(schema.crmFunnels.createdAt));
        const stages = await db.select().from(schema.crmFunnelStages).orderBy(asc(schema.crmFunnelStages.orderIndex));
        
        if (funnels.length > 0) {
          const result = funnels.map(f => ({
            ...f,
            stages: stages.filter(s => s.funnelId === f.id)
          }));
          return res.json({ success: true, data: result });
        }
      }
      // Return disk store / defaults
      res.json({ success: true, data: funnelsStore });
    } catch (e) {
      console.error('Failed to get funnels', e);
      res.json({ success: true, data: funnelsStore });
    }
  });

  app.post('/api/crm/funnels', async (req, res) => {
    try {
      const { id, name, description, accentColor, icon, stages } = req.body;
      if (!id || !name) {
        return res.status(400).json({ success: false, error: 'ID and Name are required' });
      }

      // Update in DB if configured
      if (isDbConfigured()) {
        try {
          const existing = await db.select().from(schema.crmFunnels).where(eq(schema.crmFunnels.id, id));
          if (existing.length > 0) {
            await db.update(schema.crmFunnels)
              .set({ name, description, accentColor, icon, updatedAt: new Date() })
              .where(eq(schema.crmFunnels.id, id));
          } else {
            await db.insert(schema.crmFunnels).values({ id, name, description, accentColor, icon });
          }

          // Replace stages for this funnel
          await db.delete(schema.crmFunnelStages).where(eq(schema.crmFunnelStages.funnelId, id));

          if (stages && stages.length > 0) {
            const stageValues = stages.map((s: any, idx: number) => ({
              id: s.id || `${id}_stage_${idx}`,
              funnelId: id,
              label: s.label || `Этап ${idx + 1}`,
              shortLabel: s.shortLabel || s.label || `Э${idx + 1}`,
              winRate: typeof s.winRate === 'number' ? s.winRate : 50,
              color: s.color || 'border-blue-200 bg-blue-50/50 text-blue-800',
              isWon: Boolean(s.isWon),
              isLost: Boolean(s.isLost),
              orderIndex: idx
            }));
            await db.insert(schema.crmFunnelStages).values(stageValues);
          }
        } catch (dbErr) {
          console.warn('DB update for funnel warning, persisting to disk fallback:', dbErr);
        }
      }

      // Update memory store and disk
      const existingIdx = funnelsStore.findIndex(f => f.id === id);
      const funnelData = {
        id,
        name,
        description: description || '',
        accentColor: accentColor || 'blue',
        icon: icon || 'Workflow',
        stages: stages || []
      };

      if (existingIdx >= 0) {
        funnelsStore[existingIdx] = funnelData;
      } else {
        funnelsStore.push(funnelData);
      }
      saveFunnelsToDisk(funnelsStore);

      res.status(200).json({ success: true, data: funnelData });
    } catch (e) {
      console.error('Failed to save funnel', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  app.post('/api/crm/funnels/reset', async (_req, res) => {
    try {
      funnelsStore = JSON.parse(JSON.stringify(DEFAULT_CRM_FUNNELS_SERVER));
      saveFunnelsToDisk(funnelsStore);

      if (isDbConfigured()) {
        try {
          await db.delete(schema.crmFunnelStages);
          await db.delete(schema.crmFunnels);

          for (const funnel of funnelsStore) {
            await db.insert(schema.crmFunnels).values({
              id: funnel.id,
              name: funnel.name,
              description: funnel.description,
              accentColor: funnel.accentColor,
              icon: funnel.icon
            });

            if (funnel.stages && funnel.stages.length > 0) {
              const stageValues = funnel.stages.map((s: any, idx: number) => ({
                id: s.id,
                funnelId: funnel.id,
                label: s.label,
                shortLabel: s.shortLabel,
                winRate: s.winRate,
                color: s.color,
                isWon: s.isWon || false,
                isLost: s.isLost || false,
                orderIndex: idx
              }));
              await db.insert(schema.crmFunnelStages).values(stageValues);
            }
          }
        } catch (dbErr) {
          console.warn('DB reset funnels warning:', dbErr);
        }
      }

      res.json({ success: true, data: funnelsStore });
    } catch (e) {
      console.error('Failed to reset funnels', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // ==========================================
  // CRM GLOBAL SETTINGS (VAT, Taxes & Organization)
  // ==========================================
  app.get('/api/crm/settings', async (_req, res) => {
    try {
      res.json({ success: true, data: crmSettingsStore });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  app.post('/api/crm/settings', async (req, res) => {
    try {
      const updates = req.body;
      crmSettingsStore = {
        ...crmSettingsStore,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveCrmSettingsToDisk(crmSettingsStore);
      res.json({ success: true, data: crmSettingsStore });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // ==========================================
  // PROPOSALS
  // ==========================================
  app.get('/api/crm/proposals', async (_req, res) => {
    try {
      if (isDbConfigured()) {
        const data = await db.select().from(schema.proposals).orderBy(desc(schema.proposals.createdAt));
        if (data && data.length > 0) {
          proposalsStore = data as any[];
        }
      }
      res.json({ success: true, data: proposalsStore });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post(
    '/api/crm/proposals',
    (req, _res, next) => {
      if (req.body && typeof req.body === 'object') {
        const b = req.body;
        b.number = b.number || b.outgoingNumber || `КП-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        b.title = b.title || b.content || 'Коммерческое предложение';
        b.customerCompany = b.customerCompany || b.toCompany || 'Заказчик';
      }
      next();
    },
    validateBody('crmProposal'),
    async (req, res) => {
    try {
      const prop = req.body;
      proposalsStore.unshift(prop);
      if (isDbConfigured()) {
        await db.insert(schema.proposals).values({
          ...prop,
          date: new Date(prop.date),
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }
      res.status(201).json({ success: true, data: prop });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/proposals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = proposalsStore.findIndex(d => d.id === id);
      if (idx !== -1) proposalsStore[idx] = { ...proposalsStore[idx], ...updates };
      if (isDbConfigured()) {
        await db.update(schema.proposals).set({ ...updates, updatedAt: new Date() }).where(eq(schema.proposals.id, id));
      }
      res.json({ success: true, data: proposalsStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/proposals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      proposalsStore = proposalsStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.proposals).where(eq(schema.proposals.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // ==========================================
  // CONTRACTS
  // ==========================================
  app.get('/api/crm/contracts', async (req, res) => {
    try {
      const role = req.query.role as string;
      const companyName = req.query.company as string;
      
      let dataToReturn = contractsStore;

      if (isDbConfigured()) {
        const data = await db.select().from(schema.contracts).orderBy(desc(schema.contracts.createdAt));
        if (data && data.length > 0) {
          dataToReturn = data as any[];
        }
      }
      
      if (role === 'client' && companyName) {
        dataToReturn = dataToReturn.filter((c: any) => 
          (c.company || '').toLowerCase() === companyName.toLowerCase() || 
          (c.customerCompany || '').toLowerCase() === companyName.toLowerCase()
        );
      }
      
      res.json({ success: true, data: dataToReturn });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post(
    '/api/crm/contracts',
    (req, _res, next) => {
      if (req.body && typeof req.body === 'object') {
        const b = req.body;
        b.number = b.number || `ДС-${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;
        b.title = b.title || b.scope || 'Договор инжиниринга';
        b.customerCompany = b.customerCompany || b.company || 'Заказчик';
      }
      next();
    },
    validateBody('crmContract'),
    async (req, res) => {
    try {
      const doc = req.body;
      contractsStore.unshift(doc);
      if (isDbConfigured()) {
        await db.insert(schema.contracts).values({
          ...doc,
          date: new Date(doc.date),
          supportUntil: doc.supportUntil ? new Date(doc.supportUntil) : null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }
      res.status(201).json({ success: true, data: doc });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/contracts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = contractsStore.findIndex(d => d.id === id);
      if (idx !== -1) contractsStore[idx] = { ...contractsStore[idx], ...updates };
      if (isDbConfigured()) {
        await db.update(schema.contracts).set({ ...updates, updatedAt: new Date() }).where(eq(schema.contracts.id, id));
      }
      res.json({ success: true, data: contractsStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/contracts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      contractsStore = contractsStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.contracts).where(eq(schema.contracts.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // ==========================================
  // CERTIFICATES
  // ==========================================
  app.get('/api/crm/certificates', async (req, res) => {
    try {
      const role = req.query.role as string;
      const companyName = req.query.company as string;
      
      let dataToReturn = certificatesStore;

      if (isDbConfigured()) {
        const data = await db.select().from(schema.certificates).orderBy(desc(schema.certificates.createdAt));
        if (data && data.length > 0) {
          dataToReturn = data as any[];
        }
      }
      
      if (role === 'client' && companyName) {
        dataToReturn = dataToReturn.filter((c: any) => 
          (c.company || '').toLowerCase() === companyName.toLowerCase()
        );
      }
      
      res.json({ success: true, data: dataToReturn });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post('/api/crm/certificates', async (req, res) => {
    try {
      const cert = req.body;
      certificatesStore.unshift(cert);
      if (isDbConfigured()) {
        await db.insert(schema.certificates).values({
          ...cert,
          date: new Date(cert.date),
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }
      res.status(201).json({ success: true, data: cert });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/certificates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = certificatesStore.findIndex(d => d.id === id);
      if (idx !== -1) certificatesStore[idx] = { ...certificatesStore[idx], ...updates };
      if (isDbConfigured()) {
        await db.update(schema.certificates).set({ ...updates, updatedAt: new Date() }).where(eq(schema.certificates.id, id));
      }
      res.json({ success: true, data: certificatesStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/certificates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      certificatesStore = certificatesStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.certificates).where(eq(schema.certificates.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // Metrology Reports
  app.get('/api/crm/metrology-reports', async (req, res) => {
    try {
      const role = req.query.role as string;
      const companyName = req.query.company as string;
      
      let dataToReturn = metrologyReportsStore;

      if (isDbConfigured()) {
        const data = await db.select().from(schema.metrologyReports).orderBy(desc(schema.metrologyReports.createdAt));
        if (data && data.length > 0) {
          dataToReturn = data.map((d: any) => ({
            ...d,
            date: d.date ? (d.date instanceof Date ? d.date.toISOString() : String(d.date)) : new Date().toISOString(),
            files: Array.isArray(d.files) ? d.files : []
          }));
          saveReportsToDisk(dataToReturn);
        }
      }
      
      if (role === 'client' && companyName) {
        dataToReturn = dataToReturn.filter((r: any) => 
          (r.customer || '').toLowerCase() === companyName.toLowerCase() ||
          (r.company || '').toLowerCase() === companyName.toLowerCase()
        );
      }
      
      res.json({ success: true, data: dataToReturn });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post('/api/crm/metrology-reports', async (req, res) => {
    try {
      const rep = {
        ...req.body,
        id: req.body.id || `report-${Date.now()}`,
        date: req.body.date || new Date().toISOString(),
        files: Array.isArray(req.body.files) ? req.body.files : []
      };
      metrologyReportsStore.unshift(rep);
      saveReportsToDisk(metrologyReportsStore);

      if (isDbConfigured()) {
        await db.insert(schema.metrologyReports).values({
          id: rep.id,
          reportNumber: rep.reportNumber,
          date: new Date(rep.date),
          objectName: rep.objectName,
          customer: rep.customer,
          engineer: rep.engineer,
          equipment: rep.equipment,
          fleetDeviceId: rep.fleetDeviceId || null,
          equipmentSerial: rep.equipmentSerial || null,
          inventoryNumber: rep.inventoryNumber || null,
          verificationCertificate: rep.verificationCertificate || null,
          verificationValidUntil: rep.verificationValidUntil || null,
          isVerificationExpired: Boolean(rep.isVerificationExpired),
          status: rep.status || 'issued',
          contactPerson: rep.contactPerson || null,
          files: rep.files,
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }
      res.status(201).json({ success: true, data: rep });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/metrology-reports/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = metrologyReportsStore.findIndex(d => d.id === id);
      if (idx !== -1) {
        metrologyReportsStore[idx] = { ...metrologyReportsStore[idx], ...updates };
        saveReportsToDisk(metrologyReportsStore);
      }
      if (isDbConfigured()) {
        const dbUpdates: any = { ...updates, updatedAt: new Date() };
        if (updates.date) dbUpdates.date = new Date(updates.date);
        await db.update(schema.metrologyReports).set(dbUpdates).where(eq(schema.metrologyReports.id, id));
      }
      res.json({ success: true, data: metrologyReportsStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/metrology-reports/:id', async (req, res) => {
    try {
      const { id } = req.params;
      metrologyReportsStore = metrologyReportsStore.filter(d => d.id !== id);
      saveReportsToDisk(metrologyReportsStore);
      if (isDbConfigured()) await db.delete(schema.metrologyReports).where(eq(schema.metrologyReports.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // --- TICKETS ---
  app.get('/api/crm/tickets', async (req: Request, res: Response) => {
    try {
      const role = req.query.role as string;
      const companyName = req.query.company as string;
      
      let dataToReturn = ticketsStore;

      if (isDbConfigured()) {
        const data = await db.select().from(schema.supportTicketsV2);
        if (data.length > 0) dataToReturn = data as any[];
      }
      
      if (role === 'client' && companyName) {
        dataToReturn = dataToReturn.filter(t => 
          (t.clientCompany || '').toLowerCase() === companyName.toLowerCase() ||
          (t.company || '').toLowerCase() === companyName.toLowerCase()
        );
      }
      
      res.json({ success: true, data: dataToReturn });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post('/api/crm/tickets', async (req: Request, res: Response) => {
    try {
      const ticket = req.body;
      ticketsStore.unshift(ticket);
      if (isDbConfigured()) {
        await db.insert(schema.supportTicketsV2).values({
          ...ticket,
          date: new Date(ticket.date),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      res.json({ success: true, data: ticket });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/tickets/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = ticketsStore.findIndex(d => d.id === id);
      if (idx !== -1) {
        ticketsStore[idx] = { ...ticketsStore[idx], ...updates };
      }
      if (isDbConfigured()) {
        await db.update(schema.supportTicketsV2).set({ ...updates, updatedAt: new Date() }).where(eq(schema.supportTicketsV2.id, id));
      }
      res.json({ success: true, data: ticketsStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/tickets/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      ticketsStore = ticketsStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.supportTicketsV2).where(eq(schema.supportTicketsV2.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // --- LICENSES ---
  app.get('/api/crm/licenses', async (req: Request, res: Response) => {
    try {
      const role = req.query.role as string;
      const companyName = req.query.company as string;
      
      let dataToReturn = licensesStore;

      if (isDbConfigured()) {
        const data = await db.select().from(schema.licenses);
        if (data.length > 0) dataToReturn = data as any[];
      }
      
      if (role === 'client' && companyName) {
        dataToReturn = dataToReturn.filter(l => 
          (l.company || '').toLowerCase() === companyName.toLowerCase()
        );
      }
      
      res.json({ success: true, data: dataToReturn });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post('/api/crm/licenses', async (req: Request, res: Response) => {
    try {
      const license = req.body;
      licensesStore.unshift(license);
      if (isDbConfigured()) {
        await db.insert(schema.licenses).values({
          ...license,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      res.json({ success: true, data: license });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/licenses/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = licensesStore.findIndex(d => d.id === id);
      if (idx !== -1) {
        licensesStore[idx] = { ...licensesStore[idx], ...updates };
      }
      if (isDbConfigured()) {
        await db.update(schema.licenses).set({ ...updates, updatedAt: new Date() }).where(eq(schema.licenses.id, id));
      }
      res.json({ success: true, data: licensesStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/licenses/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      licensesStore = licensesStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.licenses).where(eq(schema.licenses.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // ==========================================
  // COMPANY EQUIPMENT FLEET (ПРИМЕНЯЕМОЕ ОБОРУДОВАНИЕ)
  // ==========================================
  app.get('/api/crm/fleet', async (_req: Request, res: Response) => {
    try {
      if (isDbConfigured()) {
        const data = await db.select().from(schema.crmFleetDevices);
        if (data && data.length > 0) {
          companyFleetStore = data.map((d: any) => ({
            ...d,
            statusLabel: d.status === 'on_site' ? 'На выезде у заказчика' :
                         d.status === 'in_verification' ? 'На поверке / калибровке' :
                         d.status === 'maintenance' ? 'Техническое обслуживание' : 'В офисе / Метрологическом зале'
          }));
          saveFleetToDisk(companyFleetStore);
        }
      }
      res.json({ success: true, data: companyFleetStore });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  app.post('/api/crm/fleet', async (req: Request, res: Response) => {
    try {
      const device = {
        ...req.body,
        id: req.body.id || `fleet-dev-${Date.now()}`,
        statusLabel: req.body.status === 'on_site' ? 'На выезде у заказчика' :
                     req.body.status === 'in_verification' ? 'На поверке / калибровке' :
                     req.body.status === 'maintenance' ? 'Техническое обслуживание' : 'В офисе / Метрологическом зале',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      companyFleetStore.unshift(device);
      saveFleetToDisk(companyFleetStore);

      if (isDbConfigured()) {
        await db.insert(schema.crmFleetDevices).values({
          id: device.id,
          catalogProductId: device.catalogProductId || null,
          modelName: device.modelName,
          brand: device.brand,
          category: device.category,
          serialNumber: device.serialNumber,
          inventoryNumber: device.inventoryNumber,
          status: device.status || 'in_office',
          verificationNumber: device.verificationNumber,
          verificationDate: device.verificationDate || null,
          verificationValidUntil: device.verificationValidUntil,
          verificationDocUrl: device.verificationDocUrl || null,
          currentLocation: device.currentLocation || null,
          responsiblePerson: device.responsiblePerson || null,
          notes: device.notes || null,
          photoUrl: device.photoUrl || null,
          accuracy: device.accuracy || null,
          measuringRange: device.measuringRange || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }

      res.status(201).json({ success: true, data: device });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  app.patch('/api/crm/fleet/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = companyFleetStore.findIndex(d => d.id === id);
      if (idx !== -1) {
        companyFleetStore[idx] = { 
          ...companyFleetStore[idx], 
          ...updates, 
          statusLabel: (updates.status || companyFleetStore[idx].status) === 'on_site' ? 'На выезде у заказчика' :
                       (updates.status || companyFleetStore[idx].status) === 'in_verification' ? 'На поверке / калибровке' :
                       (updates.status || companyFleetStore[idx].status) === 'maintenance' ? 'Техническое обслуживание' : 'В офисе / Метрологическом зале',
          updatedAt: new Date().toISOString() 
        };
        saveFleetToDisk(companyFleetStore);

        if (isDbConfigured()) {
          await db.update(schema.crmFleetDevices).set({
            ...updates,
            updatedAt: new Date()
          }).where(eq(schema.crmFleetDevices.id, id));
        }

        res.json({ success: true, data: companyFleetStore[idx] });
      } else {
        res.status(404).json({ success: false, error: 'Device not found' });
      }
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  app.delete('/api/crm/fleet/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      companyFleetStore = companyFleetStore.filter(d => d.id !== id);
      saveFleetToDisk(companyFleetStore);
      if (isDbConfigured()) {
        await db.delete(schema.crmFleetDevices).where(eq(schema.crmFleetDevices.id, id));
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // ==========================================
  // СБРОС БАЗЫ ДАННЫХ CRM И ЛИЧНОГО КАБИНЕТА
  // ==========================================
  app.post('/api/crm/reset', async (_req: Request, res: Response) => {
    try {
      companiesStore = [...INITIAL_CRM_COMPANIES];
      contactsStore = [...INITIAL_CRM_CONTACTS];
      tasksStore = [...INITIAL_USER_TASKS];
      calendarEventsStore = [...INITIAL_CALENDAR_EVENTS];
      clientListsStore = [...INITIAL_CLIENT_LISTS];
      dealsStore = [...INITIAL_CRM_DEALS];
      proposalsStore = [...INITIAL_PROPOSALS];
      contractsStore = [...INITIAL_CONTRACTS];
      ticketsStore = [...INITIAL_SUPPORT_TICKETS];
      licensesStore = [...INITIAL_LICENSES];
      companyFleetStore = [...INITIAL_COMPANY_FLEET];
      certificatesStore = [
        {
          id: 'cert-1',
          certificateNumber: '2026-000142',
          date: '2026-05-29T00:00:00.000Z',
          traineeName: 'Захарова Светлана Николаевна',
          customer: 'ООО «АВТОСВЕТ»',
          instructor: 'С.Ю. Некрасов',
          files: []
        }
      ];
      metrologyReportsStore = [];

      saveFleetToDisk(companyFleetStore);
      saveReportsToDisk(metrologyReportsStore);

      logRealtimeEvent({
        category: 'DB_PERSISTENCE',
        level: 'INFO',
        action: 'CRM_DB_RESET',
        summary: 'База данных CRM и Личного кабинета сброшена к заводским значениям'
      });

      res.json({
        success: true,
        message: 'База данных CRM и Личного кабинета успешно сброшена к заводским значениям',
        data: {
          deals: dealsStore,
          contracts: contractsStore,
          proposals: proposalsStore,
          companies: companiesStore,
          contacts: contactsStore,
          tickets: ticketsStore,
          licenses: licensesStore,
          fleet: companyFleetStore,
          tasks: tasksStore,
          calendarEvents: calendarEventsStore
        }
      });
    } catch (err: any) {
      console.error('[CrmModule] Error resetting CRM database:', err);
      res.status(500).json({ success: false, error: 'Failed to reset CRM database' });
    }
  });
}
