/**
 * Общие примитивы защиты для серверных роутов.
 *
 * Всё, что здесь объявлено, — чистые функции без Express и без ввода-вывода:
 * это позволяет держать правила «что можно принять из запроса» и «что нельзя
 * отдать наружу» в одном месте и покрыть юнит-тестами, а не проверять глазами
 * в каждом роуте. Роуты только вызывают `requireAdmin`/`pickAllowed`/`stripSecrets`.
 */

/** Поля, которые никогда не должны покидать сервер. */
const SECRET_FIELD_RE =
  /^(pass|password|passwd|pwd|secret|secretKey|apiKey|api_key|access_token|accessToken|refreshToken|authorization|cookie)$/i;

/** Ключи, которые клиент не имеет права задавать сам (эскалация привилегий). */
export const PRIVILEGED_USER_FIELDS = [
  'role',
  'permissions',
  'isDirector',
  'isEnforcementOfficer',
  'b2bAccess',
  'accessKey',
  'accessKeyExpiresAt',
  'id',
] as const;

/** Разрешённые поля записи пользователя, приходящие из публичной формы регистрации. */
export const PUBLIC_USER_FIELDS = [
  'email',
  'fullName',
  'company',
  'position',
  'phone',
  'contractNumber',
  'avatar',
  'status',
  'department',
  'slackId',
] as const;

/** Настройки SMTP, которые администратор может менять через UI без доп. конфигурации. */
export const SMTP_ALWAYS_WRITABLE = [
  'fromName',
  'fromEmail',
  'replyTo',
  'enabled',
  'provider',
  'triggers',
] as const;

/**
 * Поля, определяющие, КУДА и КТО отправляет почту. Их изменение = перехват
 * корреспонденции, поэтому только по явному согласию оператора.
 */
export const SMTP_PRIVILEGED = ['host', 'port', 'secure', 'user', 'pass', 'requireTls'] as const;

/** Публичные поля ответа настроек почты: секреты вырезаны, факт настройки показан. */
export const SMTP_PUBLIC_FIELDS = [
  'host',
  'port',
  'secure',
  'requireTls',
  'user',
  'fromName',
  'fromEmail',
  'replyTo',
  'enabled',
  'provider',
  'triggers',
  'passMasked',
  'passConfigured',
  'telegramTokenFromEnv',
  'telegramBotTokenConfigured',
  'maxWebhookUrl',
  'managerAccounts',
] as const;

/**
 * Документы, которые viewer CMS отдаёт без токена: руководство пользователя, журнал
 * версий, README и постановка БД — они не раскрывают внутренних данных компании.
 */
export const PUBLIC_DOC_FILES = [
  'USER_MANUAL.md',
  'CHANGELOG.md',
  'README.md',
  'DATABASE_DEPLOYMENT.md',
] as const;

/**
 * Служебные документы: паспорт сайта (реквизиты, штатка), бизнес-аналитика, промпты
 * миграции. Раньше все файлы docs/ раздавал express.static, то есть читались любым
 * посетителем; теперь они доступны только держателю ADMIN_API_TOKEN.
 */
export const RESTRICTED_DOC_FILES = [
  'SITE_PASSPORT.md',
  'BUSINESS_ANALYTICS.md',
  'PROJECT_MIGRATION_PROMPT.md',
  'AI_MIGRATION_GUIDE.md',
] as const;

export type AdminDecision =
  | { ok: true; reason: 'token' | 'permissive-env' }
  | { ok: false; reason: 'no-token-configured' | 'token-missing' | 'token-mismatch' };

/**
 * Политика доступа к административным и разрушительным эндпоинтам:
 *  - `ADMIN_API_TOKEN` задан → обязателен заголовок `x-admin-token` (или `Authorization: Bearer`);
 *  - не задан и `NODE_ENV=production` → доступ закрыт (503 с инструкцией): в проде
 *    нельзя держать запись/уничтожение данных без аутентификации;
 *  - не задан в dev/preview/тестах → доступ открыт, предупреждение печатается один раз.
 */
export function evaluateAdminAccess(
  providedToken: string | undefined,
  options: { expectedToken?: string; nodeEnv?: string } = {},
): AdminDecision {
  const expected = (options.expectedToken ?? '').trim();
  const provided = (providedToken ?? '').trim();

  if (!expected) {
    if ((options.nodeEnv ?? '') === 'production') return { ok: false, reason: 'no-token-configured' };
    return { ok: true, reason: 'permissive-env' };
  }

  if (!provided) return { ok: false, reason: 'token-missing' };
  if (!timingSafeEqual(provided, expected)) return { ok: false, reason: 'token-mismatch' };
  return { ok: true, reason: 'token' };
}

/** Сравнение без измерения времени (чтобы токен нельзя было восстанавливать по таймингам). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Токен администратора из типовых заголовков. */
export function readAdminToken(headers: Record<string, unknown> | undefined): string | undefined {
  const direct = headers?.['x-admin-token'];
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  const auth = headers?.authorization;
  if (typeof auth === 'string' && /^bearer\s+/i.test(auth.trim())) return auth.trim().replace(/^bearer\s+/i, '');
  return undefined;
}

/** Рекурсивно вырезает секретные поля из объекта, готового к отправке клиенту. */
export function stripSecrets<T>(value: T, depth = 0): T {
  if (depth > 8 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => stripSecrets(item, depth + 1)) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_FIELD_RE.test(key)) continue;
    out[key] = stripSecrets(item, depth + 1);
  }
  return out as unknown as T;
}

/** Белый список полей запроса: всё остальное отбрасывается до записи в хранилище. */
export function pickAllowed<K extends readonly string[]>(
  source: Record<string, unknown> | undefined | null,
  allowed: K,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!source || typeof source !== 'object') return out;
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      out[key] = source[key];
    }
  }
  return out;
}

/**
 * Приводит тело запроса регистрации/обновления заказчика к безопасному виду:
 * роль, права и идентификатор клиент задавать не может.
 */
export function sanitizeUserInput(
  body: Record<string, unknown> | null | undefined,
  options: { isAdmin?: boolean } = {},
): Record<string, unknown> {
  const safe = pickAllowed(body, PUBLIC_USER_FIELDS);
  const rawEmail = typeof safe.email === 'string' ? safe.email.trim() : '';
  const rawName = typeof safe.fullName === 'string' ? safe.fullName.trim() : '';
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawEmail) ? rawEmail.slice(0, 190) : '';
  const fullName = rawName.replace(/[<>]/g, '').slice(0, 190);

  const out: Record<string, unknown> = { ...safe, email, fullName };
  if (typeof safe.phone === 'string') out.phone = safe.phone.replace(/[^\d+\-\s()]/g, '').slice(0, 40);
  if (typeof safe.avatar === 'string' && !/^https?:\/\//i.test(safe.avatar)) delete out.avatar;

  if (options.isAdmin) {
    // Администратор (прошедший requireAdmin) вправе менять роль и права, но пароль
    // по-прежнему не приходит из запроса — его ставит сервис управления учётками.
    for (const field of ['role', 'permissions', 'isDirector', 'status', 'isActive'] as const) {
      const value = (body as Record<string, unknown>)?.[field];
      if (value !== undefined) out[field] = value;
    }
    const rawId = (body as Record<string, unknown>)?.id;
    if (typeof rawId === 'string' && /^[A-Za-z0-9_-]{3,64}$/.test(rawId.trim())) out.id = rawId.trim();
  } else {
    out.role = 'client';
    out.permissions = [];
  }

  return out;
}

/** Формат ключа/секрета DaData — 40 шестнадцатеричных символов. */
export function isDadataCredentialFormat(value: unknown): boolean {
  return typeof value === 'string' && /^[0-9a-f]{40}$/i.test(value.trim());
}

/** Маскирование ПДн в живом журнале: достаточно инициалов, последних цифр и домена. */
export function maskFullName(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  const parts = value.trim().split(/\s+/).slice(0, 3);
  return parts.map((part, index) => (index === 0 ? part : `${part.slice(0, 1)}.`)).join(' ');
}

export function maskPhone(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return '•••';
  return `+•• ••• ••• ${digits.slice(-4)}`;
}

export function maskEmail(value: unknown): string {
  if (typeof value !== 'string' || !value.includes('@')) return '';
  const [local, domain] = value.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

const TEXT_EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// Кандидат на телефон: 8+ символов из цифр и разделителей. Дополнительно проверяется
// длина числа, поэтому даты («2026-10-26»), суммы и артикулы в тексте не маскируются.
const TEXT_PHONE_RE = /\+?\d[\d\s()\-]{6,}\d/g;
const DATE_LIKE_RE = /^\d{4}[.\-]\d{2}[.\-]\d{2,4}$/;

function maskPhoneInText(candidate: string): string {
  const trimmed = candidate.trim();
  if (DATE_LIKE_RE.test(trimmed)) return candidate;
  const digits = trimmed.replace(/\D/g, '');
  // Российский/казахстанский номер: 10-11 цифр. Всё остальное — не телефон.
  if (digits.length < 10 || digits.length > 11) return candidate;
  if (!/[+\s()]/.test(trimmed) && !trimmed.startsWith('8')) return candidate;
  return maskPhone(trimmed);
}

/**
 * Маскирование ПДн в свободной строке (журнальные summary/message пишутся шаблонами,
 * и телефон с почтой попадают в текст напрямую). Хвост телефона сохраняется, чтобы
 * событие можно было опознать, а переписать — нельзя.
 */
export function redactText(value: unknown): string {
  if (typeof value !== 'string' || !value) return typeof value === 'string' ? value : '';
  return value
    .replace(TEXT_EMAIL_RE, (m) => maskEmail(m))
    .replace(TEXT_PHONE_RE, (m) => maskPhoneInText(m));
}

const PII_PHONE_RE = /(phone|tel|telephone|_mobile|contactPhone)$/i;
const PII_EMAIL_RE = /(email|mail)$/i;
const PII_NAME_RE = /^(fullName|name|customerName|contactName|contactPerson|first_name|surname|last_name|patronymic|managerName|manager_name)$/i;

/** Маскирует персональные данные в деталях журнала (в т. ч. в глубоких объектах payload). */
export function redactPii<T>(value: T, depth = 0): T {
  if (depth > 6 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => redactPii(item, depth + 1)) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_FIELD_RE.test(key)) continue;
    if (item === null || item === undefined) {
      out[key] = item;
    } else if (typeof item === 'object') {
      if (Array.isArray(item) && item.every((v) => typeof v === 'string') && /(recipient|email|mail|contact|phone|tel)/i.test(key)) {
        // Списки получателей в журнале — тоже ПДн (там и личные адреса сотрудников).
        out[key] = (item as string[]).map((v) => (v.includes('@') ? maskEmail(v) : maskPhone(v)));
      } else {
        out[key] = redactPii(item, depth + 1);
      }
    } else if (PII_NAME_RE.test(key)) {
      out[key] = maskFullName(item);
    } else if (PII_PHONE_RE.test(key)) {
      out[key] = maskPhone(item);
    } else if (PII_EMAIL_RE.test(key)) {
      out[key] = maskEmail(item);
    } else if (typeof item === 'string' && /(summary|message|comment|note|text|description)/i.test(key)) {
      out[key] = redactText(item);
    } else {
      out[key] = item;
    }
  }
  return out as unknown as T;
}

/** Человекочитаемое объяснение отказа — его получает администратор в ответе сервера. */
export function adminAccessMessage(reason: AdminDecision['reason'] | undefined): string {
  switch (reason) {
    case 'no-token-configured':
      return 'Эндпоинт требует ADMIN_API_TOKEN в окружении сервера: в production анонимная запись/удаление данных запрещены.';
    case 'token-missing':
      return 'Добавьте заголовок x-admin-token (или Authorization: Bearer) с значением ADMIN_API_TOKEN.';
    case 'token-mismatch':
      return 'Неверный ADMIN_API_TOKEN.';
    default:
      return 'Требуется доступ администратора.';
  }
}
