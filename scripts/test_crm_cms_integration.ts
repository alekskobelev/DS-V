/**
 * Automated Integration Test Suite: CRM & CMS Database & API Interaction
 * Tests end-to-end data flows, CRUD, cross-module synchronization, CSRF, and validation.
 * Run with: npx tsx scripts/test_crm_cms_integration.ts
 */

const BASE_URL = 'http://localhost:3000';

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
}

const stats: TestStats = {
  total: 0,
  passed: 0,
  failed: 0,
  durationMs: 0,
};

// ANSI color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let csrfToken = '';

async function runAssertion(testName: string, fn: () => Promise<void>) {
  stats.total++;
  const start = Date.now();
  try {
    await fn();
    const elapsed = Date.now() - start;
    stats.passed++;
    console.log(`  ${GREEN}✓${RESET} ${testName} ${CYAN}(${elapsed}ms)${RESET}`);
  } catch (err: any) {
    const elapsed = Date.now() - start;
    stats.failed++;
    console.error(`  ${RED}✗ ${testName} (${elapsed}ms)${RESET}`);
    console.error(`    ${RED}Ошибка:${RESET} ${err.message || err}`);
  }
}

async function getCsrf(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/csrf-token`);
  if (!res.ok) throw new Error(`Failed to fetch CSRF token: status ${res.status}`);
  const data = await res.json();
  return data.csrfToken;
}

let currentTestIp = '127.0.0.100';

function setTestIp(ip: string) {
  currentTestIp = ip;
}

async function request(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('x-forwarded-for', currentTestIp);
  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
    headers.set('X-CSRF-Token', csrfToken);
  }
  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}

// Track IDs for teardown cleanup
const cleanup = {
  companyId: '',
  contactId: '',
  dealId: '',
  taskId: '',
  proposalId: '',
  contractId: '',
  licenseId: '',
  ticketId: '',
  serviceRequestId: '',
  pageSlug: '',
};

async function main() {
  const startTime = Date.now();
  console.log(`\n${BOLD}======================================================================${RESET}`);
  console.log(`${BOLD}🚀 КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ ВЗАИМОДЕЙСТВИЯ БАЗ ДАННЫХ CRM И CMS${RESET}`);
  console.log(`${BOLD}   Портал «ДС-Инжиниринг» (http://localhost:3000)${RESET}`);
  console.log(`${BOLD}======================================================================${RESET}\n`);

  // --------------------------------------------------------------------------
  // 1. СИСТЕМНОЕ ЗДОРОВЬЕ И БЕЗОПАСНОСТЬ (Health, CSRF)
  // --------------------------------------------------------------------------
  setTestIp('127.0.0.101');
  console.log(`${BOLD}1. Мониторинг бэкенда и безопасность (Health & Security)${RESET}`);

  await runAssertion('REST API доступен и возвращает статус "ok" (/api/health)', async () => {
    const res = await request('/api/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (body.status !== 'ok') throw new Error(`Неверный статус: ${JSON.stringify(body)}`);
  });

  await runAssertion('Проверка статуса подключения базы данных (/api/db-health)', async () => {
    const res = await request('/api/db-health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (body.db_connected === undefined && !body.mode) {
      throw new Error(`Некорректная структура ответа db-health: ${JSON.stringify(body)}`);
    }
  });

  await runAssertion('Генерация и валидация CSRF-токена безопасности (/api/csrf-token)', async () => {
    csrfToken = await getCsrf();
    if (!csrfToken || csrfToken.length < 32) {
      throw new Error(`Невалидный CSRF токен: ${csrfToken}`);
    }
  });

  await runAssertion('Защита от CSRF: отклонение POST-запроса без токена (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/api/service-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test Hacker',
        email: 'hacker@test.ru',
        phone: '+79991112233',
        serviceType: 'reverse_engineering'
      })
    });
    if (res.status !== 403) {
      throw new Error(`Ожидался статус 403, получен ${res.status}`);
    }
    const data = await res.json();
    if (!data.requiresCsrfToken) {
      throw new Error(`Ответ не содержит requiresCsrfToken`);
    }
  });

  // --------------------------------------------------------------------------
  // 2. БАЗА ДАННЫХ И ХРАНИЛИЩЕ CMS (CMS Content & State)
  // --------------------------------------------------------------------------
  setTestIp('127.0.0.102');
  console.log(`\n${BOLD}2. База данных и хранилище CMS (Content Management System)${RESET}`);

  await runAssertion('Получение глобального состояния CMS (/api/cms/state)', async () => {
    const res = await request('/api/cms/state');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (!body.success) throw new Error(`Успешный ответ не получен: ${JSON.stringify(body)}`);
  });

  await runAssertion('Чтение и обновление динамических данных CMS (/api/cms/store/:key)', async () => {
    const testKey = 'test_integration_meta';
    const testPayload = {
      timestamp: Date.now(),
      bannerText: 'Инженерный центр метрологии и 3D-контроля ДС-Инжиниринг',
      activeStatus: true,
    };

    // Запись
    const postRes = await request(`/api/cms/store/${testKey}`, {
      method: 'POST',
      body: JSON.stringify(testPayload),
    });
    if (!postRes.ok) throw new Error(`POST HTTP ${postRes.status}`);

    // Чтение
    const getRes = await request(`/api/cms/store/${testKey}`);
    if (!getRes.ok) throw new Error(`GET HTTP ${getRes.status}`);
    const getBody = await getRes.json();
    if (getBody.bannerText !== testPayload.bannerText) {
      throw new Error(`Несоответствие данных: ${JSON.stringify(getBody)}`);
    }
  });

  await runAssertion('Создание и чтение динамической страницы CMS (/api/cms/pages)', async () => {
    cleanup.pageSlug = `/services/test-metrology-audit-${Date.now()}`;
    const newPage = {
      slug: cleanup.pageSlug,
      title: 'Аудит метрологических лабораторий и КИМ',
      seoMetadata: {
        title: 'Метрологический аудит производств | ДС-Инжиниринг',
        description: 'Комплексный аудит измерительного оборудования и поверка по ГОСТ Р 8.568.',
        keywords: ['метрология', 'аудит', 'КИМ', 'ГОСТ'],
      },
      layoutConfig: [
        { type: 'hero', title: 'Метрологический аудит' },
        { type: 'features', items: ['Калибровка', 'Аттестация', 'Обучение'] },
      ],
      isPublished: true,
    };

    const postRes = await request('/api/cms/pages', {
      method: 'POST',
      body: JSON.stringify(newPage),
    });
    if (!postRes.ok) throw new Error(`POST HTTP ${postRes.status}`);
    const postBody = await postRes.json();
    if (!postBody.success) throw new Error(`Не удалось создать страницу: ${JSON.stringify(postBody)}`);

    const getRes = await request('/api/cms/pages');
    if (!getRes.ok) throw new Error(`GET HTTP ${getRes.status}`);
    const getBody = await getRes.json();
    const found = (getBody.data || []).some((p: any) => p.slug === cleanup.pageSlug);
    if (!found) throw new Error(`Созданная страница ${cleanup.pageSlug} не найдена в списке`);
  });

  await runAssertion('Каталог оборудования CMS: чтение и добавление модели (/api/equipment)', async () => {
    const testModel = {
      slug: `pmt-test-arm-${Date.now()}`,
      name: 'PMT Alpha Arm 7-Axis 3.0m Test Model',
      manufacturer: 'PMT (Precision Metrology Tools)',
      category: 'coordinate_measuring_machines',
      specifications: { accuracy: '0.015 мм', range: '3000 мм', axes: 7 },
      description: 'Портативная измерительная рука с лазерным сканером для цехового контроля.',
    };

    const postRes = await request('/api/equipment', {
      method: 'POST',
      body: JSON.stringify(testModel),
    });
    if (!postRes.ok) throw new Error(`POST HTTP ${postRes.status}`);

    const getRes = await request('/api/equipment');
    if (!getRes.ok) throw new Error(`GET HTTP ${getRes.status}`);
    const getBody = await getRes.json();
    const list = getBody.data || [];
    if (!list.some((item: any) => item.slug === testModel.slug)) {
      throw new Error(`Добавленная модель ${testModel.slug} не найдена в каталоге оборудования`);
    }
  });

  // --------------------------------------------------------------------------
  // 3. БАЗА ДАННЫХ И СУЩНОСТИ CRM (CRM Core Entities)
  // --------------------------------------------------------------------------
  setTestIp('127.0.0.103');
  console.log(`\n${BOLD}3. База данных CRM: контрагенты, контакты, сделки и задачи${RESET}`);

  await runAssertion('CRM Компании: создание контрагента (/api/crm/companies)', async () => {
    cleanup.companyId = `comp-test-${Date.now()}`;
    const newCompany = {
      id: cleanup.companyId,
      name: 'АО «Авиадвигатель-Тест»',
      inn: '7709876543',
      kpp: '770901001',
      industry: 'Авиастроение',
      city: 'Москва',
      address: 'ул. Авиаконструктора Миля, д. 12',
      status: 'active',
      phone: '+7 (495) 777-88-99',
      email: 'info@aviadvigatel-test.ru',
      contactPerson: 'Смирнов Дмитрий Иванович',
      assignedEquipment: [
        { name: 'PMT Alpha Arm 3.0m', serial: 'PMT-7A-2026-99', type: 'КИМ' }
      ],
      notes: 'Ключевой заказчик по сервисному обслуживанию и внедрению TopSolid',
    };

    const res = await request('/api/crm/companies', {
      method: 'POST',
      body: JSON.stringify(newCompany),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (!body.success) throw new Error(`Ошибка создания компании: ${JSON.stringify(body)}`);
  });

  await runAssertion('CRM Компании: фильтрация и поиск (/api/crm/companies?search=Авиадвигатель)', async () => {
    const res = await request('/api/crm/companies?search=Авиадвигатель');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const items = body.data || [];
    if (!items.some((c: any) => c.id === cleanup.companyId)) {
      throw new Error(`Компания с ID ${cleanup.companyId} не найдена через поиск`);
    }
  });

  await runAssertion('CRM Контакты: создание контактного лица и привязка к компании (/api/crm/contacts)', async () => {
    cleanup.contactId = `cont-test-${Date.now()}`;
    const newContact = {
      id: cleanup.contactId,
      companyId: cleanup.companyId,
      companyName: 'АО «Авиадвигатель-Тест»',
      fullName: 'Смирнов Дмитрий Иванович',
      position: 'Главный метролог',
      department: 'Отдел главного метролога (ОГМ)',
      workPhone: '+7 (495) 777-88-99',
      mobilePhone: '+7 (916) 123-45-67',
      email: 'd.smirnov@aviadvigatel-test.ru',
      isDecisionMaker: true,
      notes: 'Отвечает за аттестацию КИМ и закупку координатно-измерительного софта',
    };

    const res = await request('/api/crm/contacts', {
      method: 'POST',
      body: JSON.stringify(newContact),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (!body.success) throw new Error(`Ошибка создания контакта: ${JSON.stringify(body)}`);
  });

  await runAssertion('CRM Сделки: создание комплексной сделки (/api/crm/deals)', async () => {
    cleanup.dealId = `deal-test-${Date.now()}`;
    const newDeal = {
      id: cleanup.dealId,
      customerName: 'Смирнов Дмитрий Иванович',
      companyName: 'АО «Авиадвигатель-Тест»',
      inn: '7709876543',
      phone: '+7 (916) 123-45-67',
      email: 'd.smirnov@aviadvigatel-test.ru',
      funnel: 'complex_b2b',
      stage: 'qualification',
      serviceType: 'Комплексная поставка КИМ + САПР TopSolid 7',
      details: 'Поставка измерительной руки PMT и 3 лицензий TopSolid CAM 5-Axis с разработкой постпроцессора',
      estimatedPrice: 7200000,
      cadFormat: 'STEP, IGES, TopSolid native',
      responsibleManager: 'Некрасов С.Ю.',
    };

    const res = await request('/api/crm/deals', {
      method: 'POST',
      body: JSON.stringify(newDeal),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (!body.success) throw new Error(`Ошибка создания сделки: ${JSON.stringify(body)}`);
  });

  await runAssertion('CRM Сделки: продвижение по стадиям воронки (/api/crm/deals/:id)', async () => {
    const res = await request(`/api/crm/deals/${cleanup.dealId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        stage: 'proposal_sent',
        estimatedPrice: 7450000,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (!body.success) throw new Error(`Ошибка обновления стадии сделки: ${JSON.stringify(body)}`);
    if (body.data?.stage !== 'proposal_sent') {
      throw new Error(`Стадия сделки не обновилась: ${body.data?.stage}`);
    }
  });

  await runAssertion('CRM Задачи: создание персональной задачи инженера с чек-листом (/api/crm/tasks)', async () => {
    cleanup.taskId = `task-test-${Date.now()}`;
    const newTask = {
      id: cleanup.taskId,
      title: 'Подготовка ТЗ на постпроцессор TopSolid для станка DMU 50',
      description: 'Согласовать кинематическую схему и плоскости безопасности с ОГТ заказчика',
      dueDate: '2026-09-15',
      dueTime: '16:00',
      priority: 'urgent',
      status: 'in_progress',
      managerId: 'adm-01',
      managerName: 'Некрасов С.Ю.',
      companyId: cleanup.companyId,
      dealId: cleanup.dealId,
      checklist: [
        { id: 'chk-1', text: 'Получить 3D модель шпиндельной бабки', completed: true },
        { id: 'chk-2', text: 'Проверить таблицу смены инструмента', completed: false }
      ]
    };

    const res = await request('/api/crm/tasks', {
      method: 'POST',
      body: JSON.stringify(newTask),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (!body.success) throw new Error(`Ошибка создания задачи: ${JSON.stringify(body)}`);
  });

  // --------------------------------------------------------------------------
  // 4. ДОКУМЕНТООБОРОТ И ЛИЦЕНЗИИ CRM (Documents & Licenses)
  // --------------------------------------------------------------------------
  setTestIp('127.0.0.104');
  console.log(`\n${BOLD}4. Документооборот, лицензирование и коммерческие предложения CRM${RESET}`);

  await runAssertion('CRM Коммерческие предложения: генерация КП (/api/crm/proposals)', async () => {
    cleanup.proposalId = `prop-test-${Date.now()}`;
    const newProposal = {
      id: cleanup.proposalId,
      outgoingNumber: `КП-ДС-2026/${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString(),
      toCompany: 'АО «Авиадвигатель-Тест»',
      content: 'Коммерческое предложение на поставку КИМ PMT Alpha Arm и ПО TopSolid 7 Design & Cam',
      preparedBy: 'Некрасов С.Ю.',
      dealId: cleanup.dealId,
      amount: 7450000,
      contactPerson: 'Смирнов Д.И.',
      contactPhone: '+7 (916) 123-45-67',
    };

    const res = await request('/api/crm/proposals', {
      method: 'POST',
      body: JSON.stringify(newProposal),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (!body.success) throw new Error(`Ошибка сохранения КП: ${JSON.stringify(body)}`);
  });

  await runAssertion('CRM Договоры: регистрация проекта и договора (/api/crm/contracts)', async () => {
    cleanup.contractId = `contr-test-${Date.now()}`;
    const newContract = {
      id: cleanup.contractId,
      number: `ДС-Д-2026-${Math.floor(Math.random() * 1000)}`,
      title: 'Договор поставки измерительного комплекса и внедрения САПР',
      company: 'АО «Авиадвигатель-Тест»',
      date: new Date().toISOString(),
      status: 'active',
      statusColor: 'green',
      curator: 'Некрасов С.Ю.',
      curatorPhone: '+7 (800) 555-35-35',
    };

    const res = await request('/api/crm/contracts', {
      method: 'POST',
      body: JSON.stringify(newContract),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (!body.success) throw new Error(`Ошибка регистрации договора: ${JSON.stringify(body)}`);
  });

  await runAssertion('CRM Лицензии: привязка лицензии TopSolid 7 к заказчику (/api/crm/licenses)', async () => {
    cleanup.licenseId = `lic-test-${Date.now()}`;
    const newLicense = {
      id: cleanup.licenseId,
      title: 'TopSolid 7 Cam 5-Axis Pro Network',
      productName: 'TopSolid 7 CAM',
      type: 'Сетевая плавающая',
      status: 'Активна',
      company: 'АО «Авиадвигатель-Тест»',
      haspId: 'HASP-98421-NET',
      seatsCount: '3',
      licenseServer: 'lic.aviadvigatel-test.corp:1947',
      hardwareModel: 'PMT Alpha Arm 3.0m',
      version: '7.18 SP2',
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const res = await request('/api/crm/licenses', {
      method: 'POST',
      body: JSON.stringify(newLicense),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (!body.success) throw new Error(`Ошибка регистрации лицензии: ${JSON.stringify(body)}`);
  });

  await runAssertion('CRM Сертификаты: выдача свидетельства об обучении оператора КИМ (/api/crm/certificates)', async () => {
    const certPayload = {
      id: `cert-test-${Date.now()}`,
      certificateNumber: `2026-${Math.floor(Math.random() * 900000 + 100000)}`,
      date: new Date().toISOString(),
      traineeName: 'Иванов Алексей Петрович',
      customer: 'АО «Авиадвигатель-Тест»',
      instructor: 'Некрасов С.Ю.',
      files: [],
    };

    const postRes = await request('/api/crm/certificates', {
      method: 'POST',
      body: JSON.stringify(certPayload),
    });
    if (!postRes.ok) throw new Error(`POST /api/crm/certificates HTTP ${postRes.status}`);

    const getRes = await request('/api/crm/certificates');
    if (!getRes.ok) throw new Error(`GET /api/crm/certificates HTTP ${getRes.status}`);
    const getBody = await getRes.json();
    const found = (getBody.data || []).some((c: any) => c.traineeName === certPayload.traineeName);
    if (!found) throw new Error('Сертификат не найден в реестре CRM');
  });

  await runAssertion('CRM Сегментация: создание целевого списка предприятий авиастроения (/api/crm/client-lists)', async () => {
    const listPayload = {
      name: 'Предприятия авиастроения — КИМ и 5-осевая обработка',
      description: 'Список ключевых заказчиков для выездной калибровки и апгрейда ПО',
      companyIds: [cleanup.companyId],
      filters: { industries: ['Авиастроение'], status: 'active' },
      createdBy: 'Некрасов С.Ю.',
    };

    const postRes = await request('/api/crm/client-lists', {
      method: 'POST',
      body: JSON.stringify(listPayload),
    });
    if (!postRes.ok) throw new Error(`POST /api/crm/client-lists HTTP ${postRes.status}`);

    const getRes = await request('/api/crm/client-lists');
    if (!getRes.ok) throw new Error(`GET /api/crm/client-lists HTTP ${getRes.status}`);
    const getBody = await getRes.json();
    const found = (getBody.data || []).some((l: any) => l.name === listPayload.name);
    if (!found) throw new Error('Сегментированный список не найден в CRM');
  });

  // --------------------------------------------------------------------------
  // 5. СКВОЗНОЕ ВЗАИМОДЕЙСТВИЕ CMS <---> CRM (Cross-Module Integration)
  // --------------------------------------------------------------------------
  setTestIp('127.0.0.105');
  console.log(`\n${BOLD}5. Сквозная интеграция: Публичные формы CMS ➔ Лиды и сделки CRM${RESET}`);

  await runAssertion('Публичная форма / Инженерный калькулятор CMS ➔ Создание лида в CRM (/api/service-requests)', async () => {
    const serviceRequestPayload = {
      customerName: 'Ковалев Станислав Викторович',
      companyName: 'ПАО «Салют-Авиа»',
      email: 's.kovalev@salut-avia.ru',
      phone: '+7 (495) 600-30-20',
      serviceType: '3D-сканирование и контроль геометрии турбинных лопаток',
      details: 'Требуется выездной контроль геометрии 24 лопаток первой ступени с протоколом отклонений по ГОСТ Р 53464.',
      estimatedPrice: 380000,
      cadFormat: 'STEP AP242',
      metadata: {
        urgent: true,
        source: 'cms_calculator_modal',
        pageUrl: '/services',
      }
    };

    const postRes = await request('/api/service-requests', {
      method: 'POST',
      body: JSON.stringify(serviceRequestPayload),
    });
    if (!postRes.ok) throw new Error(`POST /api/service-requests HTTP ${postRes.status}`);
    const postBody = await postRes.json();
    if (!postBody.success) throw new Error(`Ошибка создания заявки: ${JSON.stringify(postBody)}`);
    cleanup.serviceRequestId = postBody.data?.id;

    if (!cleanup.serviceRequestId) {
      throw new Error('ID созданной заявки не возвращен');
    }

    // Проверяем, что заявка мгновенно доступна менеджерам в CRM
    const getRes = await request('/api/service-requests');
    if (!getRes.ok) throw new Error(`GET /api/service-requests HTTP ${getRes.status}`);
    const getBody = await getRes.json();
    const allRequests = getBody.data || [];
    const created = allRequests.find((r: any) => r.id === cleanup.serviceRequestId);
    if (!created) {
      throw new Error(`Заявка ${cleanup.serviceRequestId} не найдена в общем пуле CRM`);
    }
    if (created.customerName !== serviceRequestPayload.customerName) {
      throw new Error(`Данные заявки не совпадают: ${created.customerName}`);
    }
  });

  await runAssertion('CRM обработка заявки: перевод лида в статус "reviewed" (/api/service-requests/:id)', async () => {
    const patchRes = await request(`/api/service-requests/${cleanup.serviceRequestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'reviewed' }),
    });
    if (!patchRes.ok) throw new Error(`PATCH HTTP ${patchRes.status}`);
    const patchBody = await patchRes.json();
    if (!patchBody.success) throw new Error(`Не удалось обновить статус: ${JSON.stringify(patchBody)}`);

    // Проверяем в базе
    const getRes = await request('/api/service-requests');
    const getBody = await getRes.json();
    const updated = (getBody.data || []).find((r: any) => r.id === cleanup.serviceRequestId);
    if (updated?.status !== 'reviewed') {
      throw new Error(`Статус в базе равен "${updated?.status}", ожидался "reviewed"`);
    }
  });

  await runAssertion('Запрос КП с карточки товара каталога CMS ➔ CRM RFQ пул (/api/rfq)', async () => {
    const rfqPayload = {
      customerName: 'Морозов Кирилл Сергеевич',
      companyName: 'ООО «Композит-Тех»',
      email: 'k.morozov@composite-tech.ru',
      phone: '+7 (812) 444-55-66',
      serviceType: 'Запрос КП: Оптический 3D-сканер Shining 3D FreeScan UE Pro',
      details: 'Прошу выставить ТКП с учетом доставки в Санкт-Петербург и поверки.',
      estimatedPrice: 3200000,
    };

    const postRes = await request('/api/rfq', {
      method: 'POST',
      body: JSON.stringify(rfqPayload),
    });
    if (!postRes.ok) throw new Error(`POST /api/rfq HTTP ${postRes.status}`);
    const postBody = await postRes.json();
    if (!postBody.success) throw new Error(`Ошибка RFQ: ${JSON.stringify(postBody)}`);

    // Проверяем наличие в CRM
    const getRes = await request('/api/rfq');
    const getBody = await getRes.json();
    const found = (getBody.data || []).some((r: any) => r.email === rfqPayload.email);
    if (!found) throw new Error('Запрос RFQ не отобразился в CRM');
  });

  await runAssertion('Сервисный тикет B2B портала ➔ CRM Service Desk (/api/b2b/tickets)', async () => {
    const ticketPayload = {
      organizationId: 'АО «Авиадвигатель-Тест»',
      title: 'Периодическая калибровка измерительной руки PMT Alpha',
      category: 'calibration',
      status: 'new',
      urgency: 'high',
      equipmentModel: 'PMT Alpha Arm 3.0m',
      equipmentSerial: 'PMT-7A-2026-99',
      description: 'Подошел срок межповерочного интервала. Требуется выезд метролога с калибровочной сферой.',
    };

    const postRes = await request('/api/b2b/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketPayload),
    });
    if (!postRes.ok) throw new Error(`POST /api/b2b/tickets HTTP ${postRes.status}`);
    const postBody = await postRes.json();
    cleanup.ticketId = postBody.data?.id;

    const getRes = await request('/api/b2b/tickets');
    if (!getRes.ok) throw new Error(`GET /api/b2b/tickets HTTP ${getRes.status}`);
    const getBody = await getRes.json();
    const found = (getBody.data || []).some((t: any) => t.id === cleanup.ticketId);
    if (!found) throw new Error(`Тикет ${cleanup.ticketId} не найден в B2B тикетах`);
  });

  await runAssertion('Онлайн-инженер: создание сессии на странице каталога и автоматическая генерация лида в CRM (/api/chat/session)', async () => {
    const chatVisitorId = `visitor-test-${Date.now()}`;
    const chatPayload = {
      visitorId: chatVisitorId,
      visitorName: 'Григорьев Роман Валерьевич',
      companyName: 'НПП «Турбо-Маш»',
      contactPhone: '+7 (925) 777-88-99',
      contactEmail: 'r.grigoriev@turbomash.ru',
      currentPage: 'Каталог оборудования / Портативные КИМ',
      currentPath: '/hardware/pmt-alpha-arm',
      status: 'active',
      isHandoverSubmit: true,
      lastMessageText: 'Интересует комплект поставки КИМ PMT Alpha Arm со сканером RS6 и обучение 2 операторов.',
      messages: [
        { id: '1', sender: 'user', text: 'Здравствуйте, есть ли в наличии рука с вылетом 3.0 метра?', timestamp: new Date().toISOString() },
        { id: '2', sender: 'system', text: 'Здравствуйте! Да, модель PMT Alpha Arm 3.0m в наличии на демонстрационном складе в Москве.', timestamp: new Date().toISOString() },
      ],
    };

    const postRes = await request('/api/chat/session', {
      method: 'POST',
      body: JSON.stringify(chatPayload),
    });
    if (!postRes.ok) throw new Error(`POST /api/chat/session HTTP ${postRes.status}`);
    const postBody = await postRes.json();
    if (!postBody.success || !postBody.data?.leadId) {
      throw new Error(`Автоматический лид в CRM не сформирован: ${JSON.stringify(postBody)}`);
    }

    // Проверяем, что созданный лид зарегистрирован в общей CRM-базе заявок
    const generatedLeadId = postBody.data.leadId;
    const reqRes = await request('/api/service-requests');
    if (!reqRes.ok) throw new Error(`GET /api/service-requests HTTP ${reqRes.status}`);
    const reqBody = await reqRes.json();
    const leadExists = (reqBody.data || []).some((r: any) => r.id === generatedLeadId);
    if (!leadExists) {
      throw new Error(`Лид ${generatedLeadId} из чата не найден в реестре заявок CRM`);
    }
  });

  await runAssertion('База знаний ГОСТ/ВНИИМС в CMS: публикация методики поверки и проверка доступа (/api/knowledge-base)', async () => {
    const kbPayload = {
      slug: `kb-gost-iso-10360-${Date.now()}`,
      title: 'ГОСТ Р ИСО 10360-2: Методика приемочных испытаний КИМ',
      content: 'Регламент определения погрешности измерений линейных размеров E0,MPE для координатно-измерительных машин.',
      categoryId: 'metrology_standards',
      isPublished: true,
    };

    const postRes = await request('/api/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(kbPayload),
    });
    if (!postRes.ok) throw new Error(`POST /api/knowledge-base HTTP ${postRes.status}`);

    const getRes = await request('/api/knowledge-base');
    if (!getRes.ok) throw new Error(`GET /api/knowledge-base HTTP ${getRes.status}`);
    const getBody = await getRes.json();
    const found = (getBody.data || []).some((item: any) => item.slug === kbPayload.slug);
    if (!found) throw new Error('Опубликованный регламент не найден в базе знаний');
  });

  // --------------------------------------------------------------------------
  // 6. ВАЛИДАЦИЯ И ГРАНИЧНЫЕ УСЛОВИЯ (Validation & Edge Cases)
  // --------------------------------------------------------------------------
  setTestIp('127.0.0.106');
  console.log(`\n${BOLD}6. Валидация входных данных и устойчивость (Data Validation)${RESET}`);

  await runAssertion('Валидация: отклонение заявки с некорректным email (400 Bad Request)', async () => {
    const invalidPayload = {
      customerName: 'Тестовый Клиент',
      email: 'invalid-email-address',
      phone: '+79991234567',
      serviceType: '3d_scanning',
    };
    const res = await request('/api/service-requests', {
      method: 'POST',
      body: JSON.stringify(invalidPayload),
    });
    if (res.status !== 400) {
      throw new Error(`Ожидался статус 400, получен ${res.status}`);
    }
    const data = await res.json();
    if (!data.error || !data.error.includes('email')) {
      throw new Error(`Ожидалось сообщение об ошибке email, получено: ${data.error}`);
    }
  });

  await runAssertion('Валидация: отклонение заявки с неполным номером телефона (400 Bad Request)', async () => {
    const invalidPayload = {
      customerName: 'Тестовый Клиент',
      email: 'valid@client.ru',
      phone: '123', // Слишком короткий
      serviceType: '3d_scanning',
    };
    const res = await request('/api/service-requests', {
      method: 'POST',
      body: JSON.stringify(invalidPayload),
    });
    if (res.status !== 400) {
      throw new Error(`Ожидался статус 400, получен ${res.status}`);
    }
    const data = await res.json();
    if (!data.error || !data.error.includes('телефона')) {
      throw new Error(`Ожидалось сообщение об ошибке телефона, получено: ${data.error}`);
    }
  });

  // --------------------------------------------------------------------------
  // 7. ОЧИСТКА ТЕСТОВЫХ СУЩНОСТЕЙ (Teardown Cleanup)
  // --------------------------------------------------------------------------
  setTestIp('127.0.0.107');
  console.log(`\n${BOLD}7. Корректная очистка тестовых данных (Teardown Cleanup)${RESET}`);

  await runAssertion('Удаление тестовых задач, сделок, компаний и документов', async () => {
    // Удаляем задачу
    if (cleanup.taskId) {
      await request(`/api/crm/tasks/${cleanup.taskId}`, { method: 'DELETE' });
    }
    // Удаляем сделку
    if (cleanup.dealId) {
      await request(`/api/crm/deals/${cleanup.dealId}`, { method: 'DELETE' });
    }
    // Удаляем КП
    if (cleanup.proposalId) {
      await request(`/api/crm/proposals/${cleanup.proposalId}`, { method: 'DELETE' });
    }
    // Удаляем договор
    if (cleanup.contractId) {
      await request(`/api/crm/contracts/${cleanup.contractId}`, { method: 'DELETE' });
    }
    // Удаляем лицензию
    if (cleanup.licenseId) {
      await request(`/api/crm/licenses/${cleanup.licenseId}`, { method: 'DELETE' });
    }
    // Удаляем компанию
    if (cleanup.companyId) {
      await request(`/api/crm/companies/${cleanup.companyId}`, { method: 'DELETE' });
    }
  });

  // --------------------------------------------------------------------------
  // ФИНАЛЬНЫЙ ОТЧЕТ
  // --------------------------------------------------------------------------
  stats.durationMs = Date.now() - startTime;
  console.log(`\n${BOLD}======================================================================${RESET}`);
  console.log(`${BOLD}ИТОГОВЫЙ ОТЧЕТ ТЕСТИРОВАНИЯ ВЗАИМОДЕЙСТВИЯ БАЗ ДАННЫХ CRM И CMS:${RESET}`);
  console.log(`  Всего тестов проведено: ${BOLD}${stats.total}${RESET}`);
  console.log(`  Успешно пройдено:      ${GREEN}${BOLD}${stats.passed}${RESET}`);
  console.log(`  Ошибок / Провалов:     ${stats.failed > 0 ? RED : GREEN}${BOLD}${stats.failed}${RESET}`);
  console.log(`  Время выполнения:      ${stats.durationMs} мс`);
  console.log(`${BOLD}======================================================================${RESET}\n`);

  if (stats.failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Критический сбой тестового раннера:', err);
  process.exit(1);
});
