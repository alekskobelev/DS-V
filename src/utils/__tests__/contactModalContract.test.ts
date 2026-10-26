import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

/**
 * Статическая проверка контракта контактной формы.
 *
 * Реальные ошибки, из-за которых появилась эта проверка:
 *  1. `openContactModal` принимает `Partial<ContactModalConfig>`, но четыре вызова
 *     на первом экране передавали голую строку заголовка — TypeScript падал, а в рантайме
 *     открывалась дефолтная «Запросить консультацию» вместо нужной формы.
 *  2. `AppContext.openContactModal` не переносил `customMessage` в состояние, поэтому
 *     MetrologyEquipmentConfigurator и MetrologyRoiCalculator теряли сформированный бриф.
 *
 * Тест сторожит обе регрессии; он не заменяет поведенческие тесты, а дополняет их
 * быстрой проверкой исходников (см. AGENTS.md: линтер в проекте = `tsc --noEmit`).
 */

const ROOT = path.resolve(__dirname, '..', '..');

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectSourceFiles(full, acc);
    } else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

describe('Контракт контактной формы (openContactModal)', () => {
  const files = collectSourceFiles(ROOT);

  it('ни один вызов openContactModal не передаёт строку вместо конфигурации', () => {
    const offenders: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      content.split('\n').forEach((line, idx) => {
        if (/openContactModal\(\s*[`'"]/.test(line)) {
          offenders.push(`${path.relative(ROOT, file)}:${idx + 1}`);
        }
      });
    }

    expect(offenders, `openContactModal вызывается со строкой: ${offenders.join(', ')}`).toEqual([]);
  });

  it('openContactModal в AppContext переносит все поля конфигурации в состояние', () => {
    const ctx = readFileSync(path.join(ROOT, 'context', 'AppContext.tsx'), 'utf-8');
    const body = ctx.slice(ctx.indexOf('const openContactModal'));
    const block = body.slice(0, body.indexOf('};'));

    expect(block).toContain('customMessage: config?.customMessage');
    expect(block).toContain('defaultProduct: config?.defaultProduct');
    expect(block).toContain('defaultService: config?.defaultService');
    expect(block).toContain('formType: config?.formType');
    expect(block).toContain('camSystem: config?.camSystem');
  });

  it('ContactModal читает customMessage для предзаполнения сообщения', () => {
    const modal = readFileSync(path.join(ROOT, 'components', 'modals', 'ContactModal.tsx'), 'utf-8');
    expect(modal).toContain('contactModal.customMessage');
  });
});
