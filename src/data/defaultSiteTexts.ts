export interface SiteTextsSection {
  [key: string]: string;
}

export interface SiteTextsData {
  home: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    metric1Value: string;
    metric1Label: string;
    metric1Desc: string;
    metric2Value: string;
    metric2Label: string;
    metric2Desc: string;
    metric3Value: string;
    metric3Label: string;
    metric3Desc: string;
    metric4Value: string;
    metric4Label: string;
    metric4Desc: string;
    contactCtaBadge: string;
    contactCtaTitle: string;
    contactCtaDesc: string;
    contactCtaLocation: string;
  };
  about: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    experienceBadge: string;
    metric1Value: string;
    metric1Label: string;
    metric1Desc: string;
    metric2Value: string;
    metric2Label: string;
    metric2Desc: string;
    metric3Value: string;
    metric3Label: string;
    metric3Desc: string;
    metric4Value: string;
    metric4Label: string;
    metric4Desc: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
  };
  contacts: {
    companyName: string;
    legalName: string;
    phoneMain: string;
    phoneSupport: string;
    emailMain: string;
    emailSupport: string;
    workHours: string;
    addressSamara: string;
    addressTolyatti: string;
    inn: string;
    ogrn: string;
    kpp: string;
    bank: string;
    bik: string;
    rs: string;
    ks: string;
  };
  services: {
    bannerBadge: string;
    bannerTitle: string;
    bannerSubtitle: string;
    guaranteeText: string;
  };
  catalogs: {
    hardwareBadge: string;
    hardwareTitle: string;
    hardwareSubtitle: string;
    softwareBadge: string;
    softwareTitle: string;
    softwareSubtitle: string;
  };
  footer: {
    topBannerTitle: string;
    topBannerSubtitle: string;
    companySlogan: string;
    copyrightText: string;
    disclaimerText: string;
  };
}

export const DEFAULT_SITE_TEXTS: SiteTextsData = {
  home: {
    heroBadge: 'Инженерно-технологический центр • Самара • Тольятти',
    heroTitle: 'Комплексные инжиниринговые решения, CAD/CAM/PDM системы и 3D-оборудование',
    heroSubtitle: 'Внедрение сквозной цифровой среды TopSolid 7, разработка постпроцессоров, поставка высокоточных КИМ PMT и 3D-сканеров Shining 3D с гарантией точности.',
    metric1Value: '31 год',
    metric1Label: 'Инженерной практики в РФ',
    metric1Desc: 'Самарская инженерная школа с 1995 года',
    metric2Value: '500+',
    metric2Label: 'Реализованных проектов',
    metric2Desc: 'В авиа-, авто- и приборостроении',
    metric3Value: '0.9 мкм',
    metric3Label: 'Гарантированная точность',
    metric3Desc: 'Метрологический контроль по ГОСТ Р ИСО 10360',
    metric4Value: '24/7',
    metric4Label: 'Инженерная поддержка',
    metric4Desc: 'Прямой доступ к ведущим разработчикам',
    contactCtaBadge: 'Инженерная поддержка и расчет',
    contactCtaTitle: 'Обсудите вашу задачу с инженерами «ДС‑Инжиниринг»',
    contactCtaDesc: 'Предоставим квалифицированную консультацию: оценим точность измерений, подберем конфигурацию оборудования или согласуем проведение пробного сканирования вашего образца.',
    contactCtaLocation: 'Самара • Тольятти (выезд специалистов по РФ)',
  },
  about: {
    heroBadge: 'Более 30 лет инженерной практики (с 1995 года) • Самара • Тольятти',
    heroTitle: 'О компании ООО «ДС‑Инжиниринг»',
    heroSubtitle: 'Российская инженерно-техническая компания: поставка измерительного оборудования и КИМ, внедрение CAD/CAM/PDM систем TopSolid 7, разработка постпроцессоров, высокоточная 3D-метрология и технический инструктаж специалистов.',
    experienceBadge: 'Более 30 лет инженерного опыта',
    metric1Value: '31 год',
    metric1Label: 'Опыта на рынке РФ (с 1995 г.)',
    metric1Desc: 'Самарская инженерная школа',
    metric2Value: '500+',
    metric2Label: 'Реализованных проектов',
    metric2Desc: 'В авиа-, авто- и приборостроении',
    metric3Value: '300+',
    metric3Label: 'Постпроцессоров ЧПУ',
    metric3Desc: 'Для 3-, 4- и 5-осевых станков',
    metric4Value: '2 офиса',
    metric4Label: 'И метрологический зал',
    metric4Desc: 'Самара и «Жигулевская долина»',
    pillar1Title: 'Инженерный подход',
    pillar1Desc: 'Мы не просто поставляем оборудование и лицензии, а решаем конкретные производственные задачи: создаем технологические процессы, отрабатываем управляющие программы на станках заказчика и гарантируем результат.',
    pillar2Title: 'Метрологическая точность',
    pillar2Desc: 'Собственный Метрологический зал в Технопарке «Жигулевская долина» (Тольятти) оснащен эталонными КИМ и лазерными сканерами с точностью до 0.9 мкм, поверенными во ВНИИМС.',
    pillar3Title: 'Прямая поддержка и обучение',
    pillar3Desc: 'Консультации технологов, разработка постпроцессоров и инструктаж персонала проводятся экспертами с практическим опытом внедрения на ведущих заводах РФ.',
  },
  contacts: {
    companyName: 'ДС‑Инжиниринг',
    legalName: 'ООО «ДС‑Инжиниринг»',
    phoneMain: '+7 (846) 954-02-92',
    phoneSupport: '+7 (846) 954-02-92',
    emailMain: 'info@ds-enginering.ru',
    emailSupport: 'support@ds-enginering.ru',
    workHours: 'Пн-Пт: 09:00 — 17:00 (МСК+1 / Самара)',
    addressSamara: '443051, Россия, г. Самара, ул. Свободы, д. 198',
    addressTolyatti: '445043, Самарская обл., г. Тольятти, Южное шоссе, 165 (Технопарк «Жигулевская долина», корп. 2.3 / 3.2)',
    inn: '6312025587',
    ogrn: '1026300777986',
    kpp: '631201001',
    bank: 'ООО «Банк Точка» г. Москва',
    bik: '044525104',
    rs: '40702810314500027317',
    ks: '30101810745374525104',
  },
  services: {
    bannerBadge: 'Инжиниринговый центр высокой точности',
    bannerTitle: 'Инжиниринговые услуги и 3D-метрология',
    bannerSubtitle: '3D-сканирование крупногабаритных объектов, реверс-инжиниринг деталей, разработка постпроцессоров для ЧПУ станков и контроль геометрии деталей с выездом по всей России.',
    guaranteeText: 'Гарантия точности по ГОСТ Р ИСО 10360, официальные протоколы измерений и сертификаты.',
  },
  catalogs: {
    hardwareBadge: 'Высокоточное измерительное оборудование',
    hardwareTitle: 'Каталог 3D-сканеров и координатно-измерительных машин',
    hardwareSubtitle: 'Стационарные и мобильные КИМ PMT, оптические и лазерные сканеры Shining 3D, лазерные трекеры Leica с поверкой и пусконаладкой.',
    softwareBadge: 'Инженерное и метрологическое ПО',
    softwareTitle: 'Программное обеспечение для проектирования и 3D-контроля',
    softwareSubtitle: "Поставка и внедрение CAD/CAM/PDM систем, метрологических платформ для контроля геометрии и специализированного софта для реверс-инжиниринга.",
  },
  footer: {
    topBannerTitle: 'Нужна консультация по внедрению CAD/CAM, инжиниринговым услугам или метрологическому оборудованию?',
    topBannerSubtitle: 'Наши опытные инженеры проведут анализ ваших задач и подберут оптимальное решение.',
    companySlogan: 'Российский инженерно-технический центр: поставка КИМ и 3D-сканеров, внедрение CAD/CAM/PDM систем TopSolid 7, разработка постпроцессоров и реверс-инжиниринг.',
    copyrightText: '© 1995–2026 ООО «ДС‑Инжиниринг». Все права защищены.',
    disclaimerText: 'Информация на сайте носит ознакомительный характер и не является публичной офертой (ст. 437 ГК РФ).',
  },
};

export interface SiteTextMetaField {
  key: string;
  label: string;
  description: string;
  multiline?: boolean;
}

export interface SiteTextMetaCategory {
  id: keyof SiteTextsData;
  title: string;
  description: string;
  fields: SiteTextMetaField[];
}

export const SITE_TEXTS_METADATA: SiteTextMetaCategory[] = [
  {
    id: 'home',
    title: 'Главная страница',
    description: 'Заголовки, бейджи, цифры показателей и блок обратной связи на главной странице',
    fields: [
      { key: 'heroBadge', label: 'Бейдж в шапке главного экрана', description: 'Верхняя плашка над главным заголовком' },
      { key: 'heroTitle', label: 'Главный заголовок (Hero Title)', description: 'Основной крупный заголовок на первом экране', multiline: true },
      { key: 'heroSubtitle', label: 'Подзаголовок главного экрана', description: 'Текст под заголовком с описанием ключевых направлений', multiline: true },
      { key: 'metric1Value', label: 'Метрика 1: Значение', description: 'Например: 31 год' },
      { key: 'metric1Label', label: 'Метрика 1: Заголовок', description: 'Например: Опыта в РФ' },
      { key: 'metric1Desc', label: 'Метрика 1: Подпись', description: 'Пояснение под метрикой' },
      { key: 'metric2Value', label: 'Метрика 2: Значение', description: 'Например: 500+' },
      { key: 'metric2Label', label: 'Метрика 2: Заголовок', description: 'Например: Реализованных проектов' },
      { key: 'metric2Desc', label: 'Метрика 2: Подпись', description: 'Пояснение под метрикой' },
      { key: 'metric3Value', label: 'Метрика 3: Значение', description: 'Например: 0.9 мкм' },
      { key: 'metric3Label', label: 'Метрика 3: Заголовок', description: 'Например: Гарантированная точность' },
      { key: 'metric3Desc', label: 'Метрика 3: Подпись', description: 'Пояснение под метрикой' },
      { key: 'metric4Value', label: 'Метрика 4: Значение', description: 'Например: 24/7' },
      { key: 'metric4Label', label: 'Метрика 4: Заголовок', description: 'Например: Инженерная поддержка' },
      { key: 'metric4Desc', label: 'Метрика 4: Подпись', description: 'Пояснение под метрикой' },
      { key: 'contactCtaBadge', label: 'Бейдж блока обратной связи', description: 'Плашка над формой экспресс-заявки' },
      { key: 'contactCtaTitle', label: 'Заголовок блока обратной связи', description: 'Заголовок синего блока связи с инженерами' },
      { key: 'contactCtaDesc', label: 'Описание блока обратной связи', description: 'Текст под заголовком блока заявки', multiline: true },
      { key: 'contactCtaLocation', label: 'География выезда', description: 'Текст строки локаций' },
    ],
  },
  {
    id: 'about',
    title: 'О компании',
    description: 'Тексты баннера «О компании», миссии, ключевых преимуществ и опыта',
    fields: [
      { key: 'heroBadge', label: 'Бейдж баннера', description: 'Плашка над заголовком страницы «О компании»' },
      { key: 'heroTitle', label: 'Главный заголовок страницы', description: 'Заголовок страницы «О компании»' },
      { key: 'heroSubtitle', label: 'Вводный текст компании', description: 'Главное описание компании и её статуса', multiline: true },
      { key: 'experienceBadge', label: 'Плашка опыта в карточке логотипа', description: 'Например: Более 30 лет инженерного опыта' },
      { key: 'metric1Value', label: 'Показатель 1: Значение', description: 'Например: 31 год' },
      { key: 'metric1Label', label: 'Показатель 1: Подпись', description: 'Например: Опыта на рынке РФ' },
      { key: 'metric1Desc', label: 'Показатель 1: Пояснение', description: 'Школа и традиции' },
      { key: 'metric2Value', label: 'Показатель 2: Значение', description: 'Например: 500+' },
      { key: 'metric2Label', label: 'Показатель 2: Подпись', description: 'Например: Реализованных проектов' },
      { key: 'metric2Desc', label: 'Показатель 2: Пояснение', description: 'Отрасли заказчиков' },
      { key: 'metric3Value', label: 'Показатель 3: Значение', description: 'Например: 300+' },
      { key: 'metric3Label', label: 'Показатель 3: Подпись', description: 'Например: Постпроцессоров ЧПУ' },
      { key: 'metric3Desc', label: 'Показатель 3: Пояснение', description: 'Типы поддерживаемых станков' },
      { key: 'metric4Value', label: 'Показатель 4: Значение', description: 'Например: 2 офиса' },
      { key: 'metric4Label', label: 'Показатель 4: Подпись', description: 'Например: И метрологический зал' },
      { key: 'metric4Desc', label: 'Показатель 4: Пояснение', description: 'Города присутствия' },
      { key: 'pillar1Title', label: 'Опора 1: Заголовок', description: 'Первый столп философии компании' },
      { key: 'pillar1Desc', label: 'Опора 1: Описание', description: 'Подробное описание инженерного подхода', multiline: true },
      { key: 'pillar2Title', label: 'Опора 2: Заголовок', description: 'Второй столп философии компании' },
      { key: 'pillar2Desc', label: 'Опора 2: Описание', description: 'Подробное описание метрологической базы', multiline: true },
      { key: 'pillar3Title', label: 'Опора 3: Заголовок', description: 'Третий столп философии компании' },
      { key: 'pillar3Desc', label: 'Опора 3: Описание', description: 'Подробное описание обучения и поддержки', multiline: true },
    ],
  },
  {
    id: 'contacts',
    title: 'Контакты и реквизиты',
    description: 'Единые контактные телефоны, e-mail, адреса филиалов и платежные реквизиты ООО «ДС-Инжиниринг»',
    fields: [
      { key: 'companyName', label: 'Краткое название бренда', description: 'Например: ДС‑Инжиниринг' },
      { key: 'legalName', label: 'Полное юридическое наименование', description: 'Например: ООО «ДС‑Инжиниринг»' },
      { key: 'phoneMain', label: 'Основной номер телефона', description: 'Формат: +7 (846) 954-02-92' },
      { key: 'phoneSupport', label: 'Телефон технической поддержки', description: 'Прямой телефон инженеров' },
      { key: 'emailMain', label: 'Основной e-mail', description: 'Для общих запросов и ТЗ: info@ds-enginering.ru' },
      { key: 'emailSupport', label: 'E-mail техподдержки', description: 'Для сервисных заявок и САПР' },
      { key: 'workHours', label: 'График и режим работы', description: 'Например: Пн-Пт: 09:00 — 17:00 (МСК+1 / Самара)' },
      { key: 'addressSamara', label: 'Адрес главного офиса (Самара)', description: 'Юридический и фактический адрес в Самаре', multiline: true },
      { key: 'addressTolyatti', label: 'Адрес филиала (Тольятти)', description: 'Адрес офиса и метрологического зала в технопарке', multiline: true },
      { key: 'inn', label: 'ИНН организации', description: '10 цифр' },
      { key: 'ogrn', label: 'ОГРН организации', description: '13 цифр' },
      { key: 'kpp', label: 'КПП организации', description: '9 цифр' },
      { key: 'bank', label: 'Банк получателя', description: 'Наименование обслуживающего банка' },
      { key: 'bik', label: 'БИК банка', description: '9 цифр' },
      { key: 'rs', label: 'Расчетный счет (Р/С)', description: '20 цифр' },
      { key: 'ks', label: 'Корреспондентский счет (К/С)', description: '20 цифр' },
    ],
  },
  {
    id: 'services',
    title: 'Инжиниринговые услуги',
    description: 'Вводные тексты и слоганы каталога инжиниринговых услуг и 3D-метрологии',
    fields: [
      { key: 'bannerBadge', label: 'Бейдж шапки услуг', description: 'Верхняя плашка страницы услуг' },
      { key: 'bannerTitle', label: 'Заголовок страницы услуг', description: 'Главный заголовок раздела' },
      { key: 'bannerSubtitle', label: 'Подзаголовок каталога услуг', description: 'Пояснение направлений услуг', multiline: true },
      { key: 'guaranteeText', label: 'Текст гарантийного блока', description: 'Сертификация и соответствие стандартам' },
    ],
  },
  {
    id: 'catalogs',
    title: 'Каталоги ПО и Оборудования',
    description: 'Вводные заголовки и описания разделов станков, КИМ и программного обеспечения TopSolid',
    fields: [
      { key: 'hardwareBadge', label: 'Бейдж каталога оборудования', description: 'Например: Высокоточное измерительное оборудование' },
      { key: 'hardwareTitle', label: 'Заголовок каталога оборудования', description: 'Например: Каталог 3D-сканеров и КИМ' },
      { key: 'hardwareSubtitle', label: 'Описание каталога оборудования', description: 'Краткий анонс измерительных систем', multiline: true },
      { key: 'softwareBadge', label: 'Бейдж каталога ПО', description: 'Например: Интегрированная САПР / ЧПУ / PDM среда' },
      { key: 'softwareTitle', label: 'Заголовок каталога ПО', description: 'Например: Программное обеспечение TopSolid 7' },
      { key: 'softwareSubtitle', label: 'Описание каталога ПО', description: 'Краткий анонс модулей САПР TopSolid', multiline: true },
    ],
  },
  {
    id: 'footer',
    title: 'Подвал сайта (Footer) и дисклеймеры',
    description: 'Тексты верхнего баннера подвала, слоган компании и юридические уведомления',
    fields: [
      { key: 'topBannerTitle', label: 'Заголовок призыва к действию (CTA)', description: 'Текст синей плашки вверху подвала', multiline: true },
      { key: 'topBannerSubtitle', label: 'Подзаголовок призыва к действию (CTA)', description: 'Пояснение под заголовком синей плашки' },
      { key: 'companySlogan', label: 'Слоган в колонке «О компании»', description: 'Краткое позиционирование под логотипом', multiline: true },
      { key: 'copyrightText', label: 'Строка копирайта', description: 'Текст в самом низу страницы' },
      { key: 'disclaimerText', label: 'Юридический дисклеймер', description: 'Уведомление о публичной оферте', multiline: true },
    ],
  },
];
