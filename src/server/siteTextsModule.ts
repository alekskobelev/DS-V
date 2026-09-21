import express from 'express';
import fs from 'fs';
import path from 'path';
import { eq } from 'drizzle-orm';
import { db, isDbConfigured } from '../db/index.ts';
import * as schema from '../db/schema.ts';
import { DEFAULT_SITE_TEXTS, SiteTextsData } from '../data/defaultSiteTexts.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'site_texts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Failed to ensure data dir for site texts:', err);
  }
}

// In-memory cache
let currentSiteTexts: SiteTextsData = JSON.parse(JSON.stringify(DEFAULT_SITE_TEXTS));

// Load from disk if exists on module startup
if (fs.existsSync(BACKUP_FILE)) {
  try {
    const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    currentSiteTexts = {
      ...DEFAULT_SITE_TEXTS,
      ...parsed,
      home: { ...DEFAULT_SITE_TEXTS.home, ...(parsed.home || {}) },
      about: { ...DEFAULT_SITE_TEXTS.about, ...(parsed.about || {}) },
      contacts: { ...DEFAULT_SITE_TEXTS.contacts, ...(parsed.contacts || {}) },
      services: { ...DEFAULT_SITE_TEXTS.services, ...(parsed.services || {}) },
      catalogs: { ...DEFAULT_SITE_TEXTS.catalogs, ...(parsed.catalogs || {}) },
      footer: { ...DEFAULT_SITE_TEXTS.footer, ...(parsed.footer || {}) },
    };
  } catch (e) {
    console.warn('Failed to load backup site texts from disk:', e);
  }
}

function saveToDisk(data: SiteTextsData) {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write site_texts.json to disk:', err);
  }
}

// Reconstruct nested SiteTextsData from dictionary
function reconstructSiteTextsFromDictionary(dict: Record<string, string>, base: SiteTextsData): SiteTextsData {
  const result: SiteTextsData = JSON.parse(JSON.stringify(base));
  for (const [k, val] of Object.entries(dict)) {
    const dotIndex = k.indexOf('.');
    if (dotIndex > 0) {
      const cat = k.slice(0, dotIndex) as keyof SiteTextsData;
      const field = k.slice(dotIndex + 1);
      if (result[cat] && typeof (result[cat] as any)[field] === 'string') {
        (result[cat] as any)[field] = val;
      }
    }
  }
  return result;
}

// Flatten nested SiteTextsData into relational records
function flattenTexts(data: SiteTextsData): Array<{ id: number; key: string; category: string; value: string; description: string; updatedAt: string }> {
  const records: Array<{ id: number; key: string; category: string; value: string; description: string; updatedAt: string }> = [];
  let currentId = 1;
  const now = new Date().toISOString();
  
  const categories: Array<keyof SiteTextsData> = ['home', 'about', 'contacts', 'services', 'catalogs', 'footer'];
  for (const cat of categories) {
    const subObj = data[cat];
    if (subObj && typeof subObj === 'object') {
      for (const [subKey, val] of Object.entries(subObj)) {
        if (typeof val === 'string') {
          records.push({
            id: currentId++,
            key: `${cat}.${subKey}`,
            category: cat,
            value: val,
            description: `${cat} - ${subKey}`,
            updatedAt: now
          });
        }
      }
    }
  }
  return records;
}

// Sync relational textConstants table
async function syncRelationalTextConstants(data: SiteTextsData) {
  if (!isDbConfigured()) return;
  try {
    const flat = flattenTexts(data);
    for (const item of flat) {
      const existing = await db.select().from(schema.textConstants).where(eq(schema.textConstants.key, item.key));
      if (existing.length > 0) {
        await db.update(schema.textConstants)
          .set({ value: item.value, category: item.category, description: item.description, updatedAt: new Date() })
          .where(eq(schema.textConstants.key, item.key));
      } else {
        await db.insert(schema.textConstants).values({
          key: item.key,
          category: item.category,
          value: item.value,
          description: item.description,
          updatedAt: new Date()
        });
      }
    }
  } catch (err: any) {
    console.warn('DB error syncing text_constants table:', err?.message);
  }
}

export function registerSiteTextsRoutes(app: express.Application) {
  // Common handler for extracting text constants from PostgreSQL 'text_constants' table
  const handleGetTextConstants = async (req: express.Request, res: express.Response) => {
    const { category, key, require_db, strict, fallback } = req.query;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const shouldQueryDb = isDbConfigured() || require_db === 'true' || strict === 'true';

    if (shouldQueryDb) {
      try {
        // Запрос к реляционной таблице text_constants через Drizzle ORM
        let rows = await db.select().from(schema.textConstants).orderBy(schema.textConstants.id);

        // Если таблица пуста, автоматически синхронизируем дефолтные значения
        if (rows.length === 0) {
          await syncRelationalTextConstants(currentSiteTexts);
          rows = await db.select().from(schema.textConstants).orderBy(schema.textConstants.id);
        }

        let filtered = rows;
        if (category && typeof category === 'string') {
          filtered = filtered.filter(r => r.category.toLowerCase() === category.toLowerCase());
        }
        if (key && typeof key === 'string') {
          filtered = filtered.filter(r => r.key.toLowerCase().includes(key.toLowerCase()));
        }

        const dictionary: Record<string, string> = {};
        rows.forEach(r => { dictionary[r.key] = r.value; });

        // Актуализируем структурированный объект текстов из реальных записей БД
        currentSiteTexts = reconstructSiteTextsFromDictionary(dictionary, currentSiteTexts);
        saveToDisk(currentSiteTexts);

        return res.status(200).json({
          success: true,
          source: 'database_table',
          table: 'text_constants',
          count: filtered.length,
          total: filtered.length,
          constants: filtered,
          records: filtered,
          dictionary,
          data: currentSiteTexts,
          timestamp: new Date().toISOString()
        });
      } catch (dbError: any) {
        // === ОБРАБОТКА ОШИБОК ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ ===
        console.error('[text_constants] Ошибка подключения или выполнения запроса к базе данных PostgreSQL:', {
          message: dbError?.message,
          code: dbError?.code,
          stack: dbError?.stack,
          timestamp: new Date().toISOString()
        });

        // Если клиент явно разрешил использование fallback
        if (fallback === 'true' || req.headers['x-allow-fallback'] === 'true') {
          const flat = flattenTexts(currentSiteTexts);
          let filtered = flat;
          if (category && typeof category === 'string') {
            filtered = filtered.filter(r => r.category.toLowerCase() === category.toLowerCase());
          }
          if (key && typeof key === 'string') {
            filtered = filtered.filter(r => r.key.toLowerCase().includes(key.toLowerCase()));
          }

          const dictionary: Record<string, string> = {};
          flat.forEach(r => { dictionary[r.key] = r.value; });

          return res.status(200).json({
            success: true,
            source: 'fallback_after_db_error',
            table: 'text_constants',
            warning: 'Подключение к базе данных завершилось ошибкой, данные получены из локального резервного хранилища',
            dbError: {
              message: dbError?.message || 'Database connection error',
              code: dbError?.code || 'DB_CONNECTION_ERROR'
            },
            count: filtered.length,
            total: filtered.length,
            constants: filtered,
            records: filtered,
            dictionary,
            data: currentSiteTexts,
            timestamp: new Date().toISOString()
          });
        }

        // Возврат структурированной ошибки 500 / 503 при сбое подключения к БД
        const statusCode = (dbError?.code === 'ECONNREFUSED' || dbError?.code === 'ETIMEDOUT') ? 503 : 500;
        return res.status(statusCode).json({
          success: false,
          error: 'Ошибка подключения к базе данных',
          message: 'Не удалось извлечь текстовые константы из таблицы "text_constants" из-за ошибки подключения к PostgreSQL',
          details: dbError?.message || 'Сбой соединения с сервером базы данных PostgreSQL',
          code: dbError?.code || 'DB_CONNECTION_ERROR',
          table: 'text_constants',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Если база данных не сконфигурирована в окружении (нет PGHOST/SQL_HOST)
    if (strict === 'true' || require_db === 'true') {
      return res.status(503).json({
        success: false,
        error: 'Ошибка подключения к базе данных',
        message: 'База данных PostgreSQL не сконфигурирована: отсутствуют параметры подключения (SQL_HOST / PGHOST / DATABASE_URL)',
        code: 'DB_NOT_CONFIGURED',
        table: 'text_constants',
        timestamp: new Date().toISOString()
      });
    }

    // Отказоустойчивый гибридный fallback согласно AGENTS.md
    const flat = flattenTexts(currentSiteTexts);
    let filtered = flat;
    if (category && typeof category === 'string') {
      filtered = filtered.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }
    if (key && typeof key === 'string') {
      filtered = filtered.filter(r => r.key.toLowerCase().includes(key.toLowerCase()));
    }

    const dictionary: Record<string, string> = {};
    flat.forEach(r => { dictionary[r.key] = r.value; });

    return res.status(200).json({
      success: true,
      source: 'fallback',
      table: 'text_constants',
      count: filtered.length,
      total: filtered.length,
      constants: filtered,
      records: filtered,
      dictionary,
      data: currentSiteTexts,
      timestamp: new Date().toISOString()
    });
  };

  // 0. Эндпоинты для извлечения всех текстовых констант из таблицы 'text_constants' (JSON)
  app.get('/api/text-constants', handleGetTextConstants);
  app.get('/api/text_constants', handleGetTextConstants);
  app.get('/api/text-constants/all', handleGetTextConstants);
  app.get('/api/text_constants/all', handleGetTextConstants);

  // 0.1 Эндпоинт проверки подключения к таблице 'text_constants' в PostgreSQL
  app.get(['/api/text-constants/health', '/api/text_constants/health'], async (_req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (!isDbConfigured()) {
      return res.status(503).json({
        success: false,
        status: 'disconnected',
        error: 'База данных PostgreSQL не настроена в переменных окружения',
        code: 'DB_NOT_CONFIGURED'
      });
    }

    try {
      const sample = await db.select().from(schema.textConstants).limit(1);
      return res.status(200).json({
        success: true,
        status: 'connected',
        table: 'text_constants',
        reachable: true,
        sampleFound: sample.length > 0
      });
    } catch (dbError: any) {
      console.error('[text_constants/health] Ошибка подключения к базе данных:', dbError);
      return res.status(503).json({
        success: false,
        status: 'error',
        table: 'text_constants',
        error: 'Ошибка подключения к базе данных PostgreSQL',
        details: dbError?.message,
        code: dbError?.code || 'DB_CONNECTION_ERROR'
      });
    }
  });

  // 0.2 Эндпоинт получения отдельной текстовой константы по ключу
  app.get(['/api/text-constants/item/:key', '/api/text_constants/item/:key'], async (req, res) => {
    const constantKey = req.params.key;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (isDbConfigured()) {
      try {
        const found = await db.select().from(schema.textConstants).where(eq(schema.textConstants.key, constantKey));
        if (found && found.length > 0) {
          return res.status(200).json({
            success: true,
            source: 'database_table',
            constant: found[0]
          });
        }
      } catch (dbError: any) {
        console.error(`[text_constants] Ошибка подключения к БД при поиске ключа ${constantKey}:`, dbError);
        return res.status(500).json({
          success: false,
          error: 'Ошибка подключения к базе данных',
          message: `Не удалось извлечь константу "${constantKey}" из-за ошибки БД`,
          details: dbError?.message,
          code: dbError?.code || 'DB_CONNECTION_ERROR'
        });
      }
    }

    // Fallback search
    const flat = flattenTexts(currentSiteTexts);
    const item = flat.find(c => c.key === constantKey);
    if (item) {
      return res.status(200).json({
        success: true,
        source: 'fallback',
        constant: item
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Константа не найдена',
      key: constantKey
    });
  });

  // 0.3 Эндпоинт точечного обновления текстовой константы по ключу в таблице 'text_constants'
  const handleUpdateTextConstant = async (req: express.Request, res: express.Response) => {
    const constantKey = req.params.key || req.body.key;
    const { value, description, category } = req.body;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (!constantKey || typeof constantKey !== 'string') {
      return res.status(400).json({ success: false, error: 'Параметр key обязателен и должен быть строкой' });
    }
    if (value === undefined || typeof value !== 'string') {
      return res.status(400).json({ success: false, error: 'Параметр value обязателен и должен быть строкой' });
    }

    const dotIndex = constantKey.indexOf('.');
    const inferredCategory = category || (dotIndex > 0 ? constantKey.slice(0, dotIndex) : 'general');
    const inferredDescription = description || `${inferredCategory} - ${dotIndex > 0 ? constantKey.slice(dotIndex + 1) : constantKey}`;

    // Обновляем структуру currentSiteTexts
    if (dotIndex > 0) {
      const cat = constantKey.slice(0, dotIndex) as keyof SiteTextsData;
      const field = constantKey.slice(dotIndex + 1);
      if (currentSiteTexts[cat] && typeof (currentSiteTexts[cat] as any)[field] === 'string') {
        (currentSiteTexts[cat] as any)[field] = value;
      }
    }
    saveToDisk(currentSiteTexts);

    let updatedRecord = null;
    let source = 'memory_and_disk';

    if (isDbConfigured()) {
      try {
        const existing = await db.select().from(schema.textConstants).where(eq(schema.textConstants.key, constantKey));
        if (existing.length > 0) {
          await db.update(schema.textConstants)
            .set({ value, category: inferredCategory, description: inferredDescription, updatedAt: new Date() })
            .where(eq(schema.textConstants.key, constantKey));
        } else {
          await db.insert(schema.textConstants).values({
            key: constantKey,
            category: inferredCategory,
            value,
            description: inferredDescription,
            updatedAt: new Date()
          });
        }
        const refreshed = await db.select().from(schema.textConstants).where(eq(schema.textConstants.key, constantKey));
        updatedRecord = refreshed[0] || null;
        source = 'database_table';

        // Синхронизируем cmsStore
        const existingStore = await db.select().from(schema.cmsStore).where(eq(schema.cmsStore.key, 'site_text_constants'));
        if (existingStore.length > 0) {
          await db.update(schema.cmsStore)
            .set({ value: currentSiteTexts, updatedAt: new Date() })
            .where(eq(schema.cmsStore.key, 'site_text_constants'));
        } else {
          await db.insert(schema.cmsStore).values({
            key: 'site_text_constants',
            value: currentSiteTexts
          });
        }
      } catch (dbError: any) {
        console.warn('DB error in handleUpdateTextConstant:', dbError?.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Текстовая константа "${constantKey}" успешно обновлена`,
      source,
      table: 'text_constants',
      key: constantKey,
      value,
      record: updatedRecord,
      data: currentSiteTexts,
      timestamp: new Date().toISOString()
    });
  };

  app.put(['/api/text-constants/item/:key', '/api/text_constants/item/:key'], handleUpdateTextConstant);
  app.put(['/api/text-constants/:key', '/api/text_constants/:key'], handleUpdateTextConstant);
  app.post(['/api/text-constants', '/api/text_constants'], handleUpdateTextConstant);
  app.get('/api/site-texts', async (_req, res) => {
    if (isDbConfigured()) {
      try {
        const result = await db.select().from(schema.cmsStore).where(eq(schema.cmsStore.key, 'site_text_constants'));
        if (result.length > 0 && result[0].value) {
          const dbData = result[0].value as any;
          currentSiteTexts = {
            ...DEFAULT_SITE_TEXTS,
            ...dbData,
            home: { ...DEFAULT_SITE_TEXTS.home, ...(dbData.home || {}) },
            about: { ...DEFAULT_SITE_TEXTS.about, ...(dbData.about || {}) },
            contacts: { ...DEFAULT_SITE_TEXTS.contacts, ...(dbData.contacts || {}) },
            services: { ...DEFAULT_SITE_TEXTS.services, ...(dbData.services || {}) },
            catalogs: { ...DEFAULT_SITE_TEXTS.catalogs, ...(dbData.catalogs || {}) },
            footer: { ...DEFAULT_SITE_TEXTS.footer, ...(dbData.footer || {}) },
          };
          return res.json({
            success: true,
            data: currentSiteTexts,
            source: 'database',
            updatedAt: result[0].updatedAt?.toISOString() || new Date().toISOString()
          });
        }
      } catch (err: any) {
        console.warn('DB error reading site_text_constants:', err?.message);
      }
    }

    return res.json({
      success: true,
      data: currentSiteTexts,
      source: 'memory_fallback',
      updatedAt: new Date().toISOString()
    });
  });

  // 2. PUT /api/site-texts
  app.put('/api/site-texts', async (req, res) => {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid data format' });
    }

    currentSiteTexts = {
      ...currentSiteTexts,
      ...incoming,
      home: { ...currentSiteTexts.home, ...(incoming.home || {}) },
      about: { ...currentSiteTexts.about, ...(incoming.about || {}) },
      contacts: { ...currentSiteTexts.contacts, ...(incoming.contacts || {}) },
      services: { ...currentSiteTexts.services, ...(incoming.services || {}) },
      catalogs: { ...currentSiteTexts.catalogs, ...(incoming.catalogs || {}) },
      footer: { ...currentSiteTexts.footer, ...(incoming.footer || {}) },
    };

    saveToDisk(currentSiteTexts);

    if (isDbConfigured()) {
      try {
        const existing = await db.select().from(schema.cmsStore).where(eq(schema.cmsStore.key, 'site_text_constants'));
        if (existing.length > 0) {
          await db.update(schema.cmsStore)
            .set({ value: currentSiteTexts, updatedAt: new Date() })
            .where(eq(schema.cmsStore.key, 'site_text_constants'));
        } else {
          await db.insert(schema.cmsStore).values({
            key: 'site_text_constants',
            value: currentSiteTexts
          });
        }
        await syncRelationalTextConstants(currentSiteTexts);
      } catch (err: any) {
        console.warn('DB error updating site_text_constants:', err?.message);
      }
    }

    return res.json({
      success: true,
      message: 'Текстовые константы успешно сохранены в базе данных!',
      data: currentSiteTexts,
      updatedAt: new Date().toISOString()
    });
  });

  // 3. POST /api/site-texts/reset
  app.post('/api/site-texts/reset', async (_req, res) => {
    currentSiteTexts = JSON.parse(JSON.stringify(DEFAULT_SITE_TEXTS));
    saveToDisk(currentSiteTexts);

    if (isDbConfigured()) {
      try {
        await db.delete(schema.cmsStore).where(eq(schema.cmsStore.key, 'site_text_constants'));
        await syncRelationalTextConstants(currentSiteTexts);
      } catch (err: any) {
        console.warn('DB error resetting site_text_constants:', err?.message);
      }
    }

    return res.json({
      success: true,
      message: 'Текстовые константы сброшены к значениям по умолчанию.',
      data: currentSiteTexts
    });
  });

  // 4. POST /api/site-texts/import
  app.post('/api/site-texts/import', async (req, res) => {
    const { data } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, error: 'Ожидается JSON-объект с текстовыми константами' });
    }

    currentSiteTexts = {
      ...DEFAULT_SITE_TEXTS,
      ...data,
      home: { ...DEFAULT_SITE_TEXTS.home, ...(data.home || {}) },
      about: { ...DEFAULT_SITE_TEXTS.about, ...(data.about || {}) },
      contacts: { ...DEFAULT_SITE_TEXTS.contacts, ...(data.contacts || {}) },
      services: { ...DEFAULT_SITE_TEXTS.services, ...(data.services || {}) },
      catalogs: { ...DEFAULT_SITE_TEXTS.catalogs, ...(data.catalogs || {}) },
      footer: { ...DEFAULT_SITE_TEXTS.footer, ...(data.footer || {}) },
    };

    saveToDisk(currentSiteTexts);

    if (isDbConfigured()) {
      try {
        const existing = await db.select().from(schema.cmsStore).where(eq(schema.cmsStore.key, 'site_text_constants'));
        if (existing.length > 0) {
          await db.update(schema.cmsStore)
            .set({ value: currentSiteTexts, updatedAt: new Date() })
            .where(eq(schema.cmsStore.key, 'site_text_constants'));
        } else {
          await db.insert(schema.cmsStore).values({
            key: 'site_text_constants',
            value: currentSiteTexts
          });
        }
        await syncRelationalTextConstants(currentSiteTexts);
      } catch (err: any) {
        console.warn('DB error on importing site_text_constants:', err?.message);
      }
    }

    return res.json({
      success: true,
      message: 'Текстовые константы успешно импортированы!',
      data: currentSiteTexts
    });
  });
}
