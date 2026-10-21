import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { numberToWordsRu } from './numberToWordsRu';
import { CurrencyCode, getCurrencySymbol } from '../types';

export interface ContractSpecificationItem {
  name: string;
  category?: string;
  quantity: number;
  unit?: string;
  price: number; // Цена без НДС
}

export interface ContractPrintData {
  number?: string;
  date?: string;
  city?: string;
  title?: string;
  contractType?: 'supply' | 'services' | 'maintenance' | 'general';
  
  // Исполнитель / Поставщик (ООО «ДС-Инжиниринг»)
  sellerCompany?: string;
  sellerInn?: string;
  sellerKpp?: string;
  sellerOgrn?: string;
  sellerAddress?: string;
  sellerBank?: string;
  sellerBik?: string;
  sellerAccount?: string;
  sellerCorrAccount?: string;
  sellerSigner?: string;
  sellerSignerPost?: string;
  sellerSignerBasis?: string;

  // Заказчик / Покупатель
  clientCompany?: string;
  clientInn?: string;
  clientKpp?: string;
  clientOgrn?: string;
  clientAddress?: string;
  clientBank?: string;
  clientBik?: string;
  clientAccount?: string;
  clientCorrAccount?: string;
  clientSigner?: string;
  clientSignerPost?: string;
  clientSignerBasis?: string;

  // Финансовые и коммерческие условия
  amount?: number;
  currency?: CurrencyCode;
  vatRate?: number; // 22% по стандарту 2026 года
  vatMode?: 'standard' | 'export_zero' | 'no_vat' | 'custom';
  vatIncluded?: boolean;
  advancePercent?: number; // 50, 70, 100
  paymentTerms?: string;
  deliveryDays?: string | number;
  warrantyMonths?: string | number;

  // Спецификация и объем работ
  scope?: string;
  items?: ContractSpecificationItem[];

  // Оформление
  includeStamp?: boolean;
  includeSignature?: boolean;
  curatorName?: string;
  curatorPhone?: string;
}

export const generateContractHtml = (data: ContractPrintData): string => {
  const contractNumber = data.number || `ДОГ-${new Date().getFullYear()}/001`;
  const dateStr = data.date || new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  const city = data.city || 'г. Самара';

  const sellerCompany = data.sellerCompany || 'Общество с ограниченной ответственностью «ДС-Инжиниринг»';
  const sellerSignerPost = data.sellerSignerPost || 'Генерального директора';
  const sellerSigner = data.sellerSigner || 'Скобелева Александра Сергеевича';
  const sellerSignerBasis = data.sellerSignerBasis || 'Устава';

  const clientCompany = data.clientCompany || 'ООО «Предприятие-Заказчик»';
  const clientSignerPost = data.clientSignerPost || 'Генерального директора';
  const clientSigner = data.clientSigner || 'Иванова Ивана Ивановича';
  const clientSignerBasis = data.clientSignerBasis || 'Устава';

  // Режим и ставка НДС (стандарт 2026 г.: 22%)
  const isNoVat = data.vatMode === 'no_vat';
  const isExportZero = data.vatMode === 'export_zero' || data.vatRate === 0;
  const vatRate = isNoVat ? 0 : isExportZero ? 0 : (data.vatRate !== undefined ? data.vatRate : 22);

  // Спецификация
  const rawItems = data.items && data.items.length > 0 ? data.items : [
    {
      name: data.title || 'Поставка координатно-измерительного оборудования, пусконаладочные работы и поверка во ФГИС «АРШИН»',
      quantity: 1,
      unit: 'компл.',
      price: Math.round((data.amount || 2500000) / (1 + vatRate / 100))
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
      qty,
      unit: item.unit || 'шт.',
      price,
      rowTotal
    };
  });

  const vatAmount = (isNoVat || isExportZero) ? 0 : Math.round(subtotalWithoutVat * (vatRate / 100));
  const totalWithVat = subtotalWithoutVat + vatAmount;
  const currencySymbol = getCurrencySymbol(data.currency || 'RUB');
  const totalInWords = numberToWordsRu(totalWithVat);

  let vatClause = `в том числе НДС ${vatRate}% — ${vatAmount.toLocaleString('ru-RU')} ${currencySymbol}`;
  if (isExportZero) {
    vatClause = 'НДС 0% (Экспорт / Соседние страны / ЕАЭС в соответствии со ст. 164 НК РФ)';
  } else if (isNoVat) {
    vatClause = 'НДС не облагается (на основании ст. 346.11 НК РФ / УСН)';
  }

  const advancePercent = data.advancePercent || 50;
  const advanceAmount = Math.round(totalWithVat * (advancePercent / 100));
  const remainAmount = totalWithVat - advanceAmount;

  const deliveryDays = data.deliveryDays || '15 (пятнадцать) рабочих дней';
  const warrantyMonths = data.warrantyMonths || '24 (двадцать четыре) месяца';
  const includeStamp = data.includeStamp !== false;

  return `
    <div id="contract-print-area" style="
      width: 210mm;
      min-height: 297mm;
      padding: 18mm 20mm;
      background: #ffffff;
      color: #1e293b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      box-sizing: border-box;
      position: relative;
      font-size: 9.5pt;
      line-height: 1.45;
    ">
      <!-- Header / Requisites bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f2a59; padding-bottom: 3mm; margin-bottom: 5mm;">
        <div style="display: flex; align-items: center; gap: 3mm;">
          <div style="width: 8mm; height: 8mm; background: #0f2a59; border-radius: 1.5mm; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 11pt;">
            ДС
          </div>
          <div>
            <div style="font-size: 11pt; color: #0f2a59; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
              ООО «ДС-ИНЖИНИРИНГ»
            </div>
            <div style="font-size: 7.5pt; color: #64748b;">
              Координатно-измерительные машины • 3D-контроль • Метрология • ФГИС «АРШИН»
            </div>
          </div>
        </div>
        <div style="text-align: right; font-size: 7.5pt; color: #475569;">
          <div>Тел: +7 (846) 954-02-92 | +7 (937) 984-61-51</div>
          <div>E-mail: info@ds-enginering.ru | www.ds-enginering.ru</div>
        </div>
      </div>

      <!-- Contract Header -->
      <div style="text-align: center; margin-bottom: 5mm;">
        <div style="font-size: 13pt; font-weight: 900; color: #0f2a59; text-transform: uppercase; letter-spacing: 0.5px;">
          ДОГОВОР № ${contractNumber}
        </div>
        <div style="font-size: 10pt; font-weight: 700; color: #334155; margin-top: 1mm;">
          ${data.title || 'на поставку измерительного оборудования и оказание инжиниринговых услуг'}
        </div>
      </div>

      <!-- City and Date -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 5mm; font-weight: 700; font-size: 9pt; color: #334155;">
        <div>${city}</div>
        <div>«${dateStr}»</div>
      </div>

      <!-- Preamble -->
      <div style="text-align: justify; margin-bottom: 4mm;">
        <strong>${sellerCompany}</strong>, именуемое в дальнейшем <strong>«Поставщик»</strong> («Исполнитель»), в лице ${sellerSignerPost} <strong>${sellerSigner}</strong>, действующего на основании ${sellerSignerBasis}, с одной стороны, и
        <br/>
        <strong>${clientCompany}</strong>, именуемое в дальнейшем <strong>«Заказчик»</strong> («Покупатель»), в лице ${clientSignerPost} <strong>${clientSigner}</strong>, действующего на основании ${clientSignerBasis}, с другой стороны, совместно именуемые «Стороны», а по отдельности «Сторона», заключили настоящий Договор о нижеследующем:
      </div>

      <!-- 1. Предмет Договора -->
      <div style="margin-bottom: 3.5mm;">
        <div style="font-weight: 800; color: #0f2a59; font-size: 9.5pt; margin-bottom: 1.5mm; text-transform: uppercase;">
          1. Предмет Договора
        </div>
        <div style="text-align: justify; font-size: 9pt;">
          1.1. Поставщик обязуется поставить, выполнить пусконаладочные работы и передать в собственность Заказчика измерительное оборудование, специализированное программное обеспечение и/или оказать инжиниринговые услуги в соответствии со Спецификацией (Приложение №1 к настоящему Договору), а Заказчик обязуется принять и своевременно оплатить их.<br/>
          1.2. Качество, комплектность и метрологические характеристики поставляемого оборудования соответствуют государственным стандартам РФ, ГОСТ Р ИСО 10360, технической документации заводов-изготовителей и свидетельствам о поверке во ФГИС «АРШИН».<br/>
          1.3. ${data.scope ? `Особые условия и объем работ: ${data.scope}.` : 'Поставка включает ввод в эксплуатацию, контрольные испытания на прецизионных мерах длины и базовый инструктаж специалистов Заказчика.'}
        </div>
      </div>

      <!-- 2. Стоимость работ и порядок расчетов -->
      <div style="margin-bottom: 3.5mm;">
        <div style="font-weight: 800; color: #0f2a59; font-size: 9.5pt; margin-bottom: 1.5mm; text-transform: uppercase;">
          2. Стоимость Договора и порядок расчетов
        </div>
        <div style="text-align: justify; font-size: 9pt;">
          2.1. Общая стоимость поставляемого оборудования и услуг по настоящему Договору составляет <strong>${totalWithVat.toLocaleString('ru-RU')} ${currencySymbol}</strong> (${totalInWords}), <strong>${vatClause}</strong>.<br/>
          2.2. Расчеты по настоящему Договору осуществляются в безналичном порядке путем перечисления денежных средств на расчетный счет Поставщика в следующем порядке:<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;2.2.1. Авансовый платеж в размере <strong>${advancePercent}%</strong> от общей стоимости Договора, что составляет <strong>${advanceAmount.toLocaleString('ru-RU')} ${currencySymbol}</strong>, оплачивается Заказчиком в течение 5 (пяти) банковских дней с момента подписания Договора.<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;2.2.2. Окончательный расчет в размере <strong>${100 - advancePercent}%</strong>, что составляет <strong>${remainAmount.toLocaleString('ru-RU')} ${currencySymbol}</strong>, осуществляется Заказчиком в течение 5 (пяти) банковских дней после уведомления о готовности к отгрузке и подписания акта сдачи-приемки.<br/>
          2.3. Датой оплаты считается дата зачисления денежных средств на расчетный счет Поставщика.
        </div>
      </div>

      <!-- 3. Сроки и условия поставки -->
      <div style="margin-bottom: 3.5mm;">
        <div style="font-weight: 800; color: #0f2a59; font-size: 9.5pt; margin-bottom: 1.5mm; text-transform: uppercase;">
          3. Сроки и условия поставки
        </div>
        <div style="text-align: justify; font-size: 9pt;">
          3.1. Срок поставки Оборудования составляет <strong>${deliveryDays}</strong> с даты поступления авансового платежа на расчетный счет Поставщика.<br/>
          3.2. Доставка осуществляется силами специализированной транспортной компании в термостатированных ударопрочных контейнерах до адреса Заказчика.<br/>
          3.3. Приемка оборудования по количеству и комплектности производится в момент доставки с подписанием товарно-транспортной накладной (УПД).
        </div>
      </div>

      <!-- 4. Гарантийные обязательства -->
      <div style="margin-bottom: 3.5mm;">
        <div style="font-weight: 800; color: #0f2a59; font-size: 9.5pt; margin-bottom: 1.5mm; text-transform: uppercase;">
          4. Гарантийные обязательства и сервис
        </div>
        <div style="text-align: justify; font-size: 9pt;">
          4.1. Гарантийный срок на поставляемое оборудование составляет <strong>${warrantyMonths}</strong> со дня подписания двустороннего акта ввода в эксплуатацию.<br/>
          4.2. Поставщик гарантирует бесплатное сервисное обслуживание, замену дефектных оптико-электронных и механических узлов, а также оперативную техническую поддержку сертифицированными инженерами ООО «ДС-Инжиниринг».
        </div>
      </div>

      <!-- 5. Ответственность сторон -->
      <div style="margin-bottom: 4mm;">
        <div style="font-weight: 800; color: #0f2a59; font-size: 9.5pt; margin-bottom: 1.5mm; text-transform: uppercase;">
          5. Ответственность сторон и разрешение споров
        </div>
        <div style="text-align: justify; font-size: 9pt;">
          5.1. За неисполнение или ненадлежащее исполнение обязательств Стороны несут ответственность в соответствии с законодательством Российской Федерации.<br/>
          5.2. Все споры и разногласия разрешаются путем переговоров с обязательным соблюдением претензионного порядка (срок ответа на претензию — 10 рабочих дней). При недостижении согласия спор передается в Арбитражный суд по месту нахождения Истца.
        </div>
      </div>

      <!-- Requisites & Signatures Table -->
      <div style="margin-top: 5mm; border-top: 2px solid #0f2a59; padding-top: 4mm;">
        <div style="font-weight: 800; color: #0f2a59; font-size: 9.5pt; margin-bottom: 3mm; text-transform: uppercase; text-align: center;">
          6. Адреса, банковские реквизиты и подписи Сторон
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; font-size: 8pt; line-height: 1.35;">
          <!-- Seller Requisites -->
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 2mm; padding: 3mm;">
            <div style="font-weight: 800; color: #0f2a59; margin-bottom: 1.5mm; border-bottom: 1px solid #e2e8f0; padding-bottom: 1mm;">
              ПОСТАВЩИК / ИСПОЛНИТЕЛЬ:
            </div>
            <div><strong>ООО «ДС-Инжиниринг»</strong></div>
            <div>Юр. адрес: 443051, РФ, г. Самара, ул. Свободы, д. 198</div>
            <div>ИНН: 6312025587 / КПП: 631201001</div>
            <div>ОГРН: 1026300777986</div>
            <div>Р/с: 40702810314500027317</div>
            <div>Банк: ООО «Банк Точка» (филиал г. Москва)</div>
            <div>БИК: 044525104 / Корр. счет: 30101810745374525104</div>
            <div>Тел: +7 (846) 954-02-92, +7 (937) 984-61-51</div>
            <div>E-mail: info@ds-enginering.ru</div>

            <!-- Signature & Stamp block -->
            <div style="margin-top: 5mm; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2mm;">
                <div>Генеральный директор</div>
                <div style="border-bottom: 1px solid #334155; width: 35mm; text-align: center;">
                  ${data.includeSignature !== false ? '<span style="font-family: cursive; color: #1e3a8a; font-size: 11pt;">Скобелев А.С.</span>' : ''}
                </div>
                <div>/ Скобелев А.С. /</div>
              </div>
              <div style="font-size: 6.5pt; color: #64748b; text-align: center;">М.П.</div>

              ${includeStamp ? `
                <div style="
                  position: absolute;
                  bottom: -6mm;
                  left: 12mm;
                  width: 32mm;
                  height: 32mm;
                  border: 2px dashed #1e3a8a;
                  border-radius: 50%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: #1e3a8a;
                  font-size: 6pt;
                  font-weight: 700;
                  text-align: center;
                  opacity: 0.85;
                  transform: rotate(-12deg);
                  pointer-events: none;
                  background: rgba(30, 58, 138, 0.04);
                ">
                  <div style="font-size: 5.5pt; text-transform: uppercase;">РОССИЙСКАЯ ФЕДЕРАЦИЯ</div>
                  <div style="font-size: 7.5pt; font-weight: 900; margin: 1mm 0;">ООО «ДС-ИНЖИНИРИНГ»</div>
                  <div style="font-size: 5.5pt;">ОГРН 1026300777986</div>
                  <div style="font-size: 5.5pt;">г. САМАРА</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Client Requisites -->
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 2mm; padding: 3mm;">
            <div style="font-weight: 800; color: #0f2a59; margin-bottom: 1.5mm; border-bottom: 1px solid #e2e8f0; padding-bottom: 1mm;">
              ЗАКАЗЧИК / ПОКУПАТЕЛЬ:
            </div>
            <div><strong>${clientCompany}</strong></div>
            <div>Юр. адрес: ${data.clientAddress || 'РФ, по ЕГРЮЛ'}</div>
            <div>ИНН: ${data.clientInn || '7701234567'} / КПП: ${data.clientKpp || '770101001'}</div>
            <div>ОГРН: ${data.clientOgrn || '1037700112233'}</div>
            <div>Р/с: ${data.clientAccount || '40702810000000000000'}</div>
            <div>Банк: ${data.clientBank || 'ПАО Сбербанк'}</div>
            <div>БИК: ${data.clientBik || '044525225'} / Корр: ${data.clientCorrAccount || '30101810400000000225'}</div>

            <!-- Client Signature block -->
            <div style="margin-top: 5mm;">
              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2mm;">
                <div>${clientSignerPost}</div>
                <div style="border-bottom: 1px solid #334155; width: 35mm; text-align: center;">&nbsp;</div>
                <div>/ ${clientSigner} /</div>
              </div>
              <div style="font-size: 6.5pt; color: #64748b; text-align: center;">М.П.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Page Break for Annex 1 (Specification) -->
      <div style="page-break-before: always; margin-top: 15mm; border-top: 2px dashed #cbd5e1; padding-top: 8mm;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4mm;">
          <div style="font-size: 8pt; color: #64748b;">
            Приложение №1<br/>
            к Договору № ${contractNumber}<br/>
            от «${dateStr}»
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11pt; font-weight: 800; color: #0f2a59; text-transform: uppercase;">
              СПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ И УСЛУГ
            </div>
          </div>
        </div>

        <!-- Specification Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 4mm;">
          <thead>
            <tr style="background: #0f2a59; color: white;">
              <th style="padding: 2mm 2.5mm; border: 1px solid #0f2a59; text-align: center; width: 8mm;">№</th>
              <th style="padding: 2mm 3mm; border: 1px solid #0f2a59; text-align: left;">Наименование оборудования / услуг</th>
              <th style="padding: 2mm 2mm; border: 1px solid #0f2a59; text-align: center; width: 14mm;">Кол-во</th>
              <th style="padding: 2mm 2mm; border: 1px solid #0f2a59; text-align: center; width: 12mm;">Ед.</th>
              <th style="padding: 2mm 3mm; border: 1px solid #0f2a59; text-align: right; width: 26mm;">Цена без НДС (${currencySymbol})</th>
              <th style="padding: 2mm 3mm; border: 1px solid #0f2a59; text-align: right; width: 28mm;">Сумма без НДС (${currencySymbol})</th>
            </tr>
          </thead>
          <tbody>
            ${renderedItems.map(item => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 2mm 2.5mm; border: 1px solid #e2e8f0; text-align: center;">${item.idx}</td>
                <td style="padding: 2mm 3mm; border: 1px solid #e2e8f0; font-weight: 600;">${item.name}</td>
                <td style="padding: 2mm 2mm; border: 1px solid #e2e8f0; text-align: center;">${item.qty}</td>
                <td style="padding: 2mm 2mm; border: 1px solid #e2e8f0; text-align: center;">${item.unit}</td>
                <td style="padding: 2mm 3mm; border: 1px solid #e2e8f0; text-align: right;">${item.price.toLocaleString('ru-RU')}</td>
                <td style="padding: 2mm 3mm; border: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${item.rowTotal.toLocaleString('ru-RU')}</td>
              </tr>
            `).join('')}
            <!-- Subtotal -->
            <tr style="background: #f8fafc;">
              <td colspan="5" style="padding: 2mm 3mm; border: 1px solid #e2e8f0; text-align: right; font-weight: 700;">Итого без НДС:</td>
              <td style="padding: 2mm 3mm; border: 1px solid #e2e8f0; text-align: right; font-weight: 800;">${subtotalWithoutVat.toLocaleString('ru-RU')} ${currencySymbol}</td>
            </tr>
            <!-- VAT -->
            <tr style="background: #f8fafc;">
              <td colspan="5" style="padding: 2mm 3mm; border: 1px solid #e2e8f0; text-align: right; font-weight: 700;">
                ${isExportZero ? 'НДС 0% (Экспорт / ЕАЭС):' : isNoVat ? 'НДС (не облагается):' : `НДС ${vatRate}%:`}
              </td>
              <td style="padding: 2mm 3mm; border: 1px solid #e2e8f0; text-align: right; font-weight: 800;">
                ${vatAmount.toLocaleString('ru-RU')} ${currencySymbol}
              </td>
            </tr>
            <!-- Total with VAT -->
            <tr style="background: #0f2a59; color: white;">
              <td colspan="5" style="padding: 2.5mm 3mm; border: 1px solid #0f2a59; text-align: right; font-weight: 900; font-size: 9pt;">
                ВСЕГО С УЧЕТОМ НДС (${vatRate}%):
              </td>
              <td style="padding: 2.5mm 3mm; border: 1px solid #0f2a59; text-align: right; font-weight: 900; font-size: 9.5pt;">
                ${totalWithVat.toLocaleString('ru-RU')} ${currencySymbol}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Signatures for Annex 1 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; margin-top: 6mm; font-size: 8pt;">
          <div>
            <div style="font-weight: 700; color: #0f2a59; margin-bottom: 2mm;">ОТ ПОСТАВЩИКА:</div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #334155; padding-bottom: 1mm;">
              <span>Ген. директор</span>
              <span>/ Скобелев А.С. /</span>
            </div>
            <div style="font-size: 6.5pt; color: #64748b; margin-top: 1mm;">М.П.</div>
          </div>
          <div>
            <div style="font-weight: 700; color: #0f2a59; margin-bottom: 2mm;">ОТ ЗАКАЗЧИКА:</div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #334155; padding-bottom: 1mm;">
              <span>${clientSignerPost}</span>
              <span>/ ${clientSigner} /</span>
            </div>
            <div style="font-size: 6.5pt; color: #64748b; margin-top: 1mm;">М.П.</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Downloads high quality A4 PDF using html2canvas & jsPDF
 */
export async function downloadContractPdf(data: ContractPrintData): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '210mm';
  container.style.zIndex = '-1000';
  container.innerHTML = generateContractHtml(data);
  document.body.appendChild(container);

  try {
    const printEl = container.querySelector('#contract-print-area') as HTMLElement;
    if (!printEl) throw new Error('Contract print area element not found');

    const canvas = await html2canvas(printEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const safeNumber = (data.number || 'contract').replace(/[/\\?%*:|"<>]/g, '_');
    pdf.save(`Договор_${safeNumber}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Prints contract directly via iframe
 */
export function printContract(data: ContractPrintData): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Договор ${data.number || ''}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; background: #fff; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        ${generateContractHtml(data)}
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 350);
}
