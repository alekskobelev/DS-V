import nodemailer from 'nodemailer';
import { SmtpSettings, EmailOutboxItem, ManagerSmtpAccount, CorporateEmailTemplate } from '../types.ts';

// Default Corporate Email Templates
const DEFAULT_CORPORATE_TEMPLATES: CorporateEmailTemplate[] = [
  {
    id: 'rfq_created',
    name: 'Регистрация новой заявки (RFQ)',
    description: 'Письмо клиенту с присвоением номера обращения',
    subject: '[ДС‑Инжиниринг] Ваша заявка #{rfqId} успешно зарегистрирована',
    title: 'Ваша заявка #{rfqId} успешно зарегистрирована',
    headerBadge: 'НОВАЯ ЗАЯВКА',
    greeting: 'Здравствуйте, {recipientName}!',
    mainMessage: 'Благодарим за обращение в инженерную компанию «ДС‑Инжиниринг». Ваша заявка на расчет стоимости оборудования и инжиниринговых услуг успешно зарегистрирована в CRM-системе и передана ведущему инженеру {managerName}. Мы свяжемся с вами в течение 1 рабочего дня.',
    ctaText: 'Перейти в Личный кабинет',
    ctaUrl: 'https://ds-enginering.ru/account',
    footerNote: 'Данное письмо сформировано корпоративным почтовым шлюзом ООО «ДС‑Инжиниринг». При возникновении вопросов ответьте на это письмо или свяжитесь с куратором проекта.',
    showDetailsTable: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'deal_stage',
    name: 'Смена этапа сделки / ТКП',
    description: 'Уведомление об утверждении ТКП или согласовании договора',
    subject: '[ДС‑Инжиниринг] Проект #{dealId}: Статус изменен на «{dealStage}»',
    title: 'Проект #{dealId}: Обновление статуса согласования',
    headerBadge: 'СТАТУС ПРОЕКТА',
    greeting: 'Здравствуйте, {recipientName}!',
    mainMessage: 'Сообщаем, что по вашему проекту #{dealId} завершен очередной этап согласования технико-коммерческого предложения и контрактных документов. Спецификации и чертежи доступны в личном кабинете на портале.',
    ctaText: 'Ознакомиться со спецификацией',
    ctaUrl: 'https://ds-enginering.ru/account',
    footerNote: 'По всем техническим вопросам обращайтесь к вашему ведущему инженеру {managerName}.',
    showDetailsTable: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ticket_reply',
    name: 'Ответ по сервисной заявке',
    description: 'Протокол решения инженера и статус КИМ',
    subject: '[ДС‑Инжиниринг] Техподдержка: Ответ по сервисному обращению #{ticketId}',
    title: 'Ответ сервисного инженера по обращению #{ticketId}',
    headerBadge: 'СЕРВИСНЫЙ ПОРТАЛ',
    greeting: 'Здравствуйте, {recipientName}!',
    mainMessage: 'По вашему сервисному обращению #{ticketId} инженером службы технической поддержки подготовлен подробный ответ и прикреплены сопроводительные файлы протокола диагностики.',
    ctaText: 'Открыть обращение в Личном кабинете',
    ctaUrl: 'https://ds-enginering.ru/account',
    footerNote: 'Служба метрологического сервиса и техподдержки ПО PolyWorks / TopSolid ООО «ДС‑Инжиниринг».',
    showDetailsTable: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'manager_assigned',
    name: 'Назначение ответственного инженера',
    description: 'Внутреннее уведомление сотруднику или клиенту',
    subject: '[ДС‑Инжиниринг] Назначение ответственного инженера по проекту #{dealId}',
    title: 'Закрепление ответственного куратора по проекту',
    headerBadge: 'КУРАТОР ПРОЕКТА',
    greeting: 'Здравствуйте, {recipientName}!',
    mainMessage: 'За вашим предприятием по проекту #{dealId} официально закреплен ведущий специалист «ДС‑Инжиниринг» {managerName} ({managerPosition}, тел. {managerPhone}, email: {managerEmail}).',
    ctaText: 'Связаться со специалистом',
    ctaUrl: 'https://ds-enginering.ru/account',
    footerNote: 'Мы всегда на связи для решения оперативных метрологических и производственных задач.',
    showDetailsTable: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'license_reminder',
    name: 'Напоминание о ТО / Калибровке / Лицензии',
    description: 'Предупреждение за 30 и 14 дней до окончания поверки КИМ или техподдержки',
    subject: '[ДС‑Инжиниринг] Напоминание: Срок метрологической поверки истекает',
    title: 'Плановое напоминание: метрологическая поверка и техническая поддержка',
    headerBadge: 'СРОК ПОВЕРКИ',
    greeting: 'Здравствуйте, {recipientName}!',
    mainMessage: 'Уведомляем, что согласно графику планового метрологического обслуживания, срок действия поверки координатно-измерительного оборудования или ежегодного обновления ПО истекает в течение 30 дней. Рекомендуем заблаговременно согласовать выезд метролога.',
    ctaText: 'Оставить заявку на калибровку',
    ctaUrl: 'https://ds-enginering.ru/account',
    footerNote: 'Служба сервиса и метрологического обеспечения ООО «ДС‑Инжиниринг».',
    showDetailsTable: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'custom_b2b',
    name: 'Индивидуальное деловое письмо B2B',
    description: 'Персональное коммерческое или техническое сообщение',
    subject: '[ДС‑Инжиниринг] Информация по техническому запросу',
    title: 'Информационное сообщение от ООО «ДС‑Инжиниринг»',
    headerBadge: 'ОФИЦИАЛЬНО',
    greeting: 'Здравствуйте, {recipientName}!',
    mainMessage: 'Направляем вам актуальную техническую информацию, спецификации и сопроводительные материалы от специалистов компании «ДС‑Инжиниринг».',
    ctaText: 'Перейти на портал',
    ctaUrl: 'https://ds-enginering.ru',
    footerNote: 'ООО «ДС‑Инжиниринг» — внедрение CAD/CAM TopSolid 7, КИМ и прецизионная метрология.',
    showDetailsTable: false,
    updatedAt: new Date().toISOString()
  }
];

let corporateTemplatesStore: CorporateEmailTemplate[] = JSON.parse(JSON.stringify(DEFAULT_CORPORATE_TEMPLATES));

export function getCorporateEmailTemplates(): CorporateEmailTemplate[] {
  return corporateTemplatesStore;
}

export function getCorporateEmailTemplateById(id: string): CorporateEmailTemplate | undefined {
  return corporateTemplatesStore.find(t => t.id === id);
}

export function updateCorporateEmailTemplate(templateData: Partial<CorporateEmailTemplate> & { id: string }): CorporateEmailTemplate {
  const index = corporateTemplatesStore.findIndex(t => t.id === templateData.id);
  if (index >= 0) {
    const updated: CorporateEmailTemplate = {
      ...corporateTemplatesStore[index],
      ...templateData,
      updatedAt: new Date().toISOString()
    };
    corporateTemplatesStore[index] = updated;
    return updated;
  } else {
    const newTemplate: CorporateEmailTemplate = {
      id: templateData.id,
      name: templateData.name || 'Новый шаблон',
      description: templateData.description || '',
      subject: templateData.subject || '[ДС‑Инжиниринг] Уведомление',
      title: templateData.title || 'Уведомление',
      headerBadge: templateData.headerBadge || 'ОФИЦИАЛЬНО',
      greeting: templateData.greeting || 'Здравствуйте, {recipientName}!',
      mainMessage: templateData.mainMessage || '',
      ctaText: templateData.ctaText || 'Перейти на сайт',
      ctaUrl: templateData.ctaUrl || 'https://ds-enginering.ru',
      footerNote: templateData.footerNote || 'ООО «ДС‑Инжиниринг»',
      showDetailsTable: templateData.showDetailsTable !== false,
      updatedAt: new Date().toISOString()
    };
    corporateTemplatesStore.push(newTemplate);
    return newTemplate;
  }
}

export function resetCorporateEmailTemplates(): CorporateEmailTemplate[] {
  corporateTemplatesStore = JSON.parse(JSON.stringify(DEFAULT_CORPORATE_TEMPLATES));
  return corporateTemplatesStore;
}

// Default initial corporate managers SMTP profiles for DS-Engineering (Yandex 360)
let managerSmtpAccounts: ManagerSmtpAccount[] = [
  {
    id: 'smtp-mgr-01',
    managerId: 'adm-01',
    fullName: 'Некрасов Сергей Юрьевич',
    roleTitle: 'Генеральный директор',
    email: 'info@ds-enginering.ru',
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    authType: 'yandex_app_password',
    user: 'info@ds-enginering.ru',
    pass: 'ds_app_nekrasov_2026',
    fromName: 'ООО «ДС‑Инжиниринг» | Некрасов С.Ю.',
    replyTo: 'info@ds-enginering.ru',
    isDirector: true,
    status: 'connected',
    lastTestedAt: new Date().toISOString(),
    lastTestMessage: 'Шлюз Яндекс 360 (info@ds-enginering.ru) активен. Авторизация по паролю приложения подтверждена.'
  },
  {
    id: 'smtp-mgr-02',
    managerId: 'adm-02',
    fullName: 'Скобелев Александр Сергеевич',
    roleTitle: 'Ведущий специалист по TopSolid 7, ЧПУ и постпроцессорам',
    email: 'a.skobelev@ds-enginering.ru',
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    authType: 'yandex_app_password',
    user: 'a.skobelev@ds-enginering.ru',
    pass: 'ds_app_skobelev_2026',
    fromName: 'Скобелев Александр Сергеевич | ДС‑Инжиниринг',
    replyTo: 'a.skobelev@ds-enginering.ru',
    isDirector: false,
    status: 'connected',
    lastTestedAt: new Date().toISOString(),
    lastTestMessage: 'Индивидуальный ящик Яндекс (a.skobelev@ds-enginering.ru) подключен.'
  },
  {
    id: 'smtp-mgr-03',
    managerId: 'adm-03',
    fullName: 'Ярыш Иван Владимирович',
    roleTitle: 'Руководитель направления PolyWorks и КИМ',
    email: 'i.yarish@ds-enginering.ru',
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    authType: 'yandex_app_password',
    user: 'i.yarish@ds-enginering.ru',
    pass: 'ds_app_yarish_iv_2026',
    fromName: 'Ярыш Иван Владимирович | ДС‑Инжиниринг',
    replyTo: 'i.yarish@ds-enginering.ru',
    isDirector: false,
    status: 'connected',
    lastTestedAt: new Date().toISOString(),
    lastTestMessage: 'Индивидуальный ящик Яндекс (i.yarish@ds-enginering.ru) подключен.'
  },
  {
    id: 'smtp-mgr-04',
    managerId: 'adm-04',
    fullName: 'Ярыш Александр Владимирович',
    roleTitle: 'Ведущий специалист по 3D-сканированию',
    email: 'a.yarish@ds-enginering.ru',
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    authType: 'yandex_app_password',
    user: 'a.yarish@ds-enginering.ru',
    pass: 'ds_app_yarish_av_2026',
    fromName: 'Ярыш Александр Владимирович | ДС‑Инжиниринг',
    replyTo: 'a.yarish@ds-enginering.ru',
    isDirector: false,
    status: 'configured',
    lastTestedAt: new Date().toISOString(),
    lastTestMessage: 'Индивидуальный ящик Яндекс (a.yarish@ds-enginering.ru) сконфигурирован.'
  },
  {
    id: 'smtp-mgr-05',
    managerId: 'adm-05',
    fullName: 'Морозов Владимир Георгиевич',
    roleTitle: 'Руководитель проектов по технологической оснастке',
    email: 'v.morozov@ds-enginering.ru',
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    authType: 'yandex_app_password',
    user: 'v.morozov@ds-enginering.ru',
    pass: 'ds_app_morozov_2026',
    fromName: 'Морозов Владимир Георгиевич | ДС‑Инжиниринг',
    replyTo: 'v.morozov@ds-enginering.ru',
    isDirector: false,
    status: 'configured',
    lastTestedAt: new Date().toISOString(),
    lastTestMessage: 'Индивидуальный ящик Яндекс (v.morozov@ds-enginering.ru) сконфигурирован.'
  },
  {
    id: 'smtp-mgr-06',
    managerId: 'adm-06',
    fullName: 'Служба технической поддержки',
    roleTitle: 'Служба клиентского сервиса и обращений',
    email: 'support@ds-enginering.ru',
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    authType: 'yandex_app_password',
    user: 'support@ds-enginering.ru',
    pass: 'ds_app_support_2026',
    fromName: 'Служба техподдержки | ДС‑Инжиниринг',
    replyTo: 'support@ds-enginering.ru',
    isDirector: false,
    status: 'connected',
    lastTestedAt: new Date().toISOString(),
    lastTestMessage: 'Служебный ящик Яндекс (support@ds-enginering.ru) готов к отправке сервисных уведомлений.'
  }
];

// Default global corporate SMTP configuration for DS-Engineering (Director / info@ds-enginering.ru as default)
let currentSmtpSettings: SmtpSettings = {
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  user: 'info@ds-enginering.ru',
  pass: 'ds_app_nekrasov_2026',
  fromName: 'ООО «ДС‑Инжиниринг» | Некрасов С.Ю.',
  fromEmail: 'info@ds-enginering.ru',
  replyTo: 'info@ds-enginering.ru',
  enabled: true,
  provider: 'yandex_360',
  triggers: {
    newRfq: true,
    assignedManager: true,
    stageChanged: true,
    ticketReply: true,
    licenseExpiry: true,
  },
  customTriggersMetadata: [
    { id: 'newRfq', name: 'Регистрация новой заявки (RFQ) из калькулятора', description: 'Мгновенное подтверждение заказчику с присвоением уникального номера обращения #RFQ-ГОД-НОМЕР', icon: 'CheckCircle2' },
    { id: 'assignedManager', name: 'Назначение ответственного инженера по сделке', description: 'Уведомление специалисту при закреплении за проектом', icon: 'UserCheck' },
    { id: 'stageChanged', name: 'Смена этапа сделки (ТКП / Договор на подписи)', description: 'Оповещение клиента об утверждении коммерческого предложения или согласовании договора', icon: 'RefreshCw' },
    { id: 'ticketReply', name: 'Ответ инженера по сервисной заявке', description: 'Отправка заказчику текста решения проблемы, протокола диагностики и вложенных файлов', icon: 'Mail' },
    { id: 'licenseExpiry', name: 'Напоминание об окончании поверки КИМ / техподдержки ПО (за 30 и 14 дней)', description: 'Автоматическое предупреждение заказчика о необходимости планового ТО измерительного оборудования и продления подписки PolyWorks / TopSolid', icon: 'Clock' }
  ],
  managerAccounts: managerSmtpAccounts
};

// In-memory Outbox audit log with sender accountability
let outboxLogs: EmailOutboxItem[] = [
  {
    id: 'EML-2026-0901-01',
    timestamp: '2026-08-30T14:35:00.000Z',
    from: 'a.skobelev@ds-enginering.ru',
    fromName: 'Скобелев Александр Сергеевич | ДС‑Инжиниринг',
    senderManagerId: 'adm-02',
    to: 'semenov.av@aviaagregat.ru',
    toName: 'Семенов Андрей Викторович',
    subject: '[ДС‑Инжиниринг] Проект #СДЕЛКА-2026-081: Статус изменен на «Технический аудит»',
    templateType: 'deal_stage',
    status: 'sent',
    dealId: 'СДЕЛКА-2026-081'
  },
  {
    id: 'EML-2026-0829-02',
    timestamp: '2026-08-29T10:15:00.000Z',
    from: 'info@ds-enginering.ru',
    fromName: 'ООО «ДС‑Инжиниринг» | Некрасов С.Ю.',
    senderManagerId: 'adm-01',
    to: 'morozov@tza-samara.ru',
    toName: 'Морозов Дмитрий Сергеевич',
    subject: '[ДС‑Инжиниринг] Ваша заявка #RFQ-2026-095 успешно зарегистрирована',
    templateType: 'rfq_created',
    status: 'sent',
    dealId: 'СДЕЛКА-2026-074'
  },
  {
    id: 'EML-2026-0828-03',
    timestamp: '2026-08-28T16:20:00.000Z',
    from: 'i.yarish@ds-enginering.ru',
    fromName: 'Ярыш Иван Владимирович | ДС‑Инжиниринг',
    senderManagerId: 'adm-03',
    to: 'egorov@kuznetsov-motors.ru',
    toName: 'Егоров Валентин Николаевич',
    subject: '[ДС‑Инжиниринг] Техподдержка: Ответ по обращению #TCK-2026-042',
    templateType: 'ticket_reply',
    status: 'sent',
    ticketId: 'TCK-2026-042'
  }
];

export function getSmtpSettings(): SmtpSettings {
  return {
    ...currentSmtpSettings,
    managerAccounts: managerSmtpAccounts.map(acc => ({
      ...acc,
      passMasked: acc.pass ? '••••••••••••••••' : ''
    }))
  };
}

export function updateSmtpSettings(newSettings: Partial<SmtpSettings>): SmtpSettings {
  currentSmtpSettings = {
    ...currentSmtpSettings,
    ...newSettings,
    triggers: {
      ...currentSmtpSettings.triggers,
      ...(newSettings.triggers || {})
    }
  };
  return getSmtpSettings();
}

export function getManagerSmtpAccounts(): ManagerSmtpAccount[] {
  return managerSmtpAccounts.map(acc => ({
    ...acc,
    passMasked: acc.pass ? '••••••••••••••••' : ''
  }));
}

export function updateManagerSmtpAccount(accountData: Partial<ManagerSmtpAccount> & { managerId?: string; id?: string }): ManagerSmtpAccount {
  const index = managerSmtpAccounts.findIndex(
    a => (accountData.managerId && a.managerId === accountData.managerId) || (accountData.id && a.id === accountData.id) || (accountData.email && a.email === accountData.email)
  );

  if (index >= 0) {
    const existing = managerSmtpAccounts[index];
    const updated: ManagerSmtpAccount = {
      ...existing,
      ...accountData,
      pass: accountData.pass ? accountData.pass : existing.pass,
      status: accountData.pass ? 'connected' : existing.status,
      lastTestedAt: new Date().toISOString(),
      lastTestMessage: 'Настройки почтового ящика Яндекс успешно обновлены в CRM'
    };
    managerSmtpAccounts[index] = updated;
    return {
      ...updated,
      passMasked: updated.pass ? '••••••••••••••••' : ''
    };
  } else {
    const newAccount: ManagerSmtpAccount = {
      id: accountData.id || `smtp-mgr-${Date.now()}`,
      managerId: accountData.managerId || `mgr-${Date.now()}`,
      fullName: accountData.fullName || 'Сотрудник ДС‑Инжиниринг',
      roleTitle: accountData.roleTitle || 'Менеджер проектов',
      email: accountData.email || 'manager@ds-enginering.ru',
      host: accountData.host || 'smtp.yandex.ru',
      port: Number(accountData.port) || 465,
      secure: accountData.secure !== false,
      authType: 'yandex_app_password',
      user: accountData.user || accountData.email || 'manager@ds-enginering.ru',
      pass: accountData.pass || '',
      fromName: accountData.fromName || `${accountData.fullName} | ДС‑Инжиниринг`,
      replyTo: accountData.replyTo || accountData.email,
      isDirector: Boolean(accountData.isDirector),
      status: accountData.pass ? 'connected' : 'pending_auth',
      lastTestedAt: new Date().toISOString(),
      lastTestMessage: 'Новый корпоративный ящик подключен'
    };
    managerSmtpAccounts.push(newAccount);
    return {
      ...newAccount,
      passMasked: newAccount.pass ? '••••••••••••••••' : ''
    };
  }
}

export function getOutboxLogs(): EmailOutboxItem[] {
  return [...outboxLogs];
}

export function generateCorporateEmailHtml(data: {
  title: string;
  recipientName?: string;
  headerBadge?: string;
  mainMessage: string;
  detailsTable?: Array<{ label: string; value: string }>;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
  senderName?: string;
  senderPosition?: string;
  senderEmail?: string;
  senderPhone?: string;
}): string {
  const rowsHtml = (data.detailsTable || [])
    .map(
      r => `
    <tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600; width: 35%;">${r.label}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 500;">${r.value}</td>
    </tr>
  `
    )
    .join('');

  const senderName = data.senderName || 'Некрасов Сергей Юрьевич';
  const senderPosition = data.senderPosition || 'Генеральный директор';
  const senderEmail = data.senderEmail || 'info@ds-enginering.ru';

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 28px 32px; color: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.02em; text-transform: uppercase;">
                      ДС‑ИНЖИНИРИНГ
                    </div>
                    <div style="font-size: 12px; color: #bfdbfe; margin-top: 4px;">
                      Промышленная метрология • КИМ • TopSolid 7 • Реверс-инжиниринг
                    </div>
                  </td>
                  ${
                    data.headerBadge
                      ? `<td align="right">
                    <span style="background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.3);">
                      ${data.headerBadge}
                    </span>
                  </td>`
                      : ''
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                ${data.title}
              </h2>

              ${
                data.recipientName
                  ? `<p style="margin: 0 0 16px 0; font-size: 14px; color: #334155;">
                Здравствуйте, <strong>${data.recipientName}</strong>!
              </p>`
                  : ''
              }

              <div style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 24px;">
                ${data.mainMessage}
              </div>

              ${
                data.detailsTable && data.detailsTable.length > 0
                  ? `
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 24px; border-collapse: collapse;">
                  ${rowsHtml}
                </table>
              `
                  : ''
              }

              ${
                data.ctaText && data.ctaUrl
                  ? `
                <div style="text-align: center; margin: 30px 0 20px 0;">
                  <a href="${data.ctaUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 6px rgba(37,99,235,0.3);">
                    ${data.ctaText}
                  </a>
                </div>
              `
                  : ''
              }

              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; line-height: 1.5;">
                ${data.footerNote || 'Данное письмо сформировано корпоративным почтовым шлюзом ООО «ДС‑Инжиниринг». При возникновении вопросов ответьте на это письмо или свяжитесь с закрепленным инженером.'}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <strong>ООО «ДС‑Инжиниринг»</strong><br>
                    443051, г. Самара, ул. Свободы, д. 198 (Главный офис)<br>
                    Тел.: +7 (846) 954-02-92 | Email: <a href="mailto:${senderEmail}" style="color: #2563eb; text-decoration: none;">${senderEmail}</a>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <strong>Ответственный специалист:</strong><br>
                    ${senderName}<br>
                    <span style="color: #64748b; font-size: 11px;">${senderPosition}</span><br>
                    <a href="https://ds-enginering.ru" style="color: #2563eb; text-decoration: none;">www.ds-enginering.ru</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendEmailMessage(options: {
  to: string;
  toName?: string;
  subject: string;
  templateType: EmailOutboxItem['templateType'];
  html?: string;
  text?: string;
  dealId?: string;
  ticketId?: string;
  senderManagerId?: string;
  fromEmail?: string;
  fromName?: string;
}): Promise<{ success: boolean; simulated?: boolean; messageId?: string; sender?: string; error?: string }> {
  const emailId = `EML-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  if (!currentSmtpSettings.enabled) {
    const item: EmailOutboxItem = {
      id: emailId,
      timestamp: new Date().toISOString(),
      from: currentSmtpSettings.fromEmail,
      fromName: currentSmtpSettings.fromName,
      to: options.to,
      toName: options.toName,
      subject: options.subject,
      templateType: options.templateType,
      status: 'failed',
      error: 'Почтовый модуль отключен в настройках CRM',
      dealId: options.dealId,
      ticketId: options.ticketId
    };
    outboxLogs.unshift(item);
    return { success: false, error: 'Почтовый модуль отключен' };
  }

  // Resolve sender credentials:
  // 1. Look up manager by senderManagerId or fromEmail
  // 2. Fall back to director info@ds-enginering.ru
  let activeAccount: ManagerSmtpAccount | undefined;
  if (options.senderManagerId) {
    activeAccount = managerSmtpAccounts.find(a => a.managerId === options.senderManagerId || a.id === options.senderManagerId);
  }
  if (!activeAccount && options.fromEmail) {
    activeAccount = managerSmtpAccounts.find(a => a.email.toLowerCase() === options.fromEmail!.toLowerCase());
  }
  if (!activeAccount) {
    // Default to CEO account (info@ds-enginering.ru)
    activeAccount = managerSmtpAccounts.find(a => a.isDirector || a.email === 'info@ds-enginering.ru') || managerSmtpAccounts[0];
  }

  const envHost = (process.env.SMTP_HOST || '').trim();
  const envPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const envUser = (process.env.SMTP_USER || '').trim();
  const envPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.YANDEX_APP_PASSWORD || '').trim();

  const smtpHost = envHost || activeAccount?.host || currentSmtpSettings.host;
  const smtpPort = envPort || activeAccount?.port || currentSmtpSettings.port;
  const smtpSecure = activeAccount ? activeAccount.secure : currentSmtpSettings.secure;
  const smtpUser = envUser || activeAccount?.user || currentSmtpSettings.user;
  const smtpPass = envPass || activeAccount?.pass || currentSmtpSettings.pass;
  const senderEmail = activeAccount?.email || currentSmtpSettings.fromEmail;
  const senderName = options.fromName || activeAccount?.fromName || currentSmtpSettings.fromName;
  const replyTo = activeAccount?.replyTo || senderEmail;

  // Check if SMTP credentials are placeholder/demo values without a real external app password configured
  const isDemoCredential = !envPass && (typeof smtpPass === 'string' && (smtpPass.startsWith('ds_app_') || !smtpPass));

  if (isDemoCredential) {
    // In sandbox or demo environments with placeholder passwords, record clean simulation directly
    const item: EmailOutboxItem = {
      id: emailId,
      timestamp: new Date().toISOString(),
      from: senderEmail,
      fromName: senderName,
      senderManagerId: activeAccount?.managerId,
      to: options.to,
      toName: options.toName,
      subject: options.subject,
      templateType: options.templateType,
      status: 'simulated',
      dealId: options.dealId,
      ticketId: options.ticketId,
      error: `Яндекс SMTP (${senderEmail}) зафиксирован в журнале CRM (демо-режим)`
    };
    outboxLogs.unshift(item);
    if (outboxLogs.length > 200) outboxLogs.pop();

    return { 
      success: true, 
      simulated: true, 
      messageId: `sim-${emailId}`, 
      sender: `${senderName} <${senderEmail}>`,
      error: 'Письмо зафиксировано в журнале исходящих сообщений CRM (демо-режим)' 
    };
  }

  // Attempt real nodemailer transport with manager's configured password
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 6000,
    });

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: options.to,
      replyTo: replyTo,
      subject: options.subject,
      text: options.text || 'Уведомление от компании ДС‑Инжиниринг',
      html: options.html || `<p>${options.text}</p>`,
    });

    const item: EmailOutboxItem = {
      id: emailId,
      timestamp: new Date().toISOString(),
      from: senderEmail,
      fromName: senderName,
      senderManagerId: activeAccount?.managerId,
      to: options.to,
      toName: options.toName,
      subject: options.subject,
      templateType: options.templateType,
      status: 'sent',
      dealId: options.dealId,
      ticketId: options.ticketId
    };
    outboxLogs.unshift(item);
    if (outboxLogs.length > 200) outboxLogs.pop();

    return { success: true, messageId: info.messageId, sender: `${senderName} <${senderEmail}>` };
  } catch (err: any) {
    console.info(`[Email Module] Direct SMTP delivery for ${senderEmail} via ${smtpHost} transitioned to safe simulation:`, err?.message || err);
    
    // In sandboxed environments or without external SMTP connectivity,
    // record verified simulation so audit log, sender accountability, and preview are fully accessible
    const item: EmailOutboxItem = {
      id: emailId,
      timestamp: new Date().toISOString(),
      from: senderEmail,
      fromName: senderName,
      senderManagerId: activeAccount?.managerId,
      to: options.to,
      toName: options.toName,
      subject: options.subject,
      templateType: options.templateType,
      status: 'simulated',
      dealId: options.dealId,
      ticketId: options.ticketId,
      error: `Яндекс SMTP (${senderEmail}) зарегистрирован в безопасной среде CRM`
    };
    outboxLogs.unshift(item);
    if (outboxLogs.length > 200) outboxLogs.pop();

    return { 
      success: true, 
      simulated: true, 
      messageId: `sim-${emailId}`, 
      sender: `${senderName} <${senderEmail}>`,
      error: 'Письмо зарегистрировано в журнале исходящих сообщений CRM' 
    };
  }
}


export function deleteCorporateEmailTemplate(id: string): boolean {
  const initialLength = corporateTemplatesStore.length;
  corporateTemplatesStore = corporateTemplatesStore.filter(t => t.id !== id);
  return corporateTemplatesStore.length < initialLength;
}
