import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS_DATA } from '../src/data/mockData';
import { PriceItem } from '../src/data/priceListsData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const priceItemsJsonPath = path.resolve(__dirname, '../data/price_items.json');
const priceListsDataPath = path.resolve(__dirname, '../src/data/priceListsData.ts');

// Excluded equipment as strictly requested by user
function isExcluded(id: string, name: string): boolean {
  const lower = (id + ' ' + name).toLowerCase();
  return lower.includes('coord3') || lower.includes('crysta') || lower.includes('mitutoyo crysta');
}

// Map mockData hardware to PriceItem
const hardwareProducts = PRODUCTS_DATA
  .filter(p => p.type === 'hardware' && !isExcluded(p.id, p.name))
  .map((p, index): PriceItem => {
    const id = p.id;
    let sku = id.toUpperCase().replace(/[^A-Z0-9]/g, '-');
    if (id.startsWith('pmt-gamma-plus-')) {
      sku = 'PMT-GMP-' + id.replace('pmt-gamma-plus-', '').toUpperCase();
    } else if (id.startsWith('pmt-')) {
      sku = 'PMT-' + id.replace('pmt-', '').toUpperCase();
    } else if (id.startsWith('scanline-easyscan-')) {
      sku = 'SCN-SL-' + id.replace('scanline-easyscan-', '').toUpperCase();
    } else if (id.startsWith('scanline-trackerscan-')) {
      sku = 'SCN-TRK-' + id.replace('scanline-trackerscan-', '').toUpperCase();
    } else if (id.startsWith('scanline-staticscan-')) {
      sku = 'SCN-ST-' + id.replace('scanline-staticscan-', '').toUpperCase();
    } else if (id.startsWith('scanline-')) {
      sku = 'SCN-' + id.replace('scanline-', '').toUpperCase();
    } else if (id.startsWith('shining-freescan-')) {
      sku = 'SHN-FS-' + id.replace('shining-freescan-', '').toUpperCase();
    } else if (id.startsWith('shining-rigil-')) {
      sku = 'SHN-RG-' + id.replace('shining-rigil-', '').toUpperCase();
    } else if (id.startsWith('shining-')) {
      sku = 'SHN-' + id.replace('shining-', '').toUpperCase();
    } else if (id.startsWith('hexagon-absolute-arm-')) {
      sku = 'HEX-ARM-' + id.replace('hexagon-absolute-arm-', '').toUpperCase();
    } else if (id.startsWith('hexagon-scanner-')) {
      sku = 'HEX-SCN-' + id.replace('hexagon-scanner-', '').toUpperCase();
    } else if (id.startsWith('hexagon-')) {
      sku = 'HEX-' + id.replace('hexagon-', '').toUpperCase();
    } else if (id.startsWith('leica-')) {
      sku = 'LCA-' + id.replace('leica-', '').toUpperCase();
    } else if (id.startsWith('renishaw-')) {
      sku = 'REN-' + id.replace('renishaw-', '').toUpperCase();
    }

    // Determine realistic B2B price in Rubles
    let costPrice = 1800000;
    let salePrice = 2450000;
    let leadDays = 14;

    if (id.includes('future') || id.includes('prime') || id.includes('cmm')) {
      costPrice = 4200000;
      salePrice = 5850000;
      leadDays = 45;
    } else if (id.includes('loong')) {
      costPrice = 11000000;
      salePrice = 15200000;
      leadDays = 60;
    } else if (id.includes('gamma-plus-p')) {
      costPrice = 2900000;
      salePrice = 3980000;
      leadDays = 14;
    } else if (id.includes('gamma-plus-m')) {
      costPrice = 2500000;
      salePrice = 3450000;
      leadDays = 14;
    } else if (id.includes('gamma-plus-e')) {
      costPrice = 2100000;
      salePrice = 2890000;
      leadDays = 14;
    } else if (id.includes('alpha-7axis') || id.includes('alpha-arm')) {
      costPrice = 2600000;
      salePrice = 3600000;
      leadDays = 14;
    } else if (id.includes('omni')) {
      costPrice = 2950000;
      salePrice = 4150000;
      leadDays = 7;
    } else if (id.includes('combo-plus')) {
      costPrice = 2800000;
      salePrice = 3850000;
      leadDays = 7;
    } else if (id.includes('combo')) {
      costPrice = 2400000;
      salePrice = 3350000;
      leadDays = 7;
    } else if (id.includes('hx2') || id.includes('hx')) {
      costPrice = 1650000;
      salePrice = 2280000;
      leadDays = 7;
    } else if (id.includes('ue-pro2') || id.includes('ue-pronova')) {
      costPrice = 3800000;
      salePrice = 5200000;
      leadDays = 14;
    } else if (id.includes('ue-pro') || id.includes('ue-7') || id.includes('ue-11')) {
      costPrice = 3100000;
      salePrice = 4250000;
      leadDays = 10;
    } else if (id.includes('trio')) {
      costPrice = 4100000;
      salePrice = 5600000;
      leadDays = 21;
    } else if (id.includes('trackerscan')) {
      costPrice = 5500000;
      salePrice = 7600000;
      leadDays = 30;
    } else if (id.includes('robotscan')) {
      costPrice = 8500000;
      salePrice = 11800000;
      leadDays = 45;
    } else if (id.includes('staticscan')) {
      costPrice = 2700000;
      salePrice = 3750000;
      leadDays = 14;
    } else if (id.includes('leica-at960')) {
      costPrice = 13500000;
      salePrice = 18200000;
      leadDays = 30;
    } else if (id.includes('leica-at403') || id.includes('leica-at500')) {
      costPrice = 9800000;
      salePrice = 13400000;
      leadDays = 30;
    } else if (id.includes('leica-ats600') || id.includes('leica-ats800')) {
      costPrice = 16500000;
      salePrice = 22500000;
      leadDays = 45;
    } else if (id.includes('revo-2')) {
      costPrice = 5200000;
      salePrice = 7100000;
      leadDays = 21;
    } else if (id.includes('equator')) {
      costPrice = 3200000;
      salePrice = 4450000;
      leadDays = 21;
    } else if (id.includes('scanner-gh') || id.includes('scanner-gs')) {
      costPrice = 1450000;
      salePrice = 2050000;
      leadDays = 14;
    } else if (id.includes('as1') || id.includes('rs6')) {
      costPrice = 3900000;
      salePrice = 5400000;
      leadDays = 21;
    } else if (id.includes('freeprobe') || id.includes('probe')) {
      costPrice = 650000;
      salePrice = 950000;
      leadDays = 10;
    } else if (id.includes('module')) {
      costPrice = 450000;
      salePrice = 680000;
      leadDays = 5;
    } else if (id.includes('bundle') || id.includes('exmodel')) {
      costPrice = 3200000;
      salePrice = 4400000;
      leadDays = 10;
    } else if (id.includes('einstar') || id.includes('einscan-se')) {
      costPrice = 320000;
      salePrice = 490000;
      leadDays = 3;
    } else if (id.includes('rigil')) {
      costPrice = 1100000;
      salePrice = 1550000;
      leadDays = 7;
    }

    return {
      id: 'pi-hw-' + id,
      sku,
      name: p.name,
      category: 'hardware',
      categoryLabel: p.categoryLabel || 'Оборудование КИМ и 3D',
      subCategory: p.categoryLabel || 'Оборудование КИМ и 3D',
      manufacturer: p.brand || 'ДС-Инжиниринг',
      unit: id.includes('probe') || id.includes('scanner') || id.includes('tracker') ? 'шт.' : 'компл.',
      costPriceRub: costPrice,
      priceRub: salePrice,
      partnerPriceRub: Math.round(salePrice * 0.9),
      vatRate: 22,
      maxDiscountPercent: 12,
      inStock: p.inStock !== false,
      leadTimeDays: leadDays,
      warrantyMonths: 24,
      description: p.shortDescription || p.fullDescription || p.name,
      isPopular: id.includes('omni') || id.includes('gamma') || id.includes('future') || id.includes('combo') || id.includes('ue-pro'),
      isActive: true,
      tags: ['Оборудование', (p.brand || '').split(' ')[0], (p.categoryLabel || '').split(' ')[0]]
    };
  });

// Software products
const softwareProducts: PriceItem[] = [
  {
    id: 'pi-sw-polyworks-inspector',
    sku: 'SW-POLY-INSP',
    name: 'PolyWorks|Inspector™ Standard (бессрочная лицензия)',
    category: 'software',
    categoryLabel: 'Программное обеспечение',
    subCategory: 'Метрологическое ПО',
    manufacturer: 'InnovMetric (Канада)',
    unit: 'лиц.',
    costPriceRub: 1100000,
    priceRub: 1650000,
    partnerPriceRub: 1450000,
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 3,
    warrantyMonths: 12,
    description: 'Универсальная метрологическая программная платформа для КИМ, 3D-сканеров и лазерных трекеров. Полная поддержка GD&T по ASME/ISO.',
    isPopular: true,
    isActive: true,
    tags: ['PolyWorks', 'ПО', 'Контроль геометрии', 'GD&T']
  },
  {
    id: 'pi-sw-polyworks-modeler',
    sku: 'SW-POLY-MOD',
    name: 'PolyWorks|Modeler™ (реверс-инжиниринг)',
    category: 'software',
    categoryLabel: 'Программное обеспечение',
    subCategory: 'Обратный инжиниринг',
    manufacturer: 'InnovMetric (Канада)',
    unit: 'лиц.',
    costPriceRub: 950000,
    priceRub: 1420000,
    partnerPriceRub: 1250000,
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 3,
    warrantyMonths: 12,
    description: 'Модуль обратного проектирования: построение CAD-поверхностей (NURBS) и параметрических твердотельных моделей по сканам.',
    isActive: true,
    tags: ['PolyWorks', 'ПО', 'Реверс-инжиниринг']
  },
  {
    id: 'pi-sw-geomagic-design-x',
    sku: 'SW-GEO-DX',
    name: 'Geomagic Design X (флагман реверс-инжиниринга)',
    category: 'software',
    categoryLabel: 'Программное обеспечение',
    subCategory: 'Обратный инжиниринг',
    manufacturer: 'Oqton / 3D Systems',
    unit: 'лиц.',
    costPriceRub: 1450000,
    priceRub: 2150000,
    partnerPriceRub: 1900000,
    vatRate: 22,
    maxDiscountPercent: 10,
    inStock: true,
    leadTimeDays: 3,
    warrantyMonths: 12,
    description: 'Отраслевой стандарт обратного проектирования: преобразование данных 3D-сканирования в параметрические CAD-модели с деревом построения.',
    isPopular: true,
    isActive: true,
    tags: ['Geomagic', 'Design X', 'CAD', 'Реверс']
  },
  {
    id: 'pi-sw-geomagic-control-x',
    sku: 'SW-GEO-CX',
    name: 'Geomagic Control X (профессиональный контроль геометрии)',
    category: 'software',
    categoryLabel: 'Программное обеспечение',
    subCategory: 'Метрологический контроль',
    manufacturer: 'Oqton / 3D Systems',
    unit: 'лиц.',
    costPriceRub: 1200000,
    priceRub: 1780000,
    partnerPriceRub: 1580000,
    vatRate: 22,
    maxDiscountPercent: 10,
    inStock: true,
    leadTimeDays: 3,
    warrantyMonths: 12,
    description: 'Программа бесконтактного контроля геометрии: сравнение с CAD, цветовые карты отклонений, отчеты по ГОСТ/ASME.',
    isActive: true,
    tags: ['Geomagic', 'Control X', 'Метрология', 'Контроль']
  },
  {
    id: 'pi-sw-topsolid-7-design',
    sku: 'SW-TS7-DES',
    name: 'TopSolid 7 Design Pro (CAD для машиностроения)',
    category: 'software',
    categoryLabel: 'Программное обеспечение',
    subCategory: 'CAD/CAM/PDM системы',
    manufacturer: 'TopSolid SAS (Франция)',
    unit: 'лиц.',
    costPriceRub: 750000,
    priceRub: 1150000,
    partnerPriceRub: 1020000,
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 3,
    warrantyMonths: 12,
    description: 'Интегрированная параметрическая CAD-система с встроенной PDM для сквозного проектирования штампов, пресс-форм и деталей.',
    isPopular: true,
    isActive: true,
    tags: ['TopSolid', 'CAD', 'PDM', 'Пресс-формы']
  },
  {
    id: 'pi-sw-topsolid-7-cam',
    sku: 'SW-TS7-CAM',
    name: 'TopSolid 7 Cam (фрезерование 3D + токарная обработка ЧПУ)',
    category: 'software',
    categoryLabel: 'Программное обеспечение',
    subCategory: 'CAD/CAM/PDM системы',
    manufacturer: 'TopSolid SAS (Франция)',
    unit: 'лиц.',
    costPriceRub: 980000,
    priceRub: 1480000,
    partnerPriceRub: 1320000,
    vatRate: 22,
    maxDiscountPercent: 12,
    inStock: true,
    leadTimeDays: 3,
    warrantyMonths: 12,
    description: 'CAM-система нового поколения для программирования станков с ЧПУ: фрезерная, токарно-фрезерная и многоосевая обработка с верификацией.',
    isPopular: true,
    isActive: true,
    tags: ['TopSolid', 'CAM', 'ЧПУ', 'Фрезерование']
  },
  {
    id: 'pi-sw-topsolid-7-cam-5axis',
    sku: 'SW-TS7-CAM5X',
    name: 'TopSolid 7 Cam 5-Axis (непрерывная 5-осевая ЧПУ обработка)',
    category: 'software',
    categoryLabel: 'Программное обеспечение',
    subCategory: 'CAD/CAM/PDM системы',
    manufacturer: 'TopSolid SAS (Франция)',
    unit: 'лиц.',
    costPriceRub: 1350000,
    priceRub: 1980000,
    partnerPriceRub: 1780000,
    vatRate: 22,
    maxDiscountPercent: 10,
    inStock: true,
    leadTimeDays: 3,
    warrantyMonths: 12,
    description: 'Модуль непрерывной 5-осевой обработки для сложных лопаток турбин, моноколес и пресс-форм с симуляцией кинематики станка.',
    isActive: true,
    tags: ['TopSolid', 'CAM 5X', '5-осевая обработка', 'ЧПУ']
  },
  {
    id: 'pi-sw-exmodel-pro',
    sku: 'SW-EXMODEL-PRO',
    name: 'EXModel Pro (ПО для быстрого CAD-моделирования по сканам)',
    category: 'software',
    categoryLabel: 'Программное обеспечение',
    subCategory: 'Обратный инжиниринг',
    manufacturer: 'Shining 3D',
    unit: 'лиц.',
    costPriceRub: 350000,
    priceRub: 520000,
    partnerPriceRub: 460000,
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 2,
    warrantyMonths: 12,
    description: 'Простое и мощное ПО для реверс-инжиниринга: конвертация полигональных сеток сканирования в твердотельные CAD-модели.',
    isActive: true,
    tags: ['EXModel', 'ПО', 'Shining 3D', 'Реверс']
  }
];

// Services positions
const servicesProducts: PriceItem[] = [
  {
    id: 'pi-srv-3d-scan-lab',
    sku: 'SRV-3D-SCAN-LAB',
    name: 'Прецизионное 3D-сканирование деталей в метрологической лаборатории',
    category: 'services',
    categoryLabel: 'Инжиниринговые услуги',
    subCategory: '3D-сканирование и метрология',
    manufacturer: 'ДС-Инжиниринг',
    unit: 'нормо-час',
    costPriceRub: 2200,
    priceRub: 4800,
    partnerPriceRub: 3900,
    vatRate: 22,
    maxDiscountPercent: 20,
    inStock: true,
    leadTimeDays: 2,
    warrantyMonths: 0,
    description: 'Высокоточное 3D-сканирование деталей и оснастки на оптических и лазерных сканерах ScanLine/Shining 3D с погрешностью от 0.015 мм.',
    isPopular: true,
    isActive: true,
    tags: ['Услуги', '3D-сканирование', 'Лаборатория', 'Контроль']
  },
  {
    id: 'pi-srv-onsite-measurement',
    sku: 'SRV-ONSITE-MEAS',
    name: 'Выездные координатные измерения КИМ типа «рука» и лазерным трекером',
    category: 'services',
    categoryLabel: 'Инжиниринговые услуги',
    subCategory: 'Выездные измерения',
    manufacturer: 'ДС-Инжиниринг',
    unit: 'смена',
    costPriceRub: 32000,
    priceRub: 68000,
    partnerPriceRub: 58000,
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 3,
    warrantyMonths: 0,
    description: 'Выезд мобильной метрологической группы на предприятие заказчика с портативной КИМ PMT GAMMA+ или лазерным трекером Leica AT960.',
    isPopular: true,
    isActive: true,
    tags: ['Выездные измерения', 'Трекер', 'КИМ-рука', 'ОТК']
  },
  {
    id: 'pi-srv-reverse-engineering',
    sku: 'SRV-REV-ENG',
    name: 'Обратный инжиниринг (построение параметрической CAD-модели)',
    category: 'services',
    categoryLabel: 'Инжиниринговые услуги',
    subCategory: 'Обратный инжиниринг',
    manufacturer: 'ДС-Инжиниринг',
    unit: 'нормо-час',
    costPriceRub: 2600,
    priceRub: 5500,
    partnerPriceRub: 4600,
    vatRate: 22,
    maxDiscountPercent: 20,
    inStock: true,
    leadTimeDays: 5,
    warrantyMonths: 0,
    description: 'Разработка твердотельных CAD-моделей в STEP/IGES/Parasolid и чертежей по ЕСКД на основе полигональных сеток сканирования деталей.',
    isPopular: true,
    isActive: true,
    tags: ['Реверс-инжиниринг', 'CAD-модель', 'ЕСКД', 'Чертежи']
  },
  {
    id: 'pi-srv-postprocessor-dev',
    sku: 'SRV-POSTPROC-DEV',
    name: 'Разработка и верификация постпроцессора для станков с ЧПУ',
    category: 'services',
    categoryLabel: 'Инжиниринговые услуги',
    subCategory: 'Разработка постпроцессоров',
    manufacturer: 'ДС-Инжиниринг',
    unit: 'компл.',
    costPriceRub: 85000,
    priceRub: 185000,
    partnerPriceRub: 155000,
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 14,
    warrantyMonths: 12,
    description: 'Разработка и внедрение индивидуального постпроцессора TopSolid Cam для 3–5 осевых станков ЧПУ (Siemens, Heidenhain, Fanuc, Haas).',
    isActive: true,
    tags: ['Постпроцессор', 'ЧПУ', 'TopSolid Cam', 'Внедрение']
  },
  {
    id: 'pi-srv-training-metrology',
    sku: 'SRV-TRAIN-METR',
    name: 'Курс обучения операторов КИМ и 3D-сканеров с выдачей свидетельства',
    category: 'services',
    categoryLabel: 'Инжиниринговые услуги',
    subCategory: 'Обучение персонала',
    manufacturer: 'ДС-Инжиниринг',
    unit: 'чел.',
    costPriceRub: 25000,
    priceRub: 60000,
    partnerPriceRub: 50000,
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 7,
    warrantyMonths: 0,
    description: 'Практический курс обучения работе с PolyWorks|Inspector, КИМ PMT и сканерами ScanLine на деталях заказчика (40 акад. часов).',
    isActive: true,
    tags: ['Обучение', 'PolyWorks', 'Оператор КИМ', 'Свидетельство']
  }
];

// Accessories products
const accessoriesProducts: PriceItem[] = [
  {
    id: 'pi-acc-renishaw-revo2',
    sku: 'ACC-REN-REVO2',
    name: '5-осевая сканирующая система Renishaw REVO-2',
    category: 'accessories',
    categoryLabel: 'Оснастка и щупы',
    subCategory: 'Измерительные системы Renishaw',
    manufacturer: 'Renishaw (Великобритания)',
    unit: 'компл.',
    costPriceRub: 5200000,
    priceRub: 7100000,
    partnerPriceRub: 6400000,
    vatRate: 22,
    maxDiscountPercent: 10,
    inStock: false,
    leadTimeDays: 30,
    warrantyMonths: 12,
    description: 'Флагманская 5-осевая измерительная система с технологией бесконтактного перемещения датчика для скоростного высокоточного сканирования.',
    isPopular: true,
    isActive: true,
    tags: ['Renishaw', 'REVO-2', '5 осей', 'КИМ']
  },
  {
    id: 'pi-acc-renishaw-ph20',
    sku: 'ACC-REN-PH20',
    name: '5-осевая сенсорная система Renishaw PH20',
    category: 'accessories',
    categoryLabel: 'Оснастка и щупы',
    subCategory: 'Измерительные системы Renishaw',
    manufacturer: 'Renishaw (Великобритания)',
    unit: 'компл.',
    costPriceRub: 2400000,
    priceRub: 3300000,
    partnerPriceRub: 2980000,
    vatRate: 22,
    maxDiscountPercent: 10,
    inStock: true,
    leadTimeDays: 14,
    warrantyMonths: 12,
    description: '5-осевая сенсорная головка для стационарных КИМ. Быстрое измерение под любым углом без калибровки каждого положения.',
    isActive: true,
    tags: ['Renishaw', 'PH20', 'Сенсорная головка', 'КИМ']
  },
  {
    id: 'pi-acc-renishaw-sp25m',
    sku: 'ACC-REN-SP25M',
    name: 'Компактный сканирующий датчик Renishaw SP25M',
    category: 'accessories',
    categoryLabel: 'Оснастка и щупы',
    subCategory: 'Датчики Renishaw',
    manufacturer: 'Renishaw (Великобритания)',
    unit: 'компл.',
    costPriceRub: 1400000,
    priceRub: 1950000,
    partnerPriceRub: 1750000,
    vatRate: 22,
    maxDiscountPercent: 10,
    inStock: true,
    leadTimeDays: 10,
    warrantyMonths: 12,
    description: 'Высокоточный непрерывный сканирующий датчик диаметром 25 мм для установки на поворотные головки PH10M Plus.',
    isActive: true,
    tags: ['Renishaw', 'SP25M', 'Сканирующий датчик']
  },
  {
    id: 'pi-acc-renishaw-stylus-kit',
    sku: 'ACC-REN-STYLUS-KIT',
    name: 'Метрологический комплект щупов и стилусов Renishaw M2/M3/M4 (рубиновые сферы)',
    category: 'accessories',
    categoryLabel: 'Оснастка и щупы',
    subCategory: 'Щупы и калибры',
    manufacturer: 'Renishaw (Великобритания)',
    unit: 'набор',
    costPriceRub: 180000,
    priceRub: 290000,
    partnerPriceRub: 250000,
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 5,
    warrantyMonths: 12,
    description: 'Набор прецизионных щупов из карбида вольфрама и углеволокна с рубиновыми шариками диаметром от 0.5 до 8.0 мм.',
    isPopular: true,
    isActive: true,
    tags: ['Renishaw', 'Щупы', 'Стилусы', 'Рубин']
  },
  {
    id: 'pi-acc-calib-sphere',
    sku: 'ACC-CALIB-SPHERE-25',
    name: 'Калибровочная сфера Ø 25.000 мм с сертификатом ВНИИМС',
    category: 'accessories',
    categoryLabel: 'Оснастка и щупы',
    subCategory: 'Калибровочные эталоны',
    manufacturer: 'ДС-Инжиниринг / ВНИИМС',
    unit: 'шт.',
    costPriceRub: 95000,
    priceRub: 165000,
    partnerPriceRub: 140000,
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 3,
    warrantyMonths: 24,
    description: 'Керамическая эталонная сфера класса точности Grade 5 с отклонением от сферичности не более 0.13 мкм и магнитным штативом.',
    isActive: true,
    tags: ['Калибровка', 'Сфера', 'ВНИИМС', 'КИМ']
  },
  {
    id: 'pi-acc-magnetic-targets',
    sku: 'ACC-SCAN-TARGETS-5000',
    name: 'Световозвращающие позиционные метки для 3D-сканеров Ø 6.0 мм (5000 шт)',
    category: 'accessories',
    categoryLabel: 'Оснастка и щупы',
    subCategory: 'Расходные материалы для 3D',
    manufacturer: 'ScanLine 3D',
    unit: 'упак.',
    costPriceRub: 18000,
    priceRub: 32000,
    partnerPriceRub: 26000,
    vatRate: 22,
    maxDiscountPercent: 20,
    inStock: true,
    leadTimeDays: 1,
    warrantyMonths: 6,
    description: 'Высококонтрастные круглые самоклеящиеся позиционные маркеры для оптических и лазерных 3D-сканеров ScanLine, Shining3D.',
    isActive: true,
    tags: ['Метки', 'Маркеры', '3D-сканирование']
  }
];

// Calibration & Non-core Services
const nonCoreProducts: PriceItem[] = [
  {
    id: 'pi-nc-cmm-calibration-arshin',
    sku: 'NC-SRV-CMM-CALIB',
    name: 'Периодическая поверка КИМ с внесением в ФГИС «АРШИН»',
    category: 'non_core_services',
    categoryLabel: 'Сервис и калибровка',
    subCategory: 'Метрологическая поверка',
    manufacturer: 'ДС-Инжиниринг / ФБУ ЦСМ',
    unit: 'усл.',
    costPriceRub: 65000,
    priceRub: 125000,
    partnerPriceRub: 105000,
    vatRate: 22,
    maxDiscountPercent: 10,
    inStock: true,
    leadTimeDays: 10,
    warrantyMonths: 12,
    description: 'Официальная периодическая поверка стационарных и мобильных КИМ по ГОСТ Р 8.763 с регистрацией свидетельства в реестре «АРШИН».',
    isPopular: true,
    isActive: true,
    tags: ['Поверка', 'АРШИН', 'КИМ', 'ЦСМ']
  },
  {
    id: 'pi-nc-interferometer-renishaw',
    sku: 'NC-SRV-LASER-CALIB',
    name: 'Лазерная калибровка геометрии осей станка/КИМ интерферометром Renishaw XL-80',
    category: 'non_core_services',
    categoryLabel: 'Сервис и калибровка',
    subCategory: 'Лазерная интерферометрия',
    manufacturer: 'ДС-Инжиниринг',
    unit: 'ось',
    costPriceRub: 35000,
    priceRub: 75000,
    partnerPriceRub: 62000,
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 5,
    warrantyMonths: 12,
    description: 'Прецизионное измерение линейного позиционирования, угловых отклонений (рыскание, тангаж) и компенсация погрешностей осей в ЧПУ.',
    isActive: true,
    tags: ['Интерферометр', 'XL-80', 'Renishaw', 'Калибровка']
  },
  {
    id: 'pi-nc-annual-maintenance',
    sku: 'NC-SRV-ANNUAL-TO',
    name: 'Годовое регламентное техническое обслуживание (ТО) измерительного комплекса КИМ',
    category: 'non_core_services',
    categoryLabel: 'Сервис и калибровка',
    subCategory: 'Сервисное обслуживание',
    manufacturer: 'ДС-Инжиниринг',
    unit: 'компл.',
    costPriceRub: 90000,
    priceRub: 180000,
    partnerPriceRub: 150000,
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 7,
    warrantyMonths: 12,
    description: 'Комплексный осмотр пневмосистемы, чистка гранитных направляющих, проверка оптических линеек, юстировка шарниров и замена фильтров.',
    isActive: true,
    tags: ['ТО', 'Регламент', 'Обслуживание', 'КИМ']
  }
];

const allCatalog: PriceItem[] = [
  ...hardwareProducts,
  ...softwareProducts,
  ...servicesProducts,
  ...accessoriesProducts,
  ...nonCoreProducts
];

console.log(`Summary:`);
console.log(` - Hardware from website: ${hardwareProducts.length}`);
console.log(` - Software: ${softwareProducts.length}`);
console.log(` - Services: ${servicesProducts.length}`);
console.log(` - Accessories: ${accessoriesProducts.length}`);
console.log(` - Non-core & Calibration: ${nonCoreProducts.length}`);
console.log(` - Total items: ${allCatalog.length}`);

// Write data/price_items.json
fs.writeFileSync(priceItemsJsonPath, JSON.stringify(allCatalog, null, 2), 'utf8');
console.log(`Wrote ${allCatalog.length} items to ${priceItemsJsonPath}`);

// Update INDUSTRIAL_PRICE_LIST in src/data/priceListsData.ts
let content = fs.readFileSync(priceListsDataPath, 'utf8');
const marker = 'export const INDUSTRIAL_PRICE_LIST: PriceItem[] = [';
const idx = content.indexOf(marker);
if (idx >= 0) {
  const before = content.slice(0, idx);
  const newArray = JSON.stringify(allCatalog, null, 2);
  const updatedContent = `${before}export const INDUSTRIAL_PRICE_LIST: PriceItem[] = ${newArray};\n`;
  fs.writeFileSync(priceListsDataPath, updatedContent, 'utf8');
  console.log(`Wrote ${allCatalog.length} items to ${priceListsDataPath}`);
} else {
  console.error(`Marker ${marker} not found!`);
}
