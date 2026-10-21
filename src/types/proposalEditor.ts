/**
 * Types for the Modular A4 Commercial Documents (ТКП / Техническое задание / Спецификация) Editor & Renderer
 * ООО «ДС-Инжиниринг»
 */

export type DocumentType = 'main' | 'technical_task' | 'specification';

export type ProposalBlockType = 
  | 'header'
  | 'text'
  | 'specification'
  | 'totals'
  | 'gallery'
  | 'image'
  | 'page_break'
  | 'signatures'
  | 'tt_section';

export type FontFamilyType = 'pt-sans' | 'arial' | 'times' | 'roboto' | 'montserrat' | 'calibri' | 'mono' | 'serif';
export type TextAlignType = 'left' | 'center' | 'right' | 'justify';
export type PaginationMode = 'bottom_numbers' | 'top_x_of_y';

export interface TextFormattingOptions {
  fontFamily?: FontFamilyType;
  fontSize?: string; // e.g. '7pt', '7.5pt', '8pt', '8.5pt', '9pt', '10pt', '11pt', '12pt', '14pt'
  lineHeight?: string; // e.g. '1.0', '1.15', '1.25', '1.35', '1.5', '1.8'
  textAlign?: TextAlignType;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textIndent?: string; // e.g. '0mm', '5mm', '8mm', '10mm', '12.5mm' (красная строка)
  marginTop?: string; // e.g. '0mm', '2mm', '4mm', '6mm'
  marginBottom?: string; // e.g. '0mm', '2mm', '4mm', '6mm'
  textColor?: string;
  isBulletList?: boolean;
}

export interface ProposalImageItem {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  description?: string;
  widthPercent?: number; // 25, 40, 50, 60, 75, 100
  align?: 'left' | 'center' | 'right';
  hasBorder?: boolean;
  placement?: 'proposal_body' | 'tz_annex' | 'both';
}

export interface SpecificationItem {
  id: string;
  name: string;
  category?: string;
  sku?: string;
  quantity: number;
  unit: string;
  price: number; // Unit price without VAT
  discountPercent?: number;
  imageUrl?: string;
}

export interface TableColumnSettings {
  showIndex?: boolean;
  showSku?: boolean;
  showCategory?: boolean;
  showDiscount?: boolean;
  fontSize?: string;
  compactRows?: boolean;
}

export interface ProposalBlock {
  id: string;
  type: ProposalBlockType;
  title?: string;
  content?: string;
  formatting?: TextFormattingOptions;
  items?: SpecificationItem[];
  tableSettings?: TableColumnSettings;
  images?: ProposalImageItem[];
  imageItem?: ProposalImageItem;
  showStamp?: boolean;
  isSystemBlock?: boolean;
  sectionNumber?: number;
  canonicalKey?: string; // e.g. 'tt_1', 'tt_2', 'tt_3', 'tt_4', 'tt_5'
  executorSignerName?: string;
  executorSignerPost?: string;
  executorSignerFormat?: 'initials_surname' | 'surname_initials' | 'full';
  includeCustomerSignature?: boolean;
  customerSignerName?: string;
  customerSignerPost?: string;
  customerSignerFormat?: 'initials_surname' | 'surname_initials' | 'full';
}

export interface DocumentStyling {
  fontFamily: string; // 'pt-sans' | 'arial' | 'times' | 'roboto' | 'montserrat' | 'calibri' | 'mono'
  customFontFamily?: string;
  fontSize: string; // '7.5pt' | '8pt' | '8.5pt' | '9pt' | '10pt' | '11pt' | '12pt'
  customFontSize?: string;
  lineHeight: string; // '1.0' | '1.15' | '1.25' | '1.35' | '1.5' | '1.8'
  customLineHeight?: string;
  paragraphSpacing: string; // '0mm' | '2mm' | '3mm' | '4mm' | '6mm'
  customParagraphSpacing?: string;
  textIndent: string; // '0mm' | '5mm' | '8mm' | '10mm' | '12.5mm'
  pageMargins: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  paginationMode: PaginationMode;
  tableFontSize?: string;
  tableDensity?: 'compact' | 'normal' | 'spacious';
}

export interface OrganizationProfile {
  name: string; // ООО «ДС-Инжиниринг»
  address: string; // 443051, г. Самара, ул. Свободы, 198
  phone: string; // (846) 954-02-92
  phoneCityLabel: string; // тел/факс в Самаре
  email: string; // info@ds-enginering.ru
  inn: string; // 6312025587
  kpp: string; // 631201001
  ogrn: string; // 1026300777986
  directorPost: string; // Генеральный директор
  directorName: string; // С.Ю. Некрасов
  defaultVatRate: number; // 22
  executorContactPerson?: string;
  executorPhone?: string;
  website?: string;
  bankRequisites?: string;
}

export interface CommercialProposalTerms {
  deliveryTerms?: string; // Условия поставки
  finalPriceNotes?: string; // Конечная цена
  paymentTerms?: string; // Условия оплаты
  deliveryPeriod?: string; // Сроки поставки
  warrantyTerms?: string; // Гарантийное сервисное обслуживание КИМ и техническая поддержка
  validUntil?: string; // Срок действия (DD.MM.YYYY г.)
  currencyRateNote?: string; // Для USD
}

export interface ProposalAppendix {
  id: string;
  number: number; // 1, 2, 3...
  type: 'technical_task' | string;
  title: string; // e.g. 'Техническое задание'
  blocks: ProposalBlock[];
  pageBreakBefore?: boolean;
}

export interface CommercialProposalData {
  id?: string;
  dealId?: string;
  documentType: DocumentType;
  outgoingNumber: string;
  date: string;
  validUntilDate?: string;
  appendixNumber?: string; // Для обратной совместимости
  
  // Customer requisites (never mixed with seller)
  customerCompany: string;
  customerInn: string;
  customerKpp?: string;
  customerAddress?: string;
  customerCountry?: string;
  ceoName: string;
  ceoPost: string;
  greeting: string;
  
  title: string;
  procurementType: 'commercial' | '44fz' | '223fz';
  vatMode: 'standard' | 'export_zero' | 'no_vat' | 'custom';
  vatRate: number;
  currency: 'RUB' | 'USD' | 'EUR';
  
  // Terms & Conditions
  terms: CommercialProposalTerms;
  deliveryDays: string;
  warrantyMonths: string;
  
  // Executor & Signatures
  managerName: string;
  managerPost: string;
  managerPhone: string;
  managerEmail: string;
  includeStamp: boolean;
  
  // Content & Styling
  blocks: ProposalBlock[];
  appendices?: ProposalAppendix[];
  documentStyling: DocumentStyling;
  organization: OrganizationProfile;
  markdownContent?: string;
}

export const CANONICAL_TT_SECTIONS = [
  {
    key: 'tt_1',
    number: 1,
    title: '1. ОБЪЕКТ И ЦЕЛЬ РАБОТ',
    defaultContent: 'Настоящее Техническое задание определяет требования к проведению высокоточных метрологических измерений, контролю геометрических параметров и формированию паспорта точности изделий Заказчика с использованием координатно-измерительного оборудования и оптических 3D-сканеров.'
  },
  {
    key: 'tt_2',
    number: 2,
    title: '2. ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ',
    defaultContent: '1. Предельная погрешность измерений: в соответствии с ГОСТ Р ИСО 10360.\n2. Температурный режим метрологической лаборатории: 20 ± 1 °C, относительная влажность до 60%.\n3. Базирование и координатная привязка: по конструкторским базам CAD-модели в среде PolyWorks|Inspector.'
  },
  {
    key: 'tt_3',
    number: 3,
    title: '3. ЭТАПЫ И СОСТАВ РАБОТ',
    defaultContent: 'Этап 1: Входной контроль образцов, очистка и термостабилизация в метрологической лаборатории (12-24 ч).\nЭтап 2: Юстировка измерительной оснастки и сканирование/контактный обмер.\nЭтап 3: Совмещение облака точек с CAD-моделью, анализ отклонений формы и взаимного расположения (GD&T).\nЭтап 4: Формирование метрологического отчета и протокола измерений.'
  },
  {
    key: 'tt_4',
    number: 4,
    title: '4. РЕЗУЛЬТАТ ВЫПОЛНЕНИЯ РАБОТ',
    defaultContent: '1. Официальный протокол метрологических измерений с подписью инженера-метролога и печатью ООО «ДС-Инжиниринг».\n2. Цветовая карта отклонений в формате PDF и 3D-отчет PolyWorks Viewer.\n3. Математическая модель (CAD/STEP) при выполнении работ по реверс-инжинирингу.'
  },
  {
    key: 'tt_5',
    number: 5,
    title: '5. УСЛОВИЯ ПЕРЕДАЧИ ОБРАЗЦОВ',
    defaultContent: 'Образцы (детали, оснастка) передаются Исполнителю по Акту приема-передачи по адресу: 443051, г. Самара, ул. Свободы, 198. Доставка образцов до лаборатории и возврат после проведения измерений осуществляются силами и за счет Заказчика, если иное не согласовано дополнительно.'
  }
];

export const DEFAULT_ORGANIZATION_PROFILE: OrganizationProfile = {
  name: 'ООО «ДС-Инжиниринг»',
  address: '443051, г. Самара, ул. Свободы, 198',
  phone: '(846) 954-02-92',
  phoneCityLabel: 'тел/факс в Самаре',
  email: 'info@ds-enginering.ru',
  inn: '6312025587',
  kpp: '631201001',
  ogrn: '1026300777986',
  directorPost: 'Генеральный директор',
  directorName: 'С.Ю. Некрасов',
  defaultVatRate: 22,
  executorContactPerson: '',
  executorPhone: '',
  website: 'ds-enginering.ru',
  bankRequisites: ''
};

export const DEFAULT_DOCUMENT_STYLING: DocumentStyling = {
  fontFamily: 'pt-sans',
  fontSize: '9pt',
  lineHeight: '1.15',
  paragraphSpacing: '4pt',
  textIndent: '0mm',
  pageMargins: {
    top: '15mm',
    bottom: '15mm',
    left: '20mm',
    right: '15mm'
  },
  paginationMode: 'bottom_numbers',
  tableFontSize: '8.5pt',
  tableDensity: 'normal'
};

// ==========================================
// UNIFIED TKP & TZ GENERATOR TYPES
// ==========================================

export type DocumentKind = 'tkp' | 'tz' | 'package';
export type DetailLevel = 'express' | 'standard' | 'complex_project' | 'engineering_opk';

export interface TzSheetItem {
  id: string;
  appendixNumber: number;
  title: string;
  partName: string;
  drawingNumber: string;
  dimensions: string;
  weight: string;
  material: string;
  surfaceType: string;
  qualityClass: string;
  gdtRequirements: string[];
  equipmentType: string;
  temperatureConditions: string;
  reportFormat: string;
  notes: string;
}

export interface UnifiedDocumentModel {
  id: string;
  kind: DocumentKind;
  detailLevel: DetailLevel;
  version: number;
  createdAt: string;
  validUntil: string;
  dealId?: string;
  markdownContent?: string;
  header: {
    outgoingNumber: string;
    date: string;
    organization: OrganizationProfile;
    customer: {
      companyName: string;
      inn?: string;
      kpp?: string;
      ogrn?: string;
      legalAddress?: string;
      addresseePost?: string;
      addresseeName?: string;
      greeting?: string;
      contactPhone?: string;
      contactEmail?: string;
    };
  };
  commercial: {
    currency: 'RUB' | 'USD' | 'EUR' | 'CNY';
    vatRate: number;
    vatMode: 'standard' | 'no_vat' | 'export_zero';
    items: SpecificationItem[];
    paymentTerms: string;
    deliveryTerms: string;
    warrantyTerms: string;
  };
  tzSheets?: TzSheetItem[];
  signatures: {
    signatoryName: string;
    signatoryPost: string;
    includeFacsimile: boolean;
    includeStamp: boolean;
    includeCustomerSignatureBlock: boolean;
  };
}

