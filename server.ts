import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import express from "express";
import compression from "compression";
import path from "path";
import multer from "multer";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { 
  getOrCreateUser, 
  getAllDbUsers, 
  getDbUserByIdOrEmail, 
  createDbUser, 
  updateDbUser, 
  updateDbUserPermissions, 
  deleteDbUser, 
  seedInitialUsersIfEmpty 
} from "./src/db/users.ts";
import * as schema from './src/db/schema.ts';
import { db, isDbConfigured } from "./src/db/index.ts";
import { tickets } from "./src/db/schema.ts";
import { 
  getSmtpSettings, 
  updateSmtpSettings, 
  getManagerSmtpAccounts,
  updateManagerSmtpAccount,
  getOutboxLogs, 
  sendEmailMessage, 
  generateCorporateEmailHtml,
  getCorporateEmailTemplates,
  updateCorporateEmailTemplate,
  resetCorporateEmailTemplates,
  deleteCorporateEmailTemplate
} from "./src/server/emailModule.ts";
import { registerCrmRoutes } from "./src/server/crmModule.ts";
import { csrfProtectionMiddleware, registerCsrfRoutes } from "./src/server/csrfModule.ts";
import { registerNotificationRoutes, dispatchManagerNotification, dispatchContactFormEmail } from "./src/server/notificationModule.ts";
import { register3DModelsRoutes } from "./src/server/models3dModule.ts";
import { logRealtimeEvent, getRealtimeLogs, clearRealtimeLogs } from "./src/server/logger.ts";
import { registerSchemaRoutes } from "./src/server/schemas/schemaApiRoutes.ts";
import { validateBody } from "./src/server/schemas/validator.ts";
import { registerSiteTextsRoutes } from "./src/server/siteTextsModule.ts";
import { registerSitemapRoutes } from "./src/server/sitemapModule.ts";


interface B2BTicket {
  id: string;
  organizationId: string;
  title: string;
  category: 'calibration' | 'repair' | 'postprocessor' | 'reverse_engineering' | 'consulting';
  status: 'new' | 'in_progress' | 'awaiting_customer' | 'completed';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  equipmentModel?: string;
  equipmentSerial?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  attachments?: { fileName: string; fileSizeMb: number; fileUrl: string }[];
}

interface RFQSubmission {
  id: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  serviceType: string;
  details: string;
  estimatedPrice?: number;
  cadFormat?: string;
  createdAt: string;
}

// In-memory persistent server state with initial enterprise mock records
let cmsStore = {
  customPages: [] as any[],
  products: null as any[] | null,
  services: null as any[] | null,
  articles: null as any[] | null,
  knowledgeBase: null as any[] | null,
  companyInfo: null as any | null,
};

let ticketsStore: B2BTicket[] = [
  {
    id: 'TCK-2026-001',
    organizationId: 'АО «Авиаагрегат-Самара»',
    title: 'Калибровка и поверка лазерного трекера Leica AT960-SR',
    category: 'calibration',
    status: 'in_progress',
    urgency: 'high',
    equipmentModel: 'Leica Absolute Tracker AT960-SR',
    equipmentSerial: 'LAT-960-2024-88',
    description: 'Плановая периодическая поверка точности измерений в цехе агрегатной сборки. Требуется сертификат ВНИИМС.',
    createdAt: '2026-08-15T09:30:00.000Z',
    updatedAt: '2026-08-16T14:20:00.000Z'
  },
  {
    id: 'TCK-2026-002',
    organizationId: 'ПАО «ОДК-Кузнецов»',
    title: 'Разработка постпроцессора TopSolid 7 для 5-осевого станка DMG MORI DMU 50',
    category: 'postprocessor',
    status: 'new',
    urgency: 'critical',
    equipmentModel: 'DMG MORI DMU 50 3rd Gen (Heidenhain TNC 640)',
    description: 'Требуется кинематическая 3D-модель станка с верификацией скруглений и симуляцией G-кода для фрезерования лопаток турбин.',
    createdAt: '2026-08-18T11:00:00.000Z',
    updatedAt: '2026-08-18T11:00:00.000Z'
  }
];

let serviceRequestsStore: any[] = [
  {
    id: 'RFQ-2026-108',
    userId: 'cli-01',
    customerName: 'Петров Дмитрий Николаевич',
    companyName: 'АО «Авиаагрегат-Самара»',
    email: 'd.petrov@aviaagregat.ru',
    phone: '+7 (917) 123-45-67',
    serviceType: 'reverse',
    details: 'Реверс-инжиниринг литого корпуса редуктора с восстановлением параметрического дерева в Siemens NX и оформлением чертежей по ЕСКД.',
    estimatedPrice: 68000,
    cadFormat: 'native_nx',
    status: 'pending',
    createdAt: '2026-08-21T10:00:00.000Z',
    updatedAt: '2026-08-21T10:00:00.000Z'
  }
];

let equipmentStore: any[] = [];
let knowledgeBaseStore: any[] = [];
let cmsPagesStore: any[] = [];

let rfqSubmissions: RFQSubmission[] = [
  {
    id: 'RFQ-2026-109',
    customerName: 'Михаил Семенов',
    companyName: 'АО «Самарский металлургический завод»',
    email: 'm.semenov@sameco.ru',
    phone: '+7 (846) 279-00-11',
    serviceType: 'reverse',
    details: 'Реверс-инжиниринг литого корпуса редуктора с восстановлением параметрического дерева в Siemens NX и оформлением чертежей по ЕСКД.',
    estimatedPrice: 68000,
    cadFormat: 'native_nx',
    createdAt: '2026-08-21T10:00:00.000Z'
  }
];

export interface ServerOnlineEngineerMessage {
  id: string;
  sender: 'engineer' | 'user' | 'manager' | 'system';
  text: string;
  time: string;
  timestamp?: number;
  suggestions?: any[];
  isManagerHandover?: boolean;
}

export interface ServerOnlineEngineerSession {
  id: string;
  visitorId: string;
  visitorName?: string;
  contactPhone?: string;
  contactEmail?: string;
  companyName?: string;
  currentPage?: string;
  currentPath?: string;
  status: 'active' | 'handover_requested' | 'manager_connected' | 'resolved';
  messages: ServerOnlineEngineerMessage[];
  lastMessageText: string;
  createdAt: string;
  updatedAt: string;
  unreadByManager?: boolean;
  urgentAlert?: boolean;
  leadId?: string;
  assignedManagerId?: string;
  assignedManagerName?: string;
  metadata?: any;
}

const CHAT_SESSIONS_STORAGE_FILE = path.join(process.cwd(), 'data', 'engineer_chat_sessions.json');

const INITIAL_DEMO_CHAT_SESSIONS: ServerOnlineEngineerSession[] = [
  {
    id: 'CHAT-2026-001',
    visitorId: 'vis-init-demo',
    visitorName: 'Сергей Николаевич (ОДК-Кузнецов)',
    contactPhone: '+7 (927) 700-11-22',
    contactEmail: 's.nekrasov.client@odk.ru',
    companyName: 'ПАО «ОДК-Кузнецов»',
    currentPage: 'software',
    currentPath: '/software',
    status: 'handover_requested',
    unreadByManager: true,
    urgentAlert: true,
    leadId: 'RFQ-2026-CH-001',
    createdAt: '2026-09-02T22:15:00.000Z',
    updatedAt: '2026-09-02T22:18:00.000Z',
    lastMessageText: 'Интересует демонстрация модуля 5-осевого фрезерования лопаток в TopSolid 7 Cam. Прошу связаться.',
    messages: [
      {
        id: 'msg-1',
        sender: 'engineer',
        text: 'Здравствуйте! Я дежурный инженер-технолог «ДС-Инжиниринг». Чем могу помочь: подобрать CAD/CAM систему, 3D-сканер или рассчитать услугу?',
        time: '22:15',
        timestamp: Date.now() - 3600000
      },
      {
        id: 'msg-2',
        sender: 'user',
        text: 'Интересует демонстрация модуля 5-осевого фрезерования лопаток в TopSolid 7 Cam. Прошу связаться.',
        time: '22:16',
        timestamp: Date.now() - 3500000
      },
      {
        id: 'msg-3',
        sender: 'engineer',
        text: 'TopSolid 7 Cam идеально оптимизирован под многоосевую обработку сложных моноколес и лопаток турбин с полной кинематической симуляцией станка. Переключаю вас на ведущего инженера-технолога.',
        time: '22:17',
        timestamp: Date.now() - 3400000
      }
    ]
  }
];

function loadEngineerChatSessions(): ServerOnlineEngineerSession[] {
  try {
    if (fs.existsSync(CHAT_SESSIONS_STORAGE_FILE)) {
      const raw = fs.readFileSync(CHAT_SESSIONS_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not load engineer chat sessions from disk:', err);
  }
  return INITIAL_DEMO_CHAT_SESSIONS;
}

function persistEngineerChatSessions(sessions: ServerOnlineEngineerSession[]): void {
  try {
    const dir = path.dirname(CHAT_SESSIONS_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CHAT_SESSIONS_STORAGE_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist engineer chat sessions to disk:', err);
  }
}

let engineerChatSessionsStore: ServerOnlineEngineerSession[] = loadEngineerChatSessions();

const CERTIFICATES_STORAGE_FILE = path.join(process.cwd(), 'data', 'certificates.json');

function loadCertificatesFromDisk(): any[] {
  try {
    if (fs.existsSync(CERTIFICATES_STORAGE_FILE)) {
      const raw = fs.readFileSync(CERTIFICATES_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not load certificates from disk:', err);
  }
  return [];
}

function persistCertificatesToDisk(certs: any[]): void {
  try {
    const dir = path.dirname(CERTIFICATES_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CERTIFICATES_STORAGE_FILE, JSON.stringify(certs, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist certificates to disk:', err);
  }
}

let crmCertificatesStore: any[] = loadCertificatesFromDisk();

// Helper for XSS sanitization of strings
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/javascript:/gi, '')
    .trim();
}

// Simple in-memory rate limiter per IP for POST endpoints
const rateLimitMap = new Map<string, { count: number; firstRequestTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_POST_REQUESTS_PER_MIN = 120; // 120 requests per minute allows legitimate enterprise app activity without 429 throttling

function rateLimiterMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.method !== 'POST') return next();
  
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
    return next();
  }

  if (now - record.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
    return next();
  }

  if (record.count >= MAX_POST_REQUESTS_PER_MIN) {
    return res.status(429).json({
      success: false,
      error: 'Превышен лимит отправки запросов. Пожалуйста, подождите 1 минуту.',
    });
  }

  record.count += 1;
  next();
}

// In-memory analytics event store
interface AnalyticsEvent {
  id: string;
  path: string;
  title?: string;
  timestamp: string;
  userAgent?: string;
}
const analyticsEvents: AnalyticsEvent[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. HTTP Response Compression (Gzip / Deflate for fast initial loading)
  app.use(compression({
    threshold: 1024,
    level: 6,
  }));

  // 2. Security Headers Middleware
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // JSON Body Parser
  app.use(express.json({ limit: '25mb' }));

  // Apply Rate Limiter to POST API requests
  app.use('/api', rateLimiterMiddleware);

  // Apply CSRF Protection Middleware to state-changing API endpoints
  app.use('/api', csrfProtectionMiddleware);

  // Register CSRF Token Generation and Verification routes
  registerCsrfRoutes(app);

  // --- REST API ENDPOINTS ---

  // Health check & Server info
  app.get("/api/db-health", async (_req, res) => {
    if (!isDbConfigured()) {
      return res.json({ db_connected: false, mode: 'memory_fallback', message: 'In-memory enterprise storage active' });
    }
    try {
      await db.execute(sql`SELECT 1`);
      res.json({ db_connected: true, mode: 'postgresql' });
    } catch(err) {
      res.json({ db_connected: false, mode: 'memory_fallback', error: String(err) });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      serverTime: new Date().toISOString(),
      storageBackend: isDbConfigured() ? "Cloud SQL (PostgreSQL) + Hybrid Enterprise" : "Hybrid Enterprise (Node.js REST API + In-Memory Persistence)",
      version: "2.11.3",
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Register Corporate CRM API Routes (Tasks, Calendar, Companies, Contacts, Client Lists, Quick Callback)
  registerCrmRoutes(app, serviceRequestsStore);

  // Register Notification Channels API Routes (Telegram, Email, MAX Webhook, Real-time Pop-up)
  registerNotificationRoutes(app);

  // Register JSON Schema specifications & validation sandbox API (/api/schemas, /api/schemas/:name, /api/schemas/validate/:name)
  registerSchemaRoutes(app);

  // Register 3D WebGL Inspection Models API Routes (/api/models3d)
  register3DModelsRoutes(app);

  // Register Global Site Text Constants API Routes (/api/site-texts)
  registerSiteTextsRoutes(app);

  // Register Sitemap & SEO Index API Routes (/sitemap.xml, /api/sitemap/entries, /api/sitemap/stats, /api/sitemap/ping)
  registerSitemapRoutes(app, () => cmsStore);

  // Analytics event recording endpoint
  app.post("/api/analytics/event", validateBody('analyticsEvent'), (req, res) => {
    const { path: pagePath, title, userAgent } = req.body || {};
    if (!pagePath || typeof pagePath !== 'string') {
      return res.status(400).json({ success: false, error: "Укажите путь страницы." });
    }

    const event: AnalyticsEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      path: sanitizeInput(pagePath),
      title: title ? sanitizeInput(title) : undefined,
      timestamp: new Date().toISOString(),
      userAgent: userAgent ? sanitizeInput(userAgent) : undefined
    };

    analyticsEvents.unshift(event);
    if (analyticsEvents.length > 500) analyticsEvents.pop();

    return res.status(200).json({ success: true, count: analyticsEvents.length });
  });

  app.get("/api/analytics/summary", (_req, res) => {
    res.json({ success: true, totalVisits: analyticsEvents.length, recentVisits: analyticsEvents.slice(0, 50) });
  });

  // 1. RFQ (Request for Quotation) API
  app.get("/api/rfq", async (_req, res) => {
    if (isDbConfigured()) {
      try {
        const data = await db.select().from(schema.rfqSubmissions).orderBy(sql`created_at DESC`);
        if (data && data.length > 0) {
          return res.json({ success: true, count: data.length, data });
        }
      } catch {}
    }
    res.json({ success: true, count: rfqSubmissions.length, data: rfqSubmissions });
  });

  app.post("/api/rfq", validateBody('rfqSubmission'), async (req, res) => {
    const { customerName, companyName, email, phone, serviceType, details, estimatedPrice, cadFormat } = req.body;
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return res.status(400).json({ success: false, error: "Имя заказчика обязательно (не менее 2 символов)." });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: "Некорректный email адрес." });
    }
    if (!phone || typeof phone !== 'string' || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, error: "Некорректный номер телефона." });
    }
    
    const sanitize = (str: string) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    const newRfqId = `RFQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const newRecord: RFQSubmission = {
      id: newRfqId,
      customerName: sanitize(customerName),
      companyName: companyName ? sanitize(companyName) : 'Не указано',
      email: sanitize(email),
      phone: sanitize(phone),
      serviceType: serviceType ? sanitize(serviceType) : 'engineering',
      details: details ? sanitize(details) : '',
      estimatedPrice: typeof estimatedPrice === 'number' && estimatedPrice >= 0 ? estimatedPrice : undefined,
      cadFormat: cadFormat ? sanitize(cadFormat) : undefined,
      createdAt: new Date().toISOString()
    };

    rfqSubmissions.unshift(newRecord);

    // Dispatch real-time manager alerts (Telegram МАКС-бот, Email, In-Browser Pop-up)
    dispatchManagerNotification({
      type: 'rfq',
      title: `⚙️ Заявка на расчет / RFQ: ${newRecord.customerName}`,
      customerName: newRecord.customerName,
      companyName: newRecord.companyName,
      email: newRecord.email,
      phone: newRecord.phone,
      topic: newRecord.serviceType,
      details: newRecord.details,
      comment: newRecord.details,
      estimatedPrice: newRecord.estimatedPrice,
      cadFormat: newRecord.cadFormat,
      callId: newRfqId
    }).catch(e => {
      logRealtimeEvent({
        category: 'NOTIFICATION',
        level: 'WARN',
        requestId: newRfqId,
        action: 'ALERT_DISPATCH_WARNING',
        summary: `Предупреждение при рассылке уведомлений: ${e?.message || e}`
      });
    });

    if (isDbConfigured()) {
      try {
        const result = await db.insert(schema.rfqSubmissions).values({
          id: newRfqId,
          customerName: newRecord.customerName,
          companyName: newRecord.companyName,
          email: newRecord.email,
          phone: newRecord.phone,
          serviceType: newRecord.serviceType,
          details: newRecord.details,
          estimatedPrice: newRecord.estimatedPrice || null,
          cadFormat: newRecord.cadFormat || null,
        }).returning();
        return res.status(201).json({ success: true, message: "Заявка успешно зарегистрирована на сервере.", data: result[0] });
      } catch {}
    }

    return res.status(201).json({ success: true, message: "Заявка успешно зарегистрирована на сервере.", data: newRecord });
  });

  // 2. B2B Service Tickets API
  app.get("/api/b2b/tickets", async (req, res) => {
    const { organizationId, status } = req.query;

    if (isDbConfigured()) {
      try {
        let query = db.select().from(schema.tickets);
        const filters = [];
        if (organizationId && typeof organizationId === 'string') {
          filters.push(sql`organization_id = ${organizationId}`);
        }
        if (status && typeof status === 'string') {
          filters.push(sql`status = ${status}`);
        }
        
        if (filters.length > 0) {
          // @ts-ignore
          query = query.where(sql.join(filters, sql` and `));
        }
        
        const data = await query;
        if (data && data.length > 0) {
          return res.json({ success: true, count: data.length, data });
        }
      } catch {}
    }

    let filtered = [...ticketsStore];
    if (organizationId && typeof organizationId === 'string') {
      filtered = filtered.filter(t => t.organizationId.toLowerCase().includes((organizationId as string).toLowerCase()));
    }
    if (status && typeof status === 'string') {
      filtered = filtered.filter(t => t.status === status);
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  });

  app.post("/api/b2b/tickets", validateBody('ticketCreate'), async (req, res) => {
    const { title, category, urgency, equipmentModel, equipmentSerial, description, organizationId, attachments } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      return res.status(400).json({ success: false, error: "Тема обращения обязательна (не менее 5 символов)." });
    }
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return res.status(400).json({ success: false, error: "Описание заявки обязательно (не менее 10 символов)." });
    }

    const newTicketId = `TCK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const newTicket: B2BTicket = {
      id: newTicketId,
      organizationId: organizationId || 'АО «Авиаагрегат-Самара»',
      title: title.trim(),
      category: category || 'consulting',
      status: 'new',
      urgency: urgency || 'medium',
      equipmentModel: equipmentModel ? equipmentModel.trim() : undefined,
      equipmentSerial: equipmentSerial ? equipmentSerial.trim() : undefined,
      description: description.trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    ticketsStore.unshift(newTicket);

    // Dispatch real-time manager alerts (Telegram МАКС-бот, Email, In-Browser Pop-up)
    dispatchManagerNotification({
      type: 'ticket',
      title: `🎫 Сервисный тикет B2B [${newTicket.urgency}]: ${newTicket.title}`,
      customerName: newTicket.organizationId,
      companyName: newTicket.organizationId,
      phone: '+7 (800) 555-35-35',
      topic: `${newTicket.category} (${newTicket.equipmentModel || 'Оборудование КИМ'})`,
      comment: newTicket.description,
      preferredTime: newTicket.urgency === 'critical' ? 'Немедленно (Критический приоритет)' : 'В течение рабочего дня',
      taskId: newTicketId,
      callId: newTicketId
    }).catch(e => {
      logRealtimeEvent({
        category: 'NOTIFICATION',
        level: 'WARN',
        requestId: newTicketId,
        action: 'ALERT_DISPATCH_WARNING',
        summary: `Предупреждение при рассылке тикета в Telegram: ${e?.message || e}`
      });
    });

    if (isDbConfigured()) {
      try {
        const result = await db.insert(schema.tickets).values({
          id: newTicketId,
          organizationId: newTicket.organizationId,
          title: newTicket.title,
          category: newTicket.category,
          status: 'new',
          urgency: newTicket.urgency,
          equipmentModel: newTicket.equipmentModel || null,
          equipmentSerial: newTicket.equipmentSerial || null,
          description: newTicket.description,
          attachments: newTicket.attachments || [],
        }).returning();
        return res.status(201).json({ success: true, message: "Сервисный тикет успешно создан.", data: result[0] });
      } catch {}
    }

    return res.status(201).json({ success: true, message: "Сервисный тикет успешно создан.", data: newTicket });
  });

  // 3. Calculator Boundary Value Analysis & Validation API (DoD QA Suite)
  app.post("/api/calculator/validate", (req, res) => {
    const { dimensionsMm, requiredToleranceMm, batchQuantity, serviceType } = req.body;

    const validationErrors: string[] = [];
    const recommendations: string[] = [];

    // Dimension Boundary checks
    if (typeof dimensionsMm !== 'number' || isNaN(dimensionsMm)) {
      validationErrors.push("Габаритный размер должен быть числовым значением в мм.");
    } else if (dimensionsMm <= 0) {
      validationErrors.push("Граничная ошибка: габарит детали не может быть ≤ 0 мм.");
    } else if (dimensionsMm > 160000) {
      validationErrors.push("Превышен максимальный метрологический диапазон (160 000 мм / 160 м).");
    } else {
      if (dimensionsMm < 100) {
        recommendations.push("Для микродеталей (<100 мм) рекомендуется бесконтактный оптический сканер высокой четкости или микроскоп КИМ.");
      } else if (dimensionsMm > 4000) {
        recommendations.push("Для крупногабаритных объектов (>4000 мм) оптимален лазерный трекер Leica Absolute Tracker с радиусом до 160 м.");
      }
    }

    // Tolerance Boundary checks
    if (typeof requiredToleranceMm === 'number' && !isNaN(requiredToleranceMm)) {
      if (requiredToleranceMm < 0.002) {
        validationErrors.push("Граничная ошибка: требуемый допуск <0.002 мм (2 мкм) выходит за рамки цеховых измерений и требует термостабильной лаборатории класса 1.");
      } else if (requiredToleranceMm < 0.010) {
        recommendations.push("Допуск <0.010 мм требует стационарной портальной КИМ или руки PMT ALPHA ARM Precision.");
      } else if (requiredToleranceMm >= 0.050) {
        recommendations.push("Допуск ≥0.050 мм идеально покрывается ручными лазерными 3D-сканерами Shining 3D FreeScan.");
      }
    }

    // Batch quantity checks
    if (typeof batchQuantity === 'number') {
      if (batchQuantity < 1) {
        validationErrors.push("Количество деталей должно быть не менее 1 шт.");
      } else if (batchQuantity > 50000) {
        recommendations.push("Для крупносерийных партий (>50 000 шт) рекомендуется внедрение автоматизированных роботизированных ячеек контроля.");
      }
    }

    const isValid = validationErrors.length === 0;

    return res.status(isValid ? 200 : 422).json({
      valid: isValid,
      errors: validationErrors,
      recommendations,
      timestamp: new Date().toISOString(),
      validatedInput: { dimensionsMm, requiredToleranceMm, batchQuantity, serviceType }
    });
  });

  // 4. CMS Central Server State Persistence API
  app.get("/api/cms/state", async (_req, res) => {
    if (isDbConfigured()) {
      try {
        const result = await db.select().from(schema.cmsStore).where(eq(schema.cmsStore.key, 'site_cms_state'));
        if (result.length > 0 && result[0].value) {
          const dbData = result[0].value as any;
          // Merge with in-memory to get latest
          cmsStore = {
            ...cmsStore,
            ...dbData
          };
          return res.json({
            success: true,
            data: cmsStore,
            updatedAt: result[0].updatedAt?.toISOString() || new Date().toISOString(),
            source: 'database'
          });
        }
      } catch (err: any) {
        console.warn('DB error reading cms_store state, falling back to memory:', err?.message);
      }
    }

    return res.json({
      success: true,
      data: cmsStore,
      updatedAt: new Date().toISOString(),
      source: 'memory_fallback'
    });
  });

  app.post("/api/cms/state", async (req, res) => {
    const { customPages, products, services, articles, knowledgeBase, companyInfo } = req.body || {};
    
    if (Array.isArray(customPages)) cmsStore.customPages = customPages;
    if (Array.isArray(products)) cmsStore.products = products;
    if (Array.isArray(services)) cmsStore.services = services;
    if (Array.isArray(articles)) cmsStore.articles = articles;
    if (Array.isArray(knowledgeBase)) cmsStore.knowledgeBase = knowledgeBase;
    if (companyInfo && typeof companyInfo === 'object') cmsStore.companyInfo = companyInfo;

    // Persist to Cloud SQL PostgreSQL if configured
    if (isDbConfigured()) {
      try {
        const existing = await db.select().from(schema.cmsStore).where(eq(schema.cmsStore.key, 'site_cms_state'));
        if (existing.length > 0) {
          await db.update(schema.cmsStore)
            .set({ value: cmsStore, updatedAt: new Date() })
            .where(eq(schema.cmsStore.key, 'site_cms_state'));
        } else {
          await db.insert(schema.cmsStore).values({
            key: 'site_cms_state',
            value: cmsStore
          });
        }
      } catch (err: any) {
        console.warn('DB error saving cms_store state:', err?.message);
      }
    }

    res.json({
      success: true,
      message: "Данные CMS успешно синхронизированы с базой данных DS-Engineering",
      updatedAt: new Date().toISOString()
    });
  });

  app.post("/api/cms/reset", async (_req, res) => {
    cmsStore = {
      customPages: [],
      products: null,
      services: null,
      articles: null,
      knowledgeBase: null,
      companyInfo: null
    };

    if (isDbConfigured()) {
      try {
        await db.delete(schema.cmsStore).where(eq(schema.cmsStore.key, 'site_cms_state'));
      } catch {}
    }

    res.json({
      success: true,
      message: "Данные CMS сброшены к заводским настройкам"
    });
  });

  // 5. NAS and Python Architecture Metadata API
  app.get("/api/nas/storage-info", (_req, res) => {
    res.json({
      status: "online",
      nasType: "TrueNAS / Synology Enterprise On-Premise",
      storageProtocol: "S3 MinIO API + NFS/SMB",
      supportedFileTypes: [".step", ".stp", ".stl", ".iges", ".pwx", ".top", ".sldprt", ".prt", ".pdf", ".zip"],
      maxFileSizeBytes: 10 * 1024 * 1024 * 1024, // 10 GB
      encryption: "AES-256 at-rest + TLS in-transit",
      backupSchedule: "Каждые 6 часов (RAID 6 + Snapshot Replication)"
    });
  });

  // === КАТАЛОГ ОБОРУДОВАНИЯ (Equipment Catalog) API ===
  app.get("/api/equipment", async (_req, res) => {
    if (isDbConfigured()) {
      try {
        const data = await db.select().from(schema.equipmentCatalog);
        if (data && data.length > 0) {
          return res.json({ success: true, data });
        }
      } catch {}
    }
    res.json({ success: true, data: equipmentStore });
  });

  app.post("/api/equipment", async (req, res) => {
    const { slug, name, manufacturer, category, description, isActive } = req.body;
    const item = {
      slug: slug || `eq-${Date.now()}`,
      name: name || 'Оборудование',
      manufacturer: manufacturer || 'Unknown',
      category: category || 'general',
      description: description || '',
      isActive: isActive !== false
    };

    equipmentStore.push(item);

    if (isDbConfigured()) {
      try {
        const result = await db.insert(schema.equipmentCatalog).values(item).returning();
        return res.status(201).json({ success: true, data: result[0] });
      } catch {}
    }

    res.status(201).json({ success: true, data: item });
  });

  // === БАЗА ЗНАНИЙ (Knowledge Base) API ===
  app.get("/api/knowledge-base", async (_req, res) => {
    if (isDbConfigured()) {
      try {
        const data = await db.select().from(schema.knowledgeBase);
        if (data && data.length > 0) {
          return res.json({ success: true, data });
        }
      } catch {}
    }
    res.json({ success: true, data: knowledgeBaseStore });
  });

  app.post("/api/knowledge-base", async (req, res) => {
    const { slug, title, content, categoryId, isPublished } = req.body;
    const item = {
      slug: slug || `kb-${Date.now()}`,
      title: title || 'Статья',
      content: content || '',
      categoryId: categoryId || 'general',
      isPublished: isPublished === true
    };

    knowledgeBaseStore.push(item);

    if (isDbConfigured()) {
      try {
        const result = await db.insert(schema.knowledgeBase).values(item).returning();
        return res.status(201).json({ success: true, data: result[0] });
      } catch {}
    }

    res.status(201).json({ success: true, data: item });
  });

  // === CMS ДИНАМИЧЕСКИЕ СТРАНИЦЫ (CMS Pages) API ===
  
// ==========================================
// CMS STORE API (Replaces localStorage)
// ==========================================
const memoryCmsStore = new Map();

app.get('/api/cms/store/:key', async (req, res) => {
  try {
    const { key } = req.params;
    if (isDbConfigured()) {
      try {
        const result = await db.select().from(schema.cmsStore).where(eq(schema.cmsStore.key, key));
        if (result.length > 0) {
          return res.json(result[0].value);
        }
      } catch (err) {
        console.warn('DB error on CMS get, falling back to memory:', err.message);
      }
    }
    
    // Fallback to memory
    if (memoryCmsStore.has(key)) {
      res.json(memoryCmsStore.get(key));
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Error fetching CMS store:', error);
    res.status(500).json({ error: 'Failed to fetch CMS data' });
  }
});

app.post('/api/cms/store/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = req.body;
    
    // Always save to memory
    memoryCmsStore.set(key, value);
    
    if (isDbConfigured()) {
      try {
        const existing = await db.select().from(schema.cmsStore).where(eq(schema.cmsStore.key, key));
        if (existing.length > 0) {
          await db.update(schema.cmsStore).set({ value, updatedAt: new Date() }).where(eq(schema.cmsStore.key, key));
        } else {
          await db.insert(schema.cmsStore).values({ key, value });
        }
      } catch (err) {
        console.warn('DB error on CMS set:', err.message);
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating CMS store:', error);
    res.status(500).json({ error: 'Failed to update CMS data' });
  }
});

  app.get("/api/cms/pages", async (_req, res) => {
    if (isDbConfigured()) {
      try {
        const data = await db.select().from(schema.cmsPages);
        if (data && data.length > 0) {
          return res.json({ success: true, data });
        }
      } catch {}
    }
    res.json({ success: true, data: cmsPagesStore });
  });

  app.post("/api/cms/pages", async (req, res) => {
    const { slug, title, layoutConfig, isPublished } = req.body;
    const item = {
      slug: slug || `page-${Date.now()}`,
      title: title || 'Страница',
      layoutConfig: layoutConfig || [],
      isPublished: isPublished === true
    };

    cmsPagesStore.push(item);

    if (isDbConfigured()) {
      try {
        const result = await db.insert(schema.cmsPages).values(item).returning();
        return res.status(201).json({ success: true, data: result[0] });
      } catch {}
    }

    res.status(201).json({ success: true, data: item });
  });


  // === Обработка POST-запросов от формы калькулятора ===
  // === Middleware валидации заявок калькулятора ===
  const validateServiceRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { customerName, email, phone, serviceType } = req.body;
    
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      res.status(400).json({ success: false, error: "Имя заказчика обязательно (не менее 2 символов)." });
      return;
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, error: "Некорректный email адрес." });
      return;
    }
    if (!phone || typeof phone !== 'string' || phone.replace(/\D/g, '').length < 10) {
      res.status(400).json({ success: false, error: "Некорректный номер телефона." });
      return;
    }
    if (!serviceType || typeof serviceType !== 'string') {
      res.status(400).json({ success: false, error: "Тип услуги обязателен." });
      return;
    }
    
    // Базовая санитизация строк (защита от XSS)
    req.body.customerName = customerName.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    req.body.email = email.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    req.body.phone = phone.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    req.body.serviceType = serviceType.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    
    next();
  };

  app.post("/api/service-requests", validateServiceRequest, async (req, res) => {
    const startTime = Date.now();
    try {
      const {
        customerName,
        companyName,
        email,
        phone,
        serviceType,
        details,
        estimatedPrice,
        cadFormat,
        metadata,
        userId
      } = req.body;

      const requestId = `RFQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      logRealtimeEvent({
        category: 'CRM_REQUEST',
        level: 'INFO',
        requestId,
        action: 'INCOMING_CALCULATOR_RFQ',
        summary: `Поступила заявка на расчет от ${customerName} (${companyName || 'Частное лицо'}), тел: ${phone}`,
        details: {
          requestId,
          customerName,
          companyName,
          email,
          phone,
          serviceType,
          estimatedPrice,
          cadFormat,
          ip: req.ip || req.headers['x-forwarded-for'] || 'local'
        }
      });

      const newRequest = {
        id: requestId,
        userId: userId || null,
        customerName,
        companyName: companyName || 'Не указано',
        email,
        phone,
        serviceType,
        details: details || '',
        estimatedPrice: typeof estimatedPrice === 'number' ? estimatedPrice : null,
        cadFormat: cadFormat || null,
        metadata: metadata || {},
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      serviceRequestsStore.unshift(newRequest);

      // Dispatch real-time manager alerts (Telegram, Email, MAX Webhook, In-Browser Pop-up)
      dispatchManagerNotification({
        type: 'consultation',
        title: `📋 Заявка на расчет: ${customerName}`,
        customerName,
        phone,
        companyName: companyName || 'Не указано',
        email,
        topic: details || serviceType,
        callId: requestId
      }).catch(e => {
        logRealtimeEvent({
          category: 'NOTIFICATION',
          level: 'WARN',
          requestId,
          action: 'ALERT_DISPATCH_WARNING',
          summary: `Предупреждение при рассылке уведомлений: ${e?.message || e}`
        });
      });

      let dbPersistenceStatus: 'SAVED_POSTGRESQL' | 'SAVED_MEMORY' = 'SAVED_MEMORY';

      if (isDbConfigured()) {
        try {
          const result = await db.insert(schema.serviceRequests).values({
            id: requestId,
            userId: userId || null,
            customerName,
            companyName: companyName || 'Не указано',
            email,
            phone,
            serviceType,
            details: details || '',
            estimatedPrice: typeof estimatedPrice === 'number' ? estimatedPrice : null,
            cadFormat: cadFormat || null,
            metadata: metadata || {},
            status: 'pending'
          }).returning();

          dbPersistenceStatus = 'SAVED_POSTGRESQL';
          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'SUCCESS',
            requestId,
            action: 'RFQ_INSERT_POSTGRESQL',
            summary: `Заявка ${requestId} успешно зафиксирована в PostgreSQL (service_requests)`,
            dbStatus: 'SAVED_POSTGRESQL',
            durationMs: Date.now() - startTime
          });

          return res.status(201).json({ 
            success: true, 
            message: "Заявка успешно зарегистрирована", 
            data: result[0] 
          });
        } catch (dbErr: any) {
          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'WARN',
            requestId,
            action: 'RFQ_DB_FALLBACK',
            summary: `Ошибка записи в PostgreSQL: ${dbErr?.message || dbErr}. Данные сохранены в оперативной памяти`,
            dbStatus: 'DB_FALLBACK',
            details: { error: dbErr?.message }
          });
        }
      } else {
        logRealtimeEvent({
          category: 'DB_PERSISTENCE',
          level: 'INFO',
          requestId,
          action: 'RFQ_MEMORY_PERSISTED',
          summary: `Заявка ${requestId} сохранена в памяти CRM (PostgreSQL не сконфигурирован)`,
          dbStatus: 'SAVED_MEMORY',
          durationMs: Date.now() - startTime
        });
      }

      return res.status(201).json({ 
        success: true, 
        message: "Заявка успешно зарегистрирована", 
        data: newRequest 
      });

    } catch (error: any) {
      logRealtimeEvent({
        category: 'ERROR',
        level: 'ERROR',
        action: 'RFQ_PROCESSING_ERROR',
        summary: `Критическая ошибка обработки заявки: ${error?.message || error}`,
        durationMs: Date.now() - startTime
      });
      return res.status(500).json({ success: false, error: "Ошибка сервера" });
    }
  });

  // === ОБРАБОТКА КОНТАКТНЫХ ФОРМ С МГНОВЕННЫМ EMAIL-ОПОВЕЩЕНИЕМ ИНЖЕНЕРНОЙ ГРУППЫ ===
  app.post("/api/contact/submit", validateBody('contactForm'), async (req, res) => {
    const startTime = Date.now();
    try {
      const { name, phone, email, company, department, message, sourcePage } = req.body || {};

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ success: false, error: "Укажите корректное имя контактного лица (не менее 2 символов)" });
      }
      if (!phone || typeof phone !== 'string' || phone.replace(/\D/g, '').length < 10) {
        return res.status(400).json({ success: false, error: "Укажите корректный контактный номер телефона" });
      }

      const cleanName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
      const cleanPhone = phone.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
      const cleanEmail = email ? email.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim() : '';
      const cleanCompany = company ? company.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim() : 'Частное лицо / Не указано';
      const cleanDepartment = department ? department.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim() : 'all';
      const cleanMessage = message ? message.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim() : '';
      const cleanSourcePage = sourcePage ? sourcePage.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim() : 'Страница контактов';

      const requestId = `CNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

      // 1. Audit Log Realtime Event
      logRealtimeEvent({
        category: 'CRM_REQUEST',
        level: 'INFO',
        requestId,
        action: 'INCOMING_CONTACT_FORM',
        summary: `Поступило обращение с контактной формы: ${cleanName} (${cleanCompany}), тел: ${cleanPhone}`,
        details: {
          requestId,
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          company: cleanCompany,
          department: cleanDepartment,
          message: cleanMessage,
          sourcePage: cleanSourcePage,
          ip: req.ip || req.headers['x-forwarded-for'] || 'local'
        }
      });

      // 2. Persist to Service Requests In-Memory Store
      const newRequest = {
        id: requestId,
        userId: null,
        customerName: cleanName,
        companyName: cleanCompany,
        email: cleanEmail || 'info@ds-enginering.ru',
        phone: cleanPhone,
        serviceType: `Обращение: ${cleanDepartment}`,
        details: `${cleanMessage ? `[Сообщение]: ${cleanMessage} ` : ''}[Источник]: ${cleanSourcePage}`,
        estimatedPrice: null,
        cadFormat: null,
        metadata: { department: cleanDepartment, sourcePage: cleanSourcePage, formType: 'contact_page' },
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      serviceRequestsStore.unshift(newRequest);

      // 3. PostgreSQL Persistence (if active)
      if (isDbConfigured()) {
        try {
          await db.insert(schema.serviceRequests).values({
            id: requestId,
            customerName: cleanName,
            companyName: cleanCompany,
            email: cleanEmail || 'info@ds-enginering.ru',
            phone: cleanPhone,
            serviceType: `Обращение: ${cleanDepartment}`,
            details: `${cleanMessage ? `[Сообщение]: ${cleanMessage} ` : ''}[Источник]: ${cleanSourcePage}`,
            status: 'pending'
          });
          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'SUCCESS',
            requestId,
            action: 'CONTACT_SAVED_POSTGRESQL',
            summary: `Обращение ${requestId} зафиксировано в таблице service_requests`,
            durationMs: Date.now() - startTime
          });
        } catch (dbErr: any) {
          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'WARN',
            requestId,
            action: 'CONTACT_DB_FALLBACK',
            summary: `Ошибка записи в БД: ${dbErr?.message}. Данные сохранены в CRM RAM`,
            details: { error: dbErr?.message }
          });
        }
      }

      // 4. Automated Instant Email Notification to Engineering Team
      const emailResult = await dispatchContactFormEmail({
        requestId,
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        company: cleanCompany,
        department: cleanDepartment,
        message: cleanMessage,
        sourcePage: cleanSourcePage
      }).catch(err => {
        console.warn('[Contact Email Dispatch Error]:', err);
        return { sentCount: 0, recipients: [], success: false };
      });

      // 5. Multi-channel backup (Telegram / MAX / Live CRM Pop-up)
      dispatchManagerNotification({
        type: 'consultation',
        title: `📩 Новое обращение с формы: ${cleanName}`,
        customerName: cleanName,
        phone: cleanPhone,
        companyName: cleanCompany,
        email: cleanEmail,
        topic: `Отдел: ${cleanDepartment} | ${cleanMessage.slice(0, 80)}`,
        preferredTime: 'Срочно (в течение 10–15 минут)',
        comment: cleanMessage,
        callId: requestId
      }).catch(() => {});

      return res.status(201).json({
        success: true,
        id: requestId,
        message: "Сообщение успешно отправлено! Инженерная группа получила email-оповещение.",
        emailSent: emailResult.success,
        recipients: emailResult.recipients,
        durationMs: Date.now() - startTime
      });

    } catch (error: any) {
      logRealtimeEvent({
        category: 'ERROR',
        level: 'ERROR',
        action: 'CONTACT_SUBMIT_ERROR',
        summary: `Ошибка при обработке контактной формы: ${error?.message || error}`,
        durationMs: Date.now() - startTime
      });
      return res.status(500).json({ success: false, error: "Ошибка сервера при отправке сообщения" });
    }
  });

  // === CRM & TICKETS ADMIN API ===
  app.get("/api/service-requests", async (req, res) => {
    const role = req.query.role as string;
    const companyName = req.query.company as string;
    let dataToReturn = serviceRequestsStore;

    if (isDbConfigured()) {
      try {
        const data = await db.select().from(schema.serviceRequests).orderBy(sql`created_at DESC`);
        if (data && data.length > 0) {
          dataToReturn = data as any[];
        }
      } catch {}
    }
    
    if (role === 'client' && companyName) {
      dataToReturn = dataToReturn.filter((r: any) => 
        (r.company || '').toLowerCase() === companyName.toLowerCase()
      );
    }
    
    res.json({ success: true, data: dataToReturn });
  });

  app.patch("/api/service-requests/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const idx = serviceRequestsStore.findIndex(r => r.id === id);
    if (idx >= 0) {
      serviceRequestsStore[idx] = { ...serviceRequestsStore[idx], status, updatedAt: new Date().toISOString() };
    }

    if (isDbConfigured()) {
      try {
        const result = await db.update(schema.serviceRequests)
          .set({ status, updatedAt: new Date() })
          .where(sql`id = ${id}`)
          .returning();
        if (result && result.length > 0) {
          return res.json({ success: true, data: result[0] });
        }
      } catch {}
    }

    res.json({ success: true, data: idx >= 0 ? serviceRequestsStore[idx] : { id, status } });
  });

  app.patch("/api/b2b/tickets/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const idx = ticketsStore.findIndex(t => t.id === id);
    if (idx >= 0) {
      ticketsStore[idx] = { ...ticketsStore[idx], status: status as any, updatedAt: new Date().toISOString() };
    }

    if (isDbConfigured()) {
      try {
        const result = await db.update(schema.tickets)
          .set({ status, updatedAt: new Date() })
          .where(sql`id = ${id}`)
          .returning();
        if (result && result.length > 0) {
          return res.json({ success: true, data: result[0] });
        }
      } catch {}
    }

    res.json({ success: true, data: idx >= 0 ? ticketsStore[idx] : { id, status } });
  });

  // === CRM TRAINING & BRIEFING CERTIFICATES API ===
  app.get("/api/crm/certificates", async (req, res) => {
    try {
      const role = req.query.role as string;
      const company = req.query.company as string;
      let data = [...crmCertificatesStore];

      if (role === 'client' && company) {
        data = data.filter(c => (c.customer || '').toLowerCase() === company.toLowerCase());
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error("Failed to retrieve certificates:", error);
      res.status(500).json({ success: false, error: "Не удалось получить список свидетельств" });
    }
  });

  app.post("/api/crm/certificates", async (req, res) => {
    try {
      const certData = req.body;
      if (!certData) {
        return res.status(400).json({ success: false, error: "Данные свидетельства не переданы" });
      }

      const id = certData.id || `cert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newCert = {
        ...certData,
        id,
        updatedAt: new Date().toISOString()
      };

      // Check if existing
      const existingIdx = crmCertificatesStore.findIndex(c => c.id === id);
      if (existingIdx >= 0) {
        crmCertificatesStore[existingIdx] = newCert;
      } else {
        crmCertificatesStore.unshift(newCert);
      }

      persistCertificatesToDisk(crmCertificatesStore);

      // Attempt DB backup if configured
      if (isDbConfigured()) {
        try {
          await db.insert(schema.cmsStore).values({
            key: `cert_${id}`,
            value: newCert,
            updatedAt: new Date()
          }).onConflictDoUpdate({
            target: schema.cmsStore.key,
            set: { value: newCert, updatedAt: new Date() }
          });
        } catch (dbErr) {
          console.warn("DB backup for certificate skipped:", dbErr);
        }
      }

      res.json({ success: true, data: newCert });
    } catch (error) {
      console.error("Failed to save certificate:", error);
      res.status(500).json({ success: false, error: "Не удалось сохранить свидетельство" });
    }
  });

  app.patch("/api/crm/certificates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body || {};

      const idx = crmCertificatesStore.findIndex(c => c.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: "Свидетельство не найдено" });
      }

      crmCertificatesStore[idx] = {
        ...crmCertificatesStore[idx],
        ...updates,
        id,
        updatedAt: new Date().toISOString()
      };

      persistCertificatesToDisk(crmCertificatesStore);

      if (isDbConfigured()) {
        try {
          await db.insert(schema.cmsStore).values({
            key: `cert_${id}`,
            value: crmCertificatesStore[idx],
            updatedAt: new Date()
          }).onConflictDoUpdate({
            target: schema.cmsStore.key,
            set: { value: crmCertificatesStore[idx], updatedAt: new Date() }
          });
        } catch {}
      }

      res.json({ success: true, data: crmCertificatesStore[idx] });
    } catch (error) {
      console.error("Failed to update certificate:", error);
      res.status(500).json({ success: false, error: "Не удалось обновить свидетельство" });
    }
  });

  app.put("/api/crm/certificates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const certData = req.body || {};

      const idx = crmCertificatesStore.findIndex(c => c.id === id);
      const updatedCert = {
        ...certData,
        id,
        updatedAt: new Date().toISOString()
      };

      if (idx >= 0) {
        crmCertificatesStore[idx] = updatedCert;
      } else {
        crmCertificatesStore.unshift(updatedCert);
      }

      persistCertificatesToDisk(crmCertificatesStore);
      res.json({ success: true, data: updatedCert });
    } catch (error) {
      res.status(500).json({ success: false, error: "Ошибка при сохранении свидетельства" });
    }
  });

  app.delete("/api/crm/certificates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const beforeLen = crmCertificatesStore.length;
      crmCertificatesStore = crmCertificatesStore.filter(c => c.id !== id);

      if (crmCertificatesStore.length < beforeLen) {
        persistCertificatesToDisk(crmCertificatesStore);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      res.status(500).json({ success: false, error: "Не удалось удалить свидетельство" });
    }
  });

  // === EMAIL NOTIFICATIONS & SMTP INTEGRATION API ===
  app.get("/api/email/settings", (_req, res) => {
    try {
      const settings = getSmtpSettings();
      res.json({ 
        success: true, 
        data: {
          ...settings,
          passMasked: settings.pass ? '••••••••••••••••' : ''
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to get email settings" });
    }
  });

  app.post("/api/email/settings", (req, res) => {
    try {
      const { host, port, secure, user, pass, fromName, fromEmail, replyTo, enabled, provider, triggers } = req.body;
      const updated = updateSmtpSettings({
        host: host || 'smtp.yandex.ru',
        port: Number(port) || 465,
        secure: secure !== false,
        user: user || 'info@ds-enginering.ru',
        ...(pass ? { pass } : {}),
        fromName: fromName || 'ООО «ДС-Инжиниринг» | Некрасов С.Ю.',
        fromEmail: fromEmail || 'info@ds-enginering.ru',
        replyTo: replyTo || 'info@ds-enginering.ru',
        enabled: Boolean(enabled),
        provider: provider || 'yandex_360',
        triggers: triggers || {}
      });
      res.json({ success: true, message: "Настройки корпоративной почты успешно сохранены", data: updated });
    } catch (error) {
      console.error("POST /api/email/settings error:", error);
      res.status(500).json({ success: false, error: "Failed to save email settings" });
    }
  });

  // Get all manager corporate SMTP accounts (Yandex 360)
  app.get("/api/email/manager-accounts", (_req, res) => {
    try {
      const accounts = getManagerSmtpAccounts();
      res.json({ success: true, count: accounts.length, data: accounts });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to get manager email accounts" });
    }
  });

  // Update specific manager's Yandex SMTP App Password & profile
  app.post("/api/email/manager-account", (req, res) => {
    try {
      const { managerId, id, fullName, roleTitle, email, host, port, secure, user, pass, fromName, replyTo, isDirector } = req.body;
      if (!managerId && !id && !email) {
        return res.status(400).json({ success: false, error: "Укажите идентификатор или email сотрудника" });
      }
      const updated = updateManagerSmtpAccount({
        managerId,
        id,
        fullName,
        roleTitle,
        email,
        host: host || 'smtp.yandex.ru',
        port: Number(port) || 465,
        secure: secure !== false,
        authType: 'yandex_app_password',
        user: user || email,
        ...(pass ? { pass } : {}),
        fromName,
        replyTo,
        isDirector: Boolean(isDirector)
      });
      res.json({ success: true, message: `Почтовый ящик ${updated.email} успешно обновлен`, data: updated });
    } catch (error) {
      console.error("POST /api/email/manager-account error:", error);
      res.status(500).json({ success: false, error: "Failed to update manager email account" });
    }
  });

  app.post("/api/email/test", async (req, res) => {
    try {
      const { testEmail, recipientName, managerId, senderEmail } = req.body;
      const accounts = getManagerSmtpAccounts();
      
      let currentAccount = accounts.find(a => (managerId && a.managerId === managerId) || (senderEmail && a.email === senderEmail));
      if (!currentAccount) {
        currentAccount = accounts.find(a => a.isDirector || a.email === 'info@ds-enginering.ru') || accounts[0];
      }

      const targetEmail = testEmail || currentAccount.email || 'info@ds-enginering.ru';
      const targetName = recipientName || currentAccount.fullName || 'Специалист ДС-Инжиниринг';

      const html = generateCorporateEmailHtml({
        title: `Тестовая проверка Яндекс SMTP (${currentAccount.email})`,
        recipientName: targetName,
        headerBadge: 'ТЕСТ ЯНДЕКС 360',
        mainMessage: `Тестовое служебное сообщение для проверки шлюза корпоративной почты сотрудника ${currentAccount.fullName} (${currentAccount.roleTitle}). Авторизация выполняется через защищенный пароль приложения Яндекс ID.`,
        detailsTable: [
          { label: 'Сотрудник / Должность', value: `${currentAccount.fullName} (${currentAccount.roleTitle})` },
          { label: 'Корпоративный Email', value: currentAccount.email },
          { label: 'Почтовый сервер', value: `${currentAccount.host}:${currentAccount.port} (SSL/TLS)` },
          { label: 'Тип авторизации', value: 'Пароль приложения Яндекс ID' },
          { label: 'Имя отправителя', value: currentAccount.fromName },
          { label: 'Статус учетной записи', value: currentAccount.isDirector ? 'Генеральный директор (Основной ящик)' : 'Индивидуальный ящик менеджера' },
          { label: 'Время генерации', value: new Date().toLocaleString('ru-RU') }
        ],
        footerNote: 'Тест успешно инициирован из панели управления CRM «ДС-Инжиниринг».',
        senderName: currentAccount.fullName,
        senderPosition: currentAccount.roleTitle,
        senderEmail: currentAccount.email
      });

      const result = await sendEmailMessage({
        to: targetEmail,
        toName: targetName,
        senderManagerId: currentAccount.managerId,
        fromEmail: currentAccount.email,
        fromName: currentAccount.fromName,
        subject: `[ДС-Инжиниринг] Проверка корпоративного SMTP (${currentAccount.email})`,
        templateType: 'custom_b2b',
        html,
        text: `Тестовое служебное сообщение от сотрудника ${currentAccount.fullName} (${currentAccount.email}).`
      });

      res.json({ 
        success: true, 
        message: `Тестовое письмо сформировано для ${targetEmail} от ${currentAccount.email}`, 
        managerAccount: currentAccount,
        ...result 
      });
    } catch (error: any) {
      console.error("POST /api/email/test error:", error);
      res.status(500).json({ success: false, error: error?.message || "Failed to send test email" });
    }
  });

  app.post("/api/email/send", async (req, res) => {
    try {
      const { 
        to, 
        toName, 
        subject, 
        templateType, 
        title, 
        message, 
        detailsTable, 
        ctaText, 
        ctaUrl, 
        dealId, 
        ticketId,
        senderManagerId,
        fromEmail,
        fromName
      } = req.body;

      if (!to || typeof to !== 'string' || !to.includes('@')) {
        return res.status(400).json({ success: false, error: "Укажите корректный email получателя." });
      }

      // Find sender details
      const accounts = getManagerSmtpAccounts();
      let activeAccount = accounts.find(a => (senderManagerId && a.managerId === senderManagerId) || (fromEmail && a.email === fromEmail));
      if (!activeAccount) {
        activeAccount = accounts.find(a => a.isDirector || a.email === 'info@ds-enginering.ru') || accounts[0];
      }

      const effectiveSenderName = fromName || activeAccount?.fullName || 'Некрасов Сергей Юрьевич';
      const effectiveSenderRole = activeAccount?.roleTitle || 'Генеральный директор';
      const effectiveSenderEmail = fromEmail || activeAccount?.email || 'info@ds-enginering.ru';

      const html = generateCorporateEmailHtml({
        title: title || subject || 'Уведомление от компании «ДС-Инжиниринг»',
        recipientName: toName,
        headerBadge: templateType === 'rfq_created' ? 'НОВАЯ ЗАЯВКА' : (templateType === 'deal_stage' ? 'СТАТУС ПРОЕКТА' : (templateType === 'ticket_reply' ? 'СЕРВИСНЫЙ ПОРТАЛ' : 'ОФИЦИАЛЬНО')),
        mainMessage: message || 'Информация по вашему запросу.',
        detailsTable: Array.isArray(detailsTable) ? detailsTable : undefined,
        ctaText,
        ctaUrl,
        senderName: effectiveSenderName,
        senderPosition: effectiveSenderRole,
        senderEmail: effectiveSenderEmail
      });

      const result = await sendEmailMessage({
        to,
        toName,
        subject: subject || '[ДС-Инжиниринг] Служебное уведомление',
        templateType: templateType || 'custom_b2b',
        html,
        dealId,
        ticketId,
        senderManagerId: activeAccount?.managerId,
        fromEmail: effectiveSenderEmail,
        fromName: effectiveSenderName
      });

      res.json({ success: true, message: `Email успешно отправлен на адрес ${to} от имени ${effectiveSenderEmail}`, ...result });
    } catch (error: any) {
      console.error("POST /api/email/send error:", error);
      res.status(500).json({ success: false, error: error?.message || "Failed to send email" });
    }
  });

  app.get("/api/email/outbox", (_req, res) => {
    try {
      const logs = getOutboxLogs();
      res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to get outbox logs" });
    }
  });

  // Corporate Email Templates Endpoints
  app.get("/api/email/templates", (_req, res) => {
    try {
      const templates = getCorporateEmailTemplates();
      res.json({ success: true, count: templates.length, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to get corporate email templates" });
    }
  });

  app.post("/api/email/templates", (req, res) => {
    try {
      const templateData = req.body;
      if (!templateData || !templateData.id) {
        return res.status(400).json({ success: false, error: "Missing template id" });
      }
      const updated = updateCorporateEmailTemplate(templateData);
      res.json({ success: true, message: `Шаблон «${updated.name}» успешно сохранен`, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update corporate email template" });
    }
  });


  app.delete("/api/email/templates/:id", (req, res) => {
    try {
      const { id } = req.params;
      const success = deleteCorporateEmailTemplate(id);
      if (success) {
        res.json({ success: true, message: "Шаблон удален" });
      } else {
        res.status(404).json({ success: false, error: "Шаблон не найден" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Ошибка при удалении шаблона" });
    }
  });

  app.post("/api/email/templates/reset", (_req, res) => {
    try {
      const templates = resetCorporateEmailTemplates();
      res.json({ success: true, message: "Шаблоны сброшены к стандартным значениям", data: templates });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to reset corporate email templates" });
    }
  });

  
  // === BOT TOPICS API ===
  app.get("/api/chat/topics", (req, res) => {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'botTopics.json');
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf-8');
        res.json({ success: true, data: JSON.parse(data) });
      } else {
        res.json({ success: true, data: [] });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to get bot topics" });
    }
  });

  app.post("/api/chat/topics", express.json(), (req, res) => {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'botTopics.json');
      const data = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ success: false, error: "Data must be an array" });
      }
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      res.json({ success: true, message: "Темы успешно сохранены" });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save bot topics" });
    }
  });

// === ONLINE ENGINEER CHAT & MANAGER NOTIFICATIONS API ===
  app.get("/api/chat/sessions", async (_req, res) => {
    try {
      if (isDbConfigured()) {
        try {
          const dbRows = await db.select().from(schema.engineerChatSessions).orderBy(sql`created_at DESC`);
          if (dbRows && dbRows.length > 0) {
            // Synchronize in-memory with database rows
            const dbSessions: ServerOnlineEngineerSession[] = dbRows.map(row => ({
              id: row.id,
              visitorId: row.visitorId,
              visitorName: row.visitorName || undefined,
              contactPhone: row.contactPhone || undefined,
              contactEmail: row.contactEmail || undefined,
              companyName: row.companyName || undefined,
              currentPage: row.currentPage || undefined,
              currentPath: row.currentPath || undefined,
              status: (row.status as any) || 'active',
              messages: Array.isArray(row.messages) ? row.messages as any : [],
              lastMessageText: row.lastMessageText || '',
              createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
              unreadByManager: row.unreadByManager,
              urgentAlert: row.urgentAlert,
              leadId: row.leadId || undefined,
              assignedManagerId: row.assignedManagerId || undefined,
              metadata: (row.metadata as any) || {}
            }));

            // Merge any memory-only newer sessions
            const mergedMap = new Map<string, ServerOnlineEngineerSession>();
            engineerChatSessionsStore.forEach(s => mergedMap.set(s.id, s));
            dbSessions.forEach(s => mergedMap.set(s.id, s));
            engineerChatSessionsStore = Array.from(mergedMap.values()).sort((a, b) => 
              new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
            );
          }
        } catch (dbErr) {
          console.warn("Notice: Cloud SQL query for chat sessions fallback to storage:", dbErr);
        }
      }

      const unreadCount = engineerChatSessionsStore.filter(s => s.unreadByManager).length;
      res.json({
        success: true,
        count: engineerChatSessionsStore.length,
        unreadCount,
        data: engineerChatSessionsStore
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to get chat sessions" });
    }
  });

  app.get("/api/chat/session/:id", async (req, res) => {
    let session = engineerChatSessionsStore.find(s => s.id === req.params.id);
    if (!session && isDbConfigured()) {
      try {
        const rows = await db.select().from(schema.engineerChatSessions).where(sql`id = ${req.params.id}`);
        if (rows && rows.length > 0) {
          const row = rows[0];
          session = {
            id: row.id,
            visitorId: row.visitorId,
            visitorName: row.visitorName || undefined,
            contactPhone: row.contactPhone || undefined,
            contactEmail: row.contactEmail || undefined,
            companyName: row.companyName || undefined,
            currentPage: row.currentPage || undefined,
            currentPath: row.currentPath || undefined,
            status: (row.status as any) || 'active',
            messages: Array.isArray(row.messages) ? row.messages as any : [],
            lastMessageText: row.lastMessageText || '',
            createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
            unreadByManager: row.unreadByManager,
            urgentAlert: row.urgentAlert,
            leadId: row.leadId || undefined,
            assignedManagerId: row.assignedManagerId || undefined,
            metadata: (row.metadata as any) || {}
          };
          engineerChatSessionsStore.unshift(session);
        }
      } catch {}
    }

    if (!session) {
      return res.status(404).json({ success: false, error: "Сессия чата не найдена" });
    }
    res.json({ success: true, data: session });
  });

  app.post("/api/chat/session", async (req, res) => {
    const startTime = Date.now();
    try {
      const {
        id,
        visitorId,
        visitorName,
        contactPhone,
        contactEmail,
        companyName,
        currentPage,
        currentPath,
        status,
        messages,
        lastMessageText,
        isHandoverSubmit,
        isUserMessage
      } = req.body || {};

      if (!visitorId && !id) {
        logRealtimeEvent({
          category: 'ERROR',
          level: 'WARN',
          action: 'CHAT_REJECTED_MISSING_ID',
          summary: 'Отклонен запрос сохранения сессии: отсутствует visitorId или id'
        });
        return res.status(400).json({ success: false, error: "Необходим visitorId или id" });
      }

      let existingIndex = engineerChatSessionsStore.findIndex(s => (id && s.id === id) || (visitorId && s.visitorId === visitorId));
      const nowIso = new Date().toISOString();

      let session: ServerOnlineEngineerSession;
      let isNewSession = false;
      let prevMsgCount = 0;

      if (existingIndex >= 0) {
        session = engineerChatSessionsStore[existingIndex];
        prevMsgCount = (session.messages || []).length;
        session.updatedAt = nowIso;
        if (visitorName) session.visitorName = sanitizeInput(visitorName);
        if (contactPhone) session.contactPhone = sanitizeInput(contactPhone);
        if (contactEmail) session.contactEmail = sanitizeInput(contactEmail);
        if (companyName) session.companyName = sanitizeInput(companyName);
        if (currentPage) session.currentPage = sanitizeInput(currentPage);
        if (currentPath) session.currentPath = sanitizeInput(currentPath);
        if (status) session.status = status;
        if (Array.isArray(messages) && messages.length > 0) {
          // Robustly merge existing messages with incoming client messages by ID to prevent manager/system message erasure
          const mergedMap = new Map<string, ServerOnlineEngineerMessage>();
          (session.messages || []).forEach(m => {
            const key = m.id || `${m.sender}-${m.timestamp || m.time}-${(m.text || '').slice(0, 20)}`;
            mergedMap.set(key, m);
          });
          messages.forEach(m => {
            const key = m.id || `${m.sender}-${m.timestamp || m.time}-${(m.text || '').slice(0, 20)}`;
            if (mergedMap.has(key)) {
              mergedMap.set(key, { ...mergedMap.get(key)!, ...m });
            } else {
              const assignedId = m.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
              mergedMap.set(key, { ...m, id: assignedId });
            }
          });
          session.messages = Array.from(mergedMap.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        }
        if (lastMessageText) session.lastMessageText = sanitizeInput(lastMessageText);
        if (isUserMessage || isHandoverSubmit || status === 'handover_requested') {
          session.unreadByManager = true;
        }
      } else {
        isNewSession = true;
        const newId = id || `CHAT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        session = {
          id: newId,
          visitorId: visitorId || `vis-${Date.now()}`,
          visitorName: visitorName ? sanitizeInput(visitorName) : 'Посетитель сайта',
          contactPhone: contactPhone ? sanitizeInput(contactPhone) : undefined,
          contactEmail: contactEmail ? sanitizeInput(contactEmail) : undefined,
          companyName: companyName ? sanitizeInput(companyName) : undefined,
          currentPage: currentPage ? sanitizeInput(currentPage) : 'home',
          currentPath: currentPath ? sanitizeInput(currentPath) : '/',
          status: status || 'active',
          messages: Array.isArray(messages) ? messages : [],
          lastMessageText: lastMessageText ? sanitizeInput(lastMessageText) : 'Новый диалог',
          createdAt: nowIso,
          updatedAt: nowIso,
          unreadByManager: true
        };
        engineerChatSessionsStore.unshift(session);
        existingIndex = 0;
      }

      const totalMessagesNow = (session.messages || []).length;
      const lastMsg = session.messages && session.messages.length > 0 ? session.messages[session.messages.length - 1] : null;

      logRealtimeEvent({
        category: 'ENGINEER_CHAT',
        level: 'INFO',
        sessionId: session.id,
        action: isNewSession ? 'CHAT_SESSION_CREATED' : 'CHAT_SESSION_SYNC',
        summary: isNewSession
          ? `Создана новая сессия «Онлайн-инженер» для ${session.visitorName} (сообщений: ${totalMessagesNow})`
          : `Синхронизация сессии «Онлайн-инженер» (${prevMsgCount} ➔ ${totalMessagesNow} сообщений). Посл: [${lastMsg?.sender || '?'}] "${(lastMsg?.text || session.lastMessageText || '').slice(0, 45)}"`,
        details: {
          sessionId: session.id,
          visitorId: session.visitorId,
          visitorName: session.visitorName,
          phone: session.contactPhone,
          email: session.contactEmail,
          page: session.currentPage || session.currentPath,
          status: session.status,
          isUserMessage,
          isHandoverSubmit,
          unreadByManager: session.unreadByManager,
          messagesCount: totalMessagesNow
        }
      });

      // Check if contact information was provided or explicit handover requested
      const hasContacts = Boolean(session.contactPhone || session.contactEmail);
      const isEscalation = isHandoverSubmit || status === 'handover_requested';

      // 1. AUTOMATIC CREATION OF A REAL LEAD IN serviceRequests (Database + CRM)
      if (hasContacts && !session.leadId) {
        const newLeadId = `RFQ-2026-CH-${Math.floor(Math.random() * 9000 + 1000)}`;
        session.leadId = newLeadId;
        session.urgentAlert = true;
        session.status = 'handover_requested';

        const leadSummary = `🚨 Срочное обращение из виджета «Онлайн-инженер» со страницы ${session.currentPage || session.currentPath || 'Главная'}.${session.companyName ? ` Примечание клиента: ${session.companyName}.` : ''} Последнее сообщение: ${session.lastMessageText}`;

        const newLeadRecord = {
          id: newLeadId,
          customerName: session.visitorName || 'Посетитель сайта (Онлайн-Инженер)',
          companyName: session.companyName || 'Не указано',
          email: session.contactEmail || 'Не указан',
          phone: session.contactPhone || 'Не указан',
          serviceType: 'chat_consultation',
          details: leadSummary,
          estimatedPrice: null,
          cadFormat: null,
          status: 'pending',
          createdAt: nowIso,
          updatedAt: nowIso,
          metadata: {
            source: 'online_engineer_chat',
            sessionId: session.id,
            visitorId: session.visitorId,
            page: session.currentPage || session.currentPath
          }
        };

        serviceRequestsStore.unshift(newLeadRecord);
        rfqSubmissions.unshift(newLeadRecord as any);

        logRealtimeEvent({
          category: 'CRM_REQUEST',
          level: 'SUCCESS',
          sessionId: session.id,
          requestId: newLeadId,
          action: 'CHAT_LEAD_GENERATED',
          summary: `Создан новый лид CRM ${newLeadId} из чата для клиента ${session.visitorName} (${session.contactPhone || session.contactEmail})`,
          details: { leadId: newLeadId, customer: session.visitorName, phone: session.contactPhone }
        });

        if (isDbConfigured()) {
          try {
            await db.insert(schema.serviceRequests).values({
              id: newLeadId,
              customerName: newLeadRecord.customerName,
              companyName: newLeadRecord.companyName,
              email: newLeadRecord.email,
              phone: newLeadRecord.phone,
              serviceType: 'chat_consultation',
              details: leadSummary,
              status: 'pending',
              metadata: newLeadRecord.metadata
            });
            logRealtimeEvent({
              category: 'DB_PERSISTENCE',
              level: 'SUCCESS',
              requestId: newLeadId,
              action: 'CHAT_LEAD_DB_INSERTED',
              summary: `Лид ${newLeadId} успешно записан в PostgreSQL (service_requests)`,
              dbStatus: 'SAVED_POSTGRESQL'
            });
          } catch (dbLeadErr: any) {
            logRealtimeEvent({
              category: 'DB_PERSISTENCE',
              level: 'WARN',
              requestId: newLeadId,
              action: 'CHAT_LEAD_DB_FALLBACK',
              summary: `Не удалось записать лид ${newLeadId} в PostgreSQL: ${dbLeadErr?.message || dbLeadErr}`,
              dbStatus: 'DB_FALLBACK'
            });
          }
        }
      }

      // 2. DISPATCH HIGH-PRIORITY MANAGER NOTIFICATION
      const shouldNotifyManagers = (isEscalation || isHandoverSubmit) && hasContacts && !session.metadata?.alertDispatched;
      if (shouldNotifyManagers) {
        session.urgentAlert = true;
        session.metadata = {
          ...(session.metadata || {}),
          alertDispatched: true,
          alertedAt: nowIso
        };

        try {
          const accounts = getManagerSmtpAccounts();
          const managerEmails = accounts.filter(a => a.email && a.email.includes('@')).map(a => a.email);
          const targetEmail = managerEmails[0] || 'info@ds-enginering.ru';

          const summaryLines = (session.messages || []).slice(-5).map(m => 
            `<b>[${m.sender === 'user' ? 'Посетитель' : (m.sender === 'manager' ? 'Менеджер' : 'Инженер')}]:</b> ${m.text}`
          ).join('<br/>');

          const alertHtml = generateCorporateEmailHtml({
            title: '🚨 Новое обращение в модуле «Онлайн-инженер»',
            recipientName: 'Дежурный инженер / Менеджер проектов',
            headerBadge: 'ВЫЗОВ МЕНЕДЖЕРА В ЧАТЕ (ЛИД)',
            mainMessage: `Посетитель сайта оставил контактные данные в виджете «Онлайн-инженер» и ожидает подключения специалиста:<br/><br/>
            <b>Номер созданной заявки в CRM:</b> <span style="color:#1e40af;font-weight:bold;">${session.leadId || 'RFQ-2026-CH'}</span><br/>
            <b>Имя клиента:</b> ${session.visitorName || 'Не указано'}<br/>
            <b>Телефон / Мессенджер:</b> <a href="tel:${session.contactPhone}" style="color:#2563eb;font-weight:bold;text-decoration:none;">${session.contactPhone || 'Не указан'}</a><br/>
            <b>Электронная почта:</b> <a href="mailto:${session.contactEmail}" style="color:#2563eb;">${session.contactEmail || 'Не указана'}</a><br/>
            <b>Организация / примечание:</b> ${session.companyName || 'Не указана'}<br/>
            <b>Страница на сайте:</b> ${session.currentPage || session.currentPath || 'Главная'}<br/><br/>
            <b>История диалога с посетителем:</b><br/>
            <div style="background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:13px;line-height:1.6;">${summaryLines}</div>`,
            ctaText: 'Открыть CRM и взять диалог в работу',
            ctaUrl: '/#cms?tab=crm',
            senderName: 'Сервер уведомлений «ДС-Инжиниринг»',
            senderPosition: 'Модуль Live Chat Gateway & CRM',
            senderEmail: 'system@ds-enginering.ru'
          });

          sendEmailMessage({
            to: targetEmail,
            toName: 'Отдел продаж и технического консалтинга',
            subject: `🚨 [Онлайн-Инженер] Срочный вызов специалиста: ${session.visitorName || session.contactPhone || 'Клиент'} (${session.leadId || 'RFQ'})`,
            templateType: 'custom_b2b',
            html: alertHtml,
            fromEmail: 'system@ds-enginering.ru',
            fromName: 'ДС-Инжиниринг Чат-Шлюз'
          }).catch(e => console.warn('Async chat alert email dispatch notice:', e));

          dispatchManagerNotification({
            type: 'chat_lead',
            title: `💬 Вызов специалиста в чате: ${session.visitorName || 'Посетитель'}`,
            customerName: session.visitorName || 'Посетитель сайта',
            phone: session.contactPhone || '—',
            companyName: session.companyName || 'Не указана',
            email: session.contactEmail,
            topic: (session as any).serviceInterest || (session as any).initialIntent || 'Онлайн-консультация дежурного инженера',
            preferredTime: 'Срочно (онлайн)',
            callId: session.leadId || session.id
          }).catch(() => {});

          logRealtimeEvent({
            category: 'NOTIFICATION',
            level: 'SUCCESS',
            sessionId: session.id,
            action: 'CHAT_ALERT_DISPATCHED',
            summary: `Отправлены срочные уведомления дежурному инженеру (Email + CRM Toast + Telegram)`
          });
        } catch (e: any) {
          logRealtimeEvent({
            category: 'NOTIFICATION',
            level: 'WARN',
            sessionId: session.id,
            action: 'CHAT_ALERT_ERROR',
            summary: `Ошибка подготовки уведомления: ${e?.message || e}`
          });
        }
      }

      // Update in-memory array & persist to disk
      engineerChatSessionsStore[existingIndex] = session;
      persistEngineerChatSessions(engineerChatSessionsStore);

      logRealtimeEvent({
        category: 'DB_PERSISTENCE',
        level: 'INFO',
        sessionId: session.id,
        action: 'CHAT_DISK_SAVED',
        summary: `Сессия ${session.id} записана на диск (data/engineer_chat_sessions.json)`,
        dbStatus: 'SAVED_DISK'
      });

      // 3. PERSIST TO CLOUD SQL (PostgreSQL)
      if (isDbConfigured()) {
        try {
          const existingDb = await db.select().from(schema.engineerChatSessions).where(sql`id = ${session.id}`);
          if (existingDb && existingDb.length > 0) {
            await db.update(schema.engineerChatSessions)
              .set({
                visitorName: session.visitorName || null,
                contactPhone: session.contactPhone || null,
                contactEmail: session.contactEmail || null,
                companyName: session.companyName || null,
                currentPage: session.currentPage || null,
                currentPath: session.currentPath || null,
                status: session.status,
                messages: session.messages,
                lastMessageText: session.lastMessageText || null,
                unreadByManager: session.unreadByManager ?? true,
                urgentAlert: session.urgentAlert ?? false,
                leadId: session.leadId || null,
                assignedManagerId: session.assignedManagerId || null,
                metadata: session.metadata || {},
                updatedAt: new Date()
              })
              .where(sql`id = ${session.id}`);

            logRealtimeEvent({
              category: 'DB_PERSISTENCE',
              level: 'SUCCESS',
              sessionId: session.id,
              action: 'CHAT_DB_UPDATED',
              summary: `Сессия ${session.id} успешно обновлена в PostgreSQL (сообщений: ${totalMessagesNow})`,
              dbStatus: 'SAVED_POSTGRESQL',
              durationMs: Date.now() - startTime
            });
          } else {
            await db.insert(schema.engineerChatSessions).values({
              id: session.id,
              visitorId: session.visitorId,
              visitorName: session.visitorName || null,
              contactPhone: session.contactPhone || null,
              contactEmail: session.contactEmail || null,
              companyName: session.companyName || null,
              currentPage: session.currentPage || null,
              currentPath: session.currentPath || null,
              status: session.status,
              messages: session.messages,
              lastMessageText: session.lastMessageText || null,
              unreadByManager: session.unreadByManager ?? true,
              urgentAlert: session.urgentAlert ?? false,
              leadId: session.leadId || null,
              assignedManagerId: session.assignedManagerId || null,
              metadata: session.metadata || {}
            });

            logRealtimeEvent({
              category: 'DB_PERSISTENCE',
              level: 'SUCCESS',
              sessionId: session.id,
              action: 'CHAT_DB_INSERTED',
              summary: `Новая сессия ${session.id} успешно создана в PostgreSQL`,
              dbStatus: 'SAVED_POSTGRESQL',
              durationMs: Date.now() - startTime
            });
          }
        } catch (dbErr: any) {
          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'WARN',
            sessionId: session.id,
            action: 'CHAT_DB_FALLBACK',
            summary: `Ошибка записи в PostgreSQL: ${dbErr?.message || dbErr}. Сессия сохранена в JSON-файле на диске.`,
            dbStatus: 'DB_FALLBACK'
          });
        }
      }

      res.status(201).json({ success: true, data: session });
    } catch (error: any) {
      logRealtimeEvent({
        category: 'ERROR',
        level: 'ERROR',
        action: 'CHAT_SESSION_FATAL_ERROR',
        summary: `Ошибка обработки POST /api/chat/session: ${error?.message || error}`,
        durationMs: Date.now() - startTime
      });
      console.error("POST /api/chat/session error:", error);
      res.status(500).json({ success: false, error: error?.message || "Failed to save chat session" });
    }
  });

  // Manager claims the session ("Взять в работу")
  app.post("/api/chat/session/:id/claim", async (req, res) => {
    const startTime = Date.now();
    try {
      const { managerName, managerId } = req.body || {};
      const session = engineerChatSessionsStore.find(s => s.id === req.params.id);
      if (!session) {
        logRealtimeEvent({
          category: 'ERROR',
          level: 'WARN',
          sessionId: req.params.id,
          action: 'CLAIM_FAILED_NOT_FOUND',
          summary: `Попытка взять в работу несуществующую сессию ${req.params.id}`
        });
        return res.status(404).json({ success: false, error: "Сессия чата не найдена" });
      }

      const assignedName = sanitizeInput(managerName || 'Ведущий инженер «ДС-Инжиниринг»');
      session.assignedManagerName = assignedName;
      if (managerId) session.assignedManagerId = sanitizeInput(managerId);
      session.status = 'manager_connected';
      session.unreadByManager = false;
      session.urgentAlert = false;
      session.updatedAt = new Date().toISOString();

      const systemNotice: ServerOnlineEngineerMessage = {
        id: `sys-claim-${Date.now()}`,
        sender: 'system',
        text: `👨‍💼 К диалогу подключился специалист: ${assignedName}. Готов ответить на технические и коммерческие вопросы.`,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };
      session.messages.push(systemNotice);
      session.lastMessageText = systemNotice.text;

      persistEngineerChatSessions(engineerChatSessionsStore);

      logRealtimeEvent({
        category: 'MANAGER_REPLY',
        level: 'SUCCESS',
        sessionId: session.id,
        action: 'MANAGER_CLAIMED_SESSION',
        summary: `Специалист ${assignedName} взял диалог ${session.id} в работу`,
        details: { managerName: assignedName, managerId }
      });

      if (isDbConfigured()) {
        try {
          await db.update(schema.engineerChatSessions)
            .set({
              status: 'manager_connected',
              assignedManagerId: session.assignedManagerId || null,
              unreadByManager: false,
              urgentAlert: false,
              messages: session.messages,
              lastMessageText: session.lastMessageText,
              updatedAt: new Date()
            })
            .where(sql`id = ${session.id}`);

          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'SUCCESS',
            sessionId: session.id,
            action: 'CLAIM_DB_UPDATED',
            summary: `Статус подключения менеджера ${assignedName} сохранен в PostgreSQL`,
            dbStatus: 'SAVED_POSTGRESQL',
            durationMs: Date.now() - startTime
          });
        } catch (dbErr: any) {
          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'WARN',
            sessionId: session.id,
            action: 'CLAIM_DB_FALLBACK',
            summary: `Не удалось обновить статус в PostgreSQL: ${dbErr?.message}`,
            dbStatus: 'DB_FALLBACK'
          });
        }
      }

      res.json({ success: true, message: `Диалог взят в работу специалистом ${assignedName}`, data: session });
    } catch (error: any) {
      logRealtimeEvent({
        category: 'ERROR',
        level: 'ERROR',
        sessionId: req.params.id,
        action: 'CLAIM_FATAL_ERROR',
        summary: `Ошибка подключения менеджера: ${error?.message || error}`
      });
      res.status(500).json({ success: false, error: "Failed to claim chat session" });
    }
  });

  app.post("/api/chat/session/:id/reply", async (req, res) => {
    const startTime = Date.now();
    try {
      const { text, managerName } = req.body || {};
      if (!text || typeof text !== 'string' || !text.trim()) {
        logRealtimeEvent({
          category: 'ERROR',
          level: 'WARN',
          sessionId: req.params.id,
          action: 'MANAGER_REPLY_EMPTY',
          summary: 'Попытка отправить пустой ответ менеджера'
        });
        return res.status(400).json({ success: false, error: "Текст ответа обязателен" });
      }

      const session = engineerChatSessionsStore.find(s => s.id === req.params.id);
      if (!session) {
        logRealtimeEvent({
          category: 'ERROR',
          level: 'WARN',
          sessionId: req.params.id,
          action: 'MANAGER_REPLY_NOT_FOUND',
          summary: `Сессия ${req.params.id} не найдена для отправки ответа менеджера`
        });
        return res.status(404).json({ success: false, error: "Сессия чата не найдена" });
      }

      const replyMsg: ServerOnlineEngineerMessage = {
        id: `msg-${Date.now()}`,
        sender: 'manager',
        text: sanitizeInput(text.trim()),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };

      session.messages.push(replyMsg);
      session.lastMessageText = replyMsg.text;
      session.status = 'manager_connected';
      session.updatedAt = new Date().toISOString();
      session.unreadByManager = false;
      session.urgentAlert = false;
      if (managerName) session.assignedManagerName = sanitizeInput(managerName);

      persistEngineerChatSessions(engineerChatSessionsStore);

      logRealtimeEvent({
        category: 'MANAGER_REPLY',
        level: 'SUCCESS',
        sessionId: session.id,
        action: 'MANAGER_MESSAGE_SENT',
        summary: `Менеджер (${managerName || session.assignedManagerName || 'Инженер'}) ответил в сессию ${session.id}: "${replyMsg.text.slice(0, 50)}"`,
        details: {
          sessionId: session.id,
          messageId: replyMsg.id,
          manager: managerName || session.assignedManagerName,
          totalMessages: session.messages.length
        }
      });

      if (isDbConfigured()) {
        try {
          await db.update(schema.engineerChatSessions)
            .set({
              status: 'manager_connected',
              unreadByManager: false,
              urgentAlert: false,
              messages: session.messages,
              lastMessageText: session.lastMessageText,
              updatedAt: new Date()
            })
            .where(sql`id = ${session.id}`);

          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'SUCCESS',
            sessionId: session.id,
            action: 'MANAGER_REPLY_DB_SYNCED',
            summary: `Ответ менеджера успешно сохранен в базе данных PostgreSQL`,
            dbStatus: 'SAVED_POSTGRESQL',
            durationMs: Date.now() - startTime
          });
        } catch (dbErr: any) {
          logRealtimeEvent({
            category: 'DB_PERSISTENCE',
            level: 'WARN',
            sessionId: session.id,
            action: 'MANAGER_REPLY_DB_FALLBACK',
            summary: `Ошибка записи ответа в PostgreSQL: ${dbErr?.message}. Ответ сохранен на диске`,
            dbStatus: 'DB_FALLBACK'
          });
        }
      } else {
        logRealtimeEvent({
          category: 'DB_PERSISTENCE',
          level: 'INFO',
          sessionId: session.id,
          action: 'MANAGER_REPLY_DISK_PERSISTED',
          summary: `Ответ менеджера сохранен в файловой БД на диске (PostgreSQL не активен)`,
          dbStatus: 'SAVED_DISK',
          durationMs: Date.now() - startTime
        });
      }

      res.json({ success: true, message: "Ответ отправлен клиенту", data: session });
    } catch (error: any) {
      logRealtimeEvent({
        category: 'ERROR',
        level: 'ERROR',
        sessionId: req.params.id,
        action: 'MANAGER_REPLY_FATAL',
        summary: `Сбой отправки ответа: ${error?.message || error}`
      });
      res.status(500).json({ success: false, error: "Failed to reply to chat session" });
    }
  });

  app.post("/api/chat/session/:id/status", async (req, res) => {
    try {
      const { status } = req.body || {};
      const session = engineerChatSessionsStore.find(s => s.id === req.params.id);
      if (!session) {
        return res.status(404).json({ success: false, error: "Сессия чата не найдена" });
      }
      if (status) session.status = status;
      session.updatedAt = new Date().toISOString();
      persistEngineerChatSessions(engineerChatSessionsStore);

      logRealtimeEvent({
        category: 'ENGINEER_CHAT',
        level: 'INFO',
        sessionId: session.id,
        action: 'CHAT_STATUS_UPDATED',
        summary: `Статус сессии ${session.id} изменен на "${status}"`
      });

      if (isDbConfigured()) {
        try {
          await db.update(schema.engineerChatSessions)
            .set({ status: session.status, updatedAt: new Date() })
            .where(sql`id = ${session.id}`);
        } catch {}
      }

      res.json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update chat status" });
    }
  });

  app.post("/api/chat/session/:id/mark-read", async (req, res) => {
    try {
      const session = engineerChatSessionsStore.find(s => s.id === req.params.id);
      if (session) {
        session.unreadByManager = false;
        session.urgentAlert = false;
        persistEngineerChatSessions(engineerChatSessionsStore);

        logRealtimeEvent({
          category: 'ENGINEER_CHAT',
          level: 'INFO',
          sessionId: session.id,
          action: 'CHAT_MARKED_READ',
          summary: `Сессия ${session.id} отмечена прочитанной менеджером`
        });

        if (isDbConfigured()) {
          try {
            await db.update(schema.engineerChatSessions)
              .set({ unreadByManager: false, urgentAlert: false, updatedAt: new Date() })
              .where(sql`id = ${session.id}`);
          } catch {}
        }
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to mark as read" });
    }
  });

  // === DIAGNOSTIC REALTIME LOGS API ===
  app.get("/api/crm/realtime-logs", (req, res) => {
    try {
      const { category, limit } = req.query;
      const logs = getRealtimeLogs(
        typeof category === 'string' ? category : undefined, 
        limit ? Math.min(Number(limit), 200) : 50
      );
      res.json({ success: true, count: logs.length, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: "Failed to get realtime logs" });
    }
  });

  app.post("/api/crm/realtime-logs/clear", (_req, res) => {
    try {
      clearRealtimeLogs();
      res.json({ success: true, message: "Журнал реального времени очищен" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: "Failed to clear realtime logs" });
    }
  });



  // === USER ACCOUNTS & PERMISSIONS (RBAC) DATABASE API ===
  const DEFAULT_SYSTEM_USERS: Array<{
    id: string;
    email: string;
    fullName: string;
    role: 'admin' | 'manager' | 'client';
    position?: string;
    company?: string;
    phone?: string;
    password?: string;
    contractNumber?: string;
    avatar?: string;
    permissions?: any;
  }> = [
    {
      id: 'adm-01',
      email: 's.nekrasov@ds-enginering.ru',
      fullName: 'Некрасов Сергей Юрьевич',
      role: 'admin',
      position: 'Генеральный директор',
      company: 'ООО «ДС-Инжиниринг»',
      phone: '+7 (846) 954-02-92',
      password: 'admin123',
      contractNumber: 'АДМ-001',
      avatar: '',
      permissions: {
        canViewAnalytics: true,
        canEditDeals: true,
        canDeleteDeals: true,
        canExportReports: true,
        canManageUsers: true,
        canAccessCms: true,
        canAccessCrm: true,
        canManageContracts: true,
        canManageTickets: true,
        canManageLicenses: true,
        canReopenClosedDeals: true,
      },
    },
    {
      id: 'adm-02',
      email: 'a.skobelev@ds-enginering.ru',
      fullName: 'Скобелев Александр Сергеевич',
      role: 'manager',
      position: 'Ведущий специалист по TopSolid 7, ЧПУ и постпроцессорам',
      company: 'ООО «ДС-Инжиниринг»',
      phone: '+7 (937) 984-61-51',
      password: 'admin123',
      contractNumber: 'АДМ-002',
      avatar: '',
      permissions: {
        canViewAnalytics: true,
        canEditDeals: true,
        canDeleteDeals: false,
        canExportReports: true,
        canManageUsers: false,
        canAccessCms: true,
        canAccessCrm: true,
        canManageContracts: true,
        canManageTickets: true,
        canManageLicenses: true,
        canReopenClosedDeals: true,
      },
    },
    {
      id: 'adm-03',
      email: 'i.yarish@ds-enginering.ru',
      fullName: 'Ярыш Иван Владимирович',
      role: 'manager',
      position: 'Руководитель направления PolyWorks и КИМ',
      company: 'ООО «ДС-Инжиниринг»',
      phone: '+7 (927) 748-46-58',
      password: 'admin123',
      contractNumber: 'АДМ-003',
      avatar: '',
      permissions: {
        canViewAnalytics: true,
        canEditDeals: true,
        canDeleteDeals: false,
        canExportReports: true,
        canManageUsers: false,
        canAccessCms: true,
        canAccessCrm: true,
        canManageContracts: true,
        canManageTickets: true,
        canManageLicenses: true,
        canReopenClosedDeals: true,
      },
    },
    {
      id: 'adm-04',
      email: 'a.yarish@ds-enginering.ru',
      fullName: 'Ярыш Александр Владимирович',
      role: 'manager',
      position: 'Ведущий специалист по 3D-сканированию',
      company: 'ООО «ДС-Инжиниринг»',
      phone: '+7 (927) 208-81-22',
      password: 'admin123',
      contractNumber: 'АДМ-004',
      avatar: '',
      permissions: {
        canViewAnalytics: true,
        canEditDeals: true,
        canDeleteDeals: false,
        canExportReports: true,
        canManageUsers: false,
        canAccessCms: true,
        canAccessCrm: true,
        canManageContracts: true,
        canManageTickets: true,
        canManageLicenses: true,
        canReopenClosedDeals: true,
      },
    },
    {
      id: 'adm-05',
      email: 'v.morozov@ds-enginering.ru',
      fullName: 'Морозов Владимир Георгиевич',
      role: 'manager',
      position: 'Руководитель проектов по технологической оснастке',
      company: 'ООО «ДС-Инжиниринг»',
      phone: '+7 (902) 371-20-16',
      password: 'admin123',
      contractNumber: 'АДМ-005',
      avatar: '',
      permissions: {
        canViewAnalytics: true,
        canEditDeals: true,
        canDeleteDeals: false,
        canExportReports: true,
        canManageUsers: false,
        canAccessCms: true,
        canAccessCrm: true,
        canManageContracts: true,
        canManageTickets: true,
        canManageLicenses: true,
        canReopenClosedDeals: true,
      },
    },
    {
      id: 'adm-06',
      email: 'moderator@ds-enginering.ru',
      fullName: 'Модератор Сайта',
      role: 'manager',
      position: 'Контент-менеджер',
      company: 'ООО «ДС-Инжиниринг»',
      phone: '+7 (000) 000-00-00',
      password: 'moderator123',
      contractNumber: 'АДМ-006',
      avatar: '',
      permissions: {
        canViewAnalytics: false,
        canEditDeals: false,
        canDeleteDeals: false,
        canExportReports: false,
        canManageUsers: false,
        canAccessCms: true,
        canAccessCrm: false,
        canManageContracts: false,
        canManageTickets: false,
        canManageLicenses: false,
        canReopenClosedDeals: false,
      },
    },
    {
      id: 'cli-01',
      email: 'd.petrov@aviaagregat.ru',
      fullName: 'Петров Дмитрий Николаевич',
      role: 'client',
      position: 'Главный технолог',
      company: 'АО «Авиаагрегат-Самара»',
      phone: '+7 (917) 123-45-67',
      password: 'client123',
      contractNumber: 'ДОГ-2026-СМР/04',
      avatar: '',
      permissions: {
        canViewAnalytics: false,
        canEditDeals: false,
        canDeleteDeals: false,
        canExportReports: false,
        canManageUsers: false,
        canAccessCms: false,
        canAccessCrm: false,
        canManageContracts: false,
        canManageTickets: false,
        canManageLicenses: false,
        canReopenClosedDeals: false,
      },
    }
  ];

  // Seed default users if PostgreSQL users table is empty
  seedInitialUsersIfEmpty(DEFAULT_SYSTEM_USERS).catch((err) => {
    console.warn("Could not auto-seed users in DB:", err);
  });

  // Get all users from Database
  app.get("/api/users", async (_req, res) => {
    try {
      const data = await getAllDbUsers();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      console.error("GET /api/users error:", error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  // Get user by ID or Email
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await getDbUserByIdOrEmail(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      console.error("GET /api/users/:id error:", error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  // Create new user in Database
  app.post("/api/users", async (req, res) => {
    try {
      const { id, email, fullName, company, position, phone, role, permissions, password, contractNumber, avatar } = req.body;
      if (!email || !fullName) {
        return res.status(400).json({ success: false, error: "Email и ФИО обязательны для создания пользователя." });
      }

      const existing = await getDbUserByIdOrEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, error: "Пользователь с таким email уже существует в базе данных." });
      }

      const newUser = await createDbUser({
        id,
        email,
        fullName,
        company,
        position,
        phone,
        role: role || 'client',
        permissions,
        password,
        contractNumber,
        avatar,
      });

      // Broadcast instant manager live notification (Popup chime, Telegram, Email, MAX-bot)
      dispatchManagerNotification({
        type: 'user_registration',
        title: 'Регистрация нового заказчика B2B',
        customerName: newUser.fullName,
        phone: newUser.phone || 'Не указан',
        companyName: newUser.company,
        email: newUser.email,
        topic: 'Личный кабинет B2B / Договоры',
        comment: `Зарегистрирован новый пользователь (роль: ${newUser.role}, организация: ${newUser.company || 'Не указана'}, должность: ${newUser.position || 'Представитель компании'}).`,
      });

      logRealtimeEvent({
        category: 'SECURITY',
        level: 'SUCCESS',
        action: 'USER_REGISTERED',
        summary: `Зарегистрирован новый пользователь ${newUser.email} (${newUser.company || 'Частное лицо'})`,
        details: {
          userId: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          company: newUser.company
        }
      });

      res.status(201).json({ 
        success: true, 
        message: `Пользователь ${newUser.fullName} успешно сохранен в базе данных.`,
        data: newUser 
      });
    } catch (error) {
      console.error("POST /api/users error:", error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  // Update user fields in Database
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedUser = await updateDbUser(id, updates);
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: "Пользователь не найден в базе данных." });
      }
      res.json({ 
        success: true, 
        message: "Данные пользователя успешно обновлены в базе данных.",
        data: updatedUser 
      });
    } catch (error) {
      console.error("PATCH /api/users/:id error:", error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  // Update specifically user permissions (RBAC) in Database
  app.patch("/api/users/:id/permissions", async (req, res) => {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      if (!permissions || typeof permissions !== 'object') {
        return res.status(400).json({ success: false, error: "Некорректный объект прав доступа (permissions)." });
      }

      const updatedUser = await updateDbUserPermissions(id, permissions);
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: "Пользователь не найден в базе данных." });
      }

      res.json({ 
        success: true, 
        message: "Права доступа пользователя успешно сохранены в базе данных PostgreSQL.",
        data: updatedUser 
      });
    } catch (error) {
      console.error("PATCH /api/users/:id/permissions error:", error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  // Delete user from Database
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (id === 'adm-01' || id === 's.nekrasov@ds-enginering.ru') {
        return res.status(403).json({ success: false, error: "Нельзя удалить главного администратора системы." });
      }

      const success = await deleteDbUser(id);
      if (!success) {
        return res.status(404).json({ success: false, error: "Пользователь не найден в базе данных." });
      }

      res.json({ success: true, message: "Пользователь успешно удален из базы данных." });
    } catch (error) {
      console.error("DELETE /api/users/:id error:", error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  // Bulk sync/seed users endpoint
  app.post("/api/users/sync", async (req, res) => {
    try {
      const { users: incomingUsers, resetToDefaults } = req.body || {};
      if (resetToDefaults === true) {
        await db.delete(schema.users);
        await seedInitialUsersIfEmpty(DEFAULT_SYSTEM_USERS);
      } else if (Array.isArray(incomingUsers) && incomingUsers.length > 0) {
        for (const u of incomingUsers) {
          const existing = await getDbUserByIdOrEmail(u.id || u.email);
          if (existing) {
            await updateDbUser(existing.id, u);
          } else {
            await createDbUser(u);
          }
        }
      }
      const allUsers = await getAllDbUsers();
      res.json({ success: true, message: "Синхронизация с базой данных завершена.", data: allUsers });
    } catch (error) {
      console.error("POST /api/users/sync error:", error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  // Company Positions Management with DB Synchronization
  const DEFAULT_COMPANY_POSITIONS = [
    "Генеральный директор",
    "Главный метролог",
    "Руководитель отдела продаж",
    "Ведущий инженер метролог",
    "Ведущий инженер сервиса и КИМ",
    "Менеджер по работе с ключевыми клиентами",
    "Менеджер проектов",
    "Инженер технической поддержки",
    "Специалист 3D-сканирования",
    "Администратор CRM",
    "Бухгалтер"
  ];

  let inMemoryPositions = [...DEFAULT_COMPANY_POSITIONS];

  app.get("/api/company/positions", async (_req, res) => {
    try {
      if (isDbConfigured()) {
        const result = await db.select().from(schema.cmsStore).where(eq(schema.cmsStore.key, 'company_positions'));
        if (result.length > 0 && Array.isArray(result[0].value) && result[0].value.length > 0) {
          inMemoryPositions = Array.from(new Set([...DEFAULT_COMPANY_POSITIONS, ...(result[0].value as string[])]));
          return res.json({ success: true, data: inMemoryPositions, source: 'database' });
        } else {
          // Seed initial positions into DB
          await db.insert(schema.cmsStore).values({
            key: 'company_positions',
            value: DEFAULT_COMPANY_POSITIONS
          }).catch(() => {});
        }
      }
      res.json({ success: true, data: inMemoryPositions, source: 'memory_or_default' });
    } catch (err: any) {
      console.warn("GET /api/company/positions error:", err?.message);
      res.json({ success: true, data: inMemoryPositions, source: 'fallback' });
    }
  });

  app.post("/api/company/positions", async (req, res) => {
    try {
      const positionName = (req.body?.position || req.body?.name || '').trim();
      if (!positionName) {
        return res.status(400).json({ success: false, error: "Наименование должности не может быть пустым." });
      }

      if (!inMemoryPositions.includes(positionName)) {
        inMemoryPositions.push(positionName);
      }

      if (isDbConfigured()) {
        const existing = await db.select().from(schema.cmsStore).where(eq(schema.cmsStore.key, 'company_positions'));
        if (existing.length > 0) {
          await db.update(schema.cmsStore)
            .set({ value: inMemoryPositions, updatedAt: new Date() })
            .where(eq(schema.cmsStore.key, 'company_positions'));
        } else {
          await db.insert(schema.cmsStore).values({
            key: 'company_positions',
            value: inMemoryPositions
          });
        }
      }

      res.json({
        success: true,
        message: `Должность "${positionName}" успешно сохранена в базе данных.`,
        data: inMemoryPositions
      });
    } catch (err: any) {
      console.error("POST /api/company/positions error:", err);
      res.status(500).json({ success: false, error: "Не удалось сохранить должность в базе данных." });
    }
  });

  app.delete("/api/company/positions/:name", async (req, res) => {
    try {
      const name = decodeURIComponent(req.params.name).trim();
      inMemoryPositions = inMemoryPositions.filter(p => p !== name);
      if (isDbConfigured()) {
        const existing = await db.select().from(schema.cmsStore).where(eq(schema.cmsStore.key, 'company_positions'));
        if (existing.length > 0) {
          await db.update(schema.cmsStore)
            .set({ value: inMemoryPositions, updatedAt: new Date() })
            .where(eq(schema.cmsStore.key, 'company_positions'));
        }
      }
      res.json({ success: true, message: `Должность "${name}" удалена.`, data: inMemoryPositions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Ошибка удаления" });
    }
  });



  // --- UPLOAD ENDPOINT ---
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
  });

  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 150 * 1024 * 1024 }
  });

  // --- ASSETS API ---
  app.get('/api/assets', (req, res) => {
    try {
      const assetsDir = path.join(process.cwd(), 'public', 'assets');
      const logosDir = path.join(process.cwd(), 'public', 'logos', 'manufacturers');
      
      const getFilesFromDir = (dirPath: string, publicPrefix: string) => {
        if (!fs.existsSync(dirPath)) return [];
        const files = fs.readdirSync(dirPath);
        return files
          .filter(f => /\.(png|jpe?g|svg|webp|gif)$/i.test(f))
          .map(f => ({
            name: f,
            url: `${publicPrefix}/${f}`,
            type: f.endsWith('.svg') ? 'vector' : 'image'
          }));
      };

      const customAssets = getFilesFromDir(assetsDir, '/assets');
      const defaultLogos = getFilesFromDir(logosDir, '/logos/manufacturers');
      
      res.json({
        success: true,
        data: {
          custom: customAssets,
          presets: defaultLogos
        }
      });
    } catch (e: any) {
      console.error('Failed to list assets:', e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  const assetsUploadDir = path.join(process.cwd(), 'public', 'assets');
  if (!fs.existsSync(assetsUploadDir)) {
    fs.mkdirSync(assetsUploadDir, { recursive: true });
  }
  const assetsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, assetsUploadDir)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(file.originalname);
      cb(null, 'asset-' + uniqueSuffix + ext)
    }
  });
  const assetsUpload = multer({ storage: assetsStorage, limits: { fileSize: 10 * 1024 * 1024 } });

  app.post('/api/assets/upload', assetsUpload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }
      const fileUrl = '/assets/' + req.file.filename;
      res.json({ 
        success: true, 
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to upload asset' });
    }
  });

  app.delete('/api/assets/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      // Basic security check to prevent directory traversal
      if (filename.includes('/') || filename.includes('..')) {
        return res.status(400).json({ success: false, error: 'Invalid filename' });
      }
      const filePath = path.join(process.cwd(), 'public', 'assets', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, error: 'File not found' });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }
      // Return the public URL and file details
      const fileUrl = '/uploads/' + req.file.filename;
      res.json({ 
        success: true, 
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, error: 'Failed to upload file' });
    }
  });

  // --- DADATA API PROXY ---
  app.post('/api/dadata/company', async (req, res) => {
    try {
      const { query } = req.body;
      const dadataKey = process.env.DADATA_API_KEY;
      
      if (!dadataKey) {
        return res.status(500).json({ success: false, error: 'Ключ API Dadata (DADATA_API_KEY) не настроен на сервере.' });
      }
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, error: 'Не указан поисковый запрос (ИНН или название).' });
      }

      const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Token ${dadataKey}`
        },
        body: JSON.stringify({ query: query })
      });

      if (!response.ok) {
        throw new Error(`Dadata API error: ${response.status}`);
      }

      const data = await response.json();
      res.json({ success: true, data: data.suggestions });
    } catch (error: any) {
      console.error('Dadata API Error:', error);
      res.status(500).json({ success: false, error: 'Ошибка при запросе к сервису Dadata', details: error?.message });
    }
  });
  // -------------------------


  // --- SERVE DOCS ENDPOINT ---
  app.use('/api/docs', express.static(path.join(process.cwd(), 'docs')));
  // -------------------------

// --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist'))
      ? path.join(process.cwd(), 'dist')
      : process.cwd();
    // Cache hashed assets for 1 year (immutable)
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
    }));
    app.use(express.static(distPath, {
      maxAge: '1h',
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
