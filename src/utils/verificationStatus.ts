/**
 * Единая точка правды о сроке действия свидетельства о поверке СИ.
 *
 * Исторически статус поверки считался в двух местах независимо:
 *  - `src/utils/arshinScheduleHelper.ts` («График поверок ФГИС „АРШИН“») — от захардкоженной
 *    даты `2026-09-15`, из-за чего просроченный на месяц прибор показывал «Истекает через 16 дн.»;
 *  - `src/components/crm/CompanyFleetRegistry.tsx` («Парк оборудования») — от реального
 *    `new Date()`. Один и тот же прибор на двух экранах CRM получал разные статусы и разные KPI.
 *
 * Оба места теперь делегируют в `assessVerification`. Пороги (30/60 суток) и формат
 * формулировок сохранены, чтобы не ломать существующую разметку.
 */

/** Тонкая градация — используется графиком поверок и виджетом главного метролога. */
export type VerificationLevel = 'expired' | 'critical' | 'warning' | 'valid' | 'unknown';

/** Грубая градация — используется реестром парка СИ (фильтры и KPI «Парка оборудования»). */
export type VerificationBucket = 'expired' | 'expiring' | 'valid' | 'unknown';

/** Сколько суток до поверки считается «красной зоной» (срочный вызов поверителя). */
export const VERIFICATION_CRITICAL_DAYS = 30;
/** Сколько суток до поверки считается «жёлтой зоной» (планирование). */
export const VERIFICATION_WARNING_DAYS = 60;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
/** Точка отсчёта серийных дат Excel/LibreOffice: 30.12.1899. */
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

/**
 * Разбор значения «срок действия поверки» в календарную дату (полночь UTC, без зависимости
 * от часового пояса браузера/сервера).
 *
 * Поддерживаются форматы, реально встречающиеся в данных портала:
 *  - ISO `2026-11-20` и `2026-11-20T10:00:00.000Z` (экраны CRM, PostgreSQL);
 *  - `20.11.2026`, `20/11/2026`, `20-11-2026` (ручной ввод и Russian-локаль в Excel);
 *  - числовой серийный формат Excel (`46345`) — его отдаёт `XLSX.utils.sheet_to_json`
 *    без `{ cellDates: true }`;
 *  - объект `Date`.
 *
 * Возвращает `null`, если дату распознать не удалось — это осознанный статус «неизвестно»,
 * а не `Invalid Date` с `NaN` в арифметике (прежняя реализация на `NaN` молча показывала
 * «Действует (осталось NaN дн.)»).
 */
export function parseVerificationDate(value?: string | number | Date | null): Date | null {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }

  const raw = String(value).trim();
  if (!raw) return null;

  // ISO: yyyy-mm-dd[Thh:mm:ss...]
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/.exec(raw);
  if (iso) {
    return safeUtcDate(+iso[1], +iso[2], +iso[3]);
  }

  // dd.mm.yyyy | dd/mm/yyyy | dd-mm-yyyy
  const dmy = /^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/.exec(raw) || /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(raw);
  if (dmy) {
    return safeUtcDate(+dmy[3], +dmy[2], +dmy[1]);
  }

  // Excel serial: 5digits(.frac) — только в осмысленном диапазоне годов 1980…2174
  const serial = /^(\d{5})(?:[.,](\d+))?$/.exec(raw);
  if (serial) {
    const days = Number(serial[1]);
    const fraction = serial[2] ? Number(`0.${serial[2]}`) : 0;
    if (days >= 29221 && days <= 80000) {
      return new Date(EXCEL_EPOCH_UTC + Math.floor(days + fraction) * MS_PER_DAY);
    }
  }

  // Последний шанс — стандартный парсер (например «15 сентября 2026 г.» не разберётся, вернёт null)
  const fallback = new Date(raw);
  if (Number.isNaN(fallback.getTime())) return null;
  return new Date(Date.UTC(fallback.getFullYear(), fallback.getMonth(), fallback.getDate()));
}

function safeUtcDate(year: number, monthOneBased: number, day: number): Date | null {
  if (!Number.isFinite(year) || !Number.isFinite(monthOneBased) || !Number.isFinite(day)) return null;
  if (year < 1900 || year > 2200) return null;
  if (monthOneBased < 1 || monthOneBased > 12) return null;
  if (day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, monthOneBased - 1, day));
  // отбрасываем 01.03.2025 -> 01.03. без переполнения в следующий месяц
  if (date.getUTCMonth() !== monthOneBased - 1 || date.getUTCDate() !== day) return null;
  return date;
}

/** Полночь UTC даты-эталона: «сегодня» без влияния времени суток и таймзоны. */
function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export interface VerificationAssessment {
  /** Тонкая градация для графика поверок. */
  status: VerificationLevel;
  /** Грубая градация для реестра парка СИ. */
  bucket: VerificationBucket;
  /** Целое число суток до истечения; отрицательное — просрочка; 0 при неизвестной дате. */
  daysLeft: number;
  /** Распознанная дата или null. */
  validUntil: Date | null;
  /** True, если значение было, но разобрать его не удалось (битый импорт, «20.11.2026» в ISO-поле). */
  unparsable: boolean;
}

/**
 * Оценка состояния поверки. `refDate` передается только из тестов — в проде это «сегодня».
 */
export function assessVerification(
  validUntilValue?: string | number | Date | null,
  refDate: Date = new Date()
): VerificationAssessment {
  const hasValue =
    validUntilValue !== null &&
    validUntilValue !== undefined &&
    String(validUntilValue).trim() !== '';

  const validUntil = parseVerificationDate(validUntilValue);

  if (!hasValue || !validUntil) {
    return {
      status: 'unknown',
      bucket: 'unknown',
      daysLeft: 0,
      validUntil: null,
      unparsable: hasValue
    };
  }

  const daysLeft = Math.ceil((validUntil.getTime() - startOfUtcDay(refDate)) / MS_PER_DAY);
  const status: VerificationLevel =
    daysLeft < 0 ? 'expired'
      : daysLeft <= VERIFICATION_CRITICAL_DAYS ? 'critical'
      : daysLeft <= VERIFICATION_WARNING_DAYS ? 'warning'
      : 'valid';

  return { status, bucket: bucketOf(status), daysLeft, validUntil, unparsable: false };
}

/** Тонкая градация -> грубая (просрочено / истекает / действует / неизвестно). */
export function bucketOf(status: VerificationLevel): VerificationBucket {
  switch (status) {
    case 'expired':
      return 'expired';
    case 'critical':
    case 'warning':
      return 'expiring';
    case 'valid':
      return 'valid';
    default:
      return 'unknown';
  }
}
