import { PageId, OnlineEngineerMessage, OnlineEngineerSuggestion, SiteTopic } from '../types';

export interface EngineerKnowledgeResult {
  replyText: string;
  suggestions: OnlineEngineerSuggestion[];
  isHandoverTrigger?: boolean;
}


export const DEFAULT_SITE_TOPICS: SiteTopic[] = [
  {
    id: 'software-topsolid',
    title: 'TopSolid 7 CAD/CAM/PDM',
    keywords: ['topsolid', 'топсолид', 'cad', 'cam', 'кад', 'кам', 'фрезерование', 'токарка', '5-осевая', '5 осей', 'постпроцессор', 'pdm', 'проектирование', 'пресс-формы', 'штампы', 'листовой металл'],
    page: 'software',
    detailId: 'soft-topsolid',
    summary: 'TopSolid 7 — комплексное интегрированное решение CAD/CAM/PDM французской компании TOPSOLID SAS. Поддерживает проектирование деталей и сборок, 2D–5D фрезерование, токарно-фрезерную обработку, симуляцию с кинематикой станков и предотвращением коллизий, сквозную PDM для контроля версий.',
    actionLabel: 'Открыть каталог ПО TopSolid 7'
  },
  {
    id: 'software-polyworks',
    title: 'PolyWorks|Inspector™ и Modeler™',
    keywords: ['polyworks', 'поливоркс', 'поливорк', 'inspector', 'контроль геометрии', 'инспектор', 'сравнение с cad', 'карта отклонений', 'gd&t', 'облако точек', 'поверка'],
    page: 'software',
    detailId: 'soft-polyworks',
    summary: 'PolyWorks|Inspector™ — универсальное метрологическое ПО от InnovMetric. Обеспечивает контроль формы и расположения (GD&T по ГОСТ и ISO) относительно исходной 3D CAD-модели и автоматическое формирование протоколов для ОТК.',
    actionLabel: 'Подробнее о PolyWorks'
  },
  {
    id: 'hardware-cmm',
    title: 'Координатно-измерительные машины (КИМ)',
    keywords: ['ким', 'координатно-измерительн', 'измерительная машина', 'портальная ким', 'мостовая ким', 'renishaw', 'щуп', 'поверка ким', 'точность ким', '10360'],
    page: 'hardware',
    detailId: 'hw-cmm-bridge',
    summary: 'Стационарные координатно-измерительные машины портального и мостового типа на гранитных направляющих. Оснащаются измерительными системами Renishaw (PH10M, SP25M, TP20). Погрешность измерений от 1.5 мкм. Поставляются с пусконаладкой и первичной поверкой по ГОСТ Р ИСО 10360-2.',
    actionLabel: 'Смотреть КИМ в каталоге'
  },
  {
    id: 'hardware-arms',
    title: 'Измерительные руки PMT Arm и Hexagon',
    keywords: ['рука', 'измерительная рука', 'pmt', 'arm', 'hexagon absolute', 'портативная ким', 'мобильная ким', 'шарнирн'],
    page: 'hardware',
    detailId: 'hw-pmt-arm',
    summary: 'Портативные 6- и 7-осевые измерительные руки PMT ALPHA ARM и Hexagon Absolute Arm. Рабочий диапазон измерений от 1.5 до 4.5 метров, система уравновешивания, возможность работы с контактными щупами и лазерными сканерами AS1 прямо в цехе на магнитных стойках.',
    actionLabel: 'Каталог измерительных рук'
  },
  {
    id: 'hardware-scanners',
    title: 'Промышленные лазерные 3D-сканеры',
    keywords: ['сканер', '3d-сканер', '3д сканер', 'shining', 'freescan', 'einscan', 'лазерный сканер', 'синий лазер', 'сканирование', 'as1', 'hexagon as1'],
    page: 'hardware',
    detailId: 'hw-freescan-ue',
    summary: 'Метрологические лазерные сканеры Shining 3D FreeScan UE/Combo и Hexagon AS1. До 26 синих лазерных линий, точность от 0.020 мм, скорость сбора данных до 1 860 000 точек/сек. Идеально подходят для черных, полированных и зеркальных поверхностей без матирующего спрея.',
    actionLabel: 'Смотреть 3D-сканеры'
  },
  {
    id: 'hardware-trackers',
    title: 'Лазерные трекеры Leica Absolute Tracker',
    keywords: ['трекер', 'leica', 'лейка', 'tracker', 'at960', 'at403', 'крупногабаритн', '160 метров', 'авиастроение', 'турбин'],
    page: 'hardware',
    detailId: 'hw-leica-tracker',
    summary: 'Лазерные трекеры Leica Absolute Tracker серии AT960 и AT403. Сверхточные измерения крупногабаритных объектов (самолеты, ракеты, корпуса судов, роторы турбин) с рабочим объемом до 160 метров с точностью от 15 мкм.',
    actionLabel: 'Подробнее о лазерных трекерах'
  },
  {
    id: 'services-scanning-control',
    title: 'Услуги 3D-контроля геометрии и метрологии',
    keywords: ['контроль геометрии', 'услуга сканирования', 'протокол измерений', 'отклонения', 'биение', 'деформация', 'допуски', 'метрологический контроль', 'выезд'],
    page: 'services',
    detailId: 'srv-inspection',
    summary: 'Выполняем прецизионный 3D-контроль деталей и технологической оснастки мобильными КИМ и 3D-сканерами с выездом инженеров на ваше предприятие по всей России. Предоставляем цветные карты отклонений от CAD и подробные метрологические протоколы.',
    actionLabel: 'Услуги 3D-контроля геометрии'
  },
  {
    id: 'services-reverse',
    title: 'Реверс-инжиниринг (Обратный инжиниринг)',
    keywords: ['реверс', 'обратный инжиниринг', 'реверс-инжиниринг', 'построение модели', 'step', 'чертеж', 'импортозамещение', 'копия детали', 'изношенн'],
    page: 'services',
    detailId: 'srv-reverse',
    summary: 'Полный цикл реверс-инжиниринга: контактные измерения мобильной КИМ Hexagon и 3D-сканирование детали, анализ конструкторских баз и допусков, воссоздание точной твердотельной 3D CAD-модели (STEP, Parasolid, IGES) и оформление комплекта КД по ЕСКД для импортозамещения.',
    actionLabel: 'Заказать реверс-инжиниринг'
  },
  {
    id: 'services-postprocessors',
    title: 'Разработка постпроцессоров для станков с ЧПУ',
    keywords: ['постпроцессор', 'чпу', 'fanuc', 'heidenhain', 'sinumerik', 'siemens', 'haas', 'балт-систем', 'станок', 'g-код', 'кинематика', 'стойка'],
    page: 'services',
    detailId: 'srv-postprocessors',
    summary: 'Разработка и отладка постпроцессоров с 1995 года (более 30 лет опыта!). Создаем постпроцессоры для 3-, 4- и 5-осевых фрезерных, токарных, токарно-фрезерных станков и автоматов продольного точения под системы ЧПУ Fanuc, Siemens, Heidenhain, Haas. Полная 3D-кинематическая модель станка.',
    actionLabel: 'Заказ постпроцессора ЧПУ'
  },
  {
    id: 'services-calculator',
    title: 'Калькулятор стоимости услуг',
    keywords: ['калькулятор', 'расчет', 'цена', 'стоимость', 'прайс', 'сколько стоит', 'расценки', 'смета'],
    page: 'services',
    detailId: 'calculator',
    summary: 'На нашем сайте работает интерактивный калькулятор стоимости инженерных услуг. Вы можете указать габариты детали (мм), требуемый допуск (от 0.005 мм), тип услуги (сканирование, реверс, контроль) и мгновенно получить ориентировочный расчет сметы.',
    actionLabel: 'Перейти в онлайн-калькулятор'
  },
  {
    id: 'knowledge-gost',
    title: 'База знаний, ГОСТы и стандарты поверки',
    keywords: ['гост', 'стандарт', 'исо', '10360', 'база знаний', 'методика', 'калибровка', 'mpe', 'погрешность', 'руководство'],
    page: 'knowledge',
    summary: 'В нашей Базе знаний собраны нормативные документы, отраслевые стандарты метрологии (ГОСТ Р ИСО 10360-2, GD&T, требования к микроклимату 20±1°C), методические рекомендации и технические статьи ведущих метрологов.',
    actionLabel: 'Открыть Базу знаний и ГОСТы'
  },
  {
    id: 'news-articles',
    title: 'Пресс-центр, технические статьи и новости',
    keywords: ['статьи', 'новости', 'пресс-центр', 'кейсы', 'публикации', 'опыт'],
    page: 'news',
    summary: 'Раздел аналитических публикаций и технических статей наших инженеров: практические кейсы внедрения TopSolid 7, методики высокоточного сканирования сложных штампов и опыт импортозамещения узлов турбин.',
    actionLabel: 'Читать технические статьи'
  },
  {
    id: 'about-company',
    title: 'О компании «ДС‑Инжиниринг»',
    keywords: ['о компании', 'кто вы', 'история', 'опыт', 'инженеры', 'производство', 'лицензии', 'партнеры'],
    page: 'about',
    summary: '«ДС‑Инжиниринг» основана в 1995 году (более 30 лет на рынке CAD/CAM и метрологии). За это время реализовано более 350 промышленных проектов для предприятий двигателестроения, авиастроения, автомобилестроения и оборонного комплекса. Офисы в Самаре и Тольятти, выездные инженерные бригады по всей РФ.',
    actionLabel: 'О компании «ДС‑Инжиниринг»'
  },
  {
    id: 'contacts-office',
    title: 'Контакты, телефон и офис',
    keywords: ['контакты', 'телефон', 'адрес', 'где находитесь', 'почта', 'email', 'как связаться', 'реквизиты', 'самара'],
    page: 'contacts',
    summary: 'Главный офис инжиниринговой компании: 443051, г. Самара, ул. Свободы, д. 198. Представительство и отдел КИМ в Тольятти: Южное шоссе, 161В. Телефон: +7 (846) 954-02-92. Email: info@ds-enginering.ru. График работы: Пн–Пт с 09:00 до 17:00 (МСК+1).',
    actionLabel: 'Открыть страницу Контактов'
  }
];

export let SITE_TOPICS: SiteTopic[] = [...DEFAULT_SITE_TOPICS];

export function queryEngineerAssistant(query: string, currentContext?: { page?: PageId }): EngineerKnowledgeResult {
  const clean = query.trim().toLowerCase();

  // 1. Check for Manager / Human Handover Intent
  const humanHandoverKeywords = [
    'менеджер', 'человек', 'оператор', 'живой', 'специалист', 'позвоните', 'свяжитесь', 'перезвоните',
    'связаться с человеком', 'позови человека', 'позови менеджера', 'соединить', 'переключить', 'напишите на почту',
    'купить', 'счет', 'договор', 'коммерческое', 'кп', 'заказать'
  ];

  const wantsHandover = humanHandoverKeywords.some(k => clean.includes(k));

  if (wantsHandover) {
    return {
      replyText: `Я могу прямо сейчас подключить к нашему диалогу дежурного инженера-технолога или менеджера проектов «ДС‑Инжиниринг».

Менеджер ответит на все коммерческие вопросы, согласует условия договора, подготовит официальное КП или свяжется с вами по телефону.

Нажмите кнопку ниже или укажите ваши контакты (телефон или email) прямо в чате:`,
      suggestions: [
        {
          label: '👤 Подключить менеджера',
          actionType: 'handover'
        },
        {
          label: '📞 Позвонить: +7 (846) 205-00-30',
          actionType: 'call',
          url: 'tel:+78462050030'
        },
        {
          label: '✉️ Оставить заявку на сайте',
          actionType: 'modal',
          modalConfig: { title: 'Связь с дежурным инженером', formType: 'consultation' }
        }
      ],
      isHandoverTrigger: true
    };
  }

  // 2. Check for Greetings
  if (/^(привет|здравствуй|добрый день|доброе утро|добрый вечер|день добрый|салют)/i.test(clean)) {
    return {
      replyText: `Здравствуйте! Я дежурный инженер-технолог и интеллектуальный консультант «ДС‑Инжиниринг».

Я отлично ориентируюсь по всему нашему порталу, оборудованию и услугам. Чем могу помочь?
• Подобрать CAD/CAM систему (TopSolid 7) или метрологический софт (PolyWorks)
• Выбрать КИМ, измерительную руку PMT или 3D-сканер (Shining 3D, Hexagon)
• Рассчитать стоимость 3D-сканирования, контроля геометрии или реверс-инжиниринга
• Заказать разработку постпроцессора для станков с ЧПУ
• Соединить вас с живым менеджером или инженером`,
      suggestions: [
        { label: '🚀 Каталог ПО TopSolid 7', actionType: 'navigate', page: 'software' },
        { label: '🔬 КИМ и 3D-сканеры', actionType: 'navigate', page: 'hardware' },
        { label: '📐 Онлайн-калькулятор сметы', actionType: 'navigate', page: 'services' },
        { label: '👤 Позвать менеджера', actionType: 'handover' }
      ]
    };
  }

  // 3. Search matching topics from Knowledge Base
  let bestTopic: SiteTopic | null = null;
  let maxScore = 0;

  for (const topic of SITE_TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (clean.includes(kw)) {
        score += kw.length; // weight longer keyword matches higher
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestTopic = topic;
    }
  }

  // If match found with confidence
  if (bestTopic && maxScore > 2) {
    const suggestions: OnlineEngineerSuggestion[] = [
      {
        label: bestTopic.actionLabel,
        actionType: 'navigate',
        page: bestTopic.page,
        detailId: bestTopic.detailId
      }
    ];

    // Add contextual second suggestion
    if (bestTopic.page === 'services' || bestTopic.id.includes('calculator') || bestTopic.id.includes('scanning')) {
      suggestions.push({
        label: '📐 Рассчитать в калькуляторе',
        actionType: 'navigate',
        page: 'services'
      });
    } else if (bestTopic.page === 'software') {
      suggestions.push({
        label: '🖥️ Заказать демо TopSolid',
        actionType: 'modal',
        modalConfig: { title: 'Демонстрация TopSolid 7', defaultProduct: 'TopSolid 7', formType: 'demo' }
      });
    } else if (bestTopic.page === 'hardware') {
      suggestions.push({
        label: '📋 Запросить КП на оборудование',
        actionType: 'modal',
        modalConfig: { title: 'Запрос стоимости оборудования', formType: 'quote' }
      });
    }

    suggestions.push({
      label: '👤 Задать вопрос менеджеру',
      actionType: 'handover'
    });

    return {
      replyText: `${bestTopic.summary}\n\nВы можете перейти в соответствующий раздел сайта по кнопке ниже или задать уточняющий вопрос:`,
      suggestions
    };
  }

  // 4. Default Intelligent Fallback
  return {
    replyText: `Благодарю за вопрос! Как инженер «ДС‑Инжиниринг», я готов проконсультировать вас по ключевым направлениям:

1. Промышленный софт: CAD/CAM/PDM система TopSolid 7 (Франция) и ПО контроля качества PolyWorks (Канада).
2. Измерительное оборудование: стационарные КИМ, мобильные измерительные руки PMT Arm, ручные лазерные 3D-сканеры Shining 3D FreeScan и трекеры Leica.
3. Инжиниринговые услуги: контрактный 3D-контроль деталей с картой отклонений, реверс-инжиниринг, разработка постпроцессоров ЧПУ (Fanuc, Sinumerik, Heidenhain).

Хотите перейти в интересующий раздел сайта, рассчитать смету в калькуляторе или подключить дежурного инженера-менеджера?`,
    suggestions: [
      { label: '🚀 Каталог ПО', actionType: 'navigate', page: 'software' },
      { label: '🔬 Оборудование и КИМ', actionType: 'navigate', page: 'hardware' },
      { label: '🛠️ Инжиниринговые услуги', actionType: 'navigate', page: 'services' },
      { label: '👤 Подключить менеджера', actionType: 'handover' }
    ]
  };
}
export const updateSiteTopics = (topics: SiteTopic[]) => { SITE_TOPICS = topics; };
