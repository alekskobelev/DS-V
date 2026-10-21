/**
 * Bidirectional Markdown Synchronization Engine for Russian Commercial Documents
 * ООО «ДС-Инжиниринг»
 * Supports round-trip between structured document model and editable Markdown.
 */

import { 
  CommercialProposalData, 
  ProposalBlock, 
  SpecificationItem, 
  DocumentType,
  CANONICAL_TT_SECTIONS,
  DEFAULT_ORGANIZATION_PROFILE,
  DEFAULT_DOCUMENT_STYLING
} from '../types/proposalEditor';

export function documentToMarkdown(doc: any): string {
  if (!doc) return '';
  const parts: string[] = [];

  // 1. Organization Header Directive (System Frame)
  const org = doc.organization || DEFAULT_ORGANIZATION_PROFILE;
  parts.push(`:::org_header
${org.name || 'ООО «ДС-Инжиниринг»'}
Адрес: ${org.address || '443022, г. Самара, Заводское шоссе, д. 18'} ${org.phoneCityLabel || 'тел/факс в Самаре'} ${org.phone || '+7 (846) 954-02-92'}  e-mail: ${org.email || 'info@ds-enginering.ru'}
ИНН ${org.inn || '6312117282'} / КПП ${org.kpp || '631201001'}  ОГРН ${org.ogrn || '1126312004520'}
:::`);

  // 2. Reference & Date
  const validUntilStr = doc.validUntilDate || doc.terms?.validUntil || '';
  const num = doc.outgoingNumber || doc.proposalNumber || 'ТКП-2026/01';
  const dateStr = doc.date || doc.proposalDate || new Date().toLocaleDateString('ru-RU');
  parts.push(`:::doc_ref
Исх. № ${num} от ${dateStr} г.
${validUntilStr ? `Срок действия: до ${validUntilStr}` : ''}
${doc.documentType === 'technical_task' ? `Тип документа: Техническое задание (Приложение № ${doc.appendixNumber || '1'})` : doc.documentType === 'specification' ? `Тип документа: Спецификация поставок` : `Тип документа: Основной ТКП`}
:::`);

  // 3. Recipient
  const company = doc.customerCompany || doc.toCompany || '[Наименование компании Заказчика]';
  const ceoFio = doc.ceoName || doc.contactPerson || '';
  parts.push(`:::recipient
Кому: ${company}
${doc.customerInn ? `ИНН: ${doc.customerInn}` : ''}
${doc.ceoPost ? `Должность: ${doc.ceoPost}` : ''}
${ceoFio ? `ФИО: ${ceoFio}` : ''}
:::`);

  // 4. Document Title & Greeting
  const title = doc.proposalTitle || doc.title || 'на поставку измерительного оборудования и инжиниринговые услуги';
  if (doc.documentType === 'technical_task') {
    parts.push(`:::doc_title
ПРИЛОЖЕНИЕ № ${doc.appendixNumber || '1'}
ТЕХНИЧЕСКОЕ ЗАДАНИЕ
к технико-коммерческому предложению № ${num} от ${dateStr} г.
Тема: ${title}
:::`);
  } else if (doc.documentType === 'specification') {
    parts.push(`:::doc_title
СПЕЦИФИКАЦИЯ ПОСТАВОК
к технико-коммерческому предложению № ${num} от ${dateStr} г.
Предмет: ${title}
:::`);
  } else {
    parts.push(`:::doc_title
ТЕХНИКО-КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ
на ${title}
:::`);
    if (doc.greeting) {
      parts.push(`**${doc.greeting}**\n`);
    }
  }

  // 5. Body Content (Blocks or specItems)
  parts.push(`:::body`);

  if (doc.blocks && doc.blocks.length > 0) {
    doc.blocks.forEach((block: any, idx: number) => {
      if (block.type === 'page_break') {
        parts.push(`\n---\n<!-- page_break -->\n`);
        return;
      }

      if (block.type === 'text') {
        if (block.title) parts.push(`\n### ${block.title}\n`);
        if (block.content) parts.push(`${block.content}\n`);
      } else if (block.type === 'tt_section') {
        const secNum = block.sectionNumber || idx + 1;
        parts.push(`\n## ${block.title || `${secNum}. РАЗДЕЛ ТЗ`}\n`);
        if (block.content) parts.push(`${block.content}\n`);
      } else if (block.type === 'specification') {
        if (block.title) parts.push(`\n### ${block.title}\n`);
        parts.push(generateMarkdownTable(block.items || []));
      } else if (block.type === 'image') {
        const img = block.imageItem || (block.images && block.images[0]);
        if (img) parts.push(`\n![${img.caption || 'Иллюстрация'}](${img.url})\n`);
      }
    });
  } else if (doc.specItems && doc.specItems.length > 0) {
    parts.push(`\n### Спецификация оборудования и услуг\n`);
    parts.push(generateMarkdownTable(doc.specItems));
  }

  parts.push(`:::`);

  // 6. Terms (Optional for TT, standard for main and spec)
  const terms = doc.terms || {};
  const deliv = terms.deliveryTerms || doc.deliveryTerms || doc.deliveryDays || '5–15 рабочих дней со склада в г. Самара.';
  const pay = terms.paymentTerms || doc.paymentTerms || '50% аванс, 50% по факту готовности к отгрузке.';
  const war = terms.warrantyTerms || doc.warrantyMonths || '24 месяца расширенной заводской гарантии.';
  const notes = terms.finalPriceNotes || doc.notes || 'Включает первичную метрологическую поверку во ФГИС «АРШИН».';

  parts.push(`:::terms
**Условия поставки:** ${deliv}
**Конечная цена:** ${notes}
**Условия оплаты:** ${pay}
**Сроки поставки:** ${doc.deliveryDays || deliv}
**Гарантийное сервисное обслуживание КИМ и техническая поддержка:** ${war}
${validUntilStr ? `**Срок действия:** Данное коммерческое предложение действительно до ${validUntilStr} г.` : ''}
${doc.currency === 'USD' ? `**Условия конвертации:** Оплата производится по курсу Доллара США, установленному ЦБ РФ на дату оплаты.` : ''}
:::`);

  // 7. Signature
  if (doc.includeStamp !== false) {
    parts.push(`:::signature
**Генеральный директор:** / ${doc.signatoryName || org.directorName || 'С.Ю. Некрасов'} /
**Ответственный специалист:** ${doc.managerName || 'Специалист проекта'} (${doc.managerPost || doc.signatoryPost || 'Инженер'})
**Контакты:** ${doc.managerPhone || org.phone || '+7 (846) 954-02-92'} • ${doc.managerEmail || org.email || 'info@ds-enginering.ru'}
:::`);
  }

  return parts.join('\n\n');
}

function generateMarkdownTable(items: SpecificationItem[]): string {
  if (!items || items.length === 0) {
    return `| № п/п | Наименование | Кол-во | Ед. | Цена без НДС | Сумма без НДС |\n| :---: | :--- | :---: | :---: | ---: | ---: |\n| 1 | Наименование позиции | 1 | шт. | 0,00 | 0,00 |`;
  }

  const header = `| № п/п | Наименование оборудования / услуг | Кол-во | Ед. | Цена без НДС | Сумма без НДС |\n| :---: | :--- | :---: | :---: | ---: | ---: |`;
  const rows = items.map((it, idx) => {
    const qty = Number(it.quantity) || 1;
    const pr = Number(it.price) || 0;
    const disc = Number(it.discountPercent) || 0;
    const rowSum = qty * pr * (1 - disc / 100);
    const prFormatted = formatMoneyRu(pr);
    const sumFormatted = formatMoneyRu(rowSum);
    return `| ${idx + 1} | ${it.name.replace(/\|/g, '-')} | ${qty} | ${it.unit || 'шт.'} | ${prFormatted} | ${sumFormatted} |`;
  });

  return [header, ...rows].join('\n');
}

export function formatMoneyRu(amount: number, _currency?: string): string {
  if (isNaN(amount)) return '0,00';
  const fixed = (Math.round(amount * 100) / 100).toFixed(2);
  const parts = fixed.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${integerPart},${parts[1]}`;
}

export function parseMoneyRu(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/\s+/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parses editable Markdown text back into structured CommercialProposalData
 */
export function markdownToDocument(
  markdown: string, 
  currentDoc: CommercialProposalData
): CommercialProposalData {
  const updatedDoc: CommercialProposalData = {
    ...currentDoc,
    blocks: [...(currentDoc.blocks || [])],
    terms: { ...(currentDoc.terms || {}) }
  };

  if (!markdown || !markdown.trim()) {
    return updatedDoc;
  }

  // 1. Extract Directives (:::directive ... :::)
  const orgHeaderMatch = markdown.match(/:::org_header([\s\S]*?):::/);
  if (orgHeaderMatch) {
    const text = orgHeaderMatch[1].trim();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0 && updatedDoc.organization) {
      updatedDoc.organization.name = lines[0] || updatedDoc.organization.name;
    }
  }

  const docRefMatch = markdown.match(/:::doc_ref([\s\S]*?):::/);
  if (docRefMatch) {
    const text = docRefMatch[1];
    const numMatch = text.match(/Исх\.\s*№\s*([^\s]+)\s*от\s*([^г\n]+)/i);
    if (numMatch) {
      updatedDoc.outgoingNumber = numMatch[1].trim();
      updatedDoc.date = numMatch[2].trim();
    }
    const typeMatch = text.match(/Тип документа:\s*(Техническое задание|Спецификация|Основной ТКП)/i);
    if (typeMatch) {
      if (/Техническое задание/i.test(typeMatch[1])) {
        updatedDoc.documentType = 'technical_task';
      } else if (/Спецификация/i.test(typeMatch[1])) {
        updatedDoc.documentType = 'specification';
      } else {
        updatedDoc.documentType = 'main';
      }
    }
    const validMatch = text.match(/Срок действия:\s*до\s*([^\n]+)/i);
    if (validMatch) {
      updatedDoc.validUntilDate = validMatch[1].trim();
      updatedDoc.terms.validUntil = validMatch[1].trim();
    }
  }

  const recipientMatch = markdown.match(/:::recipient([\s\S]*?):::/);
  if (recipientMatch) {
    const text = recipientMatch[1];
    const compMatch = text.match(/Кому:\s*([^\n]+)/i);
    if (compMatch) updatedDoc.customerCompany = compMatch[1].trim();
    const innMatch = text.match(/ИНН:\s*([0-9]+)/i);
    if (innMatch) updatedDoc.customerInn = innMatch[1].trim();
    const postMatch = text.match(/Должность:\s*([^\n]+)/i);
    if (postMatch) updatedDoc.ceoPost = postMatch[1].trim();
    const fioMatch = text.match(/ФИО:\s*([^\n]+)/i);
    if (fioMatch) updatedDoc.ceoName = fioMatch[1].trim();
  }

  const docTitleMatch = markdown.match(/:::doc_title([\s\S]*?):::/);
  if (docTitleMatch) {
    const text = docTitleMatch[1];
    const onMatch = text.match(/на\s+([^\n]+)/i) || text.match(/Тема:\s*([^\n]+)/i) || text.match(/Предмет:\s*([^\n]+)/i);
    if (onMatch) {
      updatedDoc.title = onMatch[1].trim();
    }
    const appMatch = text.match(/ПРИЛОЖЕНИЕ\s*№\s*([0-9a-zA-Zа-яА-Я]+)/i);
    if (appMatch) {
      updatedDoc.appendixNumber = appMatch[1].trim();
    }
  }

  // 2. Extract Body Content
  let bodyContent = '';
  const bodyMatch = markdown.match(/:::body([\s\S]*?):::/);
  if (bodyMatch) {
    bodyContent = bodyMatch[1].trim();
  } else {
    // If no :::body wrapper, strip other directives
    bodyContent = markdown
      .replace(/:::org_header[\s\S]*?:::/g, '')
      .replace(/:::doc_ref[\s\S]*?:::/g, '')
      .replace(/:::recipient[\s\S]*?:::/g, '')
      .replace(/:::doc_title[\s\S]*?:::/g, '')
      .replace(/:::terms[\s\S]*?:::/g, '')
      .replace(/:::signature[\s\S]*?:::/g, '')
      .trim();
  }

  if (bodyContent) {
    const parsedBlocks = parseBodyToBlocks(bodyContent, updatedDoc.documentType);
    if (parsedBlocks.length > 0) {
      updatedDoc.blocks = parsedBlocks;
    }
  }

  // 3. Extract Terms
  const termsMatch = markdown.match(/:::terms([\s\S]*?):::/);
  if (termsMatch) {
    const tText = termsMatch[1];
    const delivMatch = tText.match(/\*\*Условия поставки:\*\*\s*([^\n]+)/i);
    if (delivMatch) updatedDoc.terms.deliveryTerms = delivMatch[1].trim();

    const priceMatch = tText.match(/\*\*Конечная цена:\*\*\s*([^\n]+)/i);
    if (priceMatch) updatedDoc.terms.finalPriceNotes = priceMatch[1].trim();

    const payMatch = tText.match(/\*\*Условия оплаты:\*\*\s*([^\n]+)/i);
    if (payMatch) updatedDoc.terms.paymentTerms = payMatch[1].trim();

    const perMatch = tText.match(/\*\*Сроки поставки:\*\*\s*([^\n]+)/i);
    if (perMatch) {
      updatedDoc.terms.deliveryPeriod = perMatch[1].trim();
      updatedDoc.deliveryDays = perMatch[1].trim();
    }

    const warMatch = tText.match(/\*\*Гарантийное сервисное обслуживание[^:]*:\*\*\s*([^\n]+)/i) || tText.match(/\*\*Гарантия:\*\*\s*([^\n]+)/i);
    if (warMatch) {
      updatedDoc.terms.warrantyTerms = warMatch[1].trim();
      updatedDoc.warrantyMonths = warMatch[1].trim();
    }
  }

  // 4. Extract Signature
  const sigMatch = markdown.match(/:::signature([\s\S]*?):::/);
  if (sigMatch) {
    const sText = sigMatch[1];
    const mgrMatch = sText.match(/\*\*Ответственный специалист:\*\*\s*([^(]+)(?:\(([^)]+)\))?/i);
    if (mgrMatch) {
      updatedDoc.managerName = mgrMatch[1].trim();
      if (mgrMatch[2]) updatedDoc.managerPost = mgrMatch[2].trim();
    }
  }

  return updatedDoc;
}

function parseBodyToBlocks(bodyText: string, docType: DocumentType): ProposalBlock[] {
  const blocks: ProposalBlock[] = [];
  
  // Split by page breaks or section headings
  const rawSections = bodyText.split(/(?:\n---\n|<!--\s*page_break\s*-->|(?=\n##\s+)|\n(?=###\s+))/);

  let currentBlockId = 1;

  for (const rawSec of rawSections) {
    const sec = rawSec.trim();
    if (!sec) continue;

    // Check if page break
    if (sec === '---' || sec.includes('<!-- page_break -->')) {
      blocks.push({
        id: `block-pb-${currentBlockId++}-${Date.now()}`,
        type: 'page_break'
      });
      continue;
    }

    // Check if table
    if (sec.includes('|') && sec.includes('---')) {
      const items = parseMarkdownTable(sec);
      const titleMatch = sec.match(/###?\s*([^\n]+)/);
      blocks.push({
        id: `block-spec-${currentBlockId++}-${Date.now()}`,
        type: 'specification',
        title: titleMatch ? titleMatch[1].trim() : 'Спецификация оборудования и услуг',
        items: items
      });
      continue;
    }

    // Check if image
    const imgMatch = sec.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      blocks.push({
        id: `block-img-${currentBlockId++}-${Date.now()}`,
        type: 'image',
        imageItem: {
          id: `img-${Date.now()}`,
          caption: imgMatch[1],
          url: imgMatch[2],
          widthPercent: 60,
          align: 'center',
          hasBorder: true
        }
      });
      continue;
    }

    // Check if TT Canonical section
    const ttHeadMatch = sec.match(/^##\s*([0-9]+)\.\s*([^\n]+)/m);
    if (ttHeadMatch && docType === 'technical_task') {
      const secNum = parseInt(ttHeadMatch[1], 10) || 1;
      const title = `${secNum}. ${ttHeadMatch[2].trim()}`;
      const content = sec.replace(/^##\s*[^\n]+\n?/, '').trim();
      blocks.push({
        id: `block-tt-${secNum}-${Date.now()}`,
        type: 'tt_section',
        sectionNumber: secNum,
        title: title,
        content: content,
        canonicalKey: `tt_${secNum}`
      });
      continue;
    }

    // Regular text block
    const textHeadMatch = sec.match(/^###?\s*([^\n]+)\n?/m);
    let title = '';
    let content = sec;
    if (textHeadMatch) {
      title = textHeadMatch[1].trim();
      content = sec.replace(/^###?\s*[^\n]+\n?/, '').trim();
    }

    blocks.push({
      id: `block-text-${currentBlockId++}-${Date.now()}`,
      type: 'text',
      title: title,
      content: content,
      formatting: {
        fontFamily: 'pt-sans',
        fontSize: '9pt',
        lineHeight: '1.15',
        textAlign: 'justify'
      }
    });
  }

  return blocks;
}

function parseMarkdownTable(tableText: string): SpecificationItem[] {
  const lines = tableText.split('\n').map(l => l.trim()).filter(l => l.startsWith('|') && l.endsWith('|'));
  if (lines.length < 3) return [];

  // Skip header and divider
  const dataLines = lines.slice(2);
  const items: SpecificationItem[] = [];

  dataLines.forEach((line, idx) => {
    const cols = line.split('|').map(c => c.trim()).slice(1, -1);
    if (cols.length >= 2) {
      const name = cols[1] || `Позиция ${idx + 1}`;
      const qty = parseInt(cols[2] || '1', 10) || 1;
      const unit = cols[3] || 'шт.';
      const price = parseMoneyRu(cols[4] || '0');

      items.push({
        id: `spec-md-${idx + 1}-${Date.now()}`,
        name,
        quantity: qty,
        unit,
        price,
        discountPercent: 0
      });
    }
  });

  return items;
}

export const generateProposalMarkdown = documentToMarkdown;
export const parseProposalMarkdown = (markdown: string, currentDoc?: any): any => {
  const doc = markdownToDocument(markdown, currentDoc || {
    documentType: 'main',
    outgoingNumber: '',
    date: new Date().toLocaleDateString('ru-RU'),
    customerCompany: '',
    customerInn: '',
    ceoName: '',
    ceoPost: '',
    greeting: '',
    title: '',
    procurementType: 'commercial',
    vatMode: 'standard',
    vatRate: 22,
    currency: 'RUB',
    terms: {},
    deliveryDays: '',
    warrantyMonths: '',
    managerName: '',
    managerPost: '',
    managerPhone: '',
    managerEmail: '',
    includeStamp: true,
    blocks: [],
    documentStyling: DEFAULT_DOCUMENT_STYLING,
    organization: DEFAULT_ORGANIZATION_PROFILE
  });

  // Extract spec items from blocks if any
  let items: SpecificationItem[] = [];
  (doc.blocks || []).forEach((b: any) => {
    if (b.type === 'specification' && b.items && b.items.length > 0) {
      items = b.items;
    }
  });

  return {
    ...doc,
    proposalNumber: doc.outgoingNumber,
    proposalDate: doc.date,
    toCompany: doc.customerCompany,
    proposalTitle: doc.title,
    specItems: items.length > 0 ? items : undefined,
    deliveryDays: doc.terms?.deliveryPeriod || doc.deliveryDays,
    warrantyMonths: doc.terms?.warrantyTerms || doc.warrantyMonths,
    deliveryTerms: doc.terms?.deliveryTerms,
    paymentTerms: doc.terms?.paymentTerms,
    signatoryName: doc.organization?.directorName
  };
};

