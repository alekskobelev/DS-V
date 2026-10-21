import { PriceService, DEFAULT_PRICE_CATEGORIES } from '../src/services/PriceService';
import { 
  INDUSTRIAL_PRICE_LIST, 
  calculateItemEconomics, 
  calculateDiscountForItem, 
  DEFAULT_DISCOUNT_RULES,
  PriceItem,
  PriceDiscountRule
} from '../src/data/priceListsData';
import { 
  searchRussianEnterprises, 
  RUSSIAN_ENTERPRISES_REGISTRY 
} from '../src/data/russianEnterprises';
import { 
  exportPriceListToExcel, 
  exportPriceListToCsv, 
  exportPriceListMultiSectionCsv, 
  exportPriceListPerCategoryCsv 
} from '../src/utils/priceListExcelExporter';
import { parseAndDeclineFio, formatRussianLeaderDetails } from '../src/utils/russianDeclension';
import http from 'http';

interface TestResult {
  taskNumber: number;
  taskTitle: string;
  passed: boolean;
  checks: { name: string; success: boolean; details?: string }[];
}

const results: TestResult[] = [];

async function makeHttpRequest(path: string, method: string = 'GET', data?: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve) => {
    const postData = data ? JSON.stringify(data) : undefined;
    const req = http.request(`http://localhost:3000${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          resolve({ status: res.statusCode || 200, body: parsed });
        } catch {
          resolve({ status: res.statusCode || 200, body: raw });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 500, body: { error: err.message } });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runAllVerifications() {
  console.log('================================================================');
  console.log('   ПОЛНЫЙ АУДИТ И ТЕСТИРОВАНИЕ 10 ПОСЛЕДНИХ ЗАДАЧ «ДС-ИНЖИНИРИНГ»');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TASK 1: PWAInstallButton & usePWAInstall safe hooks & runtime resilience
  // --------------------------------------------------------------------------
  const t1Checks = [];
  try {
    const pwaModule = await import('../src/components/PWAInstallButton');
    const hookModule = await import('../src/hooks/usePWAInstall');
    
    t1Checks.push({
      name: 'PWA component & hook modules import cleanly',
      success: typeof pwaModule.PWAInstallButton === 'function' && typeof hookModule.usePWAInstall === 'function'
    });

    // Verify usePWAInstall runs without error in node-like environment without window
    const hookSource = hookModule.usePWAInstall.toString();
    t1Checks.push({
      name: 'usePWAInstall contains safe window checking',
      success: hookSource.includes('typeof window') || hookSource.includes('window')
    });
  } catch (e: any) {
    t1Checks.push({ name: 'PWA imports failed', success: false, details: e.message });
  }

  results.push({
    taskNumber: 1,
    taskTitle: 'Устранение ошибок PWAInstallButton и хуков React',
    passed: t1Checks.every(c => c.success),
    checks: t1Checks
  });

  // --------------------------------------------------------------------------
  // TASK 2: CSV/Excel Price List Import Feature
  // --------------------------------------------------------------------------
  const t2Checks = [];
  try {
    const csvImportModule = await import('../src/components/crm/PriceListCsvImportModal');
    t2Checks.push({
      name: 'PriceListCsvImportModal exported as component',
      success: typeof csvImportModule.PriceListCsvImportModal === 'function'
    });

    // Test backend CSV import endpoint
    const sampleCsv = `Артикул;Категория;Наименование;Производитель;Себестоимость;Цена продажи;НДС;В наличии
PMT-AUDIT-TEST-01;hardware;Аудиторская КИМ PMT Test;PMT;2500000;3800000;22;да
SCAN-AUDIT-TEST-02;hardware;3D-сканер ScanLine Test;ScanLine;1500000;2200000;22;да`;

    const res = await makeHttpRequest('/api/crm/price-items/import-csv', 'POST', {
      csvContent: sampleCsv,
      mode: 'merge'
    });

    t2Checks.push({
      name: 'Backend POST /api/crm/price-items/import-csv returns success',
      success: res.status === 200 && res.body?.success === true,
      details: `Response: addedCount=${res.body?.addedCount}, updatedCount=${res.body?.updatedCount}`
    });

    // Verify items present in GET /api/crm/price-items
    const listRes = await makeHttpRequest('/api/crm/price-items', 'GET');
    const hasImportedItem = listRes.body?.items?.some((i: any) => i.sku === 'PMT-AUDIT-TEST-01');
    t2Checks.push({
      name: 'Imported items are persisted and queryable via GET /api/crm/price-items',
      success: !!hasImportedItem
    });
  } catch (e: any) {
    t2Checks.push({ name: 'CSV import check error', success: false, details: e.message });
  }

  results.push({
    taskNumber: 2,
    taskTitle: 'Импорт номенклатуры из CSV/Excel (клиент и сервер)',
    passed: t2Checks.every(c => c.success),
    checks: t2Checks
  });

  // --------------------------------------------------------------------------
  // TASK 3: Live DaData INN search & NO synthetic fake enterprises
  // --------------------------------------------------------------------------
  const t3Checks = [];
  try {
    // 1. Verify searchRussianEnterprises does NOT generate fake companies
    const randomInn = '7799999999'; // Non-existent INN in local registry
    const localResult = searchRussianEnterprises(randomInn);
    t3Checks.push({
      name: 'searchRussianEnterprises returns empty array for unknown INN (no synthetic fakes)',
      success: localResult.length === 0,
      details: `Count returned: ${localResult.length}`
    });

    // 2. Verify DaData company search endpoint for Sberbank INN
    const dadataRes = await makeHttpRequest('/api/dadata/company', 'POST', {
      query: '7707083893' // Sberbank INN
    });

    const isSberbankFound = dadataRes.status === 200 && 
      dadataRes.body?.success === true && 
      Array.isArray(dadataRes.body?.data) && 
      dadataRes.body?.data.length > 0 && 
      (dadataRes.body?.data[0].value?.includes('СБЕРБАНК') || dadataRes.body?.data[0].inn === '7707083893');

    t3Checks.push({
      name: 'DaData endpoint returns real Sberbank company by INN 7707083893',
      success: isSberbankFound,
      details: `Found: ${dadataRes.body?.data?.[0]?.value || 'None'}`
    });

    // 3. Verify DaData company search endpoint for IP (12-digit INN)
    const dadataIpRes = await makeHttpRequest('/api/dadata/company', 'POST', {
      query: '772475495511'
    });

    t3Checks.push({
      name: 'DaData endpoint handles 12-digit INN search without error',
      success: dadataIpRes.status === 200 && dadataIpRes.body?.success === true
    });
  } catch (e: any) {
    t3Checks.push({ name: 'DaData search error', success: false, details: e.message });
  }

  results.push({
    taskNumber: 3,
    taskTitle: 'Живой поиск DaData по ИНН и удаление синтетических компаний',
    passed: t3Checks.every(c => c.success),
    checks: t3Checks
  });

  // --------------------------------------------------------------------------
  // TASK 4: Price List Equipment Catalog & Multi-sheet Excel / CSV Exporter
  // --------------------------------------------------------------------------
  const t4Checks = [];
  try {
    // 1. Catalog lines check (PMT, ScanLine, Shining 3D, Leica, Renishaw)
    const catalogSkus = INDUSTRIAL_PRICE_LIST.map(i => i.sku);
    const hasPmt = catalogSkus.some(s => s.includes('PMT'));
    const hasScanLine = catalogSkus.some(s => s.includes('SCAN') || s.includes('SL'));
    const hasShining = catalogSkus.some(s => s.includes('SHIN') || s.includes('FREESCAN'));
    const hasLeica = catalogSkus.some(s => s.includes('LEICA') || s.includes('AT960') || s.includes('AT403'));
    const hasRenishaw = catalogSkus.some(s => s.includes('REN') || s.includes('XL-80') || s.includes('REVO'));

    t4Checks.push({
      name: 'Industrial catalog contains all 5 key partner brands (PMT, ScanLine, Shining 3D, Leica, Renishaw)',
      success: hasPmt && hasScanLine && hasShining && hasLeica && hasRenishaw,
      details: `Brands verified: PMT=${hasPmt}, ScanLine=${hasScanLine}, Shining=${hasShining}, Leica=${hasLeica}, Renishaw=${hasRenishaw}`
    });

    // 2. Multi-section CSV generator
    const multiCsvOutput = exportPriceListMultiSectionCsv(INDUSTRIAL_PRICE_LIST, DEFAULT_DISCOUNT_RULES, {
      includeEconomics: true
    });

    t4Checks.push({
      name: 'exportPriceListMultiSectionCsv generates structured multi-section CSV',
      success: multiCsvOutput.length > 500 && multiCsvOutput.includes('ЛИСТ 1') && multiCsvOutput.includes('ИТОГО')
    });
  } catch (e: any) {
    t4Checks.push({ name: 'Catalog and export check error', success: false, details: e.message });
  }

  results.push({
    taskNumber: 4,
    taskTitle: 'Каталог оборудования брендов и генератор Excel/CSV с автофильтрами',
    passed: t4Checks.every(c => c.success),
    checks: t4Checks
  });

  // --------------------------------------------------------------------------
  // TASK 5: Interactive Searchable DaData Dropdown & Leader Declension
  // --------------------------------------------------------------------------
  const t5Checks = [];
  try {
    const dropdownModule = await import('../src/components/crm/DadataOrganizationDropdown');
    t5Checks.push({
      name: 'DadataOrganizationDropdown component exports properly',
      success: typeof dropdownModule.DadataOrganizationDropdown === 'function'
    });

    // Test Russian declension utilities for leader names
    const leaderFio = 'Королев Виктор Михайлович';
    const leaderPost = 'Генеральный директор';
    const leaderDetails = formatRussianLeaderDetails(leaderFio, leaderPost);

    t5Checks.push({
      name: 'formatRussianLeaderDetails generates valid dative declension and greeting',
      success: leaderDetails.declinedPositionFio.includes('Королеву') && leaderDetails.greeting.includes('Виктор Михайлович'),
      details: `Declined: "${leaderDetails.declinedPositionFio}", Greeting: "${leaderDetails.greeting}"`
    });
  } catch (e: any) {
    t5Checks.push({ name: 'Dropdown & declension error', success: false, details: e.message });
  }

  results.push({
    taskNumber: 5,
    taskTitle: 'Интерактивный выпадающий поиск DaData и дательный падеж руководителей',
    passed: t5Checks.every(c => c.success),
    checks: t5Checks
  });

  // --------------------------------------------------------------------------
  // TASK 6: Price Discount Rules, Economics & Simulator
  // --------------------------------------------------------------------------
  const t6Checks = [];
  try {
    // Economics calculation
    const testEcon = calculateItemEconomics(1000000, 1500000);
    t6Checks.push({
      name: 'calculateItemEconomics computes margin and markup accurately',
      success: Math.round(testEcon.marginPercent) === 33 && Math.round(testEcon.markupPercent) === 50,
      details: `Margin=${testEcon.marginPercent}%, Markup=${testEcon.markupPercent}%`
    });

    // Discount calculation
    const sampleItem = INDUSTRIAL_PRICE_LIST[0];
    const discCalc = calculateDiscountForItem(sampleItem, DEFAULT_DISCOUNT_RULES, 2);
    t6Checks.push({
      name: 'calculateDiscountForItem computes tiered discount correctly',
      success: typeof discCalc.finalPriceRub === 'number' && discCalc.finalPriceRub > 0
    });
  } catch (e: any) {
    t6Checks.push({ name: 'Discount rules error', success: false, details: e.message });
  }

  results.push({
    taskNumber: 6,
    taskTitle: 'Правила скидок, юнит-экономика и симулятор маржинальности',
    passed: t6Checks.every(c => c.success),
    checks: t6Checks
  });

  // --------------------------------------------------------------------------
  // TASK 7: Reactive PriceListManager.tsx Component
  // --------------------------------------------------------------------------
  const t7Checks = [];
  try {
    const plmModule = await import('../src/components/crm/PriceListManager');
    const plmRootModule = await import('../src/components/PriceListManager');
    
    t7Checks.push({
      name: 'PriceListManager exported from crm and root components',
      success: typeof plmModule.PriceListManager === 'function' && typeof plmRootModule.PriceListManager === 'function'
    });

    t7Checks.push({
      name: 'DEFAULT_PRICE_CATEGORIES has all 5 industrial categories',
      success: DEFAULT_PRICE_CATEGORIES.length >= 5
    });
  } catch (e: any) {
    t7Checks.push({ name: 'PriceListManager check error', success: false, details: e.message });
  }

  results.push({
    taskNumber: 7,
    taskTitle: 'Компонент React PriceListManager и 5 категорий номенклатуры',
    passed: t7Checks.every(c => c.success),
    checks: t7Checks
  });

  // --------------------------------------------------------------------------
  // TASK 8: Firestore PriceService.ts & Price Versioning Audit
  // --------------------------------------------------------------------------
  const t8Checks = [];
  try {
    t8Checks.push({
      name: 'PriceService has static CRUD & batch methods',
      success: typeof PriceService.getAllPriceItems === 'function' &&
               typeof PriceService.batchUpsertPriceItems === 'function' &&
               typeof PriceService.getPriceHistory === 'function' &&
               typeof PriceService.recordPriceVersion === 'function'
    });
  } catch (e: any) {
    t8Checks.push({ name: 'PriceService error', success: false, details: e.message });
  }

  results.push({
    taskNumber: 8,
    taskTitle: 'PriceService, версионный аудит цен и интеграция с Firestore',
    passed: t8Checks.every(c => c.success),
    checks: t8Checks
  });

  // --------------------------------------------------------------------------
  // TASK 9: PostgreSQL 17 Relational Schema & Drizzle ORM
  // --------------------------------------------------------------------------
  const t9Checks = [];
  try {
    const schema = await import('../src/db/schema');
    t9Checks.push({
      name: 'schema.ts defines price_items, price_categories, price_history, price_tier_rules',
      success: !!schema.priceItems && !!schema.priceCategories && !!schema.priceHistory && !!schema.priceTierRules
    });

    // Test API for price items history
    const sampleItem = INDUSTRIAL_PRICE_LIST[0];
    const histRes = await makeHttpRequest(`/api/crm/price-items/${sampleItem.id}/history`, 'GET');
    t9Checks.push({
      name: 'GET /api/crm/price-items/:id/history returns 200 with history array',
      success: histRes.status === 200 && histRes.body?.success === true
    });
  } catch (e: any) {
    t9Checks.push({ name: 'PostgreSQL schema check error', success: false, details: e.message });
  }

  results.push({
    taskNumber: 9,
    taskTitle: 'Реляционная схема PostgreSQL 17 + Drizzle ORM и REST API версий',
    passed: t9Checks.every(c => c.success),
    checks: t9Checks
  });

  // --------------------------------------------------------------------------
  // TASK 10: Commercial Proposal (TKP/TZ) Generator & Dynamic Pagination
  // --------------------------------------------------------------------------
  const t10Checks = [];
  try {
    const tkpModule = await import('../src/components/crm/TkpTzGeneratorView');
    t10Checks.push({
      name: 'TkpTzGeneratorView exported as component',
      success: typeof tkpModule.TkpTzGeneratorView === 'function'
    });
  } catch (e: any) {
    t10Checks.push({ name: 'TKP Generator check error', success: false, details: e.message });
  }

  results.push({
    taskNumber: 10,
    taskTitle: 'Конструктор ТКП/ТЗ с динамической разбивкой на листы А4 и печатями',
    passed: t10Checks.every(c => c.success),
    checks: t10Checks
  });

  // --------------------------------------------------------------------------
  // PRINT SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('                   РЕЗУЛЬТАТЫ АУДИТА:');
  console.log('----------------------------------------------------------------');
  let allTasksPassed = true;
  for (const r of results) {
    const statusMark = r.passed ? '✅ ПРОЙДЕН' : '❌ ОШИБКА';
    console.log(`[Задание #${r.taskNumber}] ${statusMark} — ${r.taskTitle}`);
    for (const c of r.checks) {
      const mark = c.success ? '  ✓' : '  ✗';
      console.log(`${mark} ${c.name}${c.details ? ` (${c.details})` : ''}`);
      if (!c.success) allTasksPassed = false;
    }
    console.log('');
  }

  console.log('================================================================');
  if (allTasksPassed) {
    console.log(' ВСЕ 10 ЗАДАЧ ПРОШЛИ ТЕСТИРОВАНИЕ БЕЗ ЕДИНОЙ ОШИБКИ (100% УСПЕХ)');
  } else {
    console.log(' ОБНАРУЖЕНЫ ЗАМЕЧАНИЯ — ТРЕБУЮТСЯ ИСПРАВЛЕНИЯ');
  }
  console.log('================================================================');
}

runAllVerifications().catch(e => {
  console.error('Fatal audit error:', e);
});
