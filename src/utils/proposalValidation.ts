/**
 * Pre-flight Validation for Russian Commercial Documents (ТКП / ТЗ / Спецификация)
 * ООО «ДС-Инжиниринг»
 */

import { CommercialProposalData } from '../types/proposalEditor';

export interface ProposalValidationResult {
  isValid: boolean;
  canGeneratePdf: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProposalData(doc: CommercialProposalData): ProposalValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Organization Requisites Check
  const org = doc.organization;
  if (!org || !org.name?.trim()) {
    errors.push('Не указано наименование организации-исполнителя (ООО «ДС-Инжиниринг»).');
  }
  if (!org?.address?.trim()) {
    warnings.push('Не заполнен юридический адрес организации. Заполните данные в профиле организации.');
  }
  if (!org?.inn?.trim()) {
    warnings.push('Не указан ИНН организации-исполнителя.');
  }

  // 2. Customer Requisites Check
  if (!doc.customerCompany?.trim()) {
    errors.push('Не указано наименование предприятия Заказчика.');
  }
  if (!doc.customerInn?.trim()) {
    warnings.push('Не указан ИНН Заказчика. Рекомендуется заполнить через поиск DaData.');
  }
  if (!doc.outgoingNumber?.trim()) {
    errors.push('Не указан исходящий номер документа.');
  }
  if (!doc.date?.trim()) {
    errors.push('Не указана дата формирования документа.');
  }

  // 3. Validity Period Check
  if (doc.documentType === 'main' && doc.validUntilDate) {
    // Parse DD.MM.YYYY
    const parts = doc.validUntilDate.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const validDate = new Date(year, month, day);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (validDate < now) {
        warnings.push(`Срок действия предложения (${doc.validUntilDate}) истек относительно текущей даты.`);
      }
    }
  }

  // 4. Type Specific Checks
  if (doc.documentType === 'technical_task') {
    const ttBlocks = (doc.blocks || []).filter(b => b.type === 'tt_section' || /^[0-9]\.\s+/.test(b.title || ''));
    if (ttBlocks.length < 5) {
      warnings.push(`В Техническом задании обнаружено ${ttBlocks.length} из 5 канонических разделов. Рекомендуется сохранить все 5 разделов по ГОСТ.`);
    }
  } else if (doc.documentType === 'specification') {
    const specBlocks = (doc.blocks || []).filter(b => b.type === 'specification');
    const totalItems = specBlocks.reduce((acc, b) => acc + (b.items?.length || 0), 0);
    if (totalItems === 0) {
      errors.push('Спецификация поставок не содержит ни одной товарной позиции.');
    }
  }

  // 5. Arithmetic / NaN check
  const allSpecItems = (doc.blocks || [])
    .filter(b => b.type === 'specification')
    .flatMap(b => b.items || []);
  
  for (const it of allSpecItems) {
    if (isNaN(it.price) || it.price < 0) {
      errors.push(`Некорректная цена позиции "${it.name}".`);
    }
    if (isNaN(it.quantity) || it.quantity <= 0) {
      errors.push(`Некорректное количество позиции "${it.name}".`);
    }
  }

  const canGeneratePdf = errors.length === 0;
  const isValid = errors.length === 0 && warnings.length === 0;

  return {
    isValid,
    canGeneratePdf,
    errors,
    warnings
  };
}
