import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Standard Hardcoded Corporate VAT Rate for ООО «ДС-Инжиниринг»
 */
export const HARDCODED_DEFAULT_VAT_RATE = 22;

export interface VatCalculationResult {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalWithVat: number;
  vatLabel: string;
  totalLabel: string;
  vatNotice: string;
}

/**
 * Verifies and executes standard 22% VAT calculation for quotation tables & specifications
 */
export function calculateTableVat22(
  subtotal: number,
  vatMode: 'standard' | 'no_vat' | 'export_zero' | 'custom' = 'standard',
  customRate?: number
): VatCalculationResult {
  const effectiveRate = vatMode === 'standard' 
    ? HARDCODED_DEFAULT_VAT_RATE 
    : vatMode === 'custom' 
      ? (customRate !== undefined ? customRate : HARDCODED_DEFAULT_VAT_RATE)
      : 0;

  if (vatMode === 'export_zero') {
    return {
      subtotal,
      vatRate: 0,
      vatAmount: 0,
      totalWithVat: subtotal,
      vatLabel: 'НДС 0% (Экспорт / ЕАЭС, ст. 164 НК РФ):',
      totalLabel: 'ИТОГО к оплате (НДС 0% Экспорт):',
      vatNotice: 'Поставка на экспорт облагается ставкой НДС 0% в соответствии со ст. 164 Налогового кодекса РФ / Протоколом ЕАЭС.'
    };
  }

  if (vatMode === 'no_vat') {
    return {
      subtotal,
      vatRate: 0,
      vatAmount: 0,
      totalWithVat: subtotal,
      vatLabel: 'НДС не облагается (УСН / ст. 346.11 НК РФ):',
      totalLabel: 'ИТОГО к оплате (Без НДС):',
      vatNotice: 'НДС не облагается в связи с применением упрощенной системы налогообложения (УСН) согласно ст. 346.11 Налогового кодекса РФ.'
    };
  }

  // Standard 22% (or verified custom rate)
  const vatAmount = Math.round(subtotal * (effectiveRate / 100));
  const totalWithVat = subtotal + vatAmount;

  return {
    subtotal,
    vatRate: effectiveRate,
    vatAmount,
    totalWithVat,
    vatLabel: `В том числе НДС ${effectiveRate}%:`,
    totalLabel: `ИТОГО с учетом НДС ${effectiveRate}%:`,
    vatNotice: ''
  };
}

export interface UnifiedA4ExportOptions {
  container?: HTMLElement | null;
  filename?: string;
  onBeforeAction?: () => void;
  onAfterAction?: () => void;
  onProgress?: (message: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Resolves all target A4 page elements with class '.a4-page-render'
 */
export function getA4PageElements(container?: HTMLElement | null): HTMLElement[] {
  if (container) {
    if (container.classList && container.classList.contains('a4-page-render')) {
      return [container];
    }
    const children = Array.from(container.querySelectorAll<HTMLElement>('.a4-page-render'));
    if (children.length > 0) {
      return children;
    }
  }

  // Search in full document
  const docPages = Array.from(document.querySelectorAll<HTMLElement>('.a4-page-render'));
  if (docPages.length > 0) {
    return docPages;
  }

  // Ultimate fallback to sheet identifiers
  const fallbackPages = Array.from(
    document.querySelectorAll<HTMLElement>('.proposal-a4-sheet, #printable-proposal')
  );
  return fallbackPages;
}

/**
 * Triggers standard browser print dialog targeting .a4-page-render
 */
export async function triggerA4Print(options: UnifiedA4ExportOptions = {}): Promise<void> {
  const { container, onBeforeAction, onAfterAction, onProgress, onError } = options;

  if (onBeforeAction) {
    try { onBeforeAction(); } catch (e) { console.warn(e); }
  }

  if (onProgress) {
    onProgress('Подготовка бланка А4 к печати...');
  }

  try {
    document.documentElement.classList.add('a4-print-active');
    document.body.classList.add('a4-print-active');

    // Allow browser layout engine to apply print CSS and render fonts
    await new Promise((resolve) => setTimeout(resolve, 200));

    window.focus();
    window.print();
  } catch (err: any) {
    console.error('[UnifiedA4ExportHandler] Print execution error:', err);
    if (onError) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  } finally {
    setTimeout(() => {
      document.documentElement.classList.remove('a4-print-active');
      document.body.classList.remove('a4-print-active');
      if (onAfterAction) {
        try { onAfterAction(); } catch (e) { console.warn(e); }
      }
    }, 800);
  }
}

/**
 * Unified Event Handler for Print Dialog & Multi-page A4 PDF Generation
 * Strictly targets all elements with selector '.a4-page-render'
 */
export async function handleUnifiedA4ExportAction(
  action: 'print' | 'pdf',
  options: UnifiedA4ExportOptions = {}
): Promise<void> {
  const {
    container,
    filename = 'Документ_ДС_Инжиниринг_А4.pdf',
    onBeforeAction,
    onAfterAction,
    onProgress,
    onError
  } = options;

  if (action === 'print') {
    return triggerA4Print(options);
  }

  if (onBeforeAction) {
    try { onBeforeAction(); } catch (e) { console.warn(e); }
  }

  try {
    if (onProgress) onProgress('Формирование PDF высокого разрешения (А4)...');
    
    // Allow DOM repaint
    await new Promise((r) => setTimeout(r, 250));

    const pageElements = getA4PageElements(container);

    if (!pageElements || pageElements.length === 0) {
      throw new Error('Страницы бланка (.a4-page-render) не найдены для экспорта в PDF');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    pdf.save(filename);

    if (onProgress) {
      onProgress(`Файл «${filename}» успешно сформирован и сохранен!`);
    }

    if (onAfterAction) {
      try { onAfterAction(); } catch (e) { console.warn(e); }
    }
  } catch (err: any) {
    console.error(`[UnifiedA4ExportHandler] Error during ${action}:`, err);
    if (onError) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
    if (onAfterAction) {
      try { onAfterAction(); } catch (e) { console.warn(e); }
    }
    throw err;
  }
}
