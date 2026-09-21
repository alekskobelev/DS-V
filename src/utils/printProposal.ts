import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Robust helper to parse Russian full name into proper greeting by Name & Patronymic
 * e.g. "Королев Виктор Михайлович (Главный инженер)" -> "Уважаемый Виктор Михайлович!"
 * e.g. "Смирнова Анна Сергеевна" -> "Уважаемая Анна Сергеевна!"
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
    // Usually: [0]=Фамилия, [1]=Имя, [2]=Отчество
    if (/(ич|ович|евич|на|овна|евна|ична|инична)$/i.test(parts[2])) {
      firstName = parts[1];
      patronymic = parts[2];
    } else if (/(ич|ович|евич|на|овна|евна|ична|инична)$/i.test(parts[1])) {
      firstName = parts[0];
      patronymic = parts[1];
    } else {
      firstName = parts[1];
      patronymic = parts[2];
    }
  } else if (parts.length === 2) {
    if (/(ич|ович|евич|на|овна|евна|ична|инична)$/i.test(parts[1])) {
      firstName = parts[0];
      patronymic = parts[1];
    } else {
      firstName = parts[1];
    }
  } else if (parts.length === 1) {
    firstName = parts[0];
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
  name: string;
  category?: string;
  quantity: number;
  unit?: string;
  price: number; // Price per unit without VAT
}

export interface ProposalPrintData {
  number?: string;
  date?: string;
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
  items?: ProposalPrintItem[];
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
}

export const generateProposalHtml = (proposalData: ProposalPrintData) => {
  const proposalNumber = proposalData.number || `ТКП-${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
  const dateStr = proposalData.date || new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

  // Resolve client company & leader
  const companyTitle = proposalData.customerCompany || proposalData.clientCompany || 'ООО Предприятие-Заказчик';
  const rawLeader = proposalData.ceoName || proposalData.customerName || proposalData.clientName || '';
  const parsedGreeting = parseRussianLeaderGreeting(rawLeader);
  const effectiveGreeting = proposalData.greeting || parsedGreeting.greeting;
  const effectivePost = proposalData.ceoPost || 'Руководителю предприятия';

  // Process items & calculations
  const rawItems = proposalData.items && proposalData.items.length > 0
    ? proposalData.items
    : [
        {
          name: proposalData.title || 'Комплект высокоточного измерительного оборудования и инжиниринговые услуги',
          category: 'Оборудование / Услуги',
          quantity: 1,
          unit: 'компл.',
          price: Math.round((proposalData.budget || proposalData.amount || 250000) / 1.2) // calculate without VAT if only budget was passed
        }
      ];

  let subtotalWithoutVat = 0;
  const renderedItems = rawItems.map((item, idx) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const rowTotal = qty * price;
    subtotalWithoutVat += rowTotal;
    return {
      idx: idx + 1,
      name: item.name,
      category: item.category || 'Оборудование',
      qty,
      unit: item.unit || 'шт.',
      price,
      rowTotal
    };
  });

  const vatAmount = Math.round(subtotalWithoutVat * 0.20);
  const totalWithVat = subtotalWithoutVat + vatAmount;

  // Procurement regulation details
  const procurementType = proposalData.procurementType || 'commercial';
  let procurementBadge = 'Коммерческая поставка';
  let procurementText = 'Стандартные коммерческие условия: 50% аванс, 50% по факту готовности к отгрузке и подписания акта сдачи-приемки. Срок отгрузки: со склада 3–5 рабочих дней, под заказ 15–25 рабочих дней.';
  
  if (procurementType === '44fz') {
    procurementBadge = 'Поставка в рамках Федерального закона № 44-ФЗ (Госзакупки / ГОЗ)';
    procurementText = 'Условия поставки строго по 44-ФЗ: твердая договорная цена, обеспечение исполнения контракта (банковская гарантия), электронное актирование через ЕИС, казначейское / банковское сопровождение, комплект паспортов точности и свидетельств о поверке ФГИС «АРШИН».';
  } else if (procurementType === '223fz') {
    procurementBadge = 'Поставка в рамках Федерального закона № 223-ФЗ';
    procurementText = 'Условия закупки по 223-ФЗ: соответствие положению о закупках Заказчика, безналичный расчет с согласованной отсрочкой платежа, предоставление сертификатов происхождения и заключений Минпромторга РФ.';
  }

  const deliveryDays = proposalData.deliveryDays || '5–15 рабочих дней';
  const warrantyMonths = proposalData.warrantyMonths || '12–24 месяцев';
  const managerName = proposalData.assigneeName || 'Некрасов С.Ю.';
  const managerPost = proposalData.assigneePost || 'Генеральный директор ООО «ДС-Инжиниринг»';
  const managerPhone = proposalData.assigneePhone || '+7 (846) 270-80-00';
  const managerEmail = proposalData.assigneeEmail || 'info@ds-enginering.ru';
  const includeStamp = proposalData.includeStamp !== false;

  return `
    <div id="proposal-print-area" style="
      width: 210mm;
      min-height: 297mm;
      padding: 14mm 16mm;
      background: #ffffff;
      color: #1e293b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      box-sizing: border-box;
      position: relative;
      font-size: 9.5pt;
      line-height: 1.35;
    ">
      <!-- Top Corporate Header -->
      <div style="display: flex; justify-content: space-between; align-items: stretch; border-bottom: 2.5px solid #0f2a59; padding-bottom: 4mm; margin-bottom: 5mm;">
        <!-- Left Brand Identity -->
        <div style="flex: 1.2; padding-right: 5mm;">
          <div style="display: flex; align-items: center; gap: 3mm; margin-bottom: 2mm;">
            <div style="width: 10mm; height: 10mm; background: #0f2a59; border-radius: 2mm; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 14pt; letter-spacing: -0.5px;">
              ДС
            </div>
            <div>
              <div style="font-size: 17pt; color: #0f2a59; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px; line-height: 1;">
                ДС-ИНЖИНИРИНГ
              </div>
              <div style="font-size: 7.5pt; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 1mm;">
                Комплексные инженерные решения & промышленная метрология
              </div>
            </div>
          </div>
          
          <div style="font-size: 7.5pt; color: #475569; line-height: 1.3;">
            <span>ИНН: 6312208119</span> &nbsp;|&nbsp; 
            <span>КПП: 631201001</span> &nbsp;|&nbsp; 
            <span>ОГРН: 1206300057088</span><br/>
            <span>Р/с: 40702810354400018924 в Поволжском банке ПАО Сбербанк</span>
          </div>
        </div>

        <!-- Right Contacts -->
        <div style="flex: 0.9; text-align: right; font-size: 8pt; color: #334155; line-height: 1.35; border-left: 1px solid #e2e8f0; padding-left: 5mm;">
          <div style="font-weight: 700; color: #0f2a59;">443022, РФ, г. Самара, Заводское шоссе, д. 29</div>
          <div>Тел: <strong>+7 (846) 270-80-00</strong> / 8 (800) 555-80-22</div>
          <div>E-mail: <strong style="color: #0f2a59;">info@ds-enginering.ru</strong></div>
          <div>Сайт: <strong style="color: #0f2a59;">ds-enginering.ru</strong></div>
          <div style="color: #64748b; font-size: 7pt; margin-top: 1mm;">Официальный интегратор Hexagon, PMT, Shining 3D, TopSolid</div>
        </div>
      </div>

      <!-- Outgoing Info & Addressee Block -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5mm; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 2.5mm; padding: 3mm 4mm;">
        <!-- Left: Document Date & Outgoing Number -->
        <div style="font-size: 8.5pt;">
          <div style="color: #64748b; font-size: 7pt; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Исходящий документ</div>
          <div style="font-weight: 800; color: #0f2a59; font-size: 10pt; margin-top: 0.5mm;">№ ${proposalNumber}</div>
          <div style="color: #475569; margin-top: 0.5mm;">от ${dateStr}</div>
        </div>

        <!-- Right: Recipient -->
        <div style="text-align: right; max-width: 65%; font-size: 8.5pt;">
          <div style="color: #64748b; font-size: 7pt; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Кому:</div>
          <div style="font-weight: 800; color: #0f2a59; font-size: 9.5pt;">${effectivePost}</div>
          <div style="font-weight: 700; color: #1e293b;">${companyTitle}</div>
          ${rawLeader ? `<div style="color: #334155; font-weight: 600;">${parsedGreeting.cleanFullName || rawLeader}</div>` : ''}
          ${proposalData.customerInn ? `<div style="font-size: 7.5pt; color: #64748b;">ИНН: ${proposalData.customerInn} ${proposalData.customerKpp ? `| КПП: ${proposalData.customerKpp}` : ''}</div>` : ''}
        </div>
      </div>

      <!-- Main Title -->
      <div style="text-align: center; margin-bottom: 4mm;">
        <h2 style="margin: 0; font-size: 13pt; font-weight: 900; color: #0f2a59; text-transform: uppercase; letter-spacing: 0.5px;">
          ТЕХНИКО-КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ
        </h2>
        <div style="font-size: 8.5pt; color: #475569; font-weight: 600; margin-top: 1mm;">
          ${proposalData.title || 'Поставка измерительного оборудования, внедрение ПО и комплекс метрологических услуг'}
        </div>
        <div style="display: inline-block; margin-top: 1.5mm; font-size: 7.5pt; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 1mm 3mm; border-radius: 1.5mm; border: 1px solid #bae6fd;">
          ${procurementBadge}
        </div>
      </div>

      <!-- Personalized Greeting & Intro Paragraph -->
      <div style="margin-bottom: 4mm; font-size: 9pt; line-height: 1.4;">
        <div style="font-weight: 800; font-size: 10pt; color: #0f2a59; margin-bottom: 1.5mm;">
          ${effectiveGreeting}
        </div>
        <p style="margin: 0; color: #334155; text-align: justify;">
          ООО «ДС-Инжиниринг» свидетельствует Вам свое уважение и направляет настоящее коммерческое предложение, сформированное в строгом соответствии с технологическими задачами Вашего предприятия, требованиями конструкторской документации (ЕСКД/ЕСТД) и действующими государственными стандартами точности.
        </p>
      </div>

      <!-- Specification Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 4mm; font-size: 8pt;">
        <thead>
          <tr style="background-color: #0f2a59; color: #ffffff;">
            <th style="border: 1px solid #0f2a59; padding: 2mm 1.5mm; text-align: center; width: 6mm;">№</th>
            <th style="border: 1px solid #0f2a59; padding: 2mm 2mm; text-align: left;">Наименование оборудования / работ / ПО</th>
            <th style="border: 1px solid #0f2a59; padding: 2mm 2mm; text-align: center; width: 26mm;">Категория</th>
            <th style="border: 1px solid #0f2a59; padding: 2mm 1.5mm; text-align: center; width: 12mm;">Кол-во</th>
            <th style="border: 1px solid #0f2a59; padding: 2mm 2mm; text-align: right; width: 25mm;">Цена за ед., руб.</th>
            <th style="border: 1px solid #0f2a59; padding: 2mm 2mm; text-align: right; width: 28mm;">Сумма, руб. (без НДС)</th>
          </tr>
        </thead>
        <tbody>
          ${renderedItems.map(item => `
            <tr style="background-color: ${item.idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
              <td style="border: 1px solid #cbd5e1; padding: 2mm 1.5mm; text-align: center; font-weight: 600;">${item.idx}</td>
              <td style="border: 1px solid #cbd5e1; padding: 2mm 2mm; text-align: left;">
                <strong style="color: #0f2a59;">${item.name}</strong>
              </td>
              <td style="border: 1px solid #cbd5e1; padding: 2mm 1.5mm; text-align: center; color: #64748b; font-size: 7.5pt;">
                ${item.category}
              </td>
              <td style="border: 1px solid #cbd5e1; padding: 2mm 1.5mm; text-align: center; font-weight: 700;">
                ${item.qty} ${item.unit}
              </td>
              <td style="border: 1px solid #cbd5e1; padding: 2mm 2mm; text-align: right; white-space: nowrap;">
                ${item.price.toLocaleString('ru-RU')} ₽
              </td>
              <td style="border: 1px solid #cbd5e1; padding: 2mm 2mm; text-align: right; font-weight: 700; white-space: nowrap;">
                ${item.rowTotal.toLocaleString('ru-RU')} ₽
              </td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background-color: #f1f5f9; font-size: 8.5pt;">
            <td colspan="5" style="border: 1px solid #cbd5e1; padding: 1.5mm 2mm; text-align: right; font-weight: 600;">Итого без учета НДС:</td>
            <td style="border: 1px solid #cbd5e1; padding: 1.5mm 2mm; text-align: right; font-weight: 700; white-space: nowrap;">
              ${subtotalWithoutVat.toLocaleString('ru-RU')} ₽
            </td>
          </tr>
          <tr style="background-color: #f1f5f9; font-size: 8.5pt;">
            <td colspan="5" style="border: 1px solid #cbd5e1; padding: 1.5mm 2mm; text-align: right; font-weight: 600;">Сумма НДС (20%):</td>
            <td style="border: 1px solid #cbd5e1; padding: 1.5mm 2mm; text-align: right; font-weight: 700; color: #475569; white-space: nowrap;">
              ${vatAmount.toLocaleString('ru-RU')} ₽
            </td>
          </tr>
          <tr style="background-color: #e2e8f0; font-size: 9.5pt; color: #0f2a59;">
            <td colspan="5" style="border: 1px solid #cbd5e1; padding: 2mm 2mm; text-align: right; font-weight: 900;">
              ВСЕГО К ОПЛАТЕ (включая НДС 20%):
            </td>
            <td style="border: 1px solid #cbd5e1; padding: 2mm 2mm; text-align: right; font-weight: 900; color: #0f2a59; white-space: nowrap;">
              ${totalWithVat.toLocaleString('ru-RU')} ₽
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- Commercial Terms & Procurement Block -->
      <div style="font-size: 8pt; line-height: 1.35; margin-bottom: 4mm; background: #f8fafc; padding: 3mm 4mm; border-left: 3.5px solid #0f2a59; border-radius: 1.5mm; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
        <div style="font-weight: 800; font-size: 8.5pt; color: #0f2a59; margin-bottom: 1.5mm; text-transform: uppercase;">
          Условия поставки, гарантия и регламент закупки
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm;">
          <div>
            <div style="margin-bottom: 1mm;">
              <strong>Срок действия предложения:</strong> 30 календарных дней с момента формирования.
            </div>
            <div style="margin-bottom: 1mm;">
              <strong>Срок поставки / готовности:</strong> ${deliveryDays}.
            </div>
            <div>
              <strong>Гарантийные обязательства:</strong> ${warrantyMonths} с момента ввода в эксплуатацию. Авторизованный сервисный центр в г. Самара.
            </div>
          </div>
          <div>
            <div style="margin-bottom: 1mm;">
              <strong>Условия расчетов:</strong> ${procurementText}
            </div>
            <div>
              <strong>Шеф-монтаж и ПНР:</strong> Инструктаж операторов, калибровка по лазерному интерферометру и выдача свидетельств включены в стоимость.
            </div>
          </div>
        </div>
      </div>

      <!-- Signatures, Manager & Official Stamp Seal Block -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 4mm; position: relative;">
        <!-- Left: Manager Info -->
        <div style="font-size: 8.5pt; z-index: 2;">
          <div style="font-weight: 700; color: #64748b; font-size: 7.5pt; text-transform: uppercase;">Ответственный представитель:</div>
          <div style="font-size: 9pt; font-weight: 800; color: #0f2a59; margin-top: 0.5mm;">${managerPost}</div>
          <div style="font-size: 10pt; font-weight: 900; color: #1e293b; margin-top: 0.5mm;">${managerName}</div>
          <div style="color: #475569; font-size: 8pt; margin-top: 1mm;">
            Тел: <strong>${managerPhone}</strong> &nbsp;|&nbsp; E-mail: <strong>${managerEmail}</strong>
          </div>
        </div>

        <!-- Right: Official Seal Stamp & Facsimile Signature -->
        <div style="position: relative; width: 70mm; height: 32mm; display: flex; align-items: flex-end; justify-content: flex-end;">
          ${includeStamp ? `
            <!-- SVG Official Seal & Facsimile -->
            <div style="position: absolute; right: 0; bottom: -2mm; width: 44mm; height: 44mm; pointer-events: none; z-index: 1;">
              <svg viewBox="0 0 200 200" width="100%" height="100%" style="transform: rotate(-12deg); opacity: 0.88;">
                <!-- Outer double circle -->
                <circle cx="100" cy="100" r="95" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-dasharray="8 2" />
                <circle cx="100" cy="100" r="88" fill="none" stroke="#1d4ed8" stroke-width="2" />
                <circle cx="100" cy="100" r="62" fill="none" stroke="#1d4ed8" stroke-width="1.5" />
                
                <!-- Circular text -->
                <path id="circlePathOuter" fill="none" d="M 100, 100 m -78, 0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
                <text fill="#1d4ed8" font-size="9" font-weight="bold" letter-spacing="1.5">
                  <textPath href="#circlePathOuter" startOffset="0%">
                    * РОССИЙСКАЯ ФЕДЕРАЦИЯ * г. САМАРА * ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ
                  </textPath>
                </text>

                <path id="circlePathInner" fill="none" d="M 100, 100 m -48, 0 a 48,48 0 1,0 96,0 a 48,48 0 1,0 -96,0" />
                <text fill="#1d4ed8" font-size="8" font-weight="bold" letter-spacing="1">
                  <textPath href="#circlePathInner" startOffset="0%">
                    ОГРН 1206300057088 * ИНН 6312208119
                  </textPath>
                </text>

                <!-- Center Stamp Content -->
                <g text-anchor="middle" fill="#1d4ed8">
                  <text x="100" y="85" font-size="11" font-weight="900" letter-spacing="1">ООО</text>
                  <text x="100" y="102" font-size="12" font-weight="900" letter-spacing="0.5">«ДС-ИНЖИНИРИНГ»</text>
                  <text x="100" y="116" font-size="7.5" font-weight="bold">ОТДЕЛ ТКП И ПРОДАЖ</text>
                  <line x1="60" y1="122" x2="140" y2="122" stroke="#1d4ed8" stroke-width="1.5" />
                  <text x="100" y="132" font-size="6.5" font-weight="600">ДЛЯ ДОКУМЕНТОВ</text>
                </g>
              </svg>
            </div>

            <!-- Stylized Signature Stroke -->
            <div style="position: absolute; right: 10mm; bottom: 6mm; width: 40mm; height: 18mm; pointer-events: none; z-index: 3;">
              <svg viewBox="0 0 160 70" width="100%" height="100%">
                <path d="M 10,45 Q 30,10 45,35 T 70,25 Q 90,5 110,35 Q 125,50 150,20" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.9;" />
                <path d="M 40,30 L 130,55" fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" style="opacity: 0.85;" />
              </svg>
            </div>
          ` : ''}

          <div style="border-top: 1px solid #1e293b; width: 50mm; text-align: center; font-size: 7.5pt; color: #64748b; padding-top: 1mm; z-index: 2;">
            (подпись / М.П.)
          </div>
        </div>
      </div>

      <!-- Micro Footer -->
      <div style="position: absolute; bottom: 8mm; left: 16mm; right: 16mm; border-top: 1px solid #e2e8f0; padding-top: 2mm; display: flex; justify-content: space-between; font-size: 6.5pt; color: #94a3b8;">
        <span>Технико-коммерческое предложение сформировано автоматической CRM-системой «ДС-Инжиниринг»</span>
        <span>Страница 1 из 1</span>
        <span>ds-enginering.ru</span>
      </div>
    </div>
  `;
};

export const downloadProposalPdf = async (proposal: ProposalPrintData) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const htmlContent = generateProposalHtml(proposal);
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);
      
      iframe.contentWindow?.document.open();
      iframe.contentWindow?.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
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
          const element = iframe.contentWindow?.document.getElementById('proposal-print-area');
          if (!element) throw new Error('Print area not found');

          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.98);
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
          const safeCompanyName = (proposal.customerCompany || 'Заказчик').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_').slice(0, 30);
          const filename = `ТКП_${proposal.number || '000'}_${safeCompanyName}.pdf`;
          pdf.save(filename);

          document.body.removeChild(iframe);
          resolve();
        } catch (error) {
          document.body.removeChild(iframe);
          reject(error);
        }
      }, 700);
    } catch (error) {
      reject(error);
    }
  });
};
