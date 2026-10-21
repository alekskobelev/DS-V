import { CompanyFleetDevice } from '../types';
import { ExtendedDeal } from '../data/mockCrmData';

export type VerificationStatusType = 'expired' | 'critical' | 'warning' | 'valid';

export interface ArshinEquipmentItem {
  id: string;
  sourceId: string;
  sourceType: 'fleet' | 'deal' | 'custom';
  ownerType: 'company' | 'client';
  ownerName: string;
  ownerInn?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  modelName: string;
  brand: string;
  category: string;
  serialNumber: string;
  inventoryNumber?: string;
  verificationNumber: string;
  verificationDate?: string;
  verificationValidUntil: string;
  status: VerificationStatusType;
  daysLeft: number;
  statusLabel: string;
  badgeClass: string;
  rowHighlightClass: string;
  responsiblePerson: string;
  currentLocation?: string;
  arshinUrl: string;
  accuracy?: string;
  dealId?: string;
  notes?: string;
}

// Fixed baseline date for deterministic simulation: 2026-09-15
export const REFERENCE_DATE = new Date('2026-09-15T00:00:00Z');

export const calculateVerificationStatus = (validUntilStr: string, refDate: Date = REFERENCE_DATE) => {
  if (!validUntilStr) {
    return {
      status: 'valid' as VerificationStatusType,
      daysLeft: 999,
      statusLabel: 'Срок не указан',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      rowHighlightClass: ''
    };
  }

  const validUntil = new Date(validUntilStr);
  const diffMs = validUntil.getTime() - refDate.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    const overdueDays = Math.abs(daysLeft);
    return {
      status: 'expired' as VerificationStatusType,
      daysLeft,
      statusLabel: `Просрочено на ${overdueDays} дн.!`,
      badgeClass: 'bg-rose-600 text-white border-rose-700 shadow-xs font-bold animate-pulse',
      rowHighlightClass: 'bg-rose-50/90 dark:bg-rose-950/40 border-l-4 border-l-rose-600 text-rose-950 dark:text-rose-100 font-medium'
    };
  }

  if (daysLeft <= 30) {
    return {
      status: 'critical' as VerificationStatusType,
      daysLeft,
      statusLabel: `Истекает через ${daysLeft} дн.!`,
      badgeClass: 'bg-red-500 text-white border-red-600 shadow-xs font-bold',
      rowHighlightClass: 'bg-red-50/70 dark:bg-red-950/30 border-l-4 border-l-red-500'
    };
  }

  if (daysLeft <= 60) {
    return {
      status: 'warning' as VerificationStatusType,
      daysLeft,
      statusLabel: `Истекает через ${daysLeft} дн.`,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
      rowHighlightClass: 'bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-l-amber-400'
    };
  }

  return {
    status: 'valid' as VerificationStatusType,
    daysLeft,
    statusLabel: `Действует (${daysLeft} дн.)`,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rowHighlightClass: ''
  };
};

export const formatArshinUrl = (certNumber: string, serial: string) => {
  // Official FGIS Arshin link with search query
  const query = encodeURIComponent(certNumber || serial);
  return `https://fgis.gost.ru/fundmetrology/cm/results?search=${query}`;
};

// Default high-profile industrial client equipment to monitor
export const CLIENT_MONITORED_EQUIPMENT: Omit<ArshinEquipmentItem, 'status' | 'daysLeft' | 'statusLabel' | 'badgeClass' | 'rowHighlightClass' | 'arshinUrl'>[] = [
  {
    id: 'client-eq-1',
    sourceId: 'client-eq-1',
    sourceType: 'custom',
    ownerType: 'client',
    ownerName: 'ПАО «ОДК-Кузнецов»',
    ownerInn: '6312004455',
    contactPerson: 'Королев В.М. (Главный инженер)',
    contactPhone: '+7 (846) 270-80-00',
    contactEmail: 'v.korolev@odk-kuznetsov.ru',
    modelName: 'Портативная КИМ Hexagon Absolute Arm 8520 со сканером AS1',
    brand: 'Hexagon Manufacturing Intelligence',
    category: 'Измерительные руки',
    serialNumber: 'HEX-8520-SAM-044',
    inventoryNumber: 'ИНВ-ОДК-8812',
    verificationNumber: 'С-СПБ/28-09-2025/44120-АРШИН',
    verificationDate: '2025-09-28',
    verificationValidUntil: '2026-09-28', // 13 days left -> CRITICAL RED!
    responsiblePerson: 'Морозов В.Г. (Руководитель КТО)',
    currentLocation: 'Цех №12 (Опытное производство ГТД, Самара)',
    accuracy: '0.018 мм',
    notes: 'Требуется выездное ТО и поверка в присутствии поверителя Самарского ЦСМ.'
  },
  {
    id: 'client-eq-2',
    sourceId: 'client-eq-2',
    sourceType: 'custom',
    ownerType: 'client',
    ownerName: 'АО «Авиаагрегат»',
    ownerInn: '6312003890',
    contactPerson: 'Ковалев А.С. (Главный метролог)',
    contactPhone: '+7 (846) 995-12-34',
    contactEmail: 'kovalev@aviaagregat.ru',
    modelName: 'Стационарная КИМ Mitutoyo CRYSTA-Apex S 9106',
    brand: 'Mitutoyo Corporation',
    category: 'Координатно-измерительные машины',
    serialNumber: 'MIT-APX-88412',
    inventoryNumber: 'ИНВ-АВИА-401',
    verificationNumber: 'С-МСК/08-09-2025/09811-АРШИН',
    verificationDate: '2025-09-08',
    verificationValidUntil: '2026-09-08', // Overdue by 7 days -> EXPIRED RED!
    responsiblePerson: 'Ярыш И.В. (Инженер-метролог)',
    currentLocation: 'Лаборатория линейно-угловых измерений цеха №4',
    accuracy: '1.7 + 3L/1000 мкм',
    notes: 'Срок действия свидетельства истек! Необходима срочная калибровка лазерным интерферометром.'
  },
  {
    id: 'client-eq-3',
    sourceId: 'client-eq-3',
    sourceType: 'custom',
    ownerType: 'client',
    ownerName: 'ООО «Тольяттинский Завод Автоагрегатов»',
    ownerInn: '6321458902',
    contactPerson: 'Морозов Д.С. (Технический директор)',
    contactPhone: '+7 (8482) 75-90-12',
    contactEmail: 'morozov@tza-samara.ru',
    modelName: 'Гибридный лазерный 3D-сканер Shining3D FreeScan Combo',
    brand: 'Shining 3D',
    category: '3D-сканеры',
    serialNumber: 'SHN-CMB-2026-901',
    inventoryNumber: 'ИНВ-ТЗА-219',
    verificationNumber: 'С-ВНИИМС/18-10-2025/11902-АРШИН',
    verificationDate: '2025-10-18',
    verificationValidUntil: '2026-10-18', // 33 days left -> WARNING AMBER
    responsiblePerson: 'Ярыш А.В. (Инженер по оборудованию)',
    currentLocation: 'Инструментальный цех (штампы и пресс-формы)',
    accuracy: '0.020 мм',
    notes: 'Плановое напоминание заказчику о продлении договора сервисного сопровождения.'
  },
  {
    id: 'client-eq-4',
    sourceId: 'client-eq-4',
    sourceType: 'custom',
    ownerType: 'client',
    ownerName: 'ПАО «КАМАЗ» (Научно-технический центр)',
    ownerInn: '1650032058',
    contactPerson: 'Закиров Рамиль Ильдарович (Нач. метрологической службы)',
    contactPhone: '+7 (8552) 37-18-00',
    contactEmail: 'zakirov@kamaz.ru',
    modelName: 'Мостовая КИМ Carl Zeiss ACCURA 2000 с датчиком VAST XT gold',
    brand: 'Carl Zeiss Industrielle Messtechnik',
    category: 'Координатно-измерительные машины',
    serialNumber: 'ZEISS-ACC-7714-RU',
    inventoryNumber: 'ИНВ-КАМАЗ-НТЦ-09',
    verificationNumber: 'С-СПБ/24-09-2025/30911-АРШИН',
    verificationDate: '2025-09-24',
    verificationValidUntil: '2026-09-24', // 9 days left -> CRITICAL RED!
    responsiblePerson: 'Скобелев А.С. (Инженер по ПО и CAD)',
    currentLocation: 'НТЦ КАМАЗ (Набережные Челны, Автосборочный проезд, 1)',
    accuracy: '1.2 + L/350 мкм',
    notes: 'Критический прибор входного контроля блоков цилиндров. Срочно согласовать командировку.'
  },
  {
    id: 'client-eq-5',
    sourceId: 'client-eq-5',
    sourceType: 'custom',
    ownerType: 'client',
    ownerName: 'АО «Тяжмаш»',
    ownerInn: '6325000720',
    contactPerson: 'Федосеев В.П. (Главный контролер качества)',
    contactPhone: '+7 (8464) 37-81-00',
    contactEmail: 'fedoseev@tyazhmash.com',
    modelName: 'Лазерный трекер Leica Absolute Tracker AT901-B',
    brand: 'Leica Geosystems',
    category: 'Лазерные трекеры',
    serialNumber: 'LEI-901-TYAZH-019',
    inventoryNumber: 'ИНВ-ТЯЖМАШ-088',
    verificationNumber: 'С-ВНИИФТРИ/30-11-2025/66120-АРШИН',
    verificationDate: '2025-11-30',
    verificationValidUntil: '2026-11-30', // 76 days left -> VALID GREEN
    responsiblePerson: 'Некрасов С.Ю. (Генеральный директор)',
    currentLocation: 'Цех гидротурбинного оборудования (Сызрань)',
    accuracy: '10 мкм + 5 мкм/м',
    notes: 'Поверка действует. Плановый выезд в ноябре 2026 г.'
  },
  {
    id: 'client-eq-6',
    sourceId: 'client-eq-6',
    sourceType: 'custom',
    ownerType: 'client',
    ownerName: 'АО «АВТОВАЗ»',
    ownerInn: '6320002223',
    contactPerson: 'Николаев Игорь Борисович (Зам. гл. метролога)',
    contactPhone: '+7 (8482) 73-80-00',
    contactEmail: 'nikolaev@vaz.ru',
    modelName: 'Горизонтально-рукавная КИМ DEA TORO для геометрии кузовов',
    brand: 'Hexagon / DEA',
    category: 'Координатно-измерительные машины',
    serialNumber: 'DEA-TORO-092-VAZ',
    inventoryNumber: 'ИНВ-ВАЗ-КУЗОВ-14',
    verificationNumber: 'С-ТОЛ/30-08-2025/18410-АРШИН',
    verificationDate: '2025-08-30',
    verificationValidUntil: '2026-08-30', // Overdue by 16 days -> EXPIRED RED!
    responsiblePerson: 'Ярыш И.В. (Инженер-метролог)',
    currentLocation: 'Производство автомобилей на платформе Lada (Тольятти)',
    accuracy: '25 + 15L/1000 мкм',
    notes: 'Срок свидетельства истек! Работы по контролю кузовов приостановлены до проведения калибровки.'
  },
  {
    id: 'client-eq-7',
    sourceId: 'client-eq-7',
    sourceType: 'custom',
    ownerType: 'client',
    ownerName: 'АО «Электрощит» Самара',
    ownerInn: '6313000450',
    contactPerson: 'Тимофеев С.А. (Инженер ОКК)',
    contactPhone: '+7 (846) 278-45-00',
    contactEmail: 'timofeev@electroshield.ru',
    modelName: 'Оптический 3D-сканер ScanLine EasyScan Omni',
    brand: 'ScanLine 3D (РФ, Госреестр СИ)',
    category: '3D-сканеры',
    serialNumber: 'SCAN-MAG-2025-41',
    inventoryNumber: 'ИНВ-ЭЩ-052',
    verificationNumber: 'С-СПБ/08-10-2025/77102-АРШИН',
    verificationDate: '2025-10-08',
    verificationValidUntil: '2026-10-08', // 23 days left -> CRITICAL RED!
    responsiblePerson: 'Скобелев А.С. (Инженер по ПО и CAD)',
    currentLocation: 'Участок раскроя и гибки листового металла',
    accuracy: '0.020 мм',
    notes: 'Срок истекает через 23 дня. Клиент запросил счет на поверку и обновление PolyWorks.'
  },
  {
    id: 'client-eq-8',
    sourceId: 'client-eq-8',
    sourceType: 'custom',
    ownerType: 'client',
    ownerName: 'АО «РКЦ «Прогресс»',
    ownerInn: '6312004487',
    contactPerson: 'Кузнецов Валерий Сергеевич (Нач. КТО)',
    contactPhone: '+7 (846) 228-60-00',
    contactEmail: 'v.kuznetsov@samspace.ru',
    modelName: 'Оптическая измерительная 3D-система GOM ATOS Q 12M',
    brand: 'GOM / ZEISS',
    category: 'Оптические системы',
    serialNumber: 'GOM-ATOS-12M-882',
    inventoryNumber: 'ИНВ-РКЦ-СТР-03',
    verificationNumber: 'С-ВНИИМС/15-02-2026/04118-АРШИН',
    verificationDate: '2026-02-15',
    verificationValidUntil: '2027-02-15', // 153 days left -> VALID GREEN
    responsiblePerson: 'Ярыш И.В. (Инженер-метролог)',
    currentLocation: 'Корпус сборки головных обтекателей РН «Союз-2»',
    accuracy: '0.015 мм',
    notes: 'Свидетельство действительно до 2027 года. Замечаний к калибровке нет.'
  }
];

// Additional company devices with critical verification dates to show full spectrum of monitoring
export const ADDITIONAL_COMPANY_DEVICES: Omit<ArshinEquipmentItem, 'status' | 'daysLeft' | 'statusLabel' | 'badgeClass' | 'rowHighlightClass' | 'arshinUrl'>[] = [
  {
    id: 'fleet-dev-5',
    sourceId: 'fleet-dev-5',
    sourceType: 'fleet',
    ownerType: 'company',
    ownerName: 'ООО «ДС-Инжиниринг» (Собственный парк)',
    contactPerson: 'Скобелев А.С. (Инженер по ПО и CAD)',
    contactPhone: '+7 (846) 219-25-88',
    contactEmail: 'info@ds-engineering.ru',
    modelName: 'Лазерный 3D-сканер Shining3D FreeScan UE Pro',
    brand: 'Shining 3D',
    category: 'Оптические и лазерные 3D-сканеры',
    serialNumber: 'FS-UE-2025-119',
    inventoryNumber: 'ИНВ-ДС-035',
    verificationNumber: 'С-СПБ/02-09-2025/11094-АРШИН',
    verificationDate: '2025-09-02',
    verificationValidUntil: '2026-09-02', // Overdue by 13 days -> EXPIRED RED!
    responsiblePerson: 'Скобелев А.С. (Инженер по внедрению CAD/CAM и постпроцессорам)',
    currentLocation: 'Самара, Метрологический зал (ул. Свободы, 198)',
    accuracy: '0.020 мм',
    notes: 'ВНИМАНИЕ: Свидетельство о поверке просрочено на 13 дней! Прибор перемещен в зону ожидания поверки. Запрещено использовать в официальных протоколах измерений.'
  },
  {
    id: 'fleet-dev-6',
    sourceId: 'fleet-dev-6',
    sourceType: 'fleet',
    ownerType: 'company',
    ownerName: 'ООО «ДС-Инжиниринг» (Собственный парк)',
    contactPerson: 'Ярыш А.В. (Инженер по оборудованию)',
    contactPhone: '+7 (846) 219-25-88',
    contactEmail: 'support@ds-engineering.ru',
    modelName: 'Лазерный трекер Leica Absolute Tracker AT960-SR',
    brand: 'Leica Geosystems / Hexagon',
    category: 'Лазерные трекеры',
    serialNumber: 'AT960-5512-CH',
    inventoryNumber: 'ИНВ-ДС-022',
    verificationNumber: 'С-ВНИИМ/05-10-2025/88140-АРШИН',
    verificationDate: '2025-10-05',
    verificationValidUntil: '2026-10-05', // 20 days left -> CRITICAL RED!
    responsiblePerson: 'Некрасов С.Ю. (Генеральный директор)',
    currentLocation: 'Тольятти, Технопарк «Жигулевская долина» (корп. 3.2)',
    accuracy: '15 мкм + 6 мкм/м',
    notes: 'Осталось 20 дней до завершения межповерочного интервала. Документы переданы в Самарский ЦСМ на оформление выездной поверки.'
  }
];

export const getAllMonitoredEquipment = (
  fleetDevices: CompanyFleetDevice[],
  deals: ExtendedDeal[],
  refDate: Date = REFERENCE_DATE
): ArshinEquipmentItem[] => {
  const result: ArshinEquipmentItem[] = [];
  const processedSerials = new Set<string>();

  // 1. Process Fleet Devices (Company Owned)
  fleetDevices.forEach(dev => {
    const calc = calculateVerificationStatus(dev.verificationValidUntil, refDate);
    const item: ArshinEquipmentItem = {
      id: `fleet_${dev.id}`,
      sourceId: dev.id,
      sourceType: 'fleet',
      ownerType: 'company',
      ownerName: 'ООО «ДС-Инжиниринг» (Собственный парк)',
      contactPerson: dev.responsiblePerson,
      contactPhone: '+7 (846) 219-25-88',
      contactEmail: 'info@ds-engineering.ru',
      modelName: dev.modelName,
      brand: dev.brand || 'Метрологическое оборудование',
      category: dev.category || 'Измерительные приборы',
      serialNumber: dev.serialNumber,
      inventoryNumber: dev.inventoryNumber,
      verificationNumber: dev.verificationNumber || 'Внесено в ФГИС «АРШИН»',
      verificationDate: dev.verificationDate,
      verificationValidUntil: dev.verificationValidUntil,
      status: calc.status,
      daysLeft: calc.daysLeft,
      statusLabel: calc.statusLabel,
      badgeClass: calc.badgeClass,
      rowHighlightClass: calc.rowHighlightClass,
      responsiblePerson: dev.responsiblePerson || 'Инженер-метролог «ДС-Инжиниринг»',
      currentLocation: dev.currentLocation,
      accuracy: dev.accuracy,
      notes: dev.notes,
      arshinUrl: formatArshinUrl(dev.verificationNumber, dev.serialNumber)
    };
    result.push(item);
    if (dev.serialNumber) processedSerials.add(dev.serialNumber.toLowerCase());
  });

  // 2. Add additional company demo/etalon devices if not already in fleet
  ADDITIONAL_COMPANY_DEVICES.forEach(dev => {
    if (!processedSerials.has(dev.serialNumber.toLowerCase())) {
      const calc = calculateVerificationStatus(dev.verificationValidUntil, refDate);
      result.push({
        ...dev,
        status: calc.status,
        daysLeft: calc.daysLeft,
        statusLabel: calc.statusLabel,
        badgeClass: calc.badgeClass,
        rowHighlightClass: calc.rowHighlightClass,
        arshinUrl: formatArshinUrl(dev.verificationNumber, dev.serialNumber)
      });
      processedSerials.add(dev.serialNumber.toLowerCase());
    }
  });

  // 3. Process Deals with Client Equipment
  deals.forEach(deal => {
    if (deal.clientEquipment && deal.clientEquipment.serialNumber) {
      const sLower = deal.clientEquipment.serialNumber.toLowerCase();
      if (!processedSerials.has(sLower)) {
        const validUntil = deal.clientEquipment.verificationDate || deal.clientEquipment.warrantyUntil || '2026-11-01';
        const calc = calculateVerificationStatus(validUntil, refDate);

        const item: ArshinEquipmentItem = {
          id: `deal_${deal.id}`,
          sourceId: deal.id,
          sourceType: 'deal',
          ownerType: 'client',
          ownerName: deal.companyName || 'Предприятие-заказчик',
          ownerInn: deal.inn,
          contactPerson: deal.customerName,
          contactPhone: deal.phone,
          contactEmail: deal.email,
          modelName: deal.clientEquipment.model || deal.serviceType || 'Измерительная система КИМ',
          brand: deal.clientEquipment.model?.includes('Mitutoyo') ? 'Mitutoyo' :
                 deal.clientEquipment.model?.includes('Hexagon') ? 'Hexagon' :
                 deal.clientEquipment.model?.includes('Leica') ? 'Leica Geosystems' :
                 deal.clientEquipment.model?.includes('Shining') ? 'Shining 3D' : 'Изготовитель СИ',
          category: 'КИМ и 3D-сканеры заказчиков',
          serialNumber: deal.clientEquipment.serialNumber,
          verificationNumber: `АРШИН-${deal.clientEquipment.serialNumber}`,
          verificationDate: deal.clientEquipment.verificationDate,
          verificationValidUntil: validUntil,
          status: calc.status,
          daysLeft: calc.daysLeft,
          statusLabel: calc.statusLabel,
          badgeClass: calc.badgeClass,
          rowHighlightClass: calc.rowHighlightClass,
          responsiblePerson: deal.responsibleManager || deal.createdByManager || 'Куратор проекта',
          currentLocation: `${deal.companyName} (по договору ${deal.id})`,
          dealId: deal.id,
          arshinUrl: formatArshinUrl('', deal.clientEquipment.serialNumber),
          notes: `Прибор на обслуживании по сделке ${deal.id}. Этап: ${deal.stage}.`
        };

        result.push(item);
        processedSerials.add(sLower);
      }
    }
  });

  // 4. Add predefined monitored client fleet items
  CLIENT_MONITORED_EQUIPMENT.forEach(clientDev => {
    if (!processedSerials.has(clientDev.serialNumber.toLowerCase())) {
      const calc = calculateVerificationStatus(clientDev.verificationValidUntil, refDate);
      result.push({
        ...clientDev,
        status: calc.status,
        daysLeft: calc.daysLeft,
        statusLabel: calc.statusLabel,
        badgeClass: calc.badgeClass,
        rowHighlightClass: calc.rowHighlightClass,
        arshinUrl: formatArshinUrl(clientDev.verificationNumber, clientDev.serialNumber)
      });
      processedSerials.add(clientDev.serialNumber.toLowerCase());
    }
  });

  // Sort: First EXPIRED (negative daysLeft), then CRITICAL (0-30), then WARNING (31-60), then VALID
  return result.sort((a, b) => a.daysLeft - b.daysLeft);
};

export const exportScheduleToCsv = (items: ArshinEquipmentItem[]): void => {
  const headers = [
    'Статус поверки',
    'Осталось дней',
    'Владелец (Организация)',
    'ИНН',
    'Модель СИ',
    'Производитель',
    'Категория',
    'Заводской номер',
    'Инвентарный номер',
    'Свидетельство ФГИС АРШИН',
    'Дата поверки',
    'Срок действия свидетельства',
    'Ответственный специалист',
    'Местонахождение',
    'Телефон',
    'Email'
  ];

  const rows = items.map(i => [
    `"${i.status === 'expired' ? 'ПРОСРОЧЕНО' : i.status === 'critical' ? 'СРОЧНО (до 30 дн.)' : i.status === 'warning' ? 'Внимание (до 60 дн.)' : 'Действует'}"`,
    i.daysLeft,
    `"${(i.ownerName || '').replace(/"/g, '""')}"`,
    `"${i.ownerInn || ''}"`,
    `"${(i.modelName || '').replace(/"/g, '""')}"`,
    `"${(i.brand || '').replace(/"/g, '""')}"`,
    `"${(i.category || '').replace(/"/g, '""')}"`,
    `"${(i.serialNumber || '').replace(/"/g, '""')}"`,
    `"${(i.inventoryNumber || '').replace(/"/g, '""')}"`,
    `"${(i.verificationNumber || '').replace(/"/g, '""')}"`,
    `"${i.verificationDate || ''}"`,
    `"${i.verificationValidUntil || ''}"`,
    `"${(i.responsiblePerson || '').replace(/"/g, '""')}"`,
    `"${(i.currentLocation || '').replace(/"/g, '""')}"`,
    `"${i.contactPhone || ''}"`,
    `"${i.contactEmail || ''}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `График_поверок_ФГИС_АРШИН_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
