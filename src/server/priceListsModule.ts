import { Express, Request, Response } from 'express';
import { eq, desc, asc, and, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { db, isDbConfigured } from '../db/index.ts';
import * as schema from '../db/schema.ts';
import { logRealtimeEvent } from './logger.ts';
import { INDUSTRIAL_PRICE_LIST, PriceItem, PriceHistoryRecord, calculateItemEconomics } from '../data/priceListsData.ts';

const CRM_DATA_DIR = path.join(process.cwd(), 'data');
const PRICE_ITEMS_FILE_PATH = path.join(CRM_DATA_DIR, 'price_items.json');
const PRICE_HISTORY_FILE_PATH = path.join(CRM_DATA_DIR, 'price_history.json');

// In-memory runtime stores initialized from initial data
let priceItemsStore: PriceItem[] = [...INDUSTRIAL_PRICE_LIST];
let priceHistoryStore: PriceHistoryRecord[] = [];

// Helper to generate initial history records for existing catalog
function generateInitialPriceHistory(): PriceHistoryRecord[] {
  return priceItemsStore.map((item, idx) => {
    const econ = calculateItemEconomics(item.costPriceRub, item.priceRub);
    return {
      id: `phist-init-${item.id}`,
      itemId: item.id,
      versionNumber: 1,
      costPriceRub: item.costPriceRub,
      priceRub: item.priceRub,
      partnerPriceRub: item.partnerPriceRub || Math.round(item.priceRub * 0.9),
      priceUsd: item.priceUsd,
      vatRate: item.vatRate || 22,
      marginPercent: econ.marginPercent,
      markupPercent: econ.markupPercent,
      maxDiscountPercent: item.maxDiscountPercent || 15,
      validFrom: item.createdAt || new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      validTo: null,
      changeReason: 'Базовый прейскурант «ДС-Инжиниринг» на 2026 год',
      changedByUserId: 'usr-admin-01',
      changedByManagerName: 'Некрасов С.Ю. (Генеральный директор)',
      notes: 'Начальная фиксация цен при запуске портала',
      createdAt: item.createdAt || new Date().toISOString()
    };
  });
}

// Ensure data directory exists and load initial files
try {
  if (!fs.existsSync(CRM_DATA_DIR)) {
    fs.mkdirSync(CRM_DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(PRICE_ITEMS_FILE_PATH)) {
    const rawData = fs.readFileSync(PRICE_ITEMS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      priceItemsStore = parsed;
    }
  } else {
    fs.writeFileSync(PRICE_ITEMS_FILE_PATH, JSON.stringify(INDUSTRIAL_PRICE_LIST, null, 2), 'utf-8');
  }

  if (fs.existsSync(PRICE_HISTORY_FILE_PATH)) {
    const rawHist = fs.readFileSync(PRICE_HISTORY_FILE_PATH, 'utf-8');
    const parsedHist = JSON.parse(rawHist);
    if (Array.isArray(parsedHist) && parsedHist.length > 0) {
      priceHistoryStore = parsedHist;
    } else {
      priceHistoryStore = generateInitialPriceHistory();
      fs.writeFileSync(PRICE_HISTORY_FILE_PATH, JSON.stringify(priceHistoryStore, null, 2), 'utf-8');
    }
  } else {
    priceHistoryStore = generateInitialPriceHistory();
    fs.writeFileSync(PRICE_HISTORY_FILE_PATH, JSON.stringify(priceHistoryStore, null, 2), 'utf-8');
  }
} catch (err) {
  console.warn('[PriceListsModule] Failed to init price data files:', err);
}

// Helper to save history store to disk
function savePriceHistoryToDisk(history: PriceHistoryRecord[]) {
  try {
    fs.writeFileSync(PRICE_HISTORY_FILE_PATH, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PriceListsModule] Error saving price_history.json:', err);
  }
}

// Helper to save store to file disk
function savePriceItemsToDisk(items: PriceItem[]) {
  try {
    fs.writeFileSync(PRICE_ITEMS_FILE_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PriceListsModule] Error saving price_items.json:', err);
  }
}

/**
 * Synchronize in-memory/file price items with PostgreSQL 17 database if connected
 */
async function syncPriceItemsToDb(items: PriceItem[]) {
  if (!isDbConfigured()) return;
  try {
    for (const item of items) {
      const econ = calculateItemEconomics(item.costPriceRub, item.priceRub);
      await db.insert(schema.priceItems).values({
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        categoryLabel: item.categoryLabel || 'Номенклатура',
        subCategory: item.subCategory || null,
        manufacturer: item.manufacturer || 'ДС-Инжиниринг',
        description: item.description || '',
        unit: item.unit || 'шт.',
        costPriceRub: item.costPriceRub || 0,
        priceRub: item.priceRub || 0,
        priceUsd: item.priceUsd || null,
        vatRate: item.vatRate !== undefined ? item.vatRate : 22,
        maxDiscountPercent: item.maxDiscountPercent !== undefined ? item.maxDiscountPercent : 15,
        marginPercent: econ.marginPercent,
        inStock: Boolean(item.inStock),
        leadTimeDays: item.leadTimeDays || 3,
        warrantyMonths: item.warrantyMonths || 12,
        supplierName: item.supplierName || null,
        supplierContact: item.supplierContact || null,
        minOrderQty: item.minOrderQty || 1,
        specifications: item.specifications || {},
        notes: item.notes || null,
        tags: item.tags || [],
        isPopular: Boolean(item.isPopular),
        isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: schema.priceItems.id,
        set: {
          sku: item.sku,
          name: item.name,
          category: item.category,
          categoryLabel: item.categoryLabel || 'Номенклатура',
          subCategory: item.subCategory || null,
          manufacturer: item.manufacturer,
          description: item.description,
          unit: item.unit,
          costPriceRub: item.costPriceRub || 0,
          priceRub: item.priceRub || 0,
          priceUsd: item.priceUsd || null,
          vatRate: item.vatRate !== undefined ? item.vatRate : 22,
          maxDiscountPercent: item.maxDiscountPercent !== undefined ? item.maxDiscountPercent : 15,
          marginPercent: econ.marginPercent,
          inStock: Boolean(item.inStock),
          leadTimeDays: item.leadTimeDays || 3,
          warrantyMonths: item.warrantyMonths || 12,
          supplierName: item.supplierName || null,
          supplierContact: item.supplierContact || null,
          specifications: item.specifications || {},
          notes: item.notes || null,
          isPopular: Boolean(item.isPopular),
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          updatedAt: new Date()
        }
      });
    }
  } catch (dbErr) {
    console.warn('[PriceListsModule] DB sync skipped/failed:', dbErr);
  }
}

// Initial async sync
setTimeout(() => {
  syncPriceItemsToDb(priceItemsStore).catch(e => console.warn(e));
}, 2000);

export function registerPriceListsRoutes(app: Express) {
  /**
   * GET /api/crm/price-items
   * Fetch all price items with optional search & category filtering
   */
  app.get('/api/crm/price-items', async (req: Request, res: Response) => {
    try {
      const { category, search, activeOnly } = req.query;

      // Try database fetch first if available
      if (isDbConfigured()) {
        try {
          const dbRows = await db.select().from(schema.priceItems).orderBy(desc(schema.priceItems.isPopular), asc(schema.priceItems.name));
          if (dbRows && dbRows.length > 0) {
            let filtered = dbRows.map(row => ({
              id: row.id,
              sku: row.sku,
              name: row.name,
              category: row.category as any,
              categoryLabel: row.categoryLabel,
              subCategory: row.subCategory || undefined,
              manufacturer: row.manufacturer,
              description: row.description,
              unit: row.unit,
              costPriceRub: row.costPriceRub,
              priceRub: row.priceRub,
              priceUsd: row.priceUsd || undefined,
              vatRate: row.vatRate,
              maxDiscountPercent: row.maxDiscountPercent,
              marginPercent: row.marginPercent || calculateItemEconomics(row.costPriceRub, row.priceRub).marginPercent,
              inStock: row.inStock,
              leadTimeDays: row.leadTimeDays,
              warrantyMonths: row.warrantyMonths || undefined,
              supplierName: row.supplierName || undefined,
              supplierContact: row.supplierContact || undefined,
              specifications: (row.specifications as Record<string, string>) || {},
              notes: row.notes || undefined,
              isPopular: row.isPopular,
              isActive: row.isActive,
              createdAt: row.createdAt?.toISOString(),
              updatedAt: row.updatedAt?.toISOString()
            }));

            if (category && category !== 'all') {
              filtered = filtered.filter(i => i.category === category);
            }
            if (activeOnly === 'true') {
              filtered = filtered.filter(i => i.isActive);
            }
            if (search) {
              const q = String(search).toLowerCase().trim();
              filtered = filtered.filter(i => 
                i.name.toLowerCase().includes(q) ||
                i.sku.toLowerCase().includes(q) ||
                i.manufacturer.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q)
              );
            }

            return res.json({ success: true, items: filtered, total: filtered.length, source: 'database' });
          }
        } catch (dbErr) {
          console.warn('[PriceListsModule] DB query failed, falling back to memory/file store:', dbErr);
        }
      }

      // In-memory / File Fallback
      let result = [...priceItemsStore];
      if (category && category !== 'all') {
        result = result.filter(i => i.category === category);
      }
      if (activeOnly === 'true') {
        result = result.filter(i => i.isActive !== false);
      }
      if (search) {
        const q = String(search).toLowerCase().trim();
        result = result.filter(i => 
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.manufacturer.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
        );
      }

      res.json({ success: true, items: result, total: result.length, source: 'file_cache' });
    } catch (err: any) {
      console.error('[PriceListsModule] Error getting price items:', err);
      res.status(500).json({ success: false, error: err.message || 'Ошибка получения прайс-листа' });
    }
  });

  /**
   * GET /api/crm/price-items/:id
   */
  app.get('/api/crm/price-items/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item = priceItemsStore.find(i => i.id === id || i.sku === id);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Позиция прайс-листа не найдена' });
      }
      res.json({ success: true, item });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * POST /api/crm/price-items
   * Create a new price item
   */
  app.post('/api/crm/price-items', async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload.name || !payload.sku || payload.priceRub === undefined) {
        return res.status(400).json({ success: false, error: 'Обязательные поля: SKU (артикул), Наименование и Цена продажи' });
      }

      // Check unique SKU
      const existingSku = priceItemsStore.find(i => i.sku.toLowerCase() === String(payload.sku).toLowerCase().trim());
      if (existingSku) {
        return res.status(400).json({ success: false, error: `Позиция с артикулом ${payload.sku} уже существует` });
      }

      const categoryLabels: Record<string, string> = {
        software: 'Программное ПО',
        hardware: 'Оборудование СИ',
        services: 'Инжиниринговые услуги',
        accessories: 'Оснастка и допоборудование',
        non_core_services: 'Непрофильные услуги'
      };

      const costPrice = Number(payload.costPriceRub) || 0;
      const salePrice = Number(payload.priceRub) || 0;
      const econ = calculateItemEconomics(costPrice, salePrice);

      const newItem: PriceItem = {
        id: payload.id || `price-${payload.category ? payload.category.slice(0, 3) : 'itm'}-${Date.now()}`,
        sku: String(payload.sku).trim().toUpperCase(),
        name: String(payload.name).trim(),
        category: payload.category || 'hardware',
        categoryLabel: categoryLabels[payload.category] || payload.categoryLabel || 'Номенклатура',
        subCategory: payload.subCategory || '',
        manufacturer: payload.manufacturer || 'ДС-Инжиниринг',
        description: payload.description || '',
        unit: payload.unit || 'шт.',
        costPriceRub: costPrice,
        priceRub: salePrice,
        priceUsd: payload.priceUsd ? Number(payload.priceUsd) : undefined,
        vatRate: payload.vatRate !== undefined ? Number(payload.vatRate) : 22,
        maxDiscountPercent: payload.maxDiscountPercent !== undefined ? Number(payload.maxDiscountPercent) : 15,
        marginPercent: econ.marginPercent,
        markupPercent: econ.markupPercent,
        inStock: payload.inStock !== undefined ? Boolean(payload.inStock) : true,
        leadTimeDays: Number(payload.leadTimeDays) || 3,
        warrantyMonths: payload.warrantyMonths !== undefined ? Number(payload.warrantyMonths) : 12,
        supplierName: payload.supplierName || '',
        supplierContact: payload.supplierContact || '',
        minOrderQty: Number(payload.minOrderQty) || 1,
        specifications: payload.specifications || {},
        notes: payload.notes || '',
        tags: Array.isArray(payload.tags) ? payload.tags : [],
        isPopular: Boolean(payload.isPopular),
        isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      priceItemsStore.unshift(newItem);
      savePriceItemsToDisk(priceItemsStore);

      // Async DB Sync
      syncPriceItemsToDb([newItem]).catch(e => console.warn(e));

      logRealtimeEvent({
        category: 'CMS_UPDATE',
        level: 'INFO',
        action: 'PRICE_ITEM_CREATED',
        summary: `Добавлена номенклатурная позиция: [${newItem.sku}] ${newItem.name} (${newItem.priceRub.toLocaleString('ru-RU')} ₽)`,
        details: { sku: newItem.sku, name: newItem.name, price: newItem.priceRub }
      });

      res.status(201).json({ success: true, item: newItem });
    } catch (err: any) {
      console.error('[PriceListsModule] Error creating price item:', err);
      res.status(500).json({ success: false, error: err.message || 'Ошибка создания позиции' });
    }
  });

  /**
   * PUT /api/crm/price-items/:id
   * Update existing price item
   */
  app.put('/api/crm/price-items/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const payload = req.body;

      const index = priceItemsStore.findIndex(i => i.id === id || i.sku === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Позиция для обновления не найдена' });
      }

      const current = priceItemsStore[index];
      const costPrice = payload.costPriceRub !== undefined ? Number(payload.costPriceRub) : current.costPriceRub;
      const salePrice = payload.priceRub !== undefined ? Number(payload.priceRub) : current.priceRub;
      const econ = calculateItemEconomics(costPrice, salePrice);

      const categoryLabels: Record<string, string> = {
        software: 'Программное ПО',
        hardware: 'Оборудование СИ',
        services: 'Инжиниринговые услуги',
        accessories: 'Оснастка и допоборудование',
        non_core_services: 'Непрофильные услуги'
      };

      const updatedItem: PriceItem = {
        ...current,
        ...payload,
        sku: payload.sku ? String(payload.sku).trim().toUpperCase() : current.sku,
        name: payload.name ? String(payload.name).trim() : current.name,
        category: payload.category || current.category,
        categoryLabel: categoryLabels[payload.category || current.category] || payload.categoryLabel || current.categoryLabel,
        costPriceRub: costPrice,
        priceRub: salePrice,
        vatRate: payload.vatRate !== undefined ? Number(payload.vatRate) : current.vatRate,
        maxDiscountPercent: payload.maxDiscountPercent !== undefined ? Number(payload.maxDiscountPercent) : current.maxDiscountPercent,
        marginPercent: econ.marginPercent,
        markupPercent: econ.markupPercent,
        inStock: payload.inStock !== undefined ? Boolean(payload.inStock) : current.inStock,
        leadTimeDays: payload.leadTimeDays !== undefined ? Number(payload.leadTimeDays) : current.leadTimeDays,
        warrantyMonths: payload.warrantyMonths !== undefined ? Number(payload.warrantyMonths) : current.warrantyMonths,
        isPopular: payload.isPopular !== undefined ? Boolean(payload.isPopular) : current.isPopular,
        isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : current.isActive,
        updatedAt: new Date().toISOString()
      };

      priceItemsStore[index] = updatedItem;
      savePriceItemsToDisk(priceItemsStore);

      // Async DB Sync
      syncPriceItemsToDb([updatedItem]).catch(e => console.warn(e));

      logRealtimeEvent({
        category: 'CMS_UPDATE',
        level: 'INFO',
        action: 'PRICE_ITEM_UPDATED',
        summary: `Обновлена позиция прайс-листа: [${updatedItem.sku}] ${updatedItem.name}`,
        details: { sku: updatedItem.sku, name: updatedItem.name }
      });

      res.json({ success: true, item: updatedItem });
    } catch (err: any) {
      console.error('[PriceListsModule] Error updating price item:', err);
      res.status(500).json({ success: false, error: err.message || 'Ошибка обновления позиции' });
    }
  });

  /**
   * DELETE /api/crm/price-items/:id
   */
  app.delete('/api/crm/price-items/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const index = priceItemsStore.findIndex(i => i.id === id || i.sku === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Позиция не найдена' });
      }

      const removed = priceItemsStore[index];
      priceItemsStore.splice(index, 1);
      savePriceItemsToDisk(priceItemsStore);

      if (isDbConfigured()) {
        try {
          await db.delete(schema.priceItems).where(eq(schema.priceItems.id, id));
        } catch (dbErr) {
          console.warn('[PriceListsModule] DB delete error:', dbErr);
        }
      }

      logRealtimeEvent({
        category: 'CMS_UPDATE',
        level: 'INFO',
        action: 'PRICE_ITEM_DELETED',
        summary: `Удалена позиция прайс-листа: [${removed.sku}] ${removed.name}`,
        details: { sku: removed.sku, name: removed.name }
      });

      res.json({ success: true, message: 'Позиция успешно удалена', deletedId: id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * POST /api/crm/price-items/import
   * Bulk import / replace price items
   */
  app.post('/api/crm/price-items/import', async (req: Request, res: Response) => {
    try {
      const { items, mode = 'merge' } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Передан пустой массив номенклатуры' });
      }

      const validated: PriceItem[] = [];
      for (const raw of items) {
        if (!raw.name || !raw.sku || raw.priceRub === undefined) continue;
        const costPrice = Number(raw.costPriceRub) || 0;
        const salePrice = Number(raw.priceRub) || 0;
        const econ = calculateItemEconomics(costPrice, salePrice);

        validated.push({
          id: raw.id || `price-${raw.category ? raw.category.slice(0, 3) : 'imp'}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          sku: String(raw.sku).trim().toUpperCase(),
          name: String(raw.name).trim(),
          category: raw.category || 'hardware',
          categoryLabel: raw.categoryLabel || 'Номенклатура',
          subCategory: raw.subCategory || '',
          manufacturer: raw.manufacturer || 'ДС-Инжиниринг',
          description: raw.description || '',
          unit: raw.unit || 'шт.',
          costPriceRub: costPrice,
          priceRub: salePrice,
          priceUsd: raw.priceUsd ? Number(raw.priceUsd) : undefined,
          vatRate: raw.vatRate !== undefined ? Number(raw.vatRate) : 22,
          maxDiscountPercent: raw.maxDiscountPercent !== undefined ? Number(raw.maxDiscountPercent) : 15,
          marginPercent: econ.marginPercent,
          markupPercent: econ.markupPercent,
          inStock: raw.inStock !== undefined ? Boolean(raw.inStock) : true,
          leadTimeDays: Number(raw.leadTimeDays) || 3,
          warrantyMonths: raw.warrantyMonths !== undefined ? Number(raw.warrantyMonths) : 12,
          supplierName: raw.supplierName || '',
          supplierContact: raw.supplierContact || '',
          specifications: raw.specifications || {},
          notes: raw.notes || '',
          isPopular: Boolean(raw.isPopular),
          isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : true,
          createdAt: raw.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      if (mode === 'replace') {
        priceItemsStore = validated;
      } else {
        // Merge mode: update existing by SKU, add new
        for (const item of validated) {
          const idx = priceItemsStore.findIndex(i => i.sku === item.sku);
          if (idx >= 0) {
            priceItemsStore[idx] = { ...priceItemsStore[idx], ...item };
          } else {
            priceItemsStore.push(item);
          }
        }
      }

      savePriceItemsToDisk(priceItemsStore);
      syncPriceItemsToDb(priceItemsStore).catch(e => console.warn(e));

      res.json({
        success: true,
        message: `Импортировано позиций: ${validated.length}`,
        totalCount: priceItemsStore.length
      });
    } catch (err: any) {
      console.error('[PriceListsModule] Import error:', err);
      res.status(500).json({ success: false, error: err.message || 'Ошибка импорта прайс-листа' });
    }
  });

  /**
   * GET /api/crm/price-items/:id/history
   * Fetch all historical versions of price item
   */
  app.get('/api/crm/price-items/:id/history', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (isDbConfigured()) {
        try {
          const dbHistory = await db.select().from(schema.priceHistory)
            .where(eq(schema.priceHistory.itemId, id))
            .orderBy(desc(schema.priceHistory.versionNumber));
          if (dbHistory && dbHistory.length > 0) {
            return res.json({ success: true, history: dbHistory, source: 'database' });
          }
        } catch (dbErr) {
          console.warn('[PriceListsModule] DB history query failed:', dbErr);
        }
      }

      // Memory / File fallback
      const hist = priceHistoryStore
        .filter(h => h.itemId === id)
        .sort((a, b) => b.versionNumber - a.versionNumber);

      res.json({ success: true, history: hist, source: 'file_cache' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Ошибка истории цен' });
    }
  });

  /**
   * POST /api/crm/price-items/:id/change-price
   * Change price with mandatory reason, creating a new version record in price_history
   */
  app.post('/api/crm/price-items/:id/change-price', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        costPriceRub, 
        priceRub, 
        partnerPriceRub, 
        priceUsd, 
        changeReason = 'Плановое обновление цен', 
        changedByManagerName = 'Некрасов С.Ю.', 
        notes 
      } = req.body;

      const index = priceItemsStore.findIndex(i => i.id === id || i.sku === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Позиция не найдена' });
      }

      const item = priceItemsStore[index];
      const newCost = Number(costPriceRub) || item.costPriceRub;
      const newSale = Number(priceRub) || item.priceRub;
      const econ = calculateItemEconomics(newCost, newSale);
      const nextVersion = (item.currentVersion || 1) + 1;

      // Close previous active version in history
      const nowIso = new Date().toISOString();
      const prevActiveHist = priceHistoryStore.find(h => h.itemId === item.id && !h.validTo);
      if (prevActiveHist) {
        prevActiveHist.validTo = nowIso;
      }

      // Create new version history record
      const newHistoryRecord: PriceHistoryRecord = {
        id: `phist-${item.id}-v${nextVersion}-${Date.now()}`,
        itemId: item.id,
        versionNumber: nextVersion,
        costPriceRub: newCost,
        priceRub: newSale,
        partnerPriceRub: partnerPriceRub !== undefined ? Number(partnerPriceRub) : (item.partnerPriceRub || Math.round(newSale * 0.9)),
        priceUsd: priceUsd !== undefined ? Number(priceUsd) : item.priceUsd,
        vatRate: item.vatRate || 22,
        marginPercent: econ.marginPercent,
        markupPercent: econ.markupPercent,
        maxDiscountPercent: item.maxDiscountPercent || 15,
        validFrom: nowIso,
        validTo: null,
        changeReason: String(changeReason).trim(),
        changedByUserId: (req as any).user?.uid || 'usr-manager',
        changedByManagerName: String(changedByManagerName || 'Менеджер «ДС-Инжиниринг»'),
        notes: notes ? String(notes).trim() : undefined,
        createdAt: nowIso
      };

      priceHistoryStore.unshift(newHistoryRecord);
      savePriceHistoryToDisk(priceHistoryStore);

      // Update current item
      const updatedItem: PriceItem = {
        ...item,
        costPriceRub: newCost,
        priceRub: newSale,
        partnerPriceRub: newHistoryRecord.partnerPriceRub,
        priceUsd: newHistoryRecord.priceUsd,
        marginPercent: econ.marginPercent,
        markupPercent: econ.markupPercent,
        currentVersion: nextVersion,
        updatedAt: nowIso
      };

      priceItemsStore[index] = updatedItem;
      savePriceItemsToDisk(priceItemsStore);

      // Async DB Sync
      if (isDbConfigured()) {
        try {
          await db.update(schema.priceItems).set({
            costPriceRub: newCost,
            priceRub: newSale,
            partnerPriceRub: newHistoryRecord.partnerPriceRub,
            priceUsd: newHistoryRecord.priceUsd,
            marginPercent: econ.marginPercent,
            markupPercent: econ.markupPercent,
            currentVersion: nextVersion,
            updatedAt: new Date()
          }).where(eq(schema.priceItems.id, item.id));

          await db.insert(schema.priceHistory).values({
            id: newHistoryRecord.id,
            itemId: newHistoryRecord.itemId,
            versionNumber: newHistoryRecord.versionNumber,
            costPriceRub: newHistoryRecord.costPriceRub,
            priceRub: newHistoryRecord.priceRub,
            partnerPriceRub: newHistoryRecord.partnerPriceRub,
            priceUsd: newHistoryRecord.priceUsd,
            vatRate: newHistoryRecord.vatRate,
            marginPercent: newHistoryRecord.marginPercent,
            markupPercent: newHistoryRecord.markupPercent,
            maxDiscountPercent: newHistoryRecord.maxDiscountPercent,
            validFrom: new Date(),
            changeReason: newHistoryRecord.changeReason,
            changedByUserId: newHistoryRecord.changedByUserId,
            changedByManagerName: newHistoryRecord.changedByManagerName,
            notes: newHistoryRecord.notes
          });
        } catch (dbErr) {
          console.warn('[PriceListsModule] DB price version insert failed:', dbErr);
        }
      }

      logRealtimeEvent({
        category: 'CMS_UPDATE',
        level: 'INFO',
        action: 'PRICE_VERSION_CREATED',
        summary: `Изменена цена [${item.sku}] v${nextVersion}: ${newSale.toLocaleString('ru-RU')} ₽ (Закупка: ${newCost.toLocaleString('ru-RU')} ₽, Маржа: ${econ.marginPercent}%). Причина: ${changeReason}`,
        details: { sku: item.sku, version: nextVersion, sale: newSale, cost: newCost, changeReason }
      });

      res.json({
        success: true,
        message: `Цена позиции ${item.sku} обновлена до версии v${nextVersion}`,
        item: updatedItem,
        version: newHistoryRecord
      });
    } catch (err: any) {
      console.error('[PriceListsModule] Price change error:', err);
      res.status(500).json({ success: false, error: err.message || 'Ошибка обновления версии цены' });
    }
  });

  /**
   * GET /api/crm/price-categories
   */
  app.get('/api/crm/price-categories', async (_req: Request, res: Response) => {
    const defaultCategories = [
      { id: 'software', name: 'Программное ПО', slug: 'software', icon: 'Cpu', colorTheme: 'indigo', description: 'CAD/CAM/PDM системы и метрологический софт' },
      { id: 'hardware', name: 'Оборудование СИ', slug: 'hardware', icon: 'Package', colorTheme: 'blue', description: 'Стационарные КИМ, 3D-сканеры, лазерные трекеры' },
      { id: 'services', name: 'Инжиниринговые услуги', slug: 'services', icon: 'Wrench', colorTheme: 'amber', description: '3D-контроль GD&T, ЧПУ постпроцессоры, ретрофит' },
      { id: 'accessories', name: 'Оснастка и допоборудование', slug: 'accessories', icon: 'Tag', colorTheme: 'emerald', description: 'Щупы Renishaw, сферы, рабочие станции' },
      { id: 'non_core_services', name: 'Непрофильные услуги', slug: 'non_core_services', icon: 'Truck', colorTheme: 'purple', description: 'Спецдоставка, такелаж, командировки, обучение' },
    ];
    res.json({ success: true, categories: defaultCategories });
  });

  /**
   * GET /api/crm/price-tiers
   */
  app.get('/api/crm/price-tiers', async (_req: Request, res: Response) => {
    const defaultTiers = [
      { id: 'retail', name: 'Розничный прайс (100% базы)', discountPercent: 0, minMarginThresholdPercent: 20, isDefault: true },
      { id: 'partner', name: 'Партнерский / Дилерский (Скидка 10%)', discountPercent: 10, minMarginThresholdPercent: 15 },
      { id: 'vip', name: 'Ключевой Заказчик / VIP (Скидка 12%)', discountPercent: 12, minMarginThresholdPercent: 12 },
      { id: 'tender', name: 'Госзаказ / Тендерная заявка (Скидка 5%)', discountPercent: 5, minMarginThresholdPercent: 15 },
    ];
    res.json({ success: true, tiers: defaultTiers });
  });

  /**
   * Helper to parse CSV string into array of string columns
   */
  const parseCsvLines = (csvText: string, customDelimiter?: string): string[][] => {
    let delimiter = customDelimiter && customDelimiter !== 'auto' ? customDelimiter : ';';
    if (!customDelimiter || customDelimiter === 'auto') {
      const firstLine = csvText.split(/\r?\n/)[0] || '';
      const semiCount = (firstLine.match(/;/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const tabCount = (firstLine.match(/\t/g) || []).length;
      if (tabCount > semiCount && tabCount > commaCount) delimiter = '\t';
      else if (commaCount > semiCount && commaCount > tabCount) delimiter = ',';
      else delimiter = ';';
    }

    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  /**
   * POST /api/crm/price-items/import-csv
   * Batch mass update and import price items from CSV or JSON structure
   */
  app.post('/api/crm/price-items/import-csv', async (req: Request, res: Response) => {
    try {
      const { csvContent, mode = 'merge', delimiter, items: directItems } = req.body || {};
      let parsedItems: Partial<PriceItem>[] = [];

      if (Array.isArray(directItems) && directItems.length > 0) {
        parsedItems = directItems;
      } else if (typeof csvContent === 'string' && csvContent.trim()) {
        const rows = parseCsvLines(csvContent, delimiter);
        if (rows.length < 2) {
          return res.status(400).json({ success: false, error: 'CSV файл пуст или содержит только заголовок' });
        }

        const headers = rows[0].map(h => h.toLowerCase().trim().replace(/[\"\'\s]/g, ''));
        
        // Find column indices
        const findCol = (...keywords: string[]) => {
          return headers.findIndex(h => keywords.some(k => h.includes(k)));
        };

        const skuIdx = findCol('артикул', 'sku', 'код', 'номер');
        const nameIdx = findCol('наименование', 'модель', 'название', 'name', 'title', 'позиция');
        const catIdx = findCol('категория', 'раздел', 'category', 'тип');
        const subCatIdx = findCol('подкатегория', 'серия', 'subcategory');
        const mfgIdx = findCol('производитель', 'бренд', 'вендор', 'brand', 'manufacturer');
        const costIdx = findCol('себестоимость', 'закупка', 'cost', 'costpricerub', 'закупки');
        const priceIdx = findCol('ценапродажи', 'продажа', 'цена', 'price', 'pricerub', 'стоимость');
        const vatIdx = findCol('ндс', 'vat', 'vatrate', 'ставка');
        const discIdx = findCol('скидка', 'максскидка', 'discount');
        const stockIdx = findCol('наличие', 'склад', 'stock', 'instock', 'вналичии');
        const unitIdx = findCol('ед', 'единица', 'unit');
        const descIdx = findCol('описание', 'примечание', 'характеристики', 'description', 'notes');

        if (skuIdx === -1 && nameIdx === -1) {
          return res.status(400).json({ success: false, error: 'Не найдены обязательные столбцы «Артикул (SKU)» или «Наименование»' });
        }

        const parseNum = (val: string | undefined, defaultVal = 0): number => {
          if (!val) return defaultVal;
          const clean = val.replace(/\s/g, '').replace(/,/g, '.').replace(/[^\d.-]/g, '');
          const num = parseFloat(clean);
          return isNaN(num) ? defaultVal : num;
        };

        const mapCategory = (rawCat: string = ''): { category: PriceItem['category']; label: string } => {
          const l = rawCat.toLowerCase();
          if (l.includes('программ') || l.includes('софт') || l.includes('soft') || l.includes('cad') || l.includes('cam')) {
            return { category: 'software', label: 'Программное ПО' };
          }
          if (l.includes('услуг') || l.includes('сервис') || l.includes('измерен') || l.includes('контрол') || l.includes('service')) {
            return { category: 'services', label: 'Инжиниринговые услуги' };
          }
          if (l.includes('оснастк') || l.includes('щуп') || l.includes('датчик') || l.includes('renishaw') || l.includes('access')) {
            return { category: 'accessories', label: 'Оснастка и допоборудование' };
          }
          if (l.includes('непрофильн') || l.includes('доставк') || l.includes('такелаж')) {
            return { category: 'non_core_services', label: 'Непрофильные услуги' };
          }
          return { category: 'hardware', label: 'Оборудование СИ' };
        };

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          const rawSku = skuIdx !== -1 ? row[skuIdx] : '';
          const rawName = nameIdx !== -1 ? row[nameIdx] : '';
          if (!rawSku && !rawName) continue;

          const rawCat = catIdx !== -1 ? row[catIdx] : '';
          const catInfo = mapCategory(rawCat);
          const cost = parseNum(costIdx !== -1 ? row[costIdx] : undefined, 0);
          const price = parseNum(priceIdx !== -1 ? row[priceIdx] : undefined, 0);
          const vat = parseNum(vatIdx !== -1 ? row[vatIdx] : undefined, 22);
          const maxDisc = parseNum(discIdx !== -1 ? row[discIdx] : undefined, 15);
          
          const rawStock = stockIdx !== -1 ? (row[stockIdx] || '').toLowerCase() : 'да';
          const inStock = !rawStock.includes('нет') && !rawStock.includes('заказ') && !rawStock.includes('false') && !rawStock.includes('0');

          const skuVal = rawSku || `DS-${catInfo.category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

          parsedItems.push({
            sku: skuVal,
            name: rawName || skuVal,
            category: catInfo.category,
            categoryLabel: catInfo.label,
            subCategory: subCatIdx !== -1 ? row[subCatIdx] : undefined,
            manufacturer: mfgIdx !== -1 && row[mfgIdx] ? row[mfgIdx] : 'ДС-Инжиниринг',
            costPriceRub: cost,
            priceRub: price,
            vatRate: vat,
            maxDiscountPercent: maxDisc,
            inStock,
            unit: unitIdx !== -1 && row[unitIdx] ? row[unitIdx] : (catInfo.category === 'software' ? 'лицензия' : catInfo.category === 'services' ? 'услуга' : 'комплект'),
            description: descIdx !== -1 ? row[descIdx] : ''
          });
        }
      } else {
        return res.status(400).json({ success: false, error: 'Отсутствует содержимое CSV (параметр csvContent)' });
      }

      if (parsedItems.length === 0) {
        return res.status(400).json({ success: false, error: 'Не удалось распознать строки номенклатуры в переданном CSV' });
      }

      const nowIso = new Date().toISOString();
      let addedCount = 0;
      let updatedCount = 0;

      if (mode === 'replace') {
        const newStore: PriceItem[] = [];
        for (const item of parsedItems) {
          const id = item.id || `pi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const cost = Number(item.costPriceRub) || 0;
          const sale = Number(item.priceRub) || 0;
          const econ = calculateItemEconomics(cost, sale);

          newStore.push({
            id,
            sku: String(item.sku || '').trim(),
            name: String(item.name || '').trim(),
            category: item.category || 'hardware',
            categoryLabel: item.categoryLabel || 'Оборудование СИ',
            subCategory: item.subCategory,
            manufacturer: item.manufacturer || 'ДС-Инжиниринг',
            description: item.description || '',
            unit: item.unit || 'комплект',
            currency: 'RUB',
            costPriceRub: cost,
            priceRub: sale,
            partnerPriceRub: item.partnerPriceRub !== undefined ? Number(item.partnerPriceRub) : Math.round(sale * 0.9),
            marginPercent: econ.marginPercent,
            markupPercent: econ.markupPercent,
            vatRate: Number(item.vatRate) || 22,
            maxDiscountPercent: Number(item.maxDiscountPercent) || 15,
            inStock: Boolean(item.inStock ?? true),
            leadTimeDays: Number(item.leadTimeDays) || 3,
            warrantyMonths: Number(item.warrantyMonths) || 12,
            specifications: item.specifications || {},
            currentVersion: 1,
            isActive: true,
            createdAt: nowIso,
            updatedAt: nowIso
          });
          addedCount++;
        }
        priceItemsStore = newStore;
      } else {
        // Mode 'merge' (default): upsert by SKU
        for (const item of parsedItems) {
          const sku = String(item.sku || '').trim().toLowerCase();
          const existingIdx = priceItemsStore.findIndex(i => i.sku.toLowerCase() === sku);
          const cost = Number(item.costPriceRub) || 0;
          const sale = Number(item.priceRub) || 0;
          const econ = calculateItemEconomics(cost, sale);

          if (existingIdx !== -1) {
            const existing = priceItemsStore[existingIdx];
            const priceChanged = existing.priceRub !== sale || existing.costPriceRub !== cost;
            const nextVersion = priceChanged ? (existing.currentVersion || 1) + 1 : (existing.currentVersion || 1);

            if (priceChanged) {
              const histRecord: PriceHistoryRecord = {
                id: `pvh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                itemId: existing.id,
                versionNumber: nextVersion,
                costPriceRub: cost,
                priceRub: sale,
                partnerPriceRub: Math.round(sale * 0.9),
                vatRate: Number(item.vatRate) || existing.vatRate,
                marginPercent: econ.marginPercent,
                markupPercent: econ.markupPercent,
                maxDiscountPercent: Number(item.maxDiscountPercent) || existing.maxDiscountPercent,
                validFrom: nowIso,
                validTo: null,
                changeReason: 'Массовое обновление из CSV прайс-листа',
                changedByUserId: (req as any).user?.uid || 'usr-admin',
                changedByManagerName: 'Администратор (Импорт CSV)',
                createdAt: nowIso
              };
              priceHistoryStore.unshift(histRecord);
            }

            priceItemsStore[existingIdx] = {
              ...existing,
              name: item.name ? String(item.name).trim() : existing.name,
              category: item.category || existing.category,
              categoryLabel: item.categoryLabel || existing.categoryLabel,
              subCategory: item.subCategory !== undefined ? item.subCategory : existing.subCategory,
              manufacturer: item.manufacturer || existing.manufacturer,
              description: item.description !== undefined ? item.description : existing.description,
              unit: item.unit || existing.unit,
              costPriceRub: cost,
              priceRub: sale,
              partnerPriceRub: Math.round(sale * 0.9),
              marginPercent: econ.marginPercent,
              markupPercent: econ.markupPercent,
              vatRate: Number(item.vatRate) || existing.vatRate,
              maxDiscountPercent: Number(item.maxDiscountPercent) || existing.maxDiscountPercent,
              inStock: item.inStock !== undefined ? item.inStock : existing.inStock,
              currentVersion: nextVersion,
              updatedAt: nowIso
            };
            updatedCount++;
          } else {
            const id = item.id || `pi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            priceItemsStore.push({
              id,
              sku: String(item.sku || '').trim(),
              name: String(item.name || '').trim(),
              category: item.category || 'hardware',
              categoryLabel: item.categoryLabel || 'Оборудование СИ',
              subCategory: item.subCategory,
              manufacturer: item.manufacturer || 'ДС-Инжиниринг',
              description: item.description || '',
              unit: item.unit || 'комплект',
              currency: 'RUB',
              costPriceRub: cost,
              priceRub: sale,
              partnerPriceRub: Math.round(sale * 0.9),
              marginPercent: econ.marginPercent,
              markupPercent: econ.markupPercent,
              vatRate: Number(item.vatRate) || 22,
              maxDiscountPercent: Number(item.maxDiscountPercent) || 15,
              inStock: Boolean(item.inStock ?? true),
              leadTimeDays: Number(item.leadTimeDays) || 3,
              warrantyMonths: Number(item.warrantyMonths) || 12,
              specifications: item.specifications || {},
              currentVersion: 1,
              isActive: true,
              createdAt: nowIso,
              updatedAt: nowIso
            });
            addedCount++;
          }
        }
      }

      // Persist to disk
      savePriceItemsToDisk(priceItemsStore);
      savePriceHistoryToDisk(priceHistoryStore);

      // Async DB Sync
      syncPriceItemsToDb(priceItemsStore).catch(e => console.warn('[PriceListsModule] Sync error:', e));

      logRealtimeEvent({
        category: 'CMS_UPDATE',
        level: 'INFO',
        action: 'PRICE_CATALOG_CSV_IMPORTED',
        summary: `Массовый импорт CSV (${mode}): добавлено ${addedCount}, обновлено ${updatedCount}, всего в базе ${priceItemsStore.length} позиций.`,
        details: { mode, addedCount, updatedCount, total: priceItemsStore.length }
      });

      res.json({
        success: true,
        message: `Импорт CSV успешно завершен: добавлено ${addedCount}, обновлено ${updatedCount} позиций`,
        mode,
        addedCount,
        updatedCount,
        totalCount: priceItemsStore.length,
        items: priceItemsStore
      });
    } catch (err: any) {
      console.error('[PriceListsModule] CSV Import Error:', err);
      res.status(500).json({ success: false, error: err.message || 'Ошибка обработки CSV файла' });
    }
  });

  /**
   * POST /api/crm/price-items/reset-defaults
   */
  app.post('/api/crm/price-items/reset-defaults', async (_req: Request, res: Response) => {
    try {
      priceItemsStore = [...INDUSTRIAL_PRICE_LIST];
      priceHistoryStore = generateInitialPriceHistory();
      savePriceItemsToDisk(priceItemsStore);
      savePriceHistoryToDisk(priceHistoryStore);
      syncPriceItemsToDb(priceItemsStore).catch(e => console.warn(e));

      res.json({
        success: true,
        message: 'Прайс-лист и история успешно сброшены к эталонной номенклатуре компании',
        totalCount: priceItemsStore.length
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
