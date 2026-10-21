import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  FileCode,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  downloadProposalPdf, 
  generateProposalHtml,
  formatMoneyRu,
  ProposalPrintData 
} from '../../utils/printProposal';
import { 
  ProposalBlock, 
  SpecificationItem, 
  DocumentStyling,
  DocumentType,
  OrganizationProfile,
  DEFAULT_ORGANIZATION_PROFILE,
  DEFAULT_DOCUMENT_STYLING
} from '../../types/proposalEditor';
import { documentToMarkdown } from '../../utils/proposalMarkdownSync';

interface ProposalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType?: DocumentType;
  proposalNumber: string;
  proposalDate: string;
  validUntilDate?: string;
  proposalTitle: string;
  customerCompany: string;
  customerInn?: string;
  customerKpp?: string;
  ceoPost: string;
  ceoName: string;
  greeting?: string;
  renderedPages: ProposalBlock[][];
  rawItems: SpecificationItem[];
  subtotalAmount: number;
  vatAmount: number;
  grandTotalAmount: number;
  vatRate: number;
  isExportZero: boolean;
  isNoVat: boolean;
  deliveryDays: string;
  warrantyMonths: string;
  managerName: string;
  managerPost: string;
  managerPhone: string;
  managerEmail: string;
  includeStamp: boolean;
  documentStyling?: DocumentStyling;
  organization?: OrganizationProfile;
  markdownContent?: string;
  onOpenMarkdown?: () => void;
}

export const ProposalPreviewModal: React.FC<ProposalPreviewModalProps> = ({
  isOpen,
  onClose,
  documentType = 'main',
  proposalNumber,
  proposalDate,
  validUntilDate,
  proposalTitle,
  customerCompany,
  customerInn,
  customerKpp,
  ceoPost,
  ceoName,
  greeting,
  renderedPages,
  rawItems,
  vatRate,
  isExportZero,
  isNoVat,
  deliveryDays,
  warrantyMonths,
  managerName,
  managerPost,
  managerPhone,
  managerEmail,
  includeStamp,
  documentStyling = DEFAULT_DOCUMENT_STYLING,
  organization = DEFAULT_ORGANIZATION_PROFILE
}) => {
  if (!isOpen) return null;

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(0.85);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showMarkdownDrawer, setShowMarkdownDrawer] = useState<boolean>(false);

  const totalPages = Math.max(1, renderedPages.length);

  const printData: ProposalPrintData = {
    documentType,
    number: proposalNumber,
    date: proposalDate,
    validUntilDate,
    title: proposalTitle,
    customerCompany,
    customerInn,
    customerKpp,
    ceoPost,
    ceoName,
    greeting,
    blocks: renderedPages.flat(),
    items: rawItems,
    deliveryDays,
    warrantyMonths,
    assigneeName: managerName,
    assigneePost: managerPost,
    assigneePhone: managerPhone,
    assigneeEmail: managerEmail,
    includeStamp,
    vatRate,
    vatMode: isExportZero ? 'export_zero' : isNoVat ? 'no_vat' : 'standard',
    organization,
    documentStyling
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadProposalPdf(printData);
    } finally {
      setIsDownloading(false);
    }
  };

  const fullMarkdown = documentToMarkdown({
    documentType,
    outgoingNumber: proposalNumber,
    date: proposalDate,
    validUntilDate,
    customerCompany,
    customerInn,
    customerKpp,
    ceoName,
    ceoPost,
    greeting: greeting || '',
    title: proposalTitle,
    procurementType: 'commercial',
    vatMode: isExportZero ? 'export_zero' : isNoVat ? 'no_vat' : 'standard',
    vatRate,
    currency: 'RUB',
    terms: {
      deliveryPeriod: deliveryDays,
      warrantyTerms: warrantyMonths,
      validUntil: validUntilDate
    },
    deliveryDays,
    warrantyMonths,
    managerName,
    managerPost,
    managerPhone,
    managerEmail,
    includeStamp,
    blocks: renderedPages.flat(),
    documentStyling,
    organization
  });

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(fullMarkdown);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-xs ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'} overflow-hidden`}>
      <div className={`relative w-full ${isFullscreen ? 'h-full max-h-screen rounded-none' : 'max-w-[1500px] h-[95vh] rounded-2xl'} bg-slate-900 text-white shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150`}>
        
        {/* Top Header Controls */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {documentType === 'technical_task' ? 'Техническое задание' : documentType === 'specification' ? 'Спецификация поставок' : 'Коммерческое предложение'} № {proposalNumber}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                  {totalPages} стр. А4
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-md">
                {customerCompany || 'Заказчик'} — {proposalTitle}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMarkdownDrawer(!showMarkdownDrawer)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                showMarkdownDrawer ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Markdown</span>
            </button>

            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700 cursor-pointer flex items-center gap-1.5"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Скопировано!' : 'Копировать MD'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Формирование PDF...' : 'Скачать PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-700 ml-1"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace: Preview Sheet + Markdown Drawer */}
        <div className="flex-1 overflow-hidden flex bg-slate-950 relative min-h-0">
          
          {/* Main Visual Preview Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* View Toolbar */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Лист:</span>
                {renderedPages.map((_, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setActivePageIndex(pIdx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activePageIndex === pIdx 
                        ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400' 
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <span>{pIdx + 1}</span>
                    <span className="text-[10px] opacity-75">{pIdx === 0 ? '(Титул)' : `(Стр. ${pIdx + 1})`}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setScale(prev => Math.max(0.4, Number((prev - 0.08).toFixed(2))))}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                  title="Уменьшить"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-slate-300 w-11 text-center">{Math.round(scale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setScale(prev => Math.min(1.4, Number((prev + 0.08).toFixed(2))))}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                  title="Увеличить"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setScale(0.85)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded border border-slate-700 cursor-pointer ml-1"
                >
                  Fit A4
                </button>
              </div>
            </div>

            {/* A4 Sheet Container */}
            <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-start bg-slate-900/90">
              <div 
                dangerouslySetInnerHTML={{ __html: generateProposalHtml(printData) }}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center'
                }}
                className="transition-transform duration-100"
              />
            </div>
          </div>

          {/* Markdown Slide-over Drawer */}
          {showMarkdownDrawer && (
            <div className="w-96 border-l border-slate-800 bg-slate-900 flex flex-col p-4 animate-in slide-in-from-right duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span>Текст Markdown</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  {isCopied ? 'Скопировано!' : 'Копировать всё'}
                </button>
              </div>
              <textarea
                readOnly
                value={fullMarkdown}
                className="flex-1 w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 leading-relaxed outline-none resize-none overflow-y-auto"
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
