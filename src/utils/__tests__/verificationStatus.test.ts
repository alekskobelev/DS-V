import { describe, it, expect } from 'vitest';
import {
  parseVerificationDate,
  assessVerification,
  bucketOf,
  VERIFICATION_CRITICAL_DAYS,
  VERIFICATION_WARNING_DAYS
} from '../verificationStatus';
import { calculateVerificationStatus } from '../arshinScheduleHelper';

/**
 * Регрессия «график поверок жил по захардкоженной дате».
 *
 * До исправления «сегодня» бралось из REFERENCE_DATE = 2026-09-15, из-за чего прибор
 * со сроком до 01.10.2026 показывал «Истекает через 16 дн.!», хотя был просрочен,
 * а срок до 20.11.2026 — «Действует (66 дн.)» вместо «Истекает через 25 дн.!».
 * Здесь дата эталона передается явно, чтобы тест не зависел от часов реального мира.
 */
const REF = new Date(2026, 9, 26); // 26.10.2026 — локальная полночь

describe('parseVerificationDate — форматы, которые реально приходят в систему', () => {
  const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

  it('читает ISO-дату', () => {
    expect(iso(parseVerificationDate('2026-11-20'))).toBe('2026-11-20');
  });

  it('нормализует ISO с временем к полуночи UTC', () => {
    expect(iso(parseVerificationDate('2026-11-20T23:59:59.000Z'))).toBe('2026-11-20');
  });

  it('читает русский формат dd.mm.yyyy (ручной ввод и экспорт в Excel)', () => {
    expect(iso(parseVerificationDate('20.11.2026'))).toBe('2026-11-20');
  });

  it('читает dd/mm/yyyy', () => {
    expect(iso(parseVerificationDate('20/11/2026'))).toBe('2026-11-20');
  });

  it('читает серийный номер Excel (то, что отдаёт sheet_to_json без cellDates)', () => {
    // 46346 — это 20.11.2026 по систематике Excel (эпоха 30.12.1899)
    expect(iso(parseVerificationDate('46346'))).toBe('2026-11-20');
    expect(iso(parseVerificationDate(45292))).toBe('2024-01-01');
  });

  it('принимает объект Date', () => {
    expect(iso(parseVerificationDate(new Date(2026, 10, 20)))).toBe('2026-11-20');
  });

  it('возвращает null для мусора и несуществующих дат', () => {
    expect(parseVerificationDate('')).toBeNull();
    expect(parseVerificationDate(undefined)).toBeNull();
    expect(parseVerificationDate('не дата')).toBeNull();
    expect(parseVerificationDate('2026-02-30')).toBeNull();
    expect(parseVerificationDate('31.11.2026')).toBeNull();
    expect(parseVerificationDate('15 сентября 2026 г.')).toBeNull();
  });
});

describe('assessVerification — состояние поверки', () => {
  it('просроченный на 46 суток срок = expired, а не «истекает»', () => {
    const r = assessVerification('2026-09-10', REF);
    expect(r.status).toBe('expired');
    expect(r.daysLeft).toBe(-46);
  });

  it('просроченный на 25 суток срок = expired', () => {
    const r = assessVerification('2026-10-01', REF);
    expect(r.status).toBe('expired');
    expect(r.daysLeft).toBe(-25);
  });

  it('срок, истекающий сегодня = critical (0 дней)', () => {
    const r = assessVerification('2026-10-26', REF);
    expect(r.status).toBe('critical');
    expect(r.daysLeft).toBe(0);
  });

  it('25 дней до срока = critical, затем warning и valid', () => {
    expect(assessVerification('2026-11-20', REF).status).toBe('critical');
    expect(assessVerification('2026-11-20', REF).daysLeft).toBe(25);
    // ровно 60 суток — ещё «жёлтая зона», 61-е сутки — плановый режим
    expect(assessVerification('2026-12-25', REF).daysLeft).toBe(60);
    expect(assessVerification('2026-12-25', REF).status).toBe('warning');
    expect(assessVerification('2026-12-26', REF).status).toBe('valid');
    expect(assessVerification('2027-01-10', REF).status).toBe('valid');
  });

  it('границы порогов 30 и 60 суток включительно', () => {
    const plusCritical = new Date(REF.getTime() + VERIFICATION_CRITICAL_DAYS * 86400000);
    const plusWarning = new Date(REF.getTime() + VERIFICATION_WARNING_DAYS * 86400000);
    expect(assessVerification(plusCritical.toISOString().slice(0, 10), REF).status).toBe('critical');
    expect(assessVerification(plusWarning.toISOString().slice(0, 10), REF).status).toBe('warning');
  });

  it('пустой срок и непарсящаяся дата = unknown, а не «Действует (NaN дн.)»', () => {
    const empty = assessVerification('', REF);
    expect(empty.status).toBe('unknown');
    expect(empty.unparsable).toBe(false);

    const broken = assessVerification('2026-02-30', REF);
    expect(broken.status).toBe('unknown');
    expect(broken.unparsable).toBe(true);
    expect(Number.isFinite(broken.daysLeft)).toBe(true);
  });

  it('не зависит от времени суток и часового пояса эталона', () => {
    const earlyMorning = assessVerification('2026-10-26', new Date(2026, 9, 26, 0, 30));
    const lateEvening = assessVerification('2026-10-26', new Date(2026, 9, 26, 23, 30));
    expect(earlyMorning.daysLeft).toBe(0);
    expect(lateEvening.daysLeft).toBe(0);
  });
});

describe('bucketOf — грубая градация для «Парка оборудования»', () => {
  it('сопоставляет тонкую и грубую шкалы', () => {
    expect(bucketOf('expired')).toBe('expired');
    expect(bucketOf('critical')).toBe('expiring');
    expect(bucketOf('warning')).toBe('expiring');
    expect(bucketOf('valid')).toBe('valid');
    expect(bucketOf('unknown')).toBe('unknown');
  });
});

describe('единая точка правды: «График поверок» и «Парк оборудования» не расходятся', () => {
  const samples = ['2026-09-10', '2026-10-01', '2026-10-26', '2026-11-20', '2027-01-10', '', 'не дата'];

  it('статус графика и бакет парка описывают одно и то же состояние', () => {
    for (const value of samples) {
      const schedule = calculateVerificationStatus(value, REF);
      const fleet = assessVerification(value, REF);
      expect(bucketOf(schedule.status), `для «${value}» статусы разошлись`).toBe(fleet.bucket);
    }
  });

  it('никогда не называет «истекающим» уже просроченную поверку', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const r = calculateVerificationStatus(yesterday);
    expect(r.status).toBe('expired');
    expect(r.statusLabel).toContain('Просрочено');
  });
});
