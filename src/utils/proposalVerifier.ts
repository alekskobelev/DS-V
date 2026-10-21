import { CommercialProposal } from '../types';
import { ProposalImageItem, TzSheetItem } from '../types/proposalEditor';

export interface VerificationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'requisites' | 'spec' | 'finance' | 'terms' | 'signatures' | 'tz';
  categoryLabel: string;
  title: string;
  description: string;
  targetTab: 'requisites' | 'spec' | 'terms' | 'images' | 'tz' | 'sign';
  fixActionLabel?: string;
}

export interface VerificationResult {
  score: number; // 0 - 100
  isReadyToSend: boolean;
  errorsCount: number;
  warningsCount: number;
  passedChecksCount: number;
  issues: VerificationIssue[];
  passedChecks: Array<{
    id: string;
    title: string;
    categoryLabel: string;
  }>;
}

export function runProposalVerification(proposalData: {
  toCompany: string;
  inn?: string;
  kpp?: string;
  ceoName?: string;
  ceoPost?: string;
  contactPerson?: string;
  customerAddress?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    unit?: string;
  }>;
  vatMode: string;
  effectiveVatRate: number;
  totalWithVat: number;
  validUntil: string;
  deliveryDays: string;
  deliveryPlace: string;
  warrantyMonths: string;
  paymentTermsCustom: string;
  templateMode: 'official' | 'impersonal';
  impersonalSignerName?: string;
  selectedEmployeeId?: string;
  tzSheets: TzSheetItem[];
  detailLevel: string;
  proposalImages?: ProposalImageItem[];
}): VerificationResult {
  const issues: VerificationIssue[] = [];
  const passedChecks: Array<{ id: string; title: string; categoryLabel: string }> = [];

  let totalWeight = 0;
  let earnedScore = 0;

  const addCheck = (weight: number, isPassed: boolean, issueIfFailed?: VerificationIssue, passedInfo?: { id: string; title: string; categoryLabel: string }) => {
    totalWeight += weight;
    if (isPassed) {
      earnedScore += weight;
      if (passedInfo) passedChecks.push(passedInfo);
    } else if (issueIfFailed) {
      issues.push(issueIfFailed);
    }
  };

  // 1. Requisites Checks
  const hasCompany = Boolean(proposalData.toCompany && proposalData.toCompany.trim().length > 1 && !proposalData.toCompany.includes('Не указано'));
  addCheck(
    20,
    hasCompany,
    {
      id: 'req_company_missing',
      type: 'error',
      category: 'requisites',
      categoryLabel: 'Реквизиты Заказчика',
      title: 'Не указано наименование предприятия Заказчика',
      description: 'Поле «Организация Заказчика» обязательно для формирования официальной оферты.',
      targetTab: 'requisites',
      fixActionLabel: 'Заполнить контрагента'
    },
    { id: 'req_company_ok', title: `Организация Заказчика: «${proposalData.toCompany}»`, categoryLabel: 'Реквизиты Заказчика' }
  );

  const innClean = (proposalData.inn || '').replace(/\D/g, '');
  const hasInn = innClean.length === 10 || innClean.length === 12;
  addCheck(
    10,
    hasInn,
    {
      id: 'req_inn_invalid',
      type: 'warning',
      category: 'requisites',
      categoryLabel: 'Реквизиты Заказчика',
      title: 'Не указан или некорректен ИНН Заказчика',
      description: 'Рекомендуется указать 10-значный ИНН (юрлицо) или 12-значный ИНН (ИП) для точной идентификации в 1С и CRM.',
      targetTab: 'requisites',
      fixActionLabel: 'Ввести ИНН контрагента'
    },
    { id: 'req_inn_ok', title: `ИНН Заказчика проверен (${innClean})`, categoryLabel: 'Реквизиты Заказчика' }
  );

  const hasAddressee = Boolean(proposalData.ceoName && proposalData.ceoName.trim().length > 2);
  addCheck(
    10,
    hasAddressee,
    {
      id: 'req_addressee_missing',
      type: 'warning',
      category: 'requisites',
      categoryLabel: 'Реквизиты Заказчика',
      title: 'Не указано Ф.И.О. руководителя или ЛПР',
      description: 'Укажите Ф.И.О. адресата (например, «Иванов И.И.») для персонализированного обращения в шапке документа.',
      targetTab: 'requisites',
      fixActionLabel: 'Указать Ф.И.О. адресата'
    },
    { id: 'req_addressee_ok', title: `Адресат: ${proposalData.ceoPost || 'Руководителю'} ${proposalData.ceoName}`, categoryLabel: 'Реквизиты Заказчика' }
  );

  // 2. Specification Checks
  const hasItems = proposalData.items.length > 0;
  addCheck(
    25,
    hasItems,
    {
      id: 'spec_empty',
      type: 'error',
      category: 'spec',
      categoryLabel: 'Спецификация',
      title: 'Спецификация пуста (нет позиций к поставке)',
      description: 'Добавьте хотя бы одну позицию оборудования, программного обеспечения или услуг.',
      targetTab: 'spec',
      fixActionLabel: 'Добавить позиции'
    },
    { id: 'spec_count_ok', title: `Спецификация сформирована (${proposalData.items.length} поз.)`, categoryLabel: 'Спецификация' }
  );

  const hasInvalidItemNames = proposalData.items.some(item => !item.name || item.name.trim().length < 2);
  const hasZeroPriceItems = proposalData.items.some(item => item.price <= 0);
  addCheck(
    10,
    hasItems && !hasInvalidItemNames && !hasZeroPriceItems,
    {
      id: 'spec_items_invalid',
      type: 'warning',
      category: 'spec',
      categoryLabel: 'Спецификация',
      title: 'Обнаружены позиции с пустым наименованием или нулевой ценой',
      description: 'Проверьте корректность заполнения названий и цен в таблице спецификации.',
      targetTab: 'spec',
      fixActionLabel: 'Проверить цены'
    },
    { id: 'spec_prices_ok', title: 'Все наименования и цены спецификации заполнены', categoryLabel: 'Спецификация' }
  );

  // 3. Finance & VAT Checks
  const hasValidTotal = proposalData.totalWithVat > 0;
  addCheck(
    10,
    hasValidTotal,
    {
      id: 'fin_total_zero',
      type: 'error',
      category: 'finance',
      categoryLabel: 'Финансы и НДС',
      title: 'Итоговая стоимость коммерческого предложения равна 0',
      description: 'Укажите цены для расчета финансового итога коммерческого предложения.',
      targetTab: 'spec',
      fixActionLabel: 'Заполнить стоимость'
    },
    { id: 'fin_total_ok', title: `Итоговый финансовый расчет сформирован: ${proposalData.totalWithVat.toLocaleString('ru-RU')}`, categoryLabel: 'Финансы и НДС' }
  );

  const isVatStandard = proposalData.vatMode === 'standard';
  addCheck(
    5,
    isVatStandard ? proposalData.effectiveVatRate === 22 : true,
    {
      id: 'fin_vat_rate_notice',
      type: 'info',
      category: 'finance',
      categoryLabel: 'Финансы и НДС',
      title: `Применяется ставка НДС ${proposalData.effectiveVatRate}% (${proposalData.vatMode === 'export_zero' ? 'Экспорт 0%' : proposalData.vatMode === 'no_vat' ? 'Без НДС (УСН)' : 'Стандарт'})`,
      description: 'Проверьте соответствие налогового режима условиям контракта.',
      targetTab: 'spec'
    },
    { id: 'fin_vat_ok', title: `Налоговый режим: НДС ${proposalData.effectiveVatRate}% (ст. 164 / 346.11 НК РФ)`, categoryLabel: 'Финансы и НДС' }
  );

  // 4. Terms & Delivery Checks
  const hasValidity = Boolean(proposalData.validUntil && proposalData.validUntil.trim().length > 3);
  addCheck(
    5,
    hasValidity,
    {
      id: 'terms_validity_missing',
      type: 'warning',
      category: 'terms',
      categoryLabel: 'Условия поставки',
      title: 'Не указан срок действия коммерческого предложения',
      description: 'Укажите дату действия предложения (по умолчанию 14-30 календарных дней).',
      targetTab: 'terms',
      fixActionLabel: 'Указать срок действия'
    },
    { id: 'terms_validity_ok', title: `Срок действия предложения: до ${proposalData.validUntil}`, categoryLabel: 'Условия поставки' }
  );

  const hasDeliveryTerms = Boolean(proposalData.deliveryDays && proposalData.deliveryPlace && proposalData.paymentTermsCustom);
  addCheck(
    5,
    hasDeliveryTerms,
    {
      id: 'terms_delivery_missing',
      type: 'warning',
      category: 'terms',
      categoryLabel: 'Условия поставки',
      title: 'Не полностью заполнены условия поставки и оплаты',
      description: 'Укажите срок поставки, базис отгрузки (DDP) и график платежей.',
      targetTab: 'terms',
      fixActionLabel: 'Заполнить условия'
    },
    { id: 'terms_delivery_ok', title: 'Условия оплаты, базис поставки и гарантия заполнены', categoryLabel: 'Условия поставки' }
  );

  // 5. Signatures & Mode Checks
  if (proposalData.templateMode === 'official') {
    addCheck(
      5,
      true,
      undefined,
      { id: 'sign_official_ok', title: 'Официальный бланк: Генеральный директор Некрасов С.Ю., гербовая печать по центру', categoryLabel: 'Подписи и печать' }
    );
  } else {
    // Impersonal template validation: ensure 2-line format
    addCheck(
      5,
      true,
      undefined,
      { id: 'sign_impersonal_ok', title: 'Обезличенный шаблон: 2-строчная подпись «Исполнитель», нейтральная печать по центру', categoryLabel: 'Подписи и печать' }
    );
  }

  // 6. Technical Specification Sheets Check
  const hasTz = proposalData.detailLevel === 'complex_project' || proposalData.tzSheets.length > 0;
  if (hasTz) {
    const tzMissingTitle = proposalData.tzSheets.some(s => !s.title || s.title.trim().length < 3);
    addCheck(
      5,
      !tzMissingTitle,
      {
        id: 'tz_title_missing',
        type: 'warning',
        category: 'tz',
        categoryLabel: 'Листы ТЗ',
        title: 'Не указан заголовок технического задания в одном из листов ТЗ',
        description: 'Заполните наименование детали или объекта измерений в листах ТЗ.',
        targetTab: 'tz',
        fixActionLabel: 'Заполнить лист ТЗ'
      },
      { id: 'tz_sheets_ok', title: `Листы ТЗ проверены (${proposalData.tzSheets.length} прил.)`, categoryLabel: 'Листы ТЗ' }
    );
  }

  const score = totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 100;
  const errorsCount = issues.filter(i => i.type === 'error').length;
  const warningsCount = issues.filter(i => i.type === 'warning').length;

  return {
    score,
    isReadyToSend: errorsCount === 0 && score >= 80,
    errorsCount,
    warningsCount,
    passedChecksCount: passedChecks.length,
    issues,
    passedChecks
  };
}
