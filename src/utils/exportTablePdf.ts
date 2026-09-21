import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface TablePdfBadge {
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'indigo' | 'slate' | 'teal';
}

export type TablePdfCell = string | number | {
  text: string;
  subtext?: string;
  badge?: boolean;
  color?: 'emerald' | 'rose' | 'amber' | 'blue' | 'indigo' | 'slate' | 'teal' | 'gray';
  align?: 'left' | 'center' | 'right';
};

export interface ExportTablePdfOptions {
  title: string;
  subtitle?: string;
  department?: string;
  filterInfo?: string;
  summaryBadges?: TablePdfBadge[];
  headers: string[];
  rows: TablePdfCell[][];
  columnAlignments?: ('left' | 'center' | 'right')[];
  columnWidths?: string[]; // e.g. ['5%', '25%', '20%', '15%', '15%', '20%']
  orientation?: 'landscape' | 'portrait';
  filename?: string;
  responsiblePerson?: string;
  approvedBy?: string;
  itemsPerPage?: number;
}

/**
 * Corporate emblem SVG for report header
 */
function getDsLogoSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="44" height="44" style="vertical-align: middle;">
    <circle cx="80" cy="80" r="74" fill="#0369a1" stroke="#075985" stroke-width="3"/>
    <circle cx="80" cy="80" r="66" fill="#ffffff" />
    <circle cx="80" cy="80" r="62" fill="none" stroke="#0284c7" stroke-width="1.8"/>
    <g transform="translate(80,80)" stroke="#0369a1" fill="none" stroke-width="2.5">
      <line x1="0" y1="-42" x2="0" y2="42" stroke-width="3.5" stroke="#0284c7"/>
      <line x1="-42" y1="0" x2="42" y2="0" stroke-width="3.5" stroke="#0284c7"/>
      <line x1="-30" y1="-30" x2="30" y2="30" stroke-width="3.5" stroke="#0284c7"/>
      <line x1="-30" y1="30" x2="30" y2="-30" stroke-width="3.5" stroke="#0284c7"/>
      <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#0369a1" stroke-width="2.5"/>
      <circle cx="0" cy="0" r="16" fill="#0284c7" stroke="none"/>
    </g>
  </svg>`;
}

/**
 * Formats a single table cell to HTML string
 */
function renderCellHtml(cell: TablePdfCell, defaultAlign: 'left' | 'center' | 'right' = 'left'): string {
  if (cell === null || cell === undefined) {
    return '—';
  }

  if (typeof cell === 'string' || typeof cell === 'number') {
    return String(cell);
  }

  const align = cell.align || defaultAlign;
  const textAlignStyle = `text-align: ${align};`;

  if (cell.badge) {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      emerald: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
      green: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
      rose: { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
      red: { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
      amber: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
      blue: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
      indigo: { bg: '#eef2ff', text: '#3730a3', border: '#c7d2fe' },
      teal: { bg: '#f0fdf4', text: '#115e59', border: '#99f6e4' },
      slate: { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' },
      gray: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
    };

    const scheme = colorMap[cell.color || 'blue'] || colorMap.blue;

    return `
      <div style="${textAlignStyle}">
        <span style="
          display: inline-block;
          padding: 2px 8px;
          font-size: 8pt;
          font-weight: 700;
          line-height: 1.2;
          border-radius: 9999px;
          background-color: ${scheme.bg};
          color: ${scheme.text};
          border: 1px solid ${scheme.border};
          white-space: nowrap;
        ">
          ${cell.text}
        </span>
        ${cell.subtext ? `<div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">${cell.subtext}</div>` : ''}
      </div>
    `;
  }

  return `
    <div style="${textAlignStyle}">
      <span style="font-weight: 600; color: #0f172a;">${cell.text}</span>
      ${cell.subtext ? `<div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">${cell.subtext}</div>` : ''}
    </div>
  `;
}

/**
 * Universal table exporter to PDF report
 */
export async function exportTableToPdf(options: ExportTablePdfOptions): Promise<void> {
  const {
    title,
    subtitle = 'ООО «ДС-Инжиниринг» • Комплексные метрологические и CAD/CAM решения',
    department = 'Метрологическая служба & Департамент сервиса',
    filterInfo,
    summaryBadges = [],
    headers,
    rows,
    columnAlignments = [],
    columnWidths = [],
    orientation = rows.length > 0 && headers.length > 5 ? 'landscape' : 'portrait',
    filename = `Отчет_${title.replace(/[\s/\\:]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`,
    responsiblePerson = 'Некрасов С.Ю. (Генеральный директор)',
    approvedBy = 'Некрасов С.Ю.',
  } = options;

  // Determine pagination chunking
  const isLandscape = orientation === 'landscape';
  // A4 dimensions in mm
  const pageWidthMm = isLandscape ? 297 : 210;
  const pageHeightMm = isLandscape ? 210 : 297;

  // Items per page calculation
  const itemsOnFirstPage = options.itemsPerPage || (isLandscape ? 12 : 16);
  const itemsOnNextPages = options.itemsPerPage || (isLandscape ? 15 : 20);

  // Split rows into pages
  const pages: TablePdfCell[][][] = [];
  let currentIndex = 0;

  if (rows.length === 0) {
    pages.push([]);
  } else {
    while (currentIndex < rows.length) {
      const limit = pages.length === 0 ? itemsOnFirstPage : itemsOnNextPages;
      const chunk = rows.slice(currentIndex, currentIndex + limit);
      pages.push(chunk);
      currentIndex += limit;
    }
  }

  const totalPages = pages.length;
  const generationDate = new Date().toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Create isolated container in body
  const container = document.createElement('div');
  container.id = 'pdf-export-render-root';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = isLandscape ? '297mm' : '210mm';
  container.style.zIndex = '-99999';
  container.style.opacity = '0.01';
  container.style.pointerEvents = 'none';
  container.style.backgroundColor = '#ffffff';

  // Build HTML for each page
  const pagesHtml = pages.map((pageRows, pageIdx) => {
    const isFirstPage = pageIdx === 0;
    const isLastPage = pageIdx === totalPages - 1;
    const startNum = pageIdx === 0 ? 1 : (pageIdx === 1 ? itemsOnFirstPage + 1 : itemsOnFirstPage + (pageIdx - 1) * itemsOnNextPages + 1);

    return `
      <div class="pdf-page" style="
        width: ${pageWidthMm}mm;
        height: ${pageHeightMm}mm;
        box-sizing: border-box;
        padding: 12mm 14mm 12mm 14mm;
        background-color: #ffffff;
        font-family: 'Segoe UI', Arial, -apple-system, Roboto, sans-serif;
        color: #0f172a;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
      ">
        <!-- TOP BANNER & HEADER -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${getDsLogoSvg()}
              <div>
                <div style="font-size: 11pt; font-weight: 900; letter-spacing: 0.5px; color: #0369a1; text-transform: uppercase;">
                  ООО «ДС-ИНЖИНИРИНГ»
                </div>
                <div style="font-size: 7.5pt; color: #475569; font-weight: 600;">
                  ${department} • ИНН 6312134567 • ОГРН 1146312005432
                </div>
              </div>
            </div>

            <div style="text-align: right;">
              <div style="font-size: 7pt; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 1px;">
                Единая Информационная Система
              </div>
              <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">
                Дата выгрузки: <strong style="color: #0f172a;">${generationDate}</strong>
              </div>
            </div>
          </div>

          <!-- DOCUMENT TITLE & SUBTITLE (Full on Page 1, compact on other pages) -->
          ${isFirstPage ? `
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 10px;">
                <h1 style="font-size: 14pt; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -0.2px;">
                  ${title}
                </h1>
                <span style="font-size: 8pt; font-weight: 700; color: #0369a1; background: #e0f2fe; padding: 2px 8px; border-radius: 4px; border: 1px solid #bae6fd;">
                  Официальный реестр
                </span>
              </div>
              <div style="font-size: 8pt; color: #64748b; margin-top: 3px;">
                ${subtitle} ${filterInfo ? `• <em>${filterInfo}</em>` : ''}
              </div>
            </div>

            <!-- SUMMARY BADGES IF ANY -->
            ${summaryBadges.length > 0 ? `
              <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px;">
                ${summaryBadges.map(b => `
                  <div style="display: inline-flex; align-items: center; gap: 5px; font-size: 8pt; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #cbd5e1;">
                    <span style="color: #64748b; font-weight: 600;">${b.label}:</span>
                    <strong style="color: #0f172a;">${b.value}</strong>
                  </div>
                `).join('')}
                <div style="display: inline-flex; align-items: center; gap: 5px; font-size: 8pt; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #cbd5e1; margin-left: auto;">
                  <span style="color: #64748b; font-weight: 600;">Всего в выборке:</span>
                  <strong style="color: #0369a1;">${rows.length}</strong>
                </div>
              </div>
            ` : ''}
          ` : `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-size: 10pt; font-weight: 800; color: #334155;">
                ${title} <span style="font-size: 8pt; font-weight: normal; color: #64748b;">(продолжение)</span>
              </div>
              <div style="font-size: 7.5pt; color: #64748b;">
                Строки ${startNum}–${startNum + pageRows.length - 1} из ${rows.length}
              </div>
            </div>
          `}

          <!-- TABLE REPOSITORY -->
          <table style="
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            table-layout: fixed;
            background-color: #ffffff;
            border: 1px solid #cbd5e1;
          ">
            <thead>
              <tr style="background-color: #0f172a; color: #ffffff;">
                ${headers.map((h, hIdx) => {
                  const width = columnWidths[hIdx] ? `width: ${columnWidths[hIdx]};` : '';
                  const align = columnAlignments[hIdx] || 'left';
                  return `
                    <th style="
                      ${width}
                      padding: 5px 6px;
                      text-align: ${align};
                      font-weight: 800;
                      font-size: 7.5pt;
                      text-transform: uppercase;
                      letter-spacing: 0.3px;
                      border: 1px solid #334155;
                    ">
                      ${h}
                    </th>
                  `;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${pageRows.length === 0 ? `
                <tr>
                  <td colspan="${headers.length}" style="padding: 20px; text-align: center; color: #94a3b8; font-style: italic;">
                    В текущей выборке записей нет
                  </td>
                </tr>
              ` : pageRows.map((row, rIdx) => {
                const isEven = rIdx % 2 === 1;
                const bg = isEven ? '#f8fafc' : '#ffffff';
                return `
                  <tr style="background-color: ${bg};">
                    ${row.map((cell, cIdx) => {
                      const align = columnAlignments[cIdx] || 'left';
                      return `
                        <td style="
                          padding: 4.5px 6px;
                          border: 1px solid #e2e8f0;
                          vertical-align: middle;
                          font-size: 7.5pt;
                          line-height: 1.25;
                          word-break: break-word;
                        ">
                          ${renderCellHtml(cell, align)}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- FOOTER & SIGNATURES BLOCK -->
        <div>
          ${isLastPage ? `
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; font-size: 7.5pt; color: #475569;">
              <div>
                <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px;">Ответственный за формирование отчета:</div>
                <div>Должность: <strong>Главный специалист / Инженер-метролог</strong></div>
                <div style="margin-top: 4px;">Подпись: ______________________ / ${responsiblePerson} /</div>
              </div>

              <div style="text-align: center;">
                <div style="
                  display: inline-block;
                  width: 65px;
                  height: 65px;
                  border: 1.5px dashed #94a3b8;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 6.5pt;
                  color: #94a3b8;
                  font-weight: 700;
                  text-align: center;
                  line-height: 1.1;
                ">
                  М.П.<br/>ДС-ИНЖИНИРИНГ
                </div>
              </div>

              <div style="text-align: right;">
                <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px;">Утверждено:</div>
                <div>Генеральный директор ООО «ДС-Инжиниринг»</div>
                <div style="margin-top: 4px;">______________________ / ${approvedBy} /</div>
              </div>
            </div>
          ` : ''}

          <!-- BOTTOM STATUS STRIP -->
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
            margin-top: 6px;
            font-size: 7pt;
            color: #94a3b8;
          ">
            <div>
              Документ сформирован в автоматизированной CRM/ERP системе ООО «ДС-Инжиниринг» (ds-metrology.ru)
            </div>
            <div>
              Страница <strong style="color: #0f172a;">${pageIdx + 1}</strong> из <strong style="color: #0f172a;">${totalPages}</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = pagesHtml;
  document.body.appendChild(container);

  try {
    const pageElements = Array.from(container.querySelectorAll('.pdf-page')) as HTMLElement[];
    if (pageElements.length === 0) {
      throw new Error('No pages generated for PDF export');
    }

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      const canvas = await html2canvas(pageEl, {
        scale: 2, // High resolution crisp text rendering
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: isLandscape ? 1200 : 900,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) {
        pdf.addPage('a4', orientation);
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');
    }

    pdf.save(filename);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
