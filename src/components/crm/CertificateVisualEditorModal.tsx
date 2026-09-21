import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Save, 
  Printer, 
  Download, 
  Sparkles, 
  Layout, 
  Sliders, 
  Palette, 
  FileText, 
  Paperclip, 
  Check, 
  UploadCloud, 
  Eye, 
  Trash2, 
  Plus, 
  Building2, 
  UserCheck, 
  Award, 
  ZoomIn, 
  ZoomOut,
  Stamp,
  BookOpen,
  Image as ImageIcon,
  RotateCcw,
  SlidersHorizontal,
  Info,
  Maximize2,
  Type,
  MoveVertical,
  ChevronDown,
  Search,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { TrainingCertificate, AttachedDocument } from '../../types';
import { AssetPickerModal } from './AssetPickerModal';
import { CertificateRichTextEditor } from './CertificateRichTextEditor';
import { CERTIFICATE_TEMPLATES_CATALOG, PRESET_COURSE_TOPICS } from '../../data/defaultCertificates';
import { MANUFACTURER_LOGOS } from '../../data/manufacturerLogos';
import { STAFF_DIRECTORY } from '../../utils/staffDirectory';
import { apiService } from '../../services/apiService';
import { 
  generateCertificateHtml, 
  printCertificateInWindow, 
  downloadCertificatePdf,
  downloadCertificateHtml
} from '../../utils/printCertificate';

interface CertificateVisualEditorModalProps {
  certificate: TrainingCertificate;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cert: TrainingCertificate) => Promise<void> | void;
  crmCompanies: Array<{ id: string; name: string }>;
  crmContacts: Array<{ id: string; fullName: string; position?: string; companyName?: string; companyId?: string }>;
  authUsers: Array<{ id: string; fullName: string; role: string }>;
  onCompanyCreated?: (company: { id: string; name: string }) => void;
  onOpenNewCompanyModal?: () => void;
  onViewDocument?: (doc: AttachedDocument, cert: TrainingCertificate) => void;
}

export const CertificateVisualEditorModal: React.FC<CertificateVisualEditorModalProps> = ({
  certificate: initialCert,
  isOpen,
  onClose,
  onSave,
  crmCompanies,
  crmContacts,
  authUsers,
  onCompanyCreated,
  onOpenNewCompanyModal,
  onViewDocument
}) => {
  // Active Working Draft with strict engineering company defaults
  const [cert, setCert] = useState<TrainingCertificate>(() => ({
    ...initialCert,
    certificateType: initialCert.certificateType || 'training',
    certificateTitle: initialCert.certificateTitle || 'СВИДЕТЕЛЬСТВО',
    certificateGivenToText: initialCert.certificateGivenToText || 'выдано',
    templateTheme: initialCert.templateTheme || 'classic_engineering',
    customPrimaryColor: initialCert.customPrimaryColor || '#0f172a',
    watermarkType: initialCert.watermarkType || 'hexagon_global_cmm',
    watermarkOpacity: initialCert.watermarkOpacity !== undefined ? initialCert.watermarkOpacity : 20,
    showStamp: initialCert.showStamp !== false,
    showSignature: initialCert.showSignature !== false,
    showDsLogoBottom: initialCert.showDsLogoBottom !== false,
    showQrCode: false, // Strict requirement: QR code is not needed
    leftLogo: initialCert.leftLogo || 'hexagon',
    rightLogo: initialCert.rightLogo || 'polyworks',
    instructor: initialCert.instructor || STAFF_DIRECTORY.nekrasov.fullName,
    signatoryName: initialCert.signatoryName || STAFF_DIRECTORY.nekrasov.shortName,
    signatoryPosition: initialCert.signatoryPosition || STAFF_DIRECTORY.nekrasov.position,
    signatoryCompany: initialCert.signatoryCompany || 'ООО «ДС-Инжиниринг»',
    hoursTotal: initialCert.hoursTotal || 72,
    validUntil: initialCert.validUntil || 'Бессрочно',
    traineeNameFontSize: initialCert.traineeNameFontSize || 26,
    bodyTextFontSize: initialCert.bodyTextFontSize || 14,
    bodyTextMarginTop: initialCert.bodyTextMarginTop !== undefined ? initialCert.bodyTextMarginTop : 7,
    footerAddressText: initialCert.footerAddressText || 'ООО «ДС-Инжиниринг», 443051, г. Самара, ул. Свободы, 198, 8 (846) 954-02-92, info@ds-enginering.ru, http://ds-enginering.ru',
    files: initialCert.files || []
  }));

  // Local synced companies directory
  const [localCompanies, setLocalCompanies] = useState<Array<{ id: string; name: string }>>(crmCompanies);
  useEffect(() => {
    setLocalCompanies(crmCompanies);
  }, [crmCompanies]);

  // Company Selector & Fast Creation State
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearchFilter, setCompanySearchFilter] = useState('');
  const [showQuickCompanyModal, setShowQuickCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyInn, setNewCompanyInn] = useState('');
  const [newCompanyCity, setNewCompanyCity] = useState('Самара');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState('Машиностроение и приборостроение');
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [editorToast, setEditorToast] = useState<string | null>(null);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setEditorToast(msg);
    setTimeout(() => setEditorToast(null), 3200);
  };

  // UI state
  const [activeTab, setActiveTab] = useState<'requisites' | 'program' | 'layout' | 'design' | 'files'>('requisites');
  const [assetPickerTarget, setAssetPickerTarget] = useState<'leftLogo' | 'rightLogo' | 'watermark' | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'formOnly' | 'previewOnly'>('split');
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(0.68);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Hidden File input refs for uploading logos, stamp, and watermark
  const fileInputRef = useRef<HTMLInputElement>(null);
  const leftLogoInputRef = useRef<HTMLInputElement>(null);
  const rightLogoInputRef = useRef<HTMLInputElement>(null);
  const dsLogoInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // ResizeObserver on preview container for zero-scroll fit
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
    };
  }, [viewMode, isOpen]);

  if (!isOpen) return null;

  // Real-time generated HTML for the certificate (hide embedded print button in preview)
  const previewHtml = generateCertificateHtml(cert, { hideFloatingActionBtn: true });

  // Exact A4 dimensions in px at standard 96 DPI: 297mm x 210mm
  const CERT_W = 1122.5;
  const CERT_H = 793.7;

  // Calculate auto-fit scale so the certificate sheet fits completely in the viewport without horizontal or vertical scrolling
  // Generous 48px padding and 0.985 safety coefficient mathematically guarantees zero scrollbars
  const padX = 48;
  const padY = 48;
  const availW = Math.max(100, (containerDimensions.width || 800) - padX);
  const availH = Math.max(100, (containerDimensions.height || 600) - padY);
  const rawFit = Math.min(availW / CERT_W, availH / CERT_H);
  const safeFitScale = Math.max(0.2, Math.min(1.2, Number((rawFit * 0.985).toFixed(3))));

  const effectiveScale = isAutoFit ? safeFitScale : zoomLevel;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(cert);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    printCertificateInWindow(cert);
  };

  const handleDownloadPdf = async () => {
    try {
      await downloadCertificatePdf(cert);
    } catch (err) {
      console.warn('Fallback triggered:', err);
    }
  };

  // Helper for single image file upload -> DataURL
  const handleImageUpload = (file: File | null, onLoaded: (dataUrl: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onLoaded(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle document file attachments
  const handleAttachFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file, index) => {
      const sizeInMB = file.size / (1024 * 1024);
      const formattedSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
      const reader = new FileReader();

      reader.onload = (evt) => {
        const doc: AttachedDocument = {
          id: `doc-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
          name: file.name,
          category: file.name.toLowerCase().endsWith('.pdf') ? 'Скан свидетельства (PDF)' : 'Доп. материалы',
          size: formattedSize,
          uploadedAt: new Date().toLocaleDateString('ru-RU'),
          uploadedBy: 'Инженерный отдел',
          fileUrl: evt.target?.result as string,
          fileType: file.name.split('.').pop()?.toLowerCase()
        };
        setCert(prev => ({
          ...prev,
          files: [...(prev.files || []), doc]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Course preset applicator
  const applyPresetCourse = (preset: typeof PRESET_COURSE_TOPICS[0]) => {
    const customerName = cert.customer || 'Заказчик';
    const parsedText = preset.defaultText.replace(/\{\{CUSTOMER\}\}/g, customerName);
    
    setCert(prev => ({
      ...prev,
      trainingTopic: preset.topic,
      trainingProgramText: parsedText,
      hoursTotal: preset.hours,
      leftLogo: (preset.leftLogo as any) || prev.leftLogo,
      rightLogo: (preset.rightLogo as any) || prev.rightLogo,
      watermarkType: (preset.watermark as any) || prev.watermarkType
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-[1560px] h-[96vh] rounded-lg shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Editor Toast */}
        {editorToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-lg animate-in slide-in-from-top-4 fade-in duration-300">
            {editorToast}
          </div>
        )}

        {/* Top Header & Action Bar */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Редактор свидетельств «ДС-Инжиниринг»
                </h3>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md border border-blue-200">
                  {cert.certificateNumber || 'СВ-2026/001'}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                  А4 Альбомный (297×210 мм)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Полная верстка бланка, выбор тем обучения, наложение печати на подпись, размеры шрифтов
              </p>
            </div>
          </div>

          {/* Mode Switcher and Main Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View layout mode */}
            <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'split' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Сплит</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('formOnly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'formOnly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Форма</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('previewOnly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'previewOnly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Бланк А4</span>
              </button>
            </div>

            {/* Print & PDF */}
            <button
              id="btn-cert-editor-print"
              type="button"
              onClick={handlePrint}
              className="px-4.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Печать свидетельства"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Печать</span>
            </button>

            <button
              id="btn-cert-editor-pdf"
              type="button"
              onClick={handleDownloadPdf}
              className="px-4.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Скачать PDF"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Save */}
            <button
              id="btn-cert-editor-save"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Сохранено!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
                </>
              )}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hidden File Inputs for Brand Logos and Stamp Selection */}
        <input
          type="file"
          ref={leftLogoInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleImageUpload(file || null, (dataUrl) => {
              setCert(prev => ({
                ...prev,
                leftLogo: 'custom',
                customLeftLogoUrl: dataUrl
              }));
            });
            if (e.target) e.target.value = '';
          }}
        />

        <input
          type="file"
          ref={rightLogoInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleImageUpload(file || null, (dataUrl) => {
              setCert(prev => ({
                ...prev,
                rightLogo: 'custom',
                customRightLogoUrl: dataUrl
              }));
            });
            if (e.target) e.target.value = '';
          }}
        />

        <input
          type="file"
          ref={dsLogoInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleImageUpload(file || null, (dataUrl) => {
              setCert(prev => ({
                ...prev,
                showDsLogoBottom: true,
                customDsLogoUrl: dataUrl
              }));
            });
            if (e.target) e.target.value = '';
          }}
        />

        <input
          type="file"
          ref={stampInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleImageUpload(file || null, (dataUrl) => {
              setCert(prev => ({
                ...prev,
                showStamp: true,
                customStampUrl: dataUrl
              }));
            });
            if (e.target) e.target.value = '';
          }}
        />

        <input
          type="file"
          ref={signatureInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleImageUpload(file || null, (dataUrl) => {
              setCert(prev => ({
                ...prev,
                showSignature: true,
                customSignatureUrl: dataUrl
              }));
            });
            if (e.target) e.target.value = '';
          }}
        />

        <input
          type="file"
          ref={watermarkInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleImageUpload(file || null, (dataUrl) => {
              setCert(prev => ({
                ...prev,
                watermarkType: 'custom',
                watermarkUrl: dataUrl
              }));
            });
            if (e.target) e.target.value = '';
          }}
        />

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL: Editing Controls */}
          {(viewMode === 'split' || viewMode === 'formOnly') && (
            <div className={`flex flex-col border-r border-slate-200 bg-white ${
              viewMode === 'split' ? 'w-full md:w-1/2 lg:w-5/12' : 'w-full max-w-4xl mx-auto'
            }`}>
              
              {/* Refined Tab Bar - fits cleanly without horizontal cutoffs */}
              <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50/90 p-1.5 gap-1 shrink-0 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('requisites')}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'requisites'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Реквизиты, обучающийся и подписант"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Реквизиты</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('program')}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'program'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Темы обучения, текст и выбор курса"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Текст и темы</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('layout')}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'layout'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Верстка, размеры шрифтов и смещение текста"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Верстка</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('design')}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'design'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Печать на подписи, логотипы и подложка"
                >
                  <Stamp className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Печать/Лого</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('files')}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'files'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Прикрепленные сканы и файлы"
                >
                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Файлы ({cert.files?.length || 0})</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
                
                {/* 1. REQUISITES TAB */}
                {activeTab === 'requisites' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    
                    {/* Notice about General Director signatory rule */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-900">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Правило подписи официальных документов:</span>
                        <span>
                          Свидетельства компании «ДС-Инжиниринг» подписываются <strong>исключительно Генеральным директором</strong> (Некрасов С.Ю.) с круглой печатью организации поверх подписи.
                        </span>
                      </div>
                    </div>

                    {/* Series and Date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Серия / Номер свидетельства
                        </label>
                        <input
                          type="text"
                          required
                          value={cert.certificateNumber}
                          onChange={(e) => setCert({ ...cert, certificateNumber: e.target.value })}
                          className="w-full px-4.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="СВ-2026/042"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Дата выдачи
                        </label>
                        <input
                          type="date"
                          required
                          value={cert.date ? (cert.date.includes('T') ? cert.date.split('T')[0] : (cert.date.match(/^\\d{2}\\.\\d{2}\\.\\d{4}$/) ? cert.date.split('.').reverse().join('-') : cert.date)) : ''}
                          onChange={(e) => setCert({ ...cert, date: e.target.value })}
                          className="w-full px-4.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Trainee full name + CRM selection */}
                    <div className="space-y-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-blue-600" />
                          Обучающийся специалист
                        </span>
                        {crmContacts.length > 0 && (
                          <select
                            onChange={(e) => {
                              const found = crmContacts.find(c => c.fullName === e.target.value);
                              if (found) {
                                setCert(prev => ({
                                  ...prev,
                                  traineeName: found.fullName,
                                  traineePosition: found.position || prev.traineePosition,
                                  customer: found.companyName || prev.customer
                                }));
                              }
                            }}
                            className="text-[11px] text-blue-600 bg-transparent border-0 underline hover:text-blue-800 cursor-pointer outline-none"
                          >
                            <option value="">Выбрать из CRM ({crmContacts.length})...</option>
                            {crmContacts.map(c => (
                              <option key={c.id} value={c.fullName}>{c.fullName} ({c.companyName || 'Контакт'})</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-500">
                          ФИО обучающегося (в дательном падеже, e.g. Захаровой Светлане Николаевне)
                        </label>
                        <input
                          type="text"
                          required
                          value={cert.traineeName}
                          onChange={(e) => setCert({ ...cert, traineeName: e.target.value })}
                          className="w-full px-4.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Захаровой Светлане Николаевне"
                        />
                      </div>
                    </div>

                    {/* Customer Organization */}
                    <div className="space-y-2 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Организация заказчика (Предприятие)
                        </span>
                      </div>

                      <div className="relative" ref={companyDropdownRef}>
                        <div
                          className="flex items-center w-full px-4.5 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400"
                          onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                        >
                          <span className="flex-1 text-xs font-semibold text-slate-900 truncate">
                            {cert.customer || 'Выберите компанию...'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>

                        {isCompanyDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-sm z-50 overflow-hidden flex flex-col">
                            <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                              <Search className="w-4 h-4 text-slate-400 shrink-0" />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Поиск по базе компаний..."
                                value={companySearchFilter}
                                onChange={(e) => setCompanySearchFilter(e.target.value)}
                                className="w-full text-xs outline-none bg-transparent"
                              />
                            </div>
                            
                            <div className="max-h-48 overflow-y-auto">
                              {localCompanies
                                .filter(c => c.name.toLowerCase().includes(companySearchFilter.toLowerCase()))
                                .map(c => (
                                  <div
                                    key={c.id}
                                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                    onClick={() => {
                                      setCert({ ...cert, customer: c.name });
                                      setIsCompanyDropdownOpen(false);
                                      setCompanySearchFilter('');
                                    }}
                                  >
                                    {c.name}
                                  </div>
                                ))}
                              {localCompanies.filter(c => c.name.toLowerCase().includes(companySearchFilter.toLowerCase())).length === 0 && (
                                <div className="px-4 py-4 text-xs text-slate-500 text-center">
                                  Компания не найдена
                                </div>
                              )}
                            </div>

                            <div className="p-2 border-t border-slate-100 bg-slate-50">
                              <button
                                type="button"
                                onClick={() => {
                                  setNewCompanyName(companySearchFilter);
                                  setShowQuickCompanyModal(true);
                                  setIsCompanyDropdownOpen(false);
                                }}
                                className="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Добавить новую компанию</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Signatory & Instructor Section */}
                    <div className="space-y-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Подписание документа и реестр сотрудников
                      </span>

                      {/* Signatory - Restricted strictly to General Director */}
                      <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            Подписант бланка:
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Только Генеральный директор
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[11px] text-slate-500 block">ФИО подписанта:</span>
                            <input
                              type="text"
                              value={cert.signatoryName || STAFF_DIRECTORY.nekrasov.shortName}
                              onChange={(e) => setCert({ ...cert, signatoryName: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Должность (из реестра):</span>
                            <input
                              type="text"
                              value={cert.signatoryPosition || STAFF_DIRECTORY.nekrasov.position}
                              onChange={(e) => setCert({ ...cert, signatoryPosition: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                            />
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500">
                          Организация: <strong>{cert.signatoryCompany || 'ООО «ДС-Инжиниринг»'}</strong>
                        </div>
                      </div>

                      {/* Training Instructor from Registry */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Инструктор курса (для карточки обучения в CRM)
                        </label>
                        <select
                          value={cert.instructor}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCert({ ...cert, instructor: val });
                          }}
                          className="w-full px-4.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                          {Object.entries(STAFF_DIRECTORY).map(([key, staff]) => (
                            <option key={key} value={staff.fullName}>
                              {staff.fullName} — {staff.position} ({staff.department})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Hours */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Объем программы обучения
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={cert.hoursTotal || 72}
                            onChange={(e) => setCert({ ...cert, hoursTotal: Number(e.target.value) })}
                            className="w-32 px-4.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <span className="text-xs text-slate-500 font-medium">академических часов</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. PROGRAM & TOPICS WYSIWYG TAB */}
                {activeTab === 'program' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    
                    {/* Compact Course Program Selector */}
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>Выбор готовой темы обучения:</span>
                        </div>
                        <span className="text-[11px] text-blue-700 font-semibold">1 клик для подстановки</span>
                      </div>

                      {/* Dropdown selector for all course presets */}
                      <select
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          if (!isNaN(idx) && PRESET_COURSE_TOPICS[idx]) {
                            applyPresetCourse(PRESET_COURSE_TOPICS[idx]);
                          }
                        }}
                        defaultValue=""
                        className="w-full px-4 py-2 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        <option value="" disabled>-- Выберите отраслевую программу обучения --</option>
                        {PRESET_COURSE_TOPICS.map((preset, idx) => (
                          <option key={idx} value={idx}>
                            {preset.title} ({preset.hours} ак. ч.)
                          </option>
                        ))}
                      </select>

                      {/* Quick chips for the most popular programs */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {PRESET_COURSE_TOPICS.slice(0, 4).map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => applyPresetCourse(preset)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-blue-100/70 border border-blue-200 text-blue-900 rounded-md transition-all cursor-pointer shadow-2xs truncate max-w-full text-left"
                            title={preset.title}
                          >
                            {preset.title.split('+')[0].trim()} ({preset.hours} ч.)
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Course Topic Name Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Тематика курса / Оборудование и ПО
                      </label>
                      <input
                        type="text"
                        required
                        value={cert.trainingTopic || ''}
                        onChange={(e) => setCert({ ...cert, trainingTopic: e.target.value })}
                        placeholder="Стационарная КИМ HEXAGON GLOBAL и ПО PolyWorks Metrology Probing++"
                        className="w-full px-4.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* Quick Font Size and Vertical Position bar */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5 text-blue-600" />
                          Размер шрифта основного текста
                        </span>
                        <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {cert.bodyTextFontSize || 14}px
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[12, 13, 14, 15, 16, 17, 18].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setCert({ ...cert, bodyTextFontSize: size })}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer border ${
                              (cert.bodyTextFontSize || 14) === size
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>

                      <div className="pt-1 border-t border-slate-200/80">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                          <span className="flex items-center gap-1.5">
                            <MoveVertical className="w-3.5 h-3.5 text-blue-600" />
                            Смещение текста вниз (отступ сверху)
                          </span>
                          <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {cert.bodyTextMarginTop !== undefined ? cert.bodyTextMarginTop : 7} мм
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[3, 5, 7, 10, 14, 18].map((mm) => (
                            <button
                              key={mm}
                              type="button"
                              onClick={() => setCert({ ...cert, bodyTextMarginTop: mm })}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer border ${
                                (cert.bodyTextMarginTop !== undefined ? cert.bodyTextMarginTop : 7) === mm
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {mm} мм {mm === 7 ? '(стандарт)' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* WYSIWYG Content Editor */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Основной текст свидетельства
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Форматирование текста, списки, акценты
                        </span>
                      </div>
                      
                      <CertificateRichTextEditor
                        value={cert.trainingProgramText || ''}
                        onChange={(html) => setCert({ ...cert, trainingProgramText: html })}
                      />
                    </div>
                  </div>
                )}

                {/* 3. FULL LAYOUT & TYPOGRAPHY SIZES TAB */}
                {activeTab === 'layout' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs text-slate-500">
                      <span className="font-bold text-slate-900 block">Точная верстка и размеры шрифтов</span>
                      <p>Регулируйте кегль шрифта ФИО обучающегося, основного текста и отступы для идеального баланса бланка.</p>
                    </div>

                    {/* Trainee Name Font Size */}
                    <div className="space-y-2 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>Размер шрифта ФИО обучающегося:</span>
                        <span className="font-mono text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {cert.traineeNameFontSize || 26}px
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="20"
                          max="36"
                          value={cert.traineeNameFontSize || 26}
                          onChange={(e) => setCert({ ...cert, traineeNameFontSize: Number(e.target.value) })}
                          className="flex-1 cursor-pointer"
                        />
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {[22, 24, 26, 28, 32].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setCert({ ...cert, traineeNameFontSize: size })}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border cursor-pointer ${
                              (cert.traineeNameFontSize || 26) === size
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {size}px {size === 26 ? '(по умолч.)' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Body Text Font Size */}
                    <div className="space-y-2 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>Размер шрифта основного текста:</span>
                        <span className="font-mono text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {cert.bodyTextFontSize || 14}px
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="11"
                          max="20"
                          value={cert.bodyTextFontSize || 14}
                          onChange={(e) => setCert({ ...cert, bodyTextFontSize: Number(e.target.value) })}
                          className="flex-1 cursor-pointer"
                        />
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {[12, 13, 14, 15, 16, 18].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setCert({ ...cert, bodyTextFontSize: size })}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border cursor-pointer ${
                              (cert.bodyTextFontSize || 14) === size
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {size}px {size === 14 ? '(рекомендуемый)' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Margin Top / Lower body text */}
                    <div className="space-y-2 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>Смещение основного текста вниз (отступ):</span>
                        <span className="font-mono text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {cert.bodyTextMarginTop !== undefined ? cert.bodyTextMarginTop : 7} мм
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="22"
                          value={cert.bodyTextMarginTop !== undefined ? cert.bodyTextMarginTop : 7}
                          onChange={(e) => setCert({ ...cert, bodyTextMarginTop: Number(e.target.value) })}
                          className="flex-1 cursor-pointer"
                        />
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {[3, 5, 7, 10, 14, 18].map((mm) => (
                          <button
                            key={mm}
                            type="button"
                            onClick={() => setCert({ ...cert, bodyTextMarginTop: mm })}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border cursor-pointer ${
                              (cert.bodyTextMarginTop !== undefined ? cert.bodyTextMarginTop : 7) === mm
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {mm} мм {mm === 7 ? '(по центру)' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Heading Text */}
                    <div className="space-y-2 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Главный заголовок бланка
                      </label>
                      <input
                        type="text"
                        value={cert.certificateTitle || 'СВИДЕТЕЛЬСТВО'}
                        onChange={(e) => setCert({ ...cert, certificateTitle: e.target.value })}
                        className="w-full px-4.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="СВИДЕТЕЛЬСТВО"
                      />
                      <div className="flex gap-1.5 flex-wrap">
                        {['СВИДЕТЕЛЬСТВО', 'СВИДЕТЕЛЬСТВО ОБ ОБУЧЕНИИ', 'УДОСТОВЕРЕНИЕ', 'СЕРТИФИКАТ'].map((title) => (
                          <button
                            key={title}
                            type="button"
                            onClick={() => setCert({ ...cert, certificateTitle: title })}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                          >
                            {title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtitle / "выдано" */}
                    <div className="space-y-2 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Подзаголовок / Формулировка перед ФИО
                      </label>
                      <input
                        type="text"
                        value={cert.certificateGivenToText || cert.headerSubtitle || 'выдано'}
                        onChange={(e) => setCert({ ...cert, certificateGivenToText: e.target.value })}
                        className="w-full px-4.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="выдано"
                      />
                      <div className="flex gap-1.5 flex-wrap">
                        {['выдано', 'настоящее свидетельство выдано', 'удостоверяет, что'].map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setCert({ ...cert, certificateGivenToText: sub })}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Company Footer Footnote */}
                    <div className="space-y-2 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Нижний колонтитул (Адрес, контакты и веб-сайт «ДС-Инжиниринг»)
                      </label>
                      <textarea
                        rows={2}
                        value={cert.footerAddressText || cert.footerNote || ''}
                        onChange={(e) => setCert({ ...cert, footerAddressText: e.target.value })}
                        className="w-full px-4.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="ООО «ДС-Инжиниринг», 443051, г. Самара, ул. Свободы, 198, 8 (846) 954-02-92, info@ds-enginering.ru, http://ds-enginering.ru"
                      />
                      <button
                        type="button"
                        onClick={() => setCert({
                          ...cert,
                          footerAddressText: 'ООО «ДС-Инжиниринг», 443051, г. Самара, ул. Свободы, 198, 8 (846) 954-02-92, info@ds-enginering.ru, http://ds-enginering.ru'
                        })}
                        className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Сбросить к официальному адресу</span>
                      </button>
                    </div>

                  </div>
                )}

                {/* 4. DESIGN, LOGOS, STAMP & WATERMARK TAB */}
                {activeTab === 'design' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    
                    {/* Official Stamp Placement Notice */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-900">
                      <Stamp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Положение круглой печати:</span>
                        <span>
                          Печать ООО «ДС-Инжиниринг» накладывается <strong>непосредственно поверх подписи Генерального директора</strong> с легким наклоном и эффектом смешивания синей пасты.
                        </span>
                      </div>
                    </div>

                    {/* Template Theme Grid */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Стиль бланка
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {CERTIFICATE_TEMPLATES_CATALOG.map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => setCert({
                              ...cert,
                              templateTheme: tpl.id as any,
                              customPrimaryColor: tpl.primaryColor
                            })}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              cert.templateTheme === tpl.id
                                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full shrink-0 border border-black/10"
                                style={{ background: tpl.primaryColor }}
                              />
                              <span className="text-xs font-bold text-slate-900">{tpl.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                              {tpl.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Left Header Logo */}
                    <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Партнерский логотип слева вверху
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setAssetPickerTarget('leftLogo')}
                            className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-300 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Выбрать из галереи"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Галерея</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => leftLogoInputRef.current?.click()}
                            className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Загрузить свой файл"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Файл</span>
                          </button>
                        </div>
                      </div>

                      <select
                        value={cert.leftLogo || 'hexagon'}
                        onChange={(e) => setCert({ ...cert, leftLogo: e.target.value as any })}
                        className="w-full px-4.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        <option value="hexagon">Hexagon Manufacturing Intelligence</option>
                        <option value="ds_engineering">ООО «ДС-Инжиниринг»</option>
                        <option value="shining3d">Shining 3D FreeScan</option>
                        <option value="leica">Leica Geosystems</option>
                        <option value="pmt">PMT Precision Measuring Technology</option>
                        <option value="topsolid">TopSolid CAD/CAM</option>
                        <option value="3dsystems">3D Systems Geomagic</option>
                        <option value="custom">Пользовательский файл (загружен)</option>
                        <option value="none">Без логотипа слева</option>
                      </select>

                      {cert.customLeftLogoUrl && cert.leftLogo === 'custom' && (
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2">
                            <img src={cert.customLeftLogoUrl} alt="Custom left logo" className="h-8 max-w-[120px] object-contain border border-slate-200 p-0.5 rounded" />
                            <span className="text-xs text-slate-700 font-semibold">Файл логотипа активен</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCert({ ...cert, leftLogo: 'hexagon', customLeftLogoUrl: undefined })}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Удалить файл"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Header Logo */}
                    <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Партнерский логотип справа вверху
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setAssetPickerTarget('rightLogo')}
                            className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-300 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Выбрать из галереи"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Галерея</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => rightLogoInputRef.current?.click()}
                            className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Загрузить свой файл"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Файл</span>
                          </button>
                        </div>
                      </div>

                      <select
                        value={cert.rightLogo || 'polyworks'}
                        onChange={(e) => setCert({ ...cert, rightLogo: e.target.value as any })}
                        className="w-full px-4.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        <option value="polyworks">PolyWorks (InnovMetric Software Inc.)</option>
                        <option value="geomagic">3D Systems Geomagic Design X</option>
                        <option value="topsolid">TopSolid 7</option>
                        <option value="arshin">ФГИС «АРШИН» (Росстандарт)</option>
                        <option value="custom">Пользовательский файл (загружен)</option>
                        <option value="none">Без логотипа справа</option>
                      </select>

                      {cert.customRightLogoUrl && cert.rightLogo === 'custom' && (
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2">
                            <img src={cert.customRightLogoUrl} alt="Custom right logo" className="h-8 max-w-[120px] object-contain border border-slate-200 p-0.5 rounded" />
                            <span className="text-xs text-slate-700 font-semibold">Файл логотипа активен</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCert({ ...cert, rightLogo: 'polyworks', customRightLogoUrl: undefined })}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Удалить файл"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Central Equipment Watermark */}
                    <div className="space-y-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Подложка оборудования (водяной знак по центру)
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setAssetPickerTarget('watermark')}
                            className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-300 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Выбрать из галереи"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Галерея</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => watermarkInputRef.current?.click()}
                            className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Загрузить чертеж"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Файл</span>
                          </button>
                        </div>
                      </div>

                      <select
                        value={cert.watermarkType || 'hexagon_global_cmm'}
                        onChange={(e) => setCert({ ...cert, watermarkType: e.target.value as any })}
                        className="w-full px-4.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        <option value="hexagon_global_cmm">Стационарная КИМ HEXAGON GLOBAL (как в оригинале)</option>
                        <option value="hexagon_arm">Измерительная рука Hexagon Absolute Arm</option>
                        <option value="shining_freescan">3D-сканер Shining 3D FreeScan</option>
                        <option value="leica_tracker">Лазерный трекер Leica Absolute Tracker</option>
                        <option value="topsolid_cnc">5-осевой ЧПУ-станок TopSolid</option>
                        <option value="custom">Пользовательский файл (загружен)</option>
                        <option value="none">Без подложки</option>
                      </select>

                      {/* Watermark opacity */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">Прозрачность подложки:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {cert.watermarkOpacity !== undefined ? cert.watermarkOpacity : 20}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          step="5"
                          value={cert.watermarkOpacity !== undefined ? cert.watermarkOpacity : 20}
                          onChange={(e) => setCert({ ...cert, watermarkOpacity: Number(e.target.value) })}
                          className="w-full cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* DS Engineering Logo in Footer */}
                    <div className="space-y-2 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cert.showDsLogoBottom !== false}
                            onChange={(e) => setCert({ ...cert, showDsLogoBottom: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Логотип «ДС-Инжиниринг» внизу слева
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => dsLogoInputRef.current?.click()}
                          className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <UploadCloud className="w-3 h-3" />
                          <span>Загрузить другой файл</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                        <img 
                          src={cert.customDsLogoUrl || '/images/emblem.svg'} 
                          alt="ДС-Инжиниринг" 
                          className="w-12 h-12 object-contain"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-slate-900">Фирменный знак «ДС-Инжиниринг»</div>
                          <div className="text-slate-500 text-[11px]">
                            {cert.customDsLogoUrl ? 'Пользовательский файл' : 'Официальный герб с циркулем и шестерней'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company Stamp & Facsimile Signature */}
                    <div className="space-y-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Печать на подписи и факсимиле
                      </span>

                      {/* Company Stamp */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cert.showStamp !== false}
                              onChange={(e) => setCert({ ...cert, showStamp: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Stamp className="w-4 h-4 text-blue-600" />
                              Круглая печать ООО «ДС-Инжиниринг» (поверх подписи)
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => stampInputRef.current?.click()}
                            className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <UploadCloud className="w-3 h-3" />
                            <span>Файл оттиска</span>
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {cert.customStampUrl ? 'Загружен индивидуальный файл печати' : 'Официальный синий оттиск: Самара • ОГРН 1156313012984 • Для свидетельств № 1'}
                        </div>
                      </div>

                      {/* Signature Facsimile */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cert.showSignature !== false}
                              onChange={(e) => setCert({ ...cert, showSignature: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <UserCheck className="w-4 h-4 text-indigo-600" />
                              Факсимиле подписи Генерального директора
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => signatureInputRef.current?.click()}
                            className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <UploadCloud className="w-3 h-3" />
                            <span>Файл подписи</span>
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {cert.customSignatureUrl ? 'Загружен индивидуальный файл подписи' : 'Факсимиле подписи Некрасова С.Ю. (синяя паста)'}
                        </div>
                      </div>

                      {/* Note about QR code being completely removed */}
                      <div className="p-2.5 bg-slate-100 rounded-lg text-[11px] text-slate-500">
                        ✓ QR-код на свидетельстве отключен в соответствии с регламентом компании.
                      </div>
                    </div>

                  </div>
                )}

                {/* 5. ATTACHED SCANS & FILES TAB */}
                {activeTab === 'files' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        handleAttachFiles(e.target.files);
                        if (e.target) e.target.value = '';
                      }}
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Прикрепленные сканы и документы ({cert.files?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить файл</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(!cert.files || cert.files.length === 0) ? (
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center space-y-2 bg-slate-50/50">
                          <Paperclip className="w-8 h-8 text-slate-400 mx-auto" />
                          <p className="text-xs font-bold text-slate-700">Нет прикрепленных файлов</p>
                          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                            Вы можете прикрепить отсканированное свидетельство с «живой» подписью и печатью, протокол или экзаменационный лист.
                          </p>
                        </div>
                      ) : (
                        cert.files.map((file) => (
                          <div 
                            key={file.id}
                            className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                                <span className="text-[11px] text-slate-500">{file.size} • {file.uploadedAt}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {onViewDocument && (
                                <button
                                  type="button"
                                  onClick={() => onViewDocument(file, cert)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer"
                                  title="Просмотр"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setCert({
                                    ...cert,
                                    files: cert.files?.filter(f => f.id !== file.id) || []
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg cursor-pointer"
                                title="Удалить"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* RIGHT PANEL: Live Interactive A4 Paper Preview */}
          {(viewMode === 'split' || viewMode === 'previewOnly') && (
            <div className={`flex-1 bg-slate-900 overflow-hidden flex flex-col relative ${
              viewMode === 'previewOnly' ? 'w-full' : ''
            }`}>
              
              {/* Zoom & Canvas Toolbar */}
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-300 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold flex items-center gap-1.5 text-white">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    Бланк А4
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400 text-[11px]">297 × 210 мм</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Auto-fit button - activated by default to eliminate all scrolling */}
                  <button
                    type="button"
                    onClick={() => setIsAutoFit(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isAutoFit
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
                    }`}
                    title="Вписать бланк в размер экрана без скролла"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Вписать ({Math.round(effectiveScale * 100)}%)</span>
                  </button>

                  <div className="w-[1px] h-3.5 bg-slate-800 mx-1" />

                  {/* Manual Zoom In / Out */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoFit(false);
                      setZoomLevel(prev => Math.max(0.3, prev - 0.05));
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
                    title="Уменьшить"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-slate-200 text-xs min-w-[38px] text-center">
                    {Math.round(effectiveScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoFit(false);
                      setZoomLevel(prev => Math.min(1.5, prev + 0.05));
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
                    title="Увеличить"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  
                  <div className="w-[1px] h-3.5 bg-slate-800 mx-1" />

                  {/* Zoom presets */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoFit(false);
                      setZoomLevel(0.55);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                      !isAutoFit && Math.abs(zoomLevel - 0.55) < 0.01 ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    55%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoFit(false);
                      setZoomLevel(0.75);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                      !isAutoFit && Math.abs(zoomLevel - 0.75) < 0.01 ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoFit(false);
                      setZoomLevel(1.0);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                      !isAutoFit && Math.abs(zoomLevel - 1.0) < 0.01 ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    100%
                  </button>
                </div>
              </div>

              {/* Zero-Scroll Fitted Canvas Stage */}
              <div 
                ref={previewContainerRef}
                className={`flex-1 ${isAutoFit ? 'overflow-hidden' : 'overflow-auto'} p-3 flex items-center justify-center bg-slate-950 relative`}
              >
                <div
                  style={{
                    width: `${CERT_W * effectiveScale}px`,
                    height: `${CERT_H * effectiveScale}px`,
                    position: 'relative'
                  }}
                  className="shadow-sm rounded-xs bg-white overflow-hidden shrink-0 transition-[width,height] duration-75 select-none"
                >
                  <div
                    style={{
                      width: `${CERT_W}px`,
                      height: `${CERT_H}px`,
                      transform: `scale(${effectiveScale})`,
                      transformOrigin: 'top left'
                    }}
                  >
                    <iframe
                      srcDoc={previewHtml}
                      title="Live Certificate Preview"
                      className="w-[1122.5px] h-[793.7px] border-0 bg-white block"
                    />
                  </div>
                </div>
              </div>

              {/* Live Info ribbon */}
              <div className="px-4 py-2 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Бланк обновляется мгновенно в реальном времени
                </span>
                <span className="text-slate-400 font-semibold">ООО «ДС-Инжиниринг» • Самара</span>
              </div>

            </div>
          )}

        </div>

        {/* Quick Create Company Modal */}
        {showQuickCompanyModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-sm w-full max-w-md overflow-hidden border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900">Новая компания</h3>
                </div>
                <button
                  onClick={() => setShowQuickCompanyModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-500 hover:bg-slate-200 rounded cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Название предприятия <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="ООО «Новая Компания»"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ИНН <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newCompanyInn}
                    onChange={(e) => setNewCompanyInn(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="7700000000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Город</label>
                  <input
                    type="text"
                    value={newCompanyCity}
                    onChange={(e) => setNewCompanyCity(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Москва"
                  />
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickCompanyModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  disabled={!newCompanyName.trim() || !newCompanyInn.trim() || isCreatingCompany}
                  onClick={async () => {
                    setIsCreatingCompany(true);
                    try {
                      // Attempt to save to API
                      const res = await apiService.saveCrmCompany({
                        name: newCompanyName,
                        inn: newCompanyInn,
                        city: newCompanyCity,
                        industry: newCompanyIndustry,
                        contacts: [],
                        deals: []
                      });
                      
                      const createdCompany = res.data;
                      
                      // Also update local registry
                      const newComp = { id: createdCompany.id || String(Date.now()), name: createdCompany.name };
                      
                      setLocalCompanies(prev => [newComp, ...prev]);
                      setCert(prev => ({ ...prev, customer: newComp.name, companyId: newComp.id }));
                      
                      if (onCompanyCreated) {
                        onCompanyCreated(newComp);
                      }
                      
                      showToast(`Компания ${newComp.name} успешно создана!`);
                      setShowQuickCompanyModal(false);
                      setNewCompanyInn('');
                    } catch (error) {
                      console.error("Failed to create company via API", error);
                      
                      // Fallback to local creation for UI purposes if backend fails
                      const fallbackComp = { id: `loc_${Date.now()}`, name: newCompanyName };
                      setLocalCompanies(prev => [fallbackComp, ...prev]);
                      setCert(prev => ({ ...prev, customer: fallbackComp.name, companyId: fallbackComp.id }));
                      if (onCompanyCreated) {
                        onCompanyCreated(fallbackComp);
                      }
                      
                      showToast(`Офлайн: Компания ${fallbackComp.name} добавлена!`);
                      setShowQuickCompanyModal(false);
                      setNewCompanyInn('');
                    } finally {
                      setIsCreatingCompany(false);
                    }
                  }}
                  className="px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isCreatingCompany ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Сохранение...
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Сохранить и выбрать
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      {assetPickerTarget && (
        <AssetPickerModal
          onClose={() => setAssetPickerTarget(null)}
          onSelect={(url) => {
            if (assetPickerTarget === 'leftLogo') {
              setCert(prev => ({ ...prev, leftLogo: 'custom', customLeftLogoUrl: url }));
            } else if (assetPickerTarget === 'rightLogo') {
              setCert(prev => ({ ...prev, rightLogo: 'custom', customRightLogoUrl: url }));
            } else if (assetPickerTarget === 'watermark') {
              setCert(prev => ({ ...prev, watermarkUrl: url }));
            }
            setAssetPickerTarget(null);
          }}
        />
      )}
    </div>
  );
};
