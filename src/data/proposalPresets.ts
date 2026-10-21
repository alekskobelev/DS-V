import { ProposalBlock, SpecificationItem, OrganizationProfile, DocumentStyling, DEFAULT_ORGANIZATION_PROFILE, DEFAULT_DOCUMENT_STYLING } from '../types/proposalEditor';

export interface ProposalPreset {
  id: string;
  name: string;
  title?: string;
  code: string;
  description: string;
  documentType: 'main' | 'technical_task' | 'specification';
  proposalNumber: string;
  proposalDate: string;
  validUntilDate: string;
  toCompany: string;
  contactPerson: string;
  ceoPost: string;
  greeting: string;
  proposalTitle: string;
  currency: 'RUB' | 'USD' | 'EUR';
  vatMode: 'standard' | 'export_zero' | 'no_vat';
  vatRate: number;
  deliveryDays: string;
  warrantyMonths: string;
  deliveryTerms: string;
  paymentTerms: string;
  finalPriceNotes: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  specItems: SpecificationItem[];
  blocks: ProposalBlock[];
}

export const CORPORATE_PROPOSAL_PRESETS: ProposalPreset[] = [
  // --- 1. Шаблон: Обратный инжиниринг + 3D-сканирование + ТЗ Приложение №1 ---
  {
    id: 'preset-3d-scan',
    code: '3D-сканирование',
    name: 'Шаблон: Обратный инжиниринг и 3D-сканирование образцов + ТЗ',
    description: '3D-сканирование матриц, пуансонов и оснастки лазерным сканером Shining3D FreeScan, составление ТЗ и протоколов',
    documentType: 'main',
    proposalNumber: 'ДС-ТКП-2026/09-101',
    proposalDate: '23.09.2026 г.',
    validUntilDate: '07.10.2026 г.',
    toCompany: 'ООО «Предприятие-Заказчик»',
    contactPerson: 'Иванов Иван Иванович',
    ceoPost: 'Генеральному директору',
    greeting: 'Уважаемый Иван Иванович!',
    proposalTitle: 'на выполнение комплекса услуг по 3D-сканированию и обратному инжинирингу образцов продукции',
    currency: 'RUB',
    vatMode: 'standard',
    vatRate: 22,
    deliveryDays: 'до 8 (восьми) рабочих дней с момента получения предоплаты',
    warrantyMonths: '12 месяцев',
    deliveryTerms: 'Работы по 3D-сканированию производятся на площадке Заказчика или в измерительной лаборатории Исполнителя.',
    paymentTerms: '50% — предоплата, 50% — в течение 5 дней после подписания УПД.',
    finalPriceNotes: 'Общая стоимость работ включает 3D-сканирование и обработку данных с выездом специалистов.',
    managerName: 'С.Ю. Некрасов',
    managerPhone: '+7 (846) 954-02-92',
    managerEmail: 'info@ds-enginering.ru',
    specItems: [
      { id: 'kp101-1', name: 'Матрица штамповой оснастки — 3D-сканирование и обработка полигональной сетки', category: 'Услуги', quantity: 1, unit: 'шт.', price: 16000 },
      { id: 'kp101-2', name: 'Пуансон формообразующий — 3D-сканирование и построение CAD-модели (STEP/IGES)', category: 'Услуги', quantity: 1, unit: 'шт.', price: 16000 },
      { id: 'kp101-3', name: 'Корпусная деталь сложной геометрии — лазерное 3D-сканирование с разрешением 0.05 мм', category: 'Услуги', quantity: 1, unit: 'шт.', price: 16000 },
      { id: 'kp101-4', name: 'Контрольный калибр — оцифровка базовых баз и поверхностей сопряжения', category: 'Услуги', quantity: 1, unit: 'шт.', price: 16000 },
      { id: 'kp101-5', name: 'Контрольный протокол отклонений GD&T (цветовая карта совмещения с CAD)', category: 'Услуги', quantity: 1, unit: 'протокол', price: 6000 }
    ],
    blocks: [
      {
        id: 'block-intro-101',
        type: 'text',
        title: 'Вводная часть',
        content: 'Предлагаем Вам рассмотреть технико-коммерческое предложение на выполнение комплекса услуг по обратному инжинирингу (включая 3D-сканирование) предоставленных образцов. Работы выполняются согласно проекту технического задания.'
      },
      {
        id: 'block-spec-101',
        type: 'specification',
        title: 'СПЕЦИФИКАЦИЯ УСЛУГ'
      },
      {
        id: 'block-terms-101',
        type: 'text',
        title: 'Условия выполнения работ',
        content: '• Сроки выполнения: до 8 (восьми) рабочих дней с момента получения предоплаты.\n• Оплата: 50% — предоплата, 50% — в течение 5 банковских дней после подписания УПД.\n• Конфиденциальность (NDA): строгое соблюдение режима коммерческой тайны.\n• Срок действия предложения: 14 календарных дней.'
      },
      {
        id: 'block-sig-101',
        type: 'signatures',
        showStamp: true
      }
    ]
  },

  // --- 2. Шаблон: Измерения калибров на КИМ ---
  {
    id: 'preset-cmm-measure',
    code: 'Измерения на КИМ',
    name: 'Шаблон: 3D-измерения калибров и деталей на стационарной КИМ',
    description: 'Высокоточные измерения деталей на стационарной и переносной КИМ с протоколами GD&T',
    documentType: 'main',
    proposalNumber: 'ДС-ТКП-2026/09-102',
    proposalDate: '21.09.2026 г.',
    validUntilDate: '05.10.2026 г.',
    toCompany: 'АО «Машиностроительный завод»',
    contactPerson: 'Смирнов Петр Алексеевич',
    ceoPost: 'Главному метрологу',
    greeting: 'Уважаемый Петр Алексеевич!',
    proposalTitle: 'на выполнение работ по контрольным трехкоординатным измерениям деталей и калибров',
    currency: 'RUB',
    vatMode: 'standard',
    vatRate: 22,
    deliveryDays: 'в течение 3-5 рабочих дней',
    warrantyMonths: '12 месяцев',
    deliveryTerms: 'Доставка деталей к месту проведения измерений и обратно осуществляется Заказчиком.',
    paymentTerms: '100% оплата после выставления УПД и передачи протоколов контроля.',
    finalPriceNotes: 'Стоимость включает подготовку измерительных программ, контроль на КИМ и оформление отчетов.',
    managerName: 'Ярыш Иван',
    managerPhone: '+7 (846) 954-02-92',
    managerEmail: 'info@ds-enginering.ru',
    specItems: [
      { id: 'kp102-1', name: 'Контроль геометрических параметров корпусной детали на КИМ Mitutoyo', category: 'Измерения', quantity: 1, unit: 'дет.', price: 12500 },
      { id: 'kp102-2', name: 'Измерение соосности, перпендикулярности и биения базовых шеек вала', category: 'Измерения', quantity: 1, unit: 'дет.', price: 9500 },
      { id: 'kp102-3', name: 'Аттестация контрольно-измерительного калибра с выдачей карты отклонений', category: 'Калибры', quantity: 1, unit: 'шт.', price: 14000 },
      { id: 'kp102-4', name: 'Формирование и выпуск официального метрологического протокола с допусками IT6', category: 'Отчеты', quantity: 1, unit: 'протокол', price: 4000 }
    ],
    blocks: [
      {
        id: 'block-intro-102',
        type: 'text',
        title: 'Вводная часть',
        content: 'В ответ на Ваш запрос представляем технико-коммерческое предложение на выполнение метрологических измерений на координатно-измерительной машине согласно Спецификации.'
      },
      {
        id: 'block-spec-102',
        type: 'specification',
        title: 'Спецификация измерительных работ'
      },
      {
        id: 'block-sig-102',
        type: 'signatures',
        showStamp: true
      }
    ]
  },

  // --- 3. Шаблон: Поставка КИМ типа «рука» (PMT GAMMA+, USD) ---
  {
    id: 'preset-cmm-arm',
    code: 'Поставка КИМ',
    name: 'Шаблон: Поставка мобильной КИМ типа «рука» PMT GAMMA+ (USD)',
    description: 'Координатно-измерительная машина типа «рука» для контроля геометрии цеховых деталей и оснастки',
    documentType: 'main',
    proposalNumber: 'ДС-ТКП-2026/09-103',
    proposalDate: '17.09.2026 г.',
    validUntilDate: '17.10.2026 г.',
    toCompany: 'ООО «Промышленная корпорация»',
    contactPerson: 'Козлов Сергей Николаевич',
    ceoPost: 'Техническому директору',
    greeting: 'Уважаемый Сергей Николаевич!',
    proposalTitle: 'на поставку мобильной координатно-измерительной машины типа «рука» PMT GAMMA+ P 2.5',
    currency: 'USD',
    vatMode: 'standard',
    vatRate: 22,
    deliveryDays: '12-14 рабочих недель с момента поступления аванса',
    warrantyMonths: '24 месяца',
    deliveryTerms: 'DDP склад Заказчика. Стоимость включает доставку, страховку, монтаж и инструктаж персонала.',
    paymentTerms: '70% предоплата, 30% после подписания акта ввода в эксплуатацию.',
    finalPriceNotes: 'В стоимость КИМ входит первичное обучение операторов и метрологическая аттестация.',
    managerName: 'С.Ю. Некрасов',
    managerPhone: '+7 (846) 954-02-92',
    managerEmail: 'info@ds-enginering.ru',
    specItems: [
      { id: 'kp103-1', name: 'Измерительная рука PMT GAMMA+ P 2.5 (диапазон 2,5 м, 6 осей, карбоновые рычаги, WiFi)', category: 'Оборудование', quantity: 1, unit: 'компл.', price: 54000 },
      { id: 'kp103-2', name: 'Первичная поверка средства измерений с регистрацией во ФГИС «АРШИН»', category: 'Метрология', quantity: 1, unit: 'усл.', price: 2100 },
      { id: 'kp103-3', name: 'Калибровочная керамическая сфера Ø25 мм и магнитная опора', category: 'Оснастка', quantity: 1, unit: 'компл.', price: 2150 },
      { id: 'kp103-4', name: 'ПО PolyWorks|Inspector Probing™ с модулями импорта CAD и генерации отчетов', category: 'ПО', quantity: 1, unit: 'лиц.', price: 11000 },
      { id: 'kp103-5', name: 'Курс обучения операторов КИМ с выдачей сертификатов (3 специалиста, 40 ч)', category: 'Обучение', quantity: 1, unit: 'курс', price: 1800 }
    ],
    blocks: [
      {
        id: 'block-spec-103',
        type: 'specification',
        title: 'Спецификация поставки'
      },
      {
        id: 'block-sig-103',
        type: 'signatures',
        showStamp: true
      }
    ]
  },

  // --- 4. Шаблон: ТО и Ремонт КИМ (Экспорт 0% НДС) ---
  {
    id: 'preset-cmm-service',
    code: 'ТО и Сервис КИМ',
    name: 'Шаблон: Сервисное ТО и юстировка КИМ (Экспорт 0% НДС)',
    description: 'Техническое обслуживание двухстоечной или портальной КИМ, экспортный режим со ставкой НДС 0%',
    documentType: 'main',
    proposalNumber: 'ДС-ТКП-2026/09-104',
    proposalDate: '21.09.2026 г.',
    validUntilDate: '21.10.2026 г.',
    toCompany: 'ТОО «Завод точного машиностроения»',
    contactPerson: 'Нурланов Арман Серикович',
    ceoPost: 'Главному инженеру',
    greeting: 'Уважаемый Арман Серикович!',
    proposalTitle: 'на техническое обслуживание, юстировку и калибровку координатно-измерительной машины',
    currency: 'RUB',
    vatMode: 'export_zero',
    vatRate: 0,
    deliveryDays: 'начало работ в течение 10 дней после согласования графика',
    warrantyMonths: '12 месяцев',
    deliveryTerms: 'Место проведения работ: производственная площадка Заказчика.',
    paymentTerms: '50% предоплата, 50% в течение 10 дней после подписания акта сдачи-приемки.',
    finalPriceNotes: 'Стоимость включает диагностику узлов КИМ, чистку направляющих, выставление перпендикулярности и калибровку.',
    managerName: 'С.Ю. Некрасов',
    managerPhone: '+7 (846) 954-02-92',
    managerEmail: 'info@ds-enginering.ru',
    specItems: [
      {
        id: 'kp104-1',
        name: 'Регламентное ТО портальной КИМ (диагностика приводов, чистка оптических линеек, коррекция геометрической матрицы ошибок, юстировка с лазерным интерферометром)',
        category: 'Сервис КИМ',
        quantity: 1,
        unit: 'усл.',
        price: 920000
      }
    ],
    blocks: [
      {
        id: 'block-spec-104',
        type: 'specification',
        title: 'СПЕЦИФИКАЦИЯ УСЛУГ'
      },
      {
        id: 'block-sig-104',
        type: 'signatures',
        showStamp: true
      }
    ]
  }
];
