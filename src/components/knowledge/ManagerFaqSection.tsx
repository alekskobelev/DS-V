import React, { useState, useEffect, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  FileCheck2, 
  LifeBuoy, 
  KeyRound, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Copy, 
  Sparkles, 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  ExternalLink,
  BookOpen,
  Filter,
  CheckSquare,
  Wrench,
  Send,
  Zap,
  Info,
  Users,
  Calendar,
  Gauge,
  ClipboardCheck,
  FileBadge
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'crm' | 'contracts' | 'support' | 'proposals' | 'licenses' | 'contacts' | 'tasks' | 'fleet' | 'metrology' | 'general';
  categoryLabel: string;
  question: string;
  summary: string;
  badge?: string;
  badgeColor?: string;
  steps: {
    title: string;
    description: string;
    tip?: string;
  }[];
  detailedNotes?: string[];
  checklist?: string[];
  tags: string[];
}

export const MANAGER_FAQ_DATA: FaqItem[] = [
  {
    id: 'crm-flow-stages',
    category: 'crm',
    categoryLabel: 'CRM & Воронки продаж',
    question: 'Как правильно вести сделку в CRM и переводить её по этапам воронки?',
    summary: 'Регламент перемещения карточки клиента по Kanban-доске, фиксация этапов, расчет Win Rate и предотвращение зависания сделок.',
    badge: 'Основной регламент',
    badgeColor: 'blue',
    steps: [
      {
        title: 'Шаг 1: Принятие входящего лида (до 15 минут)',
        description: 'Откройте раздел CRM «Сделки и Воронки». Новый лид с сайта или калькулятора поступает в колонку «Новый лид / RFQ». Проверьте контакты, ИНН компании и суть запроса (поставка КИМ, 3D-сканирование, ПО TopSolid/PolyWorks, разработка постпроцессора).',
        tip: 'Нажмите на карточку, назначьте себя ответственным менеджером и добавьте первую заметку о звонке клиенту.'
      },
      {
        title: 'Шаг 2: Технический аудит и спецификация',
        description: 'Перетащите сделку в колонку «Технический аудит». Подключите профильного инженера (куратора) для анализа чертежей, точностных требований (мкм) или кинематики станка. Заполните вкладку «Спецификация» в карточке сделки.',
        tip: 'Укажите номенклатуру, базовую стоимость и скидку. Сумма сделки пересчитается автоматически.'
      },
      {
        title: 'Шаг 3: Формирование и отправка ТКП',
        description: 'Переведите сделку в «ТКП / Тендер». Перейдите в «Реестр КП» или сформируйте коммерческое предложение прямо из сделки. Отправьте клиенту через шлюз Яндекс 360.',
        tip: 'Всегда ставьте дату следующего контакта («Контрольный звонок через 3 дня»).'
      },
      {
        title: 'Шаг 4: Демонстрация и согласование Договора',
        description: 'После согласования коммерческих условий переведите сделку в «Договор и аванс». Загрузите проект договора с протоколом разногласий. Контролируйте поступление аванса (обычно 50% или 70%).',
        tip: 'Вероятность закрытия (Win Rate) на этом этапе составляет 80%.'
      },
      {
        title: 'Шаг 5: Исполнение, ПНР и Успешное закрытие',
        description: 'После поставки оборудования/ПО, проведения пусконаладки и подписания двустороннего Акта сдачи-приемки перетащите сделку в «Успешно реализовано (100%)».',
        tip: 'Сделка автоматически связывается с выданными лицензиями и договором в Личном кабинете.'
      }
    ],
    detailedNotes: [
      'Каждая сделка должна иметь заполненный бюджет и ответственного сотрудника.',
      'Запрещено оставлять сделку без следующего запланированного действия более 5 рабочих дней.',
      'В случае отказа обязательно перетаскивайте в колонку «Отказ / Архив» с выбором причины (Дорого, Выбор конкурента, Заморозка бюджета).'
    ],
    checklist: [
      'Проверен ИНН и юридическая чистота контрагента',
      'Заполнены контактные лица (Гл. технолог, Главный метролог, Отдел закупок)',
      'Сформирована спецификация в карточке сделки',
      'Отправлено официальное ТКП с номером КП-2026/XXX',
      'Зафиксирована дата следующего контакта'
    ],
    tags: ['CRM', 'Воронки', 'Kanban', 'Этапы сделки', 'Лид', 'Win Rate']
  },
  {
    id: 'crm-lost-reasons',
    category: 'crm',
    categoryLabel: 'CRM & Воронки продаж',
    question: 'Что делать, если клиент отказывается от сделки, и как фиксировать отказ?',
    summary: 'Порядок фиксации срыва сделки (Lost Deal), анализ причин и возможность повторной реактивации через 3–6 месяцев.',
    badge: 'Аналитика потерь',
    badgeColor: 'amber',
    steps: [
      {
        title: 'Шаг 1: Выяснение истинной причины',
        description: 'Проведите контрольный диалог с ЛПР (лицом, принимающим решение). Зафиксируйте: перенос бюджета на следующий год, закупка б/у оборудования, выбор другого поставщика (уточнить бренд) или изменение техпроцесса.',
      },
      {
        title: 'Шаг 2: Перемещение в колонку «Отказ / Архив»',
        description: 'Захватите карточку сделки мышью и перетащите в крайнюю правую колонку «Отказ / Архив». Откроется модальное окно фиксации отказа.',
      },
      {
        title: 'Шаг 3: Выбор категории причины и комментарий',
        description: 'Выберите одну из стандартных причин: «Высокая цена / Бюджет», «Выбран конкурент», «Сроки поставки», «Проект заморожен заказчиком», «Не подошли технические параметры». Обязательно впишите развернутый комментарий.',
      },
      {
        title: 'Шаг 4: Назначение даты реактивации',
        description: 'Если проект заморожен, укажите дату напоминания в календаре (например, IV квартал 2026 г.) для повторного звонка.',
      }
    ],
    detailedNotes: [
      'Анализ причин отказов еженедельно выгружается в сводный отчет коммерческого директора.',
      'Не удаляйте карточки сделок! Только перемещение в архив сохраняет сквозную историю взаимодействий.'
    ],
    tags: ['Отказ', 'Lost Reason', 'Архив', 'Аналитика', 'Причины срыва']
  },
  {
    id: 'contracts-flow-registration',
    category: 'contracts',
    categoryLabel: 'Реестр Договоров & Проекты',
    question: 'Как зарегистрировать новый Договор, привязать куратора и контролировать оплаты?',
    summary: 'Пошаговая инструкция по внесению договора в Реестр, загрузке сканов, графику оплат и синхронизации с Личным кабинетом заказчика.',
    badge: 'Юридический учет',
    badgeColor: 'emerald',
    steps: [
      {
        title: 'Шаг 1: Переход в Реестр Договоров',
        description: 'В Личном кабинете или в CRM откройте вкладку «Реестр Договоров». Нажмите кнопку «+ Добавить договор» в правом верхнем углу.',
      },
      {
        title: 'Шаг 2: Заполнение основных реквизитов',
        description: 'Внесите номер договора в корпоративном формате (например, ДОГ-2026/042), дату подписания, выберите компанию-заказчика и привяжите сделку из CRM.',
        tip: 'В названии договора четко пишите предмет: «Поставка оптического 3D-сканера ScanLine-Pro + ПО PolyWorks Inspector».'
      },
      {
        title: 'Шаг 3: Назначение ведущего инженера (куратора)',
        description: 'Выберите ответственного куратора проекта из списка сертифицированных инженеров «ДС‑Инжиниринг» (Скобелев А.С., Ярыш И.В., Морозов В.Г.). Укажите его рабочий телефон.',
        tip: 'Куратор отобразится в кабинете клиента как прямое контактное лицо по техническим вопросам.'
      },
      {
        title: 'Шаг 4: Финансовый блок и график платежей',
        description: 'Укажите полную сумму контракта с НДС 22%, размер аванса (обычно 50%), статус оплаты (Ожидание счета / Аванс оплачен / Оплачено 100%).',
      },
      {
        title: 'Шаг 5: Загрузка документов и сроки гарантии',
        description: 'Прикрепите скан подписанного договора (PDF), спецификацию и техническое задание. Укажите срок действия гарантии и дату регламентной поверки КИМ (через 12 месяцев).',
      }
    ],
    detailedNotes: [
      'Все прикрепленные файлы мгновенно становятся доступны заказчику в его Личном кабинете во вкладке «Договоры и проекты».',
      'При завершении работ обязательно загрузите двусторонний подписанный Акт сдачи-приемки и переведите статус договора в «Исполнен».',
      'За 30 дней до истечения гарантии система отправляет менеджеру напоминание о предложении сервисного контракта.'
    ],
    checklist: [
      'Договор подписан обеими сторонами (ЭДО или оригиналы с синей печатью)',
      'Скан договора в формате PDF прикреплен к карточке',
      'Назначен ответственный куратор-инженер',
      'Зафиксированы даты окончания гарантии и подписки на обновления ПО',
      'Проставлена отметка об оплате аванса'
    ],
    tags: ['Реестр Договоров', 'Оплата', 'Аванс', 'Куратор', 'Акты', 'Гарантия', 'ЭДО']
  },
  {
    id: 'contracts-acts-closure',
    category: 'contracts',
    categoryLabel: 'Реестр Договоров & Проекты',
    question: 'Как закрыть контракт и прикрепить Акт сдачи-приемки и свидетельство о поверке?',
    summary: 'Порядок фиксации завершения пусконаладочных работ, ввода КИМ в эксплуатацию и передачи метрологических документов.',
    badge: 'Сдача проекта',
    badgeColor: 'teal',
    steps: [
      {
        title: 'Шаг 1: Проведение ПНР и подписание акта',
        description: 'Сервисный инженер проводит монтаж, калибровку и инструктаж операторов на предприятии клиента. Подписывается двусторонний Акт выполненных работ.',
      },
      {
        title: 'Шаг 2: Загрузка Акта в карточку договора',
        description: 'Откройте договор, нажмите «Добавить документ», выберите тип «Акт сдачи-приемки» и прикрепите скан с печатями.',
      },
      {
        title: 'Шаг 3: Внесение свидетельства о поверке ФГИС «АРШИН»',
        description: 'Для измерительных машин и эталонов прикрепите свидетельство о первичной государственной поверке с номером записи в реестре «АРШИН».',
      },
      {
        title: 'Шаг 4: Перевод договора в статус «Исполнен»',
        description: 'Измените статус на «Исполнен / На гарантии». С этого момента включается таймер гарантийного обслуживания (12 или 24 месяца).',
      }
    ],
    tags: ['Акт сдачи', 'ПНР', 'АРШИН', 'Поверка', 'Закрытие договора']
  },
  {
    id: 'support-ticket-lifecycle',
    category: 'support',
    categoryLabel: 'Заявки в техподдержку & Сервис',
    question: 'Как менеджеру и инженеру обрабатывать заявки в техподдержку (B2B Tickets)?',
    summary: 'Регламент регистрации сервисных инцидентов, соблюдение SLA, назначение инженеров и решение технических проблем заказчиков.',
    badge: 'SLA & Сервис',
    badgeColor: 'purple',
    steps: [
      {
        title: 'Шаг 1: Поступление заявки и оценка критичности (SLA)',
        description: 'Заявка от заказчика поступает через Личный кабинет или форму на сайте. Оцените приоритет: «Критический» (остановка производства/станка ЧПУ — реакция до 2 часов), «Высокий» (ошибка калибровки — до 4 часов), «Обычный» (консультация по CAD — до 24 часов).',
      },
      {
        title: 'Шаг 2: Назначение профильного инженера',
        description: 'Откройте заявку и назначьте специалиста: по вопросам САПР TopSolid 7 — инженера-технолога ЧПУ; по вопросам PolyWorks и КИМ — ведущего метролога; по оборудованию — инженера по ПНР.',
      },
      {
        title: 'Шаг 3: Коммуникация в чате обращения',
        description: 'Вся переписка с клиентом ведется внутри встроенного чата обращения. Запрашивайте логи ошибок, скриншоты, файлы деталей (STEP/TopSolid) и фото шильдиков оборудования.',
      },
      {
        title: 'Шаг 4: Выезд на объект или удаленное подключение',
        description: 'При необходимости инженер организует сессию удаленного доступа (AnyDesk / TeamViewer) или согласовывает командировку для физической юстировки КИМ.',
      },
      {
        title: 'Шаг 5: Решение и закрытие заявки',
        description: 'После устранения неисправности инженер публикует отчет о решении, прикрепляет скорректированный постпроцессор или отчет калибровки и переводит заявку в статус «Решено».',
      }
    ],
    detailedNotes: [
      'Заказчик получает автоматическое уведомление на email при каждом изменении статуса или новом сообщении.',
      'Заявка считается окончательно закрытой, когда клиент подтвердил успешную проверку на станке или КИМ.',
      'История решенных обращений формирует внутреннюю базу знаний технических решений.'
    ],
    checklist: [
      'Проверен серийный номер оборудования и наличие действующего договора техподдержки',
      'Назначен ответственный специалист в течение нормативного времени SLA',
      'Запрошены файлы логов и скриншоты аварийной ситуации',
      'Проверена работа скорректированного файла/постпроцессора на виртуальном станке',
      'Получено письменное подтверждение от оператора заказчика'
    ],
    tags: ['Сервисные заявки', 'Техподдержка', 'SLA', 'Сервис КИМ', 'ЧПУ', 'Инцидент']
  },
  {
    id: 'proposals-generator-flow',
    category: 'proposals',
    categoryLabel: 'Реестр КП & ТКП',
    question: 'Как быстро сформировать ТКП с авто-расчетом НДС 22% и фирменным бланком?',
    summary: 'Создание официального коммерческого предложения по инженерным шаблонам (TopSolid, PolyWorks, КИМ, 3D-сканирование) и экспорт в PDF.',
    badge: 'Продажи & Сметы',
    badgeColor: 'cyan',
    steps: [
      {
        title: 'Шаг 1: Создание КП из реестра или сделки',
        description: 'В разделе «Реестр КП» нажмите кнопку «+ Создать КП». Привяжите КП к существующей сделке в CRM или введите нового контрагента.',
      },
      {
        title: 'Шаг 2: Выбор инженерного шаблона',
        description: 'Выберите подходящий преднастроенный шаблон: «Поставка КИМ PMT Arm + PolyWorks», «САПР TopSolid 7 + Постпроцессор», «Услуги 3D-сканирования и реверс-инжиниринга деталей».',
      },
      {
        title: 'Шаг 3: Настройка номенклатуры и цен',
        description: 'Добавьте лицензии ПО, опции станков, аппаратные ключи HASP и пусконаладку. Укажите скидку. Система рассчитает сумму без НДС, сумму НДС 22% и итоговую сумму с НДС.',
      },
      {
        title: 'Шаг 4: Предпросмотр и печать в PDF',
        description: 'Нажмите «Печать / Экспорт PDF». Откроется чистовой бланк коммерческого предложения с логотипом «ДС‑Инжиниринг», подписями и юридическими реквизитами.',
      },
      {
        title: 'Шаг 5: Отправка и перевод статуса',
        description: 'Отправьте КП заказчику по почте. Переведите статус из «Черновик» в «Отправлено». При акцепте переведите в «Принято».',
      }
    ],
    tags: ['Реестр КП', 'ТКП', 'НДС 22%', 'Шаблоны', 'PDF', 'Смета']
  },
  {
    id: 'licenses-hasp-management',
    category: 'licenses',
    categoryLabel: 'Лицензии и ключи защиты',
    question: 'Как учитывать лицензии ПО, привязывать аппаратные ключи HASP и генерировать файлы .v2c?',
    summary: 'Регламент учета сетевых и локальных лицензий TopSolid 7, PolyWorks и Geomagic, номеров Dongle ID и продления подписки.',
    badge: 'Лицензирование',
    badgeColor: 'indigo',
    steps: [
      {
        title: 'Шаг 1: Внесение лицензии во вкладку «Лицензии»',
        description: 'В Личном кабинете откройте вкладку «Лицензии и ключи защиты». Нажмите «+ Добавить лицензию». Укажите наименование продукта и тип лицензии (Локальная HASP USB / Сетевая PDM / Плавающая).',
      },
      {
        title: 'Шаг 2: Указание серийных номеров и Dongle ID',
        description: 'Введите точный аппаратный номер ключа защиты (например, HASP-ID 0x4F92A1) и версию программного обеспечения (TopSolid v7.18, PolyWorks 2026).',
      },
      {
        title: 'Шаг 3: Привязка к Договору и Заказчику',
        description: 'Свяжите лицензию с номером договора поставки. Укажите дату окончания сервисного контракта (Maintenance).',
      },
      {
        title: 'Шаг 4: Загрузка файлов активации (.v2c / .c2v)',
        description: 'Прикрепите файл обновления лицензии (.v2c), сгенерированный вендором. Заказчик сможет скачать его прямо из своего личного кабинета для обновления ключа.',
      }
    ],
    tags: ['Лицензии', 'Ключи защиты', 'HASP', 'Dongle ID', 'v2c', 'TopSolid', 'PolyWorks']
  },
  {
    id: 'contacts-lpr-management',
    category: 'contacts',
    categoryLabel: 'Клиенты и ЛПР',
    question: 'Как вести учет промышленных заказчиков, находить ЛПР и фиксировать историю взаимодействия?',
    summary: 'Работа с карточкой предприятия, классификация по отраслям, фиксация контактных лиц (Главный метролог, Главный технолог) и выгрузка базы.',
    badge: 'База контрагентов',
    badgeColor: 'blue',
    steps: [
      {
        title: 'Шаг 1: Поиск или регистрация предприятия',
        description: 'В разделе «Клиенты и ЛПР» введите ИНН контрагента. Если завод уже есть в базе, откройте его профиль, чтобы не создавать дубли.',
      },
      {
        title: 'Шаг 2: Внесение лиц, принимающих решения (ЛПР)',
        description: 'Укажите статус ЛПР (Главный инженер, Главный метролог, Главный технолог, Нач. ОТК), добавочный рабочий телефон, мобильный и Telegram.',
        tip: 'Именно ЛПР получает официальное ТКП и согласовывает техническую часть договора.'
      },
      {
        title: 'Шаг 3: Фиксация парка оборудования клиента',
        description: 'Внесите информацию об установленных на заводе станках ЧПУ и измерительных машинах. Это поможет формировать прицельные КП на ретрофит или постпроцессоры.',
      }
    ],
    detailedNotes: [
      'При создании новой сделки или ТКП контрагент и контактное лицо подтягиваются из базы в 1 клик.',
      'Для региональных командировок доступна выгрузка списка предприятий выбранного города в Excel.'
    ],
    tags: ['Клиенты', 'ЛПР', 'ИНН', 'Предприятия', 'Контакты', 'База заводов']
  },
  {
    id: 'tasks-calendar-planning',
    category: 'tasks',
    categoryLabel: 'Календарь & Задачи',
    question: 'Как планировать выезды, встречи и контролировать дедлайны по сделкам в Календаре?',
    summary: 'Регламент постановки персональных задач, напоминаний о звонках, чек-листов подготовки к выездам и контроля просрочек.',
    badge: 'Тайм-менеджмент',
    badgeColor: 'purple',
    steps: [
      {
        title: 'Шаг 1: Создание задачи из сделки или календаря',
        description: 'Откройте вкладку «Календарь и задачи» или нажмите «+ Задача» в карточке сделки CRM.',
      },
      {
        title: 'Шаг 2: Указание типа и дедлайна',
        description: 'Выберите категорию: «Контрольный звонок ЛПР», «Выезд на аудит деталей», «Демонстрация PolyWorks / TopSolid», «Контроль аванса». Установите точную дату и время.',
      },
      {
        title: 'Шаг 3: Добавление чек-листа подготовки',
        description: 'Для выездных мероприятий внесите пункты: калибровка датчиков руки Hexagon, подготовка презентации, оформление командировочного удостоверения.',
      },
      {
        title: 'Шаг 4: Завершение и перенос в историю',
        description: 'После звонка или встречи отметьте задачу выполненной и напишите итоговый комментарий для коллег.',
      }
    ],
    tags: ['Календарь', 'Задачи', 'Дедлайн', 'Выезд', 'План', 'Чек-лист']
  },
  {
    id: 'fleet-calibration-arshin',
    category: 'fleet',
    categoryLabel: 'Парк приборов & СИ',
    question: 'Как контролировать поверку измерительных машин и трекеров по ФГИС «АРШИН»?',
    summary: 'Правила учета физического парка КИМ «ДС-Инжиниринг», предупреждения об истечении сроков поверки и недопущение использования непроверенных приборов.',
    badge: 'Метрологический контроль',
    badgeColor: 'teal',
    steps: [
      {
        title: 'Шаг 1: Проверка статуса прибора в реестре',
        description: 'Во вкладке «Применяемое оборудование» проверьте индикатор статуса: зеленый — годен, янтарный — поверка истекает менее чем через 30 дней, красный — поверка просрочена.',
      },
      {
        title: 'Шаг 2: Сверка номера записи в ФГИС «АРШИН»',
        description: 'Нажмите на номер записи Росстандарта, чтобы открыть электронную карточку поверки в Федеральном фонде по обеспечению единства измерений.',
      },
      {
        title: 'Шаг 3: Передача на периодическую поверку',
        description: 'За 30 дней до окончания срока прибор бронируется в лабораторию или отправляется во ВНИИМС/ЦСМ. В CRM статус меняется на «На поверке».',
      }
    ],
    detailedNotes: [
      'Категорически запрещено выезжать на коммерческие замеры и выдавать отчеты с приборов с истекшей поверкой.',
      'Все свидетельства автоматически синхронизируются с вкладкой «Свидетельства и сертификаты».'
    ],
    tags: ['АРШИН', 'КИМ', 'Поверка', 'Метрология', 'Росстандарт', 'Hexagon', 'Mitutoyo']
  },
  {
    id: 'metrology-reports-flow',
    category: 'metrology',
    categoryLabel: 'Метрологические отчеты',
    question: 'Как оформить протокол 3D-контроля, привязать цветовые карты GD&T и передать заказчику?',
    summary: 'Регламент формирования официальных метрологических отчетов по ГОСТ Р ИСО 10360, экспорт в PDF/Excel и синхронизация с ЛК клиента.',
    badge: 'Контроль геометрии',
    badgeColor: 'indigo',
    steps: [
      {
        title: 'Шаг 1: Создание протокола измерений',
        description: 'В разделе «Метрологические отчеты» нажмите «+ Создать отчет». Выберите контрагента, деталь и чертежный номер.',
      },
      {
        title: 'Шаг 2: Привязка поверенного прибора',
        description: 'Выберите КИМ или сканер из списка оборудования. Заводской номер и номер свидетельства АРШИН подставятся автоматически.',
      },
      {
        title: 'Шаг 3: Прикрепление цветовой карты отклонений GD&T',
        description: 'Загрузите PDF-отчет из PolyWorks|Inspector или Control X с цветовыми картами отклонений от CAD-модели и таблицей допусков формы и расположения.',
      },
      {
        title: 'Шаг 4: Подписание и публикация в ЛК',
        description: 'Укажите инженера-метролога. После проверки отчет переводится в статус «Выдан заказчику» и становится доступен в личном кабинете клиента.',
      }
    ],
    tags: ['Метрологический отчет', 'PolyWorks', 'GD&T', 'Протокол', 'Отклонения', '3D-контроль']
  }
];

export const ManagerFaqSection: React.FC<{ onContactExpert?: () => void; items?: any[] }> = ({ onContactExpert }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({ 'crm-flow-stages': true });
  const [copiedChecklistId, setCopiedChecklistId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Все темы и регламенты', icon: BookOpen },
    { id: 'crm', label: 'CRM & Воронки', icon: Layers },
    { id: 'contacts', label: 'Клиенты & ЛПР', icon: Users },
    { id: 'tasks', label: 'Календарь & Задачи', icon: Calendar },
    { id: 'proposals', label: 'Реестр КП', icon: FileText },
    { id: 'contracts', label: 'Реестр Договоров', icon: FileCheck2 },
    { id: 'fleet', label: 'Парк приборов & СИ', icon: Gauge },
    { id: 'metrology', label: 'Метрологические отчеты', icon: ClipboardCheck },
    { id: 'support', label: 'Заявки в техподдержку', icon: LifeBuoy },
    { id: 'licenses', label: 'Лицензии и ключи', icon: KeyRound },
  ];

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return MANAGER_FAQ_DATA.length;
    return MANAGER_FAQ_DATA.filter(item => item.category === catId).length;
  };

  const filteredFaqs = useMemo(() => {
    return MANAGER_FAQ_DATA.filter(item => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.question.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.steps.some(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) ||
        item.tags.some(t => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);


  // Auto-expand filtered FAQs
  useEffect(() => {
    if (activeCategory !== 'all' || searchQuery.trim()) {
      const newExpanded: Record<string, boolean> = {};
      filteredFaqs.forEach(faq => {
        newExpanded[faq.id] = true;
      });
      setExpandedIds(newExpanded);
    }
  }, [activeCategory, searchQuery, filteredFaqs]);

  const toggleAccordion = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };


  const handleCopyChecklist = (item: FaqItem) => {
    if (!item.checklist) return;
    const text = `ЧЕК-ЛИСТ МЕНЕДЖЕРА «ДС‑Инжиниринг»:\nТема: ${item.question}\n\n` + 
      item.checklist.map((c, i) => `${i + 1}. [ ] ${c}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedChecklistId(item.id);
    setTimeout(() => setCopiedChecklistId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Внутренний обучающий центр для менеджеров</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Интерактивный FAQ и пошаговые инструкции менеджера
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Подробные алгоритмы работы со сделками, ведением договоров, контролем оплат, обработкой сервисных заявок и управлением лицензиями на портале «ДС‑Инжиниринг».
            </p>
          </div>

          {/* Quick Workflow Flow Indicator */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl shadow-md space-y-1.5 shrink-0 max-w-xs w-full lg:w-auto backdrop-blur-xs">
            <div className="text-[11px] font-bold text-blue-300 uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Сквозная цепочка заказа:</span>
            </div>
            <div className="text-xs font-medium text-slate-200 leading-tight">
              Лид (CRM) ➔ ТКП (Реестр КП) ➔ Договор (Реестр) ➔ Лицензии ➔ Сервисные заявки
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT WRAPPER */}
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start mt-4">
        {/* SIDEBAR (Categories) */}
        <div className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-24 z-10">
          <div className="bg-white lg:bg-transparent lg:border-none lg:p-0 rounded-xl border border-gray-200 p-4 shadow-sm lg:shadow-none">
            <h3 className="font-bold text-gray-900 mb-3 hidden lg:block text-xs uppercase tracking-wider text-slate-500">
              Категории инструкций ({filteredFaqs.length})
            </h3>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex flex-col gap-1.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.id;
                const count = getCategoryCount(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`group flex items-center justify-between w-full text-left px-4.5 py-2.5 rounded-xl font-medium transition-all cursor-pointer border overflow-hidden ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 border-blue-300 font-bold shadow-xs ring-1 ring-blue-400/30"
                        : "bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1.5">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"}`} />
                      <span className="text-xs sm:text-[13px] leading-snug break-words">{cat.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 transition-colors ${
                      isSelected ? "bg-blue-200 text-blue-900" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile / Tablet Filter Pills */}
            <div className="lg:hidden flex flex-wrap gap-2 pb-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.id;
                const count = getCategoryCount(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer text-xs border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-bold"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-slate-500"}`} />
                    <span>{cat.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          
          {/* 2. Interactive Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по инструкциям (например: как закрыть договор, SLA по заявкам, отказ, НДС 22%, Dongle ID, аванс)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-slate-500 font-bold px-2 py-1 bg-gray-100 rounded-lg cursor-pointer"
              >
                Сбросить
              </button>
            )}
          </div>

          {/* 3. Interactive Accordion FAQ List */}
{/* 3. Interactive Accordion FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-gray-300 mx-auto" />
            <div className="text-sm font-bold text-gray-800">По вашему запросу инструкции не найдены</div>
            <p className="text-xs text-gray-500">Попробуйте изменить формулировку поиска или выберите категорию «Все темы».</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = !!expandedIds[faq.id];
            return (
              <div 
                key={faq.id}
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded 
                    ? 'border-blue-500/60 shadow-lg ring-1 ring-blue-500/20' 
                    : 'border-gray-200 hover:border-gray-300 shadow-xs'
                }`}
              >
                {/* Accordion Header Button */}
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer bg-white hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md">
                        {faq.categoryLabel}
                      </span>
                      {faq.badge && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-md uppercase">
                          {faq.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                      {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                      {faq.summary}
                    </p>
                  </div>

                  <div className={`p-2 rounded-xl bg-gray-100 text-slate-500 shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 bg-blue-50 text-blue-600' : ''
                  }`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {/* Expanded Accordion Body */}
                {isExpanded && (
                  <div className="px-5 pb-6 md:px-6 sm:pb-8 pt-2 border-t border-gray-100 space-y-6 text-xs sm:text-sm text-slate-500 leading-relaxed animate-in fade-in duration-200">
                    {/* Step-by-Step Action Boxes */}
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                        <span>Пошаговый алгоритм действий:</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-3">
                        {faq.steps.map((step, idx) => (
                          <div 
                            key={idx} 
                            className="bg-slate-50/80 p-4 rounded-xl border border-gray-200/90 space-y-1.5 hover:bg-blue-50/40 transition-colors"
                          >
                            <div className="font-bold text-gray-900 flex items-center gap-2 text-xs sm:text-sm">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center shrink-0 font-bold">
                                {idx + 1}
                              </span>
                              <span>{step.title}</span>
                            </div>
                            <p className="text-xs text-slate-500 pl-7 leading-relaxed">
                              {step.description}
                            </p>
                            {step.tip && (
                              <div className="ml-7 mt-1 text-[11px] font-medium text-blue-800 bg-blue-50 p-2 rounded-lg border border-blue-100 flex items-start gap-1.5">
                                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                <span>{step.tip}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Notes / Regulations */}
                    {faq.detailedNotes && faq.detailedNotes.length > 0 && (
                      <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-2">
                        <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          <span>Важные регламентные ограничения:</span>
                        </h4>
                        <ul className="space-y-1 text-xs text-amber-900 list-disc pl-5">
                          {faq.detailedNotes.map((note, nIdx) => (
                            <li key={nIdx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Interactive Checklist (with copy button) */}
                    {faq.checklist && faq.checklist.length > 0 && (
                      <div className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-900 dark:text-white p-4 sm:p-5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-xs space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>Операционный чек-лист менеджера:</span>
                          </div>
                          <button
                            onClick={() => handleCopyChecklist(faq)}
                            className="inline-flex items-center gap-1.5 px-4 py-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
                          >
                            {copiedChecklistId === faq.id ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Скопировано!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                <span>Скопировать чек-лист</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                          {faq.checklist.map((item, cIdx) => (
                            <div key={cIdx} className="flex items-start gap-2 bg-white dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-2xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags and Direct Nav Link */}
                    <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-gray-400 font-semibold">Теги:</span>
                        {faq.tags.map((tag) => (
                          <span 
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="px-2.5 py-0.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-slate-500 rounded-md text-[11px] cursor-pointer transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <a
                        href="/account"
                        className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <span>Перейти в рабочий модуль</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Support Helpline footer card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-bold flex items-center gap-2 text-amber-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Нужна дополнительная помощь по регламентам?</span>
          </div>
          <p className="text-xs text-blue-200 max-w-xl">
            Обратитесь к главному инженеру или администратору портала «ДС‑Инжиниринг» для консультации по нестандартным случаям или выездным аудитам.
          </p>
        </div>

        {onContactExpert && (
          <button
            onClick={onContactExpert}
            className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl text-xs shrink-0 transition-colors shadow-sm cursor-pointer"
          >
            Связаться с куратором
          </button>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};
