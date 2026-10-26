import { describe, it, expect, beforeEach } from 'vitest';
import {
  GLOBAL_DEFAULT_KEYWORDS,
  PAGE_SEO_DATA,
  PRODUCT_SEO_DATA,
  SERVICE_SEO_DATA,
  SOFTWARE_CATEGORY_SEO_DATA,
  HARDWARE_CATEGORY_SEO_DATA,
  KNOWLEDGE_CATEGORY_SEO_DATA,
  COMMON_INDUSTRY_FAQ_ITEMS,
  generateFaqPageSchema,
  updateDynamicFaqSchema,
  resolveDynamicSeo,
  applySeoToDom,
  runSeoAudit,
  injectOrganicKeywordsIntoSeoMeta,
  SeoMetadata
} from '../seo';
import { Product, Article, KnowledgeItem, ServiceItem, CustomPage } from '../../types';

describe('SEO Utilities Tests (src/utils/seo.ts)', () => {
  describe('Global Constants and Dictionaries', () => {
    it('defines rich industrial CAD/CAM & Metrology default keywords', () => {
      expect(GLOBAL_DEFAULT_KEYWORDS).toContain('TopSolid 7');
      expect(GLOBAL_DEFAULT_KEYWORDS).toContain('PolyWorks Inspector');
      expect(GLOBAL_DEFAULT_KEYWORDS).toContain('Shining 3D');
      expect(GLOBAL_DEFAULT_KEYWORDS).toContain('Geomagic Design X');
      expect(GLOBAL_DEFAULT_KEYWORDS).toContain('координатно-измерительные машины');
      expect(GLOBAL_DEFAULT_KEYWORDS).toContain('ДС‑Инжиниринг');
    });

    it('contains valid SEO records for all primary system pages', () => {
      const requiredPages = ['home', 'main', 'software', 'hardware', 'services', 'calculator', 'about', 'knowledge', 'news', 'contacts', 'account', 'crm', 'cms', 'sitemap', 'notfound'];
      
      requiredPages.forEach(page => {
        const data = PAGE_SEO_DATA[page];
        expect(data, `PAGE_SEO_DATA should define config for ${page}`).toBeDefined();
        expect(data.title.length).toBeGreaterThanOrEqual(15);
        expect(data.description.length).toBeGreaterThanOrEqual(30);
        expect(data.canonicalUrl).toMatch(/^https:\/\/ds-engineering\.ru\//);
      });
    });

    it('enforces robots noindex for internal management systems (CRM, CMS, Account)', () => {
      expect(PAGE_SEO_DATA.crm.robots).toBe('noindex, nofollow');
      expect(PAGE_SEO_DATA.cms.robots).toBe('noindex, nofollow');
      expect(PAGE_SEO_DATA.account.robots).toBe('noindex, nofollow');
      expect(PAGE_SEO_DATA.notfound.robots).toBe('noindex, nofollow');
    });

    it('ensures category dictionaries have structured title and description', () => {
      expect(Object.keys(SOFTWARE_CATEGORY_SEO_DATA).length).toBeGreaterThan(0);
      expect(Object.keys(HARDWARE_CATEGORY_SEO_DATA).length).toBeGreaterThan(0);
      expect(Object.keys(KNOWLEDGE_CATEGORY_SEO_DATA).length).toBeGreaterThan(0);

      const topsolidCat = SOFTWARE_CATEGORY_SEO_DATA['topsolid'];
      if (topsolidCat) {
        expect(topsolidCat.title).toContain('TopSolid');
        expect(topsolidCat.description.length).toBeGreaterThan(20);
      }
    });
  });

  describe('resolveDynamicSeo', () => {
    it('generates homepage SEO when page is home or main', () => {
      const seo = resolveDynamicSeo({
        page: 'home',
        products: [],
        services: [],
        news: [],
        knowledge: [],
        customPages: []
      });

      expect(seo.title).toContain('ДС‑Инжиниринг');
      expect(seo.canonicalUrl).toBe('https://ds-engineering.ru/main');
      expect(seo.schemaType).toBe('website');
      expect(seo.breadcrumbs).toBeDefined();
      expect(seo.breadcrumbs?.[0].name).toBe('Главная');
    });

    it('generates rich metadata for a detailed product item', () => {
      const mockProduct: Product = {
        id: 'topsolid-7',
        name: 'TopSolid 7 CAD/CAM',
        brand: 'TopSolid SAS',
        type: 'software',
        category: 'cad-cam',
        categoryLabel: 'CAD/CAM системы',
        shortDescription: 'Интегрированная CAD/CAM/PDM система',
        fullDescription: 'Сквозное проектирование и разработка УП для станков с ЧПУ',
        shortDesc: 'Интегрированная CAD/CAM/PDM система',
        fullDesc: 'Сквозное проектирование и разработка УП для станков с ЧПУ',
        image: 'https://ds-engineering.ru/images/topsolid.png',
        features: ['5-осевая обработка', 'Симуляция УП'],
        specs: { 'ОС': 'Windows 11' },
        price: 'По запросу'
      };

      const seo = resolveDynamicSeo({
        page: 'software',
        selectedProduct: mockProduct,
        products: [mockProduct],
        services: [],
        news: [],
        knowledge: [],
        customPages: []
      });

      expect(seo.ogType).toBe('product');
      expect(seo.schemaType).toBe('product');
      expect(seo.canonicalUrl).toBe('https://ds-engineering.ru/software/topsolid-7');
      expect(seo.productBrand).toBe('TopSolid SAS');
      expect(seo.productPrice).toBe('По запросу');
      expect(seo.breadcrumbs?.length).toBe(3);
      expect(seo.breadcrumbs?.[1].name).toBe('Программное обеспечение');
      expect(seo.breadcrumbs?.[2].name).toBe('TopSolid 7 CAD/CAM');
    });

    it('generates rich metadata for a detailed engineering service', () => {
      const mockService: ServiceItem = {
        id: '3d-scanning',
        title: 'Выездное прецизионное 3D-сканирование деталей',
        shortDesc: 'Оптическое и лазерное сканирование с выездом по РФ',
        fullDesc: 'Контроль геометрии и получение высокоточных полигональных сеток',
        iconName: 'Wrench',
        image: 'https://ds-engineering.ru/images/scan.png',
        features: ['Точность до 0.02 мм', 'Выезд по РФ'],
        advantages: ['Срочные заказы'],
        deliverables: ['Сетка STL/OBJ', 'Протокол измерений'],
        equipmentUsed: ['Лазерный сканер Shining 3D FreeScan'],
        calculatorType: 'scanning',
        basePriceText: 'от 15 000 руб',
        steps: [{ stepNumber: 1, title: 'Сканирование', desc: 'Выезд и сканирование' }],
        leadTime: 'от 1 дня',
        priceFrom: 'от 15 000 руб'
      };

      const seo = resolveDynamicSeo({
        page: 'services',
        selectedServiceId: '3d-scanning',
        products: [],
        services: [mockService],
        news: [],
        knowledge: [],
        customPages: []
      });

      expect(seo.schemaType).toBe('service');
      expect(seo.canonicalUrl).toBe('https://ds-engineering.ru/services/3d-scanning');
      expect(seo.title).toMatch(/3D-сканирован/);
      expect(seo.breadcrumbs?.length).toBe(3);
      expect(seo.breadcrumbs?.[1].name).toBe('Услуги');
      expect(seo.breadcrumbs?.[2].name).toContain('3D-сканирование');
    });

    it('generates article metadata for a detailed news article', () => {
      const mockArticle: Article = {
        id: 'news-2026-release',
        title: 'Обновление линейки 3D-сканеров Shining 3D FreeScan',
        category: 'Пресс-релиз',
        date: '2026-10-01',
        preview: 'Представляем новые лазерные метрологические комплексы',
        content: ['Полное описание нового оборудования и демонстрация точности.'],
        image: 'https://ds-engineering.ru/images/freescan.png',
        tags: ['Shining 3D', 'FreeScan', 'Метрология']
      };

      const seo = resolveDynamicSeo({
        page: 'news',
        selectedArticle: mockArticle,
        products: [],
        services: [],
        news: [mockArticle],
        knowledge: [],
        customPages: []
      });

      expect(seo.ogType).toBe('article');
      expect(seo.schemaType).toBe('article');
      expect(seo.canonicalUrl).toBe('https://ds-engineering.ru/news/news-2026-release');
      expect(seo.articlePublishedTime).toBe('2026-10-01');
      expect(seo.articleSection).toBe('Пресс-релиз');
      expect(seo.articleTags).toEqual(['Shining 3D', 'FreeScan', 'Метрология']);
      expect(seo.breadcrumbs?.length).toBe(3);
      expect(seo.breadcrumbs?.[1].name).toBe('Новости');
    });

    it('generates article metadata for a detailed knowledge item', () => {
      const mockKnowledge: KnowledgeItem = {
        id: 'gost-iso-1101',
        title: 'Методика контроля геометрических допусков GD&T по ISO 1101',
        category: 'Метрология и стандарты',
        summary: 'Практическое руководство по оценке допусков расположения в PolyWorks',
        content: 'Полный текст руководства и примеры построения баз.',
        tags: ['Метрология', 'ГОСТ', 'PolyWorks'],
        dateAdded: '2026-09-15',
        views: 120
      };

      const seo = resolveDynamicSeo({
        page: 'knowledge',
        selectedKnowledgeItem: mockKnowledge,
        products: [],
        services: [],
        news: [],
        knowledge: [mockKnowledge],
        customPages: []
      });

      expect(seo.ogType).toBe('article');
      expect(seo.schemaType).toBe('article');
      expect(seo.canonicalUrl).toBe('https://ds-engineering.ru/knowledge/gost-iso-1101');
      expect(seo.articleSection).toBe('Метрология и стандарты');
      expect(seo.breadcrumbs?.length).toBe(3);
      expect(seo.breadcrumbs?.[1].name).toBe('База знаний');
    });

    it('generates metadata for filtered software/hardware/knowledge categories', () => {
      const softwareCatKey = Object.keys(SOFTWARE_CATEGORY_SEO_DATA)[0];
      if (softwareCatKey) {
        const seoSoft = resolveDynamicSeo({
          page: 'software',
          activeCategory: softwareCatKey,
          products: [],
          services: [],
          news: [],
          knowledge: [],
          customPages: []
        });

        expect(seoSoft.title).toContain(SOFTWARE_CATEGORY_SEO_DATA[softwareCatKey].title);
        expect(seoSoft.canonicalUrl).toBe('https://ds-engineering.ru/software');
      }

      const hardwareCatKey = Object.keys(HARDWARE_CATEGORY_SEO_DATA)[0];
      if (hardwareCatKey) {
        const seoHard = resolveDynamicSeo({
          page: 'hardware',
          activeCategory: hardwareCatKey,
          products: [],
          services: [],
          news: [],
          knowledge: [],
          customPages: []
        });

        expect(seoHard.title).toContain(HARDWARE_CATEGORY_SEO_DATA[hardwareCatKey].title);
        expect(seoHard.canonicalUrl).toBe('https://ds-engineering.ru/hardware');
      }
    });

    it('generates metadata for custom CMS pages', () => {
      const mockCustomPage: CustomPage = {
        id: 'custom-privacy-policy',
        slug: 'privacy-policy',
        title: 'Политика обработки персональных данных',
        menuTitle: 'Политика конфиденциальности',
        description: 'Официальная политика конфиденциальности ООО «ДС‑Инжиниринг» в соответствии с 152-ФЗ',
        content: '<p>Текст политики конфиденциальности</p>',
        showInHeader: false,
        showInFooter: true,
        blocks: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-10-01',
        isPublished: true
      };

      const seo = resolveDynamicSeo({
        page: 'custom-privacy-policy',
        products: [],
        services: [],
        news: [],
        knowledge: [],
        customPages: [mockCustomPage]
      });

      expect(seo.title).toContain('Политика обработки персональных данных');
      expect(seo.canonicalUrl).toBe('https://ds-engineering.ru/page/privacy-policy');
      expect(seo.breadcrumbs?.length).toBe(2);
      expect(seo.breadcrumbs?.[1].name).toBe('Политика обработки персональных данных');
    });

    it('falls back to default page seo for other system pages', () => {
      const aboutSeo = resolveDynamicSeo({
        page: 'about',
        products: [],
        services: [],
        news: [],
        knowledge: [],
        customPages: []
      });

      expect(aboutSeo.canonicalUrl).toBe('https://ds-engineering.ru/about');
      expect(aboutSeo.schemaType).toBe('about');
      expect(aboutSeo.breadcrumbs?.[1].name).toBe('О компании');
    });
  });

  describe('applySeoToDom', () => {
    beforeEach(() => {
      document.head.innerHTML = `
        <title>Old Title</title>
        <meta name="description" content="Old desc" />
        <meta name="keywords" content="old, keywords" />
        <link rel="canonical" href="https://ds-engineering.ru/old" />
      `;
    });

    it('updates title, meta tags, and canonical in the document DOM', () => {
      const mockMeta: SeoMetadata = {
        title: 'Новый заголовок | ДС‑Инжиниринг',
        description: 'Новое информативное описание для поисковых сниппетов Яндекс и Google.',
        keywords: 'метрология, CAD CAM, TopSolid 7',
        canonicalUrl: 'https://ds-engineering.ru/software/topsolid-7',
        ogTitle: 'TopSolid 7 CAD/CAM',
        ogDescription: 'Новое описание OpenGraph',
        ogImage: 'https://ds-engineering.ru/images/topsolid.png',
        ogImageAlt: 'TopSolid 7 логотип',
        ogType: 'product',
        twitterCard: 'summary_large_image',
        schemaType: 'product',
        productPrice: 'По запросу',
        productBrand: 'TopSolid SAS',
        breadcrumbs: [
          { name: 'Главная', url: 'https://ds-engineering.ru/main' },
          { name: 'ПО', url: 'https://ds-engineering.ru/software' }
        ]
      };

      applySeoToDom(mockMeta);

      // Verify DOM updates
      expect(document.title).toBe('Новый заголовок | ДС‑Инжиниринг');

      const desc = document.querySelector('meta[name="description"]')?.getAttribute('content');
      expect(desc).toBe('Новое информативное описание для поисковых сниппетов Яндекс и Google.');

      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
      expect(canonical).toBe('https://ds-engineering.ru/software/topsolid-7');

      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
      expect(ogTitle).toBe('TopSolid 7 CAD/CAM');

      const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content');
      expect(ogType).toBe('product');

      const twitterCard = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
      expect(twitterCard).toBe('summary_large_image');

      // Verify injected schema scripts
      const schemaScript = document.getElementById('dynamic-schema');
      expect(schemaScript).toBeDefined();
      expect(schemaScript?.textContent).toContain('Product');
      expect(schemaScript?.textContent).toContain('TopSolid SAS');

      const breadcrumbScript = document.getElementById('dynamic-breadcrumb-schema');
      expect(breadcrumbScript).toBeDefined();
      expect(breadcrumbScript?.textContent).toContain('BreadcrumbList');
    });

    it('injects Service Schema.org JSON-LD when schemaType is service', () => {
      const mockMeta: SeoMetadata = {
        title: 'Услуги 3D-сканирования | ДС‑Инжиниринг',
        description: 'Прецизионное сканирование деталей на КИМ.',
        keywords: 'сканирование, КИМ',
        canonicalUrl: 'https://ds-engineering.ru/services/3d-scan',
        schemaType: 'service'
      };

      applySeoToDom(mockMeta);

      const schemaScript = document.getElementById('dynamic-schema');
      expect(schemaScript?.textContent).toContain('"@type": "Service"');
      expect(schemaScript?.textContent).toContain('ООО «ДС‑Инжиниринг»');
    });

    it('injects Article Schema.org JSON-LD when schemaType is article', () => {
      const mockMeta: SeoMetadata = {
        title: 'Обзор новинок CAD/CAM | ДС‑Инжиниринг',
        description: 'Статья об инновациях в машиностроении.',
        keywords: 'статья, ЧПУ',
        canonicalUrl: 'https://ds-engineering.ru/news/article-1',
        schemaType: 'article',
        schemaData: {
          datePublished: '2026-10-02'
        }
      };

      applySeoToDom(mockMeta);

      const schemaScript = document.getElementById('dynamic-schema');
      expect(schemaScript?.textContent).toContain('"@type": "TechArticle"');
      expect(schemaScript?.textContent).toContain('2026-10-02');
    });

    it('generates and injects FAQPage Schema.org JSON-LD for knowledge base queries', () => {
      const mockMeta: SeoMetadata = {
        title: 'База знаний: ГОСТы и руководства | ДС‑Инжиниринг',
        description: 'Ответы на часто задаваемые вопросы по 3D-метрологии и CAD/CAM.',
        keywords: 'FAQ, база знаний, CAD/CAM, КИМ',
        canonicalUrl: 'https://ds-engineering.ru/knowledge',
        schemaType: 'faq'
      };

      applySeoToDom(mockMeta);

      const dynamicSchema = document.getElementById('dynamic-schema');
      expect(dynamicSchema?.textContent).toContain('"@type": "FAQPage"');
      expect(dynamicSchema?.textContent).toContain('TopSolid 7');
      expect(dynamicSchema?.textContent).toContain('PolyWorks|Inspector™');

      const faqScript = document.getElementById('dynamic-faq-schema');
      expect(faqScript).toBeDefined();

      // Проверяем, что внедрённый JSON-LD — валидный и структурно полный FAQPage,
      // а не совпадение по конкретной маркетинговой фразе (такие проверки устаревают
      // при каждой правке текстов и не ловят реальных ошибок генерации).
      const faqSchema = JSON.parse(faqScript!.textContent || '{}');
      expect(faqSchema['@context']).toBe('https://schema.org');
      expect(faqSchema['@type']).toBe('FAQPage');
      expect(faqSchema.inLanguage).toBe('ru-RU');
      expect(Array.isArray(faqSchema.mainEntity)).toBe(true);
      expect(faqSchema.mainEntity.length).toBeGreaterThanOrEqual(5);
      for (const entry of faqSchema.mainEntity) {
        expect(entry['@type']).toBe('Question');
        expect(typeof entry.name).toBe('string');
        expect(entry.name.trim().length).toBeGreaterThan(0);
        expect(entry.acceptedAnswer?.['@type']).toBe('Answer');
        expect(entry.acceptedAnswer?.text?.trim().length).toBeGreaterThan(0);
      }
    });

    it('generates valid FAQPage schema object with generateFaqPageSchema', () => {
      const schema = generateFaqPageSchema(COMMON_INDUSTRY_FAQ_ITEMS, 'https://ds-engineering.ru/knowledge');
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema['@id']).toBe('https://ds-engineering.ru/knowledge#faq');
      expect(Array.isArray(schema.mainEntity)).toBe(true);
      expect((schema.mainEntity as any[]).length).toBeGreaterThanOrEqual(5);
      expect((schema.mainEntity as any[])[0]['@type']).toBe('Question');
      expect((schema.mainEntity as any[])[0].acceptedAnswer['@type']).toBe('Answer');
    });
  });

  describe('runSeoAudit', () => {
    beforeEach(() => {
      document.head.innerHTML = `
        <title>ДС‑Инжиниринг — Поставка CAD/CAM систем и 3D-метрологии</title>
        <meta name="description" content="Инжиниринговые решения с 1995 года: официальные поставки TopSolid 7, PolyWorks, КИМ PMT и 3D-сканеров Shining 3D." />
        <meta name="keywords" content="CAD, CAM, КИМ, 3D сканеры, метрология, TopSolid" />
        <link rel="canonical" href="https://ds-engineering.ru/main" />
        <meta property="og:title" content="ДС‑Инжиниринг — CAD/CAM и 3D-метрология" />
        <meta property="og:description" content="Инжиниринговые решения с 1995 года." />
        <meta property="og:image" content="https://ds-engineering.ru/logo.svg" />
        <meta property="og:url" content="https://ds-engineering.ru/main" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ДС‑Инжиниринг" />
        <meta name="twitter:image" content="https://ds-engineering.ru/logo.svg" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization"}</script>
      `;
      document.body.innerHTML = `
        <h1>ДС‑Инжиниринг — Промышленный софт и метрология</h1>
        <img src="/logo.svg" alt="Логотип ДС-Инжиниринг" />
      `;
    });

    it('performs comprehensive live SEO audit on rendered DOM', () => {
      const report = runSeoAudit();

      expect(report.overallScore).toBeGreaterThanOrEqual(90);
      expect(report.summary.totalCount).toBeGreaterThanOrEqual(10);
      expect(report.summary.passedCount).toBeGreaterThanOrEqual(9);

      const titleCheck = report.checks.find(c => c.name.includes('<title>'));
      expect(titleCheck?.passed).toBe(true);

      const canonicalCheck = report.checks.find(c => c.name.includes('canonical'));
      expect(canonicalCheck?.passed).toBe(true);

      const ogCheck = report.checks.find(c => c.name.includes('Open Graph'));
      expect(ogCheck?.passed).toBe(true);

      const h1Check = report.checks.find(c => c.name.includes('<h1>'));
      expect(h1Check?.passed).toBe(true);
    });
  });

  describe('injectOrganicKeywordsIntoSeoMeta', () => {
    const baseMeta: SeoMetadata = {
      title: 'САПР ПО TopSolid 7',
      description: 'Купить TopSolid 7',
      keywords: 'TopSolid 7, CAD CAM'
    };

    it('merges new organic keywords without duplicates', () => {
      const enriched = injectOrganicKeywordsIntoSeoMeta(baseMeta, [
        'TopSolid Cam цена',
        'TopSolid 7',
        'постпроцессоры ЧПУ'
      ]);

      expect(enriched.keywords).toContain('TopSolid Cam цена');
      expect(enriched.keywords).toContain('постпроцессоры ЧПУ');
      expect(enriched.keywords).toContain('CAD CAM');
      
      // Ensure no duplicate 'TopSolid 7'
      const occurrences = enriched.keywords.split(',').filter(k => k.trim() === 'TopSolid 7').length;
      expect(occurrences).toBe(1);
    });

    it('returns original metadata if organicKeywords is empty or null', () => {
      const unchanged = injectOrganicKeywordsIntoSeoMeta(baseMeta, []);
      expect(unchanged.keywords).toBe(baseMeta.keywords);
    });
  });
});
