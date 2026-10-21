import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  ProposalBlock, 
  SpecificationItem, 
  ProposalImageItem, 
  DocumentType,
  OrganizationProfile,
  DocumentStyling,
  CommercialProposalTerms,
  DEFAULT_ORGANIZATION_PROFILE,
  DEFAULT_DOCUMENT_STYLING
} from '../types/proposalEditor';
import { numberToWordsRu } from './numberToWordsRu';
import { formatMoneyRu } from './proposalMarkdownSync';
import { parseAndDeclineFio } from './russianDeclension';

export { formatMoneyRu };

/**
 * Robust helper to parse Russian full name into proper greeting by Name & Patronymic in Nominative case
 */
export function parseRussianLeaderGreeting(fullName?: string, post?: string): { 
  greeting: string; 
  nameAndPatronymic: string; 
  isFemale: boolean; 
  cleanFullName: string;
} {
  if (!fullName || !fullName.trim()) {
    return { 
      greeting: 'Уважаемые партнеры!', 
      nameAndPatronymic: '', 
      isFemale: false, 
      cleanFullName: ''
    };
  }

  // Strip brackets or titles like "(Главный инженер)"
  const clean = fullName
    .replace(/\(.*?\)/g, '')
    .replace(/\b(ИП|ООО|АО|ПАО|ЗАО|Ген(еральный)?\.?\s*дир(ектор)?\.?)\b/gi, '')
    .trim();

  const parts = clean.split(/\s+/).filter(Boolean);
  
  let firstName = '';
  let patronymic = '';

  if (parts.length >= 3) {
    if (/(ич|ович|евич|на|овна|евна|ична|инична)[уаеы]?$/i.test(parts[2])) {
      firstName = parts[1];
      patronymic = parts[2];
    } else if (/(ич|ович|евич|на|овна|евна|ична|инична)[уаеы]?$/i.test(parts[1])) {
      firstName = parts[0];
      patronymic = parts[1];
    } else {
      firstName = parts[1];
      patronymic = parts[2];
    }
  } else if (parts.length === 2) {
    if (/(ич|ович|евич|на|овна|евна|ична|инична)[уаеы]?$/i.test(parts[1])) {
      firstName = parts[0];
      patronymic = parts[1];
    } else {
      firstName = parts[1];
    }
  } else if (parts.length === 1) {
    firstName = parts[0];
  }

  // Convert patronymic from dative/genitive (Михайловичу -> Михайлович, Владимировне -> Владимировна)
  if (patronymic) {
    if (/(ович|евич|ич)[уа]$/i.test(patronymic)) {
      patronymic = patronymic.replace(/[уа]$/i, '');
    } else if (/(овн|евн|ин|ичн)[еы]$/i.test(patronymic)) {
      patronymic = patronymic.replace(/[еы]$/i, 'а');
    }
  }

  // Convert first name from dative/genitive (Алексею -> Алексей, Сергею -> Сергей, Елене -> Елена)
  if (firstName) {
    if (/(ею|ея)$/i.test(firstName)) {
      firstName = firstName.replace(/(ею|ея)$/i, 'ей');
    } else if (/(аю|ая)$/i.test(firstName)) {
      firstName = firstName.replace(/(аю|ая)$/i, 'ай');
    } else if (/(ию|ия)$/i.test(firstName)) {
      firstName = firstName.replace(/(ию|ия)$/i, 'ий');
    } else if (/(ому|ома)$/i.test(firstName)) {
      firstName = firstName.replace(/(ому|ома)$/i, 'ом');
    } else if (/(орю|оря)$/i.test(firstName)) {
      firstName = firstName.replace(/(орю|оря)$/i, 'орь');
    } else if (/(ру|ра)$/i.test(firstName) && /петр/i.test(firstName)) {
      firstName = 'Петр';
    } else if (/(льву|льва)$/i.test(firstName)) {
      firstName = 'Лев';
    } else if (/(павлу|павла)$/i.test(firstName)) {
      firstName = 'Павел';
    } else if (/[уа]$/i.test(firstName) && !/(ович|евич|ич|илья|никита|кузьма|лука|фома)$/i.test(firstName) && firstName.length > 3) {
      if (/[бвгджзклмнпрстфхцчшщ][уа]$/i.test(firstName)) {
        firstName = firstName.replace(/[уа]$/i, '');
      }
    } else if (/[еы]$/i.test(firstName) && firstName.length > 3) {
      firstName = firstName.replace(/[еы]$/i, 'а');
    }
  }

  const nameAndPatronymic = [firstName, patronymic].filter(Boolean).join(' ');

  if (!nameAndPatronymic) {
    return { 
      greeting: 'Уважаемые господа!', 
      nameAndPatronymic: '', 
      isFemale: false, 
      cleanFullName: clean 
    };
  }

  const isFemale = /(на|овна|евна|ична|инична)$/i.test(patronymic) || (/(а|я)$/i.test(firstName) && !/(ич|ович|евич)$/i.test(patronymic));
  const salut = isFemale ? 'Уважаемая' : 'Уважаемый';

  return {
    greeting: `${salut} ${nameAndPatronymic}!`,
    nameAndPatronymic,
    isFemale,
    cleanFullName: clean
  };
}

export interface ProposalPrintItem {
  id?: string;
  name: string;
  category?: string;
  sku?: string;
  quantity: number;
  unit?: string;
  price: number; // Price per unit without VAT
  discountPercent?: number;
}

export interface ProposalPrintData {
  documentType?: DocumentType;
  number?: string;
  date?: string;
  validUntilDate?: string;
  appendixNumber?: string;
  customerCompany?: string;
  clientCompany?: string;
  customerInn?: string;
  customerKpp?: string;
  customerAddress?: string;
  customerName?: string;
  clientName?: string;
  ceoName?: string;
  ceoPost?: string;
  greeting?: string;
  title?: string;
  content?: string;
  items?: ProposalPrintItem[] | SpecificationItem[];
  blocks?: ProposalBlock[];
  budget?: number;
  amount?: number;
  procurementType?: 'commercial' | '44fz' | '223fz';
  deliveryDays?: number | string;
  warrantyMonths?: number | string;
  paymentTerms?: string;
  assigneeName?: string;
  assigneePost?: string;
  assigneePhone?: string;
  assigneeEmail?: string;
  includeStamp?: boolean;
  executorSignerName?: string;
  executorSignerPost?: string;
  executorSignerFormat?: 'initials_surname' | 'surname_initials' | 'full';
  includeCustomerSignature?: boolean;
  customerSignerName?: string;
  customerSignerPost?: string;
  customerSignerFormat?: 'initials_surname' | 'surname_initials' | 'full';
  vatRate?: number;
  vatMode?: 'standard' | 'export_zero' | 'no_vat' | 'custom';
  currency?: 'RUB' | 'USD' | 'EUR' | 'CNY' | string;
  terms?: CommercialProposalTerms;
  organization?: OrganizationProfile;
  documentStyling?: DocumentStyling;
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  paragraphSpacing?: string;
  pageMargins?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

/**
 * Splits proposal blocks into logical A4 pages with table chunking and repeated headers
 */
export function paginateProposalBlocks(
  blocks: ProposalBlock[], 
  specItems: SpecificationItem[]
): ProposalBlock[][] {
  if (!blocks || blocks.length === 0) return [[]];

  const pages: ProposalBlock[][] = [[]];

  blocks.forEach((block) => {
    if (block.type === 'page_break') {
      pages.push([]);
      return;
    }

    // Check if specification table needs chunking
    if (block.type === 'specification') {
      const items = block.items && block.items.length > 0 ? block.items : specItems;
      if (items.length > 5 && pages[pages.length - 1].length > 1) {
        // Start spec on new page if previous page already has heavy intro
        pages.push([]);
      }
      
      if (items.length > 7) {
        // Chunk items across pages with repeated table headers
        const chunkSize = 7;
        for (let i = 0; i < items.length; i += chunkSize) {
          if (i > 0) pages.push([]);
          const chunk = items.slice(i, i + chunkSize);
          pages[pages.length - 1].push({
            ...block,
            id: `${block.id}-part-${i}`,
            title: i === 0 ? block.title : `${block.title || 'Спецификация'} (продолжение)`,
            items: chunk
          });
        }
        return;
      }
    }

    pages[pages.length - 1].push(block);
  });

  return pages.filter(p => p.length > 0);
}

/**
 * Unified HTML Layout Generator for Preview & PDF Export
 */
export const generateProposalHtml = (proposalData: ProposalPrintData): string => {
  const docType: DocumentType = proposalData.documentType || 'main';
  const org = proposalData.organization || DEFAULT_ORGANIZATION_PROFILE;
  const styling = proposalData.documentStyling || DEFAULT_DOCUMENT_STYLING;

  const proposalNumber = proposalData.number || `ТКП-${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}-001`;
  const dateStr = proposalData.date || new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  const validUntilStr = proposalData.validUntilDate || proposalData.terms?.validUntil || '';

  const companyTitle = proposalData.customerCompany || proposalData.clientCompany || 'Предприятие-Заказчик';
  const rawLeader = proposalData.ceoName || proposalData.customerName || proposalData.clientName || '';
  const parsedGreeting = parseRussianLeaderGreeting(rawLeader);
  const effectiveGreeting = proposalData.greeting || parsedGreeting.greeting;
  const effectivePost = proposalData.ceoPost || 'Руководителю предприятия';

  const isNoVat = proposalData.vatMode === 'no_vat';
  const isExportZero = proposalData.vatMode === 'export_zero' || proposalData.vatRate === 0;
  const vatRate = isNoVat ? 0 : isExportZero ? 0 : (proposalData.vatRate !== undefined ? proposalData.vatRate : 22);
  const currency = proposalData.currency || 'RUB';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₽';

  const rawItems: SpecificationItem[] = (proposalData.items && proposalData.items.length > 0)
    ? (proposalData.items as SpecificationItem[])
    : [
        {
          id: '1',
          name: proposalData.title || 'Комплект высокоточного измерительного оборудования и инжиниринговые услуги',
          category: 'Оборудование / Услуги',
          quantity: 1,
          unit: 'компл.',
          price: Math.round((proposalData.budget || proposalData.amount || 250000) / (1 + vatRate / 100))
        }
      ];

  const subtotalWithoutVat = rawItems.reduce((acc, it) => {
    const qty = Number(it.quantity) || 1;
    const price = Number(it.price) || 0;
    const disc = Number(it.discountPercent) || 0;
    return acc + (qty * price * (1 - disc / 100));
  }, 0);

  const vatAmount = (isNoVat || isExportZero) ? 0 : Math.round(subtotalWithoutVat * (vatRate / 100));
  const totalWithVat = subtotalWithoutVat + vatAmount;
  const totalInWords = numberToWordsRu(totalWithVat);

  const blocksToRender = proposalData.blocks && proposalData.blocks.length > 0
    ? proposalData.blocks
    : [];

  const pages = paginateProposalBlocks(blocksToRender, rawItems);
  const totalPagesCount = Math.max(1, pages.length);

  const managerName = proposalData.assigneeName || org.directorName || 'Некрасов С.Ю.';
  const managerPost = proposalData.assigneePost || 'Ведущий инженер проектов «ДС-Инжиниринг»';
  const managerPhone = proposalData.assigneePhone || org.phone || '+7 (846) 954-02-92';
  const managerEmail = proposalData.assigneeEmail || org.email || 'info@ds-enginering.ru';
  const includeStamp = proposalData.includeStamp !== false;

  // Typography resolution
  const fontFamMap: Record<string, string> = {
    'pt-sans': "'PT Sans', Arial, sans-serif",
    'arial': "Arial, Helvetica, sans-serif",
    'times': "'Times New Roman', Times, serif",
    'calibri': "Calibri, Arial, sans-serif",
    'roboto': "'Roboto', Arial, sans-serif",
    'montserrat': "'Montserrat', sans-serif",
    'mono': "'Courier New', Courier, monospace",
    'serif': "Georgia, serif"
  };

  const effectiveFontFamily = fontFamMap[styling.fontFamily] || styling.customFontFamily || "'PT Sans', Arial, sans-serif";
  const baseFontSize = styling.customFontSize || styling.fontSize || proposalData.fontSize || '9pt';
  const baseLineHeight = styling.customLineHeight || styling.lineHeight || proposalData.lineHeight || '1.15';
  const paragraphSpacing = styling.customParagraphSpacing || styling.paragraphSpacing || '4pt';
  const baseTextIndent = styling.textIndent || '0mm';

  const mTop = styling.pageMargins?.top || proposalData.pageMargins?.top || '15mm';
  const mBottom = styling.pageMargins?.bottom || proposalData.pageMargins?.bottom || '15mm';
  const mLeft = styling.pageMargins?.left || proposalData.pageMargins?.left || '20mm';
  const mRight = styling.pageMargins?.right || proposalData.pageMargins?.right || '15mm';

  const paginationMode = styling.paginationMode || 'bottom_numbers';

  return `
    <div id="proposal-multi-page-container" style="background: #cbd5e1; padding: 0; display: flex; flex-direction: column; align-items: center; gap: 20px; font-family: ${effectiveFontFamily}; font-size: ${baseFontSize}; line-height: ${baseLineHeight};">
      ${pages.map((pageBlocks, pageIdx) => `
        <div class="proposal-a4-sheet a4-page-render" style="
          width: 210mm;
          height: 297mm;
          min-height: 297mm;
          max-height: 297mm;
          background: #ffffff;
          box-sizing: border-box;
          padding: ${mTop} ${mRight} ${mBottom} ${mLeft};
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          color: #000000;
          page-break-after: always;
        ">
          <!-- Page Top Section -->
          <div>
            ${pageIdx === 0 ? `
              <!-- Canonical 3-line Organization Header (System Frame) -->
              <div style="border-bottom: 1.5pt solid #0f2744; padding-bottom: 6pt; margin-bottom: 10pt; font-size: 8pt; line-height: 1.25; color: #1e293b;">
                <div style="font-weight: bold; font-size: 11pt; color: #0f2744; margin-bottom: 2pt; letter-spacing: 0.3px;">
                  ${org.name || 'ООО «ДС-Инжиниринг»'}
                </div>
                <div style="color: #334155; margin-bottom: 1.5pt;">
                  Адрес: ${org.address || '443051, г. Самара, ул. Свободы, 198'}  ${org.phoneCityLabel || 'тел/факс в Самаре'} ${org.phone || '(846) 954-02-92'}  e-mail: ${org.email || 'info@ds-enginering.ru'}
                </div>
                <div style="color: #475569; font-size: 7.5pt;">
                  ИНН ${org.inn || '6312025587'} / КПП ${org.kpp || '631201001'}  ОГРН ${org.ogrn || '1026300777986'}
                </div>
              </div>

              <!-- Ref and Recipient Row -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12pt; font-size: 9pt;">
                <div style="flex: 1;">
                  <div style="font-weight: 500;">Исх. № ${proposalNumber.replace(/^(исх\.?\s*№?\s*)+/gi, '')}</div>
                  <div style="font-weight: 500; margin-top: 2pt;">от ${dateStr} г.</div>
                  ${validUntilStr ? `<div style="font-size: 8pt; color: #64748b; margin-top: 2pt;">Действительно до: ${validUntilStr} г.</div>` : ''}
                </div>

                <div style="width: 75mm; text-align: right;">
                  ${effectivePost ? `<div style="font-size: 8.5pt; color: #334155; margin-bottom: 2pt;">${effectivePost}</div>` : ''}
                  <div style="font-weight: bold; font-size: 9.5pt; color: #0f172a;">${companyTitle}</div>
                  ${rawLeader ? `<div style="font-weight: 500; font-size: 9pt; color: #0f172a; margin-top: 2pt;">${rawLeader}</div>` : ''}
                </div>
              </div>

              <!-- Document Title -->
              ${docType === 'technical_task' ? `
                <div style="text-align: center; margin: 12pt 0 10pt 0;">
                  <div style="font-size: 10pt; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
                    ПРИЛОЖЕНИЕ № ${proposalData.appendixNumber || '1'}
                  </div>
                  <div style="font-size: 12pt; font-weight: bold; color: #0f2744; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2pt;">
                    ТЕХНИЧЕСКОЕ ЗАДАНИЕ
                  </div>
                  <div style="font-size: 8.5pt; color: #475569; margin-top: 2pt;">
                    к технико-коммерческому предложению № ${proposalNumber} от ${dateStr} г.
                  </div>
                  <div style="font-size: 9.5pt; font-weight: bold; color: #0f2744; margin-top: 4pt;">
                    ${proposalData.title || 'Проведение метрологических измерений и контроль геометрии'}
                  </div>
                </div>
              ` : docType === 'specification' ? `
                <div style="text-align: center; margin: 12pt 0 10pt 0;">
                  <div style="font-size: 12pt; font-weight: bold; color: #0f2744; text-transform: uppercase; letter-spacing: 0.5px;">
                    СПЕЦИФИКАЦИЯ ПОСТАВОК
                  </div>
                  <div style="font-size: 8.5pt; color: #475569; margin-top: 2pt;">
                    к коммерческому предложению № ${proposalNumber} от ${dateStr} г.
                  </div>
                  <div style="font-size: 9.5pt; font-weight: bold; color: #0f2744; margin-top: 4pt;">
                    на ${proposalData.title || 'поставку оборудования и инжиниринговых услуг'}
                  </div>
                </div>
              ` : `
                <div style="text-align: center; margin: 12pt 0 8pt 0;">
                  <div style="font-size: 12pt; font-weight: bold; color: #0f2744; text-transform: uppercase; letter-spacing: 0.5px;">
                    ТЕХНИКО-КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ
                  </div>
                  <div style="font-size: 9pt; color: #334155; margin-top: 2pt;">
                    на ${proposalData.title || 'поставку измерительного оборудования и комплекс метрологических услуг'}
                  </div>
                </div>

                ${effectiveGreeting ? `
                  <div style="margin: 8pt 0 3pt 0; font-weight: bold; font-size: 9.5pt; color: #0f2744; text-align: center;">
                    ${effectiveGreeting}
                  </div>
                  <div style="font-size: 9pt; color: #0f172a; text-align: center; margin-bottom: 8pt;">
                    Добрый день, в ответ на ваш запрос направляем технико-коммерческое предложение.
                  </div>
                ` : ''}
              `}
            ` : `
              <!-- Running Header on Page 2+ -->
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 0.5pt solid #cbd5e1; padding-bottom: 4pt; margin-bottom: 12pt; font-size: 8pt; color: #64748b;">
                <span>${org.name || 'ООО «ДС-Инжиниринг»'} • ${docType === 'technical_task' ? 'Техническое задание' : docType === 'specification' ? 'Спецификация' : 'ТКП'} № ${proposalNumber}</span>
                ${paginationMode === 'top_x_of_y' ? `<span style="font-weight: bold;">Страница ${pageIdx + 1} из ${totalPagesCount}</span>` : `<span>Заказчик: ${companyTitle}</span>`}
              </div>
            `}

            <!-- Page Blocks Render -->
            <div style="display: flex; flex-direction: column; gap: 8pt;">
              ${pageBlocks.map((b) => {
                const fmt = b.formatting || {};
                const bFontFamily = fontFamMap[fmt.fontFamily || ''] || fmt.fontFamily || effectiveFontFamily;
                const bFontSize = fmt.fontSize || baseFontSize;
                const bLineHeight = fmt.lineHeight || baseLineHeight;
                const bTextAlign = fmt.textAlign || (docType === 'technical_task' ? 'justify' : 'justify');
                const bTextIndent = fmt.textIndent || baseTextIndent;

                if (b.type === 'text' || b.type === 'tt_section') {
                  const isCanonicalTT = b.type === 'tt_section' || /^[0-9]\.\s+[А-ЯA-Z\s]+/.test(b.title || '');
                  return `
                    <div style="margin-bottom: ${paragraphSpacing};">
                      ${b.title ? `
                        <div style="
                          font-weight: bold;
                          font-size: ${isCanonicalTT ? '10pt' : '9.5pt'};
                          color: #0f2744;
                          text-transform: ${isCanonicalTT ? 'uppercase' : 'none'};
                          margin-bottom: 4pt;
                          letter-spacing: 0.2px;
                        ">${b.title}</div>
                      ` : ''}
                      <div style="
                        font-family: ${bFontFamily};
                        font-size: ${bFontSize};
                        line-height: ${bLineHeight};
                        text-align: ${bTextAlign};
                        text-indent: ${bTextIndent};
                        font-weight: ${fmt.fontWeight || 'normal'};
                        font-style: ${fmt.fontStyle || 'normal'};
                        text-decoration: ${fmt.textDecoration || 'none'};
                        color: ${fmt.textColor || '#000000'};
                        white-space: pre-line;
                      ">${b.content || ''}</div>
                    </div>
                  `;
                }

                if (b.type === 'image' && (b.imageItem || (b.images && b.images[0]))) {
                  const img = b.imageItem || b.images![0];
                  const align = img.align || 'center';
                  const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
                  return `
                    <div style="display: flex; flex-direction: column; align-items: ${justify}; margin: 6pt 0;">
                      <img src="${img.url}" alt="${img.caption || 'Иллюстрация'}" style="width: ${img.widthPercent || 60}%; max-height: 55mm; object-fit: contain; ${img.hasBorder ? 'border: 0.5pt solid #94a3b8; padding: 2px;' : ''}" />
                      ${img.caption ? `<div style="font-size: 7.5pt; color: #64748b; font-style: italic; margin-top: 3pt; text-align: center;">${img.caption}</div>` : ''}
                    </div>
                  `;
                }

                if (b.type === 'specification') {
                  const items = b.items || rawItems;
                  const isSpecOnlyDoc = docType === 'specification';

                  return `
                    <div style="margin-bottom: 6pt;">
                      ${b.title ? `<div style="font-weight: bold; font-size: 9.5pt; color: #0f2744; margin-bottom: 4pt;">${b.title}</div>` : ''}
                      
                      <table style="width: 100%; border-collapse: collapse; font-size: ${styling.tableFontSize || '8.5pt'}; line-height: 1.1; border: 0.5pt solid #334155;">
                        <thead>
                          <tr style="background: #f1f5f9; color: #0f2744; font-weight: bold; border-bottom: 0.5pt solid #334155;">
                            <th style="padding: 4pt 6pt; text-align: center; border-right: 0.5pt solid #334155; width: 8mm;">№ п/п</th>
                            <th style="padding: 4pt 6pt; text-align: left; border-right: 0.5pt solid #334155;">Наименование оборудования / услуг</th>
                            <th style="padding: 4pt 6pt; text-align: center; border-right: 0.5pt solid #334155; width: 14mm;">Кол-во</th>
                            <th style="padding: 4pt 6pt; text-align: center; border-right: 0.5pt solid #334155; width: 10mm;">Ед.</th>
                            <th style="padding: 4pt 6pt; text-align: right; border-right: 0.5pt solid #334155; width: 26mm;">Цена без НДС</th>
                            <th style="padding: 4pt 6pt; text-align: right; width: 28mm;">Сумма без НДС</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${items.map((it, idx) => {
                            const qty = Number(it.quantity) || 1;
                            const pr = Number(it.price) || 0;
                            const disc = Number(it.discountPercent) || 0;
                            const rowSum = qty * pr * (1 - disc / 100);
                            return `
                              <tr style="border-bottom: 0.5pt solid #cbd5e1;">
                                <td style="padding: 3.5pt 5pt; text-align: center; border-right: 0.5pt solid #cbd5e1;">${idx + 1}</td>
                                <td style="padding: 3.5pt 5pt; border-right: 0.5pt solid #cbd5e1; font-weight: 500;">${it.name}</td>
                                <td style="padding: 3.5pt 5pt; text-align: center; border-right: 0.5pt solid #cbd5e1; font-weight: bold;">${qty}</td>
                                <td style="padding: 3.5pt 5pt; text-align: center; border-right: 0.5pt solid #cbd5e1;">${it.unit || 'шт.'}</td>
                                <td style="padding: 3.5pt 5pt; text-align: right; border-right: 0.5pt solid #cbd5e1; font-family: monospace;">${formatMoneyRu(pr)}</td>
                                <td style="padding: 3.5pt 5pt; text-align: right; font-weight: bold; font-family: monospace;">${formatMoneyRu(rowSum)}</td>
                              </tr>
                            `;
                          }).join('')}

                          <!-- Attached Integrated Totals Rows -->
                          ${docType !== 'technical_task' ? `
                            <tr style="border-top: 1pt solid #0f2744; font-weight: 500;">
                              <td colspan="4" style="border-right: 0.5pt solid #cbd5e1; text-align: right; padding: 3pt 6pt;">
                                ${currency === 'USD' ? 'Всего без НДС, Доллар США:' : `Итого, без НДС (${vatRate}%):`}
                              </td>
                              <td colspan="2" style="text-align: right; padding: 3pt 6pt; font-family: monospace; font-weight: bold;">
                                ${formatMoneyRu(subtotalWithoutVat)} ${currencySymbol}
                              </td>
                            </tr>
                            <tr style="font-weight: 500;">
                              <td colspan="4" style="border-right: 0.5pt solid #cbd5e1; text-align: right; padding: 3pt 6pt;">
                                ${isExportZero ? 'НДС (0% Экспорт / ЕАЭС):' : isNoVat ? 'Без НДС (ст. 346.11 НК РФ):' : `НДС (${vatRate}%):`}
                              </td>
                              <td colspan="2" style="text-align: right; padding: 3pt 6pt; font-family: monospace;">
                                ${formatMoneyRu(vatAmount)} ${currencySymbol}
                              </td>
                            </tr>
                            <tr style="background: #f8fafc; font-weight: bold; border-top: 0.5pt solid #0f2744;">
                              <td colspan="4" style="border-right: 0.5pt solid #334155; text-align: right; padding: 4pt 6pt; font-size: 9.5pt; color: #0f2744;">
                                ${currency === 'USD' ? `Итого с НДС ${vatRate}%, Доллар США:` : `Всего с НДС (${vatRate}%):`}
                              </td>
                              <td colspan="2" style="text-align: right; padding: 4pt 6pt; font-size: 9.5pt; font-family: monospace; color: #0f2744;">
                                ${formatMoneyRu(totalWithVat)} ${currencySymbol}
                              </td>
                            </tr>
                          ` : ''}
                        </tbody>
                      </table>

                      ${docType !== 'technical_task' ? `
                        <div style="font-size: 7.5pt; font-style: italic; color: #475569; margin-top: 3pt; text-align: right;">
                          Сумма прописью: ${totalInWords}
                        </div>
                      ` : ''}
                    </div>
                  `;
                }

                if (b.type === 'signatures') {
                  const terms = proposalData.terms;
                  const showTermsInSig = docType !== 'technical_task' && (terms?.deliveryTerms || terms?.paymentTerms || proposalData.deliveryDays);

                  const directorRaw = b.executorSignerName || proposalData.executorSignerName || org.directorName || 'Некрасов Сергей Юрьевич';
                  const directorFio = parseAndDeclineFio(directorRaw);
                  const execFormat = b.executorSignerFormat || proposalData.executorSignerFormat || 'initials_surname';
                  let directorDisplay = directorFio.initialsSurname || 'С.Ю. Некрасов';
                  if (execFormat === 'surname_initials') directorDisplay = directorFio.surnameInitials;
                  if (execFormat === 'full') directorDisplay = directorFio.nominative;

                  const isDualSig = Boolean(b.includeCustomerSignature ?? proposalData.includeCustomerSignature);

                  const customerRaw = b.customerSignerName || proposalData.customerSignerName || proposalData.ceoName || proposalData.customerName || '';
                  const customerFio = customerRaw ? parseAndDeclineFio(customerRaw) : null;
                  const custFormat = b.customerSignerFormat || proposalData.customerSignerFormat || 'initials_surname';
                  let customerDisplay = customerFio ? customerFio.initialsSurname : '____________________';
                  if (customerFio && custFormat === 'surname_initials') customerDisplay = customerFio.surnameInitials;
                  if (customerFio && custFormat === 'full') customerDisplay = customerFio.nominative;
                  const customerPost = b.customerSignerPost || proposalData.customerSignerPost || proposalData.ceoPost || 'Руководитель предприятия';

                  return `
                    <div style="margin-top: 8pt;">
                      ${showTermsInSig ? `
                        <div style="border-top: 0.5pt solid #cbd5e1; padding-top: 6pt; margin-bottom: 8pt; font-size: 8.5pt; line-height: 1.3;">
                          <div style="margin-bottom: 2pt;"><strong>Условия поставки:</strong> ${terms?.deliveryTerms || proposalData.deliveryDays || '5–15 рабочих дней со склада в г. Самара.'}</div>
                          <div style="margin-bottom: 2pt;"><strong>Конечная цена:</strong> ${terms?.finalPriceNotes || 'Включает стоимость оборудования, предпродажную подготовку, поверку и упаковку.'}</div>
                          <div style="margin-bottom: 2pt;"><strong>Условия оплаты:</strong> ${terms?.paymentTerms || '50% аванс, 50% по факту готовности к отгрузке.'}</div>
                          <div style="margin-bottom: 2pt;"><strong>Сроки поставки:</strong> ${terms?.deliveryPeriod || proposalData.deliveryDays || '5–15 рабочих дней.'}</div>
                          <div style="margin-bottom: 2pt;"><strong>Гарантийное сервисное обслуживание КИМ и техническая поддержка:</strong> ${terms?.warrantyTerms || proposalData.warrantyMonths || '24 месяца расширенной заводской гарантии.'}</div>
                          ${validUntilStr ? `<div style="margin-bottom: 2pt;"><strong>Данное коммерческое предложение действительно до:</strong> ${validUntilStr} г.</div>` : ''}
                          ${currency === 'USD' ? `<div style="color: #475569;"><strong>Оплата:</strong> Оплата производится по курсу Доллара США, установленному ЦБ РФ на дату оплаты.</div>` : ''}
                        </div>
                      ` : ''}

                      ${isDualSig ? `
                        <!-- Dual Signature Block (Исполнитель и Заказчик) -->
                        <div style="border-top: 1pt solid #0f2744; padding-top: 10pt; display: grid; grid-template-columns: 1fr 1fr; gap: 20mm; font-size: 8.5pt; line-height: 1.35; position: relative;">
                          <!-- Executor Column -->
                          <div>
                            <div style="font-weight: bold; color: #0f2744; margin-bottom: 3pt; text-transform: uppercase; font-size: 8pt;">ОТ ИСПОЛНИТЕЛЯ:</div>
                            <div style="font-weight: 600; color: #0f172a;">${org.name || 'ООО «ДС-Инжиниринг»'}</div>
                            <div style="color: #334155; margin-bottom: 12pt;">${b.executorSignerPost || proposalData.executorSignerPost || 'Генеральный директор'}</div>
                            
                            <div style="display: flex; align-items: flex-end; gap: 4mm; position: relative; min-height: 28mm;">
                              ${includeStamp ? `
                                <div style="position: absolute; left: -2mm; top: -6mm; width: 34mm; height: 34mm; z-index: 5;">
                                  <svg viewBox="0 0 200 200" width="100%" height="100%">
                                    <circle cx="100" cy="100" r="92" fill="none" stroke="#1d4ed8" stroke-width="2.5" stroke-dasharray="8 4" opacity="0.9" />
                                    <circle cx="100" cy="100" r="84" fill="none" stroke="#1d4ed8" stroke-width="1.4" opacity="0.9" />
                                    <circle cx="100" cy="100" r="60" fill="none" stroke="#1d4ed8" stroke-width="1.2" opacity="0.85" />
                                    <path id="stampCircleDual-${pageIdx}" fill="none" d="M 100, 100 m -72, 0 a 72,72 0 1,1 144,0 a 72,72 0 1,1 -144,0" />
                                    <text fill="#1d4ed8" font-size="8" font-weight="bold" letter-spacing="1">
                                      <textPath href="#stampCircleDual-${pageIdx}" startOffset="0%">
                                        * Российская Федерация * г. Самара * Общество с ограниченной ответственностью
                                      </textPath>
                                    </text>
                                    <g text-anchor="middle" fill="#1d4ed8">
                                      <rect x="70" y="82" width="60" height="24" rx="4" fill="#1d4ed8" opacity="0.95" />
                                      <text x="100" y="98" font-size="12" font-weight="900" fill="#ffffff" letter-spacing="1">DSE</text>
                                      <text x="100" y="118" font-size="6.5" font-weight="bold">«ДС-Инжиниринг»</text>
                                      <text x="100" y="128" font-size="5.5">г. Самара</text>
                                    </g>
                                  </svg>
                                  <div style="position: absolute; left: 2mm; top: 6mm; width: 28mm; height: 14mm; pointer-events: none; z-index: 6;">
                                    <svg viewBox="0 0 160 70" width="100%" height="100%">
                                      <path d="M 10,48 Q 28,12 44,36 T 68,26 Q 88,6 108,36 Q 124,52 148,18" fill="none" stroke="#1e293b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
                                      <path d="M 38,32 L 132,58" fill="none" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" opacity="0.85" />
                                    </svg>
                                  </div>
                                </div>
                              ` : ''}
                              <div style="border-bottom: 0.5pt solid #0f172a; width: 35mm; margin-bottom: 2pt;"></div>
                              <div style="font-weight: 500; font-size: 8.5pt; color: #0f172a; white-space: nowrap; padding-bottom: 1pt;">
                                / ${directorDisplay} /
                              </div>
                            </div>
                            <div style="font-size: 7.5pt; color: #64748b; margin-top: 2pt;">М.П.</div>
                          </div>

                          <!-- Customer Column -->
                          <div>
                            <div style="font-weight: bold; color: #0f2744; margin-bottom: 3pt; text-transform: uppercase; font-size: 8pt;">ОТ ЗАКАЗЧИКА:</div>
                            <div style="font-weight: 600; color: #0f172a;">${proposalData.customerCompany || proposalData.clientCompany || 'Заказчик'}</div>
                            <div style="color: #334155; margin-bottom: 12pt;">${customerPost}</div>
                            
                            <div style="display: flex; align-items: flex-end; gap: 4mm; position: relative; min-height: 28mm;">
                              <div style="border-bottom: 0.5pt solid #0f172a; width: 35mm; margin-bottom: 2pt;"></div>
                              <div style="font-weight: 500; font-size: 8.5pt; color: #0f172a; white-space: nowrap; padding-bottom: 1pt;">
                                / ${customerDisplay} /
                              </div>
                            </div>
                            <div style="font-size: 7.5pt; color: #64748b; margin-top: 2pt;">М.П.</div>
                          </div>
                        </div>
                      ` : `
                        <!-- Single Executor Signature Block with Centered Seal -->
                        <div style="border-top: 1pt solid #0f2744; padding-top: 10pt; display: flex; justify-content: space-between; align-items: flex-end; font-size: 9pt; position: relative; min-height: 38mm;">
                          <div style="line-height: 1.35; color: #0f172a; min-width: 50mm; z-index: 10;">
                            <div>С уважением,</div>
                            <div style="font-weight: 500;">${(b.executorSignerPost || proposalData.executorSignerPost || 'Генеральный директор').replace(/\s*ООО\s*[«"']?ДС-Инжиниринг[»"']?/gi, '').trim() || 'Генеральный директор'}</div>
                            <div style="font-weight: bold; color: #0f2744;">${org.name || 'ООО «ДС-Инжиниринг»'}</div>
                            ${proposalData.assigneeName && proposalData.assigneeName !== org.directorName ? `
                              <div style="margin-top: 10pt; font-size: 8.5pt; color: #334155;">
                                <div style="font-weight: bold;">Исполнитель:</div>
                                <div>${proposalData.assigneeName} ${proposalData.assigneePhone ? `&nbsp;&nbsp;${proposalData.assigneePhone}` : ''}</div>
                              </div>
                            ` : ''}
                          </div>

                          ${includeStamp ? `
                            <!-- Centered Seal & Signature (Always in horizontal center) -->
                            <div style="position: absolute; left: 50%; transform: translateX(-50%); bottom: 0; width: 38mm; height: 38mm; z-index: 5;">
                              <!-- Authentic Circular Corporate Stamp -->
                              <svg viewBox="0 0 200 200" width="100%" height="100%">
                                <circle cx="100" cy="100" r="92" fill="none" stroke="#1d4ed8" stroke-width="2.5" stroke-dasharray="8 4" opacity="0.9" />
                                <circle cx="100" cy="100" r="84" fill="none" stroke="#1d4ed8" stroke-width="1.4" opacity="0.9" />
                                <circle cx="100" cy="100" r="60" fill="none" stroke="#1d4ed8" stroke-width="1.2" opacity="0.85" />
                                <path id="stampCircleOuter-${pageIdx}" fill="none" d="M 100, 100 m -72, 0 a 72,72 0 1,1 144,0 a 72,72 0 1,1 -144,0" />
                                <text fill="#1d4ed8" font-size="8" font-weight="bold" letter-spacing="1">
                                  <textPath href="#stampCircleOuter-${pageIdx}" startOffset="0%">
                                    * Российская Федерация * г. Самара * Общество с ограниченной ответственностью
                                  </textPath>
                                </text>
                                <g text-anchor="middle" fill="#1d4ed8">
                                  <rect x="70" y="82" width="60" height="24" rx="4" fill="#1d4ed8" opacity="0.95" />
                                  <text x="100" y="98" font-size="12" font-weight="900" fill="#ffffff" letter-spacing="1">DSE</text>
                                  <text x="100" y="118" font-size="6.5" font-weight="bold">«ДС-Инжиниринг»</text>
                                  <text x="100" y="128" font-size="5.5">г. Самара</text>
                                </g>
                              </svg>

                              <!-- Facsimile Director Signature -->
                              <div style="position: absolute; left: 2mm; top: 8mm; width: 32mm; height: 16mm; pointer-events: none; z-index: 6;">
                                <svg viewBox="0 0 160 70" width="100%" height="100%">
                                  <path d="M 10,48 Q 28,12 44,36 T 68,26 Q 88,6 108,36 Q 124,52 148,18" fill="none" stroke="#1e293b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
                                  <path d="M 38,32 L 132,58" fill="none" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" opacity="0.85" />
                                </svg>
                              </div>
                            </div>
                          ` : ''}

                          <div style="font-weight: 500; font-size: 9.5pt; color: #0f172a; white-space: nowrap; padding-bottom: 2pt; text-align: right; min-width: 40mm; z-index: 10;">
                            ${directorDisplay}
                          </div>
                        </div>
                      `}
                    </div>
                  `;
                }

                return '';
              }).join('')}
            </div>
          </div>

          <!-- Running Footer & Page Numbering -->
          <div style="border-top: 0.5pt solid #e2e8f0; padding-top: 4pt; display: flex; justify-content: space-between; align-items: center; font-size: 7pt; color: #94a3b8;">
            <span>${org.name || 'ООО «ДС-Инжиниринг»'} • ${org.website || 'ds-enginering.ru'}</span>
            ${paginationMode === 'bottom_numbers' ? `
              <span style="font-weight: bold; color: #475569; margin-right: auto; margin-left: auto;">
                ${pageIdx === 0 ? '' : `${pageIdx + 1}`}
              </span>
            ` : `
              <span style="font-weight: bold; color: #475569;">Страница ${pageIdx + 1} из ${totalPagesCount}</span>
            `}
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

/**
 * Renders each A4 sheet separately into a multi-page PDF using jsPDF
 */
export const downloadProposalPdf = async (proposal: ProposalPrintData) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const htmlContent = generateProposalHtml(proposal);
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '210mm';
      iframe.style.height = '1000mm';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);
      
      iframe.contentWindow?.document.open();
      iframe.contentWindow?.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; padding: 0; background: #ffffff; }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      iframe.contentWindow?.document.close();

      setTimeout(async () => {
        try {
          const doc = iframe.contentWindow?.document;
          if (!doc) throw new Error('Document iframe not ready');

          const sheets = doc.querySelectorAll<HTMLElement>('.a4-page-render, .proposal-a4-sheet');
          if (!sheets || sheets.length === 0) throw new Error('No proposal sheets found');

          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          for (let i = 0; i < sheets.length; i++) {
            const sheet = sheets[i];
            const canvas = await html2canvas(sheet, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              logging: false,
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            if (i > 0) {
              pdf.addPage('a4', 'portrait');
            }
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
          }

          const prefix = proposal.documentType === 'technical_task' ? 'ТЗ' : proposal.documentType === 'specification' ? 'Спецификация' : 'ТКП';
          const safeCompanyName = (proposal.customerCompany || 'Заказчик').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_').slice(0, 30);
          const filename = `${prefix}_${proposal.number || '001'}_${safeCompanyName}.pdf`;
          pdf.save(filename);

          document.body.removeChild(iframe);
          resolve();
        } catch (error) {
          if (iframe.parentNode) document.body.removeChild(iframe);
          reject(error);
        }
      }, 700);
    } catch (error) {
      reject(error);
    }
  });
};
