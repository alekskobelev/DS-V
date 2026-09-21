import React, { useRef, useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Award,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { TrainingCertificate } from '../../types';
import { 
  generateCertificateHtml, 
  printCertificateInWindow, 
  downloadCertificatePdf, 
  downloadCertificateHtml, 
  downloadCertificatePng 
} from '../../utils/printCertificate';

interface CertificatePrintModalProps {
  certificate: TrainingCertificate;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificatePrintModal: React.FC<CertificatePrintModalProps> = ({
  certificate,
  isOpen,
  onClose
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'info'>('preview');

  if (!isOpen) return null;

  const handlePrint = () => {
    printCertificateInWindow(certificate);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Pass the actual mounted preview container for 100% pixel-perfect rendering
      const certElement = previewRef.current?.querySelector('#certificate-print-area') as HTMLElement || previewRef.current;
      await downloadCertificatePdf(certificate, certElement);
    } catch (err) {
      console.warn('Fallback to HTML download due to canvas restrictions:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    downloadCertificateHtml(certificate);
  };

  const handleDownloadPng = async () => {
    const certElement = previewRef.current?.querySelector('#certificate-print-area') as HTMLElement || previewRef.current;
    await downloadCertificatePng(certificate, certElement);
  };

  const htmlContent = generateCertificateHtml(certificate, { hideFloatingActionBtn: true });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[92vh] rounded-lg shadow-sm flex flex-col overflow-hidden text-white">
        
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Свидетельство № {certificate.certificateNumber}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {certificate.templateTheme === 'classic_engineering' ? 'Инженерный строгий' :
                   certificate.templateTheme === 'polyworks_gold' ? 'PolyWorks / Премиум' :
                   certificate.templateTheme === 'cmm_technical' ? 'Координатные измерения' : 'Индустриальный'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {certificate.traineeName} • {certificate.customer}
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1 mr-2 text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.1))}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Уменьшить"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-slate-300 font-bold min-w-[45px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Увеличить"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(0.85)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Сбросить масштаб"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print button */}
            <button
              id="btn-cert-modal-print"
              type="button"
              onClick={handlePrint}
              className="px-4.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
              title="Открыть стандартное окно печати браузера"
            >
              <Printer className="w-4 h-4" />
              <span>Печать</span>
            </button>

            {/* Download PDF button */}
            <button
              id="btn-cert-modal-pdf"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
              title="Скачать документ в формате PDF (300 DPI)"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-blue-400" />
              )}
              <span>{isGeneratingPdf ? 'Сборка PDF...' : 'PDF'}</span>
            </button>

            {/* Download HTML button */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="hidden sm:flex px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg border border-slate-700 transition-all items-center gap-1.5 cursor-pointer"
              title="Скачать автономный HTML-файл для офлайн просмотра"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>HTML</span>
            </button>

            {/* Download PNG button */}
            <button
              type="button"
              onClick={handleDownloadPng}
              className="hidden sm:flex px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg border border-slate-700 transition-all items-center gap-1.5 cursor-pointer"
              title="Скачать картинку высокого разрешения (PNG)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>PNG</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950/90 relative">
          <div 
            ref={previewRef}
            className="transition-transform duration-150 origin-center shadow-sm rounded-sm overflow-hidden"
            style={{
              transform: `scale(${zoomLevel})`,
              width: '297mm',
              minHeight: '210mm',
              margin: 'auto'
            }}
          >
            {/* Embedded rendered certificate using srcDoc for isolation */}
            <iframe
              srcDoc={htmlContent}
              title={`Certificate-${certificate.certificateNumber}`}
              className="w-[297mm] h-[210mm] border-0 bg-white"
              style={{ display: 'block' }}
            />
          </div>
        </div>

        {/* Bottom Bar Info */}
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Официальное свидетельство ООО «ДС-Инжиниринг»
            </span>
            <span>•</span>
            <span>Формат: А4 Альбомный (297 × 210 мм)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Печать: {certificate.showStamp !== false ? 'Включена' : 'Отключена'}</span>
            <span>Подпись Генерального директора: {certificate.showSignature !== false ? 'Включена' : 'Отключена'}</span>
            <span>Подложка КИМ: {certificate.watermarkType && certificate.watermarkType !== 'none' ? 'Включена' : 'Отключена'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
