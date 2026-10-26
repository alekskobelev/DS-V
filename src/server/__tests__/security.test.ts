/**
 * Тесты пакета безопасности: что именно запрещено отдавать наружу, какие поля
 * принимаются из запроса и кто вообще допускает запись.
 *
 * Проверки исходников (последний describe) — сторожа регрессии: они падают, если
 * в серверный код возвращается литерал ключа или пароля.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  evaluateAdminAccess,
  readAdminToken,
  stripSecrets,
  pickAllowed,
  sanitizeUserInput,
  redactPii,
  maskFullName,
  maskPhone,
  maskEmail,
  redactText,
  isDadataCredentialFormat,
  adminAccessMessage,
  SMTP_ALWAYS_WRITABLE,
  SMTP_PRIVILEGED,
  SMTP_PUBLIC_FIELDS,
  PUBLIC_DOC_FILES,
  RESTRICTED_DOC_FILES,
  PUBLIC_USER_FIELDS,
} from '../security.ts';

describe('ADMIN_API_TOKEN: политика доступа к опасным эндпоинтам', () => {
  it('требует токен, когда он настроен', () => {
    expect(evaluateAdminAccess(undefined, { expectedToken: 's3cr3t', nodeEnv: 'production' }))
      .toEqual({ ok: false, reason: 'token-missing' });
    expect(evaluateAdminAccess('other', { expectedToken: 's3cr3t', nodeEnv: 'production' }))
      .toEqual({ ok: false, reason: 'token-mismatch' });
    expect(evaluateAdminAccess('s3cr3t', { expectedToken: 's3cr3t', nodeEnv: 'production' }))
      .toEqual({ ok: true, reason: 'token' });
  });

  it('в production без настроек закрывает доступ вместо тихой работы на открытом фронте', () => {
    const decision = evaluateAdminAccess(undefined, { expectedToken: '', nodeEnv: 'production' });
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.reason).toBe('no-token-configured');
    expect(adminAccessMessage('no-token-configured')).toMatch(/ADMIN_API_TOKEN/);
  });

  it('в dev и preview пускает без токена', () => {
    expect(evaluateAdminAccess(undefined, { expectedToken: '', nodeEnv: 'development' }))
      .toEqual({ ok: true, reason: 'permissive-env' });
    expect(evaluateAdminAccess(undefined, { nodeEnv: undefined }))
      .toEqual({ ok: true, reason: 'permissive-env' });
  });

  it('пустой/пробельный токен не считается введённым', () => {
    expect(evaluateAdminAccess('   ', { expectedToken: 's3cr3t', nodeEnv: 'production' }).ok).toBe(false);
    expect(evaluateAdminAccess('s3cr3t', { expectedToken: '  s3cr3t  ', nodeEnv: 'production' }).ok).toBe(true);
  });

  it('токен читается из x-admin-token и из Authorization: Bearer', () => {
    expect(readAdminToken({ 'x-admin-token': ' abc ' })).toBe('abc');
    expect(readAdminToken({ authorization: 'Bearer abc' })).toBe('abc');
    expect(readAdminToken({ authorization: 'Basic abc' })).toBeUndefined();
    expect(readAdminToken({})).toBeUndefined();
  });
});

describe('Ответы наружу: секреты не уходят клиенту', () => {
  it('вырезает пароли, токены и ключи рекурсивно, оставляя маски', () => {
    const safe = stripSecrets({
      host: 'smtp.yandex.ru',
      pass: 'real-secret',
      passMasked: '••••••••••••••••',
      nested: { apiKey: 'k', secretKey: 's', ok: 1 },
      managerAccounts: [{ email: 'a@b.c', password: 'p' }],
    }) as Record<string, any>;

    expect(safe.pass).toBeUndefined();
    expect(safe.nested.apiKey).toBeUndefined();
    expect(safe.nested.secretKey).toBeUndefined();
    expect(safe.nested.ok).toBe(1);
    expect(safe.managerAccounts[0].password).toBeUndefined();
    expect(safe.managerAccounts[0].email).toBe('a@b.c');
    expect(safe.passMasked).toBe('••••••••••••••••');
  });

  it('белый список полей принимает только разрешённые ключи', () => {
    const picked = pickAllowed({ fromName: 'ДС', enabled: false, evil: 'x', host: 'attacker' }, SMTP_ALWAYS_WRITABLE);
    expect(picked).toEqual({ fromName: 'ДС', enabled: false });
    expect(SMTP_PRIVILEGED).toEqual(expect.arrayContaining(['host', 'user', 'pass']));
    expect(SMTP_ALWAYS_WRITABLE).not.toContain('pass');
    expect(SMTP_PUBLIC_FIELDS).toContain('passMasked');
    expect(SMTP_PUBLIC_FIELDS).not.toContain('pass');
  });

  it('публичные поля пользователя не содержат password', () => {
    expect(PUBLIC_USER_FIELDS).not.toContain('password');
    expect(PUBLIC_USER_FIELDS).not.toContain('role');
  });
});

describe('Регистрация и обновление заказчика: эскалация прав закрыта', () => {
  it('клиент не может выдать себе роль, права или идентификатор', () => {
    const safe = sanitizeUserInput({
      email: ' client@example.com ',
      fullName: 'Иван <script>Иванов</script>',
      phone: '+7 (900) 123-45-67 <b>',
      role: 'superadmin',
      permissions: { canDelete: true },
      isDirector: true,
      id: 'adm-01',
      password: 'guess',
    });

    expect(safe.role).toBe('client');
    expect(safe.permissions).toEqual([]);
    expect(safe.isDirector).toBeUndefined();
    expect(safe.id).toBeUndefined();
    expect(safe.password).toBeUndefined();
    expect(safe.email).toBe('client@example.com');
    expect(safe.fullName).toBe('Иван scriptИванов/script'); // угловые скобки вырезаны
    expect(String(safe.fullName)).not.toMatch(/[<>]/);
    expect(safe.phone).toBe('+7 (900) 123-45-67 ');
  });

  it('некорректный email не проходит', () => {
    expect(sanitizeUserInput({ email: 'not-an-email', fullName: 'Иван' }).email).toBe('');
    expect(sanitizeUserInput({ email: 'a@b.ru', fullName: 'Иван' }).email).toBe('a@b.ru');
    expect(sanitizeUserInput(null)).toEqual({ email: '', fullName: '', role: 'client', permissions: [] });
  });

  it('аватар разрешён только как внешний http(s)-адрес', () => {
    expect(sanitizeUserInput({ email: 'a@b.ru', fullName: 'И', avatar: 'javascript:alert(1)' }).avatar).toBeUndefined();
    expect(sanitizeUserInput({ email: 'a@b.ru', fullName: 'И', avatar: 'https://cdn.example/a.png' }).avatar)
      .toBe('https://cdn.example/a.png');
  });

  it('администратор может ставить роль, но не пароль', () => {
    const safe = sanitizeUserInput({ email: 'a@b.ru', fullName: 'И', role: 'manager', id: 'adm-01' }, { isAdmin: true });
    expect(safe.role).toBe('manager');
    expect(safe.id).toBe('adm-01');
    expect(safe.password).toBeUndefined();
  });
});

describe('Журнал: персональные данные маскируются', () => {
  it('ФИО остаётся инициалами, телефон — хвостом, почта — доменом', () => {
    expect(maskFullName('Иванов Пётр Сергеевич')).toBe('Иванов П. С.');
    expect(maskPhone('+7 (900) 123-45-67')).toBe('+•• ••• ••• 4567');
    expect(maskEmail('ivorshin@ds-enginering.ru')).toBe('iv***@ds-enginering.ru');
    expect(maskEmail('нет-собаки')).toBe('');
  });

  it('redactPii доходит до вложенного payload и выбрасывает секреты', () => {
    const red = redactPii({
      customerName: 'Иванов Пётр',
      phone: '79001234567',
      email: 'a@b.ru',
      payload: { fullName: 'Скобелев Александр', pass: 'secret', contactPhone: '790012345' },
      requestId: 'RFQ-2026-001',
    }) as Record<string, any>;

    expect(red.customerName).toBe('Иванов П.');
    expect(red.phone).toContain('4567');
    expect(red.email).toBe('a***@b.ru');
    expect(red.payload.fullName).toBe('Скобелев А.');
    expect(red.payload.pass).toBeUndefined();
    expect(red.requestId).toBe('RFQ-2026-001');
  });

  it('телефон и почта вычищаются из свободных строк (summary журнала)', () => {
    const line = redactText('Поступило обращение: Иванов Пётр (АО Ромашка), тел: +7 900 123-45-67, почта ivorshin@example.ru');
    expect(line).not.toContain('123-45-67');
    expect(line).not.toContain('ivorshin@example.ru');
    expect(line).toContain('4567');
    expect(line).toContain('АО Ромашка');
    // Перестараться тоже нельзя: даты, суммы и артикулы должны оставаться как были.
    const untouched = redactText('Счёт от 2026-10-26 на 1 240 000 ₽, позиционный номер СДЕЛКА-2026-ПОВ-118');
    expect(untouched).toContain('2026-10-26');
    expect(untouched).toContain('СДЕЛКА-2026-ПОВ-118');
    expect(redactText('')).toBe('');
    expect(redactText(undefined as unknown as string)).toBe('');
  });

  it('redactPii чистит summary/message внутри details', () => {
    const red = redactPii({ message: 'Клиент звонил: 8 900 123-45-67' }) as Record<string, unknown>;
    expect(String(red.message)).not.toContain('123-45-67');
  });

  it('списки получателей в журнале маскируются', () => {
    const red = redactPii({ recipients: ['info@ds-enginering.ru', 'ivanov.private@gmail.com'] }) as Record<string, unknown>;
    expect(red.recipients).toEqual(['in***@ds-enginering.ru', 'iv***@gmail.com']);
  });

  it('маскирование идемпотентно — повторный проход ничего не ломает', () => {
    const once = redactPii({ email: 'ivorshin@ds-eng.ru', phone: '+7 900 123-45-67' });
    expect(redactPii(once)).toEqual(once);
  });
});

describe('Формат реквизитов DaData', () => {
  it('принимает только 40 шестнадцатеричных символов', () => {
    expect(isDadataCredentialFormat('83fae9eac3fa6c77946d93a32d86482088cf28e0')).toBe(true);
    expect(isDadataCredentialFormat('  83fae9eac3fa6c77946d93a32d86482088cf28e0  ')).toBe(true);
    expect(isDadataCredentialFormat('xyz')).toBe(false);
    expect(isDadataCredentialFormat(undefined)).toBe(false);
    expect(isDadataCredentialFormat({ key: '83fae9eac3fa6c77946d93a32d86482088cf28e0' })).toBe(false);
  });
});

describe('Публикация документации', () => {
  it('публичны операционные документы, служебные вынесены под токен', () => {
    expect(PUBLIC_DOC_FILES).toContain('USER_MANUAL.md');
    expect(PUBLIC_DOC_FILES).toContain('CHANGELOG.md');
    expect(RESTRICTED_DOC_FILES).toEqual(
      expect.arrayContaining(['SITE_PASSPORT.md', 'BUSINESS_ANALYTICS.md', 'PROJECT_MIGRATION_PROMPT.md', 'AI_MIGRATION_GUIDE.md']),
    );
    expect(PUBLIC_DOC_FILES).not.toContain('SITE_PASSPORT.md');
    expect(PUBLIC_DOC_FILES).not.toContain('SITE_AUDIT_SECURITY.md');
    for (const name of PUBLIC_DOC_FILES) {
      expect(name).not.toMatch(/[/\\]/);
      expect(name).not.toContain('..');
    }
  });
});

describe('Регрессия: секретов в серверном коде нет', () => {
  const repoRoot = resolve(__dirname, '..', '..', '..');
  const read = (rel: string): string => {
    const abs = resolve(repoRoot, rel);
    return existsSync(abs) ? readFileSync(abs, 'utf8') : '';
  };
  const sources: Array<[string, string]> = [
    ['server.ts', read('server.ts')],
    ['src/server/emailModule.ts', read('src/server/emailModule.ts')],
  ];

  it('исходники найдены (иначе проверка ниже — фиктивная)', () => {
    for (const [, src] of sources) expect(src.length).toBeGreaterThan(1000);
  });

  for (const [name, src] of sources) {
    it(`${name}: нет литералов, похожих на ключи DaData`, () => {
      expect(src).not.toMatch(/[0-9a-f]{40}/i);
    });

    it(`${name}: нет «паролей приложения» в исходнике`, () => {
      expect(src).not.toMatch(/['"]ds_app_[a-z0-9_]+['"]/i);
    });
  }

  it('клиентские токены DaData не подхватываются из запроса', () => {
    const src = sources[0][1];
    expect(src).not.toMatch(/reqBody\?\.apiKey/);
    expect(src).not.toMatch(/reqQuery\?\.apiKey/);
  });
});
