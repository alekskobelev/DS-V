import { useMemo, useState, useCallback } from 'react';
import { 
  ServiceItem, 
  ServiceValidationResult, 
  ServiceValidationError,
  validateServiceItem,
  validateEquipmentItem,
  validateEquipmentArray,
  validateContact
} from '../data/services';

export interface UseServiceFormValidationOptions {
  /**
   * Validate only touched fields or all fields in real-time
   * @default true (live real-time validation)
   */
  liveValidation?: boolean;
}

export interface FieldValidationStatus {
  hasError: boolean;
  errorMessage?: string;
  errorClassName: string;
  labelClassName: string;
}

export interface UseServiceFormValidationReturn {
  isValid: boolean;
  isSaveDisabled: boolean;
  validationResult: ServiceValidationResult;
  errors: ServiceValidationError[];
  errorMap: Record<string, string>;
  touchedFields: Record<string, boolean>;
  touchField: (field: string) => void;
  touchAllFields: () => void;
  resetTouched: () => void;
  getFieldValidation: (field: string) => FieldValidationStatus;
  getEquipmentValidation: (equipment: string[] | string) => { isValid: boolean; errors: string[] };
  getContactValidation: (contact: unknown) => { isValid: boolean; errors: string[] };
  errorCount: number;
}

/**
 * Хук валидации формы редактирования инжиниринговой услуги (ServiceItem) для CmsPage.
 * 
 * - При каждом изменении полей вызывает функцию валидации validateServiceItem
 * - Подсвечивает некорректные поля красным цветом (border-rose-500, ring-rose-500)
 * - Блокирует кнопку «Сохранить» при наличии ошибок данных
 * - Предоставляет детальный статус валидации для массивов оборудования, этапов и контактов
 */
export function useServiceFormValidation(
  formData: Partial<ServiceItem>,
  options: UseServiceFormValidationOptions = {}
): UseServiceFormValidationReturn {
  const { liveValidation = true } = options;
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const touchField = useCallback((field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  }, []);

  const touchAllFields = useCallback(() => {
    setTouchedFields({
      title: true,
      category: true,
      shortDesc: true,
      fullDesc: true,
      calculatorType: true,
      basePriceText: true,
      equipmentUsed: true,
      deliverables: true,
      steps: true,
      contacts: true,
      image: true,
      brochureUrl: true,
      fileUrl: true,
      general: true
    });
  }, []);

  const resetTouched = useCallback(() => {
    setTouchedFields({});
  }, []);

  // Полная валидация объекта на каждом рендере / изменении полей
  const validationResult = useMemo<ServiceValidationResult>(() => {
    return validateServiceItem(formData);
  }, [formData]);

  const { isValid, errors, errorMap } = validationResult;
  const isSaveDisabled = !isValid;
  const errorCount = errors.length;

  /**
   * Получение статуса подсветки и сообщения об ошибке для конкретного поля
   */
  const getFieldValidation = useCallback((field: string): FieldValidationStatus => {
    const isTouched = !liveValidation ? !!touchedFields[field] : true;
    const errorMessage = errorMap[field];
    const hasError = isTouched && !!errorMessage;

    const errorClassName = hasError
      ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/25 bg-rose-50/20 dark:bg-rose-950/25 text-slate-900 dark:text-white placeholder:text-rose-400/80 shadow-xs'
      : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs';

    const labelClassName = hasError
      ? 'text-rose-600 dark:text-rose-400 font-semibold'
      : 'text-slate-700 dark:text-slate-300 font-medium';

    return {
      hasError,
      errorMessage: isTouched ? errorMessage : undefined,
      errorClassName,
      labelClassName
    };
  }, [liveValidation, touchedFields, errorMap]);

  /**
   * Валидация массива оборудования или отдельной строки
   */
  const getEquipmentValidation = useCallback((equipment: string[] | string) => {
    if (Array.isArray(equipment)) {
      return validateEquipmentArray(equipment);
    }
    const singleRes = validateEquipmentItem(equipment);
    return {
      isValid: singleRes.isValid,
      errors: singleRes.error ? [singleRes.error] : []
    };
  }, []);

  /**
   * Валидация контакта инженера
   */
  const getContactValidation = useCallback((contact: unknown) => {
    return validateContact(contact);
  }, []);

  return {
    isValid,
    isSaveDisabled,
    validationResult,
    errors,
    errorMap,
    touchedFields,
    touchField,
    touchAllFields,
    resetTouched,
    getFieldValidation,
    getEquipmentValidation,
    getContactValidation,
    errorCount
  };
}
