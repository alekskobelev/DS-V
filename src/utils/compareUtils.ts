import { Product } from '../types';

export interface SpecRow {
  key: string;
  label: string;
  isDifferent: boolean;
  values: (string | undefined)[];
}

export interface SpecCategory {
  id: string;
  title: string;
  iconName: string;
  rows: SpecRow[];
}

/**
 * Maps Russian/English spec keys to standard engineering categories
 */
const SPEC_CATEGORY_KEYWORDS: Record<string, string[]> = {
  metrology: [
    'точность', 'погрешность', 'mpe', 'повторяемость', 'разрешение', 'шаг', 'калибровка',
    'госреестр', 'аршин', 'класс точности', 'пределы допускаемой', 'сфера', 'щуп'
  ],
  dimensions: [
    'диапазон', 'поле', 'зона', 'дистанция', 'габарит', 'масса', 'вес', 'размер',
    'ход', 'объем', 'глубина', 'фокус', 'рабочая зона', 'угол'
  ],
  optics: [
    'лазер', 'камера', 'свет', 'подсветка', 'кадр', 'скорость', 'линз', 'сенсор',
    'проектор', 'длина волны', 'класс лазера', 'частота', 'датчик', 'сканирование'
  ],
  software: [
    'по', 'софт', 'программ', 'формат', 'экспорт', 'импорт', 'интерфейс', 'ос',
    'windows', 'совместим', 'драйвер', 'cad', 'cam', 'caq', 'разрядность', 'память', 'процессор'
  ],
  environment: [
    'температур', 'влажность', 'питание', 'ip', 'защит', 'аккумулятор', 'батаре',
    'потреблен', 'гаранти', 'сертификат', 'гост', 'iso', 'удар'
  ],
};

/**
 * Determines which category a specification key belongs to
 */
function getSpecCategoryId(specKey: string): string {
  const lower = specKey.toLowerCase();
  for (const [catId, keywords] of Object.entries(SPEC_CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return catId;
    }
  }
  return 'general';
}

/**
 * Extracts all unique specification keys and groups them into clean categories
 */
export function buildCategorizedSpecs(products: (Product | null)[]): SpecCategory[] {
  const activeProducts = products.filter((p): p is Product => p !== null);
  if (activeProducts.length === 0) return [];

  // Collect all unique keys from specs & dualModeSpecs across all active products
  const allSpecKeys = new Set<string>();

  activeProducts.forEach((p) => {
    if (p.specs) {
      Object.keys(p.specs).forEach((k) => allSpecKeys.add(k));
    }
    if (p.dualModeSpecs?.rows) {
      p.dualModeSpecs.rows.forEach((row) => {
        if (row.laserVal) {
          allSpecKeys.add(`[Режим 1] ${row.label}`);
        }
        if (row.irVal) {
          allSpecKeys.add(`[Режим 2] ${row.label}`);
        }
        if (row.singleVal) {
          allSpecKeys.add(row.label);
        }
      });
    }
    if (p.sysReqs) {
      Object.keys(p.sysReqs).forEach((k) => allSpecKeys.add(`[Системные требования] ${k}`));
    }
  });

  const categoryBuckets: Record<string, SpecRow[]> = {
    overview: [],
    metrology: [],
    dimensions: [],
    optics: [],
    software: [],
    environment: [],
    general: [],
  };

  // Base overview row for brand, technology, stock
  const brandValues = products.map((p) => (p ? p.brand : undefined));
  categoryBuckets.overview.push({
    key: '__brand',
    label: 'Производитель / Бренд',
    isDifferent: checkIfDifferent(brandValues),
    values: brandValues,
  });

  const categoryValues = products.map((p) => (p ? p.categoryLabel : undefined));
  categoryBuckets.overview.push({
    key: '__category',
    label: 'Категория оборудования',
    isDifferent: checkIfDifferent(categoryValues),
    values: categoryValues,
  });

  const techValues = products.map((p) => {
    if (!p) return undefined;
    if (p.technologyLabel) return p.technologyLabel;
    if (p.technology === 'laser') return 'Лазерная триангуляция';
    if (p.technology === 'optical') return 'Оптический структурированный свет';
    if (p.technology === 'hybrid') return 'Гибридная система (Лазер + Оптика)';
    return p.type === 'software' ? 'Программное обеспечение' : 'Контактно-измерительная система';
  });
  categoryBuckets.overview.push({
    key: '__technology',
    label: 'Технология измерений / Тип',
    isDifferent: checkIfDifferent(techValues),
    values: techValues,
  });

  const inStockValues = products.map((p) => {
    if (!p) return undefined;
    return p.inStock ? 'В наличии / на складе' : 'Под заказ / Спецпоставка';
  });
  categoryBuckets.overview.push({
    key: '__inStock',
    label: 'Доступность',
    isDifferent: checkIfDifferent(inStockValues),
    values: inStockValues,
  });

  // Now process collected spec keys
  Array.from(allSpecKeys).forEach((key) => {
    const values = products.map((p) => {
      if (!p) return undefined;
      if (key.startsWith('[Режим 1] ') && p.dualModeSpecs?.rows) {
        const subLabel = key.replace('[Режим 1] ', '');
        const found = p.dualModeSpecs.rows.find((r) => r.label === subLabel);
        return found?.laserVal;
      }
      if (key.startsWith('[Режим 2] ') && p.dualModeSpecs?.rows) {
        const subLabel = key.replace('[Режим 2] ', '');
        const found = p.dualModeSpecs.rows.find((r) => r.label === subLabel);
        return found?.irVal;
      }
      if (key.startsWith('[Системные требования] ') && p.sysReqs) {
        const subKey = key.replace('[Системные требования] ', '');
        return p.sysReqs[subKey];
      }
      if (p.specs && p.specs[key]) {
        return p.specs[key];
      }
      if (p.dualModeSpecs?.rows) {
        const found = p.dualModeSpecs.rows.find((r) => r.label === key);
        if (found?.singleVal) return found.singleVal;
      }
      return undefined;
    });

    const isDifferent = checkIfDifferent(values);
    const catId = getSpecCategoryId(key);

    categoryBuckets[catId].push({
      key,
      label: key,
      isDifferent,
      values,
    });
  });

  const resultCategories: SpecCategory[] = [
    {
      id: 'overview',
      title: 'Основные параметры',
      iconName: 'Info',
      rows: categoryBuckets.overview,
    },
    {
      id: 'metrology',
      title: 'Метрологические характеристики и точность',
      iconName: 'Target',
      rows: categoryBuckets.metrology,
    },
    {
      id: 'dimensions',
      title: 'Рабочий диапазон и габариты',
      iconName: 'Compass',
      rows: categoryBuckets.dimensions,
    },
    {
      id: 'optics',
      title: 'Оптическая система, датчики и сенсоры',
      iconName: 'Scan',
      rows: categoryBuckets.optics,
    },
    {
      id: 'software',
      title: 'Программное обеспечение и форматы',
      iconName: 'Cpu',
      rows: categoryBuckets.software,
    },
    {
      id: 'environment',
      title: 'Условия эксплуатации и стандарты',
      iconName: 'ShieldCheck',
      rows: categoryBuckets.environment,
    },
    {
      id: 'general',
      title: 'Дополнительные спецификации',
      iconName: 'Layers',
      rows: categoryBuckets.general,
    },
  ];

  // Return only non-empty categories
  return resultCategories.filter((cat) => cat.rows.length > 0);
}

/**
 * Checks if values across active products are genuinely different
 */
function checkIfDifferent(values: (string | undefined)[]): boolean {
  const presentValues = values.filter((v): v is string => v !== undefined && v !== null && v.trim() !== '');
  if (presentValues.length <= 1) return true; // if one has it and other doesn't, it's a difference

  const first = presentValues[0].trim().toLowerCase();
  return presentValues.some((v) => v.trim().toLowerCase() !== first);
}

/**
 * Export side-by-side comparison table to Microsoft Excel (.xlsx)
 */
export async function exportComparisonToExcel(products: (Product | null)[], categories: SpecCategory[]): Promise<void> {
  const activeProducts = products.filter((p): p is Product => p !== null);
  if (activeProducts.length === 0) return;

  const XLSX = await import('xlsx');

  const headerRow = ['Категория', 'Параметр / Характеристика', ...activeProducts.map((p) => `${p.brand} ${p.name}`)];

  const rows: any[][] = [];
  rows.push(['СРАВНИТЕЛЬНАЯ СПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ И ПО']);
  rows.push(['ООО «ДС-Инжиниринг» — Официальный дистрибьютор и системный интегратор']);
  rows.push([`Дата формирования: ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}`]);
  rows.push([]);
  rows.push(headerRow);

  categories.forEach((cat) => {
    cat.rows.forEach((row) => {
      const activeValues = products
        .map((p, idx) => (p !== null ? row.values[idx] || '—' : null))
        .filter((v): v is string => v !== null);

      rows.push([cat.title, row.label, ...activeValues]);
    });
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 32 },
    { wch: 38 },
    ...activeProducts.map(() => ({ wch: 42 })),
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Сравнение товаров');

  const fileName = `DS_Engineering_Сравнение_${activeProducts.map((p) => p.name.replace(/[^a-zA-Z0-9а-яА-Я]/g, '_')).join('_vs_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
