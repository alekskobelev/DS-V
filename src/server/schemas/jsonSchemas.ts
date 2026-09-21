/**
 * JSON Schema Specifications (Draft-07 standard)
 * Инженерный портал «ДС-Инжиниринг» — Спецификации схем данных API
 */

export interface SchemaDefinition {
  $id: string;
  $schema: string;
  title: string;
  description: string;
  type: string;
  required?: string[];
  properties: Record<string, any>;
  additionalProperties?: boolean;
  examples?: any[];
}

export const JSON_SCHEMAS: Record<string, SchemaDefinition> = {
  // 1. Форма обратной связи / Контактная форма
  contactForm: {
    $id: 'https://ds-enginering.ru/schemas/contact-form.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Форма обратной связи и заявка на расчет',
    description: 'Схема входящих данных с формы контактов, шапки сайта и модального окна заявки',
    type: 'object',
    required: ['name', 'phone'],
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 120,
        description: 'Имя контактного лица (не менее 2 символов)'
      },
      phone: {
        type: 'string',
        minLength: 7,
        maxLength: 30,
        pattern: '^[\\d\\s\\+\\-\\(\\)]+$',
        description: 'Контактный телефон с кодом страны/города'
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 120,
        description: 'Корпоративный или личный email'
      },
      company: {
        type: 'string',
        maxLength: 200,
        description: 'Наименование предприятия или организации'
      },
      serviceType: {
        type: 'string',
        maxLength: 150,
        description: 'Инженерное направление (ПО, КИМ, 3D-контроль, постпроцессоры и т.д.)'
      },
      city: {
        type: 'string',
        maxLength: 100,
        description: 'Город предприятия (Самара, Тольятти, Москва и др.)'
      },
      message: {
        type: 'string',
        maxLength: 5000,
        description: 'Текст обращения или техническое задание'
      },
      source: {
        type: 'string',
        maxLength: 100,
        description: 'Источник обращения (страница сайта, баннер, калькулятор)'
      },
      honeypot: {
        type: 'string',
        maxLength: 0,
        description: 'Антиспам ловушка (должно быть пустым)'
      }
    },
    additionalProperties: true,
    examples: [
      {
        name: 'Иванов Петр Сергеевич',
        phone: '+7 (846) 954-02-92',
        email: 'p.ivanov@samara-aviation.ru',
        company: 'АО «Авиаагрегат-Самара»',
        serviceType: '3D-контроль геометрии и калибровка КИМ',
        city: 'Самара',
        message: 'Требуется провести лазерное 3D-сканирование оснастки штампового производства.'
      }
    ]
  },

  // 2. Экспресс-заказ обратного звонка
  quickCallback: {
    $id: 'https://ds-enginering.ru/schemas/quick-callback.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Экспресс обратный звонок',
    description: 'Схема запроса на обратный звонок инженера или консультанта',
    type: 'object',
    required: ['customerName', 'phone'],
    properties: {
      customerName: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
        description: 'Имя заказчика'
      },
      phone: {
        type: 'string',
        minLength: 7,
        maxLength: 30,
        pattern: '^[\\d\\s\\+\\-\\(\\)]+$',
        description: 'Номер телефона для обратного звонка'
      },
      companyName: {
        type: 'string',
        maxLength: 200,
        description: 'Название компании'
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 120,
        description: 'Email для отправки материалов'
      },
      topic: {
        type: 'string',
        maxLength: 200,
        description: 'Тема консультации (КИМ, TopSolid, Постпроцессоры, Обучение)'
      },
      preferredTime: {
        type: 'string',
        maxLength: 100,
        description: 'Удобное время звонка'
      },
      comment: {
        type: 'string',
        maxLength: 2000,
        description: 'Комментарий к запросу'
      }
    },
    additionalProperties: true,
    examples: [
      {
        customerName: 'Алексей Смирнов',
        phone: '+7 (927) 700-11-22',
        companyName: 'ООО «Тольяттинский Механический Завод»',
        topic: 'Консультация по выбору портальной КИМ',
        preferredTime: 'Сегодня с 14:00 до 16:00'
      }
    ]
  },

  // 3. Заявка с калькулятора услуг (RFQ)
  rfqSubmission: {
    $id: 'https://ds-enginering.ru/schemas/rfq-submission.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Запрос коммерческого предложения с калькулятора (RFQ)',
    description: 'Схема данных расчета стоимости услуг с параметрами деталей, точности и объемов',
    type: 'object',
    required: ['customerName', 'phone', 'serviceType'],
    properties: {
      customerName: {
        type: 'string',
        minLength: 2,
        maxLength: 120,
        description: 'ФИО инженера или представителя заказчика'
      },
      phone: {
        type: 'string',
        minLength: 7,
        maxLength: 30,
        pattern: '^[\\d\\s\\+\\-\\(\\)]+$',
        description: 'Контактный телефон'
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 120,
        description: 'Email для отправки официального ТКП'
      },
      companyName: {
        type: 'string',
        maxLength: 200,
        description: 'Организация заказчика'
      },
      serviceType: {
        type: 'string',
        minLength: 2,
        maxLength: 150,
        description: 'Выбранный вид инженерных работ'
      },
      details: {
        type: 'string',
        maxLength: 5000,
        description: 'Технические параметры и габариты изделия'
      },
      estimatedPrice: {
        type: 'number',
        minimum: 0,
        description: 'Расчетная предварительная стоимость (руб.)'
      },
      cadFormat: {
        type: 'string',
        maxLength: 50,
        description: 'Формат исходной 3D-модели (STEP, IGES, Parasolid, TopSolid)'
      },
      dimensionMm: {
        type: 'number',
        minimum: 0,
        description: 'Максимальный габарит изделия в мм'
      },
      toleranceMm: {
        type: 'number',
        minimum: 0,
        description: 'Требуемый допуск точности в мм'
      },
      batchSize: {
        type: 'integer',
        minimum: 1,
        description: 'Количество деталей в партии'
      }
    },
    additionalProperties: true,
    examples: [
      {
        customerName: 'Кузнецов Роман Викторович',
        phone: '+7 (8482) 75-90-10',
        email: 'r.kuznetsov@t-eng.ru',
        companyName: 'ЗАО «ПромИнжиниринг»',
        serviceType: 'Разработка постпроцессора для 5-осевого станка ЧПУ',
        details: 'Станок Hermle C42U, ЧПУ Heidenhain TNC 640. Требуется симуляция и верификация кинематики.',
        estimatedPrice: 185000,
        cadFormat: 'STEP / TopSolid'
      }
    ]
  },

  // 4. Заявка в службу техподдержки (B2B Ticket)
  ticketCreate: {
    $id: 'https://ds-enginering.ru/schemas/ticket-create.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Создание инцидента / тикета техподдержки',
    description: 'Схема создания заявки на сервисное обслуживание, калибровку КИМ или техподдержку ПО',
    type: 'object',
    required: ['title', 'category', 'urgency', 'description'],
    properties: {
      title: {
        type: 'string',
        minLength: 3,
        maxLength: 250,
        description: 'Краткое наименование темы инцидента'
      },
      category: {
        type: 'string',
        enum: ['calibration', 'repair', 'postprocessor', 'reverse_engineering', 'consulting', 'software_license', 'other'],
        description: 'Инженерная категория заявки'
      },
      urgency: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        description: 'Уровень критичности инцидента'
      },
      description: {
        type: 'string',
        minLength: 5,
        maxLength: 10000,
        description: 'Подробное описание проблемы, кодов ошибок и условий возникновения'
      },
      organizationId: {
        type: 'string',
        maxLength: 200,
        description: 'Наименование предприятия заказчика'
      },
      equipmentModel: {
        type: 'string',
        maxLength: 200,
        description: 'Модель КИМ, измерительной руки или версия CAD/CAM'
      },
      equipmentSerial: {
        type: 'string',
        maxLength: 100,
        description: 'Заводской серийный номер оборудования'
      }
    },
    additionalProperties: true,
    examples: [
      {
        title: 'Периодическая юстировка оптической головки КИМ DEA Global',
        category: 'calibration',
        urgency: 'high',
        organizationId: 'ПАО «ОДК-Кузнецов»',
        equipmentModel: 'DEA Global Advantage 09.15.08',
        equipmentSerial: 'DEA-SAM-8891',
        description: 'При калибровке щупа Renishaw SP25M превышено допустимое отклонение сферы на 4.2 мкм.'
      }
    ]
  },

  // 5. Сообщение в чат дежурного инженера
  engineerChatMessage: {
    $id: 'https://ds-enginering.ru/schemas/engineer-chat-message.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Сообщение в чат дежурного инженера',
    description: 'Схема сообщения в онлайн-консультации реального времени',
    type: 'object',
    required: ['sessionId', 'text', 'sender'],
    properties: {
      sessionId: {
        type: 'string',
        minLength: 3,
        maxLength: 100,
        description: 'Идентификатор сессии чата'
      },
      text: {
        type: 'string',
        minLength: 1,
        maxLength: 4000,
        description: 'Текст сообщения'
      },
      sender: {
        type: 'string',
        enum: ['user', 'engineer', 'system'],
        description: 'Тип отправителя'
      },
      senderName: {
        type: 'string',
        maxLength: 100,
        description: 'Имя отправителя (клиент или ФИО инженера)'
      }
    },
    additionalProperties: false,
    examples: [
      {
        sessionId: 'eng-chat-8934',
        text: 'Здравствуйте! Подскажите, поддерживает ли TopSolid 7 импорт фасеточных сеток STL для обратного инжиниринга?',
        sender: 'user',
        senderName: 'Инженер-конструктор ОГТ'
      }
    ]
  },

  // 6. CRM Сделка (Создание / Редактирование)
  crmDeal: {
    $id: 'https://ds-enginering.ru/schemas/crm-deal.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Сделка в CRM-системе',
    description: 'Схема создания и ведения коммерческой сделки в инжиниринговой воронке',
    type: 'object',
    required: ['companyName'],
    properties: {
      title: {
        type: 'string',
        maxLength: 250,
        description: 'Название проекта или сделки'
      },
      serviceType: {
        type: 'string',
        maxLength: 500,
        description: 'Тип оборудования, ПО или инжиниринговой услуги (предмет сделки)'
      },
      companyName: {
        type: 'string',
        minLength: 1,
        maxLength: 250,
        description: 'Контрагент / Организация'
      },
      customerName: {
        type: 'string',
        maxLength: 150,
        description: 'Контактное лицо заказчика'
      },
      phone: {
        type: 'string',
        maxLength: 30,
        description: 'Телефон контактного лица'
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 120,
        description: 'Email для связи'
      },
      stage: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'Идентификатор этапа воронки продаж (lead, audit, tender, tkp, demo, contract, logistics, implementation, closed_won, completed, new, estimate, nda, cross_sell, ticket, diagnostics, maintenance, resolution, lost и др.)'
      },
      funnel: {
        type: 'string',
        maxLength: 100,
        description: 'Идентификатор воронки продаж (equipment, services, support или пользовательская)'
      },
      budget: {
        type: 'number',
        minimum: 0,
        description: 'Сумма сделки в рублях'
      },
      currency: {
        type: 'string',
        enum: ['RUB', 'EUR', 'USD', 'CNY'],
        default: 'RUB',
        description: 'Валюта расчета'
      },
      responsibleManager: {
        type: 'string',
        maxLength: 150,
        description: 'Ответственный куратор сделки'
      },
      direction: {
        type: 'string',
        maxLength: 150,
        description: 'Инженерное направление сделки'
      },
      description: {
        type: 'string',
        maxLength: 5000,
        description: 'Детальные примечания к сделке'
      }
    },
    additionalProperties: true,
    examples: [
      {
        title: 'Поставка лицензий TopSolid 7' + ' ' + 'Design & Cam 5D',
        companyName: 'АО «РКЦ «Прогресс»',
        customerName: 'Михайлов Игорь Александрович',
        phone: '+7 (846) 228-00-00',
        email: 'i.mikhailov@progress-samara.ru',
        stage: 'kp_sent',
        budget: 1450000,
        responsibleManager: 'Скобелев Александр Сергеевич',
        direction: 'Программное обеспечение TopSolid'
      }
    ]
  },

  // 7. Коммерческое предложение (ТКП)
  crmProposal: {
    $id: 'https://ds-enginering.ru/schemas/crm-proposal.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Коммерческое предложение (ТКП)',
    description: 'Схема структурированного коммерческого предложения на оборудование, ПО или услуги',
    type: 'object',
    properties: {
      number: {
        type: 'string',
        maxLength: 50,
        description: 'Номер ТКП (например, ТКП-2026-089)'
      },
      outgoingNumber: {
        type: 'string',
        maxLength: 50,
        description: 'Исходящий номер ТКП'
      },
      title: {
        type: 'string',
        maxLength: 250,
        description: 'Предмет коммерческого предложения'
      },
      content: {
        type: 'string',
        description: 'Содержание или предмет предложения'
      },
      customerCompany: {
        type: 'string',
        maxLength: 250,
        description: 'Предприятие-получатель'
      },
      toCompany: {
        type: 'string',
        maxLength: 250,
        description: 'Организация заказчика'
      },
      totalSum: {
        type: 'number',
        minimum: 0,
        description: 'Итоговая сумма предложения'
      },
      currency: {
        type: 'string',
        default: 'RUB',
        description: 'Валюта ТКП'
      },
      validUntil: {
        type: 'string',
        description: 'Срок действия ТКП'
      },
      preparedBy: {
        type: 'string',
        maxLength: 150,
        description: 'ФИО составителя ТКП'
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name', 'price', 'quantity'],
          properties: {
            name: { type: 'string', minLength: 1 },
            price: { type: 'number', minimum: 0 },
            quantity: { type: 'number', minimum: 1 },
            unit: { type: 'string' },
            sum: { type: 'number', minimum: 0 }
          }
        },
        description: 'Спецификация позиций коммерческого предложения'
      }
    },
    additionalProperties: true
  },

  // 8. Договор инжиниринга / поставки
  crmContract: {
    $id: 'https://ds-enginering.ru/schemas/crm-contract.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Договор на поставку и оказание услуг',
    description: 'Схема учетной карточки договора в реестре контрактов',
    type: 'object',
    properties: {
      number: {
        type: 'string',
        maxLength: 50,
        description: 'Номер договора (например, ДС-2026/04-М)'
      },
      title: {
        type: 'string',
        maxLength: 250,
        description: 'Предмет договора'
      },
      scope: {
        type: 'string',
        maxLength: 500,
        description: 'Предмет договора или объем работ'
      },
      customerCompany: {
        type: 'string',
        maxLength: 250,
        description: 'Заказчик по договору'
      },
      company: {
        type: 'string',
        maxLength: 250,
        description: 'Заказчик / Контрагент по договору'
      },
      totalSum: {
        type: 'number',
        minimum: 0,
        description: 'Сумма договора с НДС'
      },
      curator: {
        type: 'string',
        maxLength: 150,
        description: 'Ответственный куратор договора'
      },
      curatorPhone: {
        type: 'string',
        maxLength: 30,
        description: 'Контактный телефон куратора'
      },
      status: {
        type: 'string',
        enum: ['draft', 'approval', 'active', 'completed', 'cancelled'],
        description: 'Статус исполнения договора'
      },
      signDate: {
        type: 'string',
        description: 'Дата заключения договора'
      },
      endDate: {
        type: 'string',
        description: 'Плановый срок завершения'
      }
    },
    additionalProperties: true
  },

  // 9. Контрагент (Компания CRM)
  crmCompany: {
    $id: 'https://ds-enginering.ru/schemas/crm-company.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Карточка предприятия-контрагента',
    description: 'Схема предприятия в справочнике компаний',
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 250,
        description: 'Полное наименование организации'
      },
      shortName: {
        type: 'string',
        maxLength: 150,
        description: 'Краткое наименование'
      },
      inn: {
        type: 'string',
        pattern: '^(\\d{10}|\\d{12})?$',
        description: 'ИНН юридического лица (10 или 12 цифр)'
      },
      kpp: {
        type: 'string',
        pattern: '^(\\d{9})?$',
        description: 'КПП организации (9 цифр)'
      },
      ogrn: {
        type: 'string',
        pattern: '^(\\d{13}|\\d{15})?$',
        description: 'ОГРН / ОГРНИП'
      },
      legalAddress: {
        type: 'string',
        maxLength: 500,
        description: 'Юридический адрес'
      },
      actualAddress: {
        type: 'string',
        maxLength: 500,
        description: 'Фактический адрес'
      },
      phone: {
        type: 'string',
        maxLength: 40,
        description: 'Телефон компании'
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 120,
        description: 'Корпоративный email'
      },
      city: {
        type: 'string',
        maxLength: 100,
        description: 'Город расположения'
      },
      industry: {
        type: 'string',
        maxLength: 150,
        description: 'Отрасль промышленности'
      }
    },
    additionalProperties: true
  },

  // 10. Контактное лицо CRM
  crmContact: {
    $id: 'https://ds-enginering.ru/schemas/crm-contact.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Контактное лицо заказчика',
    description: 'Схема ответственного специалиста или ЛПР на стороне контрагента',
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 150,
        description: 'ФИО контактного лица'
      },
      companyName: {
        type: 'string',
        maxLength: 250,
        description: 'Организация, в которой работает специалист'
      },
      position: {
        type: 'string',
        maxLength: 150,
        description: 'Должность (Главный метролог, Главный технолог и др.)'
      },
      phone: {
        type: 'string',
        maxLength: 40,
        description: 'Рабочий или мобильный телефон'
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 120,
        description: 'Рабочий email'
      },
      department: {
        type: 'string',
        maxLength: 150,
        description: 'Подразделение (ОТК, ОГТ, ОГМ, КБ)'
      }
    },
    additionalProperties: true
  },

  // 11. Отправка корпоративного Email
  emailSend: {
    $id: 'https://ds-enginering.ru/schemas/email-send.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Отправка корпоративного Email',
    description: 'Схема запроса на отправку официального уведомления или письма',
    type: 'object',
    required: ['to', 'subject'],
    properties: {
      to: {
        type: 'string',
        format: 'email',
        description: 'Email адрес получателя'
      },
      subject: {
        type: 'string',
        minLength: 1,
        maxLength: 300,
        description: 'Тема письма'
      },
      text: {
        type: 'string',
        maxLength: 50000,
        description: 'Текстовая версия письма'
      },
      html: {
        type: 'string',
        maxLength: 100000,
        description: 'HTML-разметка письма'
      },
      replyTo: {
        type: 'string',
        format: 'email',
        description: 'Адрес для ответа'
      }
    },
    additionalProperties: true
  },

  // 12. Настройки SMTP
  smtpSettings: {
    $id: 'https://ds-enginering.ru/schemas/smtp-settings.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Конфигурация SMTP почтового шлюза',
    description: 'Схема подключения к почтовому серверу компании',
    type: 'object',
    required: ['host', 'port', 'user'],
    properties: {
      host: {
        type: 'string',
        minLength: 2,
        maxLength: 250,
        description: 'Хост SMTP сервера (например, smtp.timeweb.ru)'
      },
      port: {
        type: 'integer',
        minimum: 1,
        maximum: 65535,
        description: 'Порт подключения (обычно 465 SSL или 587 STARTTLS)'
      },
      user: {
        type: 'string',
        minLength: 1,
        maxLength: 250,
        description: 'Имя пользователя / логин почтового ящика'
      },
      pass: {
        type: 'string',
        maxLength: 250,
        description: 'Пароль учетной записи почты'
      },
      secure: {
        type: 'boolean',
        description: 'Использовать SSL шифрование'
      },
      senderName: {
        type: 'string',
        maxLength: 150,
        description: 'Отображаемое имя отправителя («ДС-Инжиниринг»)'
      },
      senderEmail: {
        type: 'string',
        format: 'email',
        description: 'Официальный адрес отправки'
      }
    },
    additionalProperties: true
  },

  // 13. Аналитическое событие
  analyticsEvent: {
    $id: 'https://ds-enginering.ru/schemas/analytics-event.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Событие веб-аналитики и телеметрии',
    description: 'Схема трекинга просмотров и целевых действий пользователей',
    type: 'object',
    required: ['path'],
    properties: {
      path: {
        type: 'string',
        minLength: 1,
        maxLength: 500,
        description: 'URL путь страницы'
      },
      title: {
        type: 'string',
        maxLength: 300,
        description: 'Заголовок страницы'
      },
      category: {
        type: 'string',
        maxLength: 100,
        description: 'Категория события (клик, расчет, отправка формы)'
      },
      action: {
        type: 'string',
        maxLength: 100,
        description: 'Действие (form_submit, button_click, download_spec)'
      },
      label: {
        type: 'string',
        maxLength: 250,
        description: 'Дополнительная метка события'
      },
      value: {
        type: 'number',
        description: 'Числовое значение (например, расчетная сумма)'
      }
    },
    additionalProperties: true
  }
};
