describe('E2E Тестирование доступности и валидности основных API-эндпоинтов «ДС-Инжиниринг»', () => {
  let csrfToken = '';

  // Получаем актуальный CSRF-токен перед выполнением тестов для авторизованных POST-запросов
  before(() => {
    cy.request({
      method: 'GET',
      url: '/api/csrf-token',
      failOnStatusCode: false
    }).then((res) => {
      if (res.status === 200 && res.body && res.body.csrfToken) {
        csrfToken = res.body.csrfToken;
      }
    });
  });

  describe('1. Системные эндпоинты (System, Health & Security APIs)', () => {
    it('GET /api/health — возвращает статус 200 OK и JSON с объектом состояния сервера', () => {
      cy.request('GET', '/api/health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('status', 'ok');
        expect(response.body).to.satisfy((b: any) => b.time !== undefined || b.timestamp !== undefined || b.uptime !== undefined);
      });
    });

    it('GET /api/db-health — возвращает статус 200 OK и данные о состоянии СУБД/Fallback', () => {
      cy.request('GET', '/api/db-health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('status');
        expect(response.body.status).to.match(/healthy|connected|fallback|ok/i);
        expect(response.body).to.have.property('configured');
        expect(response.body.configured).to.be.a('boolean');
      });
    });

    it('GET /api/csrf-token — возвращает статус 200 OK и криптостойкий CSRF-токен', () => {
      cy.request('GET', '/api/csrf-token').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.have.property('csrfToken');
        expect(response.body.csrfToken).to.be.a('string');
        expect(response.body.csrfToken.length).to.be.at.least(32);
      });
    });

    it('GET /api/logs/realtime — возвращает статус 200 OK и список системных логов', () => {
      cy.request('GET', '/api/logs/realtime').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.satisfy((b: any) => Array.isArray(b) || Array.isArray(b.logs));
      });
    });

    it('GET /sitemap.xml — возвращает статус 200 OK и валидный XML документ карты сайта', () => {
      cy.request('GET', '/sitemap.xml').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('xml');
        expect(response.body).to.be.a('string');
        expect(response.body).to.include('<?xml');
        expect(response.body).to.include('<urlset');
        expect(response.body).to.include('<url>');
        expect(response.body).to.include('<loc>');
      });
    });
  });

  describe('2. Контент и CMS эндпоинты (CMS, Каталог & База знаний)', () => {
    it('GET /api/cms/state — возвращает статус 200 OK и глобальное состояние CMS', () => {
      cy.request('GET', '/api/cms/state').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('customPages');
        expect(response.body.customPages).to.be.an('array');
      });
    });

    it('GET /api/cms/pages — возвращает статус 200 OK и список страниц сайта', () => {
      cy.request('GET', '/api/cms/pages').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/equipment — возвращает статус 200 OK и номенклатуру измерительного оборудования', () => {
      cy.request('GET', '/api/equipment').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/knowledge-base — возвращает статус 200 OK и реестр статей базы знаний', () => {
      cy.request('GET', '/api/knowledge-base').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/site-texts — возвращает статус 200 OK и словарь текстовых констант сайта', () => {
      cy.request('GET', '/api/site-texts').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('object');
      });
    });

    it('GET /api/models3d — возвращает статус 200 OK и реестр 3D-моделей с метрологическими параметрами', () => {
      cy.request('GET', '/api/models3d').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
        if (response.body.length > 0) {
          const firstModel = response.body[0];
          expect(firstModel).to.have.property('id');
          expect(firstModel).to.have.property('name');
        }
      });
    });

    it('GET /api/price-lists — возвращает статус 200 OK и номенклатуру прайс-листов', () => {
      cy.request('GET', '/api/price-lists').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('items');
        expect(response.body.items).to.be.an('array');
      });
    });
  });

  describe('3. CRM и B2B эндпоинты (CRM, Воронка продаж & Документооборот)', () => {
    it('GET /api/crm/companies — возвращает статус 200 OK и список предприятий-контрагентов', () => {
      cy.request('GET', '/api/crm/companies').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.at.least(1);
        const company = response.body[0];
        expect(company).to.have.property('id');
        expect(company).to.have.property('name');
      });
    });

    it('GET /api/crm/deals — возвращает статус 200 OK и воронку коммерческих сделок', () => {
      cy.request('GET', '/api/crm/deals').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.at.least(1);
        const deal = response.body[0];
        expect(deal).to.have.property('id');
        expect(deal).to.have.property('title');
        expect(deal).to.have.property('stage');
      });
    });

    it('GET /api/crm/proposals — возвращает статус 200 OK и реестр ТКП (коммерческих предложений)', () => {
      cy.request('GET', '/api/crm/proposals').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/crm/contracts — возвращает статус 200 OK и реестр договоров поставки и услуг', () => {
      cy.request('GET', '/api/crm/contracts').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/crm/tasks — возвращает статус 200 OK и перечень инженерных задач', () => {
      cy.request('GET', '/api/crm/tasks').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/crm/contacts — возвращает статус 200 OK и базу контактов ЛПР', () => {
      cy.request('GET', '/api/crm/contacts').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/crm/tax-settings — возвращает статус 200 OK и корректную ставку НДС (22%)', () => {
      cy.request('GET', '/api/crm/tax-settings').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('vatRate');
        expect(response.body.vatRate).to.eq(22);
      });
    });

    it('GET /api/b2b/tickets — возвращает статус 200 OK и тикеты сервисной поддержки B2B', () => {
      cy.request('GET', '/api/b2b/tickets').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.at.least(1);
        const ticket = response.body[0];
        expect(ticket).to.have.property('id');
        expect(ticket).to.have.property('title');
        expect(ticket).to.have.property('status');
      });
    });

    it('GET /api/service-requests — возвращает статус 200 OK и реестр входящих заявок/RFQ', () => {
      cy.request('GET', '/api/service-requests').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/users — возвращает статус 200 OK и реестр учетных записей пользователей', () => {
      cy.request('GET', '/api/users').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.at.least(1);
      });
    });
  });

  describe('4. Интерактивные POST-эндпоинты и обработка заявок (Public POST Actions)', () => {
    it('POST /api/contact/submit — успешно регистрирует обращение с корректными данными', () => {
      const payload = {
        name: 'Инженер Тестов (Cypress E2E)',
        phone: '+7 (999) 888-77-66',
        email: 'test.engineer@ds-engineering-cypress.ru',
        message: 'Проверка эндпоинта отправки формы через Cypress E2E suite',
        serviceType: '3D-сканирование и контроль точности'
      };

      cy.request({
        method: 'POST',
        url: '/api/contact/submit',
        headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
        body: payload
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('object');
        expect(response.body).to.satisfy((b: any) => b.success === true || b.id !== undefined || b.status === 'ok');
      });
    });

    it('POST /api/contact/submit — отклоняет невалидный запрос без имени или с пустым телом (400 Bad Request)', () => {
      cy.request({
        method: 'POST',
        url: '/api/contact/submit',
        headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
        expect(response.body).to.be.an('object');
      });
    });

    it('POST /api/crm/quick-callback — успешно регистрирует запрос быстрого обратного звонка', () => {
      const payload = {
        name: 'Контролер ОТК (Cypress Quick Call)',
        phone: '+7 (917) 555-44-33',
        topic: 'Консультация по КИМ PMT Arm',
        preferredTime: 'В ближайшие 15 минут'
      };

      cy.request({
        method: 'POST',
        url: '/api/crm/quick-callback',
        headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
        body: payload
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('success', true);
      });
    });

    it('POST /api/service-requests — успешно создает заявку на расчет стоимости услуги', () => {
      const payload = {
        customerName: 'Главный технолог КБ Самара',
        companyName: 'ООО «ПромАвиаТех»',
        email: 'tech@promaviatech-test.ru',
        phone: '+7 (846) 999-11-22',
        serviceType: 'Разработка постпроцессора TopSolid 7',
        details: 'Постпроцессор для 5-осевого фрезерного станка Hermle C42U с ЧПУ Heidenhain TNC 640',
        estimatedPrice: 125000
      };

      cy.request({
        method: 'POST',
        url: '/api/service-requests',
        headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
        body: payload
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        expect(response.body).to.be.an('object');
        expect(response.body).to.satisfy((b: any) => b.id !== undefined || b.success === true || b.status === 'ok');
      });
    });

    it('POST /api/chat/session — успешно открывает сессию онлайн-консультации с дежурным инженером', () => {
      const payload = {
        userName: 'Инженер-испытатель',
        initialMessage: 'Добрый день! Подскажите технические характеристики сканера Shining 3D FreeScan UE Pro'
      };

      cy.request({
        method: 'POST',
        url: '/api/chat/session',
        headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
        body: payload
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('sessionId');
      });
    });
  });

  describe('5. Проверка защиты и обработки некорректных маршрутов (Security & 404 Guard)', () => {
    it('GET /api/non-existent-endpoint-404 — возвращает статус 404 Not Found', () => {
      cy.request({
        method: 'GET',
        url: '/api/non-existent-endpoint-404',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('POST /api/crm/deals с невалидным CSRF-токеном или некорректными данными отклоняется', () => {
      cy.request({
        method: 'POST',
        url: '/api/crm/deals',
        headers: { 'x-csrf-token': 'invalid_csrf_token_123456789' },
        body: { title: 'Invalid deal' },
        failOnStatusCode: false
      }).then((response) => {
        // Должен вернуть 403 Forbidden (CSRF) или 400/401 (Validation/Auth)
        expect(response.status).to.be.oneOf([400, 401, 403, 422]);
      });
    });
  });
});
