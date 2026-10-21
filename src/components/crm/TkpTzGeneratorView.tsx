import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  Layers,
  Wand2,
  Sliders,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Download,
  Save,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Search,
  Check,
  ShieldCheck,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  PenTool,
  Settings2,
  HelpCircle,
  FileCheck,
  PackageCheck,
  Eye,
  AlertCircle,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Edit3,
  Code,
  Percent,
  Sun,
  Moon,
  ArrowUp,
  ArrowDown,
  CheckCheck,
  ClipboardCopy,
  Box,
  Image as ImageIcon,
  Upload,
  X,
  FileBadge,
  ImagePlus,
  Briefcase,
  ArrowDownRight,
  Stamp,
  FileSignature
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { ExtendedDeal } from '../../types';
import { 
  SpecificationItem, 
  DEFAULT_ORGANIZATION_PROFILE, 
  DEFAULT_DOCUMENT_STYLING,
  DetailLevel,
  TzSheetItem,
  ProposalImageItem
} from '../../types/proposalEditor';
import { DetailLevelSelector } from './generator/DetailLevelSelector';
import { SiteImageLibraryModal } from './generator/SiteImageLibraryModal';
import { ProposalVerifierModal } from './generator/ProposalVerifierModal';
import { runProposalVerification, VerificationResult } from '../../utils/proposalVerifier';
import { 
  TkpSectionCard, 
  TkpFormField, 
  TkpTextInput, 
  TkpSelect, 
  TkpTextarea, 
  TkpButton 
} from './generator/TkpUIComponents';
import { formatMoneyRu, generateProposalMarkdown, parseProposalMarkdown } from '../../utils/proposalMarkdownSync';
import { numberToWordsRu } from '../../utils/numberToWordsRu';
import { parseRussianLeaderGreeting } from '../../utils/printProposal';
import { CORPORATE_PROPOSAL_PRESETS, ProposalPreset } from '../../data/proposalPresets';
import { PriceItem, INDUSTRIAL_PRICE_LIST } from '../../data/priceListsData';
import { 
  searchRussianEnterprises, 
  RussianEnterprise, 
  RUSSIAN_ENTERPRISES_REGISTRY 
} from '../../data/russianEnterprises';
import { DadataOrganizationDropdown } from './DadataOrganizationDropdown';
import { apiService } from '../../services/apiService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { EMBLEM_DATA_URL } from '../../utils/emblemBase64';
import { 
  handleUnifiedA4ExportAction, 
  calculateTableVat22, 
  HARDCODED_DEFAULT_VAT_RATE 
} from '../../utils/a4DocumentExportHandler';

export type DocumentMode = 'tkp' | 'tz' | 'package';
export type EditorMode = 'fields' | 'markdown';
export type PreviewSheet = 'tkp' | 'tkp_terms' | string | 'all'; // 'tkp', 'tkp_terms', tzSheet.id, or 'all'

export interface TkpPagePlan {
  id: string;
  type: 'single' | 'spec_first' | 'spec_continue' | 'terms';
  sheetIndex: number;
  itemsChunk?: SpecificationItem[];
  itemStartIndex?: number;
  isLastSpecChunk?: boolean;
  title: string;
}

export interface CompanyEmployee {
  id: string;
  fullName: string;
  shortName: string;
  position: string;
  phone: string;
  email: string;
  displayLabel: string;
}

export const DS_COMPANY_EMPLOYEES: CompanyEmployee[] = [
  {
    id: 'none',
    fullName: '',
    shortName: 'Не указан',
    position: '',
    phone: '',
    email: '',
    displayLabel: '— Не указывать исполнителя (только Генеральный директор) —'
  },
  {
    id: 'emp-skobelev',
    fullName: 'Скобелев Александр Сергеевич',
    shortName: 'Скобелев А.С.',
    position: 'Инженер по внедрению CAD/CAM и постпроцессорам',
    phone: '+7 (937) 984-61-51',
    email: 'a.skobelev@ds-enginering.ru',
    displayLabel: 'Скобелев А.С. (Инженер по внедрению CAD/CAM и постпроцессорам)'
  },
  {
    id: 'emp-yarish-i',
    fullName: 'Ярыш Иван Владимирович',
    shortName: 'Ярыш И.В.',
    position: 'Инженер-метролог',
    phone: '+7 (927) 748-46-58',
    email: 'i.yarish@ds-enginering.ru',
    displayLabel: 'Ярыш И.В. (Инженер-метролог)'
  },
  {
    id: 'emp-yarish-a',
    fullName: 'Ярыш Александр Владимирович',
    shortName: 'Ярыш А.В.',
    position: 'Инженер по подбору оборудования и ПО',
    phone: '+7 (927) 719-06-97',
    email: 'a.yarish@ds-enginering.ru',
    displayLabel: 'Ярыш А.В. (Инженер по подбору оборудования и ПО)'
  },
  {
    id: 'emp-morozov',
    fullName: 'Морозов Владимир Георгиевич',
    shortName: 'Морозов В.Г.',
    position: 'Руководитель КТО',
    phone: '+7 (902) 371-20-16',
    email: 'v.morozov@ds-enginering.ru',
    displayLabel: 'Морозов В.Г. (Руководитель КТО)'
  }
];

export const CATALOG_PRESET_ITEMS: Array<{
  name: string;
  category: string;
  sku: string;
  price: number;
  unit: string;
}> = [
  {
    name: 'Координатно-измерительная машина Mitutoyo Crysta-Apex V9106 (диапазон 900x1000x600 мм, ЧПУ, точность MPEE от (1.7 + 3L/1000) мкм)',
    category: 'Оборудование',
    sku: 'MIT-CA-V9106',
    price: 14500000,
    unit: 'компл.'
  },
  {
    name: 'Метрологическое программное обеспечение PolyWorks|Inspector™ Premium (лицензия, CAD-модуль, GD&T, протоколы)',
    category: 'ПО',
    sku: 'PW-INSP-PREM',
    price: 2150000,
    unit: 'лиц.'
  },
  {
    name: 'Оптический 3D-сканер Scantech KSCAN-Magic (лазер + встроенная фотограмметрия, точность 0.020 мм, класс СИ)',
    category: 'Оборудование',
    sku: 'SCN-KSCAN-MAG',
    price: 4850000,
    unit: 'компл.'
  },
  {
    name: 'Портативный лазерный 3D-сканер SIMSCAN 42 (скорость 2.8 млн изм/сек, класс СИ)',
    category: 'Оборудование',
    sku: 'SCN-SIMSCAN-42',
    price: 3200000,
    unit: 'компл.'
  },
  {
    name: 'Интегрированная CAD/CAM система TopSolid 7 5-Axis Machining (лицензия, постпроцессор ЧПУ, симуляция PDM)',
    category: 'ПО',
    sku: 'TS7-5AXIS-CADCAM',
    price: 1850000,
    unit: 'лиц.'
  },
  {
    name: 'Услуги прецизионного 3D-сканирования, контроля точности формы и протокол отклонений GD&T (лаборатория ЦЗЛ)',
    category: 'Услуги',
    sku: 'SRV-SCAN-GDT',
    price: 180000,
    unit: 'услуга'
  },
  {
    name: 'Разработка управляющих программ и постпроцессоров для 5-осевых станков с ЧПУ (Heidenhain/Siemens/Fanuc)',
    category: 'Услуги',
    sku: 'SRV-CAM-POST',
    price: 250000,
    unit: 'проект'
  },
  {
    name: 'Пусконаладочные работы, юстировка лазерным интерферометром Renishaw и инструктаж операторов (40 ч)',
    category: 'Услуги',
    sku: 'SRV-PBR-CMM',
    price: 480000,
    unit: 'услуга'
  }
];

export interface TkpTzGeneratorViewProps {
  onBack?: () => void;
  initialDealId?: string;
  initialProposalId?: string;
  initialPriceItem?: PriceItem | null;
  onSaveDocumentToDeal?: (dealId: string, doc: any, proposalData: any) => void;
  isFullscreenDefault?: boolean;
}

export const TkpTzGeneratorView: React.FC<TkpTzGeneratorViewProps> = ({
  onBack,
  initialDealId,
  initialProposalId,
  initialPriceItem,
  onSaveDocumentToDeal,
  isFullscreenDefault
}) => {
  const { 
    deals, 
    commercialProposals, 
    addCommercialProposal, 
    updateCommercialProposal, 
    updateDeal, 
    showToast,
    documentDetailLevel,
    setDocumentDetailLevel,
    crmSettings
  } = useApp();

  // Unified global theme context: Quotation Generator inherits the same UI style as main site
  const { theme, toggleTheme, isDark } = useTheme();

  // Mode: Editing existing proposal vs Creating new proposal
  const isEditMode = Boolean(initialProposalId);

  // Fullscreen Studio State (True by default or controllable)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(isFullscreenDefault ?? false);

  // Keyboard shortcut Esc to toggle/exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Detail Level: 'express' | 'standard' | 'complex_project'
  const [detailLevel, setDetailLevel] = useState<DetailLevel>(() => {
    if (documentDetailLevel === 'engineering_opk') return 'complex_project';
    return documentDetailLevel || 'standard';
  });

  const handleDetailLevelChange = (lvl: DetailLevel) => {
    const normalized = lvl === 'engineering_opk' ? 'complex_project' : lvl;
    setDetailLevel(normalized);
    if (setDocumentDetailLevel) {
      setDocumentDetailLevel(normalized);
    }
  };

  // Editor mode: 'fields' (интерактивный конструктор) | 'markdown' (прямой Markdown-редактор)
  const [editorMode, setEditorMode] = useState<EditorMode>('fields');

  // Template Mode: 'official' (Бланк ООО «ДС-Инжиниринг») or 'impersonal' (Обезличенный шаблон White-label)
  const [templateMode, setTemplateMode] = useState<'official' | 'impersonal'>('official');
  const [impersonalSignerName, setImpersonalSignerName] = useState<string>('');

  // Attached Proposal / Technical Assignment Images & Drawings
  const [proposalImages, setProposalImages] = useState<ProposalImageItem[]>([]);
  const [isSiteLibraryOpen, setIsSiteLibraryOpen] = useState(false);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [isDadataModalOpen, setIsDadataModalOpen] = useState(false);
  const [dadataSearchQuery, setDadataSearchQuery] = useState('');
  const [dadataSearchResults, setDadataSearchResults] = useState<RussianEnterprise[]>([]);
  const [isSearchingDadataModal, setIsSearchingDadataModal] = useState(false);
  const [dadataModalError, setDadataModalError] = useState<string | null>(null);

  // Live DaData search effect for company modal
  useEffect(() => {
    if (!isDadataModalOpen) return;
    const trimmed = dadataSearchQuery.trim();
    if (!trimmed) {
      setDadataSearchResults(RUSSIAN_ENTERPRISES_REGISTRY.slice(0, 10));
      setDadataModalError(null);
      setIsSearchingDadataModal(false);
      return;
    }

    let isMounted = true;
    setIsSearchingDadataModal(true);
    setDadataModalError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await apiService.searchCompanyByDadata(trimmed);
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const converted: RussianEnterprise[] = res.data.map((item: any) => {
            const d = item.data || {};
            const valName = item.value || d.name?.short_with_opf || d.name?.full_with_opf || trimmed;
            const short = d.name?.short_with_opf || d.name?.short || valName;
            const full = d.name?.full_with_opf || d.name?.full || valName;
            const addr = d.address?.unrestricted_value || d.address?.value || (typeof d.address === 'string' ? d.address : '');
            const cityName = d.address?.data?.city || d.address?.data?.settlement || 'Москва';
            
            const ceoRawName = d.management?.name || d.fio?.name || (d.fio ? [d.fio.surname, d.fio.name, d.fio.patronymic].filter(Boolean).join(' ') : 'Руководитель');
            const ceoRawPost = d.management?.post || (d.fio ? 'Индивидуальный предприниматель' : 'Генеральный директор');
            
            const ceoDeclined = d.management?.formatted?.ceoDative || `${ceoRawName}`;
            const postDeclined = d.management?.formatted?.postDative || (ceoRawPost.toLowerCase().includes('директор') ? 'Генеральному директору' : 'Руководителю');

            const nameParts = ceoRawName.replace(/\(.*\)/, '').trim().split(' ');
            const greet = nameParts.length >= 2 
              ? `Уважаемый ${nameParts[1]}${nameParts[2] ? ' ' + nameParts[2] : ''}!`
              : 'Уважаемые партнеры!';

            return {
              inn: d.inn || item.inn || trimmed.replace(/\D/g, ''),
              kpp: d.kpp || '',
              ogrn: d.ogrn || '',
              name: short,
              shortName: short,
              fullName: full,
              address: addr,
              city: cityName,
              ceoPost: postDeclined,
              ceoName: ceoDeclined,
              greeting: greet,
              industry: d.okved ? `ОКВЭД ${d.okved} • ${d.okved_type || 'Машиностроение'}` : 'Промышленность и машиностроение',
              phone: d.phones?.[0]?.value || undefined,
              email: d.emails?.[0]?.value || undefined
            };
          });

          setDadataSearchResults(converted);
          setDadataModalError(null);
          return;
        }

        // Fallback to local verified registry of official partner enterprises (no fake synthesis!)
        const localMatches = searchRussianEnterprises(trimmed);
        if (localMatches.length > 0) {
          setDadataSearchResults(localMatches);
          setDadataModalError(null);
        } else {
          setDadataSearchResults([]);
          setDadataModalError(res.error || `По запросу «${trimmed}» организация не найдена в ЕГРЮЛ через DaData.`);
        }
      } catch (err: any) {
        if (!isMounted) return;
        const localMatches = searchRussianEnterprises(trimmed);
        setDadataSearchResults(localMatches);
        if (localMatches.length === 0) {
          setDadataModalError(err?.message || 'Ошибка поиска в DaData');
        }
      } finally {
        if (isMounted) {
          setIsSearchingDadataModal(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [dadataSearchQuery, isDadataModalOpen]);

  // Active Section Tab in Fields Mode
  const [activeSectionTab, setActiveSectionTab] = useState<'all' | 'requisites' | 'spec' | 'terms' | 'images' | 'tz' | 'sign' | 'verifier'>('all');

  // Preview Scale Mode: 'fit' (по умолчанию вписан в окно), '100', 'width', 'custom'
  const [zoomMode, setZoomMode] = useState<'fit' | '100' | 'width'>('fit');
  const [customZoom, setCustomZoom] = useState<number>(1);
  const [calculatedFitScale, setCalculatedFitScale] = useState<number>(0.75);

  // Active sheet being previewed: 'tkp' | tzSheetId | 'all'
  const [activePreviewSheet, setActivePreviewSheet] = useState<PreviewSheet>('tkp');

  // Search in companies & DaData loading
  const [isDadataLoading, setIsDadataLoading] = useState(false);
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);

  // Selected Employee / Executor from Company Registry
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('emp-skobelev');

  // ----------------------------------------------------
  // Document State
  // ----------------------------------------------------
  const [outgoingNumber, setOutgoingNumber] = useState<string>(() => {
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const rnd = Math.floor(100 + Math.random() * 900);
    return `ДС-ТКП-2026/${month}-${rnd}`;
  });
  const [documentDate, setDocumentDate] = useState<string>(() => new Date().toLocaleDateString('ru-RU'));
  const [validUntilDate, setValidUntilDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString('ru-RU');
  });
  const [currency, setCurrency] = useState<'RUB' | 'USD' | 'EUR' | 'CNY'>('RUB');
  const [vatMode, setVatMode] = useState<'standard' | 'no_vat' | 'export_zero' | 'custom'>('standard');
  const [vatRate, setVatRate] = useState<number>(crmSettings?.defaultVatRate ?? 22);

  // A4 Multi-page TKP Pagination Mode: 'auto' | 'single' | 'two_pages'
  const [tkpPageSplitMode, setTkpPageSplitMode] = useState<'auto' | 'single' | 'two_pages'>('auto');

  // Live Price Catalog & Quick Picker State
  const [livePriceCatalog, setLivePriceCatalog] = useState<PriceItem[]>(INDUSTRIAL_PRICE_LIST);
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('all');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>('');

  useEffect(() => {
    fetch('/api/crm/price-items')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setLivePriceCatalog(data.items);
        }
      })
      .catch(err => console.warn('Live price items fetch skipped:', err));
  }, []);

  // Response to Incoming Reference (На № ... от ...)
  const [hasIncomingRef, setHasIncomingRef] = useState<boolean>(false);
  const [incomingNumber, setIncomingNumber] = useState<string>('');
  const [incomingDate, setIncomingDate] = useState<string>('');

  // Typography & Table Appearance
  const [fontFamily, setFontFamily] = useState<'times' | 'arial' | 'calibri'>('times');
  const [tableBorderColor, setTableBorderColor] = useState<string>('#000000');
  const [tableBorderWidth, setTableBorderWidth] = useState<'1px' | '2px' | '0px'>('1px');
  const [tableBorderStyle, setTableBorderStyle] = useState<'solid' | 'double' | 'dashed'>('solid');
  const [tableCellPadding, setTableCellPadding] = useState<'compact' | 'standard' | 'spacious'>('standard');

  // Customer Requisites
  const [customerCompany, setCustomerCompany] = useState('ООО "АВИА-ТЕХНОЛОГИИ"');
  const [customerInn, setCustomerInn] = useState('6312089450');
  const [customerKpp, setCustomerKpp] = useState('631201001');
  const [customerOgrn, setCustomerOgrn] = useState('1036300554120');
  const [customerAddress, setCustomerAddress] = useState('443022, г. Самара, Заводское шоссе, д. 18, корп. 3');
  const [ceoPost, setCeoPost] = useState('Генеральному директору');
  const [ceoName, setCeoName] = useState('Воронову Алексею Михайловичу');
  const [contactPerson, setContactPerson] = useState('Смирнов Дмитрий Сергеевич (Главный метролог)');
  const [contactPhone, setContactPhone] = useState('+7 (846) 205-11-22');
  const [contactEmail, setContactEmail] = useState('metrology@avia-tech.ru');
  const [greeting, setGreeting] = useState('Уважаемый Алексей Михайлович!');
  const [selectedDealId, setSelectedDealId] = useState<string>(initialDealId || '');

  // Proposal Specification
  const [proposalTitle, setProposalTitle] = useState('на поставку координатно-измерительного оборудования, метрологического ПО и проведение пусконаладочных работ');
  const [specItems, setSpecItems] = useState<SpecificationItem[]>([
    {
      id: 'item-1',
      name: 'Координатно-измерительная машина Mitutoyo Crysta-Apex V9106 (диапазон 900x1000x600 мм, ЧПУ, точность MPEE от (1.7 + 3L/1000) мкм)',
      category: 'Оборудование',
      sku: 'MIT-CA-V9106',
      quantity: 1,
      unit: 'компл.',
      price: 14500000,
      discountPercent: 5
    },
    {
      id: 'item-2',
      name: 'Метрологическое программное обеспечение MCOSMOS-1 v5 (лицензия, геометрический модуль, протоколы GD&T)',
      category: 'ПО',
      sku: 'MIT-MCOSMOS-1',
      quantity: 1,
      unit: 'лиц.',
      price: 1250000,
      discountPercent: 0
    },
    {
      id: 'item-3',
      name: 'Пусконаладочные работы, юстировка лазерным интерферометром Renishaw и инструктаж операторов (3 специалиста, 40 ч)',
      category: 'Услуги',
      sku: 'SRV-PBR-CMM',
      quantity: 1,
      unit: 'услуга',
      price: 480000,
      discountPercent: 0
    }
  ]);

  // Multiple Technical Task (ТЗ) Sheets
  const [tzSheets, setTzSheets] = useState<TzSheetItem[]>([
    {
      id: 'tz-sheet-1',
      appendixNumber: 1,
      title: 'Техническое задание на контроль геометрии и 3D-сканирование корпуса турбокомпрессора',
      partName: 'Корпус турбокомпрессора ТК-140',
      drawingNumber: 'Черт. № 424.01.10.005-СБ',
      dimensions: '520 × 440 × 280 мм',
      weight: '38.5 кг',
      material: 'Алюминиевый сплав АК7ч (ГОСТ 1583-93)',
      surfaceType: 'Механически обработанная, матовая',
      qualityClass: 'IT6 — IT7 (допуски от 12 до 25 мкм)',
      gdtRequirements: [
        'Отклонение от плоскостности привалочных фланцев: не более 0.015 мм (ГОСТ Р 53442-2015)',
        'Соосность расточек под подшипники вала: не более 0.012 мм',
        'Перпендикулярность торцев оси базовых отверстий: не более 0.020 мм',
        'Позиционный допуск осей крепежных отверстий: Ø 0.15 мм (от базы A|B|C)'
      ],
      equipmentType: 'КИМ Mitutoyo Crysta-Apex V9106 / Оптический 3D-сканер Scantech KSCAN-Magic',
      temperatureConditions: '+20 °C ± 0.5 °C (по ГОСТ 8.050-73)',
      reportFormat: 'Официальный протокол измерений геометрии и отклонений GD&T (PDF), CAD-модель (STEP)',
      notes: 'Первичная калибровка лазерным интерферометром. Предоставление протокола поверки во ФГИС «АРШИН».'
    }
  ]);

  // Active TZ sheet being edited in fields mode
  const [activeTzEditId, setActiveTzEditId] = useState<string>(tzSheets[0]?.id || '');

  // Terms & Conditions
  const [paymentTermsCustom, setPaymentTermsCustom] = useState('50% — аванс в течение 5 банковских дней, 50% — по готовности к отгрузке со склада в Самаре.');
  const [deliveryDays, setDeliveryDays] = useState('до 15 (пятнадцати) рабочих дней с момента получения аванса');
  const [deliveryPlace, setDeliveryPlace] = useState('Доставка на склад Заказчика силами Исполнителя (DDP Самара)');
  const [warrantyMonths, setWarrantyMonths] = useState('24 месяца с даты подписания акта пусконаладки');
  const [serviceSla, setServiceSla] = useState('Регламент реагирования сервисной службы «ДС-Инжиниринг» — в течение 48 часов, подменный фонд измерительных щупов Renishaw.');
  
  // Signatory is strictly the General Director S.Y. Nekrasov
  const signatoryName = 'Некрасов С.Ю.';
  const signatoryPost = 'Генеральный директор';
  
  const [includeCustomerSignatureBlock, setIncludeCustomerSignatureBlock] = useState(true);
  const [includeFacsimile, setIncludeFacsimile] = useState(true);
  const [includeOfficialSeal, setIncludeOfficialSeal] = useState(true);
  const [customNotes, setCustomNotes] = useState('Оборудование внесено в Государственный реестр средств измерений РФ (ФГИС «АРШИН»). Первичная поверка включена в стоимость.');

  // Has Technical Specification (ТЗ) attached
  const hasTz = (detailLevel === 'complex_project' || detailLevel === 'engineering_opk') && tzSheets.length > 0;

  // Ref to track which proposal ID has already been loaded into form state
  const loadedProposalIdRef = useRef<string | null>(null);

  // Initialize from initialProposalId if passed for seamless editing
  useEffect(() => {
    if (initialProposalId && loadedProposalIdRef.current !== initialProposalId) {
      const p = commercialProposals.find(item => item.id === initialProposalId);
      if (p) {
        loadedProposalIdRef.current = initialProposalId;
        if (p.outgoingNumber) setOutgoingNumber(p.outgoingNumber);
        if (p.date) setDocumentDate(p.date);
        if (p.validUntil) setValidUntilDate(p.validUntil);
        if (p.hasIncomingRef !== undefined) setHasIncomingRef(Boolean(p.hasIncomingRef));
        if (p.incomingNumber) setIncomingNumber(p.incomingNumber);
        if (p.incomingDate) setIncomingDate(p.incomingDate);
        if (p.fontFamily) setFontFamily(p.fontFamily as any);
        if (p.tableBorderColor) setTableBorderColor(p.tableBorderColor);
        if (p.tableBorderWidth) setTableBorderWidth(p.tableBorderWidth as any);
        if (p.tableBorderStyle) setTableBorderStyle(p.tableBorderStyle as any);
        if (p.tableCellPadding) setTableCellPadding(p.tableCellPadding as any);
        if (p.toCompany) setCustomerCompany(p.toCompany);
        if ((p as any).customerInn) setCustomerInn((p as any).customerInn);
        if ((p as any).customerKpp) setCustomerKpp((p as any).customerKpp);
        if ((p as any).customerOgrn) setCustomerOgrn((p as any).customerOgrn);
        if ((p as any).customerAddress) setCustomerAddress((p as any).customerAddress);
        if ((p as any).ceoPost) setCeoPost((p as any).ceoPost);
        if (p.contactPerson) setCeoName(p.contactPerson);
        if (p.contactPhone) setContactPhone(p.contactPhone);
        if ((p as any).contactEmail) setContactEmail((p as any).contactEmail);
        if ((p as any).greeting) setGreeting((p as any).greeting);
        if (p.content) setProposalTitle(p.content);
        if (p.dealId) setSelectedDealId(p.dealId);
        if (p.currency) setCurrency(p.currency as any);
        if (p.vatMode) setVatMode(p.vatMode as any);
        if (p.vatRate !== undefined) setVatRate(p.vatRate);
        if ((p as any).customNotes) setCustomNotes((p as any).customNotes);
        else if (p.note) setCustomNotes(p.note);
        if ((p as any).detailLevel) setDetailLevel((p as any).detailLevel);
        if ((p as any).paymentTermsCustom) setPaymentTermsCustom((p as any).paymentTermsCustom);
        if ((p as any).deliveryDays) setDeliveryDays((p as any).deliveryDays);
        if ((p as any).deliveryPlace) setDeliveryPlace((p as any).deliveryPlace);
        if ((p as any).warrantyMonths) setWarrantyMonths((p as any).warrantyMonths);
        if ((p as any).serviceSla) setServiceSla((p as any).serviceSla);
        if ((p as any).includeCustomerSignatureBlock !== undefined) {
          setIncludeCustomerSignatureBlock(Boolean((p as any).includeCustomerSignatureBlock));
        }
        if ((p as any).isNeutralTemplate || (p as any).templateMode === 'impersonal') {
          setTemplateMode('impersonal');
        }
        if ((p as any).impersonalSignerName) {
          setImpersonalSignerName((p as any).impersonalSignerName);
        }
        if ((p as any).documentImages && Array.isArray((p as any).documentImages)) {
          setProposalImages((p as any).documentImages);
        }
        
        const rawItems = (p as any).specItems || p.items;
        if (rawItems && Array.isArray(rawItems) && rawItems.length > 0) {
          setSpecItems(rawItems.map((item: any, idx: number) => ({
            id: item.id || `item-spec-${idx}-${Date.now()}`,
            name: item.name || item.title || 'Позиция спецификации',
            category: item.category || 'Оборудование',
            sku: item.sku || `DS-${idx + 1}`,
            quantity: item.quantity !== undefined ? item.quantity : 1,
            unit: item.unit || 'компл.',
            price: item.price !== undefined ? item.price : (item.priceRub || 0),
            discountPercent: item.discountPercent || 0
          })));
        } else if (p.amount && p.amount > 0) {
          setSpecItems([
            {
              id: `item-spec-${p.id}`,
              name: p.content || 'Поставка оборудования и инжиниринговые услуги',
              category: 'Оборудование',
              quantity: 1,
              unit: 'компл.',
              price: p.subtotalWithoutVat || Math.round(p.amount / 1.22),
              discountPercent: 0
            }
          ]);
        }

        if ((p as any).tzSheets && Array.isArray((p as any).tzSheets) && (p as any).tzSheets.length > 0) {
          setTzSheets((p as any).tzSheets);
        }
        
        // Match employee by preparedBy
        const matchedEmp = DS_COMPANY_EMPLOYEES.find(e => e.shortName === p.preparedBy || e.fullName === p.preparedBy);
        if (matchedEmp) {
          setSelectedEmployeeId(matchedEmp.id);
        }
      }
    }
  }, [initialProposalId, commercialProposals]);

  // Initialize from initialDealId if passed
  useEffect(() => {
    if (initialDealId && deals) {
      const d = deals.find(item => item.id === initialDealId);
      if (d) {
        setSelectedDealId(d.id);
        if (d.company) setCustomerCompany(d.company);
        if (d.contactName) setCeoName(d.contactName);
        if (d.contactPhone) setContactPhone(d.contactPhone);
        if (d.contactEmail) setContactEmail(d.contactEmail);
        if (d.title) setProposalTitle(`на поставку оборудования и выполнение работ по проекту «${d.title}»`);
        if (d.amount && d.amount > 0 && specItems.length === 0) {
          setSpecItems([
            {
              id: `item-deal-${d.id}`,
              name: `Комплекс оборудования и услуг по проекту «${d.title}»`,
              category: d.serviceType || 'Оборудование',
              quantity: 1,
              unit: 'компл.',
              price: d.amount,
              discountPercent: 0
            }
          ]);
        }
      }
    }
  }, [initialDealId, deals]);

  // Initialize from initialPriceItem if passed
  useEffect(() => {
    if (initialPriceItem) {
      setSpecItems([
        {
          id: `item-price-${Date.now()}`,
          name: `${initialPriceItem.name} ${initialPriceItem.model ? `(${initialPriceItem.model})` : ''}`.trim(),
          category: initialPriceItem.category || 'Оборудование',
          sku: initialPriceItem.sku || 'DS-ITEM-01',
          quantity: 1,
          unit: initialPriceItem.unit || 'компл.',
          price: initialPriceItem.priceRub || 150000,
          discountPercent: 0
        }
      ]);
      setProposalTitle(`на поставку оборудования: ${initialPriceItem.name}`);
    }
  }, [initialPriceItem]);

  // Selected Employee object
  const selectedEmployee = useMemo(() => {
    return DS_COMPANY_EMPLOYEES.find(e => e.id === selectedEmployeeId) || DS_COMPANY_EMPLOYEES[0];
  }, [selectedEmployeeId]);

  // Markdown direct source code state
  const [markdownSource, setMarkdownSource] = useState<string>('');

  // Container refs for auto-fitting
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const printSheetRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);


  // Sync greeting when customer name changes (always enforcing Nominative case)
  useEffect(() => {
    if (ceoName) {
      const parsed = parseRussianLeaderGreeting(ceoName, ceoPost);
      if (parsed.greeting && parsed.greeting !== 'Уважаемые партнеры!') {
        setGreeting(parsed.greeting);
      }
    }
  }, [ceoName, ceoPost]);

  // Clean outgoing number without duplicated "Исх. №"
  const cleanOutgoingNumber = useMemo(() => {
    if (!outgoingNumber) return 'ДС-ТКП-2026/09-835';
    return outgoingNumber
      .replace(/^(исх\.?\s*№?\s*)+/gi, '')
      .replace(/^(№\s*)+/gi, '')
      .trim() || 'ДС-ТКП-2026/09-835';
  }, [outgoingNumber]);

  // Display greeting strictly normalized in nominative case: «Уважаемый Алексей Михайлович!»
  const displayGreeting = useMemo(() => {
    if (!greeting || !greeting.trim()) return 'Уважаемый Алексей Михайлович!';
    let str = greeting.trim().replace(/[!.]+$/, '');

    // Exact match fixes for common names
    str = str.replace(/Уважаем(?:ый|ому|ой)\s+Алексе[юя]\s+Михайлович[уа]/gi, 'Уважаемый Алексей Михайлович');
    str = str.replace(/Уважаем(?:ый|ому|ой)\s+Алексе[юя]\s+Викторович[уа]/gi, 'Уважаемый Алексей Викторович');
    str = str.replace(/Уважаем(?:ый|ому|ой)\s+Дмитри[юя]\s+Сергеевич[уа]/gi, 'Уважаемый Дмитрий Сергеевич');
    str = str.replace(/Уважаем(?:ый|ому|ой)\s+Серге[юя]\s+Юрьевич[уа]/gi, 'Уважаемый Сергей Юрьевич');

    // General nominative transformation for "Уважаемый Имярек Отчество"
    str = str.replace(
      /^(Уважаем(?:ый|ая|ому|ой))\s+([А-Яа-яЁё]+)\s+([А-Яа-яЁё]+)$/i,
      (_full, _salut, rawFirst, rawPatron) => {
        let first = rawFirst;
        let patron = rawPatron;
        if (/(ович|евич|ич)[уа]$/i.test(patron)) {
          patron = patron.replace(/[уа]$/i, '');
        } else if (/(овн|евн|ичн)[еы]$/i.test(patron)) {
          patron = patron.replace(/[еы]$/i, 'а');
        }
        if (/ею$/i.test(first)) {
          first = first.replace(/ею$/i, 'ей');
        } else if (/аю$/i.test(first)) {
          first = first.replace(/аю$/i, 'ай');
        } else if (/ию$/i.test(first)) {
          first = first.replace(/ию$/i, 'ий');
        } else if (/у$/i.test(first) && !/илья|никита/i.test(first)) {
          first = first.replace(/у$/i, '');
        } else if (/е$/i.test(first) && first.length > 3) {
          first = first.replace(/е$/i, 'а');
        }
        const isFemale = /(на|овна|евна|ична)$/i.test(patron);
        return `${isFemale ? 'Уважаемая' : 'Уважаемый'} ${first} ${patron}`;
      }
    );

    return `${str}!`;
  }, [greeting]);

  // Financial Calculations with verified 22% VAT rate logic
  const financialTotals = useMemo(() => {
    let subtotal = 0;
    specItems.forEach(item => {
      const itemPrice = item.price * (1 - (item.discountPercent || 0) / 100);
      subtotal += itemPrice * item.quantity;
    });

    const vatCalc = calculateTableVat22(subtotal, vatMode, vatRate || HARDCODED_DEFAULT_VAT_RATE);

    return {
      subtotal,
      vatAmount: vatCalc.vatAmount,
      totalWithVat: vatCalc.totalWithVat,
      vatLabel: `2. ${vatCalc.vatLabel}`,
      totalLabel: `3. ${vatCalc.totalLabel}`,
      vatSheetLabel: vatCalc.vatLabel,
      totalSheetLabel: vatCalc.totalLabel,
      vatNotice: vatCalc.vatNotice,
      subtotalFormatted: formatMoneyRu(subtotal, currency),
      vatAmountFormatted: formatMoneyRu(vatCalc.vatAmount, currency),
      totalWithVatFormatted: formatMoneyRu(vatCalc.totalWithVat, currency),
      wordsRu: numberToWordsRu(vatCalc.totalWithVat)
    };
  }, [specItems, vatMode, vatRate, currency]);

  // Dynamic A4 Document Pagination Plan (Handles multi-page overflow seamlessly)
  const tkpPagesPlan = useMemo<TkpPagePlan[]>(() => {
    const hasImages = proposalImages.filter(img => img.placement === 'proposal_body' || img.placement === 'both' || !img.placement).length > 0;
    const hasLongNotes = Boolean((customNotes && customNotes.length > 50) || (serviceSla && serviceSla.length > 70));

    // Force single page mode only if explicitly selected and short
    if (tkpPageSplitMode === 'single') {
      return [{
        id: 'tkp-p1',
        type: 'single',
        sheetIndex: 1,
        itemsChunk: specItems,
        itemStartIndex: 0,
        isLastSpecChunk: true,
        title: 'ТКП (1 лист)'
      }];
    }

    // Auto-detect: if items <= 2 and no images and short notes => fits on 1 sheet
    if (tkpPageSplitMode === 'auto' && specItems.length <= 2 && !hasImages && !hasLongNotes) {
      return [{
        id: 'tkp-p1',
        type: 'single',
        sheetIndex: 1,
        itemsChunk: specItems,
        itemStartIndex: 0,
        isLastSpecChunk: true,
        title: 'ТКП (1 лист)'
      }];
    }

    // Multi-page mode:
    const plans: TkpPagePlan[] = [];
    const firstPageCapacity = 6; // Page 1 with full header fits up to 6 items

    if (specItems.length <= firstPageCapacity) {
      // Page 1: Header + Spec Table + Totals + Page 2 pointer
      plans.push({
        id: 'tkp-p1',
        type: 'spec_first',
        sheetIndex: 1,
        itemsChunk: specItems,
        itemStartIndex: 0,
        isLastSpecChunk: true,
        title: 'Лист 1: Спецификация'
      });
      // Page 2: Terms & Signatures
      plans.push({
        id: 'tkp-p2',
        type: 'terms',
        sheetIndex: 2,
        title: 'Лист 2: Условия и подписи'
      });
    } else {
      // Specification exceeds 1 sheet: chunk into pages
      let currIdx = 0;
      let pageNum = 1;

      // Page 1 chunk
      const p1Items = specItems.slice(0, firstPageCapacity);
      plans.push({
        id: `tkp-p${pageNum}`,
        type: 'spec_first',
        sheetIndex: pageNum,
        itemsChunk: p1Items,
        itemStartIndex: 0,
        isLastSpecChunk: false,
        title: `Лист ${pageNum}: Спецификация (часть 1)`
      });
      currIdx += firstPageCapacity;
      pageNum++;

      // Continuation spec pages (capacity 7 items per page)
      while (currIdx < specItems.length) {
        const nextItems = specItems.slice(currIdx, currIdx + 7);
        const isLast = (currIdx + 7) >= specItems.length;
        plans.push({
          id: `tkp-p${pageNum}`,
          type: 'spec_continue',
          sheetIndex: pageNum,
          itemsChunk: nextItems,
          itemStartIndex: currIdx,
          isLastSpecChunk: isLast,
          title: `Лист ${pageNum}: Спецификация (продолжение)`
        });
        currIdx += 7;
        pageNum++;
      }

      // Final Terms & Signatures Sheet
      plans.push({
        id: `tkp-p${pageNum}`,
        type: 'terms',
        sheetIndex: pageNum,
        title: `Лист ${pageNum}: Условия и подписи`
      });
    }

    return plans;
  }, [tkpPageSplitMode, specItems, proposalImages, customNotes, serviceSla]);

  const totalDocumentPages = useMemo(() => {
    return tkpPagesPlan.length + tzSheets.length;
  }, [tkpPagesPlan.length, tzSheets.length]);

  const isTkpSplitIntoTwoPages = useMemo(() => {
    return tkpPagesPlan.length > 1;
  }, [tkpPagesPlan.length]);

  // Auto-fit calculation (ResizeObserver on right preview container)
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const calculateScale = () => {
      const availableWidth = container.clientWidth - 32;
      const availableHeight = container.clientHeight - 40;
      if (availableWidth <= 0 || availableHeight <= 0) return;

      const A4_WIDTH_PX = 794;
      const A4_HEIGHT_PX = 1123;

      const scaleW = availableWidth / A4_WIDTH_PX;
      const scaleH = availableHeight / A4_HEIGHT_PX;
      const fitScale = Math.min(scaleW, scaleH, 1.25);
      setCalculatedFitScale(Math.max(fitScale, 0.35));
    };

    calculateScale();
    const observer = new ResizeObserver(calculateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Effective scale applied to A4 sheet
  const currentScale = useMemo(() => {
    if (zoomMode === 'fit') return calculatedFitScale;
    if (zoomMode === '100') return 1;
    if (zoomMode === 'width') {
      const container = previewContainerRef.current;
      if (!container) return 1;
      return Math.max((container.clientWidth - 32) / 794, 0.4);
    }
    return customZoom;
  }, [zoomMode, calculatedFitScale, customZoom]);

  // Synchronize Markdown when switching to Markdown mode
  useEffect(() => {
    if (editorMode === 'markdown') {
      const docState = {
        proposalNumber: outgoingNumber,
        proposalDate: documentDate,
        validUntilDate,
        toCompany: customerCompany,
        contactPerson: ceoName,
        ceoPost,
        greeting,
        proposalTitle,
        currency,
        vatMode,
        vatRate,
        deliveryDays,
        warrantyMonths,
        deliveryTerms: deliveryPlace,
        paymentTerms: paymentTermsCustom,
        signatoryName,
        signatoryPost,
        notes: customNotes,
        specItems
      };
      setMarkdownSource(generateProposalMarkdown(docState as any));
    }
  }, [editorMode]);

  // Handle Markdown edit live parsing
  const handleMarkdownChange = (text: string) => {
    setMarkdownSource(text);
    try {
      const parsed = parseProposalMarkdown(text);
      if (parsed.proposalNumber) setOutgoingNumber(parsed.proposalNumber);
      if (parsed.toCompany) setCustomerCompany(parsed.toCompany);
      if (parsed.proposalTitle) setProposalTitle(parsed.proposalTitle);
      if (parsed.specItems && parsed.specItems.length > 0) setSpecItems(parsed.specItems);
      if (parsed.deliveryDays) setDeliveryDays(parsed.deliveryDays);
      if (parsed.warrantyMonths) setWarrantyMonths(parsed.warrantyMonths);
      if (parsed.deliveryTerms) setDeliveryPlace(parsed.deliveryTerms);
      if (parsed.paymentTerms) setPaymentTermsCustom(parsed.paymentTerms);
    } catch {}
  };

  // Add a new TZ Sheet (Приложение)
  const handleAddTzSheet = () => {
    const nextNum = tzSheets.length + 1;
    const newId = `tz-sheet-${Date.now()}`;
    const newSheet: TzSheetItem = {
      id: newId,
      appendixNumber: nextNum,
      title: `Техническое задание на метрологический контроль (Приложение №${nextNum})`,
      partName: 'Наименование новой детали / узла',
      drawingNumber: 'Черт. № 000.00.00.000',
      dimensions: '300 × 200 × 150 мм',
      weight: '12.0 кг',
      material: 'Сталь 40Х / Алюминий Д16Т',
      surfaceType: 'Механическая обработка',
      qualityClass: 'IT7 (допуск 15–20 мкм)',
      gdtRequirements: [
        'Отклонение от плоскостности: не более 0.020 мм',
        'Перпендикулярность базовых поверхностей: не более 0.025 мм'
      ],
      equipmentType: 'Оптический 3D-сканер Scantech KSCAN-Magic / КИМ Mitutoyo',
      temperatureConditions: '+20 °C ± 2 °C',
      reportFormat: 'Протокол измерений ГОСТ Р ИСО 10360, 3D-карта отклонений',
      notes: ''
    };
    setTzSheets(prev => [...prev, newSheet]);
    setActiveTzEditId(newId);
    setActivePreviewSheet(newId);
    showToast(`Лист «Приложение №${nextNum}» добавлен к предложению`);
  };

  // Duplicate a TZ Sheet
  const handleDuplicateTzSheet = (sheet: TzSheetItem) => {
    const nextNum = tzSheets.length + 1;
    const newId = `tz-sheet-${Date.now()}`;
    const duplicated: TzSheetItem = {
      ...sheet,
      id: newId,
      appendixNumber: nextNum,
      title: `${sheet.title} (Копия)`,
      partName: `${sheet.partName} (Копия)`
    };
    setTzSheets(prev => [...prev, duplicated]);
    setActiveTzEditId(newId);
    setActivePreviewSheet(newId);
    showToast(`Лист «Приложение №${nextNum}» успешно скопирован`);
  };

  // Move a TZ Sheet up or down
  const handleMoveTzSheet = (index: number, direction: -1 | 1) => {
    setTzSheets(prev => {
      const next = [...prev];
      const targetIdx = index + direction;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const [moved] = next.splice(index, 1);
      next.splice(targetIdx, 0, moved);
      const reindexed = next.map((s, idx) => ({ ...s, appendixNumber: idx + 1 }));
      return reindexed;
    });
  };

  // Remove a TZ Sheet (allows deleting any sheet including the last one)
  const handleRemoveTzSheet = (id: string) => {
    setTzSheets(prev => {
      const filtered = prev.filter(s => s.id !== id);
      const reindexed = filtered.map((s, idx) => ({ ...s, appendixNumber: idx + 1 }));
      if (reindexed.length === 0) {
        setDetailLevel('standard');
        setActiveTzEditId('');
        setActivePreviewSheet('tkp');
      } else if (activeTzEditId === id) {
        setActiveTzEditId(reindexed[0].id);
        if (activePreviewSheet === id) {
          setActivePreviewSheet(reindexed[0].id);
        }
      }
      return reindexed;
    });
    showToast('Лист Технического задания удален');
  };

  // Clear all TZ Sheets
  const handleClearAllTzSheets = () => {
    setTzSheets([]);
    setActiveTzEditId('');
    setActivePreviewSheet('tkp');
    setDetailLevel('standard');
    showToast('Все листы ТЗ удалены (переключено на Стандарт ТКП)');
  };

  // Clear specification items
  const handleClearSpecification = () => {
    setSpecItems([]);
    showToast('Спецификация полностью очищена');
  };

  // Reset entire form to blank state
  const handleResetToEmpty = () => {
    setCustomerCompany('');
    setCustomerInn('');
    setCustomerKpp('');
    setCustomerOgrn('');
    setCustomerAddress('');
    setCeoName('');
    setCeoPost('Генеральному директору');
    setContactPerson('');
    setContactPhone('');
    setContactEmail('');
    setGreeting('Уважаемые партнеры!');
    setProposalTitle('на поставку координатно-измерительного оборудования и оказание метрологических услуг');
    setSpecItems([]);
    setTzSheets([]);
    setProposalImages([]);
    setCustomNotes('');
    setActivePreviewSheet('tkp');
    setDetailLevel('standard');
    showToast('Бланк сброшен в исходное состояние');
  };

  // Verification Audit Calculation
  const effectiveVatRateNumber = vatMode === 'export_zero' || vatMode === 'no_vat' ? 0 : (vatRate !== undefined ? vatRate : (crmSettings?.defaultVatRate ?? 22));

  const verificationResult = useMemo(() => {
    return runProposalVerification({
      toCompany: customerCompany,
      inn: customerInn,
      kpp: customerKpp,
      ceoName,
      ceoPost,
      contactPerson,
      customerAddress,
      items: specItems,
      vatMode,
      effectiveVatRate: effectiveVatRateNumber,
      totalWithVat: financialTotals.totalWithVat,
      validUntil: validUntilDate,
      deliveryDays,
      deliveryPlace,
      warrantyMonths,
      paymentTermsCustom,
      templateMode,
      impersonalSignerName,
      selectedEmployeeId,
      tzSheets,
      detailLevel,
      proposalImages
    });
  }, [
    customerCompany,
    customerInn,
    customerKpp,
    ceoName,
    ceoPost,
    contactPerson,
    customerAddress,
    specItems,
    vatMode,
    effectiveVatRateNumber,
    financialTotals.totalWithVat,
    validUntilDate,
    deliveryDays,
    deliveryPlace,
    warrantyMonths,
    paymentTermsCustom,
    templateMode,
    impersonalSignerName,
    selectedEmployeeId,
    tzSheets,
    detailLevel,
    proposalImages
  ]);

  // Multi-page A4 sheet pagination calculation
  const PAGE_1_ITEM_CAPACITY = 5;
  const SUBSEQUENT_PAGE_CAPACITY = 8;
  const isMultiPageTkp = specItems.length > PAGE_1_ITEM_CAPACITY;
  const totalTkpPages = isMultiPageTkp 
    ? 1 + Math.ceil((specItems.length - PAGE_1_ITEM_CAPACITY) / SUBSEQUENT_PAGE_CAPACITY) 
    : 1;

  const page1Items = useMemo(() => {
    return isMultiPageTkp ? specItems.slice(0, PAGE_1_ITEM_CAPACITY) : specItems;
  }, [specItems, isMultiPageTkp]);

  const page2Items = useMemo(() => {
    return isMultiPageTkp ? specItems.slice(PAGE_1_ITEM_CAPACITY) : [];
  }, [specItems, isMultiPageTkp]);

  // Update active TZ Sheet
  const handleUpdateActiveTzSheet = (updates: Partial<TzSheetItem>) => {
    setTzSheets(prev => prev.map(sheet => sheet.id === activeTzEditId ? { ...sheet, ...updates } : sheet));
  };

  // Add Spec Item
  const handleAddSpecItem = (category: string = 'Оборудование') => {
    const newItem: SpecificationItem = {
      id: `item-${Date.now()}`,
      name: 'Новая позиция спецификации (наименование, комплектация)',
      category,
      quantity: 1,
      unit: 'шт.',
      price: 150000,
      discountPercent: 0
    };
    setSpecItems(prev => [...prev, newItem]);
  };

  // Remove Spec Item
  const handleRemoveSpecItem = (id: string) => {
    setSpecItems(prev => prev.filter(i => i.id !== id));
  };

  // Update Spec Item
  const handleUpdateSpecItem = (id: string, updates: Partial<SpecificationItem>) => {
    setSpecItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // DaData Lookup / Enterprise Select
  const handleSelectEnterprise = (ent: RussianEnterprise) => {
    setCustomerCompany(ent.name || ent.fullName);
    setCustomerInn(ent.inn);
    setCustomerKpp(ent.kpp || '');
    setCustomerOgrn(ent.ogrn || '');
    setCustomerAddress(ent.address || '');
    setCeoPost(ent.ceoPost || 'Генеральному директору');
    setCeoName(ent.ceoName || '');
    setGreeting(ent.greeting || 'Уважаемый партнер!');
    if (ent.ceoName) {
      setContactPerson(ent.ceoName);
    }
    if (ent.phone) setContactPhone(ent.phone);
    if (ent.email) setContactEmail(ent.email);
    setIsDadataModalOpen(false);
    showToast(`Реквизиты «${ent.name}» (ИНН ${ent.inn}) успешно загружены из ЕГРЮЛ`, 'success');
  };

  const handleDaDataLookup = async () => {
    const q = (customerInn || customerCompany || '').trim();
    setDadataSearchQuery(q);
    setIsDadataModalOpen(true);
  };

  // Load Preset
  const handleLoadPreset = (preset: ProposalPreset) => {
    setOutgoingNumber(preset.proposalNumber || outgoingNumber);
    setDocumentDate(preset.proposalDate || documentDate);
    setValidUntilDate(preset.validUntilDate || validUntilDate);
    setCustomerCompany(preset.toCompany);
    setCeoName(preset.contactPerson);
    setCeoPost(preset.ceoPost || 'Директору');
    setGreeting(preset.greeting || 'Уважаемый партнер!');
    setProposalTitle(preset.proposalTitle);
    setCurrency(preset.currency || 'RUB');
    setDeliveryDays(preset.deliveryDays);
    setWarrantyMonths(preset.warrantyMonths);
    setDeliveryPlace(preset.deliveryTerms);
    setPaymentTermsCustom(preset.paymentTerms);
    setSpecItems(preset.specItems || []);
    showToast(`Шаблон «${preset.name}» загружен`);
  };

  // Move Spec Item Up / Down
  const handleMoveSpecItem = (index: number, direction: 'up' | 'down') => {
    setSpecItems(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Duplicate Spec Item
  const handleDuplicateSpecItem = (item: SpecificationItem) => {
    const duplicated: SpecificationItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `${item.name} (копия)`
    };
    setSpecItems(prev => [...prev, duplicated]);
    showToast(`Позиция продублирована`);
  };

  // Clear All Spec Items
  const handleClearSpecItems = () => {
    if (specItems.length === 0) return;
    setSpecItems([]);
    showToast('Спецификация очищена');
  };

  // Apply Global Discount
  const handleApplyGlobalDiscount = (percent: number) => {
    setSpecItems(prev => prev.map(item => ({ ...item, discountPercent: percent })));
    showToast(`Скидка ${percent}% применена ко всем позициям спецификации`);
  };

  // Add Ready-to-use Equipment & Software Bundles
  const handleAddBundle = (bundleType: 'scan_kit' | 'cmm_kit' | 'software_bundle' | 'service_pack') => {
    if (bundleType === 'scan_kit') {
      setSpecItems(prev => [
        ...prev,
        {
          id: `item-${Date.now()}-1`,
          name: 'Ручной лазерный 3D-сканер Scantech KSCAN-Magic (Госреестр СИ РФ № 89123-23, точность до 0.020 мм)',
          category: 'Оборудование',
          sku: 'SCN-KSCAN-MAG',
          quantity: 1,
          unit: 'компл.',
          price: 3850000,
          discountPercent: 5
        },
        {
          id: `item-${Date.now()}-2`,
          name: 'Программное обеспечение PolyWorks|Inspector™ Standard (бессрочная лицензия + 1 год техподдержки)',
          category: 'ПО',
          sku: 'SW-POLY-INSP',
          quantity: 1,
          unit: 'лиц.',
          price: 1250000,
          discountPercent: 0
        },
        {
          id: `item-${Date.now()}-3`,
          name: 'Пусконаладочные работы, калибровка по сфере и обучение 2 операторов (3 дня в Самаре)',
          category: 'Услуги',
          sku: 'SRV-TRAIN-3D',
          quantity: 1,
          unit: 'услуга',
          price: 180000,
          discountPercent: 10
        }
      ]);
      showToast('Добавлен стандартный комплект «3D-сканирование под ключ»');
    } else if (bundleType === 'cmm_kit') {
      setSpecItems(prev => [
        ...prev,
        {
          id: `item-${Date.now()}-1`,
          name: 'Координатно-измерительная машина Mitutoyo Crysta-Apex V9106 (диапазон 900×1000×600 мм, MPEe 1.7+3L/1000 мкм)',
          category: 'Оборудование',
          sku: 'CMM-MIT-V9106',
          quantity: 1,
          unit: 'компл.',
          price: 8900000,
          discountPercent: 3
        },
        {
          id: `item-${Date.now()}-2`,
          name: 'Измерительная моторизованная головка Renishaw PH10M Plus + датчик TP200 с набором модулей',
          category: 'Оборудование',
          sku: 'REN-PH10M-TP200',
          quantity: 1,
          unit: 'компл.',
          price: 1450000,
          discountPercent: 0
        },
        {
          id: `item-${Date.now()}-3`,
          name: 'Метрологическая поверка во ФГИС «АРШИН» и пусконаладка КИМ на виброизолированном фундаменте',
          category: 'Услуги',
          sku: 'SRV-CMM-CALIB',
          quantity: 1,
          unit: 'услуга',
          price: 320000,
          discountPercent: 0
        }
      ]);
      showToast('Добавлен комплект «КИМ Mitutoyo + Renishaw под ключ»');
    } else if (bundleType === 'software_bundle') {
      setSpecItems(prev => [
        ...prev,
        {
          id: `item-${Date.now()}-1`,
          name: 'Интегрированная CAD/CAM система TopSolid 7 Design & 7' + 'Cam (модули 3D-моделирования, 3/4/5-осевой фрезеровки и токарной обработки)',
          category: 'ПО',
          sku: 'SW-TS7-PRO',
          quantity: 1,
          unit: 'лиц.',
          price: 980000,
          discountPercent: 0
        },
        {
          id: `item-${Date.now()}-2`,
          name: 'Разработка и внедрение кинематического постпроцессора для 5-осевого обрабатывающего центра (ЧПУ Fanuc/Siemens)',
          category: 'Услуги',
          sku: 'SRV-POST-5AX',
          quantity: 1,
          unit: 'услуга',
          price: 250000,
          discountPercent: 0
        }
      ]);
      showToast('Добавлен комплект «CAD/CAM TopSolid 7 + Постпроцессор»');
    }
  };

  // Copy Proposal Markdown / Text
  const [copiedText, setCopiedText] = useState(false);
  const handleCopyProposalText = () => {
    const text = generateProposalMarkdown({
      outgoingNumber,
      proposalDate: documentDate,
      validUntilDate,
      toCompany: customerCompany,
      inn: customerInn,
      kpp: customerKpp,
      ogrn: customerOgrn,
      address: customerAddress,
      contactPerson: ceoName,
      ceoPost,
      greeting,
      proposalTitle,
      currency,
      vatMode,
      vatRate,
      deliveryDays,
      warrantyMonths,
      deliveryTerms: deliveryPlace,
      paymentTerms: paymentTermsCustom,
      signatoryName,
      signatoryPost,
      notes: customNotes,
      specItems
    } as any);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedText(true);
        showToast('Текст коммерческого предложения скопирован в буфер обмена');
        setTimeout(() => setCopiedText(false), 2000);
      });
    }
  };

  // Save to CRM Deals & Proposals Registry
  const handleSaveToCrm = () => {
    if (setDocumentDetailLevel) {
      setDocumentDetailLevel(detailLevel);
    }
    const proposalId = initialProposalId || `prop_${Date.now()}`;
    const executorName = selectedEmployeeId !== 'none' ? selectedEmployee.shortName : '';
    const existingProp = isEditMode && initialProposalId 
      ? commercialProposals.find(item => item.id === initialProposalId) 
      : null;

    const previousVersions = existingProp?.versions || [];
    const newVersionNum = previousVersions.length + 1;
    const updatedVersions = [
      ...previousVersions,
      {
        id: `v${newVersionNum}_${Date.now()}`,
        version: newVersionNum,
        name: `${outgoingNumber}.pdf`,
        size: '1.4 MB',
        uploadedAt: documentDate,
        uploadedBy: executorName || signatoryName
      }
    ];

    const proposalData = {
      ...(existingProp || {}),
      id: proposalId,
      outgoingNumber,
      date: documentDate,
      validUntil: validUntilDate,
      toCompany: customerCompany,
      customerInn,
      customerKpp,
      customerOgrn,
      customerAddress,
      ceoPost,
      incomingNumber: hasIncomingRef ? incomingNumber : '',
      incomingDate: hasIncomingRef ? incomingDate : '',
      hasIncomingRef,
      executorName: selectedEmployeeId !== 'none' ? selectedEmployee.fullName : '',
      executorPosition: selectedEmployeeId !== 'none' ? selectedEmployee.position : '',
      executorPhone: selectedEmployeeId !== 'none' ? selectedEmployee.phone : '',
      executorEmail: selectedEmployeeId !== 'none' ? selectedEmployee.email : '',
      fontFamily,
      tableBorderColor,
      tableBorderWidth,
      tableBorderStyle,
      tableCellPadding,
      content: proposalTitle,
      preparedBy: executorName || signatoryName,
      amount: financialTotals.totalWithVat,
      currency,
      vatRate,
      vatMode,
      subtotalWithoutVat: financialTotals.subtotal,
      vatAmount: financialTotals.vatAmount,
      totalWithVat: financialTotals.totalWithVat,
      customerCountry: vatMode === 'export_zero' ? 'Экспорт / ЕАЭС' : 'РФ',
      note: customNotes || `Сформировано через Единый конструктор ТКП. Режим НДС: ${vatMode === 'export_zero' ? '0% Экспорт' : vatMode === 'no_vat' ? 'Без НДС' : `${vatRate}%`} | Уровень: ${detailLevel.toUpperCase()} | Листов ТЗ: ${tzSheets.length}`,
      dealId: selectedDealId,
      contactPerson: ceoName,
      contactPhone,
      contactEmail,
      greeting,
      detailLevel,
      customNotes,
      paymentTermsCustom,
      deliveryDays,
      deliveryPlace,
      warrantyMonths,
      serviceSla,
      includeCustomerSignatureBlock,
      isNeutralTemplate: templateMode === 'impersonal',
      templateMode,
      impersonalSignerName,
      documentImages: proposalImages.map(img => ({
        id: img.id,
        url: img.url,
        title: img.title || '',
        caption: img.caption || '',
        widthPercent: img.widthPercent || 50,
        placement: img.placement || 'proposal_body'
      })),
      dealTitle: selectedDealId ? (deals.find(d => d.id === selectedDealId)?.title || deals.find(d => d.id === selectedDealId)?.serviceType) : (existingProp?.dealTitle || 'Комплексная поставка СИ'),
      dealFunnel: existingProp?.dealFunnel || 'equipment',
      specItems,
      tzSheets,
      versions: updatedVersions
    };

    if (isEditMode && initialProposalId) {
      updateCommercialProposal(initialProposalId, proposalData as any);
      showToast(`Предложение «${outgoingNumber}» успешно обновлено в реестре!`);
    } else {
      addCommercialProposal(proposalData as any);
      showToast(`Предложение «${outgoingNumber}» успешно зарегистрировано в реестре ТКП!`);
    }

    if (selectedDealId) {
      updateDeal(selectedDealId, {
        amount: financialTotals.totalWithVat,
        proposalSentDate: documentDate,
        stage: 'proposal'
      });
      if (onSaveDocumentToDeal) {
        onSaveDocumentToDeal(selectedDealId, {
          id: `doc_${Date.now()}`,
          name: `${outgoingNumber}.pdf`,
          type: 'kp',
          size: '1.4 MB',
          date: documentDate,
          uploadedBy: executorName || signatoryName,
          url: '#'
        }, proposalData);
      }
    }
  };

  const handleSaveAndClose = () => {
    handleSaveToCrm();
    if (onBack) {
      setTimeout(() => {
        onBack();
      }, 150);
    }
  };

  // Export Multi-page PDF using Unified A4 Handler
  const handleDownloadPdf = async () => {
    if (!printSheetRef.current) return;
    if (setDocumentDetailLevel) {
      setDocumentDetailLevel(detailLevel);
    }
    setIsExporting(true);

    const prevActiveSheet = activePreviewSheet;
    const cleanNum = cleanOutgoingNumber.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
    const safeName = (customerCompany || 'Заказчик')
      .replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_')
      .slice(0, 25);
    const filename = `ТКП_${cleanNum}_${safeName}.pdf`;

    try {
      setActivePreviewSheet('all');
      await new Promise(r => setTimeout(r, 200));

      const container = printSheetRef.current;
      const prevTransform = container ? container.style.transform : '';
      if (container) container.style.transform = 'none';

      await handleUnifiedA4ExportAction('pdf', {
        container: printSheetRef.current,
        filename,
        onProgress: (msg) => showToast(msg),
        onError: (err) => showToast('Ошибка рендеринга PDF: ' + err.message)
      });

      if (container) container.style.transform = prevTransform;
    } catch (e: any) {
      console.error('PDF Generation Error:', e);
    } finally {
      if (printSheetRef.current) {
        printSheetRef.current.style.transform = `scale(${currentScale})`;
      }
      setActivePreviewSheet(prevActiveSheet);
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    if (setDocumentDetailLevel) {
      setDocumentDetailLevel(detailLevel);
    }
    const prevActiveSheet = activePreviewSheet;
    setActivePreviewSheet('all');

    try {
      await handleUnifiedA4ExportAction('print', {
        container: printSheetRef.current,
        onProgress: (msg) => showToast(msg),
        onError: (err) => {
          console.error('Print Error:', err);
          showToast('Ошибка печати: ' + err.message);
        },
        onAfterAction: () => {
          setActivePreviewSheet(prevActiveSheet);
        }
      });
    } catch (e: any) {
      console.error('Unified print handler error, attempting fallback print:', e);
      window.focus();
      window.print();
    } finally {
      setTimeout(() => {
        setActivePreviewSheet(prevActiveSheet);
      }, 1000);
    }
  };

  // Image Handlers: File Upload & Library Insertion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Пожалуйста, выберите файл изображения (PNG, JPEG, WebP, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const newImage: ProposalImageItem = {
        id: `img-${Date.now()}`,
        url: dataUrl,
        title: cleanFileName,
        widthPercent: 50,
        placement: 'proposal_body'
      };
      setProposalImages(prev => [...prev, newImage]);
      showToast(`Изображение «${file.name}» успешно загружено и прикреплено!`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectFromLibrary = (img: { url: string; title: string; description: string }) => {
    const newImage: ProposalImageItem = {
      id: `img-lib-${Date.now()}`,
      url: img.url,
      title: img.title,
      description: img.description,
      widthPercent: 50,
      placement: 'proposal_body'
    };
    setProposalImages(prev => [...prev, newImage]);
    showToast(`Изображение «${img.title}» добавлено из библиотеки сайта!`);
  };

  const handleUpdateImage = (id: string, patch: Partial<ProposalImageItem>) => {
    setProposalImages(prev => prev.map(img => img.id === id ? { ...img, ...patch } : img));
  };

  const handleRemoveImage = (id: string) => {
    setProposalImages(prev => prev.filter(img => img.id !== id));
    showToast('Изображение удалено из предложения');
  };

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    setProposalImages(prev => {
      const next = [...prev];
      const targetIdx = index + direction;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const [moved] = next.splice(index, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };

  const currentActiveTz = tzSheets.find(s => s.id === activeTzEditId) || tzSheets[0];

  return (
    <div className={`flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    } ${
      isFullscreen 
        ? 'fixed inset-0 z-[100] w-screen h-screen overflow-hidden animate-in fade-in duration-150' 
        : `relative w-full rounded-2xl border ${isDark ? 'border-slate-800 shadow-2xl' : 'border-slate-300/80 shadow-xl'} overflow-hidden h-[calc(100vh-120px)] min-h-[680px]`
    }`}>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & WORKSPACE TOOLBAR */}
      {/* ========================================================================= */}
      <header className={`shrink-0 z-40 px-3 py-2 sm:px-5 backdrop-blur-md border-b transition-colors ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800 text-white' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Back button & Title */}
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className={`p-1.5 sm:p-2 rounded-xl transition-all border cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300 shadow-2xs'
                }`}
                title="Вернуться назад"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden md:inline">Назад</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className={`p-1 rounded-lg border ${
                  isDark ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  <FileText className="w-3.5 h-3.5" />
                </span>
                <h1 className={`text-sm sm:text-base font-bold tracking-tight flex items-center gap-1.5 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {isEditMode ? (
                    <>
                      <span>Редактор ТКП и ТЗ</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-amber-950/80 text-amber-300 border border-amber-800' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        Редактирование
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Конструктор ТКП и ТЗ</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-blue-950/80 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        Новый проект
                      </span>
                    </>
                  )}
                </h1>
              </div>
              <p className={`text-[10px] hidden xl:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Формирование коммерческих предложений, спецификаций и листов ТЗ с постраничным разбиением А4
              </p>
            </div>
          </div>

          {/* Center: Editor Mode Switcher (Конструктор vs Markdown) */}
          <div className={`flex items-center p-0.5 sm:p-1 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200 shadow-inner'
          }`}>
            <button
              type="button"
              onClick={() => setEditorMode('fields')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                editorMode === 'fields'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Конструктор</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('markdown')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                editorMode === 'markdown'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Markdown</span>
            </button>
          </div>

          {/* Right: Fullscreen + Verifier + Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Verification Quality Score Button */}
            <button
              type="button"
              onClick={() => setIsVerifierOpen(true)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                verificationResult.score >= 90
                  ? (isDark ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60' : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100')
                  : verificationResult.score >= 70
                  ? (isDark ? 'bg-amber-950/50 border-amber-700/60 text-amber-300 hover:bg-amber-900/60' : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100')
                  : (isDark ? 'bg-rose-950/50 border-rose-700/60 text-rose-300 hover:bg-rose-900/60' : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100')
              }`}
              title="Открыть аудит и верификатор качества коммерческого предложения"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${verificationResult.score >= 90 ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="hidden sm:inline">Аудит: {verificationResult.score}%</span>
              {verificationResult.errorsCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500 text-white font-mono">{verificationResult.errorsCount} ош.</span>
              ) : (
                <span className="text-[10px] opacity-80">✓</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const nextState = !isFullscreen;
                setIsFullscreen(nextState);
                if (nextState) {
                  if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                } else {
                  if (document.exitFullscreen && document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                  }
                }
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300 shadow-2xs'
              }`}
              title={isFullscreen ? "Свернуть в окно (Esc)" : "Развернуть во весь экран (Fullscreen Studio)"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs hidden md:inline text-amber-400 font-medium">В окно</span>
                </>
              ) : (
                <>
                  <Maximize2 className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-xs hidden md:inline font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Во весь экран</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveToCrm}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-900 border-slate-300 shadow-2xs'
              }`}
            >
              <Save className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Сохранить</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-900 border-slate-300 shadow-2xs'
              }`}
            >
              <Printer className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              <span className="hidden sm:inline">Печать</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Экспорт...' : 'PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SPLIT WORKSPACE: LEFT EDITOR + RIGHT ALWAYS-ON A4 PREVIEW */}
      {/* ========================================================================= */}
      <main className="flex-1 min-h-0 w-full grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden print:block print:overflow-visible print:w-full print:h-auto print:p-0 print:m-0">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN: EDIT FORM & CONTROLS (6 cols on large screens, hidden in print) */}
        {/* ----------------------------------------------------------------------- */}
        <div className={`lg:col-span-6 h-full overflow-y-auto p-3 sm:p-5 space-y-4 border-r custom-scrollbar transition-colors print:hidden ${
          isDark 
            ? 'border-slate-800/80 bg-slate-950 text-slate-100' 
            : 'border-slate-200 bg-slate-50/80 text-slate-900'
        }`}>
          {/* Sleek Compact Engineering Header Strip */}
          <div className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs transition-colors ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            {/* Left: Template Preset Quick Selector & Level */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-700 dark:text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Шаблон:</span>
              </div>
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const preset = CORPORATE_PROPOSAL_PRESETS.find(p => p.id === val);
                  if (preset) handleLoadPreset(preset);
                }}
                className={`px-2 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <option value="" disabled>⚡ Выбрать готовый шаблон...</option>
                {CORPORATE_PROPOSAL_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.title || p.name}</option>
                ))}
              </select>

              {/* Detail Level Selector Compact */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleDetailLevelChange('express')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    detailLevel === 'express'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                  title="1 лист: быстрый счет-договор"
                >
                  Счет-КП
                </button>
                <button
                  type="button"
                  onClick={() => handleDetailLevelChange('standard')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    detailLevel === 'standard'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                  title="Стандартное коммерческое предложение"
                >
                  Стандарт ТКП
                </button>
                <button
                  type="button"
                  onClick={() => handleDetailLevelChange('complex_project')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    detailLevel === 'complex_project' || detailLevel === 'engineering_opk'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                  title="Комплект: ТКП + Листы технических заданий (ТЗ)"
                >
                  + Листы ТЗ
                </button>
              </div>
            </div>

            {/* Right: Page Split & Reset Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Page Break Control */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-400 hidden sm:inline">Листы А4:</span>
                <select
                  value={tkpPageSplitMode}
                  onChange={(e) => setTkpPageSplitMode(e.target.value as any)}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                  title="Управление автоматическим переносом условий и подписей на следующий лист А4"
                >
                  <option value="auto">🔄 Автоперенос (А4)</option>
                  <option value="two_pages">📄📄 Всегда 2 листа</option>
                  <option value="single">📄 1 лист (Компактно)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetToEmpty}
                className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-rose-900/40 text-rose-300 border-slate-700' 
                    : 'bg-slate-100 hover:bg-rose-50 text-rose-700 border-slate-200'
                }`}
                title="Очистить спецификацию и сбросить форму"
              >
                🗑️ Сбросить
              </button>
            </div>
          </div>

          {/* ---------------- MARKDOWN EDITOR MODE ---------------- */}
          {editorMode === 'markdown' ? (
            <div className={`rounded-2xl border p-4 space-y-3 transition-colors ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Code className="w-4 h-4 text-indigo-500" />
                  Прямое редактирование Markdown
                </h2>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Живой рендер бланка справа</span>
              </div>
              <textarea
                value={markdownSource}
                onChange={(e) => handleMarkdownChange(e.target.value)}
                rows={22}
                className={`w-full border rounded-xl p-3 font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                placeholder="# Коммерческое предложение..."
              />
            </div>
          ) : (
            /* ---------------- STRUCTURED FIELDS MODE ---------------- */
            <div className="space-y-4">
              {/* Section Tabs Navigation */}
              <div className={`p-1 rounded-xl border flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-semibold ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <button
                  type="button"
                  onClick={() => setActiveSectionTab('all')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSectionTab === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Все разделы</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSectionTab('requisites')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSectionTab === 'requisites'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>1. Реквизиты и адресат</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSectionTab('spec')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSectionTab === 'spec'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>2. Спецификация ({specItems.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSectionTab('terms')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSectionTab === 'terms'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>3. Условия и подписи</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSectionTab('images')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSectionTab === 'images'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>4. Чертежи и ТЗ ({proposalImages.length + tzSheets.length})</span>
                </button>
              </div>

              {/* SECTION 1: CUSTOMER & HEADER */}
              {(activeSectionTab === 'all' || activeSectionTab === 'requisites') && (
              <div className={`rounded-2xl border p-4 space-y-4 transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                {/* Template Mode Switcher */}
                <div className={`p-3.5 rounded-xl border space-y-2.5 transition-colors ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <FileBadge className="w-4 h-4 text-blue-500" />
                      Режим и брендирование шаблона КП:
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      templateMode === 'impersonal' 
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' 
                        : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {templateMode === 'impersonal' ? 'Обезличенный бланк' : 'Фирменный бланк'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Official Template */}
                    <button
                      type="button"
                      onClick={() => setTemplateMode('official')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        templateMode === 'official'
                          ? 'bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/20 text-slate-900 dark:text-white'
                          : isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          Фирменный бланк
                        </span>
                        {templateMode === 'official' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <p className="text-[10.5px] leading-tight opacity-75">
                        Фирменная эмблема, реквизиты, Исх. №, подпись руководителя.
                      </p>
                    </button>

                    {/* Impersonal White-label */}
                    <button
                      type="button"
                      onClick={() => setTemplateMode('impersonal')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        templateMode === 'impersonal'
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 text-slate-900 dark:text-white'
                          : isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                          Обезличенный бланк (White-label)
                        </span>
                        {templateMode === 'impersonal' && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                      </div>
                      <p className="text-[10.5px] leading-tight opacity-75">
                        Без названия организации и реквизитов, без номера, подпись «Исполнитель», печать по центру.
                      </p>
                    </button>
                  </div>
                </div>

                <div className={`flex items-center justify-between border-b pb-2.5 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <h2 className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Building2 className="w-4 h-4 text-blue-500" />
                    1. Контрагент и Исходящий номер
                  </h2>
                  <button
                    type="button"
                    onClick={handleDaDataLookup}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <Search className="w-3 h-3" />
                    <span>ИНН / DaData (ЕГРЮЛ)</span>
                  </button>
                </div>

                {deals && deals.length > 0 && (
                  <div className={`p-3 rounded-xl border space-y-2 ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-blue-50/40 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                        <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                        <span>Привязка к сделке из CRM-воронки:</span>
                      </label>
                      {selectedDealId && (
                        <span className="text-[10px] font-mono text-blue-500">
                          {selectedDealId}
                        </span>
                      )}
                    </div>
                    <select
                      value={selectedDealId}
                      onChange={(e) => {
                        const dId = e.target.value;
                        setSelectedDealId(dId);
                        const found = deals.find(d => d.id === dId);
                        if (found) {
                          const comp = found.companyName || (found as any).company || '';
                          if (comp) setCustomerCompany(comp);
                          if (found.inn) setCustomerInn(found.inn);
                          const contact = found.customerName || (found as any).contactName || '';
                          if (contact) {
                            setCeoName(contact);
                            setContactPerson(contact);
                            const nameParts = contact.replace(/\(.*\)/, '').trim().split(' ');
                            if (nameParts.length >= 2) {
                              setGreeting(`Уважаемый ${nameParts[1]}${nameParts[2] ? ' ' + nameParts[2] : ''}!`);
                            }
                          }
                          if (found.phone || (found as any).contactPhone) {
                            setContactPhone(found.phone || (found as any).contactPhone);
                          }
                          if (found.email || (found as any).contactEmail) {
                            setContactEmail(found.email || (found as any).contactEmail);
                          }
                          if (found.serviceType || (found as any).title) {
                            setProposalTitle(`на поставку и внедрение: ${found.serviceType || (found as any).title}`);
                          }
                          showToast(`Данные сделки «${found.companyName || found.id}» привязаны к бланку`, 'success');
                        }
                      }}
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-2xs font-medium'
                      }`}
                    >
                      <option value="">-- Без привязки к сделке --</option>
                      {deals.map(deal => {
                        const comp = deal.companyName || (deal as any).company || 'Организация не указана';
                        const contact = deal.customerName || (deal as any).contactName || '';
                        const amount = (deal.estimatedPrice || (deal as any).amount || 0);
                        return (
                          <option key={deal.id} value={deal.id}>
                            {deal.id} | {comp} {contact ? `(${contact})` : ''} {amount > 0 ? `— ${amount.toLocaleString('ru-RU')} ₽` : ''}
                          </option>
                        );
                      })}
                    </select>

                    {/* Import deal items button if deal has items */}
                    {(() => {
                      const curDeal = deals.find(d => d.id === selectedDealId);
                      if (curDeal && curDeal.items && curDeal.items.length > 0) {
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              const convertedItems: SpecificationItem[] = curDeal.items.map((it: any, idx: number) => ({
                                id: `deal-item-${Date.now()}-${idx}`,
                                name: it.name,
                                category: it.category || 'Оборудование',
                                quantity: it.quantity || 1,
                                unit: 'компл.',
                                price: it.price || 100000,
                                discountPercent: 0
                              }));
                              setSpecItems(convertedItems);
                              showToast(`Импортировано ${convertedItems.length} поз. спецификации из сделки`, 'success');
                            }}
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span>Импортировать {curDeal.items.length} поз. спецификации из сделки в ТКП</span>
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Searchable DaData Dropdown for Organization / INN */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        <Search className="w-3.5 h-3.5 text-blue-500" />
                        <span>Поиск организации по ИНН / названию (DaData / ЕГРЮЛ):</span>
                      </label>
                      <span className="text-[10.5px] text-blue-500 font-medium">
                        Живой поиск с автозаполнением реквизитов
                      </span>
                    </div>

                    <DadataOrganizationDropdown
                      companyName={customerCompany}
                      inn={customerInn}
                      onSelect={(org) => handleSelectEnterprise(org)}
                      onCompanyNameChange={(name) => setCustomerCompany(name)}
                      onInnChange={(innVal) => setCustomerInn(innVal)}
                      isDark={isDark}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Наименование организации Заказчика:
                    </label>
                    <input
                      type="text"
                      value={customerCompany}
                      onChange={(e) => setCustomerCompany(e.target.value)}
                      placeholder="ПАО «ОДК-Кузнецов» или АО «КАМАЗ»"
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs font-medium'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      ИНН организации / ИП:
                    </label>
                    <input
                      type="text"
                      value={customerInn}
                      onChange={(e) => setCustomerInn(e.target.value)}
                      placeholder="10 или 12 цифр"
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs font-bold'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {templateMode === 'impersonal' ? 'Исх. номер (скрыт в документе):' : 'Исходящий номер:'}
                    </label>
                    <input
                      type="text"
                      value={outgoingNumber}
                      onChange={(e) => setOutgoingNumber(e.target.value)}
                      disabled={templateMode === 'impersonal'}
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors ${
                        templateMode === 'impersonal'
                          ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500'
                          : isDark ? 'bg-slate-950 border-slate-800 text-blue-300' : 'bg-white border-slate-300 text-blue-700 font-bold shadow-2xs'
                      }`}
                    />
                    {templateMode === 'impersonal' && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 block">
                        * Номер скрыт в обезличенном бланке
                      </span>
                    )}
                  </div>
                  <div>
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Дата документа:</label>
                    <input
                      type="text"
                      value={documentDate}
                      onChange={(e) => setDocumentDate(e.target.value)}
                      placeholder="ДД.ММ.ГГГГ"
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>

                  {/* Incoming Document Reference (Ответ на входящий запрос / письмо) */}
                  <div className={`sm:col-span-2 p-3 rounded-xl border transition-colors ${
                    hasIncomingRef 
                      ? isDark ? 'bg-blue-950/30 border-blue-800/60' : 'bg-blue-50/70 border-blue-200' 
                      : isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasIncomingRef}
                          onChange={(e) => setHasIncomingRef(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          Ответ на входящий номер / запрос («На № ___ от ___»)
                        </span>
                      </label>
                      {hasIncomingRef && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-600 text-white font-semibold">
                          Активно в шапке
                        </span>
                      )}
                    </div>

                    {hasIncomingRef && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            Входящий номер запроса Заказчика:
                          </label>
                          <input
                            type="text"
                            value={incomingNumber}
                            onChange={(e) => setIncomingNumber(e.target.value)}
                            placeholder="№ 142/ОМ-26 или Исх. заказчика 45-А"
                            className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            Дата входящего документа / запроса:
                          </label>
                          <input
                            type="text"
                            value={incomingDate}
                            onChange={(e) => setIncomingDate(e.target.value)}
                            placeholder="28.09.2026"
                            className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Должность адресата:</label>
                    <input
                      type="text"
                      value={ceoPost}
                      onChange={(e) => setCeoPost(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>ФИО адресата (кому):</label>
                    <input
                      type="text"
                      value={ceoName}
                      onChange={(e) => setCeoName(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Официальное приветствие:</label>
                    <input
                      type="text"
                      value={greeting}
                      onChange={(e) => setGreeting(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                </div>
              </div>
              )}

              {/* SECTION 2: SPECIFICATION & DYNAMIC VAT */}
              {(activeSectionTab === 'all' || activeSectionTab === 'spec') && (
              <div className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className={`flex flex-wrap items-center justify-between border-b pb-2.5 gap-2 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <h2 className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    2. Спецификация оборудования и услуг
                  </h2>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Quick Catalog Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCatalogMenuOpen(!isCatalogMenuOpen)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                          isDark 
                            ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/40' 
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-2xs'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Выбрать из прайса ({livePriceCatalog.length})</span>
                      </button>

                      {isCatalogMenuOpen && (
                        <div className={`absolute right-0 mt-1 w-80 sm:w-[420px] max-h-96 overflow-hidden flex flex-col border rounded-xl shadow-2xl z-50 p-2 space-y-2 ${
                          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                        }`}>
                          {/* Search Header */}
                          <div className="flex items-center justify-between gap-2 border-b pb-1.5 dark:border-slate-800">
                            <div className="relative flex-1">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                value={catalogSearchQuery}
                                onChange={(e) => setCatalogSearchQuery(e.target.value)}
                                placeholder="Поиск (SKU, название)..."
                                className="w-full pl-8 pr-3 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsCatalogMenuOpen(false)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Category Filter Pills */}
                          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[10px] pb-1">
                            {[
                              { id: 'all', label: 'Все' },
                              { id: 'software', label: 'ПО' },
                              { id: 'hardware', label: 'Оборудование' },
                              { id: 'services', label: 'Услуги' },
                              { id: 'accessories', label: 'Оснастка' },
                              { id: 'non_core_services', label: 'Непрофильные' }
                            ].map(tab => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setCatalogCategoryFilter(tab.id)}
                                className={`px-2 py-0.5 rounded-md font-semibold shrink-0 transition-colors cursor-pointer ${
                                  catalogCategoryFilter === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          {/* Items List */}
                          <div className="overflow-y-auto max-h-64 space-y-1 pr-1">
                            {livePriceCatalog
                              .filter(item => {
                                const matchesCat = catalogCategoryFilter === 'all' || item.category === catalogCategoryFilter;
                                const q = catalogSearchQuery.toLowerCase().trim();
                                const matchesQ = !q || 
                                  item.name.toLowerCase().includes(q) ||
                                  item.sku.toLowerCase().includes(q) ||
                                  item.manufacturer.toLowerCase().includes(q);
                                return matchesCat && matchesQ;
                              })
                              .map((catItem, idx) => (
                                <button
                                  key={catItem.id || idx}
                                  type="button"
                                  onClick={() => {
                                    setSpecItems(prev => [
                                      ...prev,
                                      {
                                        id: `item-${Date.now()}-${idx}`,
                                        name: catItem.name,
                                        category: catItem.categoryLabel || catItem.category,
                                        sku: catItem.sku,
                                        quantity: 1,
                                        unit: catItem.unit || 'шт.',
                                        price: catItem.priceRub,
                                        discountPercent: 0
                                      }
                                    ]);
                                    setIsCatalogMenuOpen(false);
                                    showToast(`Добавлено: ${catItem.name.slice(0, 30)}...`);
                                  }}
                                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                                    isDark ? 'hover:bg-slate-800/80' : 'hover:bg-slate-100'
                                  }`}
                                >
                                  <div className={`font-bold flex items-center justify-between ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    <span className="truncate pr-2">{catItem.name}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono shrink-0">
                                      {formatMoneyRu(catItem.priceRub, 'RUB')} ₽
                                    </span>
                                  </div>
                                  <div className={`text-[10px] flex items-center justify-between ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-blue-500 font-medium">{catItem.categoryLabel || catItem.category}</span>
                                      <span>•</span>
                                      <span className="font-mono">Арт: {catItem.sku}</span>
                                      <span>•</span>
                                      <span>{catItem.unit}</span>
                                    </div>
                                    <span className="text-slate-400 text-[9px] font-mono">
                                      {catItem.inStock ? 'На складе' : `${catItem.leadTimeDays} дн.`}
                                    </span>
                                  </div>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddSpecItem('Оборудование')}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        isDark 
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Оборудование</span>
                    </button>
                    <button
                      onClick={() => handleAddSpecItem('Услуги')}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        isDark 
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Услуга</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Предмет ТКП (заголовок):</label>
                  <input
                    type="text"
                    value={proposalTitle}
                    onChange={(e) => setProposalTitle(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                    }`}
                  />
                </div>

                {/* Items list */}
                <div className="space-y-2">
                  {specItems.map((item, idx) => {
                    const itemTotal = item.price * (1 - (item.discountPercent || 0) / 100) * item.quantity;
                    return (
                      <div key={item.id} className={`p-2.5 rounded-xl border space-y-2 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center shrink-0 mt-1 ${
                            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700 font-bold'
                          }`}>
                            {idx + 1}
                          </span>
                          <textarea
                            value={item.name}
                            onChange={(e) => handleUpdateSpecItem(item.id, { name: e.target.value })}
                            rows={2}
                            className={`flex-1 border rounded-lg p-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder="Наименование позиции..."
                          />
                          <div className="flex items-center gap-0.5 shrink-0 mt-1">
                            <button
                              type="button"
                              onClick={() => handleDuplicateSpecItem(item)}
                              className="p-1 rounded text-slate-400 hover:text-blue-500 cursor-pointer"
                              title="Дублировать позицию"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpecItem(item.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                              title="Удалить позицию"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <label className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Кол-во:</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateSpecItem(item.id, { quantity: Number(e.target.value) || 1 })}
                              className={`w-full border rounded-lg px-2 py-1 text-center transition-colors ${
                                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Ед. изм.:</label>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleUpdateSpecItem(item.id, { unit: e.target.value })}
                              className={`w-full border rounded-lg px-2 py-1 text-center transition-colors ${
                                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-800'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Цена за ед.:</label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateSpecItem(item.id, { price: Number(e.target.value) || 0 })}
                              className={`w-full border rounded-lg px-2 py-1 text-right transition-colors ${
                                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 font-medium'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Сумма (₽):</label>
                            <div className={`border rounded-lg px-2 py-1 text-right font-mono font-bold truncate ${
                              isDark ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-white border-slate-200 text-emerald-700'
                            }`}>
                              {itemTotal.toLocaleString('ru-RU')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tax & VAT Configuration Bar */}
                <div className={`p-3 rounded-xl border space-y-2 transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${
                      isDark ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      <Percent className="w-3.5 h-3.5 text-blue-500" />
                      <span>Налоговый режим и ставка НДС:</span>
                    </div>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Базовая ставка CRM: {crmSettings?.defaultVatRate ?? 22}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <select
                        value={vatMode}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setVatMode(val);
                          if (val === 'export_zero' || val === 'no_vat') {
                            setVatRate(0);
                          } else if (val === 'standard') {
                            setVatRate(crmSettings?.defaultVatRate ?? 22);
                          }
                        }}
                        className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-medium cursor-pointer transition-colors ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                        }`}
                      >
                        <option value="standard">🇷🇺 Стандарт РФ (НДС {crmSettings?.defaultVatRate ?? 22}%)</option>
                        <option value="export_zero">✈️ Экспорт / ЕАЭС (0% НДС, ст. 164 НК РФ)</option>
                        <option value="no_vat">🛡️ Без НДС (УСН / ст. 346.11 НК РФ)</option>
                        <option value="custom">⚙️ Особая ставка НДС (%)</option>
                      </select>
                    </div>

                    {(vatMode === 'standard' || vatMode === 'custom') && (
                      <div className="flex items-center gap-2">
                        <label className={`text-[11px] shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ставка НДС (%):</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={vatRate}
                          onChange={(e) => setVatRate(Math.max(0, parseFloat(e.target.value) || 0))}
                          className={`w-20 border rounded-lg px-2 py-1 text-center text-xs font-mono font-bold focus:outline-none focus:border-blue-500 transition-colors ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                          }`}
                        />
                        {vatRate !== (crmSettings?.defaultVatRate ?? 22) && (
                          <button
                            type="button"
                            onClick={() => {
                              setVatRate(crmSettings?.defaultVatRate ?? 22);
                              setVatMode('standard');
                            }}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Сбросить ({crmSettings?.defaultVatRate ?? 22}%)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial 3-Row Calculation (Dynamic VAT) */}
                <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 font-mono transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>1. ИТОГО без НДС:</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{financialTotals.subtotalFormatted}</span>
                  </div>
                  <div className={`flex justify-between ${isDark ? 'text-blue-400' : 'text-blue-700 font-semibold'}`}>
                    <span>{financialTotals.vatLabel}</span>
                    <span className="font-semibold">{financialTotals.vatAmountFormatted}</span>
                  </div>
                  <div className={`flex justify-between text-sm font-bold pt-1 border-t ${
                    isDark ? 'text-emerald-400 border-slate-800' : 'text-emerald-700 border-slate-200'
                  }`}>
                    <span>{financialTotals.totalLabel}</span>
                    <span>{financialTotals.totalWithVatFormatted}</span>
                  </div>
                  {financialTotals.vatNotice && (
                    <div className="pt-1.5 text-[10px] font-sans text-amber-600 dark:text-amber-400/90 italic">
                      {financialTotals.vatNotice}
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* SECTION: IMAGES & SCHEMAS */}
              {(activeSectionTab === 'all' || activeSectionTab === 'images') && (
                <div className={`rounded-2xl border p-4 space-y-4 transition-colors ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-2.5 ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <div>
                      <h2 className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        3. Изображения, эскизы и схемы изделия ({proposalImages.length})
                      </h2>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Вставка фото оборудования, эскизов контролируемых деталей, 3D-карт GD&T из библиотеки сайта или загрузка файлов
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSiteLibraryOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>Библиотека сайта</span>
                      </button>

                      <label className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isDark 
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 shadow-2xs'
                      }`}>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Загрузить файл</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Images List */}
                  {proposalImages.length === 0 ? (
                    <div className={`p-6 rounded-xl border border-dashed text-center ${
                      isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'
                    }`}>
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50 text-blue-500" />
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Изображения пока не добавлены
                      </div>
                      <div className="text-[11px] mt-1 max-w-sm mx-auto">
                        Нажмите <strong>«Библиотека сайта»</strong> для выбора готовых фото КИМ, 3D-сканеров и деталей, или <strong>«Загрузить файл»</strong> для добавления эскизов чертежей с компьютера.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {proposalImages.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-colors ${
                            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                          }`}
                        >
                          <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-black/10">
                            <img
                              src={img.url}
                              alt={img.title || 'Изображение'}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 right-1 px-1 rounded text-[9px] font-bold bg-black/75 text-white">
                              #{idx + 1}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 space-y-1.5 w-full">
                            <input
                              type="text"
                              value={img.title || ''}
                              onChange={(e) => handleUpdateImage(img.id, { title: e.target.value })}
                              placeholder="Подпись к изображению (напр. Рис. 1: Корпус турбокомпрессора)..."
                              className={`w-full border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />

                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              <div className="flex items-center gap-1">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Ширина:</span>
                                <select
                                  value={img.widthPercent || 50}
                                  onChange={(e) => handleUpdateImage(img.id, { widthPercent: Number(e.target.value) })}
                                  className={`border rounded-md px-2 py-0.5 text-[11px] focus:outline-none ${
                                    isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                                  }`}
                                >
                                  <option value={50}>50% (В 2 колонки)</option>
                                  <option value={100}>100% (На всю ширину)</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-1">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Размещение:</span>
                                <select
                                  value={img.placement || 'proposal_body'}
                                  onChange={(e) => handleUpdateImage(img.id, { placement: e.target.value as any })}
                                  className={`border rounded-md px-2 py-0.5 text-[11px] focus:outline-none ${
                                    isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                                  }`}
                                >
                                  <option value="proposal_body">В бланке ТКП</option>
                                  <option value="tz_annex">В листах ТЗ</option>
                                  <option value="both">В ТКП и в ТЗ</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, -1)}
                              disabled={idx === 0}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                                isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600'
                              }`}
                              title="Переместить выше"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 1)}
                              disabled={idx === proposalImages.length - 1}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                                isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600'
                              }`}
                              title="Переместить ниже"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id)}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
                              title="Удалить изображение"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 4: TECHNICAL TASK (ТЗ) SHEETS - Only for 'complex_project' or when requested */}
              {(activeSectionTab === 'all' || activeSectionTab === 'tz') && (detailLevel === 'complex_project' || detailLevel === 'engineering_opk') && (
                <div className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                  isDark ? 'bg-slate-900/90 border-emerald-900/40' : 'bg-white border-emerald-200 shadow-xs'
                }`}>
                  <div className={`flex flex-wrap items-center justify-between border-b pb-2.5 gap-2 ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <div>
                      <h2 className={`text-xs font-bold flex items-center gap-2 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        <Layers className="w-4 h-4 text-emerald-500" />
                        4. Листы Технических заданий (Приложения) ({tzSheets.length})
                      </h2>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Отдельные листы ТЗ с параметрами деталей, квалитетами и требованиями GD&T
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={handleAddTzSheet}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Добавить лист ТЗ</span>
                      </button>
                      {tzSheets.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllTzSheets}
                          className="px-2 py-1 rounded-lg border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[11px] font-medium transition-all cursor-pointer hover:bg-red-100"
                          title="Удалить все листы ТЗ и оставить только ТКП"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />
                          <span>Удалить все ТЗ</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* TZ Sheets Tab Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {tzSheets.map((sheet, sIdx) => (
                      <div key={sheet.id} className="flex items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTzEditId(sheet.id);
                            setActivePreviewSheet(sheet.id);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                            activeTzEditId === sheet.id
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold'
                              : isDark 
                                ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200' 
                                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>Приложение №{sheet.appendixNumber}</span>
                          <span className={`text-[10px] truncate max-w-[80px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({sheet.partName.slice(0, 10)}...)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTzSheet(sheet.id)}
                          className="p-1 text-slate-400 hover:text-red-500 ml-0.5 cursor-pointer rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                          title={`Удалить лист «Приложение №${sheet.appendixNumber}»`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Active TZ Sheet Fields */}
                  {currentActiveTz && (
                    <div className={`p-3.5 rounded-xl border space-y-3 text-xs transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div>
                        <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Заголовок приложения:</label>
                        <input
                          type="text"
                          value={currentActiveTz.title}
                          onChange={(e) => handleUpdateActiveTzSheet({ title: e.target.value })}
                          className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Наименование детали / узла:</label>
                          <input
                            type="text"
                            value={currentActiveTz.partName}
                            onChange={(e) => handleUpdateActiveTzSheet({ partName: e.target.value })}
                            className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Номер чертежа:</label>
                          <input
                            type="text"
                            value={currentActiveTz.drawingNumber}
                            onChange={(e) => handleUpdateActiveTzSheet({ drawingNumber: e.target.value })}
                            className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Габариты (X × Y × Z):</label>
                          <input
                            type="text"
                            value={currentActiveTz.dimensions}
                            onChange={(e) => handleUpdateActiveTzSheet({ dimensions: e.target.value })}
                            className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Материал и сплав:</label>
                          <input
                            type="text"
                            value={currentActiveTz.material}
                            onChange={(e) => handleUpdateActiveTzSheet({ material: e.target.value })}
                            className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Interactive Metrology IT5-IT12 Tolerance Calculator */}
                      <div className={`p-2.5 rounded-xl border space-y-2 transition-colors ${
                        isDark ? 'bg-slate-900 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <label className={`block font-bold text-[11px] flex items-center gap-1 ${
                            isDark ? 'text-emerald-300' : 'text-emerald-800'
                          }`}>
                            <Sliders className="w-3 h-3 text-emerald-500" />
                            Калькулятор квалитетов допуска (ГОСТ 25346 / ISO 286):
                          </label>
                          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Правило T/MPE ≥ 4</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                          {[
                            { id: 'IT5', label: 'IT5 (±4 мкм)', desc: 'Прецизионный', equip: 'КИМ Mitutoyo Crysta-Apex (MPEe ≤ 1.7 мкм)' },
                            { id: 'IT6', label: 'IT6 (±8 мкм)', desc: 'Высокоточный', equip: 'КИМ Mitutoyo / Оптический микросканер' },
                            { id: 'IT7', label: 'IT7 (±15 мкм)', desc: 'Машиностроение', equip: '3D-сканер Scantech KSCAN-Magic' },
                            { id: 'IT8', label: 'IT8 (±25 мкм)', desc: 'Общепром.', equip: 'Лазерный 3D-сканер SIMSCAN / Рука PMT' },
                            { id: 'IT9-12', label: 'IT9–12 (±60-150 мкм)', desc: 'Крупногабарит', equip: 'Лазерный трекер Leica AT960 / ScanLine' },
                          ].map(it => (
                            <button
                              key={it.id}
                              type="button"
                              onClick={() => {
                                handleUpdateActiveTzSheet({
                                  qualityClass: `${it.label} — ${it.desc}`,
                                  equipmentType: it.equip
                                });
                                showToast(`Квалитет ${it.id}: рекомендовано СИ «${it.equip}»`);
                              }}
                              className={`p-1.5 rounded-lg text-left transition-all border cursor-pointer ${
                                currentActiveTz.qualityClass.includes(it.id)
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-200 font-bold'
                                  : isDark 
                                    ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
                              }`}
                            >
                              <div className={`font-bold text-[11px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{it.label}</div>
                              <div className={`text-[9px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{it.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Квалитет точности:</label>
                          <input
                            type="text"
                            value={currentActiveTz.qualityClass}
                            onChange={(e) => handleUpdateActiveTzSheet({ qualityClass: e.target.value })}
                            className={`w-full border rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition-colors ${
                              isDark ? 'bg-slate-900 border-slate-800 text-emerald-300' : 'bg-white border-slate-300 text-emerald-800'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Рекомендованное СИ:</label>
                          <input
                            type="text"
                            value={currentActiveTz.equipmentType}
                            onChange={(e) => handleUpdateActiveTzSheet({ equipmentType: e.target.value })}
                            className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none transition-colors ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: COMMERCIAL TERMS & VALIDITY */}
              {(activeSectionTab === 'all' || activeSectionTab === 'terms') && (
              <div className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h2 className={`text-xs font-bold flex items-center gap-2 border-b pb-2 ${
                  isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
                }`}>
                  <Clock className="w-4 h-4 text-blue-500" />
                  3. Условия предложения и срок действия
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Срок действия предложения (указывается в одном месте):
                    </label>
                    <input
                      type="text"
                      value={validUntilDate}
                      onChange={(e) => setValidUntilDate(e.target.value)}
                      placeholder="ДД.ММ.ГГГГ"
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Срок поставки:</label>
                    <input
                      type="text"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Гарантийный срок:</label>
                    <input
                      type="text"
                      value={warrantyMonths}
                      onChange={(e) => setWarrantyMonths(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Базис поставки (Инкотермс):</label>
                    <input
                      type="text"
                      value={deliveryPlace}
                      onChange={(e) => setDeliveryPlace(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`block font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Условия оплаты:</label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setPaymentTermsCustom('50% — аванс в течение 5 банковских дней, 50% — по готовности к отгрузке со склада Поставщика.')}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          50/50
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentTermsCustom('100% предоплата в течение 5 банковских дней с момента выставления счета.')}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          100% Аванс
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentTermsCustom('30% — аванс, 70% — в течение 10 дней после подписания УПД и акта приема-передачи.')}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          30/70
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentTermsCustom('100% постоплата в течение 15 банковских дней после подписания УПД.')}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-200'
                          }`}
                        >
                          Постоплата
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={paymentTermsCustom}
                      onChange={(e) => setPaymentTermsCustom(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Примечание к условиям поставки:</label>
                    <input
                      type="text"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="Например: В стоимость включены упаковка, страхование и доставка до терминала ТК"
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                </div>
              </div>
              )}

              {/* SECTION 5: TYPOGRAPHY, TABLE STYLING, SIGNATURES & EXECUTOR */}
              {(activeSectionTab === 'all' || activeSectionTab === 'sign') && (
              <div className={`rounded-2xl border p-4 space-y-4 transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h2 className={`text-xs font-bold flex items-center gap-2 border-b pb-2 ${
                  isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
                }`}>
                  <PenTool className="w-4 h-4 text-blue-500" />
                  5. Оформление бланка, типографика и подписи
                </h2>

                {/* Typography & Table Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className={`block font-bold text-[11px] mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Основной шрифт документа:
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as any)}
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    >
                      <option value="times">Times New Roman (По умолчанию, деловой стандарт)</option>
                      <option value="arial">Arial (Инженерный sans-serif)</option>
                      <option value="calibri">Calibri (Современный стиль)</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block font-bold text-[11px] mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Толщина и стиль границ таблицы:
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={tableBorderWidth}
                        onChange={(e) => setTableBorderWidth(e.target.value as any)}
                        className={`flex-1 border rounded-xl px-2 py-1.5 text-xs focus:outline-none transition-colors ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="1px">1 пт (Черная рамка)</option>
                        <option value="1.5px">1.5 пт (Утолщенная)</option>
                        <option value="2px">2 пт (Жирная рамка)</option>
                        <option value="0px">Без рамок</option>
                      </select>
                      <select
                        value={tableBorderStyle}
                        onChange={(e) => setTableBorderStyle(e.target.value as any)}
                        className={`flex-1 border rounded-xl px-2 py-1.5 text-xs focus:outline-none transition-colors ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="solid">Сплошная</option>
                        <option value="double">Двойная</option>
                        <option value="dashed">Штриховая</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block font-bold text-[11px] mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Цвет линий таблицы:
                    </label>
                    <select
                      value={tableBorderColor}
                      onChange={(e) => setTableBorderColor(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="#000000">Черный классический (#000000)</option>
                      <option value="#334155">Темно-серый (#334155)</option>
                      <option value="#1e3a8a">Темно-синий (#1e3a8a)</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block font-bold text-[11px] mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Отступы внутри ячеек:
                    </label>
                    <select
                      value={tableCellPadding}
                      onChange={(e) => setTableCellPadding(e.target.value as any)}
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="standard">Стандартные (деловой бланк)</option>
                      <option value="compact">Компактные (много позиций)</option>
                      <option value="spacious">Просторные</option>
                    </select>
                  </div>
                </div>

                {/* Signatures & Seals Options */}
                <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                }`}>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <Stamp className="w-4 h-4 text-blue-500" />
                    <span>Параметры подписи, печати и утверждения:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={includeFacsimile}
                        onChange={(e) => setIncludeFacsimile(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                      />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-800'}>
                        Факсимильная подпись
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={includeOfficialSeal}
                        onChange={(e) => setIncludeOfficialSeal(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                      />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-800'}>
                        Синяя гербовая печать
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={includeCustomerSignatureBlock}
                        onChange={(e) => setIncludeCustomerSignatureBlock(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                      />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-800'}>
                        Блок подписи Заказчика
                      </span>
                    </label>
                  </div>
                </div>

                {/* Signatory Display depending on templateMode */}
                {templateMode === 'official' ? (
                  <div className={`p-3 rounded-xl border space-y-1 ${
                    isDark ? 'bg-blue-950/40 border-blue-800/60' : 'bg-blue-50/80 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                        isDark ? 'text-blue-300' : 'text-blue-900'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        Официальный подписант документа (Руководитель):
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-200 text-blue-900'
                      }`}>
                        Единоличное право подписи
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Некрасов Сергей Юрьевич
                    </div>
                    <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Генеральный директор ООО «ДС-Инжиниринг» (Подпись и круглая печать)
                    </div>
                  </div>
                ) : (
                  <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                    isDark ? 'bg-amber-950/30 border-amber-800/60' : 'bg-amber-50/80 border-amber-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                        isDark ? 'text-amber-300' : 'text-amber-900'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        Подпись «Исполнитель» (Обезличенный шаблон):
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isDark ? 'bg-amber-900 text-amber-200' : 'bg-amber-200 text-amber-900'
                      }`}>
                        Формат в 2 строки
                      </span>
                    </div>
                    <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Подпись располагается строго в две строки: <strong>1-я строка: «Исполнитель»</strong>, <strong>2-я строка: «_________________ / Расшифровка»</strong>. Печать центрирована строго по середине листа документа.
                    </p>
                    <div>
                      <label className={`block font-medium text-[11px] mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Расшифровка подписи исполнителя (необязательно, по умолчанию линия подписи):
                      </label>
                      <input
                        type="text"
                        value={impersonalSignerName}
                        onChange={(e) => setImpersonalSignerName(e.target.value)}
                        placeholder="Например: Иванов И.И. (или оставить пустым)"
                        className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 transition-colors ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Customer Signature Block Toggle - strictly when ТЗ is present */}
                <div className={`p-3 rounded-xl border space-y-1.5 transition-colors ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Форма согласования Заказчиком:
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      hasTz 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {hasTz ? 'ТЗ прикреплено' : 'Без ТЗ'}
                    </span>
                  </div>

                  {hasTz ? (
                    <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={includeCustomerSignatureBlock}
                        onChange={(e) => setIncludeCustomerSignatureBlock(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Включить гриф согласования Заказчиком («Согласовано Заказчиком: ...»)
                      </span>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className={`text-[11px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Гриф согласования отображается только при добавлении Технического задания (ТЗ).
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleDetailLevelChange('complex_project');
                          setActiveSectionTab('tz');
                          setIncludeCustomerSignatureBlock(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                        title="Переключить в режим «ТКП + Листы ТЗ» и добавить спецификацию ТЗ"
                      >
                        + Прикрепить ТЗ
                      </button>
                    </div>
                  )}
                </div>

                {/* Staff Executor Dropdown from Company Registry */}
                <div className={`p-3 rounded-xl border space-y-1 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <label className={`block font-bold text-[11px] mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Исполнитель в подвале документа (контактное лицо):
                  </label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer font-medium transition-colors ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                    }`}
                  >
                    {DS_COMPANY_EMPLOYEES.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.displayLabel}
                      </option>
                    ))}
                  </select>
                  {selectedEmployee && selectedEmployee.id !== 'none' && (
                    <div className={`text-[10px] pt-1 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Должность: {selectedEmployee.position}</span>
                      <span>•</span>
                      <span>Тел: {selectedEmployee.phone}</span>
                      <span>•</span>
                      <span>{selectedEmployee.email}</span>
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: ALWAYS-ON LIVE A4 PREVIEW (6 cols on large screens) */}
        {/* ----------------------------------------------------------------------- */}
        <div className={`lg:col-span-6 h-full flex flex-col overflow-hidden transition-colors ${
          isDark ? 'bg-slate-900/40' : 'bg-slate-200/90'
        }`}>
          
          {/* Preview Toolbar: Sheet Switcher + Delete Sheet Controls + Zoom Controls */}
          <div className={`border-b p-2.5 flex flex-wrap items-center justify-between gap-2 z-10 shrink-0 transition-colors ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            {/* Dynamic Sheet Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {tkpPagesPlan.map((plan, pIdx) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setActivePreviewSheet(plan.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    (activePreviewSheet === plan.id || (activePreviewSheet === 'tkp' && pIdx === 0) || (activePreviewSheet === 'tkp_terms' && plan.type === 'terms'))
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {plan.type === 'terms' ? <PenTool className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                  <span>{plan.title}</span>
                </button>
              ))}

              {tzSheets.map((sheet, sIdx) => {
                const tzSheetNum = tkpPagesPlan.length + 1 + sIdx;
                return (
                  <div key={sheet.id} className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setActivePreviewSheet(sheet.id)}
                      className={`px-2 py-1 rounded-l-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        activePreviewSheet === sheet.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Лист {tzSheetNum}: ТЗ ({sheet.appendixNumber})</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTzSheet(sheet.id);
                      }}
                      className={`px-1 py-1 rounded-r-lg border-l transition-colors cursor-pointer ${
                        activePreviewSheet === sheet.id
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800 border-emerald-500'
                          : isDark ? 'bg-slate-900 text-slate-400 hover:text-rose-400 border-slate-800' : 'bg-slate-100 text-slate-500 hover:text-rose-600 border-slate-200'
                      }`}
                      title={`Удалить лист «Приложение №${sheet.appendixNumber}»`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              {totalDocumentPages > 1 && (
                <button
                  type="button"
                  onClick={() => setActivePreviewSheet('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    activePreviewSheet === 'all'
                      ? 'bg-purple-600 text-white shadow-xs font-bold'
                      : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                  title="Просмотр всех листов документа"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Все листы ({totalDocumentPages})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleAddTzSheet}
                className="px-2 py-1 rounded-lg border border-dashed text-xs font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                title="Добавить лист Технического задания (ТЗ)"
              >
                <Plus className="w-3 h-3" />
                <span>Лист ТЗ</span>
              </button>
            </div>

            {/* Scale / Zoom controls */}
            <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setZoomMode('fit')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                  zoomMode === 'fit' 
                    ? 'bg-blue-600 text-white' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Автоматически вписать в размер окна (по умолчанию)"
              >
                Вписать в окно
              </button>
              <button
                type="button"
                onClick={() => setZoomMode('100')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                  zoomMode === '100' 
                    ? 'bg-blue-600 text-white' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setZoomMode('width')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                  zoomMode === 'width' 
                    ? 'bg-blue-600 text-white' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                По ширине
              </button>
            </div>
          </div>

          {/* Scaled Sheet Viewport */}
          <div 
            ref={previewContainerRef}
            className={`flex-1 overflow-auto p-4 flex items-start justify-center transition-colors ${
              isDark ? 'bg-slate-950/90' : 'bg-slate-200/60'
            }`}
          >
            <div 
              ref={printSheetRef}
              style={{
                transform: `scale(${currentScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
                fontFamily: fontFamily === 'times' 
                  ? '"Times New Roman", Times, Georgia, serif' 
                  : fontFamily === 'arial' 
                    ? 'Arial, Helvetica, sans-serif' 
                    : 'Calibri, sans-serif',
                color: '#000000'
              }}
              className="flex flex-col items-center gap-8 py-4 shrink-0 print:gap-0 print:p-0 print:m-0 print:transform-none"
            >
              {/* ========================================================= */}
              {/* DYNAMIC MULTI-PAGE TKP SHEETS                             */}
              {/* ========================================================= */}
              {tkpPagesPlan.map((plan, pIdx) => {
                const isSelected = activePreviewSheet === 'all' || 
                  activePreviewSheet === plan.id || 
                  (activePreviewSheet === 'tkp' && pIdx === 0) ||
                  (activePreviewSheet === 'tkp_terms' && plan.type === 'terms');

                if (!isSelected) return null;

                const itemsToRender = plan.itemsChunk || [];
                const startNum = (plan.itemStartIndex || 0) + 1;

                return (
                  <div 
                    key={plan.id}
                    className="a4-page-render w-[794px] min-h-[1123px] bg-white text-black p-10 shadow-2xl rounded-sm shrink-0 flex flex-col justify-between relative print:m-0 print:p-8 print:shadow-none print:transform-none print:w-full print:min-h-[297mm] print:break-after-page"
                    style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
                  >
                    {/* Visual Page Badge in workspace (hidden in print) */}
                    <div className="absolute -top-3.5 left-6 px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm print:hidden flex items-center gap-1.5">
                      {plan.type === 'terms' ? <PenTool className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      <span>Лист {plan.sheetIndex} из {totalDocumentPages} • {plan.title}</span>
                    </div>

                    <div className="space-y-4">
                      {/* PAGE 1 HEADER (Official or Impersonal) */}
                      {(plan.type === 'single' || plan.type === 'spec_first') && (
                        <>
                          {templateMode === 'official' ? (
                            <div className="flex items-center justify-between pb-2 border-b-2 border-[#003399]">
                              <div className="shrink-0 mr-4">
                                <img
                                  src={EMBLEM_DATA_URL}
                                  alt="ДС-Инжиниринг"
                                  className="w-20 h-20 object-contain"
                                />
                              </div>
                              <div className="flex-1 text-center">
                                <div className="text-2xl font-bold tracking-tight text-[#003399] uppercase font-sans">
                                  ООО «ДС-Инжиниринг»
                                </div>
                                <div className="text-[11px] text-black mt-1 leading-snug">
                                  Адрес: 443051, г. Самара, ул. Свободы, 198
                                </div>
                                <div className="text-[11px] text-black leading-snug">
                                  тел/факс в Самаре (846) 954-02-92 &nbsp;&nbsp; e-mail: info@ds-enginering.ru
                                </div>
                                <div className="text-[11px] text-black leading-snug">
                                  ИНН 6312025587 / КПП 631201001 &nbsp;&nbsp; ОГРН 102 630 077 7986
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between pb-2 border-b-2 border-black text-center">
                              <div className="flex-1">
                                <div className="text-base font-bold text-black uppercase tracking-wider">
                                  КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ
                                </div>
                                <div className="text-[11px] text-slate-700 mt-0.5">
                                  Спецификация высокоточного оборудования и метрологических услуг
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Outgoing & Recipient Info */}
                          <div className="flex items-start justify-between text-xs text-black pt-2 pb-1">
                            <div className="text-left font-bold leading-tight">
                              {templateMode === 'official' ? (
                                <>
                                  <div>Исх. № {cleanOutgoingNumber}</div>
                                  <div className="pt-0.5">от {documentDate} г.</div>
                                </>
                              ) : (
                                <div>Дата составления: {documentDate} г.</div>
                              )}
                              {hasIncomingRef && incomingNumber && (
                                <div className="text-[11px] font-normal pt-1">
                                  {templateMode === 'official' ? 'На № ' : 'В ответ на запрос '}
                                  {incomingNumber.replace(/^(на\s*№?\s*)+/gi, '')} {incomingDate ? `от ${incomingDate} г.` : ''}
                                </div>
                              )}
                            </div>

                            <div className="text-right text-xs text-black max-w-sm leading-snug">
                              {ceoPost && <div className="font-normal">{ceoPost}</div>}
                              <div className="font-bold">{customerCompany}</div>
                              {ceoName && <div className="font-normal">{ceoName}</div>}
                            </div>
                          </div>

                          {/* Title & Greeting */}
                          <div className="text-center space-y-1 pt-1.5 pb-1">
                            <div className="text-sm font-bold text-black uppercase tracking-wider">
                              {templateMode === 'official' ? 'ТЕХНИЧЕСКО-КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ' : 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ'}
                            </div>
                            {proposalTitle && (
                              <div className="text-xs text-black font-semibold max-w-2xl mx-auto">
                                {proposalTitle}
                              </div>
                            )}
                            <div className="text-xs font-bold text-black pt-1">
                              {displayGreeting}
                            </div>
                            <div className="text-xs text-black">
                              Добрый день, в ответ на ваш запрос направляем технико-коммерческое предложение.
                            </div>
                          </div>
                        </>
                      )}

                      {/* CONTINUATION HEADER FOR SUBSEQUENT PAGES */}
                      {(plan.type === 'spec_continue' || plan.type === 'terms') && (
                        <>
                          {templateMode === 'official' ? (
                            <div className="flex items-center justify-between pb-2 border-b-2 border-[#003399]">
                              <div className="flex items-center gap-3">
                                <img src={EMBLEM_DATA_URL} alt="ДС-Инжиниринг" className="w-12 h-12 object-contain" />
                                <div className="text-left">
                                  <div className="text-sm font-bold text-[#003399] uppercase font-sans">ООО «ДС-Инжиниринг»</div>
                                  <div className="text-[10px] text-black">К ТКП Исх. № {cleanOutgoingNumber} от {documentDate} г.</div>
                                </div>
                              </div>
                              <div className="text-right text-xs text-black">
                                <div className="font-bold">{customerCompany}</div>
                                {ceoName && <div className="text-[11px] text-black/80">{ceoName}</div>}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                              <div className="text-left">
                                <div className="text-sm font-bold text-black uppercase">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</div>
                                <div className="text-[10px] text-slate-600">Лист {plan.sheetIndex}: {plan.title} от {documentDate} г.</div>
                              </div>
                              <div className="text-right text-xs text-black font-bold">{customerCompany}</div>
                            </div>
                          )}
                        </>
                      )}

                      {/* SPECIFICATION TABLE SECTION */}
                      {plan.type !== 'terms' && (
                        <div className="space-y-1">
                          <div className="text-center text-xs font-bold text-black tracking-wider uppercase pt-1 pb-0.5">
                            {plan.type === 'spec_continue' ? 'СПЕЦИФИКАЦИЯ ПОСТАВКИ (ПРОДОЛЖЕНИЕ)' : 'СПЕЦИФИКАЦИЯ ПОСТАВКИ'}
                          </div>

                          <table 
                            className="w-full text-left text-[11px] border-collapse"
                            style={{
                              borderWidth: tableBorderWidth,
                              borderColor: tableBorderColor,
                              borderStyle: tableBorderStyle
                            }}
                          >
                            <thead>
                              <tr 
                                className="text-black font-bold"
                                style={{
                                  borderBottomWidth: tableBorderWidth,
                                  borderColor: tableBorderColor,
                                  borderStyle: tableBorderStyle,
                                  backgroundColor: '#f8fafc'
                                }}
                              >
                                <th style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }} className="w-10 text-center">№ п/п</th>
                                <th style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }}>Наименование</th>
                                <th style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }} className="w-12 text-center">Ед.</th>
                                <th style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }} className="w-14 text-center">Кол-во</th>
                                <th style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }} className="w-28 text-right">Цена за ед.</th>
                                <th style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }} className="w-32 text-right">Стоимость ({currency === 'RUB' ? 'руб.' : currency})</th>
                              </tr>
                            </thead>
                            <tbody>
                              {itemsToRender.map((item, idx) => {
                                const itemTotal = item.price * (1 - (item.discountPercent || 0) / 100) * item.quantity;
                                return (
                                  <tr key={item.id || idx} className="text-black">
                                    <td style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }} className="text-center font-mono">{startNum + idx}</td>
                                    <td style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }}>
                                      <div className="font-semibold text-black leading-snug">{item.name}</div>
                                      {item.sku && <div className="text-[9px] text-black/70 font-mono">Арт: {item.sku}</div>}
                                    </td>
                                    <td style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }} className="text-center text-black">{item.unit}</td>
                                    <td style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }} className="text-center font-mono">{item.quantity}</td>
                                    <td style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }} className="text-right font-mono">{formatMoneyRu(item.price, currency)}</td>
                                    <td style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: tableCellPadding === 'compact' ? '4px 6px' : tableCellPadding === 'spacious' ? '8px 10px' : '5px 7px' }} className="text-right font-mono font-bold text-black">{formatMoneyRu(itemTotal, currency)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            {plan.isLastSpecChunk && (
                              <tfoot>
                                <tr className="text-black font-bold">
                                  <td 
                                    colSpan={5} 
                                    style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: '5px 8px' }} 
                                    className="text-right"
                                  >
                                    ИТОГО без НДС, {currency === 'RUB' ? 'руб.' : currency}:
                                  </td>
                                  <td 
                                    style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: '5px 8px' }} 
                                    className="text-right font-mono font-bold"
                                  >
                                    {financialTotals.subtotalFormatted}
                                  </td>
                                </tr>
                                {vatRate > 0 && (
                                  <tr className="text-black font-bold">
                                    <td 
                                      colSpan={5} 
                                      style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: '5px 8px' }} 
                                      className="text-right"
                                    >
                                      {financialTotals.vatSheetLabel}
                                    </td>
                                    <td 
                                      style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: '5px 8px' }} 
                                      className="text-right font-mono font-bold"
                                    >
                                      {financialTotals.vatAmountFormatted}
                                    </td>
                                  </tr>
                                )}
                                <tr className="text-black font-extrabold text-[12px] bg-slate-50">
                                  <td 
                                    colSpan={5} 
                                    style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: '5px 8px' }} 
                                    className="text-right uppercase"
                                  >
                                    {financialTotals.totalSheetLabel}
                                  </td>
                                  <td 
                                    style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, padding: '5px 8px' }} 
                                    className="text-right font-mono font-bold text-black"
                                  >
                                    {financialTotals.totalWithVatFormatted}
                                  </td>
                                </tr>
                              </tfoot>
                            )}
                          </table>

                          {plan.isLastSpecChunk && (
                            <div className="text-[10px] text-black italic pt-1">
                              Сумма прописью: {financialTotals.wordsRu}
                            </div>
                          )}

                          {plan.type !== 'single' && (
                            <div className="mt-3 p-2.5 rounded bg-slate-50 border border-black/30 text-[10.5px] text-black text-center italic">
                              {plan.isLastSpecChunk
                                ? '* Условия поставки, порядок оплаты, гарантийные обязательства и подписи сторон приведены на следующем Листе.'
                                : `* Продолжение спецификации поставки приведено на Листе ${plan.sheetIndex + 1}.`}
                            </div>
                          )}
                        </div>
                      )}

                      {/* SINGLE PAGE TERMS & SIGNATURES */}
                      {plan.type === 'single' && (
                        <>
                          <div className="p-3 rounded border border-black text-[10.5px] space-y-1 text-black bg-slate-50/30 mt-2">
                            <div className="font-bold text-black text-xs mb-0.5">Условия поставки и гарантии:</div>
                            <div>• <strong>Срок действия предложения:</strong> до {validUntilDate} г.</div>
                            <div>• <strong>Срок поставки:</strong> {deliveryDays}.</div>
                            <div>• <strong>Условия оплаты:</strong> {templateMode === 'impersonal' ? paymentTermsCustom.replace(/со склада в Самаре/gi, 'со склада Поставщика') : paymentTermsCustom}.</div>
                            <div>• <strong>Базис поставки:</strong> {templateMode === 'impersonal' ? deliveryPlace.replace(/\(DDP Самара\)/gi, '(DDP склад Заказчика)') : deliveryPlace}.</div>
                            <div>• <strong>Гарантия:</strong> {warrantyMonths}. {templateMode === 'impersonal' ? serviceSla.replace(/«ДС-Инжиниринг»/gi, 'Поставщика') : serviceSla}</div>
                            {customNotes && <div>• <strong>Примечание:</strong> {customNotes}</div>}
                          </div>

                          <div className="pt-3 border-t border-black relative flex items-end justify-between min-h-[95px]">
                            {templateMode === 'official' ? (
                              <div className="space-y-0.5 min-w-[180px] z-10 text-left">
                                <div className="text-[11px] font-bold text-black">{signatoryPost}</div>
                                <div className="text-[10px] text-black">ООО «ДС-Инжиниринг»</div>
                                <div className="pt-4 font-bold text-[11px] text-black">{signatoryName}</div>
                              </div>
                            ) : (
                              <div className="space-y-0.5 min-w-[180px] z-10 text-left">
                                <div className="text-[11px] font-bold text-black uppercase tracking-wide">
                                  Исполнитель
                                </div>
                                <div className="pt-5 text-[11px] text-black font-medium">
                                  ____________________ / {impersonalSignerName || '____________________'}
                                </div>
                              </div>
                            )}

                            {/* Centered Seal & Signature */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center justify-center pointer-events-none z-20">
                              <div className="relative w-40 h-24 flex items-center justify-center">
                                {templateMode === 'official' ? (
                                  <>
                                    {includeFacsimile && (
                                      <svg
                                        viewBox="0 0 240 100"
                                        className="absolute w-32 h-16 z-10 opacity-95 transform -rotate-3 pointer-events-none"
                                        fill="none"
                                      >
                                        <path d="M 15 65 Q 25 15, 38 45 T 52 50 Q 60 20, 68 52 Q 74 62, 85 48 Q 95 38, 105 52 T 120 48 Q 132 30, 142 55 Q 150 75, 175 42 Q 195 20, 225 35" 
                                              stroke="#1e40af" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
                                        <path d="M 32 40 C 45 42, 60 38, 80 44 M 65 42 Q 78 72, 86 62 Q 95 50, 110 56" 
                                              stroke="#1e3a8a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.88" />
                                        <path d="M 125 50 Q 155 78, 190 70 Q 220 62, 232 40" 
                                              stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
                                        <path d="M 40 78 Q 90 85, 160 80 Q 210 75, 230 60" 
                                              stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
                                      </svg>
                                    )}
                                    {includeOfficialSeal && (
                                      <div className="w-20 h-20 rounded-full border-2 border-blue-600/85 flex items-center justify-center text-[8px] text-blue-800 text-center font-serif leading-tight opacity-80 transform -rotate-12 bg-white/20 backdrop-blur-[0.5px]">
                                        ООО «ДС-ИНЖИНИРИНГ»<br />М.П.<br />ОГРН 1126312004520
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  includeOfficialSeal && (
                                    <div className="w-20 h-20 rounded-full border-2 border-blue-600/80 flex items-center justify-center text-[8px] text-blue-800 text-center font-serif leading-tight opacity-80 transform -rotate-6 bg-white/30 backdrop-blur-[0.5px]">
                                      ОТДЕЛ СБЫТА<br />
                                      <span className="text-[10px] font-bold my-0.5 inline-block">М. П.</span><br />
                                      ДЛЯ ДОКУМЕНТОВ
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {includeCustomerSignatureBlock ? (
                              <div className="space-y-0.5 text-right min-w-[180px] z-10">
                                <div className="text-[11px] font-bold text-black">
                                  {templateMode === 'official' ? 'Согласовано Заказчиком:' : 'Заказчик:'}
                                </div>
                                <div className="text-[10px] text-black">{customerCompany}</div>
                                <div className="pt-4 text-[10px] text-black">_________________ / {ceoName}</div>
                              </div>
                            ) : (
                              <div className="min-w-[180px] pointer-events-none"></div>
                            )}
                          </div>

                          {templateMode === 'official' && selectedEmployee && selectedEmployee.id !== 'none' && (
                            <div className="pt-1.5 text-left text-[9.5px] text-black leading-tight space-y-0.5">
                              <div className="font-semibold">Исполнитель:</div>
                              <div>{selectedEmployee.position} — {selectedEmployee.shortName || selectedEmployee.fullName}</div>
                              <div>Тел: {selectedEmployee.phone}&nbsp;&nbsp;E-mail: {selectedEmployee.email}</div>
                            </div>
                          )}
                        </>
                      )}

                      {/* DEDICATED TERMS & SIGNATURES SHEET */}
                      {plan.type === 'terms' && (
                        <>
                          <div className="text-center text-xs font-bold text-black tracking-wider uppercase pt-2 pb-1">
                            УСЛОВИЯ ПОСТАВКИ, ОПЛАТЫ И ГАРАНТИЙНЫЕ ОБЯЗАТЕЛЬСТВА
                          </div>

                          {/* Full Commercial Terms Box */}
                          <div className="p-4 rounded border border-black text-[11.5px] space-y-2 text-black bg-slate-50/40 leading-relaxed">
                            <div className="font-bold text-black text-xs mb-1 uppercase tracking-wide">1. Регламент поставки и финансовые условия:</div>
                            <div>• <strong>Срок действия предложения:</strong> до {validUntilDate} г. (14 календарных дней).</div>
                            <div>• <strong>Срок поставки продукции / выполнения работ:</strong> {deliveryDays}.</div>
                            <div>• <strong>Условия оплаты:</strong> {templateMode === 'impersonal' ? paymentTermsCustom.replace(/со склада в Самаре/gi, 'со склада Поставщика') : paymentTermsCustom}.</div>
                            <div>• <strong>Базис поставки:</strong> {templateMode === 'impersonal' ? deliveryPlace.replace(/\(DDP Самара\)/gi, '(DDP склад Заказчика)') : deliveryPlace}.</div>
                            <div>• <strong>Гарантийный срок и сервис:</strong> {warrantyMonths}. {templateMode === 'impersonal' ? serviceSla.replace(/«ДС-Инжиниринг»/gi, 'Поставщика') : serviceSla}</div>
                            {customNotes && <div>• <strong>Особые условия:</strong> {customNotes}</div>}
                          </div>

                          {/* Proposal Images & Technical Drawings */}
                          {proposalImages.filter(img => img.placement === 'proposal_body' || img.placement === 'both' || !img.placement).length > 0 && (
                            <div className="space-y-2 pt-2">
                              <div className="text-[11px] font-bold text-black border-b border-black/60 pb-0.5 uppercase tracking-wide">
                                Иллюстрации, эскизы и схемы изделия:
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {proposalImages
                                  .filter(img => img.placement === 'proposal_body' || img.placement === 'both' || !img.placement)
                                  .map((img, i) => (
                                    <div 
                                      key={img.id || i}
                                      className={`border border-black p-2 bg-slate-50/20 rounded space-y-1.5 ${
                                        img.widthPercent === 100 ? 'sm:col-span-2' : ''
                                      }`}
                                    >
                                      <div className="w-full flex items-center justify-center bg-white border border-black/20 p-1">
                                        <img
                                          src={img.url}
                                          alt={img.title || `Иллюстрация ${i + 1}`}
                                          className="max-h-36 w-auto object-contain mx-auto"
                                        />
                                      </div>
                                      <div className="text-[10px] text-black text-center font-medium">
                                        <strong>Рис. {i + 1}.</strong> {img.title || 'Иллюстрация к предложению'}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Signatures & Facsimile (Centered Seal & Signature) */}
                          <div className="pt-6 border-t border-black relative flex items-end justify-between min-h-[110px] mt-4">
                            {templateMode === 'official' ? (
                              <div className="space-y-0.5 min-w-[200px] z-10 text-left">
                                <div className="text-xs font-bold text-black">{signatoryPost}</div>
                                <div className="text-xs text-black">ООО «ДС-Инжиниринг»</div>
                                <div className="pt-6 font-bold text-xs text-black">{signatoryName}</div>
                              </div>
                            ) : (
                              <div className="space-y-1 min-w-[200px] z-10 text-left">
                                <div className="text-xs font-bold text-black uppercase tracking-wide">
                                  Исполнитель
                                </div>
                                <div className="pt-7 text-xs text-black font-medium">
                                  ____________________ / {impersonalSignerName || '____________________'}
                                </div>
                              </div>
                            )}

                            {/* Center Column: Round Seal & Facsimile (STRICTLY CENTERED) */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center justify-center pointer-events-none z-20">
                              <div className="relative w-44 h-28 flex items-center justify-center">
                                {templateMode === 'official' ? (
                                  <>
                                    {includeFacsimile && (
                                      <svg
                                        viewBox="0 0 240 100"
                                        className="absolute w-36 h-20 z-10 opacity-95 transform -rotate-3 pointer-events-none"
                                        fill="none"
                                      >
                                        <path d="M 15 65 Q 25 15, 38 45 T 52 50 Q 60 20, 68 52 Q 74 62, 85 48 Q 95 38, 105 52 T 120 48 Q 132 30, 142 55 Q 150 75, 175 42 Q 195 20, 225 35" 
                                              stroke="#1e40af" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
                                        <path d="M 32 40 C 45 42, 60 38, 80 44 M 65 42 Q 78 72, 86 62 Q 95 50, 110 56" 
                                              stroke="#1e3a8a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.88" />
                                        <path d="M 125 50 Q 155 78, 190 70 Q 220 62, 232 40" 
                                              stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
                                        <path d="M 40 78 Q 90 85, 160 80 Q 210 75, 230 60" 
                                              stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
                                        <circle cx="168" cy="38" r="2.2" fill="#1e40af" />
                                        <circle cx="198" cy="32" r="2.2" fill="#1e40af" />
                                      </svg>
                                    )}
                                    {includeOfficialSeal && (
                                      <div className="w-24 h-24 rounded-full border-2 border-blue-600/85 flex items-center justify-center text-[9px] text-blue-800 text-center font-serif leading-tight opacity-80 transform -rotate-12 bg-white/20 backdrop-blur-[0.5px] shadow-2xs">
                                        ООО «ДС-ИНЖИНИРИНГ»<br />М.П.<br />ОГРН 1126312004520
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  includeOfficialSeal && (
                                    <div className="w-24 h-24 rounded-full border-2 border-blue-600/80 flex items-center justify-center text-[8.5px] text-blue-800 text-center font-serif leading-tight opacity-80 transform -rotate-6 bg-white/30 backdrop-blur-[0.5px] shadow-2xs">
                                      ОТДЕЛ СБЫТА И ПРОДАЖ<br />
                                      <span className="text-xs font-bold my-0.5 inline-block">М. П.</span><br />
                                      ДЛЯ ДОКУМЕНТОВ
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Right Column: Customer Approval Block */}
                            {includeCustomerSignatureBlock ? (
                              <div className="space-y-0.5 text-right min-w-[200px] z-10">
                                <div className="text-xs font-bold text-black">
                                  {templateMode === 'official' ? 'Согласовано Заказчиком:' : 'Заказчик:'}
                                </div>
                                <div className="text-xs text-black">{customerCompany}</div>
                                <div className="pt-6 text-xs text-black">_________________ / {ceoName}</div>
                              </div>
                            ) : (
                              <div className="min-w-[200px] pointer-events-none"></div>
                            )}
                          </div>

                          {/* Executor Footer Block */}
                          {templateMode === 'official' && selectedEmployee && selectedEmployee.id !== 'none' && (
                            <div className="pt-2 text-left text-[10px] text-black leading-tight space-y-0.5">
                              <div className="font-semibold">Исполнитель:</div>
                              <div>{selectedEmployee.position} — {selectedEmployee.shortName || selectedEmployee.fullName}</div>
                              <div>Тел: {selectedEmployee.phone}&nbsp;&nbsp;E-mail: {selectedEmployee.email}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Page Footer */}
                    <div className="pt-2 flex items-center justify-between text-[9px] text-black/60 font-mono">
                      <span>{templateMode === 'official' ? 'ООО «ДС-Инжиниринг» • Коммерческое предложение' : 'Коммерческое предложение'}</span>
                      <span>Лист {plan.sheetIndex} из {totalDocumentPages}</span>
                    </div>
                  </div>
                );
              })}

              {/* ========================================================= */}
              {/* TECHNICAL ASSIGNMENT (ТЗ) ANNEX SHEETS                   */}
              {/* ========================================================= */}
              {tzSheets.map((tzSheet, sIdx) => {
                const isSelected = activePreviewSheet === 'all' || activePreviewSheet === tzSheet.id;
                if (!isSelected) return null;
                const sheetNumber = tkpPagesPlan.length + 1 + sIdx;

                return (
                  <div
                    key={tzSheet.id || sIdx}
                    className="a4-page-render w-[794px] min-h-[1123px] bg-white text-black p-10 shadow-2xl rounded-sm shrink-0 flex flex-col justify-between relative print:m-0 print:p-8 print:shadow-none print:transform-none print:w-full print:min-h-[297mm] print:break-after-page"
                    style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
                  >
                    {/* Visual Page Badge */}
                    <div className="absolute -top-3.5 left-6 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm print:hidden flex items-center gap-1.5">
                      <Layers className="w-3 h-3" />
                      <span>Лист {sheetNumber} из {totalDocumentPages} • Приложение №{tzSheet.appendixNumber} (Техническое задание)</span>
                    </div>

                    <div className="space-y-4">
                      {/* Header */}
                      {templateMode === 'official' ? (
                        <div className="flex items-center justify-between pb-2 border-b-2 border-[#003399]">
                          <div className="shrink-0 mr-4">
                            <img
                              src={EMBLEM_DATA_URL}
                              alt="ДС-Инжиниринг"
                              className="w-16 h-16 object-contain"
                            />
                          </div>
                          <div className="flex-1 text-center">
                            <div className="text-xl font-bold tracking-tight text-[#003399] uppercase font-sans">
                              ООО «ДС-Инжиниринг»
                            </div>
                            <div className="text-[10.5px] text-black leading-snug">
                              Приложение №{tzSheet.appendixNumber} к ТКП Исх. № {cleanOutgoingNumber} от {documentDate} г.
                            </div>
                          </div>
                          <div className="text-right text-[11px] text-black">
                            <div className="font-bold">{customerCompany}</div>
                            {ceoName && <div>{ceoName}</div>}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                          <div className="text-left">
                            <div className="text-sm font-bold text-black uppercase">
                              ТЕХНИЧЕСКОЕ ЗАДАНИЕ (Приложение №{tzSheet.appendixNumber})
                            </div>
                            <div className="text-[10px] text-slate-600">
                              К коммерческому предложению от {documentDate} г.
                            </div>
                          </div>
                          <div className="text-right text-xs text-black font-bold">
                            {customerCompany}
                          </div>
                        </div>
                      )}

                      {/* Document Title */}
                      <div className="text-center space-y-1 pt-1 pb-1">
                        <div className="text-sm font-bold text-black uppercase tracking-wide">
                          {tzSheet.title || `ТЕХНИЧЕСКОЕ ЗАДАНИЕ (Приложение №${tzSheet.appendixNumber})`}
                        </div>
                        <div className="text-xs text-slate-700 italic">
                          Требования к контролю геометрии, допускам формы, расположению поверхностей (GD&T) и протоколам измерений
                        </div>
                      </div>

                      {/* Part Parameters Table */}
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-black uppercase tracking-wide border-b border-black pb-0.5">
                          1. Исходные данные и параметры контролируемого объекта:
                        </div>
                        <table className="w-full text-xs text-black border-collapse" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor, borderStyle: tableBorderStyle }}>
                          <tbody>
                            <tr>
                              <td className="w-1/3 font-semibold p-1.5 bg-slate-50" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>Наименование детали / узла:</td>
                              <td className="p-1.5 font-bold" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>{tzSheet.partName || 'Не указано'}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold p-1.5 bg-slate-50" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>Обозначение чертежа / CAD:</td>
                              <td className="p-1.5 font-mono" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>{tzSheet.drawingNumber || 'По чертежу Заказчика'}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold p-1.5 bg-slate-50" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>Габаритные размеры:</td>
                              <td className="p-1.5 font-mono" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>{tzSheet.dimensions || '—'}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold p-1.5 bg-slate-50" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>Материал и масса:</td>
                              <td className="p-1.5" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>{tzSheet.material || '—'} {tzSheet.weight ? `(масса: ${tzSheet.weight})` : ''}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold p-1.5 bg-slate-50" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>Квалитет точности и допуски:</td>
                              <td className="p-1.5 font-semibold text-blue-900" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>{tzSheet.qualityClass || 'IT6 — IT7'}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold p-1.5 bg-slate-50" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>Применяемые СИ и оборудование:</td>
                              <td className="p-1.5" style={{ borderWidth: tableBorderWidth, borderColor: tableBorderColor }}>{tzSheet.equipmentType || 'Координатно-измерительная машина Mitutoyo / 3D-сканер'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* GD&T Requirements */}
                      {tzSheet.gdtRequirements && tzSheet.gdtRequirements.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-black uppercase tracking-wide border-b border-black pb-0.5">
                            2. Метрологические требования и допуски формы (GD&T):
                          </div>
                          <ul className="text-[11px] text-black space-y-1 pl-4 list-disc">
                            {tzSheet.gdtRequirements.map((req, rIdx) => (
                              <li key={rIdx} className="leading-snug">
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Environmental & Delivery Formats */}
                      <div className="p-2.5 rounded border border-black text-[11px] space-y-1 text-black bg-slate-50/40">
                        <div className="font-bold text-xs mb-0.5">3. Условия проведения измерений и формат отчетности:</div>
                        <div>• <strong>Температурный режим:</strong> {tzSheet.temperatureConditions || '+20 °C ± 0.5 °C (ГОСТ 8.050-73)'}.</div>
                        <div>• <strong>Формат отчетной документации:</strong> {tzSheet.reportFormat || 'Официальный протокол измерений геометрии (PDF) + CAD-модель (STEP/IGES)'}.</div>
                        {tzSheet.notes && <div>• <strong>Особые требования:</strong> {tzSheet.notes}</div>}
                      </div>

                      {/* Signatures & Seals on TZ Sheet */}
                      <div className="pt-4 border-t border-black relative flex items-end justify-between min-h-[95px] mt-3">
                        {/* Contractor Side */}
                        <div className="space-y-0.5 min-w-[200px] z-10 text-left">
                          <div className="text-[11px] font-bold text-black uppercase">Утверждаю (Исполнитель):</div>
                          <div className="text-[10.5px] text-black">
                            {templateMode === 'official' ? 'Генеральный директор ООО «ДС-Инжиниринг»' : 'Руководитель проекта'}
                          </div>
                          <div className="pt-4 font-bold text-[11px] text-black">
                            {templateMode === 'official' ? 'Некрасов С.Ю.' : (impersonalSignerName || '_________________')}
                          </div>
                        </div>

                        {/* Centered Seal & Signature */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center justify-center pointer-events-none z-20">
                          <div className="relative w-40 h-24 flex items-center justify-center">
                            {templateMode === 'official' ? (
                              <>
                                {includeFacsimile && (
                                  <svg
                                    viewBox="0 0 240 100"
                                    className="absolute w-32 h-16 z-10 opacity-95 transform -rotate-3 pointer-events-none"
                                    fill="none"
                                  >
                                    <path d="M 15 65 Q 25 15, 38 45 T 52 50 Q 60 20, 68 52 Q 74 62, 85 48 Q 95 38, 105 52 T 120 48 Q 132 30, 142 55 Q 150 75, 175 42 Q 195 20, 225 35" 
                                          stroke="#1e40af" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
                                    <path d="M 32 40 C 45 42, 60 38, 80 44 M 65 42 Q 78 72, 86 62 Q 95 50, 110 56" 
                                          stroke="#1e3a8a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.88" />
                                    <path d="M 125 50 Q 155 78, 190 70 Q 220 62, 232 40" 
                                          stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
                                  </svg>
                                )}
                                {includeOfficialSeal && (
                                  <div className="w-20 h-20 rounded-full border-2 border-blue-600/85 flex items-center justify-center text-[8px] text-blue-800 text-center font-serif leading-tight opacity-80 transform -rotate-12 bg-white/20 backdrop-blur-[0.5px]">
                                    ООО «ДС-ИНЖИНИРИНГ»<br />М.П.<br />ОГРН 1126312004520
                                  </div>
                                )}
                              </>
                            ) : (
                              includeOfficialSeal && (
                                <div className="w-20 h-20 rounded-full border-2 border-blue-600/80 flex items-center justify-center text-[8px] text-blue-800 text-center font-serif leading-tight opacity-80 transform -rotate-6 bg-white/30 backdrop-blur-[0.5px]">
                                  ОТДЕЛ СБЫТА<br />
                                  <span className="text-[10px] font-bold my-0.5 inline-block">М. П.</span><br />
                                  ДЛЯ ДОКУМЕНТОВ
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Customer Side */}
                        {includeCustomerSignatureBlock ? (
                          <div className="space-y-0.5 text-right min-w-[200px] z-10">
                            <div className="text-[11px] font-bold text-black uppercase">Согласовано (Заказчик):</div>
                            <div className="text-[10.5px] text-black">{customerCompany}</div>
                            <div className="pt-4 text-[10.5px] text-black">_________________ / {ceoName}</div>
                          </div>
                        ) : (
                          <div className="min-w-[200px] pointer-events-none"></div>
                        )}
                      </div>
                    </div>

                    {/* Page Footer */}
                    <div className="pt-2 flex items-center justify-between text-[9px] text-black/60 font-mono">
                      <span>{templateMode === 'official' ? 'ООО «ДС-Инжиниринг» • Техническое задание' : 'Техническое задание'}</span>
                      <span>Лист {sheetNumber} из {totalDocumentPages}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Site Image Library Modal */}
      <SiteImageLibraryModal
        isOpen={isSiteLibraryOpen}
        onClose={() => setIsSiteLibraryOpen(false)}
        onSelectImage={handleSelectFromLibrary}
        isDark={isDark}
      />

      {/* Proposal Verifier Modal */}
      <ProposalVerifierModal
        isOpen={isVerifierOpen}
        onClose={() => setIsVerifierOpen(false)}
        result={verificationResult}
        onFixIssue={(targetTab) => {
          setActiveSectionTab(targetTab);
          setIsVerifierOpen(false);
        }}
        isDark={isDark}
      />

      {/* DaData & Russian Enterprises Search Modal */}
      {isDadataModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Поиск организации по ИНН / DaData / ЕГРЮЛ
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Реестр промышленных предприятий, машиностроительных заводов и институтов РФ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDadataModalOpen(false)}
                className={`p-1 rounded-lg ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Введите ИНН (10 или 12 цифр), ОГРН, название компании или город..."
                  value={dadataSearchQuery}
                  onChange={(e) => setDadataSearchQuery(e.target.value)}
                  autoFocus
                  className={`w-full pl-9 pr-8 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                {dadataSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDadataSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Picks */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Частые:</span>
                {['ОДК-Кузнецов', 'Авиакор', 'РКЦ Прогресс', 'Тяжмаш', 'КАМАЗ', 'АВТОВАЗ', 'Алмаз-Антей', 'ВНИИМС'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setDadataSearchQuery(tag)}
                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-medium border shrink-0 transition-colors cursor-pointer ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Search Results List */}
              <div className="space-y-2.5">
                {isSearchingDadataModal && (
                  <div className="py-8 text-center text-xs text-blue-500 flex flex-col items-center justify-center gap-2">
                    <span className="animate-spin text-lg">⏳</span>
                    <span>Поиск в Федеральной базе ЕГРЮЛ через DaData...</span>
                  </div>
                )}

                {!isSearchingDadataModal && dadataSearchResults.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    {dadataModalError || `По запросу «${dadataSearchQuery}» ничего не найдено в ЕГРЮЛ через DaData.`}
                    <div className="mt-1 text-[11px] text-slate-500">
                      Введите 10-значный ИНН организации (или 12-значный для ИП) для автоматической загрузки реквизитов.
                    </div>
                  </div>
                )}

                {!isSearchingDadataModal && dadataSearchResults.map((ent, idx) => (
                  <div
                    key={`${ent.inn}-${idx}`}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800 hover:border-blue-500/50' : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {ent.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          ИНН {ent.inn}
                        </span>
                        {ent.kpp && (
                          <span className="text-[10px] font-mono text-slate-400">
                            КПП {ent.kpp}
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {ent.address}
                      </div>
                      <div className="text-[10.5px] text-slate-500">
                        {ent.ceoPost}: <strong>{ent.ceoName}</strong> • {ent.industry}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleSelectEnterprise(ent);
                        setIsDadataModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Выбрать</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

