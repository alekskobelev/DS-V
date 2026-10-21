import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
  onSnapshot,
  Unsubscribe,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  PriceItem,
  PriceCategory,
  PriceHistoryRecord,
  PriceTierRule,
  PriceDiscountRule,
  DEFAULT_DISCOUNT_RULES,
  calculateDiscountForItem,
  calculateItemEconomics,
  INDUSTRIAL_PRICE_LIST
} from '../data/priceListsData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standardized Firestore error handler providing structured debug information
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.error('[PriceService] Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Firestore Collection Names
export const COLLECTIONS = {
  PRICE_ITEMS: 'price_items',
  PRICE_CATEGORIES: 'price_categories',
  PRICE_HISTORY: 'price_history',
  PRICE_TIER_RULES: 'price_tier_rules',
  PRICE_DISCOUNT_RULES: 'price_discount_rules',
} as const;


/**
 * Default categories configuration for initial seeding
 */
export const DEFAULT_PRICE_CATEGORIES: PriceCategory[] = [
  {
    id: 'pcat-software',
    slug: 'software',
    name: 'Программное обеспечение',
    description: 'Лицензии Geomagic, PolyWorks, CAD/CAM модули, PDM',
    icon: 'Terminal',
    colorTheme: 'blue',
    orderIndex: 1,
    isActive: true
  },
  {
    id: 'pcat-hardware',
    slug: 'hardware',
    name: 'Оборудование СИ и КИМ',
    description: 'Координатно-измерительные машины, 3D-сканеры, лазерные трекеры',
    icon: 'Layers',
    colorTheme: 'indigo',
    orderIndex: 2,
    isActive: true
  },
  {
    id: 'pcat-services',
    slug: 'services',
    name: 'Инжиниринговые услуги',
    description: '3D-сканирование, обратный инжиниринг, контроль геометрии GD&T',
    icon: 'Sparkles',
    colorTheme: 'emerald',
    orderIndex: 3,
    isActive: true
  },
  {
    id: 'pcat-accessories',
    slug: 'accessories',
    name: 'Оснастка и щупы',
    description: 'Метрологические стилусы, удлинители, переходники, резьбовые калибры',
    icon: 'Wrench',
    colorTheme: 'amber',
    orderIndex: 4,
    isActive: true
  },
  {
    id: 'pcat-non-core',
    slug: 'non_core_services',
    name: 'Непрофильные сервисы',
    description: 'Сервисное обслуживание, регламентная калибровка, выездная юстировка',
    icon: 'ShieldCheck',
    colorTheme: 'purple',
    orderIndex: 5,
    isActive: true
  }
];

/**
 * Default price tier rules
 */
export const DEFAULT_PRICE_TIER_RULES: PriceTierRule[] = [
  {
    id: 'tier-retail',
    name: 'Базовый розничный прайс',
    description: 'Стандартные условия для прямых клиентов без корпоративного соглашения',
    discountPercent: 0,
    minMarginThresholdPercent: 20,
    isDefault: true,
    isActive: true
  },
  {
    id: 'tier-integrator',
    name: 'Сертифицированный интегратор',
    description: 'Системные интеграторы и технологические партнеры второго уровня',
    discountPercent: 10,
    minMarginThresholdPercent: 18,
    isDefault: false,
    isActive: true
  },
  {
    id: 'tier-strategic',
    name: 'Стратегический партнер',
    description: 'Крупные производственные холдинги и дистрибьюторы с годовым объемом',
    discountPercent: 15,
    minMarginThresholdPercent: 15,
    isDefault: false,
    isActive: true
  },
  {
    id: 'tier-gov-corp',
    name: 'ГОЗ и Госкорпорации',
    description: 'Предприятия ВПК и государственные НИИ со спецприемкой',
    discountPercent: 5,
    minMarginThresholdPercent: 25,
    isDefault: false,
    isActive: true
  }
];

/**
 * Service for interacting with Firestore price lists, categories, tier rules, and price version history.
 */
export class PriceService {
  // =========================================================================
  // 1. PRICE ITEMS (Номенклатурные позиции, продукты, услуги, цены)
  // =========================================================================

  /**
   * Retrieves all price items with optional category/stock/status filters
   */
  static async getAllPriceItems(filters?: {
    category?: string;
    itemType?: string;
    inStock?: boolean;
    isActive?: boolean;
  }): Promise<PriceItem[]> {
    try {
      const colRef = collection(db, COLLECTIONS.PRICE_ITEMS);
      const constraints: QueryConstraint[] = [];

      if (filters?.category && filters.category !== 'all') {
        constraints.push(where('category', '==', filters.category));
      }
      if (filters?.itemType) {
        constraints.push(where('itemType', '==', filters.itemType));
      }
      if (filters?.inStock !== undefined) {
        constraints.push(where('inStock', '==', filters.inStock));
      }
      if (filters?.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
      }

      const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;
      const snapshot = await getDocs(q);

      const items: PriceItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          sku: data.sku || '',
          name: data.name || '',
          itemType: data.itemType || 'hardware',
          categoryId: data.categoryId,
          category: data.category || 'hardware',
          categoryLabel: data.categoryLabel || '',
          subCategory: data.subCategory,
          manufacturer: data.manufacturer || '',
          description: data.description || '',
          unit: data.unit || 'шт.',
          currency: data.currency || 'RUB',
          costPriceRub: Number(data.costPriceRub) || 0,
          priceRub: Number(data.priceRub) || 0,
          partnerPriceRub: data.partnerPriceRub !== undefined ? Number(data.partnerPriceRub) : undefined,
          priceUsd: data.priceUsd !== undefined ? Number(data.priceUsd) : undefined,
          priceEur: data.priceEur !== undefined ? Number(data.priceEur) : undefined,
          vatRate: Number(data.vatRate) || 22,
          maxDiscountPercent: Number(data.maxDiscountPercent) || 15,
          marginPercent: Number(data.marginPercent) || 0,
          markupPercent: Number(data.markupPercent) || 0,
          inStock: Boolean(data.inStock ?? true),
          leadTimeDays: Number(data.leadTimeDays) || 3,
          warrantyMonths: data.warrantyMonths !== undefined ? Number(data.warrantyMonths) : undefined,
          specifications: data.specifications || {},
          notes: data.notes || '',
          isPopular: Boolean(data.isPopular),
          isActive: Boolean(data.isActive ?? true),
          supplierName: data.supplierName || '',
          supplierContact: data.supplierContact || '',
          minOrderQty: Number(data.minOrderQty) || 1,
          tags: Array.isArray(data.tags) ? data.tags : [],
          currentVersion: Number(data.currentVersion) || 1,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
        });
      });

      return items;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.PRICE_ITEMS);
    }
  }

  /**
   * Retrieves a single price item by its document ID
   */
  static async getPriceItemById(id: string): Promise<PriceItem | null> {
    const docPath = `${COLLECTIONS.PRICE_ITEMS}/${id}`;
    try {
      const docRef = doc(db, COLLECTIONS.PRICE_ITEMS, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        sku: data.sku || '',
        name: data.name || '',
        itemType: data.itemType || 'hardware',
        categoryId: data.categoryId,
        category: data.category || 'hardware',
        categoryLabel: data.categoryLabel || '',
        subCategory: data.subCategory,
        manufacturer: data.manufacturer || '',
        description: data.description || '',
        unit: data.unit || 'шт.',
        currency: data.currency || 'RUB',
        costPriceRub: Number(data.costPriceRub) || 0,
        priceRub: Number(data.priceRub) || 0,
        partnerPriceRub: data.partnerPriceRub !== undefined ? Number(data.partnerPriceRub) : undefined,
        priceUsd: data.priceUsd !== undefined ? Number(data.priceUsd) : undefined,
        priceEur: data.priceEur !== undefined ? Number(data.priceEur) : undefined,
        vatRate: Number(data.vatRate) || 22,
        maxDiscountPercent: Number(data.maxDiscountPercent) || 15,
        marginPercent: Number(data.marginPercent) || 0,
        markupPercent: Number(data.markupPercent) || 0,
        inStock: Boolean(data.inStock ?? true),
        leadTimeDays: Number(data.leadTimeDays) || 3,
        warrantyMonths: data.warrantyMonths !== undefined ? Number(data.warrantyMonths) : undefined,
        specifications: data.specifications || {},
        notes: data.notes || '',
        isPopular: Boolean(data.isPopular),
        isActive: Boolean(data.isActive ?? true),
        supplierName: data.supplierName || '',
        supplierContact: data.supplierContact || '',
        minOrderQty: Number(data.minOrderQty) || 1,
        tags: Array.isArray(data.tags) ? data.tags : [],
        currentVersion: Number(data.currentVersion) || 1,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  }

  /**
   * Retrieves a single price item by its SKU code
   */
  static async getPriceItemBySku(sku: string): Promise<PriceItem | null> {
    try {
      const colRef = collection(db, COLLECTIONS.PRICE_ITEMS);
      const q = query(colRef, where('sku', '==', sku), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      return {
        id: docSnap.id,
        sku: data.sku || '',
        name: data.name || '',
        itemType: data.itemType || 'hardware',
        categoryId: data.categoryId,
        category: data.category || 'hardware',
        categoryLabel: data.categoryLabel || '',
        subCategory: data.subCategory,
        manufacturer: data.manufacturer || '',
        description: data.description || '',
        unit: data.unit || 'шт.',
        currency: data.currency || 'RUB',
        costPriceRub: Number(data.costPriceRub) || 0,
        priceRub: Number(data.priceRub) || 0,
        partnerPriceRub: data.partnerPriceRub !== undefined ? Number(data.partnerPriceRub) : undefined,
        priceUsd: data.priceUsd !== undefined ? Number(data.priceUsd) : undefined,
        priceEur: data.priceEur !== undefined ? Number(data.priceEur) : undefined,
        vatRate: Number(data.vatRate) || 22,
        maxDiscountPercent: Number(data.maxDiscountPercent) || 15,
        marginPercent: Number(data.marginPercent) || 0,
        markupPercent: Number(data.markupPercent) || 0,
        inStock: Boolean(data.inStock ?? true),
        leadTimeDays: Number(data.leadTimeDays) || 3,
        warrantyMonths: data.warrantyMonths !== undefined ? Number(data.warrantyMonths) : undefined,
        specifications: data.specifications || {},
        notes: data.notes || '',
        isPopular: Boolean(data.isPopular),
        isActive: Boolean(data.isActive ?? true),
        supplierName: data.supplierName || '',
        supplierContact: data.supplierContact || '',
        minOrderQty: Number(data.minOrderQty) || 1,
        tags: Array.isArray(data.tags) ? data.tags : [],
        currentVersion: Number(data.currentVersion) || 1,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.PRICE_ITEMS);
    }
  }

  /**
   * Creates a new price item and automatically logs version 1 in price history
   */
  static async createPriceItem(
    itemData: Omit<PriceItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    managerInfo?: {
      userId?: string;
      managerName?: string;
      changeReason?: string;
    }
  ): Promise<PriceItem> {
    const docId = itemData.id || `pi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const docPath = `${COLLECTIONS.PRICE_ITEMS}/${docId}`;

    try {
      const econ = calculateItemEconomics(itemData.costPriceRub, itemData.priceRub);
      const nowIso = new Date().toISOString();

      const newItem: PriceItem = {
        ...itemData,
        id: docId,
        costPriceRub: Number(itemData.costPriceRub) || 0,
        priceRub: Number(itemData.priceRub) || 0,
        partnerPriceRub: itemData.partnerPriceRub !== undefined ? Number(itemData.partnerPriceRub) : Math.round(Number(itemData.priceRub) * 0.9),
        vatRate: Number(itemData.vatRate) || 22,
        maxDiscountPercent: Number(itemData.maxDiscountPercent) || 15,
        marginPercent: econ.marginPercent,
        markupPercent: econ.markupPercent,
        currentVersion: 1,
        isActive: itemData.isActive ?? true,
        inStock: itemData.inStock ?? true,
        leadTimeDays: Number(itemData.leadTimeDays) || 3,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const docRef = doc(db, COLLECTIONS.PRICE_ITEMS, docId);
      await setDoc(docRef, {
        ...newItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Automatically register version 1 in history
      const historyId = `phist-v1-${docId}`;
      const histRef = doc(db, COLLECTIONS.PRICE_HISTORY, historyId);
      const initialHistory: PriceHistoryRecord = {
        id: historyId,
        itemId: docId,
        versionNumber: 1,
        costPriceRub: newItem.costPriceRub,
        priceRub: newItem.priceRub,
        partnerPriceRub: newItem.partnerPriceRub,
        priceUsd: newItem.priceUsd,
        vatRate: newItem.vatRate,
        marginPercent: econ.marginPercent,
        markupPercent: econ.markupPercent,
        maxDiscountPercent: newItem.maxDiscountPercent,
        validFrom: nowIso,
        validTo: null,
        changeReason: managerInfo?.changeReason || 'Первичный ввод номенклатурной позиции в каталог',
        changedByUserId: managerInfo?.userId || auth?.currentUser?.uid || 'usr-system',
        changedByManagerName: managerInfo?.managerName || auth?.currentUser?.displayName || 'Менеджер «ДС-Инжиниринг»',
        notes: 'Начальная редакция цен',
        createdAt: nowIso,
      };

      await setDoc(histRef, {
        ...initialHistory,
        createdAt: serverTimestamp(),
      });

      return newItem;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  }

  /**
   * Updates an existing price item. If costPriceRub or priceRub changes, increments version and writes history record.
   */
  static async updatePriceItem(
    id: string,
    updates: Partial<PriceItem>,
    managerInfo?: {
      userId?: string;
      managerName?: string;
      changeReason?: string;
    }
  ): Promise<PriceItem> {
    const docPath = `${COLLECTIONS.PRICE_ITEMS}/${id}`;
    try {
      const existing = await this.getPriceItemById(id);
      if (!existing) {
        throw new Error(`Номенклатурная позиция с ID ${id} не найдена в базе данных Firestore`);
      }

      const isPriceChanged =
        (updates.costPriceRub !== undefined && updates.costPriceRub !== existing.costPriceRub) ||
        (updates.priceRub !== undefined && updates.priceRub !== existing.priceRub);

      const targetCost = updates.costPriceRub !== undefined ? Number(updates.costPriceRub) : existing.costPriceRub;
      const targetSale = updates.priceRub !== undefined ? Number(updates.priceRub) : existing.priceRub;
      const econ = calculateItemEconomics(targetCost, targetSale);

      const nextVersion = isPriceChanged ? (existing.currentVersion || 1) + 1 : (existing.currentVersion || 1);
      const nowIso = new Date().toISOString();

      const updatedItem: PriceItem = {
        ...existing,
        ...updates,
        id,
        costPriceRub: targetCost,
        priceRub: targetSale,
        marginPercent: econ.marginPercent,
        markupPercent: econ.markupPercent,
        currentVersion: nextVersion,
        updatedAt: nowIso,
      };

      const docRef = doc(db, COLLECTIONS.PRICE_ITEMS, id);
      await updateDoc(docRef, {
        ...updates,
        costPriceRub: targetCost,
        priceRub: targetSale,
        marginPercent: econ.marginPercent,
        markupPercent: econ.markupPercent,
        currentVersion: nextVersion,
        updatedAt: serverTimestamp(),
      });

      // If prices changed, record new history version and close previous
      if (isPriceChanged) {
        await this.recordPriceVersion(id, {
          costPriceRub: targetCost,
          priceRub: targetSale,
          partnerPriceRub: updates.partnerPriceRub ?? existing.partnerPriceRub,
          priceUsd: updates.priceUsd ?? existing.priceUsd,
          vatRate: updates.vatRate ?? existing.vatRate,
          changeReason: managerInfo?.changeReason || 'Плановая индексация и обновление цен',
          changedByUserId: managerInfo?.userId || auth?.currentUser?.uid || 'usr-system',
          changedByManagerName: managerInfo?.managerName || auth?.currentUser?.displayName || 'Менеджер «ДС-Инжиниринг»',
          notes: `Обновление до версии v${nextVersion}`,
        });
      }

      return updatedItem;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  }

  /**
   * Deletes a price item document from Firestore
   */
  static async deletePriceItem(id: string): Promise<void> {
    const docPath = `${COLLECTIONS.PRICE_ITEMS}/${id}`;
    try {
      const docRef = doc(db, COLLECTIONS.PRICE_ITEMS, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  }

  /**
   * Subscribes to real-time updates for price items
   */
  static subscribeToPriceItems(
    callback: (items: PriceItem[]) => void,
    filters?: { category?: string }
  ): Unsubscribe {
    const colRef = collection(db, COLLECTIONS.PRICE_ITEMS);
    const constraints: QueryConstraint[] = [];

    if (filters?.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }

    const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;

    return onSnapshot(
      q,
      (snapshot) => {
        const items: PriceItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            sku: data.sku || '',
            name: data.name || '',
            itemType: data.itemType || 'hardware',
            categoryId: data.categoryId,
            category: data.category || 'hardware',
            categoryLabel: data.categoryLabel || '',
            subCategory: data.subCategory,
            manufacturer: data.manufacturer || '',
            description: data.description || '',
            unit: data.unit || 'шт.',
            currency: data.currency || 'RUB',
            costPriceRub: Number(data.costPriceRub) || 0,
            priceRub: Number(data.priceRub) || 0,
            partnerPriceRub: data.partnerPriceRub !== undefined ? Number(data.partnerPriceRub) : undefined,
            priceUsd: data.priceUsd !== undefined ? Number(data.priceUsd) : undefined,
            priceEur: data.priceEur !== undefined ? Number(data.priceEur) : undefined,
            vatRate: Number(data.vatRate) || 22,
            maxDiscountPercent: Number(data.maxDiscountPercent) || 15,
            marginPercent: Number(data.marginPercent) || 0,
            markupPercent: Number(data.markupPercent) || 0,
            inStock: Boolean(data.inStock ?? true),
            leadTimeDays: Number(data.leadTimeDays) || 3,
            warrantyMonths: data.warrantyMonths !== undefined ? Number(data.warrantyMonths) : undefined,
            specifications: data.specifications || {},
            notes: data.notes || '',
            isPopular: Boolean(data.isPopular),
            isActive: Boolean(data.isActive ?? true),
            supplierName: data.supplierName || '',
            supplierContact: data.supplierContact || '',
            minOrderQty: Number(data.minOrderQty) || 1,
            tags: Array.isArray(data.tags) ? data.tags : [],
            currentVersion: Number(data.currentVersion) || 1,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
          });
        });
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.PRICE_ITEMS);
      }
    );
  }

  /**
   * Batch upserts multiple price items using Firestore WriteBatch (supports batches up to 500 ops)
   */
  static async batchUpsertPriceItems(items: PriceItem[]): Promise<number> {
    if (!items || items.length === 0) return 0;

    try {
      const batch = writeBatch(db);
      let count = 0;

      for (const item of items) {
        const id = item.id || `pi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const docRef = doc(db, COLLECTIONS.PRICE_ITEMS, id);
        const econ = calculateItemEconomics(item.costPriceRub, item.priceRub);

        batch.set(
          docRef,
          {
            ...item,
            id,
            costPriceRub: Number(item.costPriceRub) || 0,
            priceRub: Number(item.priceRub) || 0,
            partnerPriceRub: item.partnerPriceRub !== undefined ? Number(item.partnerPriceRub) : Math.round(Number(item.priceRub) * 0.9),
            marginPercent: econ.marginPercent,
            markupPercent: econ.markupPercent,
            vatRate: Number(item.vatRate) || 22,
            maxDiscountPercent: Number(item.maxDiscountPercent) || 15,
            inStock: Boolean(item.inStock ?? true),
            isActive: Boolean(item.isActive ?? true),
            leadTimeDays: Number(item.leadTimeDays) || 3,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        count++;
      }

      await batch.commit();
      return count;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.PRICE_ITEMS);
    }
  }

  // =========================================================================
  // 2. PRICE HISTORY & VERSIONING (История версий и аудит переоценок)
  // =========================================================================

  /**
   * Retrieves all historical price versions for a specific price item, sorted descending by version number
   */
  static async getPriceHistory(itemId: string): Promise<PriceHistoryRecord[]> {
    try {
      const colRef = collection(db, COLLECTIONS.PRICE_HISTORY);
      const q = query(
        colRef,
        where('itemId', '==', itemId),
        orderBy('versionNumber', 'desc')
      );

      const snapshot = await getDocs(q);
      const history: PriceHistoryRecord[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        history.push({
          id: docSnap.id,
          itemId: data.itemId || itemId,
          versionNumber: Number(data.versionNumber) || 1,
          costPriceRub: Number(data.costPriceRub) || 0,
          priceRub: Number(data.priceRub) || 0,
          partnerPriceRub: data.partnerPriceRub !== undefined ? Number(data.partnerPriceRub) : undefined,
          priceUsd: data.priceUsd !== undefined ? Number(data.priceUsd) : undefined,
          vatRate: Number(data.vatRate) || 22,
          marginPercent: Number(data.marginPercent) || 0,
          markupPercent: Number(data.markupPercent) || 0,
          maxDiscountPercent: data.maxDiscountPercent !== undefined ? Number(data.maxDiscountPercent) : undefined,
          validFrom: data.validFrom instanceof Timestamp ? data.validFrom.toDate().toISOString() : data.validFrom || new Date().toISOString(),
          validTo: data.validTo instanceof Timestamp ? data.validTo.toDate().toISOString() : data.validTo || null,
          changeReason: data.changeReason || '',
          changedByUserId: data.changedByUserId,
          changedByManagerName: data.changedByManagerName || 'Менеджер',
          notes: data.notes || '',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        });
      });

      return history;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.PRICE_HISTORY);
    }
  }

  /**
   * Retrieves all price history records across the entire catalog (for global audit reports)
   */
  static async getAllPriceHistory(limitCount: number = 100): Promise<PriceHistoryRecord[]> {
    try {
      const colRef = collection(db, COLLECTIONS.PRICE_HISTORY);
      const q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);

      const history: PriceHistoryRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        history.push({
          id: docSnap.id,
          itemId: data.itemId || '',
          versionNumber: Number(data.versionNumber) || 1,
          costPriceRub: Number(data.costPriceRub) || 0,
          priceRub: Number(data.priceRub) || 0,
          partnerPriceRub: data.partnerPriceRub !== undefined ? Number(data.partnerPriceRub) : undefined,
          priceUsd: data.priceUsd !== undefined ? Number(data.priceUsd) : undefined,
          vatRate: Number(data.vatRate) || 22,
          marginPercent: Number(data.marginPercent) || 0,
          markupPercent: Number(data.markupPercent) || 0,
          maxDiscountPercent: data.maxDiscountPercent !== undefined ? Number(data.maxDiscountPercent) : undefined,
          validFrom: data.validFrom instanceof Timestamp ? data.validFrom.toDate().toISOString() : data.validFrom || new Date().toISOString(),
          validTo: data.validTo instanceof Timestamp ? data.validTo.toDate().toISOString() : data.validTo || null,
          changeReason: data.changeReason || '',
          changedByUserId: data.changedByUserId,
          changedByManagerName: data.changedByManagerName || 'Менеджер',
          notes: data.notes || '',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        });
      });

      return history;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.PRICE_HISTORY);
    }
  }

  /**
   * Records a new price version for an item and automatically closes the previous active version
   */
  static async recordPriceVersion(
    itemId: string,
    versionData: {
      costPriceRub: number;
      priceRub: number;
      partnerPriceRub?: number;
      priceUsd?: number;
      vatRate?: number;
      maxDiscountPercent?: number;
      changeReason: string;
      changedByUserId?: string;
      changedByManagerName: string;
      notes?: string;
    }
  ): Promise<PriceHistoryRecord> {
    const docPath = COLLECTIONS.PRICE_HISTORY;
    try {
      // Find existing history to determine the next version number
      const existingHistory = await this.getPriceHistory(itemId);
      const latestVersion = existingHistory.length > 0 ? existingHistory[0].versionNumber : 0;
      const nextVersionNumber = latestVersion + 1;

      const nowIso = new Date().toISOString();
      const econ = calculateItemEconomics(versionData.costPriceRub, versionData.priceRub);

      // Close the previous active version's validTo timestamp if open
      if (existingHistory.length > 0 && !existingHistory[0].validTo) {
        const prevDocRef = doc(db, COLLECTIONS.PRICE_HISTORY, existingHistory[0].id);
        await updateDoc(prevDocRef, {
          validTo: nowIso,
        }).catch((e) => console.warn('[PriceService] Failed to close previous version validTo:', e));
      }

      const historyId = `phist-${itemId}-v${nextVersionNumber}-${Date.now()}`;
      const newHistoryRecord: PriceHistoryRecord = {
        id: historyId,
        itemId,
        versionNumber: nextVersionNumber,
        costPriceRub: Number(versionData.costPriceRub) || 0,
        priceRub: Number(versionData.priceRub) || 0,
        partnerPriceRub: versionData.partnerPriceRub !== undefined ? Number(versionData.partnerPriceRub) : Math.round(Number(versionData.priceRub) * 0.9),
        priceUsd: versionData.priceUsd !== undefined ? Number(versionData.priceUsd) : undefined,
        vatRate: Number(versionData.vatRate) || 22,
        marginPercent: econ.marginPercent,
        markupPercent: econ.markupPercent,
        maxDiscountPercent: versionData.maxDiscountPercent !== undefined ? Number(versionData.maxDiscountPercent) : 15,
        validFrom: nowIso,
        validTo: null,
        changeReason: versionData.changeReason,
        changedByUserId: versionData.changedByUserId || auth?.currentUser?.uid || 'usr-system',
        changedByManagerName: versionData.changedByManagerName,
        notes: versionData.notes || '',
        createdAt: nowIso,
      };

      const histRef = doc(db, COLLECTIONS.PRICE_HISTORY, historyId);
      await setDoc(histRef, {
        ...newHistoryRecord,
        createdAt: serverTimestamp(),
      });

      return newHistoryRecord;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  }

  /**
   * Subscribes to real-time price history updates for a specific item
   */
  static subscribeToItemPriceHistory(
    itemId: string,
    callback: (history: PriceHistoryRecord[]) => void
  ): Unsubscribe {
    const colRef = collection(db, COLLECTIONS.PRICE_HISTORY);
    const q = query(
      colRef,
      where('itemId', '==', itemId),
      orderBy('versionNumber', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const history: PriceHistoryRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          history.push({
            id: docSnap.id,
            itemId: data.itemId || itemId,
            versionNumber: Number(data.versionNumber) || 1,
            costPriceRub: Number(data.costPriceRub) || 0,
            priceRub: Number(data.priceRub) || 0,
            partnerPriceRub: data.partnerPriceRub !== undefined ? Number(data.partnerPriceRub) : undefined,
            priceUsd: data.priceUsd !== undefined ? Number(data.priceUsd) : undefined,
            vatRate: Number(data.vatRate) || 22,
            marginPercent: Number(data.marginPercent) || 0,
            markupPercent: Number(data.markupPercent) || 0,
            maxDiscountPercent: data.maxDiscountPercent !== undefined ? Number(data.maxDiscountPercent) : undefined,
            validFrom: data.validFrom instanceof Timestamp ? data.validFrom.toDate().toISOString() : data.validFrom || new Date().toISOString(),
            validTo: data.validTo instanceof Timestamp ? data.validTo.toDate().toISOString() : data.validTo || null,
            changeReason: data.changeReason || '',
            changedByUserId: data.changedByUserId,
            changedByManagerName: data.changedByManagerName || 'Менеджер',
            notes: data.notes || '',
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          });
        });
        callback(history);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.PRICE_HISTORY);
      }
    );
  }

  // =========================================================================
  // 3. CATEGORIES & STRUCTURE (Категории, подкатегории, дерево разделов)
  // =========================================================================

  /**
   * Retrieves all categories sorted by orderIndex
   */
  static async getCategories(): Promise<PriceCategory[]> {
    try {
      const colRef = collection(db, COLLECTIONS.PRICE_CATEGORIES);
      const q = query(colRef, orderBy('orderIndex', 'asc'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Fallback to default categories if not yet seeded
        return DEFAULT_PRICE_CATEGORIES;
      }

      const categories: PriceCategory[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        categories.push({
          id: docSnap.id,
          parentId: data.parentId,
          slug: data.slug || '',
          name: data.name || '',
          description: data.description || '',
          icon: data.icon || 'Folder',
          colorTheme: data.colorTheme || 'blue',
          orderIndex: Number(data.orderIndex) || 0,
          isActive: Boolean(data.isActive ?? true),
        });
      });

      return categories;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.PRICE_CATEGORIES);
    }
  }

  /**
   * Retrieves a single category by ID
   */
  static async getCategoryById(id: string): Promise<PriceCategory | null> {
    const docPath = `${COLLECTIONS.PRICE_CATEGORIES}/${id}`;
    try {
      const docRef = doc(db, COLLECTIONS.PRICE_CATEGORIES, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return DEFAULT_PRICE_CATEGORIES.find((c) => c.id === id) || null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        parentId: data.parentId,
        slug: data.slug || '',
        name: data.name || '',
        description: data.description || '',
        icon: data.icon || 'Folder',
        colorTheme: data.colorTheme || 'blue',
        orderIndex: Number(data.orderIndex) || 0,
        isActive: Boolean(data.isActive ?? true),
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  }

  /**
   * Creates a new category
   */
  static async createCategory(
    category: Omit<PriceCategory, 'id'> & { id?: string }
  ): Promise<PriceCategory> {
    const docId = category.id || `pcat-${category.slug || Date.now()}`;
    const docPath = `${COLLECTIONS.PRICE_CATEGORIES}/${docId}`;

    try {
      const newCategory: PriceCategory = {
        ...category,
        id: docId,
        orderIndex: Number(category.orderIndex) || 0,
        isActive: category.isActive ?? true,
      };

      const docRef = doc(db, COLLECTIONS.PRICE_CATEGORIES, docId);
      await setDoc(docRef, {
        ...newCategory,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return newCategory;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  }

  /**
   * Updates an existing category
   */
  static async updateCategory(id: string, updates: Partial<PriceCategory>): Promise<PriceCategory> {
    const docPath = `${COLLECTIONS.PRICE_CATEGORIES}/${id}`;
    try {
      const existing = await this.getCategoryById(id);
      if (!existing) {
        throw new Error(`Категория с ID ${id} не найдена`);
      }

      const updatedCategory: PriceCategory = {
        ...existing,
        ...updates,
        id,
      };

      const docRef = doc(db, COLLECTIONS.PRICE_CATEGORIES, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return updatedCategory;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  }

  /**
   * Deletes a category
   */
  static async deleteCategory(id: string): Promise<void> {
    const docPath = `${COLLECTIONS.PRICE_CATEGORIES}/${id}`;
    try {
      const docRef = doc(db, COLLECTIONS.PRICE_CATEGORIES, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  }

  /**
   * Subscribes to category changes in real time
   */
  static subscribeToCategories(callback: (categories: PriceCategory[]) => void): Unsubscribe {
    const colRef = collection(db, COLLECTIONS.PRICE_CATEGORIES);
    const q = query(colRef, orderBy('orderIndex', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(DEFAULT_PRICE_CATEGORIES);
          return;
        }

        const categories: PriceCategory[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          categories.push({
            id: docSnap.id,
            parentId: data.parentId,
            slug: data.slug || '',
            name: data.name || '',
            description: data.description || '',
            icon: data.icon || 'Folder',
            colorTheme: data.colorTheme || 'blue',
            orderIndex: Number(data.orderIndex) || 0,
            isActive: Boolean(data.isActive ?? true),
          });
        });
        callback(categories);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.PRICE_CATEGORIES);
      }
    );
  }

  // =========================================================================
  // 4. PRICE TIER RULES (Тарифные сетки и клиентские скидки)
  // =========================================================================

  /**
   * Retrieves all discount tier rules
   */
  static async getTierRules(): Promise<PriceTierRule[]> {
    try {
      const colRef = collection(db, COLLECTIONS.PRICE_TIER_RULES);
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) {
        return DEFAULT_PRICE_TIER_RULES;
      }

      const rules: PriceTierRule[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        rules.push({
          id: docSnap.id,
          name: data.name || '',
          description: data.description || '',
          discountPercent: Number(data.discountPercent) || 0,
          minMarginThresholdPercent: Number(data.minMarginThresholdPercent) || 15,
          isDefault: Boolean(data.isDefault),
          isActive: Boolean(data.isActive ?? true),
        });
      });

      return rules;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.PRICE_TIER_RULES);
    }
  }

  /**
   * Creates or updates a tier rule
   */
  static async saveTierRule(
    rule: Omit<PriceTierRule, 'id'> & { id?: string }
  ): Promise<PriceTierRule> {
    const docId = rule.id || `tier-${Date.now()}`;
    const docPath = `${COLLECTIONS.PRICE_TIER_RULES}/${docId}`;

    try {
      const newRule: PriceTierRule = {
        ...rule,
        id: docId,
        discountPercent: Number(rule.discountPercent) || 0,
        minMarginThresholdPercent: Number(rule.minMarginThresholdPercent) || 15,
        isActive: rule.isActive ?? true,
      };

      const docRef = doc(db, COLLECTIONS.PRICE_TIER_RULES, docId);
      await setDoc(docRef, {
        ...newRule,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      return newRule;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  /**
   * Deletes a tier rule
   */
  static async deleteTierRule(id: string): Promise<void> {
    const docPath = `${COLLECTIONS.PRICE_TIER_RULES}/${id}`;
    try {
      const docRef = doc(db, COLLECTIONS.PRICE_TIER_RULES, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  }

  // =========================================================================
  // 5. PRICE DISCOUNT RULES (Правила скидок по категориям, продуктам и объемам)
  // =========================================================================

  /**
   * Retrieves all discount rules from Firestore
   */
  static async getDiscountRules(): Promise<PriceDiscountRule[]> {
    try {
      const colRef = collection(db, COLLECTIONS.PRICE_DISCOUNT_RULES);
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) {
        return DEFAULT_DISCOUNT_RULES;
      }

      const rules: PriceDiscountRule[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        rules.push({
          id: docSnap.id,
          name: data.name || '',
          scope: data.scope || 'global',
          targetCategoryId: data.targetCategoryId,
          targetCategoryLabel: data.targetCategoryLabel,
          targetItemId: data.targetItemId,
          targetItemName: data.targetItemName,
          discountType: data.discountType || 'percent',
          discountValue: Number(data.discountValue) || 0,
          minOrderQuantity: data.minOrderQuantity !== undefined ? Number(data.minOrderQuantity) : undefined,
          minOrderAmountRub: data.minOrderAmountRub !== undefined ? Number(data.minOrderAmountRub) : undefined,
          validFrom: data.validFrom instanceof Timestamp ? data.validFrom.toDate().toISOString() : data.validFrom,
          validTo: data.validTo instanceof Timestamp ? data.validTo.toDate().toISOString() : data.validTo || null,
          isActive: Boolean(data.isActive ?? true),
          priority: Number(data.priority) || 1,
          description: data.description || '',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        });
      });

      return rules;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.PRICE_DISCOUNT_RULES);
    }
  }

  /**
   * Creates or updates a discount rule in Firestore
   */
  static async saveDiscountRule(
    rule: Omit<PriceDiscountRule, 'id'> & { id?: string }
  ): Promise<PriceDiscountRule> {
    const docId = rule.id || `disc-rule-${Date.now()}`;
    const docPath = `${COLLECTIONS.PRICE_DISCOUNT_RULES}/${docId}`;

    try {
      const newRule: PriceDiscountRule = {
        ...rule,
        id: docId,
        discountValue: Number(rule.discountValue) || 0,
        minOrderQuantity: rule.minOrderQuantity !== undefined ? Number(rule.minOrderQuantity) : undefined,
        minOrderAmountRub: rule.minOrderAmountRub !== undefined ? Number(rule.minOrderAmountRub) : undefined,
        isActive: rule.isActive ?? true,
      };

      const docRef = doc(db, COLLECTIONS.PRICE_DISCOUNT_RULES, docId);
      await setDoc(docRef, {
        ...newRule,
        updatedAt: serverTimestamp(),
        createdAt: rule.createdAt || serverTimestamp(),
      }, { merge: true });

      return newRule;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  /**
   * Deletes a discount rule
   */
  static async deleteDiscountRule(id: string): Promise<void> {
    const docPath = `${COLLECTIONS.PRICE_DISCOUNT_RULES}/${id}`;
    try {
      const docRef = doc(db, COLLECTIONS.PRICE_DISCOUNT_RULES, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  }

  /**
   * Real-time subscription to discount rules
   */
  static subscribeToDiscountRules(callback: (rules: PriceDiscountRule[]) => void): Unsubscribe {
    const colRef = collection(db, COLLECTIONS.PRICE_DISCOUNT_RULES);

    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          callback(DEFAULT_DISCOUNT_RULES);
          return;
        }

        const rules: PriceDiscountRule[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          rules.push({
            id: docSnap.id,
            name: data.name || '',
            scope: data.scope || 'global',
            targetCategoryId: data.targetCategoryId,
            targetCategoryLabel: data.targetCategoryLabel,
            targetItemId: data.targetItemId,
            targetItemName: data.targetItemName,
            discountType: data.discountType || 'percent',
            discountValue: Number(data.discountValue) || 0,
            minOrderQuantity: data.minOrderQuantity !== undefined ? Number(data.minOrderQuantity) : undefined,
            minOrderAmountRub: data.minOrderAmountRub !== undefined ? Number(data.minOrderAmountRub) : undefined,
            validFrom: data.validFrom instanceof Timestamp ? data.validFrom.toDate().toISOString() : data.validFrom,
            validTo: data.validTo instanceof Timestamp ? data.validTo.toDate().toISOString() : data.validTo || null,
            isActive: Boolean(data.isActive ?? true),
            priority: Number(data.priority) || 1,
            description: data.description || '',
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          });
        });

        callback(rules);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.PRICE_DISCOUNT_RULES);
      }
    );
  }

  // =========================================================================
  // 6. INITIAL DATA SEEDING UTILITY (Начальная инициализация Firestore)
  // =========================================================================

  /**
   * Seeds initial price items, categories, discount rules, and tier rules to Firestore if collections are empty.
   */
  static async seedInitialData(force: boolean = false): Promise<{
    itemsSeeded: number;
    categoriesSeeded: number;
    tierRulesSeeded: number;
    discountRulesSeeded: number;
  }> {
    let itemsSeeded = 0;
    let categoriesSeeded = 0;
    let tierRulesSeeded = 0;
    let discountRulesSeeded = 0;

    try {
      // 1. Categories Seeding
      const catCol = collection(db, COLLECTIONS.PRICE_CATEGORIES);
      const catSnap = await getDocs(catCol);
      if (force || catSnap.empty) {
        const catBatch = writeBatch(db);
        for (const cat of DEFAULT_PRICE_CATEGORIES) {
          const cRef = doc(db, COLLECTIONS.PRICE_CATEGORIES, cat.id);
          catBatch.set(cRef, {
            ...cat,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          categoriesSeeded++;
        }
        await catBatch.commit();
      }

      // 2. Discount Rules Seeding
      const discCol = collection(db, COLLECTIONS.PRICE_DISCOUNT_RULES);
      const discSnap = await getDocs(discCol);
      if (force || discSnap.empty) {
        const discBatch = writeBatch(db);
        for (const rule of DEFAULT_DISCOUNT_RULES) {
          const dRef = doc(db, COLLECTIONS.PRICE_DISCOUNT_RULES, rule.id);
          discBatch.set(dRef, {
            ...rule,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          discountRulesSeeded++;
        }
        await discBatch.commit();
      }

      // 3. Tier Rules Seeding
      const tierCol = collection(db, COLLECTIONS.PRICE_TIER_RULES);
      const tierSnap = await getDocs(tierCol);
      if (force || tierSnap.empty) {
        const tierBatch = writeBatch(db);
        for (const tier of DEFAULT_PRICE_TIER_RULES) {
          const tRef = doc(db, COLLECTIONS.PRICE_TIER_RULES, tier.id);
          tierBatch.set(tRef, {
            ...tier,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          tierRulesSeeded++;
        }
        await tierBatch.commit();
      }

      // 4. Price Items Seeding
      const itemCol = collection(db, COLLECTIONS.PRICE_ITEMS);
      const itemSnap = await getDocs(itemCol);
      if (force || itemSnap.empty) {
        const itemBatch = writeBatch(db);
        const nowIso = new Date().toISOString();

        for (const item of INDUSTRIAL_PRICE_LIST) {
          const iRef = doc(db, COLLECTIONS.PRICE_ITEMS, item.id);
          const econ = calculateItemEconomics(item.costPriceRub, item.priceRub);

          itemBatch.set(iRef, {
            ...item,
            marginPercent: econ.marginPercent,
            markupPercent: econ.markupPercent,
            currentVersion: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          // Seed version 1 history
          const hRef = doc(db, COLLECTIONS.PRICE_HISTORY, `phist-init-${item.id}`);
          itemBatch.set(hRef, {
            id: `phist-init-${item.id}`,
            itemId: item.id,
            versionNumber: 1,
            costPriceRub: item.costPriceRub,
            priceRub: item.priceRub,
            partnerPriceRub: item.partnerPriceRub || Math.round(item.priceRub * 0.9),
            priceUsd: item.priceUsd || null,
            vatRate: item.vatRate || 22,
            marginPercent: econ.marginPercent,
            markupPercent: econ.markupPercent,
            maxDiscountPercent: item.maxDiscountPercent || 15,
            validFrom: nowIso,
            validTo: null,
            changeReason: 'Базовый прейскурант «ДС-Инжиниринг» на 2026 год',
            changedByUserId: 'usr-system',
            changedByManagerName: 'Некрасов С.Ю. (Генеральный директор)',
            notes: 'Начальная фиксация цен при запуске портала',
            createdAt: serverTimestamp(),
          });

          itemsSeeded++;
        }
        await itemBatch.commit();
      }

      return { itemsSeeded, categoriesSeeded, tierRulesSeeded, discountRulesSeeded };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seedInitialData');
    }
  }
}

export default PriceService;
