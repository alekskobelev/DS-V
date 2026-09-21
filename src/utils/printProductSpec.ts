import { Product } from '../types';

/**
 * Generates an official, print-ready HTML document for technical specifications
 * of any equipment or software product of DS-Engineering center.
 */
export const generatePrintableHTML = (product: Product): string => {
  const isDual = Boolean(product.dualModeSpecs);

  const rowsHtml = isDual && product.dualModeSpecs
    ? product.dualModeSpecs.rows.map((r) => `
      <tr>
        <td style="font-weight: bold; width: 35%; padding: 8px; border-bottom: 1px solid #e2e8f0;">${r.label}</td>
        ${r.singleVal
          ? `<td colSpan="2" style="text-align: center; background-color: #f8fafc; padding: 8px; border-bottom: 1px solid #e2e8f0;">${r.singleVal}</td>`
          : `<td style="text-align: center; font-family: monospace; background-color: #eff6ff; padding: 8px; border-bottom: 1px solid #e2e8f0;">${r.laserVal || '—'}</td>
             <td style="text-align: center; font-family: monospace; background-color: #eef2ff; padding: 8px; border-bottom: 1px solid #e2e8f0;">${r.irVal || '—'}</td>`
        }
      </tr>
    `).join('')
    : product.specs
    ? Object.entries(product.specs).map(([k, v]) => `
      <tr>
        <td style="font-weight: bold; width: 40%; padding: 8px; border-bottom: 1px solid #e2e8f0;">${k}</td>
        <td style="font-family: monospace; padding: 8px; border-bottom: 1px solid #e2e8f0;">${v}</td>
      </tr>
    `).join('')
    : '';

  const dualHeader = isDual && product.dualModeSpecs
    ? `
      <tr style="background-color: #1e293b; color: white;">
        <th style="padding: 10px; text-align: left;">Характеристика / Параметр</th>
        <th style="padding: 10px; text-align: center; background-color: #1e3a8a;">${product.dualModeSpecs.modeTitle1 || 'Лазерное сканирование'}</th>
        <th style="padding: 10px; text-align: center; background-color: #312e81;">${product.dualModeSpecs.modeTitle2 || 'Инфракрасное сканирование (VCSEL)'}</th>
      </tr>
    `
    : `
      <tr style="background-color: #1e293b; color: white;">
        <th style="padding: 10px; width: 40%; text-align: left;">Наименование параметра</th>
        <th style="padding: 10px; text-align: left;">Метрологическое значение</th>
      </tr>
    `;

  const footnotesHtml = isDual && product.dualModeSpecs?.footnotes
    ? product.dualModeSpecs.footnotes.map((fn) => `<p style="margin: 4px 0; font-size: 11px; color: #475569;">• ${fn}</p>`).join('')
    : '';

  const sysReqs = product.dualModeSpecs?.systemReqs || (product.sysReqs as any);
  const sysReqsHtml = sysReqs
    ? `
      <div style="margin-top: 20px; background-color: #0f172a; color: white; border-radius: 8px; padding: 14px; font-size: 11px;">
        <strong style="color: #60a5fa; display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Рекомендуемая конфигурация ПК / Системные требования:</strong>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          ${sysReqs.os ? `<div><span style="color: #94a3b8; display: block;">ОС:</span> <strong>${sysReqs.os}</strong></div>` : ''}
          ${sysReqs.gpu ? `<div><span style="color: #94a3b8; display: block;">GPU:</span> <strong>${sysReqs.gpu}</strong></div>` : ''}
          ${sysReqs.vram ? `<div><span style="color: #94a3b8; display: block;">VRAM:</span> <strong>${sysReqs.vram}</strong></div>` : ''}
          ${sysReqs.cpu ? `<div><span style="color: #94a3b8; display: block;">CPU:</span> <strong>${sysReqs.cpu}</strong></div>` : ''}
          ${sysReqs.ram ? `<div style="grid-column: span 2;"><span style="color: #94a3b8; display: block;">RAM:</span> <strong>${sysReqs.ram}</strong></div>` : ''}
        </div>
      </div>
    `
    : '';

  const featuresListHtml = (product.features && product.features.length > 0)
    ? `
      <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #1e3a8a; margin-top: 20px; margin-bottom: 5px;">
        ПРЕИМУЩЕСТВА И КОМПЛЕКТАЦИЯ:
      </h3>
      <ul style="font-size: 11px; color: #334155; padding-left: 20px; margin: 8px 0;">
        ${product.features.map((f) => `<li style="margin-bottom: 3px;">${f}</li>`).join('')}
      </ul>
    `
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Спецификация_${product.name.replace(/\s+/g, '_')}_ДС‑Инжиниринг</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; line-height: 1.4; background: white; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
    .company { font-size: 20px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.5px; }
    .subcompany { font-size: 11px; color: #475569; font-weight: 600; }
    .contacts { text-align: right; font-size: 11px; color: #334155; line-height: 1.3; }
    .doc-title { font-size: 15px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 15px; text-align: center; background: #f1f5f9; padding: 8px; border-radius: 6px; letter-spacing: 0.5px; }
    .prod-header { margin: 15px 0 10px 0; }
    .prod-name { font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 0; }
    .prod-meta { font-size: 12px; color: #64748b; margin-top: 4px; }
    .prod-desc { font-size: 12px; color: #334155; margin: 10px 0 15px 0; text-align: justify; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 7px 10px; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
    .stamp { font-weight: bold; color: #1e3a8a; border: 1.5px dashed #1e3a8a; padding: 6px 12px; border-radius: 6px; display: inline-block; }
    .no-print-btn { display: block; margin-bottom: 20px; text-align: right; }
    @media print {
      .no-print-btn { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print-btn">
    <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; font-size: 13px; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      🖨️ Распечатать / Сохранить в PDF
    </button>
  </div>

  <div class="header">
    <div>
      <div class="company">ООО «ДС‑Инжиниринг»</div>
      <div class="subcompany">Промышленная метрология • 3D-сканирование • КИМ • Оборудование • CAD/CAM</div>
    </div>
    <div class="contacts">
      <strong>Тел:</strong> +7 (846) 219-24-64<br>
      <strong>Моб:</strong> +7 (927) 719-06-97<br>
      <strong>Email:</strong> info@ds-eng.ru<br>
      <strong>Сайт:</strong> www.ds-eng.ru<br>
      <strong>Дата документа:</strong> ${new Date().toLocaleDateString('ru-RU')}
    </div>
  </div>

  <div class="doc-title">Официальный технический паспорт и спецификация продукта</div>

  <div class="prod-header">
    <h1 class="prod-name">${product.name}</h1>
    <div class="prod-meta">Бренд: <strong>${product.brand}</strong> | Категория: <strong>${product.categoryLabel || product.category}</strong> | Код товара: <code>${product.id}</code></div>
  </div>

  <div class="prod-desc">${product.fullDescription || product.shortDescription}</div>

  <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #1e3a8a; margin-top: 15px; margin-bottom: 5px;">
    ТЕХНИЧЕСКИЕ И МЕТРОЛОГИЧЕСКИЕ ХАРАКТЕРИСТИКИ:
  </h3>

  <table>
    <thead>
      ${dualHeader}
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  ${footnotesHtml}
  ${sysReqsHtml}
  ${featuresListHtml}

  <div class="footer">
    <div>
      <div class="stamp">МЕТРОЛОГИЧЕСКИЙ КОНТРОЛЬ ДС‑ИНЖИНИРИНГ — ПОВЕРЕНО</div>
      <div style="margin-top: 4px;">Официальная гарантия и техническая поддержка в РФ.</div>
    </div>
    <div style="text-align: right;">
      Документ сформирован автоматически.<br>
      Инжиниринговый центр «ДС‑Инжиниринг»
    </div>
  </div>
</body>
</html>`;
};
