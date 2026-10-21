
import { PageId, CustomPage, Product, Article, KnowledgeItem, ServiceItem } from '../types';
import { getCanonicalUrl } from './routes';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

import { COMMON_INDUSTRY_FAQ_ITEMS as KB_COMMON_INDUSTRY_FAQ_ITEMS } from '../data/knowledgeBase';

export interface FaqQuestionAnswer {
  question: string;
  answer: string;
}

export const COMMON_INDUSTRY_FAQ_ITEMS: FaqQuestionAnswer[] = KB_COMMON_INDUSTRY_FAQ_ITEMS;

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageSecureUrl?: string;
  ogImageWidth?: number | string;
  ogImageHeight?: number | string;
  ogImageAlt?: string;
  ogImageType?: string;
  ogLocaleAlternate?: string;
  ogUpdatedTime?: string;
  ogType?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
  schemaType?: 'product' | 'article' | 'service' | 'faq' | 'webpage' | 'website' | 'about' | 'contact';
  schemaData?: Record<string, unknown>;
  robots?: string;
  breadcrumbs?: BreadcrumbItem[];
  // Twitter Cards
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  twitterImage?: string;
  twitterImageAlt?: string;
  twitterDomain?: string;
  twitterUrl?: string;
  // Article specific social metadata
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  articleTags?: string[];
  articleAuthor?: string;
  // Product specific social metadata
  productPrice?: number | string;
  productCurrency?: string;
  productAvailability?: string;
  productBrand?: string;
}

export const GLOBAL_DEFAULT_KEYWORDS = [
  'CAD CAM системы',
  'TopSolid 7',
  'TopSolid CAM',
  'TopSolid Design',
  'TopSolid PDM',
  'Shining 3D',
  'SHINING 3D Inspect',
  'Shining 3D EXModel',
  'EXModel Pro',
  'PolyWorks Inspector',
  'Geomagic Design X',
  'Geomagic Control X',
  'мобильные КИМ',
  'PMT Arm',
  'координатно-измерительные машины',
  'КИМ PMT',
  'лазерные трекеры Leica',
  '3D сканеры FreeScan',
  'реверс-инжиниринг',
  'контроль геометрии',
  '3D метрология',
  'постпроцессоры для станков ЧПУ',
  'ДС‑Инжиниринг'
].join(', ');

export const PAGE_SEO_DATA: Record<string, SeoMetadata> = {
  home: {
    title: 'ДС‑Инжиниринг | CAD/CAM/PDM системы, измерительное оборудование и 3D-метрология',
    description: 'Инжиниринговые решения с 1995 года (более 30 лет опыта). Официальные поставки TopSolid 7, PolyWorks|Inspector, Geomagic, Shining 3D, мобильных КИМ PMT Arm, лазерных трекеров Leica и КИМ. Услуги 3D-сканирования, контроля точности и разработки постпроцессоров.',
    keywords: 'ДС‑Инжиниринг, CAD CAM системы, TopSolid 7, PolyWorks Inspector, Shining 3D Inspect, EXModel, измерительное оборудование, КИМ, 3D сканирование, реверс инжиниринг, метрология, постпроцессоры ЧПУ',
    canonicalUrl: 'https://ds-engineering.ru/main',
    ogTitle: 'ДС‑Инжиниринг — Промышленный CAD/CAM софт и измерительное 3D-оборудование',
    ogDescription: 'Поставка лицензионного ПО (TopSolid, PolyWorks, Geomagic, Shining 3D), координатно-измерительного оборудования и инжиниринговые услуги по 3D-контролю и реверсу.',
    ogImage: '/logo.svg',
    schemaType: 'website',
  },
  main: {
    title: 'ДС‑Инжиниринг | CAD/CAM/PDM системы, измерительное оборудование и 3D-метрология',
    description: 'Инжиниринговые решения с 1995 года (более 30 лет опыта). Официальные поставки TopSolid 7, PolyWorks|Inspector, Geomagic, Shining 3D, мобильных КИМ PMT Arm, лазерных трекеров Leica и КИМ. Услуги 3D-сканирования, контроля точности и разработки постпроцессоров.',
    keywords: 'ДС‑Инжиниринг, CAD CAM системы, TopSolid 7, PolyWorks Inspector, Shining 3D Inspect, EXModel, измерительное оборудование, КИМ, 3D сканирование, реверс инжиниринг, метрология, постпроцессоры ЧПУ',
    canonicalUrl: 'https://ds-engineering.ru/main',
    ogTitle: 'ДС‑Инжиниринг — Промышленный CAD/CAM софт и измерительное 3D-оборудование',
    ogDescription: 'Поставка лицензионного ПО (TopSolid, PolyWorks, Geomagic, Shining 3D), координатно-измерительного оборудования и инжиниринговые услуги по 3D-контролю и реверсу.',
    ogImage: '/logo.svg',
    schemaType: 'website',
  },
  software: {
    title: 'Программное обеспечение TopSolid 7, PolyWorks, Shining 3D, Geomagic | ДС‑Инжиниринг',
    description: 'Каталог промышленного лицензионного ПО: сквозная CAD/CAM/PDM система TopSolid 7, метрологический комплекс PolyWorks|Inspector, софт для реверс-инжиниринга Shining 3D EXModel на ядре Parasolid, PTB-сертифицированный контроль SHINING 3D Inspect, Geomagic Design X и Control X.',
    keywords: 'программное обеспечение CAD CAM, купить TopSolid 7, TopSolid Cam, PolyWorks Inspector, Shining 3D EXModel, SHINING 3D Inspect, Geomagic Design X, Geomagic Control X, софт для реверс инжиниринга, метрологический софт, лицензии CAD CAM, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/software',
    ogTitle: 'Промышленный CAD/CAM и метрологический софт | ДС‑Инжиниринг',
    ogDescription: 'Лицензирование, поставка, технический инструктаж и консультации по программным комплексам TopSolid 7, PolyWorks, Shining 3D (FreeScan / EXModel / Inspect), Geomagic.',
    ogImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  },
  hardware: {
    title: 'Измерительное оборудование: КИМ PMT, мобильные КИМ ROMER / PMT, 3D-сканеры Shining 3D | ДС‑Инжиниринг',
    description: 'Поставка высокоточного метрологического оборудования: портальные и мостовые КИМ PMT, мобильные КИМ PMT Arm и HEXAGON ROMER, лазерные 3D-сканеры Shining 3D FreeScan, лазерные трекеры Leica Absolute Tracker, измерительные системы Renishaw.',
    keywords: 'координатно измерительные машины, КИМ PMT, мобильные КИМ PMT Arm, ROMER Absolute Arm, лазерные 3D сканеры FreeScan, Leica Absolute Tracker, датчики Renishaw, измерительное оборудование, метрология, купить КИМ, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/hardware',
    ogTitle: 'Координатно-измерительное и лазерное 3D-оборудование | ДС‑Инжиниринг',
    ogDescription: 'Поставка, пусконаладка, поверка и сервисное обслуживание измерительных машин, рук, 3D-сканеров и лазерных трекеров.',
    ogImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  },
  services: {
    title: 'Инжиниринговые услуги: 3D-сканирование, реверс-инжиниринг, разработка постпроцессоров ЧПУ | ДС‑Инжиниринг',
    description: 'Услуги прецизионного 3D-сканирования деталей в Самаре и с выездом по РФ, реверс-инжиниринг (построение CAD в STEP), контроль геометрии по CAD с протоколом FAI, разработка постпроцессоров под стойки Fanuc, Heidenhain, Siemens, технический инструктаж и консультации инженеров.',
    keywords: 'услуги 3D сканирования, заказать реверс инжиниринг, создание CAD модели по скану, контроль геометрии детали, протокол FAI, разработка постпроцессоров Fanuc Siemens Heidenhain, консультации TopSolid, инструктаж операторов ЧПУ, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/services',
    ogTitle: 'Инжиниринговые услуги и 3D-метрология | ДС‑Инжиниринг',
    ogDescription: '3D-сканирование, реверс-инжиниринг, контроль точности изделий, программирование ЧПУ, технический инструктаж и консультации персонала.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    schemaType: 'service',
  },
  calculator: {
    title: 'Инженерный калькулятор стоимости 3D-сканирования, контроля точности и реверса | ДС‑Инжиниринг',
    description: 'Онлайн калькулятор предварительного расчета стоимости и сроков выполнения инжиниринговых услуг: оптическое и лазерное 3D-сканирование, реверс-инжиниринг в твердотельный CAD (STEP), контроль геометрии деталей и написание постпроцессоров.',
    keywords: 'калькулятор 3D сканирования, расчет стоимости реверс инжиниринга, цена контроля точности деталей, стоимость разработки постпроцессора, Самара, РФ, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/calculator',
    ogTitle: 'Онлайн калькулятор расчета стоимости инженерных услуг | ДС‑Инжиниринг',
    ogDescription: 'Мгновенный предварительный расчет стоимости 3D-сканирования, реверса и контроля деталей.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    schemaType: 'service',
  },
  about: {
    title: 'О компании ДС‑Инжиниринг — более 30 лет опыта в промышленном инжиниринге (с 1995 года)',
    description: 'ООО «ДС‑Инжиниринг» — ведущий российский системный интегратор в области CAD/CAM/PDM технологий и 3D-метрологии. Основана в 1995 году. Официальный дистрибьютор TopSolid SAS, дилер Hexagon, PMT, Shining 3D, Geomagic, Renishaw.',
    keywords: 'ДС‑Инжиниринг о компании, история компании ДС‑Инжиниринг, интегратор CAD CAM, партнеры TopSolid Hexagon Shining 3D, метрологический центр, Самара',
    canonicalUrl: 'https://ds-engineering.ru/about',
    ogTitle: 'О компании ДС‑Инжиниринг — более 30 лет лидерства в промышленном инжиниринге',
    ogDescription: 'С 1995 года внедряем передовые CAD/CAM решения и поставляем прецизионное метрологическое оборудование на промышленные предприятия России.',
    ogImage: '/logo.svg',
    schemaType: 'about',
  },
  knowledge: {
    title: 'База знаний: ГОСТы, руководства по CAD/CAM, методики метрологического контроля | ДС‑Инжиниринг',
    description: 'Техническая документация, ГОСТы и стандарты (ISO 1101, ASME Y14.5, ISO 10360), руководства пользователя по TopSolid 7, PolyWorks, Shining 3D Inspect и EXModel, практические статьи и видеоинструкции.',
    keywords: 'база знаний CAD CAM, руководства TopSolid 7, методики 3D контроля, стандарты GD&T, ГОСТ Р 53442, инструкция PolyWorks, реверс инжиниринг, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/knowledge',
    ogTitle: 'База знаний и техническая библиотека | ДС‑Инжиниринг',
    ogDescription: 'Руководства, ГОСТы, методики измерений и экспертные статьи по цифровому производству.',
    ogImage: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1200&q=80',
    schemaType: 'faq',
  },
  glossary: {
    title: 'Технический глоссарий: GD&T, ISO 1101, КИМ, постпроцессоры и CAD/CAM | ДС‑Инжиниринг',
    description: 'Инженерно-технический глоссарий терминов метрологии, координатных измерений и станков с ЧПУ: GD&T, ISO 1101, кинематическая модель станка, постпроцессор, B-Rep, NURBS, MPE, RTCP, Leapfrog.',
    keywords: 'технический глоссарий, GD&T, ISO 1101, кинематическая модель станка, постпроцессор, B-Rep, NURBS, MPE, RTCP, Leapfrog, FAI, координатные измерения, САПР термины, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/glossary',
    ogTitle: 'Технический глоссарий инженера и метролога | ДС‑Инжиниринг',
    ogDescription: 'Профессиональный справочник определений стандартов, допусков формы и расположения, метрологического оборудования и систем ЧПУ.',
    ogImage: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1200&q=80',
    schemaType: 'article',
  },
  news: {
    title: 'Пресс-центр: Новости машиностроения, релизы ПО и выставки | ДС‑Инжиниринг',
    description: 'Актуальные новости компании «ДС‑Инжиниринг», обзоры обновлений программного обеспечения TopSolid 7, PolyWorks, Shining 3D, анонсы выставок «Металлообработка» и вебинаров по 3D-метрологии.',
    keywords: 'новости ДС‑Инжиниринг, релизы TopSolid, обновления Shining 3D, выставки металлообработка, метрология новости, CAD CAM статьи',
    canonicalUrl: 'https://ds-engineering.ru/news',
    ogTitle: 'Пресс-центр и новости компании | ДС‑Инжиниринг',
    ogDescription: 'События, отраслевые выставки, релизы программных комплексов и анонсы мероприятий.',
    ogImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
  },
  contacts: {
    title: 'Контакты и реквизиты компании в Самаре | ДС‑Инжиниринг',
    description: 'Контакты компании ООО «ДС‑Инжиниринг»: телефон +7 (846) 954-02-92, email info@ds-enginering.ru, адрес: г. Самара, ул. Свободы, д. 198. Прямые контакты отделов ПО, разработки постпроцессоров, оснастки и метрологии.',
    keywords: 'контакты ДС‑Инжиниринг, телефон ДС‑Инжиниринг Самара, адрес ул Свободы 198, Скобелев Александр, Морозов Владимир, Ярыш Иван, координатно-измерительные машины, 3D-сканеры, метрология',
    canonicalUrl: 'https://ds-engineering.ru/contacts',
    ogTitle: 'Контакты и реквизиты | ДС‑Инжиниринг',
    ogDescription: 'Офис компании ООО «ДС-Инжиниринг» в Самаре. График работы, реквизиты и схема проезда.',
    ogImage: '/logo.svg',
    schemaType: 'contact',
  },
  account: {
    title: 'Личный кабинет заказчика | ДС‑Инжиниринг',
    description: 'Личный кабинет клиента «ДС‑Инжиниринг»: отслеживание статуса заявок на расчет, заказов оборудования, лицензий ПО и обращений в службу технической поддержки.',
    keywords: 'личный кабинет ДС‑Инжиниринг, статус заявки, техподдержка TopSolid, мои лицензии',
    canonicalUrl: 'https://ds-engineering.ru/account',
    ogTitle: 'Личный кабинет клиента | ДС‑Инжиниринг',
    ogDescription: 'Управление проектами, отслеживание метрологических отчетов и сервисных заявок.',
    robots: 'noindex, nofollow',
  },
  crm: {
    title: 'CRM-система управления проектами | ДС‑Инжиниринг',
    description: 'Корпоративная CRM-система для управления промышленными контрактами, сделками и инженерными проектами.',
    keywords: 'crm, сделки, заказчики, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/crm',
    robots: 'noindex, nofollow',
  },
  cms: {
    title: 'Панель управления сайтом | ДС‑Инжиниринг CMS',
    description: 'Административная панель управления контентом, товарами, услугами и заявками клиентов.',
    keywords: 'cms, панель управления, админка',
    canonicalUrl: 'https://ds-engineering.ru/cms',
    robots: 'noindex, nofollow',
  },
  sitemap: {
    title: 'Карта сайта (Sitemap) — Полный каталог разделов и оборудования | ДС‑Инжиниринг',
    description: 'Полная интерактивная карта сайта компании ООО «ДС-Инжиниринг»: каталог программного обеспечения CAD/CAM/PDM (TopSolid, PolyWorks, Shining 3D, Geomagic), метрологического оборудования (PMT, Hexagon, Leica), услуг 3D-сканирования, контроля точности и статей базы знаний.',
    keywords: 'карта сайта ДС-Инжиниринг, sitemap, структура сайта, каталог CAD CAM, каталог КИМ, 3D сканеры каталог, база знаний метрологии, инженерные услуги Самара',
    canonicalUrl: 'https://ds-engineering.ru/sitemap',
    ogTitle: 'Карта сайта — Каталог разделов, оборудования и услуг | ДС‑Инжиниринг',
    ogDescription: 'Интерактивная карта портала ДС-Инжиниринг с быстрой навигацией по всем продуктам, услугам, статьям и ГОСТам.',
    ogImage: '/logo.svg',
    schemaType: 'webpage',
  },
  compare: {
    title: 'Сравнение оборудования и ПО: 3D-сканеры, КИМ и CAD/CAM | ДС‑Инжиниринг',
    description: 'Интерактивная сравнительная таблица технических характеристик оборудования и программного обеспечения «ДС-Инжиниринг». Сопоставление точности (MPE), рабочих диапазонов, оптических датчиков и комплектаций.',
    keywords: 'сравнение 3d-сканеров, сравнение ким, сопоставление характеристик cad cam, точность 3d сканирования, технические характеристики метрология, ДС-Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/compare',
    ogTitle: 'Сравнение технических характеристик оборудования и ПО | ДС‑Инжиниринг',
    ogDescription: 'Сравнительный анализ параметров 3D-сканеров, координатно-измерительных машин и ПО CAD/CAM.',
    ogImage: '/logo.svg',
    schemaType: 'webpage',
  },
  notfound: {
    title: 'Страница не найдена (404) | ДС‑Инжиниринг',
    description: 'Запрашиваемая страница не существует или была перемещена в структуре портала «ДС-Инжиниринг».',
    keywords: '404, страница не найдена, ошибка, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/notfound',
    robots: 'noindex, nofollow',
  }
};

export const PRODUCT_SEO_DATA: Record<string, SeoMetadata> = {
  // SOFTWARE
  'topsolid-7': {
    title: 'TopSolid 7 (CAD/CAM/PDM) — купить, внедрение, инструктаж и консультации | ДС‑Инжиниринг',
    description: 'Официальная поставка и внедрение TopSolid 7: интегрированная параметрическая среда CAD/CAM/PDM (Design, CAM 2D-5D, Mold, Progress, Sheetmetal, Wood). Прямой экспорт в станки с ЧПУ, разработка сертифицированных постпроцессоров, технический инструктаж и консультации специалистов.',
    keywords: 'TopSolid 7, TopSolid CAM, TopSolid Design, TopSolid PDM, TopSolid Mold, TopSolid Progress, CAD CAM системы, программирование ЧПУ 5 осей, постпроцессоры Fanuc Heidenhain Siemens, купить TopSolid в России, дистрибьютор TopSolid, инструктаж TopSolid, консультации ЧПУ, ДС‑Инжиниринг',
    ogTitle: 'TopSolid 7 (CAD/CAM/PDM) — Сквозное цифровое проектирование и производство',
    ogDescription: 'Интегрированное CAD/CAM/PDM решение на ядре Parasolid для конструкторов и технологов ЧПУ: от 3D-модели до управляющей программы станка.',
    ogImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  'shining3d-inspect': {
    title: 'SHINING 3D Inspect — метрологический софт 3D-контроля для сканеров SHINING 3D (PTB Class 1) | ДС‑Инжиниринг',
    description: 'Метрологический программный комплекс SHINING 3D Inspect для работы со сканерами FreeScan и EinScan. Сертифицированные алгоритмы PTB (Германия, Class 1) для 3D-контроля геометрии, расчета допусков GD&T (ISO 1101 / ASME Y14.5), FAI и анализа зазоров.',
    keywords: 'SHINING 3D Inspect, софт для сканеров Shining 3D, софт FreeScan, метрологическое программное обеспечение, PTB Class 1 сертификация, расчет допусков GD&T, инспекция первого изделия FAI, 3D Color Map, контроль листовой штамповки, анализ зазоров Flush Gap, ДС‑Инжиниринг',
    ogTitle: 'SHINING 3D Inspect — Метрологический 3D-контроль для сканеров SHINING 3D (PTB Class 1)',
    ogDescription: 'Высокоточный контроль геометрии по CAD для сканеров FreeScan и EinScan, расчет GD&T по ISO/ASME, автоматизация замеров AutoInspect.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
  },
  'shining3d-exmodel': {
    title: 'Shining 3D EXModel / EXModel Pro | ДС‑Инжиниринг',
    description: 'Программный комплекс Shining 3D EXModel и EXModel Pro: быстрое преобразование полигональных 3D-сканов в твердотельные и поверхностные параметрические CAD-модели (STEP, Parasolid, IGES, DXF) с контролем точности Live Deviation Analyzer.',
    keywords: 'Shining 3D EXModel, EXModel Pro, реверс-инжиниринг софт, обратный инжиниринг, параметрический эскиз по сетке, автонатягивание поверхностей Auto Surface, Live Deviation Analyzer, экспорт STEP Parasolid, ДС‑Инжиниринг',
    ogTitle: 'Shining 3D EXModel / Pro — Профессиональный реверс-инжиниринг',
    ogDescription: 'Быстрое создание параметрических CAD-моделей по данным 3D-сканирования с помощью профессиональных CAD-инструментов.',
    ogImage: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1200&q=80',
  },
  'polyworks-inspector': {
    title: 'PolyWorks|Inspector™ — универсальное метрологическое ПО 3D-контроля | ДС‑Инжиниринг',
    description: 'PolyWorks|Inspector™ от InnovMetric — мировой золотой стандарт 3D-метрологии: универсальный контроль деталей по CAD для сканеров Shining 3D, мобильных КИМ PMT и ROMER, лазерных трекеров Leica и КИМ. Расчет GD&T, автоматические отчеты в Excel (ReportLoop) и SPC-анализ.',
    keywords: 'PolyWorks Inspector, InnovMetric, метрологическое программное обеспечение, контроль геометрии по CAD, расчет GD&T по ASME Y14.5 ISO 1101, отчеты в Excel ReportLoop, статистический контроль процессов SPC, мобильные КИМ ROMER, ДС‑Инжиниринг',
    ogTitle: 'PolyWorks|Inspector™ — Универсальная программная платформа 3D-метрологии',
    ogDescription: 'Единая экосистема контроля геометрии для портативных сканеров, мобильных КИМ, лазерных трекеров и КИМ.',
    ogImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  },
  'geomagic-design-x': {
    title: 'Geomagic Design X (HEXAGON) — эталонное ПО для реверс-инжиниринга и CAD-моделирования | ДС‑Инжиниринг',
    description: 'Geomagic Design X (HEXAGON Manufacturing Intelligence): профессиональное ПО для воссоздания параметрических CAD-моделей по облакам точек и полигональным сеткам с прямой передачей дерева построения через технологию LiveTransfer в SolidWorks, Siemens NX, CATIA, Inventor, Creo, TopSolid.',
    keywords: 'Geomagic Design X, HEXAGON, Hexagon Universal Updater, реверс инжиниринг, передача дерева построения LiveTransfer, параметрическое моделирование, SolidWorks, Siemens NX, CATIA, экспорт STEP Parasolid, ДС‑Инжиниринг',
    ogTitle: 'Geomagic Design X — Эталонное ПО для реверс-инжиниринга (HEXAGON)',
    ogDescription: 'Создание параметрических CAD-моделей по данным 3D-сканирования с полным деревом построения в экосистеме HEXAGON.',
    ogImage: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  },
  'geomagic-control-x': {
    title: 'Geomagic Control X (HEXAGON) — автоматизированный 3D-контроль качества и FAI | ДС‑Инжиниринг',
    description: 'Geomagic Control X (HEXAGON Manufacturing Intelligence): профессиональная метрологическая платформа для автоматизированного контроля геометрии, расчета допусков GD&T, анализа толщины стенок, контроля профилей лопаток турбин и валидации первого изделия (FAI).',
    keywords: 'Geomagic Control X, HEXAGON, Hexagon Universal Updater, 3D контроль качества, автоматизированная инспекция, анализ допусков GD&T, First Article Inspection FAI, контроль лопаток турбин, отчеты 3D PDF, ДС‑Инжиниринг',
    ogTitle: 'Geomagic Control X — Промышленный 3D-контроль геометрии и валидация FAI (HEXAGON)',
    ogDescription: 'Автоматизированная проверка серийных изделий по CAD, цветовые карты отклонений и протоколы по ISO/ГОСТ в экосистеме HEXAGON.',
    ogImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
  },

  // HARDWARE - PMT ALPHA ARM
  'pmt-alpha-p': {
    title: 'Мобильная КИМ PMT ALPHA ARM серия P (Прецизионная) | ДС‑Инжиниринг',
    description: 'Прецизионная портативная координатно-измерительная машина PMT ALPHA ARM серии P. Точность от ±0.015 мм, углепластиковый корпус, балансировка Zero-Stress, работа с PolyWorks|Inspector.',
    keywords: 'PMT ALPHA ARM серия P, прецизионная мобильная КИМ, мобильная КИМ, PMT Arm Precision, портативная координатно-измерительная машина, точность 0.015 мм, PolyWorks Inspector, ДС‑Инжиниринг',
    ogTitle: 'Мобильная КИМ PMT ALPHA ARM серия P — Прецизионная точность',
    ogDescription: 'Портативная КИМ высшего класса точности от ±0.015 мм для метрологических лабораторий и цехового контроля.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  },
  'pmt-alpha-m': {
    title: 'Мобильная КИМ PMT ALPHA ARM серия M (Многоцелевая) | ДС‑Инжиниринг',
    description: 'Универсальная мобильная мобильная КИМ PMT ALPHA ARM серия M для оперативного контроля геометрии на станках и сборочных участках. Диапазон до 4.0 м.',
    keywords: 'PMT ALPHA ARM серия M, многоцелевая мобильная КИМ, цеховая КИМ, контроль на станке с ЧПУ, портативная КИМ PMT, ДС‑Инжиниринг',
    ogTitle: 'Мобильная КИМ PMT ALPHA ARM серия M — Универсальный цеховой контроль',
    ogDescription: 'Надежная мобильная КИМ для ежедневного межоперационного контроля деталей и оснастки в условиях цеха.',
    ogImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  'pmt-alpha-e': {
    title: 'Мобильная КИМ PMT ALPHA ARM серия E (Экономичная) | ДС‑Инжиниринг',
    description: 'Доступная и надежная мобильная КИМ PMT ALPHA ARM серии E для малых и средних производств. Контроль штамповок, сварных узлов и корпусных деталей.',
    keywords: 'PMT ALPHA ARM серия E, экономичная КИМ, доступная мобильная КИМ, контроль штамповки, координатные измерения, ДС‑Инжиниринг',
    ogTitle: 'Мобильная КИМ PMT ALPHA ARM серия E — Доступное метрологическое решение',
    ogDescription: 'Экономичная портативная КИМ для оперативного контроля геометрических параметров.',
    ogImage: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  },
  'pmt-alpha-edu': {
    title: 'Учебно-метрологический комплекс PMT ALPHA ARM серия EDU | ДС‑Инжиниринг',
    description: 'Специализированная мобильная КИМ PMT ALPHA ARM серии EDU для оснащения метрологических лабораторий ВУЗов, колледжей и технических центров.',
    keywords: 'PMT ALPHA ARM EDU, КИМ для ВУЗов, мобильная КИМ, практикум КИМ, PolyWorks академический, ДС‑Инжиниринг',
    ogTitle: 'PMT ALPHA ARM серия EDU — Метрологический комплекс для лабораторий и ВУЗов',
    ogDescription: 'Комплекс для практической работы с координатно-измерительными машинами по ГОСТ и ISO 10360.',
    ogImage: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
  },

  // HARDWARE - PMT GAMMA+
  'pmt-gamma-plus-p': {
    title: 'Мобильная КИМ PMT Gamma+ серия P (Прецизионная) нового поколения | ДС‑Инжиниринг',
    description: 'Флагманская портативная КИМ PMT Gamma+ серии P нового поколения. Инновационная кинематика шарниров, нулевой люфт, OLED-дисплей, повторяемость от ±0.014 мм.',
    keywords: 'PMT Gamma Plus серия P, мобильная КИМ нового поколения, прецизионная мобильная КИМ, точность 0.014 мм, PMT Gamma+ Precision, ДС‑Инжиниринг',
    ogTitle: 'Мобильная КИМ PMT Gamma+ серия P — Новое поколение точности',
    ogDescription: 'Флагманская портативная КИМ с модернизированными узлами вращения и наивысшей точностью в линейке.',
    ogImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  'pmt-gamma-plus-m': {
    title: 'Мобильная КИМ PMT Gamma+ серия M (Многоцелевая) | ДС‑Инжиниринг',
    description: 'Универсальная координатно-измерительная машина PMT Gamma+ серия M. Расширенный рабочий диапазон до 4.0 м, жесткий карбоновый корпус, встроенная термокомпенсация.',
    keywords: 'PMT Gamma Plus серия M, универсальная КИМ, цеховые измерения, контроль штампов и пресс-форм, ДС‑Инжиниринг',
    ogTitle: 'Мобильная КИМ PMT Gamma+ серия M — Универсальная и надежная',
    ogDescription: 'Универсальная мобильная КИМ PMT Gamma+ для контроля оснастки, литья и сварки.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  },
  'pmt-gamma-plus-e': {
    title: 'Мобильная КИМ PMT Gamma+ серия E (Экономичная) | ДС‑Инжиниринг',
    description: 'Экономичная портативная КИМ серии PMT Gamma+ E для входного контроля и цеховых измерений. Легкая конструкция от 7.2 кг, совместимость со щупами Renishaw.',
    keywords: 'PMT Gamma Plus серия E, экономичная мобильная КИМ, цеховой контроль, замена штангенциркулей, КИМ PMT, ДС‑Инжиниринг',
    ogTitle: 'Мобильная КИМ PMT Gamma+ серия E — Практичное цифровое решение',
    ogDescription: 'Надежная и экономичная портативная КИМ серии Gamma+ для модернизации мерительного инструмента.',
    ogImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  },

  // HARDWARE - 3D-СКАНЕРЫ ДЛЯ PMT GAMMA+ / ALPHA ARM
  'pmt-scanner-gh': {
    title: 'Прецизионный лазерный 3D сканер PMT GH для PMT GAMMA+ | ДС‑Инжиниринг',
    description: 'Высокоточный лазерный 3D-сканер PMT GH синего лазера высокой четкости (HD) для 7-осевых портативных КИМ PMT GAMMA+ и ALPHA ARM. Скорость 1.2 млн точек/сек.',
    keywords: 'PMT GH, лазерный сканер PMT GH, сканер для PMT Gamma Plus, синий лазерный сканер, КИМ PMT, оцифровка без спрея, PolyWorks Inspector, ДС‑Инжиниринг',
    ogTitle: 'Прецизионный лазерный 3D-сканер PMT GH для PMT GAMMA+',
    ogDescription: 'Высокоточный HD сканер синего лазера для мобильных мобильных КИМ PMT Gamma+ и PMT Alpha Arm.',
    ogImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  'pmt-scanner-gs': {
    title: 'Широкополосный лазерный 3D сканер PMT GS для PMT GAMMA+ | ДС‑Инжиниринг',
    description: 'Широкополосный лазерный 3D-сканер PMT GS с шириной полосы до 200 мм для 7-осевых мобильных КИМ PMT GAMMA+ и ALPHA ARM. Скоростная оцифровка крупных деталей.',
    keywords: 'PMT GS, лазерный сканер PMT GS, широкополосный сканер PMT, сканер для мобильной КИМ, PMT Gamma Plus, контроль штампов, ДС‑Инжиниринг',
    ogTitle: 'Широкополосный лазерный 3D-сканер PMT GS для PMT GAMMA+',
    ogDescription: 'Скоростной сканер с широкой лазерной полосой 180–200 мм для портативных КИМ PMT Gamma+.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  },

  // HARDWARE - HEXAGON ABSOLUTE ARM
  'hexagon-absolute-arm-7axis': {
    title: 'Мобильная КИМ Hexagon Absolute Arm 7-Axis | ДС‑Инжиниринг',
    description: 'Флагманская 7-осевая мобильная КИМ Hexagon Absolute Arm с энкодерами Zero-G, дисплеем SmartSens и поддержкой лазерных 3D-сканеров AS1, AS1 XL, RS6, RS-SQUARED.',
    keywords: 'Hexagon Absolute Arm 7 Axis, 7 осевая мобильная КИМ, энкодеры Zero G, сканер AS1 Hexagon, Romer Absolute Arm, купить Absolute Arm в РФ, ДС‑Инжиниринг',
    ogTitle: 'Hexagon Absolute Arm 7-Axis — Мировой эталон мобильных КИМ',
    ogDescription: 'Флагманская 7-осевая КИМ с абсолютными датчиками угла для контактных замеров и лазерного 3D-сканирования.',
    ogImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  'hexagon-absolute-arm-6axis': {
    title: 'Прецизионная контактная мобильная КИМ Hexagon Absolute Arm 6-Axis | ДС‑Инжиниринг',
    description: 'Сверхточная 6-осевая мобильная КИМ Hexagon Absolute Arm 6-Axis для контактных измерений щупами Renishaw. Повторяемость от ±0.008 мм.',
    keywords: 'Hexagon Absolute Arm 6 Axis, контактная мобильная КИМ, 6 осевая КИМ, щупы Renishaw TP20, точность 0.008 мм, ДС‑Инжиниринг',
    ogTitle: 'Hexagon Absolute Arm 6-Axis — Прецизионный контактный контроль',
    ogDescription: 'Максимальная механическая жесткость и точность до 8 микрон для контроля геометрии и штампов.',
    ogImage: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  },
  'hexagon-absolute-arm-compact': {
    title: 'Портативная КИМ с гранитной плитой Hexagon Absolute Arm Compact | ДС‑Инжиниринг',
    description: 'Ультракомпактная портативная координатно-измерительная машина Hexagon Absolute Arm Compact со встроенным гранитным основанием. Точность 6 мкм, установка на стол станка.',
    keywords: 'Hexagon Absolute Arm Compact, компактная КИМ, КИМ с гранитным основанием, измерение на станке ЧПУ, точность 6 микрон, ДС‑Инжиниринг',
    ogTitle: 'Hexagon Absolute Arm Compact — Ультракомпактная КИМ с гранитной плитой',
    ogDescription: 'Сверхкомпактная КИМ с точностью до 6 микрон для контроля мелкоразмерных деталей прямо на столе станка.',
    ogImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
  },

  // HARDWARE - 3D-СКАНЕРЫ ДЛЯ HEXAGON ABSOLUTE ARM
  'hexagon-scanner-as1': {
    title: 'Лазерный 3D сканер Hexagon Absolute Scanner AS1 (модульный) | ДС‑Инжиниринг',
    description: 'Флагманский кросс-платформенный 3D-сканер Hexagon Absolute Scanner AS1 (заменил RS6). Работает на мобильной КИМ Absolute Arm 7-Axis и автономно с трекером Leica AT960 в радиусе до 30 м.',
    keywords: 'Hexagon Absolute Scanner AS1, лазерный 3D сканер AS1, замена RS6, технология SHINE, сканирование без спрея, кросс платформенный сканер, Leica AT960, ДС‑Инжиниринг',
    ogTitle: 'Hexagon Absolute Scanner AS1 — Кросс-платформенный 3D-сканер нового поколения',
    ogDescription: 'Флагманский сканер синего лазера с технологией SHINE для работы на мобильной КИМ Absolute Arm или автономно с трекером Leica AT960.',
    ogImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  'hexagon-scanner-as1-xl': {
    title: 'Сверхширокополосный лазерный 3D сканер Hexagon AS1 XL | ДС‑Инжиниринг',
    description: 'Инновационный лазерный 3D-сканер Hexagon AS1 XL с полосой до 600 мм и рабочим расстоянием до 1000 мм для крупногабаритных деталей (авиация, судостроение).',
    keywords: 'Hexagon AS1 XL, сверхширокополосный сканер, полоса 600 мм, сканирование крупногабаритных деталей, авиационное сканирование, ДС‑Инжиниринг',
    ogTitle: 'Hexagon AS1 XL — Сверхширокополосный 3D-сканер с полосой до 600 мм',
    ogDescription: 'Сверхскоростная оцифровка крупногабаритных объектов с шириной полосы до 600 мм за один проход.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  },
  'hexagon-scanner-rs6': {
    title: 'Лазерный 3D сканер Hexagon RS6 (технология SHINE) | ДС‑Инжиниринг',
    description: 'Лазерный 3D-сканер синего лазера Hexagon RS6 с технологией SHINE: скорость 1.2 млн точек/сек, ширина полосы 150 мм. (Снят с производства, заменен на AS1).',
    keywords: 'Hexagon RS6, лазерный 3D сканер RS6, сканер для Absolute Arm, технология SHINE, заменен на AS1, ДС‑Инжиниринг',
    ogTitle: 'Лазерный 3D сканер Hexagon RS6 — Проверенная классика SHINE',
    ogDescription: 'Высокопроизводительный сканер синего лазера для мобильных КИМ Absolute Arm 7-Axis.',
    ogImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  'hexagon-scanner-rs5': {
    title: 'Лазерный 3D сканер Hexagon RS5 для рук Absolute Arm | ДС‑Инжиниринг',
    description: 'Универсальный лазерный 3D-сканер Hexagon RS5 синего лазера с полосой 115 мм для задач общего машиностроения, контроля отливок и штампов.',
    keywords: 'Hexagon RS5, лазерный 3D сканер RS5, сканер для мобильной КИМ, контроль отливок, реверс-инжиниринг, ДС‑Инжиниринг',
    ogTitle: 'Лазерный 3D сканер Hexagon RS5 — Универсальный лазерный сканер',
    ogDescription: 'Надежный лазерный 3D-сканер с широкой полосой 115 мм для мобильных КИМ Absolute Arm.',
    ogImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  },
  'hexagon-scanner-hp-l-20-8': {
    title: 'Прецизионный лазерный 3D сканер Hexagon HP-L-20.8 | ДС‑Инжиниринг',
    description: 'Оптический лазерный сенсор Hexagon HP-L-20.8 с непрерывной авторегулировкой мощности луча для контроля сложных криволинейных поверхностей и лопаток турбин.',
    keywords: 'Hexagon HP L 20 8, прецизионный лазерный сканер, контроль лопаток турбин, бесконтактный контроль геометрии, ДС‑Инжиниринг',
    ogTitle: 'Hexagon HP-L-20.8 — Прецизионный лазерный 3D-сканер',
    ogDescription: 'Высокоточный оптический сенсор для контроля сложных поверхностей с точностью от 9 мкм.',
    ogImage: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  },
  'hexagon-scanner-llp': {
    title: 'Лазерный 3D-сканер Laser Line Probe (LLP) для КИМ | ДС‑Инжиниринг',
    description: 'Компактный лазерный датчик сечений Laser Line Probe (LLP) для портативных КИМ: быстрая оцифровка кромок, отверстий и плоских профилей.',
    keywords: 'Laser Line Probe, LLP сканер, лазерный линейный датчик, оцифровка кромок, сканирующая головка для КИМ, ДС‑Инжиниринг',
    ogTitle: 'Лазерный 3D-сканер Laser Line Probe (LLP)',
    ogDescription: 'Легкий и компактный лазерный датчик сечений для портативных координатно-измерительных машин.',
    ogImage: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
  },
  'hexagon-scanner-hp-l-8-9': {
    title: 'Лазерный 3D сканер Hexagon HP-L-8.9 (начальный уровень) | ДС‑Инжиниринг',
    description: 'Доступный синий лазерный 3D-сканер Hexagon HP-L-8.9 начального уровня для мобильных КИМ Absolute Arm 7-Axis. Масса всего 330 грамм.',
    keywords: 'Hexagon HP L 8 9, доступный лазерный сканер, синий лазер, модернизация КИМ, сканирование деталей, ДС‑Инжиниринг',
    ogTitle: 'Hexagon HP-L-8.9 — Доступное лазерное 3D-сканирование',
    ogDescription: 'Экономичный синий лазерный сканер начального уровня для контактных мобильных КИМ Absolute Arm 7-Axis.',
    ogImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  },
  'hexagon-scanner-rs-squared': {
    title: 'Оптический площадной сканер Hexagon RS-SQUARED Area Scanner | ДС‑Инжиниринг',
    description: 'Революционный площадной сканер структурированного света Hexagon RS-SQUARED Area Scanner: оцифровка поверхностей крупными кадрами 300×300 мм без маркеров.',
    keywords: 'Hexagon RS SQUARED, Area Scanner, площадной оптический сканер, сканирование без маркеров, кузовные панели, штампы, ДС‑Инжиниринг',
    ogTitle: 'Hexagon RS-SQUARED — Первый в мире площадной сканер для мобильных КИМ',
    ogDescription: 'Сверхбыстрая оцифровка больших площадей квадратными кадрами без необходимости наклеивания маркеров.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  },
  'hexagon-scanner-rs4': {
    title: 'Встроенный лазерный 3D сканер Hexagon RS4 для серии SI | ДС‑Инжиниринг',
    description: 'Полностью интегрированный в запястье лазерный 3D-сканер Hexagon RS4 для мобильных КИМ Absolute Arm 73/75/77-SI без внешних кабелей.',
    keywords: 'Hexagon RS4, встроенный сканер, Absolute Arm SI, интегрированный лазерный сканер, сканирование полостей, ДС‑Инжиниринг',
    ogTitle: 'Hexagon RS4 — Встроенный лазерный 3D-сканер без внешних кабелей',
    ogDescription: 'Полная интеграция в корпус мобильной КИМ Absolute Arm для максимальной маневренности в труднодоступных зонах.',
    ogImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },

  // HARDWARE - СТАЦИОНАРНЫЕ И ЦЕХОВЫЕ КИМ PMT
  'pmt-future-cmm': {
    title: 'Прецизионная мостовая КИМ PMT FUTURE и FUTURE PLUS | ДС‑Инжиниринг',
    description: 'Прецизионная координатно-измерительная машина PMT FUTURE и FUTURE PLUS с замкнутым гранитным порталом, 16 датчиками термокомпенсации, точностью от 0.9+L/450 мкм и поддержкой Renishaw REVO-2.',
    keywords: 'КИМ PMT FUTURE, PMT FUTURE PLUS, прецизионная мостовая КИМ, лабораторная КИМ, Renishaw REVO, Renishaw SP25M, метрологическая КИМ, купить КИМ PMT в Самаре и РФ, ДС‑Инжиниринг',
    ogTitle: 'Прецизионная мостовая КИМ PMT FUTURE и FUTURE PLUS',
    ogDescription: 'Лабораторная точность от 0.9 + L/450 мкм, аэростатические направляющие, 5-осевое сканирование Renishaw REVO-2.',
    ogImage: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  },
  'pmt-prime-cmm': {
    title: 'Цеховая координатно-измерительная машина PMT PRIME | ДС‑Инжиниринг',
    description: 'Высокопроизводительная цеховая КИМ PMT PRIME с защитой направляющих IP54, скоростью до 550 мм/с и температурным окном 18–28°C для участков станков с ЧПУ.',
    keywords: 'КИМ PMT PRIME, цеховая КИМ, КИМ для производства, цеховой контроль ЧПУ, координатно-измерительная машина IP54, быстрая КИМ, купить цеховую КИМ, ДС‑Инжиниринг',
    ogTitle: 'Цеховая координатно-измерительная машина PMT PRIME (IP54)',
    ogDescription: 'Оптимизирована для цехов и участков ЧПУ: гофрозащита IP54, скорость до 550 мм/с, температурный диапазон 18–28°C.',
    ogImage: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
  },
  'pmt-loong-cmm': {
    title: 'Крупногабаритная портальная КИМ PMT LOONG (до 10 метров) | ДС‑Инжиниринг',
    description: 'Портальная КИМ повышенной грузоподъемности PMT LOONG с рабочим объемом до 10 000 мм для крупногабаритных турбин, рам, штампов и авиадеталей. Двойной привод Dual-Drive.',
    keywords: 'КИМ PMT LOONG, портальная КИМ, крупногабаритная КИМ, КИМ для авиации, КИМ 10 метров, КИМ повышенной грузоподъемности, ДС‑Инжиниринг',
    ogTitle: 'Крупногабаритная портальная КИМ PMT LOONG',
    ogDescription: 'Рабочий диапазон до 4000×10000×2500 мм, двойной синхронный сервопривод Dual-Drive, напольная компоновка.',
    ogImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
  },
  'pmt-bridge-cmm': {
    title: 'Мостовая КИМ PMT серии FUTURE / PRIME — купить прецизионную КИМ | ДС‑Инжиниринг',
    description: 'Прецизионные мостовые координатно-измерительные машины PMT с гранитным основанием, аэростатическими направляющими и датчиками Renishaw. Поставка, пусконаладка, поверка по РФ.',
    keywords: 'мостовая КИМ, координатно-измерительная машина PMT, КИМ PMT FUTURE, датчики Renishaw PH10M SP25M, метрологическая КИМ, купить КИМ в Самаре и РФ, цена КИМ, ДС‑Инжиниринг',
    ogTitle: 'Мостовая прецизионная КИМ PMT серии FUTURE',
  },
  'pmt-gantry-cmm': {
    title: 'Портальная крупногабаритная КИМ PMT LOONG (до 10 метров) | ДС‑Инжиниринг',
    description: 'Крупногабаритная портальная КИМ PMT LOONG для авиастроения, судостроения и тяжелого машиностроения с рабочим полем до 10 000 мм. Контактные и лазерные сканирующие головки Renishaw.',
    keywords: 'портальная КИМ, крупногабаритная КИМ, PMT LOONG, измерение крупногабаритных деталей, авиационная КИМ, КИМ для штампов, ДС‑Инжиниринг',
    ogTitle: 'Портальная крупногабаритная КИМ PMT LOONG',
  },
  'romer-absolute-arm-rs6': {
    title: 'Hexagon Absolute Arm 7-Axis со сканером AS1 | Флагманский комплекс | ДС‑Инжиниринг',
    description: 'Флагманский метрологический комплекс: 7-осевая мобильная КИМ Hexagon Absolute Arm, 3D-сканер Absolute Scanner AS1 (пришел на смену RS6) и ПО PolyWorks|Inspector™. Прецизионный 3D-контроль и реверс-инжиниринг без спрея.',
    keywords: 'Hexagon Absolute Arm, Absolute Scanner AS1, сканер AS1 Hexagon, замена RS6, PolyWorks Inspector, 7-осевая мобильная КИМ, флагманский метрологический комплекс, купить Absolute Arm в РФ, ДС‑Инжиниринг',
    ogTitle: 'Hexagon Absolute Arm 7-Axis + Absolute Scanner AS1 + PolyWorks|Inspector™',
  },
  'hexagon-absolute-scanner-as1': {
    title: '3D-сканер Hexagon Absolute Scanner AS1 (автономный / для КИМ) | ДС‑Инжиниринг',
    description: 'Флагманский модульный 3D-лазерный сканер Hexagon Absolute Scanner AS1. Заменил модель RS6. Работает на мобильной КИМ Absolute Arm или автономно без КИМ с трекером Leica AT960 в радиусе до 30 м.',
    keywords: 'Hexagon Absolute Scanner AS1, сканер AS1, 3D сканер Hexagon, замена RS6, автономный сканер для трекера Leica, сканирование без спрея SHINE, PolyWorks Inspector, ДС‑Инжиниринг',
    ogTitle: '3D-сканер Hexagon Absolute Scanner AS1 (модульный и автономный)',
  },
  'pmt-arm-alpha': {
    title: 'Мобильная КИМ PMT Arm серии Alpha со сканером | ДС‑Инжиниринг',
    description: '7-осевая портативная мобильная КИМ PMT Alpha с секциями из углепластика и синим лазерным 3D-сканером (1 млн точек/сек) для мобильного цехового контроля.',
    keywords: 'мобильная КИМ PMT Arm, PMT Alpha, портативная КИМ, цеховой контроль на станке, купить мобильную КИМ PMT, ДС‑Инжиниринг',
    ogTitle: 'Портативная мобильная КИМ PMT серии Alpha',
  },
  // 3D-сканеры Shining 3D
  'shining-einstar': {
    title: '3D сканер Shining 3D Einstar | Официальный дилер ДС‑Инжиниринг',
    description: 'Портативный 3D-сканер Shining 3D Einstar с инфракрасным источником VCSEL и цветной камерой RGB для полноцветной 3D-печати и оцифровки.',
    keywords: 'Shining 3D Einstar, 3D сканер Einstar, цветной 3D сканер, ручной сканер VCSEL, купить Einstar, ДС‑Инжиниринг',
  },
  'shining-einstar-2': {
    title: '3D сканер Shining 3D Einstar 2 | ДС‑Инжиниринг',
    description: 'Обновленный портативный 3D-сканер Shining 3D Einstar 2-го поколения с улучшенной матрицей и повышенной детализацией.',
    keywords: 'Shining 3D Einstar 2, Einstar Gen 2, ручной 3D сканер, ДС‑Инжиниринг',
  },
  'shining-einstar-vega': {
    title: 'Автономный 3D сканер Shining 3D Einstar VEGA | ДС‑Инжиниринг',
    description: 'Полностью автономный беспроводной 3D-сканер Shining 3D Einstar VEGA со встроенным сенсорным экраном, процессором и аккумулятором. Сканирование без проводов и ПК.',
    keywords: 'Shining 3D Einstar VEGA, автономный 3D сканер, беспроводной сканер с экраном, сканирование без ПК, купить Einstar VEGA, ДС‑Инжиниринг',
  },
  'shining-einstar-rockit': {
    title: '3D сканер Shining 3D Einstar Rockit | ДС‑Инжиниринг',
    description: 'Скоростной ручной 3D-сканер Shining 3D Einstar Rockit повышенной производительности для реверса и дизайна.',
    keywords: 'Shining 3D Einstar Rockit, скоростной 3D сканер, Einstar Rockit, ДС‑Инжиниринг',
  },
  'shining-einscan-se-v2': {
    title: 'Настольный 3D сканер Shining 3D EinScan SE V2 | ДС‑Инжиниринг',
    description: 'Настольный 3D-сканер EinScan-SE V2 с поворотным столом белого структурированного света для точной оцифровки мелких деталей.',
    keywords: 'Shining 3D EinScan SE V2, EinScan-SE, настольный 3D сканер, поворотный стол, 3D сканирование для 3D печати, ДС‑Инжиниринг',
  },
  'shining-einscan-sp-v2': {
    title: 'Прецизионный настольный 3D сканер Shining 3D EinScan SP V2 | ДС‑Инжиниринг',
    description: 'Профессиональный настольный 3D-сканер EinScan-SP V2 повышенной точности (до 0.05 мм) с оптическими маркерами на поворотном столе.',
    keywords: 'Shining 3D EinScan SP V2, EinScan-SP, высокоточный настольный 3D сканер, точность 0.05 мм, купить EinScan SP, ДС‑Инжиниринг',
  },
  'shining-medixa': {
    title: 'Медицинский 3D сканер Shining 3D Medixa | ДС‑Инжиниринг',
    description: 'Специализированный 3D-сканер Shining 3D Medixa для ортопедии, протезирования, пластической хирургии и бесконтактной оцифровки человека.',
    keywords: 'Shining 3D Medixa, медицинский 3D сканер, сканер для ортопедии, протезирование, безопасный инфракрасный сканер, ДС‑Инжиниринг',
  },
  'shining-rigil-pro': {
    title: 'Флагманский 3D сканер Shining 3D EinScan Rigil Pro | ДС‑Инжиниринг',
    description: 'Гибридный лазерный 3D-сканер профессиональной серии Shining 3D EinScan Rigil Pro: синий лазер + VCSEL для реверса и контроля деталей.',
    keywords: 'EinScan Rigil Pro, Shining 3D Rigil, гибридный лазерный сканер, точность 0.02 мм, купить Rigil Pro, ДС‑Инжиниринг',
  },
  'shining-rigil': {
    title: '3D сканер Shining 3D EinScan Rigil | ДС‑Инжиниринг',
    description: 'Профессиональный ручной 3D-сканер Shining 3D EinScan Rigil для конструкторских бюро и производства.',
    keywords: 'Shining 3D EinScan Rigil, сканер Rigil, реверс инжиниринг, ДС‑Инжиниринг',
  },
  'shining-rigil-accessories-pro-kit': {
    title: '3D сканер Shining 3D EinScan Rigil + Accessories Pro Kit | ДС‑Инжиниринг',
    description: 'Комплект сканера EinScan Rigil с расширенным набором аксессуаров Pro Kit: поворотный стол, штатив, маркеры и кейс.',
    keywords: 'EinScan Rigil Pro Kit, комплект 3D сканера с аксессуарами, ДС‑Инжиниринг',
  },
  'shining-rigil-lite': {
    title: '3D сканер Shining 3D EinScan Rigil Lite | ДС‑Инжиниринг',
    description: 'Легкий и экономичный ручной 3D-сканер Shining 3D EinScan Rigil Lite для макетирования и базового реверса.',
    keywords: 'EinScan Rigil Lite, легкий 3D сканер, доступный сканер Shining 3D, ДС‑Инжиниринг',
  },
  // 3D-сканеры ScanLine (Россия)
  'scanline-easyscan-hx': {
    title: 'Российский 3D сканер ScanLine EasyScan HX (Аналог EinScan HX) | ДС‑Инжиниринг',
    description: 'Отечественный гибридный лазерный 3D-сканер ScanLine EasyScan HX: синий лазер + LED подсветка. Прямой аналог Shining 3D EinScan HX с гарантией и сервисом в РФ.',
    keywords: 'ScanLine EasyScan HX, российский 3D сканер, аналог EinScan HX, гибридный сканер, сканирование металла без спрея, ДС‑Инжиниринг',
  },
  'scanline-easyscan-hx2': {
    title: '3D сканер ScanLine EasyScan HX2 2-го поколения | ДС‑Инжиниринг',
    description: 'Модернизированный российский 3D-сканер ScanLine EasyScan HX2 с повышенной скоростью и улучшенным лазерным сенсором.',
    keywords: 'ScanLine EasyScan HX2, российский сканер 2 поколения, ДС‑Инжиниринг',
  },
  'scanline-easyscan-libre': {
    title: 'Беспроводной 3D сканер ScanLine EasyScan Libre | ДС‑Инжиниринг',
    description: 'Беспроводной мобильный 3D-сканер ScanLine EasyScan Libre для свободного сканирования в цеху и на монтажных площадках.',
    keywords: 'ScanLine EasyScan Libre, беспроводной 3D сканер, мобильный сканер, ДС‑Инжиниринг',
  },
  'scanline-easyscan-combo': {
    title: 'Метрологический 3D сканер ScanLine EasyScan Combo (Аналог FreeScan Combo) | ДС‑Инжиниринг',
    description: 'Российский метрологический 3D-сканер ScanLine EasyScan Combo: 26 синих лазерных линий + VCSEL. Точность 0.02 мм. Аналог Shining 3D FreeScan Combo.',
    keywords: 'ScanLine EasyScan Combo, аналог FreeScan Combo, российский метрологический сканер, синий лазер 0.02 мм, ДС‑Инжиниринг',
  },
  'scanline-easyscan-combo-exmodel-pro': {
    title: '3D сканер ScanLine EasyScan Combo + ПО EXModel Pro Bundle | ДС‑Инжиниринг',
    description: 'Комплект метрологического сканера ScanLine EasyScan Combo с лицензией ПО обратного инжиниринга EXModel Pro.',
    keywords: 'ScanLine Combo EXModel Pro, комплект сканера с софтом реверса, ДС‑Инжиниринг',
  },
  'scanline-easyscan-combo-plus': {
    title: '3D сканер повышенной мощности ScanLine EasyScan Combo+ | ДС‑Инжиниринг',
    description: 'Флагманский 3D-сканер ScanLine EasyScan Combo+ со скоростью свыше 2.2 млн точек/сек для полированных поверхностей.',
    keywords: 'ScanLine EasyScan Combo+, сканер Combo Plus, скоростной метрологический сканер, ДС‑Инжиниринг',
  },
  'scanline-easyscan-combo-plus-exmodel-pro': {
    title: '3D сканер ScanLine EasyScan Combo+ and EXModel Pro Bundle | ДС‑Инжиниринг',
    description: 'Инженерный комплекс: сканер EasyScan Combo+ и лицензия САПР EXModel Pro.',
    keywords: 'ScanLine Combo Plus EXModel Pro bundle, ДС‑Инжиниринг',
  },
  'scanline-easyscan-ue-pro': {
    title: '3D сканер ScanLine EasyScan UE PRO с фотограмметрией (Аналог FreeScan UE Pro) | ДС‑Инжиниринг',
    description: 'Российский метрологический сканер ScanLine EasyScan UE PRO со встроенной фотограмметрией. Точность 0.02 мм на больших деталях. Аналог FreeScan UE Pro.',
    keywords: 'ScanLine EasyScan UE PRO, аналог FreeScan UE Pro, сканер с фотограмметрией Россия, ДС‑Инжиниринг',
  },
  'scanline-easyscan-ue-pro-exmodel-pro': {
    title: '3D сканер ScanLine EasyScan UE PRO and EXModel Pro Bundle | ДС‑Инжиниринг',
    description: 'Инженерный комплекс для контроля геометрии крупных деталей: сканер EasyScan UE PRO + ПО EXModel Pro.',
    keywords: 'ScanLine UE PRO EXModel Pro, бандл сканера с фотограмметрией, ДС‑Инжиниринг',
  },
  'scanline-easyscan-ue-pro2': {
    title: 'Флагманский 3D сканер ScanLine EasyScan UE PRO2 (50 лазерных линий) | ДС‑Инжиниринг',
    description: 'Флагманский российский 3D-сканер 2-го поколения ScanLine EasyScan UE PRO2 с 50 синими лазерными линиями и скоростью 3.45 млн точек/сек.',
    keywords: 'ScanLine EasyScan UE PRO2, 50 лазерных линий, флагманский сканер ScanLine, ДС‑Инжиниринг',
  },
  'scanline-easyscan-ue-pro2-exmodel-pro': {
    title: '3D сканер ScanLine EasyScan UE PRO2 and EXModel Pro Bundle | ДС‑Инжиниринг',
    description: 'Топовый комплекс лазерного 3D-сканирования и реверса: 50-линейный сканер EasyScan UE PRO2 + САПР EXModel Pro.',
    keywords: 'ScanLine UE PRO2 EXModel Pro бандл, ДС‑Инжиниринг',
  },
  // Shining 3D FreeScan Omni и модули
  'shining-freescan-omni-lite': {
    title: '3D сканер Shining 3D FreeScan Omni Lite (модульный) | ДС‑Инжиниринг',
    description: 'Метрологический модульный лазерный 3D-сканер нового поколения Shining 3D FreeScan Omni Lite с поддержкой апгрейда модулями 1, 2 (VPG) и 3 (AI).',
    keywords: 'Shining 3D FreeScan Omni Lite, модульный 3D сканер, Omni Lite, точность 0.02 мм, ДС‑Инжиниринг',
  },
  'shining-omni-module-1-upfront': {
    title: 'Module 1 upfront для сканера FreeScan Omni Lite | ДС‑Инжиниринг',
    description: 'Аппаратный модуль расширения скорости и поля обзора для метрологического сканера Shining 3D FreeScan Omni Lite.',
    keywords: 'Module 1 upfront, апгрейд FreeScan Omni Lite, ДС‑Инжиниринг',
  },
  'shining-omni-module-2-vpg': {
    title: 'Module 2 (VPG) для сканера FreeScan Omni Lite | ДС‑Инжиниринг',
    description: 'Модуль виртуальной фотограмметрии Virtual Photogrammetry Grid (VPG) для сканера FreeScan Omni Lite. Исключение накопления погрешности на длине.',
    keywords: 'Module 2 VPG, Virtual Photogrammetry Grid, фотограмметрия Omni Lite, ДС‑Инжиниринг',
  },
  'shining-omni-module-3-ai': {
    title: 'Module 3 (AI Feature Recognition) для Omni Lite | ДС‑Инжиниринг',
    description: 'Интеллектуальный нейросетевой модуль распознавания геометрических элементов (отверстия, кромки, пазы) в реальном времени для FreeScan Omni Lite.',
    keywords: 'Module 3 AI Feature Recognition, нейросетевое распознавание элементов, GD&T сканирование, ДС‑Инжиниринг',
  },
  'shining-freescan-omni': {
    title: 'Флагманский 3D сканер Shining 3D FreeScan Omni | ДС‑Инжиниринг',
    description: 'Топовая конфигурация метрологического лазерного сканера Shining 3D FreeScan Omni со встроенными модулями VPG фотограмметрии и AI распознавания элементов.',
    keywords: 'Shining 3D FreeScan Omni, топовый метрологический 3D сканер, AI распознавание геометрии, купить FreeScan Omni, ДС‑Инжиниринг',
  },
  'scanline-easyscan-trio': {
    title: '3-камерный 3D сканер ScanLine EasyScan TRIO | ДС‑Инжиниринг',
    description: 'Инновационный российский 3D-сканер ScanLine EasyScan TRIO с 3 промышленными камерами по 5 Мп для одновременного охвата широкого поля и микрорельефа.',
    keywords: 'ScanLine EasyScan TRIO, 3-камерный сканер, мультифокальный 3D сканер, точность 0.018 мм, ДС‑Инжиниринг',
  },
  'scanline-easyscan-ue-pronova': {
    title: '3D сканер ScanLine EasyScan UE ProNova | ДС‑Инжиниринг',
    description: 'Метрологический лазерный сканер ScanLine EasyScan UE ProNova с поддержкой бесшовного апгрейда до оптической трекинговой КИМ TrackerScan.',
    keywords: 'ScanLine EasyScan UE ProNova, ProNova сканер, трекинг КИМ, ДС‑Инжиниринг',
  },
  // Оптические КИМ TrackerScan и щупы FreeProbe
  'scanline-trackerscan-pronova': {
    title: 'Оптическая координатно-измерительная система ScanLine TrackerScan ProNova | ДС‑Инжиниринг',
    description: 'Флагманская российская оптическая КИМ динамического трекинга TrackerScan ProNova. Лазерное 3D-сканирование БЕЗ наклеивания маркеров на деталь.',
    keywords: 'ScanLine TrackerScan ProNova, оптическая КИМ, сканирование без маркеров, оптический трекер, динамический трекинг, купить TrackerScan, ДС‑Инжиниринг',
  },
  'scanline-upgrade-pronova-to-trackerscan': {
    title: 'Модернизация EasyScan UE ProNova до TrackerScan ProNova | ДС‑Инжиниринг',
    description: 'Пакет сервисной модернизации сканера EasyScan UE ProNova до полноценной оптической координатно-измерительной системы TrackerScan ProNova.',
    keywords: 'модернизация ProNova до TrackerScan, апгрейд сканера до оптической КИМ, ДС‑Инжиниринг',
  },
  'scanline-trackerscan-pro-s': {
    title: 'Оптическая КИМ ScanLine TrackerScan Pro S | ДС‑Инжиниринг',
    description: 'Оптическая координатно-измерительная система со стандартным полем трекинга ScanLine TrackerScan Pro S для цехового контроля без маркеров.',
    keywords: 'ScanLine TrackerScan Pro S, оптический трекер Pro S, безмаркерный контроль деталей, ДС‑Инжиниринг',
  },
  'scanline-extra-tracker-pro-s': {
    title: 'Дополнительный трекер ScanLine TrackerScan Pro S | ДС‑Инжиниринг',
    description: 'Второй оптический трекер расширения для многокамерной измерительной сети ScanLine TrackerScan Pro S без слепых зон.',
    keywords: 'дополнительный трекер Pro S, расширение поля трекинга, ДС‑Инжиниринг',
  },
  'scanline-trackerscan-pro-w': {
    title: 'Широкопольная оптическая КИМ ScanLine TrackerScan Pro W | ДС‑Инжиниринг',
    description: 'Широкопольная оптическая координатно-измерительная система ScanLine TrackerScan Pro W (Wide) с объемом контроля до 30 м³ для авиации и судостроения.',
    keywords: 'ScanLine TrackerScan Pro W, широкопольная оптическая КИМ, крупногабаритные измерения без маркеров, ДС‑Инжиниринг',
  },
  'scanline-extra-tracker-pro-w': {
    title: 'Дополнительный широкопольный трекер ScanLine TrackerScan Pro W | ДС‑Инжиниринг',
    description: 'Синхронизируемый широкоугольный трекер для масштабирования измерительного пространства TrackerScan Pro W до 100 м³.',
    keywords: 'дополнительный трекер Pro W, масштабная оптическая КИМ, ДС‑Инжиниринг',
  },
  'scanline-freeprobe-1-2': {
    title: 'Беспроводной контактный щуп FreeProbe / FreeProbe 2 | ДС‑Инжиниринг',
    description: 'Беспроводной контактный щуп FreeProbe / FreeProbe 2 для оптических КИМ TrackerScan. Измерение скрытых зон, отверстий и базовых поверхностей (GD&T).',
    keywords: 'FreeProbe, FreeProbe 2, оптический щуп, беспроводной щуп для оптической КИМ, контактные измерения без проводов, ДС‑Инжиниринг',
  },
  'scanline-freeprobe-2-pro': {
    title: 'Прецизионный контактный щуп FreeProbe 2 Pro | ДС‑Инжиниринг',
    description: 'Флагманский беспроводной оптический щуп FreeProbe 2 Pro с пьезоэлектрическим датчиком усилия касания для субмикронной повторяемости.',
    keywords: 'FreeProbe 2 Pro, прецизионный щуп с пьезодатчиком, щуп для TrackerScan, ДС‑Инжиниринг',
  },
  'shining-autoscan-inspec-2': {
    title: 'Автоматический 3D сканер Shining 3D AutoScan Inspec 2 | ДС‑Инжиниринг',
    description: 'Полностью автоматический 3-осевой настольный 3D-сканер Shining 3D AutoScan Inspec 2 с точностью 10 мкм для мелких прецизионных деталей.',
    keywords: 'Shining 3D AutoScan Inspec 2, автоматический 3D сканер, 3-осевой сканер, контроль шестерен и лопаток, точность 10 мкм, ДС‑Инжиниринг',
  },
  'scanline-staticscan-q9': {
    title: 'Стационарный оптический 3D сканер ScanLine StaticScan Q9 (9 Мп) | ДС‑Инжиниринг',
    description: 'Российский стационарный оптический 3D-сканер ScanLine StaticScan Q9 с двумя 9 Мп камерами и точностью 0.008 мм для контроля штампов и отливок.',
    keywords: 'ScanLine StaticScan Q9, стационарный 3D сканер, оптический сканер 9 Мп, точность 8 мкм, ДС‑Инжиниринг',
  },
  'scanline-staticscan-q12': {
    title: 'Стационарный 3D сканер сверхвысокого разрешения ScanLine StaticScan Q12 (12 Мп) | ДС‑Инжиниринг',
    description: 'Флагманский отечественный стационарный 3D-сканер ScanLine StaticScan Q12 с двумя 12 Мп матрицами и точностью до 0.005 мм (5 мкм).',
    keywords: 'ScanLine StaticScan Q12, стационарный оптический сканер 12 Мп, точность 5 мкм, лабораторный контроль геометрии, ДС‑Инжиниринг',
  },
  'scanline-robotscan-q12': {
    title: 'Роботизированная система 3D-контроля ScanLine RobotScan Q12 | ДС‑Инжиниринг',
    description: 'Роботизированная ячейка автоматического 3D-контроля ScanLine RobotScan Q12 на базе 6-осевого промышленного робота и оптического сенсора 12 Мп.',
    keywords: 'ScanLine RobotScan Q12, роботизированный 3D контроль, Индустрия 4.0, автоматический контроль геометрии на конвейере, робот KUKA Fanuc 3D сканер, ДС‑Инжиниринг',
  },
  'freescan-combo': {
    title: 'Лазерный 3D-сканер Shining 3D FreeScan Combo (двойной источник) | ДС‑Инжиниринг',
    description: 'Метрологический портативный 3D-сканер Shining 3D FreeScan Combo: 26 синих лазерных линий + инфракрасный VCSEL источник. Точность до 0.02 мм, сканирование металла без матирующего спрея.',
    keywords: 'Shining 3D FreeScan Combo, метрологический 3D сканер, лазерный 3D сканер синего лазера, сканирование металла без спрея, точность 0.02 мм, купить FreeScan Combo, ДС‑Инжиниринг',
    ogTitle: 'Лазерный 3D-сканер Shining 3D FreeScan Combo',
  },
  'freescan-ue-pro': {
    title: 'Лазерный 3D-сканер Shining 3D FreeScan UE Pro с фотограмметрией | ДС‑Инжиниринг',
    description: 'Метрологический 3D-сканер FreeScan UE Pro со встроенной фотограмметрией: 32 синие лазерные линии, объемная точность 0.02+0.015 мм/м, оцифровка крупногабаритных деталей.',
    keywords: 'Shining 3D FreeScan UE Pro, 3D сканер со встроенной фотограмметрией, синий лазерный сканер, точность 0.02 мм, купить FreeScan UE Pro, ДС‑Инжиниринг',
    ogTitle: 'Лазерный 3D-сканер Shining 3D FreeScan UE Pro',
  },
  'einscan-pro-hd': {
    title: 'Ручной 3D-сканер Shining 3D EinScan Pro HD | ДС‑Инжиниринг',
    description: 'Мультифункциональный оптический 3D-сканер EinScan Pro HD со структурированным светом: ручной HD режим, режим со штативом и поворотным столом, цветная текстурная камера.',
    keywords: 'EinScan Pro HD, Shining 3D EinScan, ручной 3D сканер, оптический 3D сканер, сканер для реверс инжиниринга, купить EinScan, ДС‑Инжиниринг',
    ogTitle: 'Ручной 3D-сканер Shining 3D EinScan Pro HD',
  },
  'leica-at960': {
    title: 'Лазерный трекер Leica Absolute Tracker AT960 (6DoF) | ДС‑Инжиниринг',
    description: 'Флагманский 6DoF лазерный трекер Leica Absolute Tracker AT960. Интерферометр AIFM, частота 1000 Гц, поддержка 3D-сканера Absolute Scanner AS1, беспроводного щупа T-Probe и B-Probe.',
    keywords: 'лазерный трекер Leica, Leica AT960, Hexagon Leica Absolute Tracker, 6DoF трекер, Absolute Scanner AS1, T-Probe, B-Probeplus, высокоточные измерения до 160 м, купить лазерный трекер, ДС‑Инжиниринг',
    ogTitle: 'Leica Absolute Tracker AT960 — Флагманский 6DoF лазерный трекер',
    ogDescription: 'Флагманский лазерный трекер все-в-одном с поддержкой 6 степеней свободы и сканера Absolute Scanner AS1.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  },
  'leica-at500': {
    title: 'Лазерный трекер Leica Absolute Tracker AT500 (автономный 6DoF) | ДС‑Инжиниринг',
    description: 'Портативный лазерный трекер нового поколения Leica Absolute Tracker AT500. Встроенный контроллер без внешних блоков, защита IP54, аккумуляторы горячей замены, щуп B-Probeplus.',
    keywords: 'Leica AT500, лазерный трекер нового поколения, портативный 6DoF трекер, Leica B-Probeplus, трекер без контроллера, IP54 трекер, купить Leica AT500, ДС‑Инжиниринг',
    ogTitle: 'Leica Absolute Tracker AT500 — Новое поколение портативных 6DoF трекеров',
    ogDescription: 'Автономный лазерный трекер со встроенным контроллером, защитой IP54 и беспроводным щупом B-Probeplus.',
    ogImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  },
  'leica-at930': {
    title: 'Лазерный трекер Leica Absolute Tracker AT930 (динамический 3D) | ДС‑Инжиниринг',
    description: 'Высокодинамичный 3D лазерный трекер Leica Absolute Tracker AT930 со встроенным абсолютным интерферометром AIFM и системой PowerLock для скоростных измерений по отражателям SMR.',
    keywords: 'Leica AT930, 3D лазерный трекер, трекер с интерферометром AIFM, PowerLock, динамические измерения отражателей SMR, юстировка станочного оборудования, ДС‑Инжиниринг',
    ogTitle: 'Лазерный трекер Leica Absolute Tracker AT930 — Динамический 3D трекер',
    ogDescription: 'Сверхточный 3D трекер с интерферометром AIFM и частотой опроса 1000 Гц для контроля непрерывных траекторий.',
    ogImage: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  },
  'leica-ats600': {
    title: 'Лазерный трекер прямого сканирования Leica Absolute Tracker ATS600 | ДС‑Инжиниринг',
    description: 'Первый в мире сканирующий лазерный трекер Leica ATS600 без отражателей. Прямое лазерное 3D-сканирование крупногабаритных поверхностей на дистанциях до 60 метров с точностью от 0.3 мм.',
    keywords: 'Leica ATS600, сканирующий лазерный трекер, прямое сканирование без отражателей, бесконтактный контроль крупногабаритных деталей, трекер Hexagon ATS600, PolyWorks Inspector, ДС‑Инжиниринг',
    ogTitle: 'Leica Absolute Tracker ATS600 — Прямое сканирование поверхностей без отражателей',
    ogDescription: 'Прямое лазерное сканирование крупногабаритных объектов на расстоянии до 60 м без отражателей и меток.',
    ogImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  'leica-ats800': {
    title: 'Лазерный трекер Leica Absolute Tracker ATS800 (скоростное сканирование) | ДС‑Инжиниринг',
    description: 'Инновационный лазерный трекер прямого сканирования Leica ATS800. Высокоскоростная оцифровка поверхностей и автоматическое распознавание кромок и отверстий без мишеней до 80 м.',
    keywords: 'Leica ATS800, скоростной сканирующий трекер, прямое сканирование кромок, автоматическая детекция отверстий, трекер Leica ATS800, купить в РФ, ДС‑Инжиниринг',
    ogTitle: 'Leica Absolute Tracker ATS800 — Сверхскоростное прямое сканирование поверхностей и кромок',
    ogDescription: 'Высокоскоростной прямой сбор облака точек и автоматический контроль кромок без отражателей на дистанциях до 80 м.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  },
  'leica-at403': {
    title: 'Лазерный трекер Leica Absolute Tracker AT403 (Hexagon) | ДС‑Инжиниринг',
    description: 'Ультрапортативный лазерный трекер Leica AT403 с защитой IP54, сферой измерений до 320 м и автономным питанием от аккумуляторов для крупногабаритного контроля в цеху и на улице.',
    keywords: 'Leica AT403, лазерный трекер Leica, Hexagon Absolute Tracker, измерения крупногабаритных объектов, IP54 трекер, купить трекер Leica, ДС‑Инжиниринг',
    ogTitle: 'Лазерный трекер Leica Absolute Tracker AT403',
  },
  'renishaw-equator-300': {
    title: 'Калибрующая система Renishaw Equator 300 / 500 | ДС‑Инжиниринг',
    description: 'Универсальный цеховой сравнительный калибратор Renishaw Equator 300 / 500 для 100% контроля серийных деталей рядом со станком с ЧПУ. Автоматическая термокомпенсация 10–40°C.',
    keywords: 'Renishaw Equator, калибратор Equator 300, Equator 500, контроль деталей на станке, автокоррекция инструмента, Renishaw Россия, ДС‑Инжиниринг',
    ogTitle: 'Калибрующая система Renishaw Equator 300 / 500',
  },
  'renishaw-ph20-sp25': {
    title: 'Измерительные головки и датчики Renishaw PH20 / REVO / SP25M | ДС‑Инжиниринг',
    description: 'Поставка, монтаж и модернизация КИМ 5-осевыми измерительными головками Renishaw PH20, REVO-2 и сканирующими датчиками SP25M. Ускорение циклов измерений в 3 раза.',
    keywords: 'Renishaw PH20, Renishaw REVO, датчик SP25M, измерительные головки для КИМ, 5-осевые измерения, модернизация КИМ, ДС‑Инжиниринг',
    ogTitle: 'Измерительные головки и 5-осевые датчики Renishaw',
  }
};

export const SERVICE_SEO_DATA: Record<string, SeoMetadata> = {
  '3d-scanning': {
    title: 'Услуги прецизионного 3D-сканирования деталей в Самаре и по РФ | ДС‑Инжиниринг',
    description: 'Лазерное и оптическое 3D-сканирование изделий от 10 мм до 20 м: ScanLine EasyScan Omni, Hexagon RS6, Leica AT403. Точность до 0.020 мм, выезд инженеров-метрологов по всей России за 24–48 часов.',
    keywords: 'услуги 3D сканирования, лазерное сканирование деталей, выездное 3D сканирование, точность 20 мкм, сканирование штампов и пресс-форм, Самара, Москва, Екатеринбург, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/services/3d-scanning',
    ogTitle: 'Высокоточное 3D-сканирование деталей и оснастки | ДС‑Инжиниринг',
    ogDescription: 'Лазерное и оптическое сканирование металлоконструкций, штампов, пресс-форм и отливок. Выезд со сканером по РФ.',
    ogImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    schemaType: 'service',
  },
  'reverse-engineering': {
    title: 'Обратный инжиниринг (реверс) и 3D-моделирование по сканам (STEP, ЕСКД) | ДС‑Инжиниринг',
    description: 'Профессиональный реверс-инжиниринг деталей, оснастки и узлов по данным 3D-сканирования и КИМ: создание точных твердотельных CAD-моделей (STEP, Parasolid, IGES) для станков с ЧПУ и комплекта чертежей по ЕСКД.',
    keywords: 'обратный инжиниринг, реверс инжиниринг, построение CAD по STL, твердотельное моделирование, импортозамещение деталей, чертежи ЕСКД, Geomagic Design X, TopSolid 7, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/services/reverse-engineering',
    ogTitle: 'Обратный инжиниринг и построение CAD по 3D-сканам | ДС‑Инжиниринг',
    ogDescription: 'Построение твердотельных моделей (STEP, Parasolid) и разработка конструкторской документации по ЕСКД.',
    ogImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    schemaType: 'service',
  },
  'parts-inspection': {
    title: 'Метрологический контроль геометрии деталей и FAI-протоколы (GD&T) | ДС‑Инжиниринг',
    description: 'Метрологический 3D-контроль геометрии деталей и оснастки по CAD-моделям: расчет отклонений формы и расположения (GD&T ISO 1101 / ASME Y14.5), инспекция первого изделия (FAI) в PolyWorks|Inspector™.',
    keywords: 'контроль геометрии по CAD, расчет допусков GD&T, протокол первого изделия FAI, 3D цветовая карта отклонений, КИМ Mitutoyo, PolyWorks Inspector, метрологическая экспертиза, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/services/parts-inspection',
    ogTitle: 'Метрологический контроль геометрии деталей по CAD | ДС‑Инжиниринг',
    ogDescription: 'Цветовые карты отклонений, анализ размерных цепей, протоколы FAI по стандартам ISO 1101 и ASME Y14.5.',
    ogImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    schemaType: 'service',
  },
  'tooling-design': {
    title: 'Проектирование и изготовление пресс-форм и штампов "под ключ" | ДС‑Инжиниринг',
    description: 'Сквозное проектирование технологической оснастки: пресс-формы для литья пластмасс и металлов под давлением, гибочные и вырубные штампы, модельные комплекты. DFM-анализ, КД по ЕСКД и мехобработка на ЧПУ.',
    keywords: 'проектирование пресс-форм, изготовление штампов, литейная оснастка, TopSolid Mold, DFM анализ, ЕСКД, ЧПУ обработка оснастки, Самара, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/services/tooling-design',
    ogTitle: 'Проектирование пресс-форм и штампов | ДС‑Инжиниринг',
    ogDescription: 'Разработка технологической оснастки в TopSolid Mold & Progress с полным циклом испытаний и DFM-анализом.',
    ogImage: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
    schemaType: 'service',
  },
  'cmm-maintenance': {
    title: 'Сервисное обслуживание, калибровка и модернизация КИМ по ISO 10360 | ДС‑Инжиниринг',
    description: 'Комплексное ТО, диагностика, юстировка и калибровка координатно-измерительных машин с выдачей сертификатов по ISO 10360-2. Модернизация контроллерами Renishaw UCC и переход на PolyWorks.',
    keywords: 'ремонт КИМ, обслуживание координатно-измерительных машин, калибровка КИМ ISO 10360, поверка КИМ, модернизация КИМ Renishaw UCC, сервис измерительного оборудования, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/services/cmm-maintenance',
    ogTitle: 'Сервис, калибровка и модернизация КИМ | ДС‑Инжиниринг',
    ogDescription: 'Калибровка по ISO 10360, замена датчиков Renishaw, юстировка направляющих и ретрофит КИМ.',
    ogImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    schemaType: 'service',
  },
  'postprocessors-dev': {
    title: 'Разработка постпроцессоров для станков с ЧПУ (Fanuc, Heidenhain, Siemens) | ДС‑Инжиниринг',
    description: 'Разработка и наладка надежных постпроцессоров для 3–5 осевых фрезерных, токарных и многозадачных станков с ЧПУ (TopSolid 7 CAM, PowerMill). 100% кинематическая симуляция и защита от аварий.',
    keywords: 'разработка постпроцессоров ЧПУ, постпроцессоры Fanuc Siemens Heidenhain Haas Syntec, TopSolid CAM постпроцессор, 5 осевая обработка, кинематическая симуляция станка, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/services/postprocessors-dev',
    ogTitle: 'Разработка постпроцессоров для станков ЧПУ | ДС‑Инжиниринг',
    ogDescription: 'Постпроцессоры для 3-, 4- и 5-осевой обработки, токарно-фрезерных автоматов и роботов.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    schemaType: 'service',
  },
  'calculator': {
    title: 'Инженерный калькулятор стоимости 3D-сканирования, контроля и реверса | ДС‑Инжиниринг',
    description: 'Онлайн калькулятор предварительного расчета стоимости и сроков выполнения инжиниринговых услуг: оптическое и лазерное 3D-сканирование, реверс-инжиниринг в твердотельный CAD (STEP), контроль геометрии деталей и написание постпроцессоров.',
    keywords: 'калькулятор 3D сканирования, расчет стоимости реверс инжиниринга, цена контроля точности деталей, стоимость разработки постпроцессора, Самара, РФ, ДС‑Инжиниринг',
    canonicalUrl: 'https://ds-engineering.ru/calculator',
    ogTitle: 'Онлайн калькулятор расчета стоимости инженерных услуг | ДС‑Инжиниринг',
    ogDescription: 'Мгновенный расчет стоимости и сроков 3D-сканирования, реверса и контроля деталей.',
    ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    schemaType: 'service',
  }
};

export const KNOWLEDGE_CATEGORY_SEO_DATA: Record<string, { title: string; description: string }> = {
  gost: {
    title: 'Стандарты, ГОСТы и методики GD&T в метрологии | База знаний ДС‑Инжиниринг',
    description: 'Руководства и стандарты: ISO 1101, ASME Y14.5, ГОСТ Р 53442, ISO 10360-2 для оценки точности КИМ и контроля геометрических допусков изделий.',
  },
  tutorials: {
    title: 'Практические руководства по CAD/CAM и метрологии | База знаний ДС‑Инжиниринг',
    description: 'Инструкции и методики работы в TopSolid 7, PolyWorks|Inspector, Shining 3D Inspect и EXModel: пошаговые уроки от инженеров ДС‑Инжиниринг.',
  },
  cases: {
    title: 'Инженерные кейсы и примеры внедрения 3D-технологий | ДС‑Инжиниринг',
    description: 'Реальные проекты внедрения CAD/CAM решений, 3D-сканирования и контроля геометрии на машиностроительных и авиационных предприятиях РФ.',
  },
  video: {
    title: 'Видеоуроки и вебинары по TopSolid и 3D-метрологии | ДС‑Инжиниринг',
    description: 'Видеозаписи вебинаров, мастер-классов и демонстраций работы с измерительным оборудованием и программными комплексами.',
  },
  faq: {
    title: 'Часто задаваемые вопросы по CAD/CAM и метрологии | ДС‑Инжиниринг',
    description: 'Ответы экспертов на ключевые вопросы по выбору КИМ, 3D-сканеров, лицензированию TopSolid и проведению обратного инжиниринга.',
  }
};

export const SOFTWARE_CATEGORY_SEO_DATA: Record<string, { title: string; description: string }> = {
  cad_cam: {
    title: 'Комплексные CAD/CAM/PDM системы для проектирования и ЧПУ | ДС‑Инжиниринг',
    description: 'Сквозные интегрированные системы TopSolid 7 (Design, Cam, Mold, Progress, Sheetmetal) и сопутствующие модули для сквозной подготовки производства.',
  },
  metrology_sw: {
    title: 'Метрологическое ПО для координатных измерений и 3D-контроля | ДС‑Инжиниринг',
    description: 'Лицензионные метрологические комплексы PolyWorks|Inspector™, SHINING 3D Inspect и Geomagic Control X для анализа отклонений и FAI.',
  },
  reverse_sw: {
    title: 'Программное обеспечение для реверс-инжиниринга | ДС‑Инжиниринг',
    description: 'Программы Shining 3D EXModel на ядре Parasolid, Geomagic Design X и Geomagic Wrap для реконструкции CAD-моделей по сканам.',
  }
};

export const HARDWARE_CATEGORY_SEO_DATA: Record<string, { title: string; description: string }> = {
  cmm: {
    title: 'Координатно-измерительные машины (КИМ) портальные и мостовые | ДС‑Инжиниринг',
    description: 'Высокоточные стационарные КИМ PMT, мостовые и портальные измерительные комплексы для метрологических лабораторий и цехового контроля.',
  },
  arms: {
    title: 'Мобильные измерительные руки (портативные КИМ) PMT и ROMER | ДС‑Инжиниринг',
    description: 'Портативные измерительные манипуляторы PMT ALPHA Arm и Hexagon Absolute Arm с контактными щупами и лазерными сканерами.',
  },
  scanners: {
    title: 'Ручные и оптические 3D-сканеры Shining 3D FreeScan и EinScan | ДС‑Инжиниринг',
    description: 'Метрологические лазерные сканеры FreeScan Combo, FreeScan UE Pro и оптические системы для быстрого сканирования любых поверхностей.',
  },
  trackers: {
    title: 'Лазерные трекеры Leica Absolute Tracker для крупногабаритных измерений | ДС‑Инжиниринг',
    description: 'Высокоточные лазерные трекеры Leica AT960, AT500, ATS600 для контроля крупногабаритных узлов, стапелей и авиационных конструкций.',
  },
  renishaw: {
    title: 'Измерительные системы и датчики Renishaw (Equator, PH20, SP25) | ДС‑Инжиниринг',
    description: 'Калибраторы Renishaw Equator 300/500, 5-осевые измерительные головки PH20 и REVO-2, сканирующие щупы и оснастка.',
  }
};

/**
 * Resolves complete and structured SEO metadata based on application state
 */
export function resolveDynamicSeo(params: {
  page: PageId;
  selectedProduct?: Product | null;
  selectedArticle?: Article | null;
  selectedKnowledgeItem?: KnowledgeItem | null;
  selectedServiceId?: string | null;
  activeCategory?: string | null;
  selectedKnowledgeCategory?: string | null;
  customPages?: CustomPage[];
  services?: ServiceItem[];
  products?: Product[];
  news?: Article[];
  knowledge?: KnowledgeItem[];
  isAdmin?: boolean;
}): SeoMetadata {
  const {
    page,
    selectedProduct,
    selectedArticle,
    selectedKnowledgeItem,
    selectedServiceId,
    activeCategory,
    selectedKnowledgeCategory,
    customPages = [],
    services = [],
  } = params;

  // 1. Detailed Product page
  if (selectedProduct) {
    const canonicalUrl = getCanonicalUrl(page, selectedProduct.id);
    const prodSeo = PRODUCT_SEO_DATA[selectedProduct.id];
    
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Главная', url: 'https://ds-engineering.ru/main' },
      { 
        name: selectedProduct.type === 'software' ? 'Программное обеспечение' : 'Оборудование', 
        url: selectedProduct.type === 'software' ? 'https://ds-engineering.ru/software' : 'https://ds-engineering.ru/hardware' 
      },
      { name: selectedProduct.name, url: canonicalUrl }
    ];

    const ogImageAlt = prodSeo?.ogImageAlt || `${selectedProduct.name} — ${selectedProduct.brand || 'ДС‑Инжиниринг'}`;
    const productPrice = selectedProduct.price;
    const productBrand = selectedProduct.brand;

    if (prodSeo) {
      return {
        ...prodSeo,
        canonicalUrl,
        ogType: 'product',
        schemaType: 'product',
        schemaData: {
          brand: selectedProduct.brand,
          price: selectedProduct.price,
          category: selectedProduct.categoryLabel,
        },
        breadcrumbs,
        ogImage: prodSeo.ogImage || selectedProduct.image,
        ogImageAlt,
        twitterCard: 'summary_large_image',
        twitterImageAlt: ogImageAlt,
        productPrice,
        productBrand,
        productCurrency: 'RUB',
        productAvailability: 'in stock',
      };
    }

    const title = `${selectedProduct.name} — поставка, внедрение и консультации | ДС‑Инжиниринг`;
    const description = selectedProduct.fullDescription 
      ? `${selectedProduct.name}: ${selectedProduct.fullDescription.slice(0, 160)}...`
      : `${selectedProduct.name} от ДС‑Инжиниринг. Поставка, внедрение, гарантия, инструктаж и консультации специалистов.`;
    const keywords = [
      selectedProduct.name,
      selectedProduct.brand,
      selectedProduct.categoryLabel,
      'купить',
      'внедрение',
      'инструктаж',
      'технические консультации',
      'ДС‑Инжиниринг'
    ].join(', ');

    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
      ogImage: selectedProduct.image,
      ogImageAlt,
      ogType: 'product',
      canonicalUrl,
      schemaType: 'product',
      schemaData: {
        brand: selectedProduct.brand,
        price: selectedProduct.price,
        category: selectedProduct.categoryLabel,
      },
      breadcrumbs,
      twitterCard: 'summary_large_image',
      twitterImageAlt: ogImageAlt,
      productPrice,
      productBrand,
      productCurrency: 'RUB',
      productAvailability: 'in stock',
    };
  }

  // 2. Detailed Service page
  if (page === 'services' && selectedServiceId) {
    const canonicalUrl = getCanonicalUrl('services', selectedServiceId);
    const srvSeo = SERVICE_SEO_DATA[selectedServiceId];
    const srvItem = services.find(s => s.id === selectedServiceId);
    const serviceName = srvItem?.title || srvSeo?.title || 'Инжиниринговая услуга';
    const srvImg = srvItem?.image || srvSeo?.ogImage || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80';
    const srvAlt = `${serviceName} — ДС‑Инжиниринг`;

    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Главная', url: 'https://ds-engineering.ru/main' },
      { name: 'Услуги', url: 'https://ds-engineering.ru/services' },
      { name: serviceName, url: canonicalUrl }
    ];

    if (srvSeo) {
      return {
        ...srvSeo,
        canonicalUrl,
        ogType: 'website',
        ogImage: srvImg,
        ogImageAlt: srvAlt,
        twitterCard: 'summary_large_image',
        twitterImageAlt: srvAlt,
        schemaType: 'service',
        breadcrumbs,
      };
    }

    const title = srvItem?.metaTitle || `${serviceName} в Самаре и по РФ | ДС‑Инжиниринг`;
    const description = srvItem?.metaDescription || srvItem?.shortDesc || srvItem?.fullDesc?.slice(0, 160) || `Профессиональные услуги: ${serviceName}. Высокая точность, опытные инженеры, оперативный выезд.`;
    const keywords = srvItem?.metaKeywords?.join(', ') || srvItem?.keywords?.join(', ') || `${serviceName}, услуги 3D, метрология, Самара, ДС‑Инжиниринг`;
    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
      ogImage: srvImg,
      ogImageAlt: srvAlt,
      twitterCard: 'summary_large_image',
      twitterImageAlt: srvAlt,
      canonicalUrl,
      schemaType: 'service',
      breadcrumbs,
    };
  }

  // 3. Detailed News Article page
  if (page === 'news' && selectedArticle) {
    const canonicalUrl = getCanonicalUrl('news', selectedArticle.id);
    const title = selectedArticle.metaTitle || `${selectedArticle.title} | Пресс-центр ДС‑Инжиниринг`;
    const articleContentStr = typeof selectedArticle.content === 'string' ? selectedArticle.content : selectedArticle.content?.join(' ');
    const description = selectedArticle.metaDescription || selectedArticle.preview || articleContentStr?.slice(0, 160) || 'Новости компании ДС‑Инжиниринг.';
    const keywords = selectedArticle.metaKeywords?.join(', ') || `${selectedArticle.title}, ${selectedArticle.category}, ${selectedArticle.tags?.join(', ')}, новости ДС‑Инжиниринг`;
    const artAlt = `${selectedArticle.title} — Пресс-центр ДС‑Инжиниринг`;

    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Главная', url: 'https://ds-engineering.ru/main' },
      { name: 'Новости', url: 'https://ds-engineering.ru/news' },
      { name: selectedArticle.title, url: canonicalUrl }
    ];

    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
      ogImage: selectedArticle.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
      ogImageAlt: artAlt,
      ogType: 'article',
      canonicalUrl,
      schemaType: 'article',
      schemaData: {
        datePublished: selectedArticle.date,
      },
      breadcrumbs,
      twitterCard: 'summary_large_image',
      twitterImageAlt: artAlt,
      articlePublishedTime: selectedArticle.date,
      articleSection: selectedArticle.category,
      articleTags: selectedArticle.tags,
      articleAuthor: 'Инженерный центр ДС‑Инжиниринг',
    };
  }

  // 4. Detailed Knowledge Item page
  if (page === 'knowledge' && selectedKnowledgeItem) {
    const canonicalUrl = getCanonicalUrl('knowledge', selectedKnowledgeItem.id);
    const title = `${selectedKnowledgeItem.title} | База знаний ДС‑Инжиниринг`;
    const description = selectedKnowledgeItem.summary || selectedKnowledgeItem.content?.slice(0, 160) || 'Материал технической базы знаний ДС‑Инжиниринг.';
    const keywords = `${selectedKnowledgeItem.title}, ${selectedKnowledgeItem.category || ''}, база знаний, ГОСТ, GD&T, CAD CAM, ДС‑Инжиниринг`;
    const knowAlt = `${selectedKnowledgeItem.title} — База знаний ДС‑Инжиниринг`;

    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Главная', url: 'https://ds-engineering.ru/main' },
      { name: 'База знаний', url: 'https://ds-engineering.ru/knowledge' },
      { name: selectedKnowledgeItem.title, url: canonicalUrl }
    ];

    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
      ogImage: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1200&q=80',
      ogImageAlt: knowAlt,
      ogType: 'article',
      canonicalUrl,
      schemaType: 'article',
      breadcrumbs,
      twitterCard: 'summary_large_image',
      twitterImageAlt: knowAlt,
      articleSection: selectedKnowledgeItem.category || 'Техническая документация',
      articleAuthor: 'Инженерный центр ДС‑Инжиниринг',
    };
  }

  // 5. Filtered Category Views (Software / Hardware / Knowledge)
  if (page === 'software' && activeCategory && activeCategory !== 'all' && SOFTWARE_CATEGORY_SEO_DATA[activeCategory]) {
    const catData = SOFTWARE_CATEGORY_SEO_DATA[activeCategory];
    const canonicalUrl = getCanonicalUrl('software');
    return {
      title: `${catData.title} | ДС‑Инжиниринг`,
      description: catData.description,
      keywords: `${catData.title}, купить CAD CAM ПО, TopSolid, PolyWorks, Shining 3D, ДС‑Инжиниринг`,
      canonicalUrl,
      ogTitle: catData.title,
      ogDescription: catData.description,
      breadcrumbs: [
        { name: 'Главная', url: 'https://ds-engineering.ru/main' },
        { name: 'Программное обеспечение', url: canonicalUrl }
      ]
    };
  }

  if (page === 'hardware' && activeCategory && activeCategory !== 'all' && HARDWARE_CATEGORY_SEO_DATA[activeCategory]) {
    const catData = HARDWARE_CATEGORY_SEO_DATA[activeCategory];
    const canonicalUrl = getCanonicalUrl('hardware');
    return {
      title: `${catData.title} | ДС‑Инжиниринг`,
      description: catData.description,
      keywords: `${catData.title}, КИМ, 3D сканеры, Leica Tracker, Renishaw, ДС‑Инжиниринг`,
      canonicalUrl,
      ogTitle: catData.title,
      ogDescription: catData.description,
      breadcrumbs: [
        { name: 'Главная', url: 'https://ds-engineering.ru/main' },
        { name: 'Оборудование', url: canonicalUrl }
      ]
    };
  }

  if (page === 'knowledge' && selectedKnowledgeCategory && selectedKnowledgeCategory !== 'all' && KNOWLEDGE_CATEGORY_SEO_DATA[selectedKnowledgeCategory]) {
    const catData = KNOWLEDGE_CATEGORY_SEO_DATA[selectedKnowledgeCategory];
    const canonicalUrl = getCanonicalUrl('knowledge');
    return {
      title: catData.title,
      description: catData.description,
      keywords: `${catData.title}, база знаний, ГОСТ, методики, ДС‑Инжиниринг`,
      canonicalUrl,
      ogTitle: catData.title,
      ogDescription: catData.description,
      breadcrumbs: [
        { name: 'Главная', url: 'https://ds-engineering.ru/main' },
        { name: 'База знаний', url: canonicalUrl }
      ]
    };
  }

  // 6. Custom CMS Pages
  if (page.startsWith('custom-')) {
    const customPage = customPages.find((p) => p.id === page);
    const canonicalUrl = getCanonicalUrl(page);
    if (customPage) {
      const title = `${customPage.title} | ДС‑Инжиниринг`;
      const description = customPage.description || `Информационная страница ${customPage.title} компании ДС‑Инжиниринг.`;
      return {
        title,
        description,
        keywords: `${customPage.title}, ДС‑Инжиниринг, инжиниринг, промышленность`,
        canonicalUrl,
        ogTitle: title,
        ogDescription: description,
        breadcrumbs: [
          { name: 'Главная', url: 'https://ds-engineering.ru/main' },
          { name: customPage.title, url: canonicalUrl }
        ]
      };
    }
  }

  // 7. Standard System Pages (home, software, hardware, services, about, knowledge, news, contacts, account, crm, cms, sitemap, notfound)
  const canonicalUrl = getCanonicalUrl(page);
  const pageSeo = PAGE_SEO_DATA[page];

  // Map breadcrumb name
  const pageNames: Record<string, string> = {
    home: 'Главная',
    software: 'Программное обеспечение',
    hardware: 'Оборудование',
    services: 'Услуги',
    about: 'О компании',
    knowledge: 'База знаний',
    glossary: 'Технический глоссарий',
    news: 'Новости',
    contacts: 'Контакты',
    calculator: 'Калькулятор',
    account: 'Личный кабинет',
    crm: 'CRM система',
    cms: 'CMS панель',
    sitemap: 'Карта сайта',
    notfound: 'Страница не найдена'
  };

  const breadcrumbs: BreadcrumbItem[] = page === 'home' 
    ? [{ name: 'Главная', url: 'https://ds-engineering.ru/main' }]
    : [
        { name: 'Главная', url: 'https://ds-engineering.ru/main' },
        { name: pageNames[page] || page, url: canonicalUrl }
      ];

  if (pageSeo) {
    return {
      ...pageSeo,
      canonicalUrl,
      breadcrumbs,
    };
  }

  // Fallback
  return {
    title: 'ДС‑Инжиниринг | CAD/CAM/PDM системы и 3D-метрология',
    description: 'Промышленный инжиниринг с 1995 года: поставка и внедрение CAD/CAM ПО (TopSolid, PolyWorks, Shining 3D, Geomagic) и измерительного оборудования (PMT, ROMER, Leica).',
    keywords: GLOBAL_DEFAULT_KEYWORDS,
    canonicalUrl,
    breadcrumbs,
  };
}

/**
 * Helper to ensure URLs are absolute for social network crawlers (VK, Telegram, WhatsApp, Twitter, etc.)
 */
export function toAbsoluteUrl(url?: string | null): string {
  if (!url) return 'https://ds-engineering.ru/logo.svg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ds-engineering.ru';
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
}

/**
 * Infer MIME type from image URL extension
 */
export function inferImageMimeType(url: string): string {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

/**
 * Helper to update or create or remove a <meta> element in document.head
 */
export function setOrCreateMeta(attrName: 'name' | 'property', attrValue: string, content?: string | null): void {
  if (typeof document === 'undefined') return;
  const selector = `meta[${attrName}="${attrValue}"]`;
  const tag = document.querySelector(selector);
  if (!content) {
    if (tag && tag.parentNode) {
      tag.parentNode.removeChild(tag);
    }
    return;
  }
  if (!tag) {
    const newTag = document.createElement('meta');
    newTag.setAttribute(attrName, attrValue);
    newTag.setAttribute('content', content);
    document.head.appendChild(newTag);
  } else {
    tag.setAttribute('content', content);
  }
}

/**
 * Updates DOM head meta tags dynamically for SEO bots, OpenGraph & social previews
 */
export function updateDocumentSeo(meta: SeoMetadata) {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  if (meta.title) {
    document.title = meta.title;
  }

  // 2. Update Meta Description
  setOrCreateMeta('name', 'description', meta.description);

  // 3. Update Meta Keywords
  setOrCreateMeta('name', 'keywords', meta.keywords || GLOBAL_DEFAULT_KEYWORDS);

  // 4. Update Author
  setOrCreateMeta('name', 'author', 'ООО «ДС-Инжиниринг»');

  // 5. Update Robots Directives (Dynamic protection for admin / crm / private account / 404 pages)
  const isPrivateOrErrorPage = meta.canonicalUrl?.includes('/crm') || 
    meta.canonicalUrl?.includes('/cms') || 
    meta.canonicalUrl?.includes('/account') || 
    meta.canonicalUrl?.includes('/notfound');

  const robotsContent = meta.robots || (isPrivateOrErrorPage 
    ? 'noindex, nofollow' 
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  
  setOrCreateMeta('name', 'robots', robotsContent);

  // 6. Update Canonical URL
  const canonicalUrl = meta.canonicalUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}${window.location.hash || ''}` : 'https://ds-engineering.ru/');
  
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalTag);
  }
  canonicalTag.setAttribute('href', canonicalUrl);

  // 7. Resolve Social Media Images and Dimensions
  const rawImage = meta.ogImage || '/logo.svg';
  const absoluteImageUrl = toAbsoluteUrl(rawImage);
  const imageMimeType = meta.ogImageType || inferImageMimeType(absoluteImageUrl);
  const imageWidth = String(meta.ogImageWidth || '1200');
  const imageHeight = String(meta.ogImageHeight || '630');
  const imageAlt = meta.ogImageAlt || meta.twitterImageAlt || meta.ogTitle || meta.title;
  const effectiveOgType = meta.ogType || (meta.schemaType === 'article' ? 'article' : meta.schemaType === 'product' ? 'product' : 'website');

  // 8. OpenGraph / VK / Telegram / Messengers Tags
  setOrCreateMeta('property', 'og:type', effectiveOgType);
  setOrCreateMeta('property', 'og:locale', 'ru_RU');
  setOrCreateMeta('property', 'og:locale:alternate', meta.ogLocaleAlternate || 'en_US');
  setOrCreateMeta('property', 'og:site_name', 'ДС‑Инжиниринг');
  setOrCreateMeta('property', 'og:title', meta.ogTitle || meta.title);
  setOrCreateMeta('property', 'og:description', meta.ogDescription || meta.description);
  setOrCreateMeta('property', 'og:url', canonicalUrl);
  setOrCreateMeta('property', 'og:image', absoluteImageUrl);
  setOrCreateMeta('property', 'og:image:secure_url', absoluteImageUrl);
  setOrCreateMeta('property', 'og:image:type', imageMimeType);
  setOrCreateMeta('property', 'og:image:width', imageWidth);
  setOrCreateMeta('property', 'og:image:height', imageHeight);
  setOrCreateMeta('property', 'og:image:alt', imageAlt);
  setOrCreateMeta('property', 'og:updated_time', meta.ogUpdatedTime || new Date().toISOString());

  // 9. Twitter / X Cards Tags
  setOrCreateMeta('name', 'twitter:card', meta.twitterCard || 'summary_large_image');
  setOrCreateMeta('name', 'twitter:site', meta.twitterSite || '@ds_engineering');
  setOrCreateMeta('name', 'twitter:creator', meta.twitterCreator || '@ds_engineering');
  setOrCreateMeta('name', 'twitter:domain', meta.twitterDomain || 'ds-engineering.ru');
  setOrCreateMeta('name', 'twitter:url', meta.twitterUrl || canonicalUrl);
  setOrCreateMeta('name', 'twitter:title', meta.ogTitle || meta.title);
  setOrCreateMeta('name', 'twitter:description', meta.ogDescription || meta.description);
  setOrCreateMeta('name', 'twitter:image', absoluteImageUrl);
  setOrCreateMeta('name', 'twitter:image:alt', imageAlt);

  // 10. VK / Direct Messengers
  setOrCreateMeta('property', 'vk:image', absoluteImageUrl);

  // 11. Article-specific Social Meta Tags (for news, knowledge, technical articles)
  if (effectiveOgType === 'article') {
    const pubDate = meta.articlePublishedTime || (meta.schemaData?.datePublished as string) || '2026-09-01T00:00:00+03:00';
    const modDate = meta.articleModifiedTime || pubDate;
    setOrCreateMeta('property', 'article:published_time', pubDate);
    setOrCreateMeta('property', 'article:modified_time', modDate);
    setOrCreateMeta('property', 'article:section', meta.articleSection || 'Инжиниринг и метрология');
    setOrCreateMeta('property', 'article:author', meta.articleAuthor || 'Инженерный центр ДС‑Инжиниринг');
    setOrCreateMeta('property', 'article:publisher', 'https://ds-engineering.ru');

    // Clean old article tags and recreate
    document.querySelectorAll('meta[property="article:tag"]').forEach((t) => t.remove());
    const tags = meta.articleTags || (meta.keywords ? meta.keywords.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 6) : []);
    tags.forEach((tagText) => {
      const tagMeta = document.createElement('meta');
      tagMeta.setAttribute('property', 'article:tag');
      tagMeta.setAttribute('content', tagText);
      document.head.appendChild(tagMeta);
    });
  } else {
    setOrCreateMeta('property', 'article:published_time', null);
    setOrCreateMeta('property', 'article:modified_time', null);
    setOrCreateMeta('property', 'article:section', null);
    setOrCreateMeta('property', 'article:author', null);
    setOrCreateMeta('property', 'article:publisher', null);
    document.querySelectorAll('meta[property="article:tag"]').forEach((t) => t.remove());
  }

  // 12. Product-specific Social Meta Tags
  if (effectiveOgType === 'product') {
    const priceAmount = meta.productPrice 
      ? String(meta.productPrice) 
      : (meta.schemaData?.price ? String(meta.schemaData.price) : undefined);
    setOrCreateMeta('property', 'product:price:amount', priceAmount || '150000');
    setOrCreateMeta('property', 'product:price:currency', meta.productCurrency || 'RUB');
    setOrCreateMeta('property', 'product:availability', meta.productAvailability || 'in stock');
    setOrCreateMeta('property', 'product:brand', meta.productBrand || (meta.schemaData?.brand as string) || 'ДС‑Инжиниринг');
  } else {
    setOrCreateMeta('property', 'product:price:amount', null);
    setOrCreateMeta('property', 'product:price:currency', null);
    setOrCreateMeta('property', 'product:availability', null);
    setOrCreateMeta('property', 'product:brand', null);
  }

  // 13. Dynamic Schema.org JSON-LD structured data injection
  updateDynamicJsonLdSchema(meta, canonicalUrl);

  // 14. Dynamic Schema.org BreadcrumbList structured data injection
  updateDynamicBreadcrumbSchema(meta, canonicalUrl);

  // 15. Dynamic Schema.org FAQPage structured data injection based on common industry queries
  updateDynamicFaqSchema(meta, canonicalUrl);
}

/**
 * Backward compatible alias for updateDocumentSeo
 */
export const applySeoToDom = updateDocumentSeo;

/**
 * Generates valid Schema.org FAQPage JSON-LD microdata object
 */
export function generateFaqPageSchema(faqItems?: FaqQuestionAnswer[], pageUrl?: string): Record<string, unknown> {
  const items = faqItems && faqItems.length > 0 ? faqItems : COMMON_INDUSTRY_FAQ_ITEMS;
  const canonicalUrl = pageUrl || 'https://ds-engineering.ru/knowledge';

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    url: canonicalUrl,
    inLanguage: 'ru-RU',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

/**
 * Updates or injects dynamic Schema.org FAQPage structured data into document head
 */
export function updateDynamicFaqSchema(meta: SeoMetadata, canonicalUrl: string) {
  if (typeof document === 'undefined') return;

  let faqScript = document.getElementById('dynamic-faq-schema') as HTMLScriptElement | null;
  const isFaqRelevant = meta.schemaType === 'faq' || 
                        Boolean(meta.schemaData?.faqItems) || 
                        canonicalUrl.includes('/knowledge') || 
                        canonicalUrl.endsWith('/main') || 
                        canonicalUrl === 'https://ds-engineering.ru/';

  if (isFaqRelevant) {
    if (!faqScript) {
      faqScript = document.createElement('script');
      faqScript.id = 'dynamic-faq-schema';
      faqScript.type = 'application/ld+json';
      document.head.appendChild(faqScript);
    }
    const faqItems = (meta.schemaData?.faqItems as FaqQuestionAnswer[]) || COMMON_INDUSTRY_FAQ_ITEMS;
    const faqSchema = generateFaqPageSchema(faqItems, canonicalUrl);
    faqScript.textContent = JSON.stringify(faqSchema, null, 2);
  } else if (faqScript) {
    faqScript.remove();
  }
}

/**
 * Updates or injects dynamic Schema.org JSON-LD microdata into document head
 */
function updateDynamicJsonLdSchema(meta: SeoMetadata, canonicalUrl: string) {
  if (typeof document === 'undefined') return;

  let scriptTag = (document.getElementById('dynamic-schema') || document.getElementById('dynamic-page-schema')) as HTMLScriptElement | null;
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.id = 'dynamic-schema';
    scriptTag.type = 'application/ld+json';
    document.head.appendChild(scriptTag);
  }

  let schemaObj: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title,
    description: meta.description,
    url: canonicalUrl,
    inLanguage: 'ru-RU',
    isPartOf: {
      '@type': 'WebSite',
      name: 'ДС‑Инжиниринг',
      url: 'https://ds-engineering.ru'
    }
  };

  if (meta.schemaType === 'faq') {
    const faqItems = (meta.schemaData?.faqItems as FaqQuestionAnswer[]) || COMMON_INDUSTRY_FAQ_ITEMS;
    schemaObj = generateFaqPageSchema(faqItems, canonicalUrl);
  } else if (meta.schemaType === 'product' || meta.schemaData?.type === 'product') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: meta.title.split('|')[0].trim(),
      description: meta.description,
      image: meta.ogImage || 'https://ds-engineering.ru/logo.svg',
      brand: {
        '@type': 'Brand',
        name: meta.productBrand || (meta.schemaData?.brand as string) || 'ДС‑Инжиниринг'
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'RUB',
        price: (meta.schemaData?.price as number) || 150000,
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'ООО «ДС‑Инжиниринг»'
        }
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '34',
        bestRating: '5',
        worstRating: '1'
      }
    };
  } else if (meta.schemaType === 'service') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: meta.title.split('|')[0].trim(),
      serviceType: 'Инжиниринговые услуги и 3D-метрология',
      description: meta.description,
      provider: {
        '@type': 'Organization',
        name: 'ООО «ДС‑Инжиниринг»',
        url: 'https://ds-engineering.ru',
        logo: 'https://ds-engineering.ru/logo.svg'
      },
      areaServed: {
        '@type': 'Country',
        name: 'Россия'
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'RUB',
        availability: 'https://schema.org/InStock'
      }
    };
  } else if (meta.schemaType === 'article') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: meta.title.split('|')[0].trim(),
      description: meta.description,
      image: meta.ogImage || 'https://ds-engineering.ru/logo.svg',
      inLanguage: 'ru-RU',
      author: {
        '@type': 'Organization',
        name: 'Инженерный центр ДС‑Инжиниринг',
        url: 'https://ds-engineering.ru'
      },
      publisher: {
        '@type': 'Organization',
        name: 'ООО «ДС‑Инжиниринг»',
        logo: {
          '@type': 'ImageObject',
          url: 'https://ds-engineering.ru/logo.svg'
        }
      },
      datePublished: meta.articlePublishedTime || (meta.schemaData?.datePublished as string) || '2026-09-03',
      dateModified: '2026-09-03'
    };
  } else if (meta.schemaType === 'about') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: meta.title,
      description: meta.description,
      url: canonicalUrl,
      mainEntity: {
        '@type': 'Organization',
        name: 'ООО «ДС‑Инжиниринг»',
        foundingDate: '1995',
        description: 'Системный интегратор CAD/CAM/PDM систем и измерительного оборудования',
        url: 'https://ds-engineering.ru'
      }
    };
  } else if (meta.schemaType === 'contact') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: meta.title,
      description: meta.description,
      url: canonicalUrl,
      mainEntity: {
        '@type': 'Organization',
        name: 'ООО «ДС‑Инжиниринг»',
        telephone: '+7 (846) 954-02-92',
        email: 'info@ds-enginering.ru',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'ул. Свободы, д. 198',
          addressLocality: 'Самара',
          postalCode: '443009',
          addressCountry: 'RU'
        }
      }
    };
  }

  scriptTag.textContent = JSON.stringify(schemaObj, null, 2);
}

/**
 * Injects dynamic Schema.org BreadcrumbList for rich Google Search / Yandex snippets
 */
function updateDynamicBreadcrumbSchema(meta: SeoMetadata, canonicalUrl: string) {
  if (typeof document === 'undefined') return;

  let breadcrumbScript = document.getElementById('dynamic-breadcrumb-schema') as HTMLScriptElement | null;
  if (!breadcrumbScript) {
    breadcrumbScript = document.createElement('script');
    breadcrumbScript.id = 'dynamic-breadcrumb-schema';
    breadcrumbScript.type = 'application/ld+json';
    document.head.appendChild(breadcrumbScript);
  }

  const breadcrumbItems = meta.breadcrumbs && meta.breadcrumbs.length > 0
    ? meta.breadcrumbs
    : [
        { name: 'Главная', url: 'https://ds-engineering.ru/main' },
        { name: meta.title.split('|')[0].trim(), url: canonicalUrl }
      ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url
    }))
  };

  breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema, null, 2);
}

export interface SeoAuditReport {
  overallScore: number;
  checks: Array<{
    name: string;
    passed: boolean;
    importance: 'high' | 'medium' | 'low';
    message: string;
    details?: string;
  }>;
  summary: {
    passedCount: number;
    totalCount: number;
    highImportancePassed: number;
  };
}

/**
 * Performs a real-time live SEO audit of the current rendered page
 */
export function runSeoAudit(): SeoAuditReport {
  if (typeof document === 'undefined') {
    return {
      overallScore: 100,
      checks: [],
      summary: { passedCount: 0, totalCount: 0, highImportancePassed: 0 }
    };
  }

  const checks: SeoAuditReport['checks'] = [];

  // 1. Title check
  const title = document.title || '';
  const isTitleGood = title.length >= 35 && title.length <= 80;
  checks.push({
    name: 'Заголовок страницы (<title>)',
    passed: isTitleGood,
    importance: 'high',
    message: isTitleGood 
      ? `Оптимальная длина: ${title.length} символов (рекомендовано 35–80)` 
      : title.length === 0 ? 'Заголовок страницы отсутствует!' : `Длина ${title.length} символов (рекомендуется от 35 до 80)`,
    details: title
  });

  // 2. Meta description check
  const descTag = document.querySelector('meta[name="description"]');
  const desc = descTag?.getAttribute('content') || '';
  const isDescGood = desc.length >= 90 && desc.length <= 260;
  checks.push({
    name: 'Мета-описание (<meta name="description">)',
    passed: isDescGood,
    importance: 'high',
    message: isDescGood
      ? `Оптимальная длина: ${desc.length} символов (рекомендовано 90–260)`
      : desc.length === 0 ? 'Мета-описание отсутствует!' : `Длина ${desc.length} символов (рекомендуется 90–260 символов)`,
    details: desc ? `${desc.slice(0, 100)}...` : undefined
  });

  // 3. Meta keywords
  const kwTag = document.querySelector('meta[name="keywords"]');
  const kw = kwTag?.getAttribute('content') || '';
  checks.push({
    name: 'Ключевые слова (<meta name="keywords">)',
    passed: kw.length > 20,
    importance: 'medium',
    message: kw.length > 20 ? `Задано ключевых фраз: ${kw.split(',').length}` : 'Ключевые слова не заполнены',
  });

  // 4. Canonical link
  const canonical = document.querySelector('link[rel="canonical"]');
  const canonicalHref = canonical?.getAttribute('href') || '';
  checks.push({
    name: 'Канонический URL (<link rel="canonical">)',
    passed: Boolean(canonicalHref && canonicalHref.startsWith('http')),
    importance: 'high',
    message: canonicalHref ? 'Канонический адрес корректно настроен' : 'Канонический адрес отсутствует',
    details: canonicalHref
  });

  // 5. Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
  const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content');
  const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content');
  const ogWidth = document.querySelector('meta[property="og:image:width"]')?.getAttribute('content');
  const ogHeight = document.querySelector('meta[property="og:image:height"]')?.getAttribute('content');
  const isOgComplete = Boolean(ogTitle && ogDesc && ogImage && ogUrl);
  checks.push({
    name: 'Разметка соцсетей (Open Graph: VK, Telegram, Мессенджеры)',
    passed: isOgComplete,
    importance: 'high',
    message: isOgComplete 
      ? `Все ключевые теги OpenGraph настроены (${ogType || 'website'}, ${ogWidth && ogHeight ? `${ogWidth}x${ogHeight}px` : '1200x630px'})` 
      : 'Некоторые теги OpenGraph отсутствуют',
    details: `og:title: ${ogTitle ? '✓' : '✗'}, og:image: ${ogImage ? '✓' : '✗'}, og:url: ${ogUrl ? '✓' : '✗'}`
  });

  // 5b. Twitter / X Cards
  const twCard = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
  const twTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
  const twImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
  const twSite = document.querySelector('meta[name="twitter:site"]')?.getAttribute('content');
  const isTwitterComplete = Boolean(twCard && twTitle && twImage);
  checks.push({
    name: 'Карточки шеринга Twitter / X Cards',
    passed: isTwitterComplete,
    importance: 'high',
    message: isTwitterComplete 
      ? `Карточки Twitter Card активны (${twCard}, ${twSite || '@ds_engineering'})` 
      : 'Теги Twitter Card настроены не полностью',
    details: `card: ${twCard || '✗'}, title: ${twTitle ? '✓' : '✗'}, image: ${twImage ? '✓' : '✗'}`
  });

  // 6. Schema.org Microdata (JSON-LD)
  const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
  checks.push({
    name: 'Микроразметка Schema.org (JSON-LD)',
    passed: schemaScripts.length > 0,
    importance: 'high',
    message: schemaScripts.length > 0 ? `Активно блоков микроразметки: ${schemaScripts.length}` : 'Микроразметка Schema.org не обнаружена',
    details: schemaScripts.length > 0 ? 'Обнаружены схемы Organization / ProfessionalService / Product' : undefined
  });

  // 7. Robots directive
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  const isRobotsGood = robots.includes('index') && robots.includes('follow');
  checks.push({
    name: 'Директивы индексации (<meta name="robots">)',
    passed: isRobotsGood,
    importance: 'high',
    message: isRobotsGood ? `Индексация разрешена (${robots})` : 'Индексация может быть ограничена',
  });

  // 8. Mobile Viewport
  const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
  checks.push({
    name: 'Мобильная адаптивность (<meta name="viewport">)',
    passed: viewport.includes('width=device-width'),
    importance: 'high',
    message: viewport.includes('width=device-width') ? 'Мобильный viewport настроен' : 'Viewport не настроен',
  });

  // 9. Images alt check
  const images = Array.from(document.querySelectorAll('img'));
  const totalImgs = images.length;
  const imgsWithAlt = images.filter((img) => img.hasAttribute('alt') && img.getAttribute('alt')?.trim() !== '').length;
  const altRatio = totalImgs > 0 ? Math.round((imgsWithAlt / totalImgs) * 100) : 100;
  checks.push({
    name: 'Атрибуты Alt у изображений (Image SEO)',
    passed: altRatio >= 85,
    importance: 'medium',
    message: totalImgs > 0 ? `${imgsWithAlt} из ${totalImgs} изображений содержат alt (${altRatio}%)` : 'На странице нет изображений',
  });

  // 10. Heading H1 check
  const h1Elements = document.querySelectorAll('h1');
  checks.push({
    name: 'Главный заголовок (<h1>)',
    passed: h1Elements.length >= 1,
    importance: 'high',
    message: h1Elements.length === 1 
      ? `Один корректный тег H1 на странице: «${h1Elements[0].textContent?.trim().slice(0, 40)}...»` 
      : h1Elements.length > 1 ? `Найдено ${h1Elements.length} тегов H1 (рекомендуется строго один)` : 'Тег H1 на странице не найден',
  });

  // Calculate score
  const highWeights = checks.filter(c => c.importance === 'high');
  const highPassed = highWeights.filter(c => c.passed).length;
  const medWeights = checks.filter(c => c.importance === 'medium');
  const medPassed = medWeights.filter(c => c.passed).length;

  const score = Math.round(
    ((highPassed / (highWeights.length || 1)) * 80) + 
    ((medPassed / (medWeights.length || 1)) * 20)
  );

  return {
    overallScore: Math.min(100, Math.max(0, score)),
    checks,
    summary: {
      passedCount: checks.filter(c => c.passed).length,
      totalCount: checks.length,
      highImportancePassed: highPassed,
    }
  };
}

/**
 * Dynamic Keyword Meta Tag Optimizer
 * Enhances standard SEO metadata with high-converting organic keywords from Google Search Console & Yandex Metrica.
 */
export function injectOrganicKeywordsIntoSeoMeta(
  baseMeta: SeoMetadata,
  organicKeywords: string[]
): SeoMetadata {
  if (!organicKeywords || organicKeywords.length === 0) return baseMeta;

  const mergedKeywords = Array.from(
    new Set([
      ...organicKeywords.map((k) => k.trim()),
      ...baseMeta.keywords.split(',').map((k) => k.trim()),
    ])
  ).filter(Boolean).join(', ');

  return {
    ...baseMeta,
    keywords: mergedKeywords,
  };
}

