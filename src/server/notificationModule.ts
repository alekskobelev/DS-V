import { Request, Response, Express } from 'express';
import fs from 'fs';
import path from 'path';
import { NotificationSettings, ManagerNotificationItem } from '../types.ts';
import { sendEmailMessage, generateCorporateEmailHtml } from './emailModule.ts';
import { logRealtimeEvent } from './logger.ts';

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'notificationSettings.json');

// Default Notification Channels Settings
let currentNotificationSettings: NotificationSettings = {
  browserPopup: true,
  soundAlert: true,
  soundVolume: 0.5,
  telegramEnabled: false,
  telegramBotToken: '',
  telegramChatId: '',
  telegramTemplate: '',
  emailEnabled: true,
  alertEmail: 'info@ds-enginering.ru, alekskobelev2025@gmail.com',
  emailSubjectPrefix: '[ДС-Инжиниринг CRM]',
  maxEnabled: false,
  maxWebhookUrl: '',
  maxBotToken: '',
  maxChatId: '',
  notifyOnCallback: true,
  notifyOnConsultation: true,
  notifyOnChatLead: true,
  notifyOnTicket: true,
  slaCallbackMinutes: 5,
  workingHoursStart: '09:00',
  workingHoursEnd: '19:00',
  updatedAt: new Date().toISOString()
};

// Try loading saved settings from disk
try {
  if (fs.existsSync(SETTINGS_FILE_PATH)) {
    const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    currentNotificationSettings = { ...currentNotificationSettings, ...parsed };
  } else {
    fs.mkdirSync(path.dirname(SETTINGS_FILE_PATH), { recursive: true });
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(currentNotificationSettings, null, 2), 'utf8');
  }
} catch (e) {
  console.warn('Could not initialize notification settings storage:', e);
}

// In-Memory Queue for Manager Notifications
let notificationsQueue: ManagerNotificationItem[] = [
  {
    id: `notif-seed-01`,
    type: 'callback',
    title: '📞 Заказ обратного звонка: КИМ PMT Arm',
    customerName: 'Виктор Николаевич Савельев',
    phone: '+7 (927) 700-11-22',
    companyName: 'АО «Салют-Авиа»',
    email: 'v.savelev@salut-avia.ru',
    topic: 'КИМ и измерительные руки PMT (контроль геометрии)',
    preferredTime: 'В течение 10-15 минут (срочно)',
    comment: 'Требуется подбор измерительной руки с лазерным сканером для цеха штамповки',
    callId: 'CALL-2026-804',
    dealId: 'deal-call-804',
    taskId: 'task-call-804',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: true,
    channels: {
      popup: 'delivered',
      telegram: 'sent',
      email: 'sent',
      maxWebhook: 'skipped'
    }
  },
  {
    id: `notif-seed-02`,
    type: 'consultation',
    title: '📋 Заявка на расчет: Внедрение САПР TopSolid 7',
    customerName: 'Андрей Михайлович Громов',
    phone: '+7 (846) 211-34-55',
    companyName: 'ООО «ТехноПром Деталь»',
    email: 'gromov@technoprom.ru',
    topic: 'Внедрение TopSolid 7 CAM и разработка постпроцессоров 5D ЧПУ',
    preferredTime: 'Сегодня после обеда (14:00-16:00)',
    comment: 'Фрезерные 5-осевые обрабатывающие центры Hermle C400',
    callId: 'RFQ-2026-412',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: true,
    channels: {
      popup: 'delivered',
      telegram: 'sent',
      email: 'sent',
      maxWebhook: 'skipped'
    }
  }
];

/**
 * Helper to escape HTML characters for Telegram HTML parse mode
 */
export function escapeTgHtml(str: string = ''): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Resolves Telegram bot configuration with priority for environment variables:
 * - TELEGRAM_BOT_TOKEN (or aliases TELEGRAM_API_TOKEN, TG_BOT_TOKEN)
 * - TELEGRAM_CHAT_ID (or alias TG_CHAT_ID)
 */
export function getTelegramConfig() {
  const envToken = (
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.TELEGRAM_API_TOKEN ||
    process.env.TG_BOT_TOKEN ||
    ''
  ).trim();

  const envChatId = (
    process.env.TELEGRAM_CHAT_ID ||
    process.env.TG_CHAT_ID ||
    ''
  ).trim();

  const token = envToken || (currentNotificationSettings.telegramBotToken || '').trim();
  const chatId = envChatId || (currentNotificationSettings.telegramChatId || '').trim();

  const isConfigured = Boolean(token && chatId);
  const isEnvToken = Boolean(envToken);
  const isEnvChatId = Boolean(envChatId);

  // If token is configured in env, bot is enabled by default unless explicitly disabled via TELEGRAM_ENABLED=false
  const enabled = isConfigured && (
    process.env.TELEGRAM_ENABLED !== 'false' &&
    (currentNotificationSettings.telegramEnabled || isEnvToken)
  );

  const maskedToken = token
    ? (token.length > 10 ? `${token.substring(0, 5)}...${token.slice(-4)}` : '••••••••••••')
    : '';

  return {
    token,
    chatId,
    enabled,
    isConfigured,
    isEnvToken,
    isEnvChatId,
    maskedToken
  };
}

/**
 * Resolves Russian Messenger MAX (МАКС-бот) configuration with priority for environment variables:
 * - MAX_BOT_TOKEN (or aliases MAX_TOKEN, MAX_MESSENGER_BOT_TOKEN, MAX_MESSENGER_TOKEN)
 * - MAX_CHAT_ID (or alias MAX_CHANNEL_ID)
 * - MAX_WEBHOOK_URL (or aliases MAX_URL, MAX_ENDPOINT)
 * - MAX_API_URL (base Bot API URL, default https://api.max-messenger.ru/v1)
 */
export function getMaxConfig() {
  const envToken = (
    process.env.MAX_BOT_TOKEN ||
    process.env.MAX_TOKEN ||
    process.env.MAX_MESSENGER_BOT_TOKEN ||
    process.env.MAX_MESSENGER_TOKEN ||
    ''
  ).trim();

  const envChatId = (
    process.env.MAX_CHAT_ID ||
    process.env.MAX_CHANNEL_ID ||
    ''
  ).trim();

  const envWebhook = (
    process.env.MAX_WEBHOOK_URL ||
    process.env.MAX_URL ||
    process.env.MAX_ENDPOINT ||
    ''
  ).trim();

  let apiUrl = (
    process.env.MAX_API_URL ||
    'https://platform-api2.max.ru'
  ).trim().replace(/\/$/, '');
  
  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    apiUrl = `https://${apiUrl}`;
  }

  const token = envToken || (currentNotificationSettings.maxBotToken || '').trim();
  const chatId = envChatId || (currentNotificationSettings.maxChatId || '').trim();
  const webhookUrl = envWebhook || (currentNotificationSettings.maxWebhookUrl || '').trim();

  const isConfigured = Boolean(webhookUrl || (token && chatId) || token);
  const isEnvToken = Boolean(envToken);
  const isEnvChatId = Boolean(envChatId);
  const isEnvWebhook = Boolean(envWebhook);

  const enabled = isConfigured && (
    process.env.MAX_ENABLED !== 'false' &&
    (currentNotificationSettings.maxEnabled || isEnvToken || isEnvWebhook)
  );

  const maskedToken = token
    ? (token.length > 8 ? `${token.substring(0, 4)}...${token.slice(-4)}` : '••••••••••••')
    : '';

  return {
    token,
    chatId,
    webhookUrl,
    apiUrl,
    enabled,
    isConfigured,
    isEnvToken,
    isEnvChatId,
    isEnvWebhook,
    maskedToken
  };
}

/**
 * Send notification to Telegram via Bot API («ДС-Инжиниринг»)
 */
export async function sendTelegramNotification(
  token: string,
  chatId: string,
  text: string
): Promise<{ success: boolean; message?: string }> {
  try {
    if (!token || !chatId) {
      return { success: false, message: 'Не указан Telegram Bot Token или Chat ID' };
    }
    const cleanToken = token.trim();
    const cleanChatId = chatId.trim();
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      const errMsg = data?.description || `Ошибка Telegram API (HTTP ${res.status})`;
      logRealtimeEvent({
        category: 'NOTIFICATION',
        level: 'WARN',
        action: 'TELEGRAM_SEND_FAILED',
        summary: `Ошибка отправки в Telegram-бот: ${errMsg}`
      });
      return {
        success: false,
        message: errMsg
      };
    }

    logRealtimeEvent({
      category: 'NOTIFICATION',
      level: 'SUCCESS',
      action: 'TELEGRAM_SEND_SUCCESS',
      summary: `Оповещение о заявке успешно доставлено в Telegram-бот (Chat ID: ${cleanChatId})`
    });

    return { success: true, message: 'Уведомление успешно доставлено в Telegram-бот!' };
  } catch (error: any) {
    const errMsg = error?.message || 'Сетевая ошибка при отправке в Telegram';
    logRealtimeEvent({
      category: 'NOTIFICATION',
      level: 'ERROR',
      action: 'TELEGRAM_SEND_ERROR',
      summary: `Сетевая ошибка Telegram API: ${errMsg}`
    });
    return {
      success: false,
      message: errMsg
    };
  }
}

/**
 * Send notification to Russian Messenger MAX (МАКС-бот / Webhook)
 */
export async function sendMaxBotNotification(
  event: ManagerNotificationEvent,
  notifId: string,
  overrides?: { token?: string; chatId?: string; webhookUrl?: string; apiUrl?: string }
): Promise<{ success: boolean; message?: string }> {
  const maxConfig = getMaxConfig();
  const effectiveToken = (overrides?.token || maxConfig.token || '').trim();
  const effectiveChatId = (overrides?.chatId || maxConfig.chatId || '').trim();
  const effectiveWebhook = (overrides?.webhookUrl || maxConfig.webhookUrl || '').trim();
  const effectiveApiUrl = (overrides?.apiUrl || maxConfig.apiUrl || 'https://platform-api2.max.ru').trim().replace(/\/$/, '');

  const isConfigured = Boolean(effectiveWebhook || (effectiveToken && effectiveChatId) || effectiveToken);
  if (!isConfigured) {
    return { 
      success: false, 
      message: 'Не указана конфигурация для Российского мессенджера МАКС (укажите Bot Token и Chat ID либо Webhook URL в настройках или .env)' 
    };
  }

  const cleanPhoneDigits = (event.phone || '').replace(/\D/g, '');
  const phoneHref = cleanPhoneDigits ? `tel:${cleanPhoneDigits}` : '';
  const crmId = event.callId || notifId;
  const now = new Date();
  const timeFormatted = now.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const typeTitle = 
    event.type === 'callback' ? 'ЗАКАЗ ОБРАТНОГО ЗВОНКА' : 
    event.type === 'chat_lead' ? 'ОНЛАЙН-ЧАТ: ВЫЗОВ СПЕЦИАЛИСТА' : 
    event.type === 'rfq' ? 'ЗАЯВКА НА РАСЧЕТ / ИНЖИНИРИНГ (RFQ)' : 
    event.type === 'ticket' ? 'СЕРВИСНАЯ ЗАЯВКА B2B' : 
    'НОВАЯ ЗАЯВКА С САЙТА';

  const icon = 
    event.type === 'callback' ? '📞' : 
    event.type === 'chat_lead' ? '💬' : 
    event.type === 'rfq' ? '⚙️' : 
    event.type === 'ticket' ? '🎫' : '📋';

  const textLines: (string | null)[] = [
    `🇷🇺 МАКС-бот | «ДС-Инжиниринг»`,
    `${icon} ${typeTitle}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 Заказчик: ${event.customerName}`,
    `📱 Телефон: ${event.phone}${phoneHref ? ` (${phoneHref})` : ''}`,
    event.email ? `✉️ Email: ${event.email}` : null,
    `🏢 Организация: ${event.companyName || 'Частное лицо / Не указано'}`,
    event.department ? `🏛 Профильный отдел: ${event.department}` : null,
    event.topic ? `🎯 Услуга / Тематика: ${event.topic}` : null,
    typeof event.estimatedPrice === 'number' && event.estimatedPrice > 0 
      ? `💰 Предварительный расчет: ${event.estimatedPrice.toLocaleString('ru-RU')} ₽` 
      : null,
    event.cadFormat ? `📐 Формат CAD/3D: ${event.cadFormat}` : null,
    `⏱ Желаемое время связи: ${event.preferredTime || 'Срочно (в течение 10–15 минут)'}`,
    (event.comment || event.details) ? `📝 Примечание / ТЗ:\n${(event.comment || event.details)!.slice(0, 500)}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🆔 Номер в CRM: ${crmId}`,
    `🕒 Время поступления: ${timeFormatted} (МСК)`,
    event.sourcePage ? `🌐 Источник: ${event.sourcePage}` : null,
    `🔗 Карточка в CRM: ${process.env.APP_URL || 'https://ds-enginering.ru'}/#cms?tab=crm`
  ];

  const fullText = textLines.filter(Boolean).join('\n');

  const payload = {
    source: 'ds-enginering-portal',
    messenger: 'MAX',
    channel: 'MAX_BOT',
    notificationId: notifId,
    crmId,
    event: event.type,
    title: `${icon} ${typeTitle}: ${event.customerName}`,
    text: fullText,
    chatId: effectiveChatId || undefined,
    customer: {
      name: event.customerName,
      phone: event.phone,
      company: event.companyName || null,
      email: event.email || null
    },
    request: {
      topic: event.topic || null,
      preferredTime: event.preferredTime || null,
      comment: event.comment || event.details || null,
      estimatedPrice: event.estimatedPrice || null,
      cadFormat: event.cadFormat || null,
      department: event.department || null,
      sourcePage: event.sourcePage || null
    },
    timestamp: now.toISOString()
  };

  try {
    let targetUrl = effectiveWebhook;
    const isIncomingWebhookEndpoint = Boolean(
      targetUrl && (
        targetUrl.includes('/api/notifications/max/webhook') ||
        targetUrl.includes('/api/max/webhook') ||
        targetUrl.includes('/api/notifications/max')
      )
    );
    const isCustomWebhook = Boolean(targetUrl && !targetUrl.includes('max.ru') && !isIncomingWebhookEndpoint);

    // Official Russian Messenger MAX endpoint: POST https://platform-api2.max.ru/messages
    if ((!isCustomWebhook || isIncomingWebhookEndpoint) && effectiveToken) {
      targetUrl = `${effectiveApiUrl}/messages`;
    }

    if (!targetUrl || (isIncomingWebhookEndpoint && !effectiveToken)) {
      return { success: false, message: 'Не определен URL отправки для Российского мессенджера МАКС (укажите Bot Token)' };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (effectiveToken) {
      // Official dev.max.ru specification: Authorization: <token>
      headers['Authorization'] = effectiveToken;
      headers['X-Max-Bot-Token'] = effectiveToken;
    }

    let requestBody: any;
    if (!isCustomWebhook) {
      // Format payload strictly according to MAX Bot API (dev.max.ru/docs-api)
      requestBody = {
        text: fullText,
        format: 'html' // According to MAX Platform API
      };
      
      // Strict parsing of chat_id
      if (effectiveChatId !== undefined && effectiveChatId !== '') {
        const cleanIdStr = effectiveChatId.toString().trim();
        
        // Extract channel alias if user pasted full URL (e.g. https://max.ru/id6312025587_biz)
        let finalChatId: string | number = cleanIdStr;
        if (cleanIdStr.includes('max.ru/')) {
          finalChatId = cleanIdStr.split('max.ru/').pop()?.replace(/^\//, '') || cleanIdStr;
        }

        // If it's a pure number (e.g. "431592917" or "-100123"), send as integer
        if (/^-?\d+$/.test(finalChatId as string)) {
          requestBody.chat_id = parseInt(finalChatId as string, 10);
        } else {
          // Send as string. If it's a channel alias like 'id6312025587_biz', 
          // usually the API expects it either with or without '@'. We'll pass it exactly as extracted.
          // If the user adds '@', we preserve it. If they don't, we add '@' if it looks like a standard alphabetical alias without it.
          let alias = finalChatId as string;
          if (!alias.startsWith('@') && /^[a-zA-Z]/.test(alias)) {
            alias = '@' + alias;
          }
          requestBody.chat_id = alias;
        }
      }
    } else {
      requestBody = payload;
    }

    console.info(`[MAX-BOT] Dispatching message to ${targetUrl} with chat_id: ${requestBody.chat_id || 'N/A'}`);
    
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errBodyText = await res.text().catch(() => '');
      console.warn(`[MAX-BOT] HTTP ${res.status} from ${targetUrl}: ${errBodyText ? errBodyText.slice(0, 150) : 'No response body'}`);
      
      let parsedErr: any = null;
      try {
        parsedErr = JSON.parse(errBodyText);
      } catch {
        // not json
      }

      let explanation = '';
      if (res.status === 401) {
        explanation = 'Неверный токен бота МАКС. Проверьте правильность токена в кабинете разработчика dev.max.ru.';
      } else if (res.status === 400 || res.status === 404) {
        explanation = 'Чат или получатель не найден. Проверьте Chat ID, убедитесь что указан именно числовой ID (а не юзернейм), добавьте бота в чат/канал и отправьте ему /start.';
      } else if (res.status === 403) {
        explanation = 'Доступ запрещен. Убедитесь, что бот имеет права на отправку сообщений в указанный диалог.';
      }

      const serverDetail = parsedErr?.message || parsedErr?.description || (errBodyText ? errBodyText.slice(0, 200) : '');
      const statusMsg = explanation 
        ? `Ошибка МАКС (HTTP ${res.status}): ${explanation} ${serverDetail ? `[Ответ сервера: ${serverDetail}]` : ''}`
        : `Шлюз Российского мессенджера МАКС вернул HTTP ${res.status}: ${serverDetail || 'Ошибка доставки'}`;

      logRealtimeEvent({
        category: 'NOTIFICATION',
        level: 'WARN',
        action: 'MAX_BOT_SEND_FAILED',
        summary: statusMsg
      });
      return { success: false, message: statusMsg };
    }

    // Success response parsing for detailed logging
    const successBodyText = await res.text().catch(() => '');
    console.info(`[MAX-BOT SUCCESS] HTTP 200. Response: ${successBodyText ? successBodyText.slice(0, 150) : 'OK'}`);
    
    logRealtimeEvent({
      category: 'NOTIFICATION',
      level: 'SUCCESS',
      action: 'MAX_BOT_SEND_SUCCESS',
      summary: `Оповещение о заявке ${crmId} успешно доставлено в бот Российского мессенджера МАКС`
    });

    return { 
      success: true, 
      message: 'Уведомление успешно доставлено в бот Российского мессенджера МАКС!' 
    };
  } catch (err: any) {
    const errMsg = err?.message || 'Сетевая ошибка при отправке в Российский мессенджер МАКС';
    logRealtimeEvent({
      category: 'NOTIFICATION',
      level: 'ERROR',
      action: 'MAX_BOT_SEND_ERROR',
      summary: `Ошибка мессенджера МАКС: ${errMsg}`
    });
    return { success: false, message: errMsg };
  }
}

/**
 * Send notification to MAX or corporate webhook (helper)
 */
export async function sendMaxWebhookNotification(
  webhookUrl: string,
  payload: any
): Promise<{ success: boolean; message?: string }> {
  try {
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      return { success: false, message: 'Некорректный Webhook URL' };
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      return { success: false, message: `Webhook вернул статус ${res.status}` };
    }

    return { success: true, message: 'Webhook успешно отправлен в корпоративный шлюз MAX' };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Сетевая ошибка отправки Webhook' };
  }
}

export interface ManagerNotificationEvent {
  type: 'callback' | 'consultation' | 'rfq' | 'chat_lead' | 'ticket' | 'user_registration';
  title: string;
  customerName: string;
  phone: string;
  companyName?: string;
  email?: string;
  topic?: string;
  preferredTime?: string;
  comment?: string;
  details?: string;
  estimatedPrice?: number | null;
  cadFormat?: string | null;
  department?: string;
  sourcePage?: string;
  callId?: string;
  dealId?: string;
  taskId?: string;
}

/**
 * Central Dispatcher for any incoming lead or customer action
 * Broadcasts instant alerts to Telegram МАКС-бот, Email, and in-app Popups
 */
export async function dispatchManagerNotification(event: ManagerNotificationEvent) {
  const notifId = `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const nowIso = new Date().toISOString();
  const tgConfig = getTelegramConfig();

  const newNotif: ManagerNotificationItem = {
    id: notifId,
    type: event.type,
    title: event.title,
    customerName: event.customerName,
    phone: event.phone,
    companyName: event.companyName || 'Частное лицо / Предприятие',
    email: event.email,
    topic: event.topic || 'Общий технический вопрос',
    preferredTime: event.preferredTime || 'В течение 10-15 минут (срочно)',
    comment: event.comment || event.details,
    callId: event.callId,
    dealId: event.dealId,
    taskId: event.taskId,
    createdAt: nowIso,
    read: false,
    channels: {
      popup: currentNotificationSettings.browserPopup ? 'delivered' : 'pending',
      telegram: tgConfig.enabled ? 'pending' : (tgConfig.isConfigured ? 'skipped' : 'not_configured'),
      email: currentNotificationSettings.emailEnabled ? 'pending' : 'skipped',
      maxWebhook: getMaxConfig().enabled ? 'pending' : (getMaxConfig().isConfigured ? 'skipped' : 'not_configured')
    } as any
  };

  // Add to in-memory queue (keep max 150 items)
  notificationsQueue.unshift(newNotif);
  if (notificationsQueue.length > 150) {
    notificationsQueue.pop();
  }

  // 1. Telegram Bot Channel Dispatch (with environment variable support)
  if (tgConfig.enabled && tgConfig.token && tgConfig.chatId) {
    const tgIcon = 
      event.type === 'user_registration' ? '👤' :
      event.type === 'callback' ? '📞' : 
      event.type === 'chat_lead' ? '💬' : 
      event.type === 'rfq' ? '⚙️' : 
      event.type === 'ticket' ? '🎫' : '📋';

    const typeTitle = 
      event.type === 'user_registration' ? 'РЕГИСТРАЦИЯ НОВОГО ЗАКАЗЧИКА B2B' :
      event.type === 'callback' ? 'ЗАКАЗ ОБРАТНОГО ЗВОНКА' : 
      event.type === 'chat_lead' ? 'ОНЛАЙН-ЧАТ: ВЫЗОВ СПЕЦИАЛИСТА' : 
      event.type === 'rfq' ? 'ЗАЯВКА НА РАСЧЕТ / ИНЖИНИРИНГ (RFQ)' : 
      event.type === 'ticket' ? 'СЕРВИСНАЯ ЗАЯВКА B2B' : 
      'НОВАЯ ЗАЯВКА С САЙТА';

    const now = new Date();
    const timeFormatted = now.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const crmId = event.callId || notifId;
    const cleanPhoneDigits = (event.phone || '').replace(/\D/g, '');
    const phoneHref = cleanPhoneDigits ? `tel:${cleanPhoneDigits}` : '';

    const lines: (string | null)[] = [
      `✈️ <b>Telegram-бот | «ДС-Инжиниринг»</b>`,
      `${tgIcon} <b>${typeTitle}</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 <b>Заказчик:</b> ${escapeTgHtml(event.customerName)}`,
      `📱 <b>Телефон:</b> <code>${escapeTgHtml(event.phone)}</code>${phoneHref ? ` (<a href="${phoneHref}">Позвонить</a>)` : ''}`,
      event.email ? `✉️ <b>Email:</b> <code>${escapeTgHtml(event.email)}</code>` : null,
      `🏢 <b>Организация:</b> ${escapeTgHtml(event.companyName || 'Частное лицо / Не указано')}`,
      event.department ? `🏛 <b>Профильный отдел:</b> ${escapeTgHtml(event.department)}` : null,
      event.topic ? `🎯 <b>Услуга / Тематика:</b> ${escapeTgHtml(event.topic)}` : null,
      typeof event.estimatedPrice === 'number' && event.estimatedPrice > 0 
        ? `💰 <b>Предварительный расчет:</b> ${event.estimatedPrice.toLocaleString('ru-RU')} ₽` 
        : null,
      event.cadFormat ? `📐 <b>Формат CAD/3D:</b> <code>${escapeTgHtml(event.cadFormat)}</code>` : null,
      `⏱ <b>Желаемое время связи:</b> ${escapeTgHtml(event.preferredTime || 'Срочно (в течение 10–15 минут)')}`,
      (event.comment || event.details) ? `📝 <b>Примечание / ТЗ:</b>\n<i>${escapeTgHtml((event.comment || event.details)!.slice(0, 500))}</i>` : null,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🆔 <b>Номер в CRM:</b> <code>${escapeTgHtml(crmId)}</code>`,
      `🕒 <b>Время поступления:</b> ${timeFormatted} (МСК)`,
      event.sourcePage ? `🌐 <b>Источник:</b> ${escapeTgHtml(event.sourcePage)}` : null,
      `🔗 <a href="${process.env.APP_URL || 'https://ds-enginering.ru'}/#cms?tab=crm">Открыть карточку лида в CRM</a>`
    ];

    const tgText = lines.filter(Boolean).join('\n');

    sendTelegramNotification(
      tgConfig.token,
      tgConfig.chatId,
      tgText
    ).then((res) => {
      newNotif.channels.telegram = res.success ? 'sent' : 'failed';
    }).catch(() => {
      newNotif.channels.telegram = 'failed';
    });
  } else {
    newNotif.channels.telegram = tgConfig.isConfigured ? 'skipped' : 'not_configured';
  }

  // 2. Email Channel Dispatch
  if (currentNotificationSettings.emailEnabled && currentNotificationSettings.alertEmail) {
    const emailList = currentNotificationSettings.alertEmail
      .split(/[,;]+/)
      .map(e => e.trim())
      .filter(e => e.includes('@'));

    const prefix = currentNotificationSettings.emailSubjectPrefix || '[ДС-Инжиниринг CRM]';

    for (const recipient of emailList) {
      sendEmailMessage({
        senderManagerId: 'adm-01',
        to: recipient,
        toName: 'Дежурный инженер / Менеджер',
        subject: `${prefix} ${event.title}: ${event.customerName} (${event.phone})`,
        templateType: 'rfq_created',
        html: `
          <h3>Поступил новый запрос с сайта: ${event.title}</h3>
          <p><strong>Клиент:</strong> ${event.customerName}</p>
          <p><strong>Организация:</strong> ${event.companyName || 'Не указана'}</p>
          <p><strong>Контактный телефон:</strong> <a href="tel:${event.phone.replace(/\D/g, '')}">${event.phone}</a></p>
          <p><strong>Желаемое время связи:</strong> ${event.preferredTime || '10-15 минут'}</p>
          <p><strong>Тематика:</strong> ${event.topic || 'Консультация'}</p>
          ${event.comment ? `<p><strong>Комментарий клиента:</strong> ${event.comment}</p>` : ''}
          <p>Номер заявки в CRM: <strong>${event.callId || notifId}</strong></p>
        `
      }).then(() => {
        newNotif.channels.email = 'sent';
      }).catch(() => {
        newNotif.channels.email = 'simulated';
      });
    }
  }

  // 3. Russian Messenger MAX (МАКС-бот / Webhook) Channel Dispatch
  const maxConfig = getMaxConfig();
  if (maxConfig.enabled) {
    sendMaxBotNotification(event, notifId).then((res) => {
      newNotif.channels.maxWebhook = res.success ? 'sent' : 'failed';
    }).catch(() => {
      newNotif.channels.maxWebhook = 'failed';
    });
  } else {
    newNotif.channels.maxWebhook = maxConfig.isConfigured ? 'skipped' : 'not_configured';
  }

  return newNotif;
}

/**
 * Automated Email Notification Service specifically for Contact Form Submissions
 * Instantly notifies the engineering team via email with full request specs
 */
export async function dispatchContactFormEmail(data: {
  requestId: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  department?: string;
  message?: string;
  sourcePage?: string;
}): Promise<{ sentCount: number; recipients: string[]; success: boolean }> {
  // Collect all recipient addresses
  const recipientSet = new Set<string>();
  
  // 1. From settings alert email
  if (currentNotificationSettings.alertEmail) {
    currentNotificationSettings.alertEmail
      .split(/[,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.includes('@'))
      .forEach(e => recipientSet.add(e));
  }
  
  // 2. From environment variables if configured
  if (process.env.ALERT_EMAIL_RECIPIENTS) {
    process.env.ALERT_EMAIL_RECIPIENTS
      .split(/[,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.includes('@'))
      .forEach(e => recipientSet.add(e));
  }

  // 3. Core engineering team mailbox addresses
  recipientSet.add('info@ds-enginering.ru');
  recipientSet.add('alekskobelev2025@gmail.com');
  recipientSet.add('a.skobelev@ds-enginering.ru');

  const recipients = Array.from(recipientSet);
  const now = new Date();
  const timeFormatted = now.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const departmentTitleMap: Record<string, string> = {
    'all': 'Общие вопросы и руководство',
    'topsolid': 'САПР TopSolid 7 и постпроцессоры ЧПУ',
    'polyworks': 'ПО PolyWorks, КИМ и оптические системы',
    'metrology': 'Услуги 3D-сканирования, контроля и реверса',
    'service': 'Сервисный центр, калибровка и ТО'
  };

  const departmentDisplay = departmentTitleMap[data.department || 'all'] || data.department || 'Инженерный отдел';

  const detailsTable = [
    { label: 'Имя заказчика', value: `<strong>${data.name}</strong>` },
    { label: 'Контактный телефон', value: `<a href="tel:${data.phone.replace(/\D/g, '')}" style="color: #2563eb; font-weight: bold; text-decoration: none;">${data.phone}</a>` },
    { label: 'Email заказчика', value: data.email ? `<a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a>` : 'Не указан' },
    { label: 'Организация / Предприятие', value: data.company || 'Частное лицо / Не указано' },
    { label: 'Профильный отдел', value: departmentDisplay },
    { label: 'Текст обращения / ТЗ', value: data.message ? `<div style="white-space: pre-wrap; font-style: italic; background: #fff; padding: 10px 14px; border-radius: 6px; border: 1px solid #cbd5e1; color: #1e293b;">${data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>` : 'Запрос обратной связи' },
    { label: 'Номер обращения в CRM', value: `<span style="font-family: monospace; font-weight: bold; color: #1e3a8a; background: #dbeafe; padding: 2px 8px; border-radius: 4px;">${data.requestId}</span>` },
    { label: 'Дата и время поступления', value: `${timeFormatted} (МСК)` },
    { label: 'Источник на сайте', value: data.sourcePage || 'Форма контактов на портале ds-enginering.ru' }
  ];

  const html = generateCorporateEmailHtml({
    title: `🚨 Новое обращение с формы контактов: ${data.name}`,
    recipientName: 'Инженерная группа «ДС‑Инжиниринг»',
    headerBadge: 'ФОРМА КОНТАКТОВ',
    mainMessage: `Поступило новое обращение от заказчика <strong>${data.name}</strong> (${data.company || 'Частное лицо'}). Данные обращения зафиксированы в CRM-системе. По регламенту первый контакт с заказчиком должен состояться в течение <strong>10–15 минут</strong>.`,
    detailsTable,
    ctaText: 'Открыть карточку лида в CRM',
    ctaUrl: 'https://ds-enginering.ru/account',
    footerNote: 'Автоматическое служебное оповещение службы продаж и дежурных инженеров ООО «ДС‑Инжиниринг». При необходимости вы можете ответить непосредственно на это письмо или связаться с клиентом по телефону.',
    senderName: 'Почтовый шлюз CRM',
    senderPosition: 'Система мгновенных оповещений',
    senderEmail: 'info@ds-enginering.ru'
  });

  const subject = `[ДС‑Инжиниринг] 🚨 Новое обращение с формы контактов: ${data.name} (${data.phone}) #${data.requestId}`;

  let sentCount = 0;
  for (const to of recipients) {
    try {
      const emailRes = await sendEmailMessage({
        senderManagerId: 'adm-01',
        to,
        toName: 'Инженерная группа',
        subject,
        templateType: 'rfq_created',
        html,
        text: `Новое обращение с формы контактов:\nИмя: ${data.name}\nТелефон: ${data.phone}\nEmail: ${data.email || '-'}\nКомпания: ${data.company || '-'}\nОтдел: ${departmentDisplay}\nСообщение: ${data.message || '-'}\nНомер: ${data.requestId}`
      });
      if (emailRes.success) {
        sentCount++;
      }
    } catch (e: any) {
      console.warn(`[Contact Email Dispatch] Failed to send to ${to}:`, e);
    }
  }

  logRealtimeEvent({
    category: 'NOTIFICATION',
    level: 'SUCCESS',
    requestId: data.requestId,
    action: 'CONTACT_EMAIL_DISPATCHED',
    summary: `Автоматическое email-оповещение разослано инженерной группе (${sentCount}/${recipients.length} получателей: ${recipients.join(', ')})`,
    details: {
      recipients,
      sentCount,
      customerName: data.name,
      phone: data.phone,
      department: departmentDisplay,
      requestId: data.requestId
    }
  });

  // Also dispatch instant alert to Telegram and Russian messenger MAX bots
  dispatchManagerNotification({
    type: 'consultation',
    title: `Форма контактов: ${data.name}`,
    customerName: data.name,
    phone: data.phone,
    companyName: data.company,
    email: data.email,
    topic: departmentDisplay,
    comment: data.message,
    department: departmentDisplay,
    sourcePage: data.sourcePage || 'Форма контактов',
    callId: data.requestId
  }).catch(() => {});

  return { sentCount, recipients, success: sentCount > 0 };
}

/**
 * Register all Notification Settings and Live Alert Endpoints
 */
export function registerNotificationRoutes(app: Express) {
  // Helper to compile serialized settings with environment variable overlays
  const buildSettingsPayload = () => {
    const tgConfig = getTelegramConfig();
    const maxConfig = getMaxConfig();

    return {
      ...currentNotificationSettings,
      // Telegram Bot
      telegramBotToken: tgConfig.isEnvToken ? (tgConfig.maskedToken || '••••••••••••') : currentNotificationSettings.telegramBotToken,
      telegramBotTokenConfigured: tgConfig.isConfigured,
      telegramTokenFromEnv: tgConfig.isEnvToken,
      telegramChatIdFromEnv: tgConfig.isEnvChatId,
      telegramMaskedToken: tgConfig.maskedToken,
      telegramEffectiveChatId: tgConfig.chatId,
      telegramEnabled: tgConfig.enabled,

      // Russian Messenger MAX (МАКС-бот / Webhook)
      maxBotToken: maxConfig.isEnvToken ? (maxConfig.maskedToken || '••••••••••••') : (currentNotificationSettings.maxBotToken || ''),
      maxBotTokenConfigured: maxConfig.isConfigured,
      maxTokenFromEnv: maxConfig.isEnvToken,
      maxChatIdFromEnv: maxConfig.isEnvChatId,
      maxWebhookFromEnv: maxConfig.isEnvWebhook,
      maxMaskedToken: maxConfig.maskedToken,
      maxEffectiveChatId: maxConfig.chatId,
      maxEffectiveWebhookUrl: maxConfig.webhookUrl,
      maxEnabled: maxConfig.enabled
    };
  };

  // GET /api/notifications/settings
  app.get('/api/notifications/settings', (_req: Request, res: Response) => {
    res.json({
      success: true,
      settings: buildSettingsPayload()
    });
  });

  // POST /api/notifications/settings
  app.post('/api/notifications/settings', (req: Request, res: Response) => {
    try {
      const updates = req.body || {};
      const tgConfig = getTelegramConfig();
      const maxConfig = getMaxConfig();

      // Strip dynamic computed fields to prevent pollution of storage
      const sanitizedUpdates: Partial<NotificationSettings> = { ...updates };
      delete (sanitizedUpdates as any).telegramBotTokenConfigured;
      delete (sanitizedUpdates as any).telegramTokenFromEnv;
      delete (sanitizedUpdates as any).telegramChatIdFromEnv;
      delete (sanitizedUpdates as any).telegramMaskedToken;
      delete (sanitizedUpdates as any).telegramEffectiveChatId;
      delete (sanitizedUpdates as any).maxBotTokenConfigured;
      delete (sanitizedUpdates as any).maxTokenFromEnv;
      delete (sanitizedUpdates as any).maxChatIdFromEnv;
      delete (sanitizedUpdates as any).maxWebhookFromEnv;
      delete (sanitizedUpdates as any).maxMaskedToken;
      delete (sanitizedUpdates as any).maxEffectiveChatId;
      delete (sanitizedUpdates as any).maxEffectiveWebhookUrl;

      // If tokens are configured via environment variables or sent masked, prevent overriding
      if (tgConfig.isEnvToken || (typeof sanitizedUpdates.telegramBotToken === 'string' && sanitizedUpdates.telegramBotToken.startsWith('•••'))) {
        delete sanitizedUpdates.telegramBotToken;
      }
      if (maxConfig.isEnvToken || (typeof sanitizedUpdates.maxBotToken === 'string' && sanitizedUpdates.maxBotToken.startsWith('•••'))) {
        delete sanitizedUpdates.maxBotToken;
      }

      currentNotificationSettings = {
        ...currentNotificationSettings,
        ...sanitizedUpdates,
        updatedAt: new Date().toISOString()
      };
      
      try {
        fs.mkdirSync(path.dirname(SETTINGS_FILE_PATH), { recursive: true });
        fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(currentNotificationSettings, null, 2), 'utf8');
      } catch (fileErr) {
        console.warn('Failed to write notification settings to disk:', fileErr);
      }

      res.json({
        success: true,
        settings: buildSettingsPayload(),
        message: 'Настройки каналов оповещения успешно сохранены!'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Ошибка сохранения настроек' });
    }
  });

  // GET /api/notifications/live
  app.get('/api/notifications/live', (req: Request, res: Response) => {
    const unreadCount = notificationsQueue.filter(n => !n.read).length;
    res.json({
      success: true,
      unreadCount,
      notifications: notificationsQueue.slice(0, 30),
      settings: {
        browserPopup: currentNotificationSettings.browserPopup,
        soundAlert: currentNotificationSettings.soundAlert
      }
    });
  });

  // POST /api/notifications/:id/read
  app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    const item = notificationsQueue.find(n => n.id === id);
    if (item) {
      item.read = true;
    }
    res.json({ success: true, id });
  });

  // POST /api/notifications/read-all
  app.post('/api/notifications/read-all', (_req: Request, res: Response) => {
    notificationsQueue.forEach(n => { n.read = true; });
    res.json({ success: true });
  });

  // POST /api/notifications/test
  app.post('/api/notifications/test', async (req: Request, res: Response) => {
    try {
      const { channel, telegramBotToken, telegramChatId, alertEmail, maxWebhookUrl, maxBotToken, maxChatId } = req.body || {};

      if (channel === 'telegram') {
        const tgConfig = getTelegramConfig();
        const token = telegramBotToken || tgConfig.token;
        const chatId = telegramChatId || tgConfig.chatId;
        if (!token || !chatId) {
          return res.status(400).json({
            success: false,
            message: 'Пожалуйста, укажите Telegram Bot Token (в .env: TELEGRAM_BOT_TOKEN или настройках) и Chat ID для отправки теста.'
          });
        }
        const isEnv = tgConfig.isEnvToken && (!telegramBotToken || telegramBotToken === tgConfig.token);
        const testText = `
✈️ <b>Telegram-бот | «ДС-Инжиниринг»</b>
🧪 <b>ТЕСТОВОЕ УВЕДОМЛЕНИЕ: КАНАЛ СВЯЗИ TELEGRAM</b>
━━━━━━━━━━━━━━━━━━━━
✅ <i>Интеграция с Telegram Bot API работает штатно!</i>
🔑 <b>Источник API-токена:</b> ${isEnv ? 'Переменная окружения TELEGRAM_BOT_TOKEN (.env)' : 'Панель управления'}
👥 <b>Получатель (Chat ID):</b> <code>${escapeTgHtml(chatId)}</code>
📋 <i>Дежурные инженеры и менеджеры оперативно получают все входящие заявки с сайта в этот диалог.</i>
🕒 <b>Время проверки:</b> ${new Date().toLocaleTimeString('ru-RU')} (МСК)
`.trim();
        const tgRes = await sendTelegramNotification(token, chatId, testText);
        return res.json(tgRes);
      }

      if (channel === 'email') {
        const email = alertEmail || currentNotificationSettings.alertEmail;
        if (!email) {
          return res.status(400).json({
            success: false,
            message: 'Пожалуйста, укажите адрес электронной почты.'
          });
        }
        const firstEmail = email.split(/[,;]+/)[0].trim();
        await sendEmailMessage({
          senderManagerId: 'adm-01',
          to: firstEmail,
          toName: 'Менеджер «ДС-Инжиниринг»',
          subject: '[ТЕСТ] Проверка почтового канала уведомлений «ДС-Инжиниринг»',
          templateType: 'rfq_created',
          html: '<p>Тестовое уведомление: корпоративный почтовый канал настроен и готов принимать запросы клиентов с сайта.</p>'
        });
        return res.json({
          success: true,
          message: `Тестовое уведомление успешно отправлено на ${firstEmail}!`
        });
      }

      if (channel === 'max') {
        const maxConfig = getMaxConfig();
        const token = (maxBotToken || maxConfig.token || '').trim();
        const chatId = (maxChatId || maxConfig.chatId || '').trim();
        const webhook = (maxWebhookUrl || maxConfig.webhookUrl || '').trim();

        if (!webhook && (!token || !chatId) && !token) {
          return res.status(400).json({
            success: false,
            message: 'Пожалуйста, укажите Webhook URL или Bot Token и Chat ID для Российского мессенджера МАКС (или укажите MAX_BOT_TOKEN / MAX_WEBHOOK_URL в .env).'
          });
        }

        const isEnv = Boolean(maxConfig.isEnvToken || maxConfig.isEnvWebhook);
        const testRes = await sendMaxBotNotification({
          type: 'callback',
          title: 'ТЕСТОВЫЙ ВЫЗОВ: РОССИЙСКИЙ МЕССЕНДЖЕР МАКС',
          customerName: 'Алексей Петрович Кузнецов (Тест МАКС-бота)',
          phone: '+7 (927) 200-45-77',
          companyName: 'ПАО «ОДК-Кузнецов» (Самара)',
          topic: 'Проверка работы бота в Российском мессенджере МАКС',
          preferredTime: 'Срочно (тест канала)',
          comment: `Тестовая проверка шлюза МАКС. Источник параметров: ${isEnv ? 'Переменные окружения (.env)' : 'Панель управления'}`
        }, `TEST-MAX-${Date.now()}`, {
          token: token || undefined,
          chatId: chatId || undefined,
          webhookUrl: webhook || undefined
        });

        return res.json(testRes);
      }

      if (channel === 'popup') {
        // Create an immediate test notification in queue
        const testItem = await dispatchManagerNotification({
          type: 'callback',
          title: '📞 Тестовое уведомление: Обратный звонок',
          customerName: 'Алексей Петрович Кузнецов (Тест)',
          phone: '+7 (917) 000-00-00',
          companyName: 'ПАО «ОДК-Кузнецов»',
          topic: 'Проверка работы всплывающего окна и звука',
          preferredTime: 'В течение 10-15 минут (срочно)',
          comment: 'Тестовый вызов для проверки оповещений дежурного инженера'
        });
        return res.json({
          success: true,
          message: 'Тестовый запрос зарегистрирован! Всплывающее окно появится прямо сейчас на экране.',
          notification: testItem
        });
      }

      return res.status(400).json({ success: false, message: 'Неизвестный канал тестирования.' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e?.message || 'Ошибка тестирования канала' });
    }
  });

  // POST /api/notifications/simulate (simulate incoming customer callback)
  app.post('/api/notifications/simulate', async (req: Request, res: Response) => {
    const {
      customerName = 'Иван Сергеевич Морозов',
      phone = '+7 (927) 888-99-00',
      companyName = 'Завод точной механики «Прогресс»',
      topic = 'Поставка КИМ PMT и обучение TopSolid 7',
      preferredTime = 'В течение 10-15 минут (срочно)',
      comment = 'Срочно требуется консультация по пусконаладке в г. Самара'
    } = req.body || {};

    const notif = await dispatchManagerNotification({
      type: 'callback',
      title: `📞 Срочный обратный звонок: ${customerName}`,
      customerName,
      phone,
      companyName,
      topic,
      preferredTime,
      comment,
      callId: `CALL-2026-${Math.floor(100 + Math.random() * 900)}`
    });

    res.json({
      success: true,
      message: 'Имитация входящего звонка выполнена! Оповещение разослано во все активные каналы.',
      notification: notif
    });
  });

  // POST /api/notifications/max/check-connection (Verify bot token with dev.max.ru GET /me)
  app.post('/api/notifications/max/check-connection', async (req: Request, res: Response) => {
    try {
      const maxConfig = getMaxConfig();
      const token = (req.body?.token || req.body?.maxBotToken || maxConfig.token || '').trim();
      let apiUrl = (req.body?.apiUrl || maxConfig.apiUrl || 'https://platform-api2.max.ru').trim().replace(/\/$/, '');
      if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        apiUrl = `https://${apiUrl}`;
      }

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Токен бота МАКС не указан. Введите токен, полученный на портале dev.max.ru.'
        });
      }

      const checkUrl = `${apiUrl}/me`;
      const response = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'X-Max-Bot-Token': token,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text().catch(() => '');
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        // not json
      }

      if (response.ok) {
        const botName = data?.name || data?.first_name || data?.title || 'Официальный бот «ДС-Инжиниринг»';
        const botUsername = data?.username ? `@${data.username}` : (data?.id ? `ID: ${data.id}` : 'Активен');
        logRealtimeEvent({
          category: 'NOTIFICATION',
          level: 'SUCCESS',
          action: 'MAX_BOT_TOKEN_VERIFIED',
          summary: `Токен МАКС-бота успешно подтвержден: ${botName} (${botUsername})`
        });
        return res.json({
          success: true,
          bot: data,
          message: `Бот в мессенджере МАКС успешно авторизован! Бот: «${botName}» (${botUsername}). Платформа: platform-api2.max.ru`
        });
      }

      if (response.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Ошибка авторизации (HTTP 401): Неверный токен бота МАКС. Скопируйте актуальный токен в кабинете разработчика dev.max.ru.'
        });
      }

      return res.status(response.status).json({
        success: false,
        message: `Шлюз МАКС вернул HTTP ${response.status}: ${data?.message || data?.description || responseText.slice(0, 150) || 'Ошибка проверки токена'}`
      });
    } catch (e: any) {
      return res.status(500).json({
        success: false,
        message: `Сетевая ошибка при проверке бота МАКС: ${e?.message || e}`
      });
    }
  });

  // POST /api/notifications/max/register-webhook (Register webhook subscriptions on platform-api2.max.ru)
  app.post('/api/notifications/max/register-webhook', async (req: Request, res: Response) => {
    try {
      const maxConfig = getMaxConfig();
      const token = (req.body?.token || req.body?.maxBotToken || maxConfig.token || '').trim();
      let apiUrl = (req.body?.apiUrl || maxConfig.apiUrl || 'https://platform-api2.max.ru').trim().replace(/\/$/, '');
      if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        apiUrl = `https://${apiUrl}`;
      }
      const hostUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const defaultWebhookUrl = `${hostUrl.replace(/\/$/, '')}/api/notifications/max/webhook`;
      const webhookUrl = (req.body?.webhookUrl || maxConfig.webhookUrl || defaultWebhookUrl).trim();

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Токен бота МАКС не указан.'
        });
      }

      const subscribeUrl = `${apiUrl}/subscriptions`;
      const subRes = await fetch(subscribeUrl, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'X-Max-Bot-Token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: webhookUrl,
          update_types: ['message_created', 'message_callback']
        })
      });

      const responseText = await subRes.text().catch(() => '');
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        // text
      }

      if (subRes.ok) {
        logRealtimeEvent({
          category: 'NOTIFICATION',
          level: 'SUCCESS',
          action: 'MAX_BOT_WEBHOOK_REGISTERED',
          summary: `Webhook бота МАКС успешно привязан к адресу: ${webhookUrl}`
        });
        return res.json({
          success: true,
          message: `Webhook для входящих сообщений чат-бота успешно зарегистрирован в МАКС! URL: ${webhookUrl}`,
          data
        });
      }

      return res.status(subRes.status).json({
        success: false,
        message: `Ошибка регистрации Webhook на сервере МАКС (HTTP ${subRes.status}): ${data?.message || data?.description || responseText.slice(0, 150)}`
      });
    } catch (e: any) {
      return res.status(500).json({
        success: false,
        message: `Сетевая ошибка при регистрации Webhook МАКС: ${e?.message || e}`
      });
    }
  });

  // POST & GET /api/notifications/max/webhook and /api/max/webhook (Interactive Incoming Chat-Bot Gateway)
  const handleMaxIncomingWebhook = async (req: Request, res: Response) => {
    if (req.method === 'GET') {
      return res.json({
        service: 'DS-Engineering MAX Messenger Gateway',
        status: 'online',
        supportedEndpoints: ['POST /messages', 'POST /subscriptions', 'GET /me'],
        timestamp: new Date().toISOString()
      });
    }

    // Always respond 200 OK fast to acknowledge receipt per dev.max.ru webhook requirements
    res.status(200).json({ ok: true });

    try {
      const body = req.body || {};
      const message = body.message || body;
      const rawText = (message.text || body.text || '').trim();
      const senderChatId = message.chat_id || body.chat_id || message.sender?.user_id || message.user_id || body.user_id;

      if (!senderChatId || !rawText) {
        return;
      }

      const maxConfig = getMaxConfig();
      if (!maxConfig.token) {
        return;
      }

      const lower = rawText.toLowerCase();
      let replyText = '';

      if (lower.startsWith('/start') || lower.startsWith('/help') || lower === 'старт' || lower === 'меню' || lower === 'привет') {
        replyText = [
          `👋 Здравствуйте! Вас приветствует официальный бот Инжинирингового Центра «ДС-Инжиниринг» (г. Самара).`,
          ``,
          `Мы оказываем полный комплекс метрологических и инжиниринговых услуг:`,
          `⚙️ Портальные КИМ Hexagon Global и измерительные руки Absolute Arm`,
          `🔬 Высокоточное 3D-сканирование Shining 3D FreeScan и метрологический контроль геометрии`,
          `📐 Реверс-инжиниринг деталей и узлов любой сложности`,
          `📑 Поверка и калибровка средств измерений (аккредитация в ФГИС «АРШИН»)`,
          `💻 Внедрение измерительного ПО: PolyWorks, Geomagic Control X/Design X, TopSolid 7`,
          ``,
          `📍 Быстрые команды:`,
          `/rfq — Оформить техническую заявку на расчет стоимости`,
          `/call — Заказать звонок дежурного инженера`,
          `/status — Проверить статус заявки в CRM`,
          `/contacts — Контакты и адрес главного офиса в Самаре (ул. Свободы, 198)`,
          `/arshin — Сведения о поверке средств измерений`,
          ``,
          `Вы также можете задать любой технический вопрос прямо в этот диалог!`
        ].join('\n');
      } else if (lower.startsWith('/rfq') || lower.includes('заявк') || lower.includes('расчет')) {
        replyText = [
          `📋 Оформление заявки на расчет (RFQ):`,
          `Для оперативного расчета направьте чертежи или 3D-модели (STEP, IGES, STL) с указанием требований к допускам:`,
          `🔗 Онлайн-форма расчета: ${process.env.APP_URL || 'https://ds-enginering.ru'}/#services?action=rfq`,
          `✉️ Email для чертежей: info@ds-enginering.ru`,
          `📞 Телефон инженерного отдела: +7 (846) 954-02-92`
        ].join('\n');
      } else if (lower.startsWith('/call') || lower.includes('звонок') || lower.includes('позвон')) {
        replyText = [
          `📞 Заказ обратного звонка инженера:`,
          `Напишите ваш контактный номер телефона в этот чат, либо свяжитесь с нами напрямую:`,
          `📱 Горячая линия инженеров: +7 (937) 984-61-51`,
          `🏢 Городской телефон (г. Самара): +7 (846) 954-02-92`,
          `Дежурный специалист перезвонит вам в течение 10–15 минут!`
        ].join('\n');
      } else if (lower.startsWith('/contacts') || lower.includes('контакт') || lower.includes('адрес')) {
        replyText = [
          `🏢 ООО «ДС-Инжиниринг»`,
          `📍 443051, РФ, Самарская обл., г. Самара, ул. Свободы, д. 198, офис 208`,
          `📞 Телефон: +7 (846) 954-02-92`,
          `📱 Дежурный инженер: +7 (937) 984-61-51`,
          `✉️ Email: info@ds-enginering.ru`,
          `🌐 Официальный сайт: https://ds-enginering.ru`,
          `🕒 График работы: Пн-Пт: 09:00 — 17:00 (МСК+1 / Самара)`
        ].join('\n');
      } else if (lower.startsWith('/arshin') || lower.includes('аршин') || lower.includes('поверк')) {
        replyText = [
          `📑 Метрологическая служба «ДС-Инжиниринг»:`,
          `• Поверка и калибровка средств геометрических измерений`,
          `• Внесение сведений во ФГИС «АРШИН»`,
          `• Метрологический консалтинг и аудит лабораторий`,
          `📞 Отдел метрологии: +7 (846) 954-02-92 (доб. 104)`
        ].join('\n');
      } else {
        replyText = [
          `🤝 Спасибо за ваше обращение!`,
          `Ваш запрос зарегистрирован и передан дежурному инженеру «ДС-Инжиниринг». Мы подготовим ответ в кратчайшие сроки.`,
          ``,
          `Для срочной консультации:`,
          `📞 +7 (846) 954-02-92`,
          `📱 +7 (937) 984-61-51`,
          `✉️ info@ds-enginering.ru`
        ].join('\n');
      }

      // Send response back via official MAX platform endpoint
      const sendUrl = `${maxConfig.apiUrl}/messages`;
      const numericChatId = !isNaN(Number(senderChatId)) ? Number(senderChatId) : senderChatId;
      await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Authorization': maxConfig.token,
          'X-Max-Bot-Token': maxConfig.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: numericChatId,
          text: replyText
        })
      });

      logRealtimeEvent({
        category: 'NOTIFICATION',
        level: 'INFO',
        action: 'MAX_BOT_INTERACTIVE_REPLY',
        summary: `Чат-бот МАКС ответил пользователю (chat_id: ${senderChatId}) на запрос: «${rawText.slice(0, 40)}»`
      });
    } catch (webhookErr: any) {
      logRealtimeEvent({
        category: 'NOTIFICATION',
        level: 'WARN',
        action: 'MAX_BOT_WEBHOOK_ERROR',
        summary: `Ошибка обработки входящего webhook МАКС: ${webhookErr?.message || webhookErr}`
      });
    }
  };

  app.post('/api/notifications/max/webhook', handleMaxIncomingWebhook);
  app.get('/api/notifications/max/webhook', handleMaxIncomingWebhook);
  app.post('/api/max/webhook', handleMaxIncomingWebhook);
  app.get('/api/max/webhook', handleMaxIncomingWebhook);
}
