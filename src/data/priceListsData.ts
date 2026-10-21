export interface PriceCategory {
  id: string;
  parentId?: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  colorTheme?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface PriceHistoryRecord {
  id: string;
  itemId: string;
  versionNumber: number;
  costPriceRub: number;
  priceRub: number;
  partnerPriceRub?: number;
  priceUsd?: number;
  vatRate: number;
  marginPercent?: number;
  markupPercent?: number;
  maxDiscountPercent?: number;
  validFrom: string;
  validTo?: string | null;
  changeReason: string;
  changedByUserId?: string;
  changedByManagerName: string;
  notes?: string;
  createdAt: string;
}

export interface PriceTierRule {
  id: string;
  name: string;
  description?: string;
  discountPercent: number;
  minMarginThresholdPercent: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface PriceDiscountRule {
  id: string;
  name: string;
  scope: 'global' | 'category' | 'product';
  targetCategoryId?: string; // 'software' | 'hardware' | 'services' | 'accessories' | 'non_core_services'
  targetCategoryLabel?: string;
  targetItemId?: string;     // Specific PriceItem id or SKU
  targetItemName?: string;
  discountType: 'percent' | 'fixed_rub'; // Процентная (%) или фиксированная скидка (руб.)
  discountValue: number;    // Например, 10 (%) или 150 000 (руб)
  minOrderQuantity?: number; // Минимальное количество позиций (шт)
  minOrderAmountRub?: number; // Минимальная сумма заказа (руб)
  validFrom?: string;
  validTo?: string | null;
  isActive: boolean;
  priority?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_DISCOUNT_RULES: PriceDiscountRule[] = [
  {
    id: 'disc-rule-software-pkg',
    name: 'Спецпредложение на пакетное ПО (Geomagic / PolyWorks)',
    scope: 'category',
    targetCategoryId: 'software',
    targetCategoryLabel: 'Программное обеспечение',
    discountType: 'percent',
    discountValue: 10,
    minOrderQuantity: 1,
    minOrderAmountRub: 1000000,
    isActive: true,
    description: '10% скидка на лицензии ПО при заказе от 1 млн руб.'
  },
  {
    id: 'disc-rule-laser-tracker',
    name: 'Скидка на лазерные трекеры Leica AT960',
    scope: 'product',
    targetItemId: 'pi-hw-leica-at960',
    targetItemName: 'Лазерный трекер Leica Absolute Tracker AT960-SR',
    discountType: 'fixed_rub',
    discountValue: 500000,
    minOrderQuantity: 1,
    isActive: true,
    description: 'Фиксированная скидка 500 000 руб. на лазерный трекер Leica'
  },
  {
    id: 'disc-rule-scanline-bundle',
    name: 'Акция на инженерный комплект ScanLine EasyScan Combo + EXModel Pro',
    scope: 'product',
    targetItemId: 'pi-hw-sl-combo-bundle',
    targetItemName: 'Инженерный комплект ScanLine EasyScan Combo + EXModel Pro Bundle',
    discountType: 'fixed_rub',
    discountValue: 250000,
    minOrderQuantity: 1,
    isActive: true,
    description: 'Специальная скидка 250 000 руб. при покупке комплекта 3D-сканера с ПО EXModel Pro'
  },
  {
    id: 'disc-rule-accessories-bulk',
    name: 'Оптовая скидка на щупы и удлинители Renishaw',
    scope: 'category',
    targetCategoryId: 'accessories',
    targetCategoryLabel: 'Оснастка и щупы',
    discountType: 'percent',
    discountValue: 15,
    minOrderQuantity: 3,
    isActive: true,
    description: '15% скидка при заказе от 3 комплектов оснастки'
  },
  {
    id: 'disc-rule-services-volume',
    name: 'Скидка на комплексный 3D-контроль и сканирование',
    scope: 'category',
    targetCategoryId: 'services',
    targetCategoryLabel: 'Инжиниринговые услуги',
    discountType: 'fixed_rub',
    discountValue: 35000,
    minOrderAmountRub: 200000,
    isActive: true,
    description: 'Фиксированная скидка 35 000 руб. при объеме услуг от 200 тыс. руб.'
  }
];

export interface PriceDiscountConfig {
  type: 'percent' | 'fixed_rub';
  value: number;
  description?: string;
  minQuantity?: number;
  minOrderAmountRub?: number;
}

export interface PriceItem {
  id: string;
  sku: string;
  name: string;
  model?: string;
  itemType?: 'product' | 'software_license' | 'engineering_service' | 'accessory' | 'non_core_service';
  categoryId?: string;
  category: 'software' | 'hardware' | 'services' | 'accessories' | 'non_core_services';
  categoryLabel: string;
  subCategory?: string;
  manufacturer: string;
  description: string;
  unit: string;
  currency?: string;
  costPriceRub: number; // Закупочная стоимость / себестоимость (руб)
  priceRub: number; // Базовая цена продажи без НДС (руб)
  partnerPriceRub?: number; // Партнерская цена
  priceUsd?: number;
  priceEur?: number;
  vatRate: number; // Базовая ставка НДС 22%
  maxDiscountPercent: number; // Максимально допустимая скидка менеджера (%)
  discount?: number | PriceDiscountConfig; // Прямая скидка на позицию (% или фикс ₽)
  marginPercent?: number; // Авторасчет маржинальности (%)
  markupPercent?: number; // Авторасчет наценки (%)
  inStock: boolean;
  leadTimeDays: number;
  warrantyMonths?: number;
  specifications?: Record<string, string>;
  notes?: string;
  isPopular?: boolean;
  isActive?: boolean;
  supplierName?: string;
  supplierContact?: string;
  minOrderQty?: number;
  tags?: string[];
  currentVersion?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Calculates Unit Economics metrics (Margin %, Markup %, Profit)
 */
export function calculateItemEconomics(costPrice: number, salePrice: number) {
  const safeCost = Math.max(0, costPrice || 0);
  const safeSale = Math.max(0, salePrice || 0);
  const profit = safeSale - safeCost;
  const marginPercent = safeSale > 0 ? Math.round((profit / safeSale) * 1000) / 10 : 0;
  const markupPercent = safeCost > 0 ? Math.round((profit / safeCost) * 1000) / 10 : 0;

  return {
    profit,
    marginPercent,
    markupPercent
  };
}

/**
 * Calculates effective discount for an item based on configured discount rules
 */
export function calculateDiscountForItem(
  item: PriceItem,
  rules: PriceDiscountRule[] = [],
  quantity: number = 1
): {
  discountPercent: number;
  discountAmountRub: number;
  finalPriceRub: number;
  appliedRule?: PriceDiscountRule;
  source: 'rule' | 'item_direct' | 'none';
} {
  const basePrice = item.priceRub || 0;
  if (basePrice <= 0) {
    return { discountPercent: 0, discountAmountRub: 0, finalPriceRub: basePrice, source: 'none' };
  }

  // 1. Check if item has a direct discount configured on the item itself
  let directDiscountPercent = 0;
  let directDiscountAmountRub = 0;
  const maxAllowedPercent = item.maxDiscountPercent || 30;

  if (item.discount !== undefined && item.discount !== null) {
    if (typeof item.discount === 'number') {
      directDiscountPercent = Math.min(Math.max(0, item.discount), maxAllowedPercent);
      directDiscountAmountRub = Math.round(basePrice * (directDiscountPercent / 100));
    } else if (typeof item.discount === 'object') {
      if (item.discount.type === 'percent') {
        directDiscountPercent = Math.min(Math.max(0, item.discount.value || 0), maxAllowedPercent);
        directDiscountAmountRub = Math.round(basePrice * (directDiscountPercent / 100));
      } else if (item.discount.type === 'fixed_rub') {
        const maxRubDiscount = Math.round(basePrice * (maxAllowedPercent / 100));
        directDiscountAmountRub = Math.min(Math.max(0, item.discount.value || 0), maxRubDiscount);
        directDiscountPercent = basePrice > 0 ? Math.round((directDiscountAmountRub / basePrice) * 1000) / 10 : 0;
      }
    }
  }

  // 2. Check rules from discount registry
  const matchingRules = (rules || []).filter((r) => {
    if (!r.isActive) return false;
    if (r.minOrderQuantity && quantity < r.minOrderQuantity) return false;
    if (r.minOrderAmountRub && basePrice * quantity < r.minOrderAmountRub) return false;

    if (r.scope === 'product' && (r.targetItemId === item.id || r.targetItemId === item.sku)) {
      return true;
    }
    if (r.scope === 'category' && r.targetCategoryId === item.category) {
      return true;
    }
    if (r.scope === 'global') {
      return true;
    }
    return false;
  });

  if (matchingRules.length === 0) {
    if (directDiscountAmountRub > 0) {
      return {
        discountPercent: directDiscountPercent,
        discountAmountRub: directDiscountAmountRub,
        finalPriceRub: Math.max(0, basePrice - directDiscountAmountRub),
        source: 'item_direct'
      };
    }
    return { discountPercent: 0, discountAmountRub: 0, finalPriceRub: basePrice, source: 'none' };
  }

  // Priority: product > category > global, then largest discount
  matchingRules.sort((a, b) => {
    const scopeWeight: Record<string, number> = { product: 3, category: 2, global: 1 };
    const wA = scopeWeight[a.scope] || 0;
    const wB = scopeWeight[b.scope] || 0;
    if (wA !== wB) return wB - wA;
    return (b.priority || 0) - (a.priority || 0);
  });

  const bestRule = matchingRules[0];
  let ruleDiscountAmountRub = 0;
  let ruleDiscountPercent = 0;

  if (bestRule.discountType === 'percent') {
    ruleDiscountPercent = Math.min(bestRule.discountValue, maxAllowedPercent);
    ruleDiscountAmountRub = Math.round(basePrice * (ruleDiscountPercent / 100));
  } else {
    // Fixed amount discount in rubles
    const maxRubDiscount = Math.round(basePrice * (maxAllowedPercent / 100));
    ruleDiscountAmountRub = Math.min(bestRule.discountValue, maxRubDiscount);
    ruleDiscountPercent = basePrice > 0 ? Math.round((ruleDiscountAmountRub / basePrice) * 1000) / 10 : 0;
  }

  // If direct discount is higher than rule discount, prioritize direct, otherwise rule
  if (directDiscountAmountRub > ruleDiscountAmountRub) {
    return {
      discountPercent: directDiscountPercent,
      discountAmountRub: directDiscountAmountRub,
      finalPriceRub: Math.max(0, basePrice - directDiscountAmountRub),
      source: 'item_direct'
    };
  }

  const finalPriceRub = Math.max(0, basePrice - ruleDiscountAmountRub);

  return {
    discountPercent: ruleDiscountPercent,
    discountAmountRub: ruleDiscountAmountRub,
    finalPriceRub,
    appliedRule: bestRule,
    source: 'rule'
  };
}

export const INDUSTRIAL_PRICE_LIST: PriceItem[] = [
  {
    "id": "pi-hw-pmt-future-cmm",
    "sku": "PMT-FUTURE-CMM",
    "name": "Прецизионная мостовая КИМ PMT FUTURE и FUTURE PLUS",
    "category": "hardware",
    "categoryLabel": "Стационарные и цеховые КИМ PMT",
    "subCategory": "Стационарные и цеховые КИМ PMT",
    "manufacturer": "PMT (Китай)",
    "unit": "компл.",
    "costPriceRub": 4200000,
    "priceRub": 5850000,
    "partnerPriceRub": 5265000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 45,
    "warrantyMonths": 24,
    "description": "Прецизионная мостовая КИМ лабораторного класса с замкнутым гранитным порталом, 16 датчиками термокомпенсации и погрешностью от 0.9 + L/450 мкм.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "Стационарные"
    ]
  },
  {
    "id": "pi-hw-pmt-prime-cmm",
    "sku": "PMT-PRIME-CMM",
    "name": "Цеховая координатно-измерительная машина PMT PRIME",
    "category": "hardware",
    "categoryLabel": "Стационарные и цеховые КИМ PMT",
    "subCategory": "Стационарные и цеховые КИМ PMT",
    "manufacturer": "PMT (Китай)",
    "unit": "компл.",
    "costPriceRub": 4200000,
    "priceRub": 5850000,
    "partnerPriceRub": 5265000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 45,
    "warrantyMonths": 24,
    "description": "Высокопроизводительная цеховая мостовая КИМ для работы в условиях реального производства, участков ЧПУ и тактового контроля серийных деталей.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "Стационарные"
    ]
  },
  {
    "id": "pi-hw-pmt-loong-cmm",
    "sku": "PMT-LOONG-CMM",
    "name": "Крупногабаритная портальная КИМ PMT LOONG",
    "category": "hardware",
    "categoryLabel": "Стационарные и цеховые КИМ PMT",
    "subCategory": "Стационарные и цеховые КИМ PMT",
    "manufacturer": "PMT (Китай)",
    "unit": "компл.",
    "costPriceRub": 4200000,
    "priceRub": 5850000,
    "partnerPriceRub": 5265000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 45,
    "warrantyMonths": 24,
    "description": "Портальная КИМ повышенной грузоподъемности с рабочим объемом до 10 метров для крупногабаритных корпусов турбин, рам, штампов и авиадеталей.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "Стационарные"
    ]
  },
  {
    "id": "pi-hw-pmt-alpha-p",
    "sku": "PMT-ALPHA-P",
    "name": "Мобильная КИМ PMT ALPHA ARM серия P (Прецизионная)",
    "category": "hardware",
    "categoryLabel": "Мобильные КИМ PMT Alpha Arm",
    "subCategory": "Мобильные КИМ PMT Alpha Arm",
    "manufacturer": "PMT (Китай)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Прецизионная мобильная КИМ высшего класса точности для метрологических лабораторий и высокоточного межоперационного контроля.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "Мобильные"
    ]
  },
  {
    "id": "pi-hw-pmt-alpha-m",
    "sku": "PMT-ALPHA-M",
    "name": "Мобильная КИМ PMT ALPHA ARM серия M (Многоцелевая)",
    "category": "hardware",
    "categoryLabel": "Мобильные КИМ PMT Alpha Arm",
    "subCategory": "Мобильные КИМ PMT Alpha Arm",
    "manufacturer": "PMT (Китай)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Универсальная портативная координатно-измерительная машина с оптимальным балансом точности и жесткости для цехового контроля деталей и оснастки.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "Мобильные"
    ]
  },
  {
    "id": "pi-hw-pmt-alpha-e",
    "sku": "PMT-ALPHA-E",
    "name": "Мобильная КИМ PMT ALPHA ARM серия E (Экономичная)",
    "category": "hardware",
    "categoryLabel": "Мобильные КИМ PMT Alpha Arm",
    "subCategory": "Мобильные КИМ PMT Alpha Arm",
    "manufacturer": "PMT (Китай)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Доступная и надежная мобильная КИМ для малых и средних производств, механообработки, контроля штамповок и сварных узлов.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "Мобильные"
    ]
  },
  {
    "id": "pi-hw-pmt-alpha-edu",
    "sku": "PMT-ALPHA-EDU",
    "name": "Мобильная КИМ PMT ALPHA ARM серия EDU (Образовательная)",
    "category": "hardware",
    "categoryLabel": "Мобильные КИМ PMT Alpha Arm",
    "subCategory": "Мобильные КИМ PMT Alpha Arm",
    "manufacturer": "PMT (Китай)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Специализированный учебно-метрологический комплекс для высших учебных заведений, колледжей и технических центров.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "Мобильные"
    ]
  },
  {
    "id": "pi-hw-pmt-gamma-plus-p",
    "sku": "PMT-GMP-P",
    "name": "Мобильная КИМ PMT Gamma+ серия P (Прецизионная)",
    "category": "hardware",
    "categoryLabel": "Мобильные КИМ PMT Gamma+",
    "subCategory": "Мобильные КИМ PMT Gamma+",
    "manufacturer": "PMT (Китай)",
    "unit": "компл.",
    "costPriceRub": 2900000,
    "priceRub": 3980000,
    "partnerPriceRub": 3582000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Флагманская портативная КИМ нового поколения Gamma+ с инновационной кинематикой шарниров и наивысшей точностью в линейке.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "Мобильные"
    ]
  },
  {
    "id": "pi-hw-pmt-gamma-plus-m",
    "sku": "PMT-GMP-M",
    "name": "Мобильная КИМ PMT Gamma+ серия M (Многоцелевая)",
    "category": "hardware",
    "categoryLabel": "Мобильные КИМ PMT Gamma+",
    "subCategory": "Мобильные КИМ PMT Gamma+",
    "manufacturer": "PMT (Китай)",
    "unit": "компл.",
    "costPriceRub": 2500000,
    "priceRub": 3450000,
    "partnerPriceRub": 3105000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Универсальная мобильная КИМ PMT Gamma+ для оперативного межоперационного контроля в цехе, контроля оснастки и сварки.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "Мобильные"
    ]
  },
  {
    "id": "pi-hw-pmt-gamma-plus-e",
    "sku": "PMT-GMP-E",
    "name": "Мобильная КИМ PMT Gamma+ серия E (Экономичная)",
    "category": "hardware",
    "categoryLabel": "Мобильные КИМ PMT Gamma+",
    "subCategory": "Мобильные КИМ PMT Gamma+",
    "manufacturer": "PMT (Китай)",
    "unit": "компл.",
    "costPriceRub": 2100000,
    "priceRub": 2890000,
    "partnerPriceRub": 2601000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Надежная и экономичная портативная координатно-измерительная машина серии Gamma+ для входного контроля и цеховых измерений.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "Мобильные"
    ]
  },
  {
    "id": "pi-hw-hexagon-absolute-arm-7axis",
    "sku": "HEX-ARM-7AXIS",
    "name": "Мобильная КИМ Hexagon Absolute Arm 7-Axis",
    "category": "hardware",
    "categoryLabel": "Мобильные КИМ Hexagon Absolute Arm",
    "subCategory": "Мобильные КИМ Hexagon Absolute Arm",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Флагманская 7-осевая мобильная КИМ с абсолютными энкодерами Zero-G для контактных измерений и высокоскоростного лазерного 3D-сканирования.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "Мобильные"
    ]
  },
  {
    "id": "pi-hw-hexagon-absolute-arm-6axis",
    "sku": "HEX-ARM-6AXIS",
    "name": "Мобильная КИМ Hexagon Absolute Arm 6-Axis",
    "category": "hardware",
    "categoryLabel": "Мобильные КИМ Hexagon Absolute Arm",
    "subCategory": "Мобильные КИМ Hexagon Absolute Arm",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Прецизионная 6-осевая мобильная КИМ для бескомпромиссных по точности контактных измерений деталей щупами Renishaw.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "Мобильные"
    ]
  },
  {
    "id": "pi-hw-hexagon-absolute-arm-compact",
    "sku": "HEX-ARM-COMPACT",
    "name": "Портативная КИМ Hexagon Absolute Arm Compact",
    "category": "hardware",
    "categoryLabel": "Мобильные КИМ Hexagon Absolute Arm",
    "subCategory": "Мобильные КИМ Hexagon Absolute Arm",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Сверхкомпактная портативная координатно-измерительная машина со встроенным гранитным основанием для контроля деталей прямо на столе станка или в лаборатории.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "Мобильные"
    ]
  },
  {
    "id": "pi-hw-pmt-scanner-gh",
    "sku": "PMT-SCANNER-GH",
    "name": "Прецизионный лазерный 3D-сканер PMT GH (синий лазер) для PMT GAMMA+",
    "category": "hardware",
    "categoryLabel": "3D-сканеры для PMT GAMMA+ / Alpha",
    "subCategory": "3D-сканеры для PMT GAMMA+ / Alpha",
    "manufacturer": "PMT (Precision Measuring Tool)",
    "unit": "шт.",
    "costPriceRub": 1450000,
    "priceRub": 2050000,
    "partnerPriceRub": 1845000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Высокоточный лазерный 3D-сканер синего лазера высокой четкости (HD) для 7-осевых мобильных КИМ PMT GAMMA+ и ALPHA ARM. Скорость до 1 200 000 точек/сек.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-pmt-scanner-gs",
    "sku": "PMT-SCANNER-GS",
    "name": "Широкополосный лазерный 3D-сканер PMT GS для PMT GAMMA+",
    "category": "hardware",
    "categoryLabel": "3D-сканеры для PMT GAMMA+ / Alpha",
    "subCategory": "3D-сканеры для PMT GAMMA+ / Alpha",
    "manufacturer": "PMT (Precision Measuring Tool)",
    "unit": "шт.",
    "costPriceRub": 1450000,
    "priceRub": 2050000,
    "partnerPriceRub": 1845000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Высокопроизводительный широкополосный лазерный 3D-сканер (Standard/Wide) для оперативной оцифровки крупногабаритных деталей на мобильных КИМ PMT GAMMA+.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-hexagon-scanner-as1",
    "sku": "HEX-SCN-AS1",
    "name": "Лазерный 3D сканер Hexagon Absolute Scanner AS1",
    "category": "hardware",
    "categoryLabel": "3D-сканеры для Hexagon Absolute Arm",
    "subCategory": "3D-сканеры для Hexagon Absolute Arm",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "шт.",
    "costPriceRub": 3900000,
    "priceRub": 5400000,
    "partnerPriceRub": 4860000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 21,
    "warrantyMonths": 24,
    "description": "Флагманский модульный 3D-лазерный сканер с технологией SHINE (заменил модель RS6). Работает на мобильной КИМ Absolute Arm 7-Axis и автономно с трекером Leica AT960 в радиусе 30 м.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-hexagon-scanner-as1-xl",
    "sku": "HEX-SCN-AS1-XL",
    "name": "Сверхширокополосный лазерный 3D сканер Hexagon AS1 XL",
    "category": "hardware",
    "categoryLabel": "3D-сканеры для Hexagon Absolute Arm",
    "subCategory": "3D-сканеры для Hexagon Absolute Arm",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "шт.",
    "costPriceRub": 3900000,
    "priceRub": 5400000,
    "partnerPriceRub": 4860000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 21,
    "warrantyMonths": 24,
    "description": "Инновационный сверхширокополосный лазерный 3D-сканер с шириной лазерной линии до 600 мм для крупногабаритных деталей (авиация, судостроение, лопасти).",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-hexagon-scanner-rs6",
    "sku": "HEX-SCN-RS6",
    "name": "Лазерный 3D сканер Hexagon RS6",
    "category": "hardware",
    "categoryLabel": "3D-сканеры для Hexagon Absolute Arm",
    "subCategory": "3D-сканеры для Hexagon Absolute Arm",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "шт.",
    "costPriceRub": 3900000,
    "priceRub": 5400000,
    "partnerPriceRub": 4860000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 21,
    "warrantyMonths": 24,
    "description": "Высокопроизводительный лазерный 3D-сканер синего лазера с технологией SHINE для мобильных КИМ Hexagon Absolute Arm 7-Axis.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-hexagon-scanner-rs5",
    "sku": "HEX-SCN-RS5",
    "name": "Лазерный 3D сканер Hexagon RS5",
    "category": "hardware",
    "categoryLabel": "3D-сканеры для Hexagon Absolute Arm",
    "subCategory": "3D-сканеры для Hexagon Absolute Arm",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "шт.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Надежный лазерный 3D-сканер с широкой лазерной полосой 115 мм для задач общего машиностроения на мобильных КИМах Absolute Arm.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-hexagon-scanner-hp-l-20-8",
    "sku": "HEX-SCN-HP-L-20-8",
    "name": "Лазерный 3D сканер Hexagon HP-L-20.8",
    "category": "hardware",
    "categoryLabel": "3D-сканеры для Hexagon Absolute Arm",
    "subCategory": "3D-сканеры для Hexagon Absolute Arm",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "шт.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Высокоточный оптический лазерный сканирующий сенсор с автоподстройкой мощности луча для контроля сложных криволинейных поверхностей.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-hexagon-scanner-llp",
    "sku": "HEX-SCN-LLP",
    "name": "Лазерный 3D-сканер Laser Line Probe (LLP)",
    "category": "hardware",
    "categoryLabel": "3D-сканеры для Hexagon Absolute Arm",
    "subCategory": "3D-сканеры для Hexagon Absolute Arm",
    "manufacturer": "HEXAGON / Партнеры",
    "unit": "шт.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Компактный лазерный датчик сечений для портативных КИМ, предназначенный для быстрой оцифровки кромок, отверстий и плоских профилей.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-hexagon-scanner-hp-l-8-9",
    "sku": "HEX-SCN-HP-L-8-9",
    "name": "Лазерный 3D сканер Hexagon HP-L-8.9",
    "category": "hardware",
    "categoryLabel": "3D-сканеры для Hexagon Absolute Arm",
    "subCategory": "3D-сканеры для Hexagon Absolute Arm",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "шт.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Доступный и компактный синий лазерный 3D-сканер начального уровня для мобильных КИМ Absolute Arm 7-Axis.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-hexagon-scanner-rs-squared",
    "sku": "HEX-SCN-RS-SQUARED",
    "name": "Оптический сканер большой площади Hexagon RS-SQUARED Area Scanner",
    "category": "hardware",
    "categoryLabel": "3D-сканеры для Hexagon Absolute Arm",
    "subCategory": "3D-сканеры для Hexagon Absolute Arm",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "шт.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Первый в мире площадной оптический сканер (Area Scanner) для мобильных КИМ Absolute Arm: оцифровка деталей квадратными кадрами без маркеров.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-hexagon-scanner-rs4",
    "sku": "HEX-SCN-RS4",
    "name": "Встроенный лазерный 3D сканер Hexagon RS4",
    "category": "hardware",
    "categoryLabel": "3D-сканеры для Hexagon Absolute Arm",
    "subCategory": "3D-сканеры для Hexagon Absolute Arm",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "шт.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Полностью встроенный в запястье мобильной КИМ лазерный сканер для моделей Absolute Arm 73/75/77-SI без внешних кабелей.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-einstar",
    "sku": "SHN-EINSTAR",
    "name": "3D сканер Shining 3D Einstar",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 320000,
    "priceRub": 490000,
    "partnerPriceRub": 441000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 24,
    "description": "Доступный ручной 3D-сканер с инфракрасным VCSEL проектором и цветной RGB-камерой для 3D-печати, оцифровки людей и арт-объектов.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-einstar-2",
    "sku": "SHN-EINSTAR-2",
    "name": "3D сканер Shining 3D Einstar 2",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 320000,
    "priceRub": 490000,
    "partnerPriceRub": 441000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 24,
    "description": "Обновленный портативный 3D-сканер 2-го поколения с улучшенной оптической системой, повышенной детализацией и скоростью сканирования.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-einstar-vega",
    "sku": "SHN-EINSTAR-VEGA",
    "name": "3D сканер Shining 3D Einstar VEGA",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 320000,
    "priceRub": 490000,
    "partnerPriceRub": 441000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 24,
    "description": "Революционный полностью беспроводной автономный 3D-сканер со встроенным сенсорным экраном, процессором и аккумулятором. Сканирование без проводов и ПК.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-einstar-rockit",
    "sku": "SHN-EINSTAR-ROCKIT",
    "name": "3D сканер Shining 3D Einstar Rockit",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 320000,
    "priceRub": 490000,
    "partnerPriceRub": 441000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 24,
    "description": "Усиленный ручной 3D-сканер повышенной производительности для быстрого сканирования объектов сложной формы в производственных и студийных условиях.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-einscan-se-v2",
    "sku": "SHN-EINSCAN-SE-V2",
    "name": "3D сканер Shining 3D EinScan SE V2",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 320000,
    "priceRub": 490000,
    "partnerPriceRub": 441000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 24,
    "description": "Настольный 3D-сканер с поворотным столом белого структурированного света для быстрого сканирования мелких и средних деталей (до 0.1 мм).",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-einscan-sp-v2",
    "sku": "SHN-EINSCAN-SP-V2",
    "name": "3D сканер Shining 3D EinScan SP V2",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Профессиональный настольный 3D-сканер повышенной точности (до 0.05 мм) с оптическими маркерами на поворотном столе для инженерии и реверса.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-medixa",
    "sku": "SHN-MEDIXA",
    "name": "3D сканер Shining 3D Medixa",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Специализированный оптический 3D-сканер для медицины, ортопедии, протезирования, пластической хирургии и бесконтактной оцифровки тела.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-rigil-pro",
    "sku": "SHN-RG-PRO",
    "name": "3D сканер Shining 3D EinScan Rigil Pro",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 1100000,
    "priceRub": 1550000,
    "partnerPriceRub": 1395000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Флагманский гибридный 3D-сканер профессиональной линейки Rigil: синие лазерные линии + широкопольный инфракрасный VCSEL для реверса и контроля.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-rigil",
    "sku": "SHN-RIGIL",
    "name": "3D сканер Shining 3D EinScan Rigil",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 1100000,
    "priceRub": 1550000,
    "partnerPriceRub": 1395000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Универсальный ручной 3D-сканер серии Rigil для конструкторских бюро, тюнинг-ателье, литейных и механических производств.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-rigil-accessories-pro-kit",
    "sku": "SHN-RG-ACCESSORIES-PRO-KIT",
    "name": "3D сканер Shining 3D EinScan Rigil + Accessories Pro Kit",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 1100000,
    "priceRub": 1550000,
    "partnerPriceRub": 1395000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Комплект 3D-сканера EinScan Rigil с полным набором профессиональных аксессуаров: штатив, поворотный стол, выносные аккумуляторы и магнитные маркеры.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-rigil-lite",
    "sku": "SHN-RG-LITE",
    "name": "3D сканер Shining 3D EinScan Rigil Lite",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 1100000,
    "priceRub": 1550000,
    "partnerPriceRub": 1395000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Экономичная и легкая версия сканера Rigil для базовых задач обратного инжиниринга, макетирования и ремесленного производства.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-hx2",
    "sku": "SCN-SL-HX2",
    "name": "3D сканер ScanLine EasyScan HX2",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 1650000,
    "priceRub": 2280000,
    "partnerPriceRub": 2052000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Усовершенствованный российский гибридный 3D-сканер 2-го поколения с увеличенной частотой кадров и повышенной детализацией кромок.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-libre",
    "sku": "SCN-SL-LIBRE",
    "name": "3D сканер ScanLine EasyScan Libre",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Беспроводной мобильный 3D-сканер для цеха и монтажных площадок. Высокая эргономика и свобода перемещения без спутанных кабелей.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-combo",
    "sku": "SCN-SL-COMBO",
    "name": "3D сканер ScanLine EasyScan Combo",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 2400000,
    "priceRub": 3350000,
    "partnerPriceRub": 3015000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Российский метрологический лазерный 3D-сканер с двойным источником: 26 синих лазерных линий + ИК VCSEL. Точность 0.02 мм. Применяется ПО Shining 3D.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-combo-exmodel-pro",
    "sku": "SCN-SL-COMBO-EXMODEL-PRO",
    "name": "3D сканер ScanLine EasyScan Combo and EXModel Pro Bundle",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 2400000,
    "priceRub": 3350000,
    "partnerPriceRub": 3015000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Готовый инженерный комплекс: метрологический сканер EasyScan Combo + лицензия программного обеспечения обратного инжиниринга Shining 3D EXModel Pro.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-combo-plus",
    "sku": "SCN-SL-COMBO-PLUS",
    "name": "3D сканер ScanLine EasyScan Combo+",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 2800000,
    "priceRub": 3850000,
    "partnerPriceRub": 3465000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Флагманская форсированная версия Combo+ с увеличенной плотностью лазерных линий, повышенной скоростью и улучшенным алгоритмом оцифровки зеркал.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-combo-plus-exmodel-pro",
    "sku": "SCN-SL-COMBO-PLUS-EXMODEL-PRO",
    "name": "3D сканер ScanLine EasyScan Combo+ and EXModel Pro Bundle",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 2800000,
    "priceRub": 3850000,
    "partnerPriceRub": 3465000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Премиальный инженерный бандл: сканер повышенной мощности EasyScan Combo+ и расширенная лицензия САПР-реверса Shining 3D EXModel Pro.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-hx",
    "sku": "SCN-SL-HX",
    "name": "3D сканер ScanLine EasyScan HX",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 1650000,
    "priceRub": 2280000,
    "partnerPriceRub": 2052000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Гибридный метрологический 3D-сканер с перекрестными синими лазерами (13+13 линий) и цветным структурированным LED-светом для черных, полированных и цветных объектов.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-rigil",
    "sku": "SCN-SL-RIGIL",
    "name": "3D сканер ScanLine EasyScan Rigil",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 1100000,
    "priceRub": 1550000,
    "partnerPriceRub": 1395000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Флагманский автономный портативный 3D-сканер метрологического класса «всё-в-одном»: сенсорный экран, процессор, аккумуляторы, Wi-Fi, синий лазер + IR VCSEL.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-staticscan-inspec2",
    "sku": "SCN-ST-INSPEC2",
    "name": "3D сканер ScanLine StaticScan Inspec2",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 2700000,
    "priceRub": 3750000,
    "partnerPriceRub": 3375000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Стационарный оптический 3D-сканер с трехосевым поворотным столом, синим структурированным светом и 2 × 5.0 Мп камерами для лабораторной оцифровки мелочевки.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-ue-pro",
    "sku": "SCN-SL-UE-PRO",
    "name": "3D сканер ScanLine EasyScan UE PRO",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 3100000,
    "priceRub": 4250000,
    "partnerPriceRub": 3825000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 10,
    "warrantyMonths": 24,
    "description": "Российский метрологический 3D-сканер с встроенным модулем фотограмметрии без внешних масштабных линеек. Точность 0.02 мм. Поддерживает ПО Shining 3D.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-ue-pro-exmodel-pro",
    "sku": "SCN-SL-UE-PRO-EXMODEL-PRO",
    "name": "3D сканер ScanLine EasyScan UE PRO and EXModel Pro Bundle",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 3100000,
    "priceRub": 4250000,
    "partnerPriceRub": 3825000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 10,
    "warrantyMonths": 24,
    "description": "Инженерный комплекс для контроля геометрии и реверса крупных деталей: сканер EasyScan UE PRO с фотограмметрией + ПО Shining 3D EXModel Pro.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-ue-pro2",
    "sku": "SCN-SL-UE-PRO2",
    "name": "3D сканер ScanLine EasyScan UE PRO2",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 3800000,
    "priceRub": 5200000,
    "partnerPriceRub": 4680000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Флагманский 3D-сканер 2-го поколения с 50 синими лазерными линиями, сверхбыстрой фотограмметрией и увеличенной частотой кадров. Поддерживает софт Shining 3D.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-ue-pro2-exmodel-pro",
    "sku": "SCN-SL-UE-PRO2-EXMODEL-PRO",
    "name": "3D сканер ScanLine EasyScan UE PRO2 and EXModel Pro Bundle",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 3800000,
    "priceRub": 5200000,
    "partnerPriceRub": 4680000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Максимальный профессиональный комплект: 50-линейный метрологический сканер EasyScan UE PRO2 + софт параметрического реверса Shining 3D EXModel Pro.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-omni",
    "sku": "SCN-SL-OMNI",
    "name": "3D сканер ScanLine EasyScan Omni",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия) / Shining 3D",
    "unit": "компл.",
    "costPriceRub": 2950000,
    "priceRub": 4150000,
    "partnerPriceRub": 3735000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Флагманский отечественный оптический гибридный 3D-сканер с многолучевым синим лазерным сканированием, встроенной фотограмметрией и AI-распознаванием геометрии. Внесен в Госреестр СИ (ФГИС «АРШИН»).",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-freescan-omni-lite",
    "sku": "SHN-FS-OMNI-LITE",
    "name": "3D сканер Shining 3D Freescan Omni Lite",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D FreeScan Omni",
    "subCategory": "3D-сканеры Shining 3D FreeScan Omni",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 2950000,
    "priceRub": 4150000,
    "partnerPriceRub": 3735000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Метрологический оптический гибрид с преобладающим лазерным сканированием и поддержкой режима фотограмметрии. Официальное средство измерения (СИ) в реестре ФГИС «АРШИН».",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-omni-module-1-upfront",
    "sku": "SHN-OMNI-MODULE-1-UPFRONT",
    "name": "Module 1 upfront для Omni Lite",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D FreeScan Omni",
    "subCategory": "3D-сканеры Shining 3D FreeScan Omni",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 2950000,
    "priceRub": 4150000,
    "partnerPriceRub": 3735000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Аппаратный модуль расширения базового функционала сканера FreeScan Omni Lite: разблокировка увеличенной скорости и расширенного поля зрения.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-omni-module-2-vpg",
    "sku": "SHN-OMNI-MODULE-2-VPG",
    "name": "Module 2 (VPG) для Omni Lite",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D FreeScan Omni",
    "subCategory": "3D-сканеры Shining 3D FreeScan Omni",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 2950000,
    "priceRub": 4150000,
    "partnerPriceRub": 3735000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Модуль виртуальной фотограмметрии Virtual Photogrammetry Grid (VPG) для исключения накопления погрешности на деталях более 1.5 метров.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-omni-module-3-ai",
    "sku": "SHN-OMNI-MODULE-3-AI",
    "name": "Module 3 (AI Feature Recognition) для Omni Lite",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D FreeScan Omni",
    "subCategory": "3D-сканеры Shining 3D FreeScan Omni",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 2950000,
    "priceRub": 4150000,
    "partnerPriceRub": 3735000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Интеллектуальный программный модуль AI Feature Recognition: автоматическое распознавание отверстий, кромок, фасок и цилиндров прямо при сканировании.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-shining-freescan-omni",
    "sku": "SHN-FS-OMNI",
    "name": "3D сканер Shining 3D Freescan Omni",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D FreeScan Omni",
    "subCategory": "3D-сканеры Shining 3D FreeScan Omni",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 2950000,
    "priceRub": 4150000,
    "partnerPriceRub": 3735000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Флагманский оптический гибридный 3D-сканер с преобладающим лазерным сканированием, встроенной фотограмметрией и AI-распознаванием геометрии. Внесен в реестр ФГИС «АРШИН».",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-trio",
    "sku": "SCN-SL-TRIO",
    "name": "3D сканер ScanLine EasyScan TRIO",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 4100000,
    "priceRub": 5600000,
    "partnerPriceRub": 5040000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 21,
    "warrantyMonths": 24,
    "description": "Инновационный российский 3D-сканер с тремя прецизионными 5-мегапиксельными камерами для одновременного охвата широкого поля и мелких элементов. Поддержка ПО Shining 3D.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-easyscan-ue-pronova",
    "sku": "SCN-SL-UE-PRONOVA",
    "name": "3D сканер ScanLine EasyScan UE ProNova",
    "category": "hardware",
    "categoryLabel": "3D-сканеры ScanLine (Россия)",
    "subCategory": "3D-сканеры ScanLine (Россия)",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 3800000,
    "priceRub": 5200000,
    "partnerPriceRub": 4680000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Метрологический сканер повышенной точности ProNova с возможностью бесшовной модернизации до оптической трекинговой системы без маркеров TrackerScan. Работает с софтом Shining 3D.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-scanline-trackerscan-pronova",
    "sku": "SCN-TRK-PRONOVA",
    "name": "Система оптическая координатно-измерительная ScanLine TrackerScan ProNova",
    "category": "hardware",
    "categoryLabel": "Оптические КИМ ScanLine TrackerScan",
    "subCategory": "Оптические КИМ ScanLine TrackerScan",
    "manufacturer": "ScanLine (Россия)",
    "unit": "шт.",
    "costPriceRub": 5500000,
    "priceRub": 7600000,
    "partnerPriceRub": 6840000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 30,
    "warrantyMonths": 24,
    "description": "Оптическая координатно-измерительная система динамического трекинга: лазерный 3D-сканер ProNova + оптический трекер. Сканирование БЕЗ наклеивания маркеров. Поддержка ПО Shining 3D.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "Оптические"
    ]
  },
  {
    "id": "pi-hw-scanline-upgrade-pronova-to-trackerscan",
    "sku": "SCN-UPGRADE-PRONOVA-TO-TRACKERSCAN",
    "name": "Модернизация EasyScan UE ProNova до версии TrackerScan ProNova",
    "category": "hardware",
    "categoryLabel": "Оптические КИМ ScanLine TrackerScan",
    "subCategory": "Оптические КИМ ScanLine TrackerScan",
    "manufacturer": "ScanLine (Россия)",
    "unit": "шт.",
    "costPriceRub": 5500000,
    "priceRub": 7600000,
    "partnerPriceRub": 6840000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 30,
    "warrantyMonths": 24,
    "description": "Пакет модернизации ранее приобретенного сканера EasyScan UE ProNova: поставка оптического трекера, калибровка и разблокировка безмаркерного трекинга.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "Оптические"
    ]
  },
  {
    "id": "pi-hw-scanline-trackerscan-pro-s",
    "sku": "SCN-TRK-PRO-S",
    "name": "Система оптическая координатно-измерительная ScanLine TrackerScan Pro S",
    "category": "hardware",
    "categoryLabel": "Оптические КИМ ScanLine TrackerScan",
    "subCategory": "Оптические КИМ ScanLine TrackerScan",
    "manufacturer": "ScanLine (Россия)",
    "unit": "шт.",
    "costPriceRub": 5500000,
    "priceRub": 7600000,
    "partnerPriceRub": 6840000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 30,
    "warrantyMonths": 24,
    "description": "Оптическая КИМ со стандартным полем обзора трекера для контроля штампов, пресс-форм, литых заготовок и узлов в радиусе до 4-6 метров. Поддерживает софт Shining 3D.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "Оптические"
    ]
  },
  {
    "id": "pi-hw-scanline-extra-tracker-pro-s",
    "sku": "SCN-EXTRA-TRACKER-PRO-S",
    "name": "Дополнительный трекер ScanLine TrackerScan Pro S",
    "category": "hardware",
    "categoryLabel": "Оптические КИМ ScanLine TrackerScan",
    "subCategory": "Оптические КИМ ScanLine TrackerScan",
    "manufacturer": "ScanLine (Россия)",
    "unit": "шт.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Второй оптический трекер Pro S для расширения зоны контроля и устранения слепых зон при сканировании сложных крупногабаритных конструкций.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "Оптические"
    ]
  },
  {
    "id": "pi-hw-scanline-trackerscan-pro-w",
    "sku": "SCN-TRK-PRO-W",
    "name": "Система оптическая координатно-измерительная ScanLine TrackerScan Pro W",
    "category": "hardware",
    "categoryLabel": "Оптические КИМ ScanLine TrackerScan",
    "subCategory": "Оптические КИМ ScanLine TrackerScan",
    "manufacturer": "ScanLine (Россия)",
    "unit": "шт.",
    "costPriceRub": 5500000,
    "priceRub": 7600000,
    "partnerPriceRub": 6840000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 30,
    "warrantyMonths": 24,
    "description": "Широкопольная оптическая КИМ увеличенного радиуса действия для контроля крупногабаритных авиационных, судовых и железнодорожных конструкций. Поддержка ПО Shining 3D.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "Оптические"
    ]
  },
  {
    "id": "pi-hw-scanline-extra-tracker-pro-w",
    "sku": "SCN-EXTRA-TRACKER-PRO-W",
    "name": "Дополнительный трекер ScanLine TrackerScan Pro W",
    "category": "hardware",
    "categoryLabel": "Оптические КИМ ScanLine TrackerScan",
    "subCategory": "Оптические КИМ ScanLine TrackerScan",
    "manufacturer": "ScanLine (Россия)",
    "unit": "шт.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Дополнительный широкопольный трекер Pro W для создания гигантских измерительных пространств (до 100 м³) на сборочных линиях.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "Оптические"
    ]
  },
  {
    "id": "pi-hw-scanline-freeprobe-1-2",
    "sku": "SCN-FREEPROBE-1-2",
    "name": "Щуп FreeProbe / FreeProbe 2",
    "category": "hardware",
    "categoryLabel": "Оптические КИМ ScanLine TrackerScan",
    "subCategory": "Оптические КИМ ScanLine TrackerScan",
    "manufacturer": "ScanLine (Россия)",
    "unit": "шт.",
    "costPriceRub": 650000,
    "priceRub": 950000,
    "partnerPriceRub": 855000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 10,
    "warrantyMonths": 24,
    "description": "Беспроводной контактный щуп для оптических КИМ TrackerScan: контактное измерение скрытых зон, глубоких отверстий, пазов и базовых плоскостей.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "Оптические"
    ]
  },
  {
    "id": "pi-hw-scanline-freeprobe-2-pro",
    "sku": "SCN-FREEPROBE-2-PRO",
    "name": "Щуп FreeProbe 2 Pro",
    "category": "hardware",
    "categoryLabel": "Оптические КИМ ScanLine TrackerScan",
    "subCategory": "Оптические КИМ ScanLine TrackerScan",
    "manufacturer": "ScanLine (Россия)",
    "unit": "шт.",
    "costPriceRub": 650000,
    "priceRub": 950000,
    "partnerPriceRub": 855000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 10,
    "warrantyMonths": 24,
    "description": "Флагманский контактный беспроводной щуп с пьезоэлектрическим датчиком касания для ультрапрецизионных метрологических измерений.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "Оптические"
    ]
  },
  {
    "id": "pi-hw-shining-autoscan-inspec-2",
    "sku": "SHN-AUTOSCAN-INSPEC-2",
    "name": "3D сканер Shining 3D Autoscan Inspec 2",
    "category": "hardware",
    "categoryLabel": "Автоматизированные 3D-сканеры",
    "subCategory": "Автоматизированные 3D-сканеры",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Полностью автоматический настольный 3D-сканер с 3-осевым поворотным столом и субмикронной точностью (до 10 мкм) для мелких прецизионных деталей.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "Автоматизированные"
    ]
  },
  {
    "id": "pi-hw-scanline-staticscan-q9",
    "sku": "SCN-ST-Q9",
    "name": "3D сканер ScanLine StaticScan Q9",
    "category": "hardware",
    "categoryLabel": "Стационарные оптические 3D-сканеры ScanLine",
    "subCategory": "Стационарные оптические 3D-сканеры ScanLine",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 2700000,
    "priceRub": 3750000,
    "partnerPriceRub": 3375000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Стационарный оптический 3D-сканер на штативе с двумя 9-мегапиксельными камерами для высокоточного лабораторного контроля отливок и штампов.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "Стационарные"
    ]
  },
  {
    "id": "pi-hw-scanline-staticscan-q12",
    "sku": "SCN-ST-Q12",
    "name": "3D сканер ScanLine StaticScan Q12",
    "category": "hardware",
    "categoryLabel": "Стационарные оптические 3D-сканеры ScanLine",
    "subCategory": "Стационарные оптические 3D-сканеры ScanLine",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 2700000,
    "priceRub": 3750000,
    "partnerPriceRub": 3375000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Флагманский стационарный 3D-сканер с двумя 12-мегапиксельными матрицами и субмикронным разрешением для ответственных изделий аэрокосмической отрасли. Совместим с ПО Shining 3D.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "Стационарные"
    ]
  },
  {
    "id": "pi-hw-scanline-robotscan-q12",
    "sku": "SCN-ROBOTSCAN-Q12",
    "name": "Роботизированная автоматизированная система 3D-контроля ScanLine RobotScan Q12",
    "category": "hardware",
    "categoryLabel": "Роботизированные системы 3D-контроля",
    "subCategory": "Роботизированные системы 3D-контроля",
    "manufacturer": "ScanLine (Россия)",
    "unit": "компл.",
    "costPriceRub": 8500000,
    "priceRub": 11800000,
    "partnerPriceRub": 10620000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 45,
    "warrantyMonths": 24,
    "description": "Роботизированная ячейка автоматического 3D-контроля на базе 6-осевого промышленного робота KUKA/Fanuc и оптического сенсора 12 Мп для конвейера. Поддерживает ПО Shining 3D.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ScanLine",
      "Роботизированные"
    ]
  },
  {
    "id": "pi-hw-freescan-combo",
    "sku": "FREESCAN-COMBO",
    "name": "Метрологический 3D-сканер Shining3D FreeScan Combo",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 2400000,
    "priceRub": 3350000,
    "partnerPriceRub": 3015000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 24,
    "description": "Компактный метрологический сканер двойного источника света: 26 синих лазерных линий + инфракрасный VCSEL.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-freescan-ue-pro",
    "sku": "FREESCAN-UE-PRO",
    "name": "Лазерный 3D-сканер Shining3D FreeScan UE Pro",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 3100000,
    "priceRub": 4250000,
    "partnerPriceRub": 3825000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 10,
    "warrantyMonths": 24,
    "description": "Высокоточный метрологический сканер со встроенным модулем фотограмметрии для сканирования деталей средних и крупных габаритов.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-einscan-pro-hd",
    "sku": "EINSCAN-PRO-HD",
    "name": "Ручной 3D-сканер Shining3D EinScan Pro HD",
    "category": "hardware",
    "categoryLabel": "3D-сканеры Shining 3D",
    "subCategory": "3D-сканеры Shining 3D",
    "manufacturer": "Shining 3D (Китай)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Мультифункциональный ручной 3D-сканер высокого разрешения со структурированным светом для реверса и дизайна.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Shining",
      "3D-сканеры"
    ]
  },
  {
    "id": "pi-hw-leica-at960",
    "sku": "LCA-AT960",
    "name": "Leica Absolute Tracker AT960",
    "category": "hardware",
    "categoryLabel": "Лазерные трекеры",
    "subCategory": "Лазерные трекеры",
    "manufacturer": "Leica Geosystems / HEXAGON",
    "unit": "компл.",
    "costPriceRub": 13500000,
    "priceRub": 18200000,
    "partnerPriceRub": 16380000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 30,
    "warrantyMonths": 24,
    "description": "Флагманский высокодинамичный лазерный трекер с поддержкой 6 степеней свободы (6DoF), беспроводных щупов B-Probe / T-Probe, 3D-сканеров AS1 / T-Scan 5 и автоматизации.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Leica",
      "Лазерные"
    ]
  },
  {
    "id": "pi-hw-leica-at500",
    "sku": "LCA-AT500",
    "name": "Leica Absolute Tracker AT500",
    "category": "hardware",
    "categoryLabel": "Лазерные трекеры",
    "subCategory": "Лазерные трекеры",
    "manufacturer": "Leica Geosystems / HEXAGON",
    "unit": "компл.",
    "costPriceRub": 9800000,
    "priceRub": 13400000,
    "partnerPriceRub": 12060000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 30,
    "warrantyMonths": 24,
    "description": "Портативный лазерный трекер нового поколения с автономным питанием, защитой IP54, прямой связью без внешнего контроллера и щупом B-Probeplus.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Leica",
      "Лазерные"
    ]
  },
  {
    "id": "pi-hw-leica-at930",
    "sku": "LCA-AT930",
    "name": "Лазерный трекер Leica Absolute Tracker AT930",
    "category": "hardware",
    "categoryLabel": "Лазерные трекеры",
    "subCategory": "Лазерные трекеры",
    "manufacturer": "Leica Geosystems / HEXAGON",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Высокодинамичный 3D лазерный трекер с абсолютным интерферометром AIFM и системой PowerLock для скоростных измерений по отражателям (SMR).",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Leica",
      "Лазерные"
    ]
  },
  {
    "id": "pi-hw-leica-ats600",
    "sku": "LCA-ATS600",
    "name": "Лазерный трекер Leica Absolute Tracker ATS600",
    "category": "hardware",
    "categoryLabel": "Лазерные трекеры",
    "subCategory": "Лазерные трекеры",
    "manufacturer": "Leica Geosystems / HEXAGON",
    "unit": "компл.",
    "costPriceRub": 16500000,
    "priceRub": 22500000,
    "partnerPriceRub": 20250000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 45,
    "warrantyMonths": 24,
    "description": "Первый в мире лазерный трекер прямого сканирования: оцифровка крупногабаритных поверхностей без отражателей и меток на расстоянии до 60 метров.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Leica",
      "Лазерные"
    ]
  },
  {
    "id": "pi-hw-leica-ats800",
    "sku": "LCA-ATS800",
    "name": "Лазерный трекер Leica Absolute Tracker ATS800",
    "category": "hardware",
    "categoryLabel": "Лазерные трекеры",
    "subCategory": "Лазерные трекеры",
    "manufacturer": "Leica Geosystems / HEXAGON",
    "unit": "компл.",
    "costPriceRub": 16500000,
    "priceRub": 22500000,
    "partnerPriceRub": 20250000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 45,
    "warrantyMonths": 24,
    "description": "Инновационный лазерный трекер прямого сканирования нового поколения: высокоскоростная оцифровка поверхностей и автоматическое распознавание кромок и вырезов.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Leica",
      "Лазерные"
    ]
  },
  {
    "id": "pi-hw-leica-at403",
    "sku": "LCA-AT403",
    "name": "Лазерный трекер Leica Absolute Tracker AT403",
    "category": "hardware",
    "categoryLabel": "Лазерные трекеры",
    "subCategory": "Лазерные трекеры",
    "manufacturer": "Leica Geosystems / HEXAGON",
    "unit": "компл.",
    "costPriceRub": 9800000,
    "priceRub": 13400000,
    "partnerPriceRub": 12060000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 30,
    "warrantyMonths": 24,
    "description": "Ультрапортативный лазерный трекер с защитой IP54 для высокоточных измерений крупногабаритных объектов до 320 метров.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Leica",
      "Лазерные"
    ]
  },
  {
    "id": "pi-hw-renishaw-equator-300",
    "sku": "REN-EQUATOR-300",
    "name": "Калибрующая система Renishaw Equator 300 / 500",
    "category": "hardware",
    "categoryLabel": "Системы Renishaw",
    "subCategory": "Системы Renishaw",
    "manufacturer": "Renishaw (Великобритания)",
    "unit": "компл.",
    "costPriceRub": 3200000,
    "priceRub": 4450000,
    "partnerPriceRub": 4005000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 21,
    "warrantyMonths": 24,
    "description": "Универсальный цеховой сравнительный калибратор для 100% контроля серийных деталей прямо рядом со станком с ЧПУ.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Renishaw",
      "Системы"
    ]
  },
  {
    "id": "pi-hw-renishaw-ph20-sp25",
    "sku": "REN-PH20-SP25",
    "name": "Измерительные головки и 5-осевые датчики Renishaw PH20 / REVO-2 / SP25M",
    "category": "hardware",
    "categoryLabel": "Системы Renishaw",
    "subCategory": "Системы Renishaw",
    "manufacturer": "Renishaw (Великобритания)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Прецизионные поворотные головки, сканирующие датчики SP25M и 5-осевые головки PH20 / REVO для модернизации любых КИМ.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Renishaw",
      "Системы"
    ]
  },
  {
    "id": "pi-hw-renishaw-revo-2",
    "sku": "REN-REVO-2",
    "name": "5-осевая сканирующая измерительная система Renishaw REVO-2",
    "category": "hardware",
    "categoryLabel": "Системы Renishaw",
    "subCategory": "Системы Renishaw",
    "manufacturer": "Renishaw (Великобритания)",
    "unit": "компл.",
    "costPriceRub": 5200000,
    "priceRub": 7100000,
    "partnerPriceRub": 6390000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 21,
    "warrantyMonths": 24,
    "description": "Революционная 5-осевая измерительная система сверхвысокой производительности со скоростью сканирования до 500 мм/с и бесконечным позиционированием.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Renishaw",
      "Системы"
    ]
  },
  {
    "id": "pi-hw-renishaw-stylus-fixtures",
    "sku": "REN-STYLUS-FIXTURES",
    "name": "Прецизионные измерительные щупы, стилусы и оснастка Renishaw M2 / M3 / M4 / M5",
    "category": "hardware",
    "categoryLabel": "Системы Renishaw",
    "subCategory": "Системы Renishaw",
    "manufacturer": "Renishaw (Великобритания)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Полный каталог оригинальных измерительных наконечников, рубиновых сфер, удлинителей из карбона/керамики и модульных зажимных систем Renishaw Fixturing.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Renishaw",
      "Системы"
    ]
  },
  {
    "id": "pi-hw-renishaw-tp20-tp200",
    "sku": "REN-TP20-TP200",
    "name": "Триггерные датчики Renishaw TP20 / TP200 и магазины автосмены MCR20 / SCR200",
    "category": "hardware",
    "categoryLabel": "Системы Renishaw",
    "subCategory": "Системы Renishaw",
    "manufacturer": "Renishaw (Великобритания)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Компактные 5-направленные триггерные датчики со сменными модулями усилия касания и автоматическими магазинами смены щупов для ЧПУ КИМ.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Renishaw",
      "Системы"
    ]
  },
  {
    "id": "pi-hw-renishaw-ucc-retrofit",
    "sku": "REN-UCC-RETROFIT",
    "name": "ЧПУ-контроллеры и комплекты глубокой модернизации (ретрофита) КИМ Renishaw UCC",
    "category": "hardware",
    "categoryLabel": "Системы Renishaw",
    "subCategory": "Системы Renishaw",
    "manufacturer": "Renishaw (Великобритания)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Современные универсальные контроллеры Renishaw UCC S5 / UCC T5 / UCC T3 Plus для модернизации механики, электроники и ПО любых мостовых и портальных КИМ.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "Renishaw",
      "Системы"
    ]
  },
  {
    "id": "pi-hw-hexagon-aicon-stereoscan-neo",
    "sku": "HEX-AICON-STEREOSCAN-NEO",
    "name": "Оптический стационарный 3D-сканер Hexagon AICON StereoScan neo",
    "category": "hardware",
    "categoryLabel": "Оптические 3D-сканеры Hexagon",
    "subCategory": "Оптические 3D-сканеры Hexagon",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Премиальный стационарный оптический 3D-сканер на базе стереокамер 16 Мп с проекцией цветной интерференционной картины для микроструктур и штампов.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "Оптические"
    ]
  },
  {
    "id": "pi-hw-hexagon-aicon-primescan",
    "sku": "HEX-AICON-PRIMESCAN",
    "name": "Оптический 3D-сканер Hexagon AICON PrimeScan",
    "category": "hardware",
    "categoryLabel": "Оптические 3D-сканеры Hexagon",
    "subCategory": "Оптические 3D-сканеры Hexagon",
    "manufacturer": "HEXAGON (Германия/Швейцария)",
    "unit": "компл.",
    "costPriceRub": 4200000,
    "priceRub": 5850000,
    "partnerPriceRub": 5265000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 45,
    "warrantyMonths": 24,
    "description": "Компактный оптический 3D-сканер структурированного света с камерами до 8 Мп для лабораторий контроля качества деталей литья, штамповки и пластика.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "HEXAGON",
      "Оптические"
    ]
  },
  {
    "id": "pi-hw-pmt-alpha-7axis-pro",
    "sku": "PMT-ALPHA-7AXIS-PRO",
    "name": "Мобильная 7-осевая КИМ PMT ALPHA ARM Pro 7-Axis со сканером PMT GH",
    "category": "hardware",
    "categoryLabel": "Мобильные КИМ PMT Alpha Arm",
    "subCategory": "Мобильные КИМ PMT Alpha Arm",
    "manufacturer": "PMT (Китай)",
    "unit": "компл.",
    "costPriceRub": 2600000,
    "priceRub": 3600000,
    "partnerPriceRub": 3240000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Готовый координатно-измерительный комплекс: 7-осевая мобильная КИМ PMT Alpha в связке с прецизионным лазерным сканером PMT GH и ПО PolyWorks.",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "PMT",
      "Мобильные"
    ]
  },
  {
    "id": "pi-hw-industrial-3d-printer-slm",
    "sku": "INDUSTRIAL-3D-PRINTER-SLM",
    "name": "Промышленный металлический 3D-принтер SLM / DMP",
    "category": "hardware",
    "categoryLabel": "3D-принтеры",
    "subCategory": "3D-принтеры",
    "manufacturer": "ДС‑Инжиниринг / Партнеры",
    "unit": "компл.",
    "costPriceRub": 1800000,
    "priceRub": 2450000,
    "partnerPriceRub": 2205000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 24,
    "description": "Установка селективного лазерного сплавления металлических порошков (нержавеющая сталь, титан, жаропрочные сплавы, алюминий).",
    "isPopular": false,
    "isActive": true,
    "tags": [
      "Оборудование",
      "ДС‑Инжиниринг",
      "3D-принтеры"
    ]
  },
  {
    "id": "pi-sw-polyworks-inspector",
    "sku": "SW-POLY-INSP",
    "name": "PolyWorks|Inspector™ Standard (бессрочная лицензия)",
    "category": "software",
    "categoryLabel": "Программное обеспечение",
    "subCategory": "Метрологическое ПО",
    "manufacturer": "InnovMetric (Канада)",
    "unit": "лиц.",
    "costPriceRub": 1100000,
    "priceRub": 1650000,
    "partnerPriceRub": 1450000,
    "vatRate": 22,
    "maxDiscountPercent": 15,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 12,
    "description": "Универсальная метрологическая программная платформа для КИМ, 3D-сканеров и лазерных трекеров. Полная поддержка GD&T по ASME/ISO.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "PolyWorks",
      "ПО",
      "Контроль геометрии",
      "GD&T"
    ]
  },
  {
    "id": "pi-sw-polyworks-modeler",
    "sku": "SW-POLY-MOD",
    "name": "PolyWorks|Modeler™ (реверс-инжиниринг)",
    "category": "software",
    "categoryLabel": "Программное обеспечение",
    "subCategory": "Обратный инжиниринг",
    "manufacturer": "InnovMetric (Канада)",
    "unit": "лиц.",
    "costPriceRub": 950000,
    "priceRub": 1420000,
    "partnerPriceRub": 1250000,
    "vatRate": 22,
    "maxDiscountPercent": 15,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 12,
    "description": "Модуль обратного проектирования: построение CAD-поверхностей (NURBS) и параметрических твердотельных моделей по сканам.",
    "isActive": true,
    "tags": [
      "PolyWorks",
      "ПО",
      "Реверс-инжиниринг"
    ]
  },
  {
    "id": "pi-sw-geomagic-design-x",
    "sku": "SW-GEO-DX",
    "name": "Geomagic Design X (флагман реверс-инжиниринга)",
    "category": "software",
    "categoryLabel": "Программное обеспечение",
    "subCategory": "Обратный инжиниринг",
    "manufacturer": "Oqton / 3D Systems",
    "unit": "лиц.",
    "costPriceRub": 1450000,
    "priceRub": 2150000,
    "partnerPriceRub": 1900000,
    "vatRate": 22,
    "maxDiscountPercent": 10,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 12,
    "description": "Отраслевой стандарт обратного проектирования: преобразование данных 3D-сканирования в параметрические CAD-модели с деревом построения.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Geomagic",
      "Design X",
      "CAD",
      "Реверс"
    ]
  },
  {
    "id": "pi-sw-geomagic-control-x",
    "sku": "SW-GEO-CX",
    "name": "Geomagic Control X (профессиональный контроль геометрии)",
    "category": "software",
    "categoryLabel": "Программное обеспечение",
    "subCategory": "Метрологический контроль",
    "manufacturer": "Oqton / 3D Systems",
    "unit": "лиц.",
    "costPriceRub": 1200000,
    "priceRub": 1780000,
    "partnerPriceRub": 1580000,
    "vatRate": 22,
    "maxDiscountPercent": 10,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 12,
    "description": "Программа бесконтактного контроля геометрии: сравнение с CAD, цветовые карты отклонений, отчеты по ГОСТ/ASME.",
    "isActive": true,
    "tags": [
      "Geomagic",
      "Control X",
      "Метрология",
      "Контроль"
    ]
  },
  {
    "id": "pi-sw-topsolid-7-design",
    "sku": "SW-TS7-DES",
    "name": "TopSolid 7 Design Pro (CAD для машиностроения)",
    "category": "software",
    "categoryLabel": "Программное обеспечение",
    "subCategory": "CAD/CAM/PDM системы",
    "manufacturer": "TopSolid SAS (Франция)",
    "unit": "лиц.",
    "costPriceRub": 750000,
    "priceRub": 1150000,
    "partnerPriceRub": 1020000,
    "vatRate": 22,
    "maxDiscountPercent": 15,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 12,
    "description": "Интегрированная параметрическая CAD-система с встроенной PDM для сквозного проектирования штампов, пресс-форм и деталей.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "TopSolid",
      "CAD",
      "PDM",
      "Пресс-формы"
    ]
  },
  {
    "id": "pi-sw-topsolid-7-cam",
    "sku": "SW-TS7-CAM",
    "name": "TopSolid 7 Cam (фрезерование 3D + токарная обработка ЧПУ)",
    "category": "software",
    "categoryLabel": "Программное обеспечение",
    "subCategory": "CAD/CAM/PDM системы",
    "manufacturer": "TopSolid SAS (Франция)",
    "unit": "лиц.",
    "costPriceRub": 980000,
    "priceRub": 1480000,
    "partnerPriceRub": 1320000,
    "vatRate": 22,
    "maxDiscountPercent": 12,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 12,
    "description": "CAM-система нового поколения для программирования станков с ЧПУ: фрезерная, токарно-фрезерная и многоосевая обработка с верификацией.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "TopSolid",
      "CAM",
      "ЧПУ",
      "Фрезерование"
    ]
  },
  {
    "id": "pi-sw-topsolid-7-cam-5axis",
    "sku": "SW-TS7-CAM5X",
    "name": "TopSolid 7 Cam 5-Axis (непрерывная 5-осевая ЧПУ обработка)",
    "category": "software",
    "categoryLabel": "Программное обеспечение",
    "subCategory": "CAD/CAM/PDM системы",
    "manufacturer": "TopSolid SAS (Франция)",
    "unit": "лиц.",
    "costPriceRub": 1350000,
    "priceRub": 1980000,
    "partnerPriceRub": 1780000,
    "vatRate": 22,
    "maxDiscountPercent": 10,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 12,
    "description": "Модуль непрерывной 5-осевой обработки для сложных лопаток турбин, моноколес и пресс-форм с симуляцией кинематики станка.",
    "isActive": true,
    "tags": [
      "TopSolid",
      "CAM 5X",
      "5-осевая обработка",
      "ЧПУ"
    ]
  },
  {
    "id": "pi-sw-exmodel-pro",
    "sku": "SW-EXMODEL-PRO",
    "name": "EXModel Pro (ПО для быстрого CAD-моделирования по сканам)",
    "category": "software",
    "categoryLabel": "Программное обеспечение",
    "subCategory": "Обратный инжиниринг",
    "manufacturer": "Shining 3D",
    "unit": "лиц.",
    "costPriceRub": 350000,
    "priceRub": 520000,
    "partnerPriceRub": 460000,
    "vatRate": 22,
    "maxDiscountPercent": 15,
    "inStock": true,
    "leadTimeDays": 2,
    "warrantyMonths": 12,
    "description": "Простое и мощное ПО для реверс-инжиниринга: конвертация полигональных сеток сканирования в твердотельные CAD-модели.",
    "isActive": true,
    "tags": [
      "EXModel",
      "ПО",
      "Shining 3D",
      "Реверс"
    ]
  },
  {
    "id": "pi-srv-3d-scan-lab",
    "sku": "SRV-3D-SCAN-LAB",
    "name": "Прецизионное 3D-сканирование деталей в метрологической лаборатории",
    "category": "services",
    "categoryLabel": "Инжиниринговые услуги",
    "subCategory": "3D-сканирование и метрология",
    "manufacturer": "ДС-Инжиниринг",
    "unit": "нормо-час",
    "costPriceRub": 2200,
    "priceRub": 4800,
    "partnerPriceRub": 3900,
    "vatRate": 22,
    "maxDiscountPercent": 20,
    "inStock": true,
    "leadTimeDays": 2,
    "warrantyMonths": 0,
    "description": "Высокоточное 3D-сканирование деталей и оснастки на оптических и лазерных сканерах ScanLine/Shining 3D с погрешностью от 0.015 мм.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Услуги",
      "3D-сканирование",
      "Лаборатория",
      "Контроль"
    ]
  },
  {
    "id": "pi-srv-onsite-measurement",
    "sku": "SRV-ONSITE-MEAS",
    "name": "Выездные координатные измерения КИМ типа «рука» и лазерным трекером",
    "category": "services",
    "categoryLabel": "Инжиниринговые услуги",
    "subCategory": "Выездные измерения",
    "manufacturer": "ДС-Инжиниринг",
    "unit": "смена",
    "costPriceRub": 32000,
    "priceRub": 68000,
    "partnerPriceRub": 58000,
    "vatRate": 22,
    "maxDiscountPercent": 15,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 0,
    "description": "Выезд мобильной метрологической группы на предприятие заказчика с портативной КИМ PMT GAMMA+ или лазерным трекером Leica AT960.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Выездные измерения",
      "Трекер",
      "КИМ-рука",
      "ОТК"
    ]
  },
  {
    "id": "pi-srv-reverse-engineering",
    "sku": "SRV-REV-ENG",
    "name": "Обратный инжиниринг (построение параметрической CAD-модели)",
    "category": "services",
    "categoryLabel": "Инжиниринговые услуги",
    "subCategory": "Обратный инжиниринг",
    "manufacturer": "ДС-Инжиниринг",
    "unit": "нормо-час",
    "costPriceRub": 2600,
    "priceRub": 5500,
    "partnerPriceRub": 4600,
    "vatRate": 22,
    "maxDiscountPercent": 20,
    "inStock": true,
    "leadTimeDays": 5,
    "warrantyMonths": 0,
    "description": "Разработка твердотельных CAD-моделей в STEP/IGES/Parasolid и чертежей по ЕСКД на основе полигональных сеток сканирования деталей.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Реверс-инжиниринг",
      "CAD-модель",
      "ЕСКД",
      "Чертежи"
    ]
  },
  {
    "id": "pi-srv-postprocessor-dev",
    "sku": "SRV-POSTPROC-DEV",
    "name": "Разработка и верификация постпроцессора для станков с ЧПУ",
    "category": "services",
    "categoryLabel": "Инжиниринговые услуги",
    "subCategory": "Разработка постпроцессоров",
    "manufacturer": "ДС-Инжиниринг",
    "unit": "компл.",
    "costPriceRub": 85000,
    "priceRub": 185000,
    "partnerPriceRub": 155000,
    "vatRate": 22,
    "maxDiscountPercent": 15,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 12,
    "description": "Разработка и внедрение индивидуального постпроцессора TopSolid Cam для 3–5 осевых станков ЧПУ (Siemens, Heidenhain, Fanuc, Haas).",
    "isActive": true,
    "tags": [
      "Постпроцессор",
      "ЧПУ",
      "TopSolid Cam",
      "Внедрение"
    ]
  },
  {
    "id": "pi-srv-training-metrology",
    "sku": "SRV-TRAIN-METR",
    "name": "Курс обучения операторов КИМ и 3D-сканеров с выдачей свидетельства",
    "category": "services",
    "categoryLabel": "Инжиниринговые услуги",
    "subCategory": "Обучение персонала",
    "manufacturer": "ДС-Инжиниринг",
    "unit": "чел.",
    "costPriceRub": 25000,
    "priceRub": 60000,
    "partnerPriceRub": 50000,
    "vatRate": 22,
    "maxDiscountPercent": 15,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 0,
    "description": "Практический курс обучения работе с PolyWorks|Inspector, КИМ PMT и сканерами ScanLine на деталях заказчика (40 акад. часов).",
    "isActive": true,
    "tags": [
      "Обучение",
      "PolyWorks",
      "Оператор КИМ",
      "Свидетельство"
    ]
  },
  {
    "id": "pi-acc-renishaw-revo2",
    "sku": "ACC-REN-REVO2",
    "name": "5-осевая сканирующая система Renishaw REVO-2",
    "category": "accessories",
    "categoryLabel": "Оснастка и щупы",
    "subCategory": "Измерительные системы Renishaw",
    "manufacturer": "Renishaw (Великобритания)",
    "unit": "компл.",
    "costPriceRub": 5200000,
    "priceRub": 7100000,
    "partnerPriceRub": 6400000,
    "vatRate": 22,
    "maxDiscountPercent": 10,
    "inStock": false,
    "leadTimeDays": 30,
    "warrantyMonths": 12,
    "description": "Флагманская 5-осевая измерительная система с технологией бесконтактного перемещения датчика для скоростного высокоточного сканирования.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Renishaw",
      "REVO-2",
      "5 осей",
      "КИМ"
    ]
  },
  {
    "id": "pi-acc-renishaw-ph20",
    "sku": "ACC-REN-PH20",
    "name": "5-осевая сенсорная система Renishaw PH20",
    "category": "accessories",
    "categoryLabel": "Оснастка и щупы",
    "subCategory": "Измерительные системы Renishaw",
    "manufacturer": "Renishaw (Великобритания)",
    "unit": "компл.",
    "costPriceRub": 2400000,
    "priceRub": 3300000,
    "partnerPriceRub": 2980000,
    "vatRate": 22,
    "maxDiscountPercent": 10,
    "inStock": true,
    "leadTimeDays": 14,
    "warrantyMonths": 12,
    "description": "5-осевая сенсорная головка для стационарных КИМ. Быстрое измерение под любым углом без калибровки каждого положения.",
    "isActive": true,
    "tags": [
      "Renishaw",
      "PH20",
      "Сенсорная головка",
      "КИМ"
    ]
  },
  {
    "id": "pi-acc-renishaw-sp25m",
    "sku": "ACC-REN-SP25M",
    "name": "Компактный сканирующий датчик Renishaw SP25M",
    "category": "accessories",
    "categoryLabel": "Оснастка и щупы",
    "subCategory": "Датчики Renishaw",
    "manufacturer": "Renishaw (Великобритания)",
    "unit": "компл.",
    "costPriceRub": 1400000,
    "priceRub": 1950000,
    "partnerPriceRub": 1750000,
    "vatRate": 22,
    "maxDiscountPercent": 10,
    "inStock": true,
    "leadTimeDays": 10,
    "warrantyMonths": 12,
    "description": "Высокоточный непрерывный сканирующий датчик диаметром 25 мм для установки на поворотные головки PH10M Plus.",
    "isActive": true,
    "tags": [
      "Renishaw",
      "SP25M",
      "Сканирующий датчик"
    ]
  },
  {
    "id": "pi-acc-renishaw-stylus-kit",
    "sku": "ACC-REN-STYLUS-KIT",
    "name": "Метрологический комплект щупов и стилусов Renishaw M2/M3/M4 (рубиновые сферы)",
    "category": "accessories",
    "categoryLabel": "Оснастка и щупы",
    "subCategory": "Щупы и калибры",
    "manufacturer": "Renishaw (Великобритания)",
    "unit": "набор",
    "costPriceRub": 180000,
    "priceRub": 290000,
    "partnerPriceRub": 250000,
    "vatRate": 22,
    "maxDiscountPercent": 15,
    "inStock": true,
    "leadTimeDays": 5,
    "warrantyMonths": 12,
    "description": "Набор прецизионных щупов из карбида вольфрама и углеволокна с рубиновыми шариками диаметром от 0.5 до 8.0 мм.",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Renishaw",
      "Щупы",
      "Стилусы",
      "Рубин"
    ]
  },
  {
    "id": "pi-acc-calib-sphere",
    "sku": "ACC-CALIB-SPHERE-25",
    "name": "Калибровочная сфера Ø 25.000 мм с сертификатом ВНИИМС",
    "category": "accessories",
    "categoryLabel": "Оснастка и щупы",
    "subCategory": "Калибровочные эталоны",
    "manufacturer": "ДС-Инжиниринг / ВНИИМС",
    "unit": "шт.",
    "costPriceRub": 95000,
    "priceRub": 165000,
    "partnerPriceRub": 140000,
    "vatRate": 22,
    "maxDiscountPercent": 15,
    "inStock": true,
    "leadTimeDays": 3,
    "warrantyMonths": 24,
    "description": "Керамическая эталонная сфера класса точности Grade 5 с отклонением от сферичности не более 0.13 мкм и магнитным штативом.",
    "isActive": true,
    "tags": [
      "Калибровка",
      "Сфера",
      "ВНИИМС",
      "КИМ"
    ]
  },
  {
    "id": "pi-acc-magnetic-targets",
    "sku": "ACC-SCAN-TARGETS-5000",
    "name": "Световозвращающие позиционные метки для 3D-сканеров Ø 6.0 мм (5000 шт)",
    "category": "accessories",
    "categoryLabel": "Оснастка и щупы",
    "subCategory": "Расходные материалы для 3D",
    "manufacturer": "ScanLine 3D",
    "unit": "упак.",
    "costPriceRub": 18000,
    "priceRub": 32000,
    "partnerPriceRub": 26000,
    "vatRate": 22,
    "maxDiscountPercent": 20,
    "inStock": true,
    "leadTimeDays": 1,
    "warrantyMonths": 6,
    "description": "Высококонтрастные круглые самоклеящиеся позиционные маркеры для оптических и лазерных 3D-сканеров ScanLine, Shining3D.",
    "isActive": true,
    "tags": [
      "Метки",
      "Маркеры",
      "3D-сканирование"
    ]
  },
  {
    "id": "pi-nc-cmm-calibration-arshin",
    "sku": "NC-SRV-CMM-CALIB",
    "name": "Периодическая поверка КИМ с внесением в ФГИС «АРШИН»",
    "category": "non_core_services",
    "categoryLabel": "Сервис и калибровка",
    "subCategory": "Метрологическая поверка",
    "manufacturer": "ДС-Инжиниринг / ФБУ ЦСМ",
    "unit": "усл.",
    "costPriceRub": 65000,
    "priceRub": 125000,
    "partnerPriceRub": 105000,
    "vatRate": 22,
    "maxDiscountPercent": 10,
    "inStock": true,
    "leadTimeDays": 10,
    "warrantyMonths": 12,
    "description": "Официальная периодическая поверка стационарных и мобильных КИМ по ГОСТ Р 8.763 с регистрацией свидетельства в реестре «АРШИН».",
    "isPopular": true,
    "isActive": true,
    "tags": [
      "Поверка",
      "АРШИН",
      "КИМ",
      "ЦСМ"
    ]
  },
  {
    "id": "pi-nc-interferometer-renishaw",
    "sku": "NC-SRV-LASER-CALIB",
    "name": "Лазерная калибровка геометрии осей станка/КИМ интерферометром Renishaw XL-80",
    "category": "non_core_services",
    "categoryLabel": "Сервис и калибровка",
    "subCategory": "Лазерная интерферометрия",
    "manufacturer": "ДС-Инжиниринг",
    "unit": "ось",
    "costPriceRub": 35000,
    "priceRub": 75000,
    "partnerPriceRub": 62000,
    "vatRate": 22,
    "maxDiscountPercent": 15,
    "inStock": true,
    "leadTimeDays": 5,
    "warrantyMonths": 12,
    "description": "Прецизионное измерение линейного позиционирования, угловых отклонений (рыскание, тангаж) и компенсация погрешностей осей в ЧПУ.",
    "isActive": true,
    "tags": [
      "Интерферометр",
      "XL-80",
      "Renishaw",
      "Калибровка"
    ]
  },
  {
    "id": "pi-nc-annual-maintenance",
    "sku": "NC-SRV-ANNUAL-TO",
    "name": "Годовое регламентное техническое обслуживание (ТО) измерительного комплекса КИМ",
    "category": "non_core_services",
    "categoryLabel": "Сервис и калибровка",
    "subCategory": "Сервисное обслуживание",
    "manufacturer": "ДС-Инжиниринг",
    "unit": "компл.",
    "costPriceRub": 90000,
    "priceRub": 180000,
    "partnerPriceRub": 150000,
    "vatRate": 22,
    "maxDiscountPercent": 15,
    "inStock": true,
    "leadTimeDays": 7,
    "warrantyMonths": 12,
    "description": "Комплексный осмотр пневмосистемы, чистка гранитных направляющих, проверка оптических линеек, юстировка шарниров и замена фильтров.",
    "isActive": true,
    "tags": [
      "ТО",
      "Регламент",
      "Обслуживание",
      "КИМ"
    ]
  }
];
