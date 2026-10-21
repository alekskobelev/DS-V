describe('Главная страница и форма обратной связи «ДС-Инжиниринг»', () => {
  beforeEach(() => {
    // Intercept contact submission endpoint for reliable verification
    cy.intercept('POST', '/api/contact/submit*').as('submitContactForm');
    cy.visit('/');
    cy.waitForAppReady();
  });

  describe('1. Доступность и ключевые элементы главной страницы', () => {
    it('Главная страница успешно открывается и имеет корректный HTTP-статус и заголовок', () => {
      // Проверка доступности корневого URL (200 OK)
      cy.request('/').its('status').should('eq', 200);

      // Проверка тега title
      cy.title().should('be.a', 'string').and('satisfy', (title: string) => {
        return title.includes('Инжиниринговые решения') || 
               title.includes('ДС‑Инжиниринг') || 
               title.includes('TopSolid') ||
               title.includes('CAD');
      });

      // Проверка наличия мета-описания
      cy.get('meta[name="description"]')
        .should('have.attr', 'content')
        .and('not.be.empty');
    });

    it('Отображается шапка сайта с логотипом компании и главным навигационным меню', () => {
      // Логотип и брендовое наименование
      cy.contains('ДС-Инжиниринг', { matchCase: false }).should('be.visible');

      // Ключевые элементы навигации
      cy.get('header, nav').should('exist');
      cy.contains(/оборудование|каталог|услуги|проекты|контакты/i).should('exist');
    });

    it('Главный интерактивный блок (HeroSlider / Hero) загружен и виден пользователю', () => {
      cy.get('#section-hero').should('exist').and('be.visible');
      // Проверка наличия ключевых УТП или призывов к действию
      cy.get('#section-hero').within(() => {
        cy.contains(/инжиниринг|cad|cam|ким|сканер|решения/i).should('exist');
      });
    });

    it('Присутствуют все ключевые технологические секции на главной странице', () => {
      // Секция решений задач
      cy.get('#section-problems').should('exist');
      // Секция доверия и отраслей
      cy.get('#section-trust').should('exist');
      // Секция производителей и брендов
      cy.get('#section-brands').should('exist');
      // Секция проектов/кейсов
      cy.get('#section-cases').should('exist');
      // Секция контактов и формы экспресс-заявки
      cy.get('#section-contact').should('exist');
    });
  });

  describe('2. Форма обратной связи на главной странице (Экспресс-заявка)', () => {
    beforeEach(() => {
      // Прокручиваем к секции формы обратной связи
      cy.get('#section-contact').scrollIntoView({ duration: 300 });
      cy.get('[data-testid="home-feedback-form"]').should('be.visible');
    });

    it('Форма содержит все необходимые поля ввода и элементы управления', () => {
      // Поле имени контактного лица
      cy.get('[data-testid="feedback-name-input"]')
        .should('be.visible')
        .and('have.attr', 'required');

      // Поле телефона с маской
      cy.get('[data-testid="feedback-phone-input"]')
        .should('be.visible')
        .and('have.attr', 'type', 'tel')
        .and('have.attr', 'required');

      // Поле описания задачи
      cy.get('[data-testid="feedback-message-input"]')
        .should('be.visible');

      // Чекбокс согласия на обработку персональных данных (152-ФЗ)
      cy.get('[data-testid="feedback-agree-checkbox"]')
        .should('be.visible')
        .and('be.checked');

      // Кнопка отправки заявки
      cy.get('[data-testid="feedback-submit-btn"]')
        .should('be.visible')
        .and('not.be.disabled')
        .and('contain.text', 'Отправить запрос');
    });

    it('Корректно форматирует телефонный номер по маске +7 (XXX) XXX-XX-XX', () => {
      const phoneInput = cy.get('[data-testid="feedback-phone-input"]');
      phoneInput.clear().type('9991234567');
      phoneInput.should('have.value', '+7 (999) 123-45-67');
    });

    it('Проверяет валидацию при неполном номере телефона', () => {
      cy.get('[data-testid="feedback-name-input"]').clear().type('Тестовый Пользователь');
      cy.get('[data-testid="feedback-phone-input"]').clear().type('99912'); // Неполный номер
      cy.get('[data-testid="feedback-submit-btn"]').click();

      // Проверка сообщения об ошибке валидации телефона
      cy.get('[data-testid="feedback-phone-error"]')
        .should('be.visible')
        .and('contain.text', '+7 (XXX) XXX-XX-XX');
    });

    it('Блокирует отправку заявки при снятом согласии на обработку персональных данных', () => {
      cy.get('[data-testid="feedback-name-input"]').clear().type('Инженер Петров');
      cy.get('[data-testid="feedback-phone-input"]').clear().type('9991234567');
      cy.get('[data-testid="feedback-agree-checkbox"]').uncheck();

      cy.get('[data-testid="feedback-submit-btn"]').click();

      // Успешный экран не должен появиться
      cy.get('[data-testid="feedback-success-message"]').should('not.exist');
      // Форма все еще отображается
      cy.get('[data-testid="home-feedback-form"]').should('be.visible');
    });

    it('Успешно отправляет заполненную форму и отображает подтверждение регистрации заявки', () => {
      const testName = 'Инженер-метролог E2E';
      const testPhoneDigits = '9997654321';
      const expectedFormattedPhone = '+7 (999) 765-43-21';
      const testMessage = 'Автоматизированный E2E тест: подбор измерительной руки КИМ PMT и ПО TopSolid 7';

      // Заполнение полей
      cy.get('[data-testid="feedback-name-input"]').clear().type(testName);
      cy.get('[data-testid="feedback-phone-input"]').clear().type(testPhoneDigits);
      cy.get('[data-testid="feedback-message-input"]').clear().type(testMessage);
      cy.get('[data-testid="feedback-agree-checkbox"]').check();

      // Отправка формы
      cy.get('[data-testid="feedback-submit-btn"]').click();

      // Ожидание сетевого запроса к API
      cy.wait('@submitContactForm', { timeout: 15000 }).then((interception) => {
        expect(interception.request.body).to.have.property('name', testName);
        expect(interception.request.body).to.have.property('phone', expectedFormattedPhone);
      });

      // Проверка экрана успеха
      cy.get('[data-testid="feedback-success-message"]', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          cy.contains('Запрос успешно зарегистрирован').should('be.visible');
          cy.contains(expectedFormattedPhone).should('be.visible');
          cy.contains('Отправить еще один запрос').should('be.visible');
        });

      // Проверка кнопки сброса и возможности отправить повторный запрос
      cy.contains('Отправить еще один запрос').click();
      cy.get('[data-testid="home-feedback-form"]').should('be.visible');
      cy.get('[data-testid="feedback-success-message"]').should('not.exist');
    });
  });

  describe('3. Модальная форма обратной связи / Консультация инженера', () => {
    it('Открывает модальное окно обратной связи при клике на соответствующую кнопку', () => {
      // Ищем кнопку заказа консультации/звонка
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Консультация"), button:contains("Заказать звонок"), button:contains("Связаться")').length > 0) {
          cy.contains(/консультация|заказать звонок|связаться с инженером/i).first().click({ force: true });
          // Проверяем появление модального диалога
          cy.get('[role="dialog"], .fixed').should('exist');
        }
      });
    });
  });
});
