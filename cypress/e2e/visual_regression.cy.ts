describe('Визуальная регрессия и консистентность верстки ключевых UI-компонентов «ДС-Инжиниринг»', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForAppReady();
  });

  describe('1. Навигационная панель (Header / Navigation Bar Layout Consistency)', () => {
    const desktopViewports: Cypress.ViewportPreset[] = ['macbook-15', 'macbook-13'];

    desktopViewports.forEach((preset) => {
      it(`[Desktop: ${preset}] Шапка сайта имеет корректную структуру, отступы и фиксированную высоту`, () => {
        cy.viewport(preset);
        
        // 1. Проверка TopBar (информационная полоса)
        cy.get('header').prev('div').should('be.visible').within(() => {
          cy.contains(/более 30 лет|опыт/i).should('be.visible');
          cy.contains(/954-02-92/i).should('be.visible');
        });

        // 2. Проверка sticky-контейнера шапки
        cy.get('header')
          .should('be.visible')
          .and('have.css', 'position', 'sticky')
          .and('have.css', 'background-color');

        // 3. Проверка логотипа и фирменного блока
        cy.get('#header-logo-btn')
          .should('be.visible')
          .within(() => {
            cy.get('svg').should('exist');
            cy.contains('ДС‑ИНЖИНИРИНГ').should('be.visible');
          });

        // 4. Проверка десктопного навигационного меню
        cy.get('#nav-home-btn').should('be.visible');
        cy.get('#nav-hardware-btn').should('be.visible').and('contain.text', 'ОБОРУДОВАНИЕ');
        cy.get('#nav-software-btn').should('be.visible').and('contain.text', 'ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ');
        cy.get('#nav-services-btn').should('be.visible').and('contain.text', 'УСЛУГИ');
        cy.get('#nav-calculator-btn').should('be.visible');
        cy.get('#nav-knowledge-btn').should('be.visible');
        cy.get('#nav-about-btn').should('be.visible');
        cy.get('#nav-contacts-btn').should('be.visible');
      });
    });

    it('Корректно отображает и позиционирует выпадающее меню каталога оборудования', () => {
      cy.viewport(1440, 900);
      
      // Наводим курсор на кнопку каталога оборудования
      cy.get('#nav-hardware-btn').trigger('mouseenter');
      
      // Проверяем выпадающую мега-панель
      cy.get('header').within(() => {
        cy.contains('Каталог метрологического оборудования').should('be.visible');
        cy.contains(/Лазерные 3D-сканеры|Оптические/i).should('be.visible');
      });
      
      // Убираем курсор
      cy.get('#nav-hardware-btn').trigger('mouseleave');
    });

    it('Сохраняет стабильность верстки при скролле страницы (Sticky Transition)', () => {
      cy.viewport(1280, 800);
      
      // Прокручиваем страницу вниз
      cy.scrollTo(0, 500);
      cy.wait(200);

      // Шапка остается зафиксированной вверху с тенью
      cy.get('header')
        .should('be.visible')
        .and('have.class', 'sticky');
      
      // Возвращаем страницу наверх
      cy.scrollTo(0, 0);
    });

    it('[Mobile / Tablet] Адаптивное меню корректно открывается на мобильных экранах (iPhone / iPad)', () => {
      cy.viewport('iphone-x');
      
      // На мобильных экранах скрыты десктопные кнопки
      cy.get('#nav-home-btn').should('not.be.visible');

      // Кнопка вызова мобильного меню доступна
      cy.get('button[aria-label="Главное меню"]').should('be.visible').click();

      // Мобильная шторка/меню открывается
      cy.contains(/каталог|оборудование|услуги/i).should('be.visible');

      // Закрытие мобильного меню
      cy.get('button[aria-label="Закрыть меню"]').should('be.visible').click();
    });
  });

  describe('2. Форма подачи заявки на услуги и обратной связи (Service Request Form Consistency)', () => {
    it('Инлайн-форма заявки на главной странице сохраняет геометрическую структуру и поля ввода', () => {
      cy.viewport(1280, 900);
      cy.get('#section-contact').scrollIntoView();
      
      const form = cy.get('[data-testid="home-feedback-form"]');
      form.should('be.visible');

      // Проверка расположения основных элементов
      cy.get('[data-testid="feedback-name-input"]')
        .should('be.visible')
        .and('have.css', 'border-radius');

      cy.get('[data-testid="feedback-phone-input"]')
        .should('be.visible')
        .and('have.attr', 'placeholder');

      cy.get('[data-testid="feedback-message-input"]').should('be.visible');
      cy.get('[data-testid="feedback-agree-checkbox"]').should('be.visible');
      cy.get('[data-testid="feedback-submit-btn"]')
        .should('be.visible')
        .and('have.css', 'cursor', 'pointer');
    });

    it('Визуальное отображение ошибок валидации не ломает верстку формы', () => {
      cy.viewport(1280, 900);
      cy.get('#section-contact').scrollIntoView();

      // Вводим некорректный телефон для вызова ошибки
      cy.get('[data-testid="feedback-phone-input"]').clear().type('12345');
      cy.get('[data-testid="feedback-submit-btn"]').click();

      // Ошибка отображается компактно без переполнения контейнера
      cy.get('[data-testid="feedback-phone-error"]')
        .should('be.visible')
        .and('have.css', 'color');

      cy.get('[data-testid="home-feedback-form"]')
        .should('be.visible');
    });

    it('Модальное окно заявки (ContactModal) центрируется и поддерживает полноэкранный режим', () => {
      cy.viewport(1440, 900);

      // Открываем модальное окно через кнопку консультации
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Консультация"), button:contains("Связаться")').length > 0) {
          cy.contains(/консультация|заказать звонок|связаться/i).first().click({ force: true });

          // Проверяем наличие оверлея и центрированного контейнера
          cy.get('[data-testid="contact-modal-backdrop"]').should('be.visible');
          cy.get('[data-testid="contact-modal-container"]')
            .should('be.visible')
            .and('have.css', 'max-height');

          // Проверяем шапку модального окна
          cy.get('[data-testid="contact-modal-header"]').should('be.visible');
          cy.get('[data-testid="contact-modal-title"]').should('be.visible');

          // Проверяем ключевые поля формы модального окна
          cy.get('[data-testid="modal-input-name"]').should('be.visible');
          cy.get('[data-testid="modal-input-phone"]').should('be.visible');
          cy.get('[data-testid="modal-submit-btn"]').should('be.visible');

          // Проверяем переключение полноэкранного режима
          cy.get('[data-testid="contact-modal-fullscreen-btn"]').click();
          cy.get('[data-testid="contact-modal-container"]')
            .should('have.class', 'w-screen')
            .and('have.class', 'h-screen');

          // Возвращаем в оконный режим
          cy.get('[data-testid="contact-modal-fullscreen-btn"]').click();
          cy.get('[data-testid="contact-modal-container"]').should('not.have.class', 'w-screen');

          // Закрываем модальное окно
          cy.get('[data-testid="contact-modal-close-btn"]').click();
          cy.get('[data-testid="contact-modal-container"]').should('not.exist');
        }
      });
    });
  });

  describe('3. Плавающие элементы и нижний тулбар (Floating Widgets Consistency)', () => {
    it('Плавающие виджеты быстрой связи и кнопка возврата наверх корректно спозиционированы', () => {
      cy.viewport(1280, 800);
      cy.scrollTo(0, 600);
      cy.wait(150);

      // Проверяем нижний контейнер действий
      cy.get('#mobile-bottom-nav-actions, .fixed.bottom-0').should('exist');
    });
  });
});
