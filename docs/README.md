# 📚 РЕЕСТР ДОКУМЕНТАЦИИ И ИНЖЕНЕРНЫХ МАТЕРИАЛОВ «ДС-ИНЖИНИРИНГ»

В данном разделе собрана вся проектная, техническая, пользовательская и эксплуатационная документация корпоративного портала, B2B CRM и инженерной платформы **ООО «ДС-Инжиниринг»**.

---

## 🏛 1. Обязательные базовые документы (Корень `/docs/`)

| Файл | Описание документа | Предназначение |
| :--- | :--- | :--- |
| **[`SITE_PASSPORT.md`](./SITE_PASSPORT.md)** | **Технический паспорт системы** | Полный паспорт: версия системы (v2.9.289-PROD), дата, архитектура, технологический стек, структура модулей, реквизиты. |
| **[`CUSTOMER_JOURNEY_MAP.md`](./CUSTOMER_JOURNEY_MAP.md)** | **Карта пути пользователя (CJM)** | Комплексная матрица 7 этапов пути 5 целевых B2B-персон: точки контакта, боли, эмоции, действия, конверсионные воронки и KPI. |
| **[`USER_MANUAL.md`](./USER_MANUAL.md)** | **Инструкция по эксплуатации** | Руководство пользователя и администратора: управление CMS, редактирование товаров и услуг, работа с калькуляторами и CRM. |
| **[`CHANGELOG.md`](./CHANGELOG.md)** | **Журнал изменений** | Подробный хронологический лог всех обновлений, оптимизаций, исправлений и внедренных функций сайта. |
| **[`DATABASE_DEPLOYMENT.md`](./DATABASE_DEPLOYMENT.md)** | **Развертывание БД** | Руководство DevOps и сисадмина: запуск PostgreSQL 17, миграции Drizzle ORM, резервное копирование и Drizzle Studio. |
| **[`AGENTS.md`](../AGENTS.md)** | **Регламент разработки** | Системный регламент для ИИ-ассистентов и разработчиков: правила чистоты корня и обязательного ведения 6 документов. |

---

## 📁 2. Тематические разделы документации

```
docs/
├── architecture/                  # Архитектура, бизнес-логика, аудит и аналитика
├── deployment/                    # Развертывание PostgreSQL 17, Docker, ASUSTOR NAS и VPS
├── migration/                     # Системные промпты, AI-гайды и презентации
└── testing/                       # Стратегия QA, сьют из 84 автотестов, тест-планы и отчеты
```

### 🏛 Раздел 2.1. Архитектура и бизнес-аналитика ([`/docs/architecture/`](./architecture/README.md))
- **[`architecture/BUSINESS_LOGIC.md`](./architecture/BUSINESS_LOGIC.md)** — Полное описание бизнес-логики 5 производственных направлений, алгоритмов калькуляторов, воронки CRM, ТКП/АКП, RBAC и 3D WebGL.
- **[`architecture/BUSINESS_ANALYTICS.md`](./architecture/BUSINESS_ANALYTICS.md)** — Стратегические цели, целевая аудитория (ЛПР), конверсионные пути (Customer Journey), аналитика и KPI проекта.
- **[`architecture/THREE_AMIGOS_ANALYSIS.md`](./architecture/THREE_AMIGOS_ANALYSIS.md)** — Комплексный аудит по методологии «3 Амиго» (Бизнес + Разработка + QA): ценность, архитектура и BDD-спецификации.
- **[`architecture/AUDIT_REPORT.md`](./architecture/AUDIT_REPORT.md)** — Сводный инженерно-технический и графический/UI аудит платформы, соответствие нормативам РФ и дизайн-системе.
- **[`architecture/ROADMAP.md`](./architecture/ROADMAP.md)** — Поэтапный календарный план модернизации портала: каталог инженерного ПО, постпроцессоры ЧПУ, 3D-метрология, CRM и информационная безопасность.
- **[`architecture/PRICE_LISTS_MODULE.md`](./architecture/PRICE_LISTS_MODULE.md)** — Документация модуля прайс-листов: юнит-экономика, маржинальность, схема БД PostgreSQL 17, 5 категорий и ТКП.

### 🚀 Раздел 2.2. Развертывание и инфраструктура ([`/docs/deployment/`](./deployment/README.md))
- **[`deployment/DATABASE_DEPLOYMENT.md`](./deployment/DATABASE_DEPLOYMENT.md)** — Развертывание контейнера PostgreSQL 17 (`postgres:17-alpine`), миграции Drizzle ORM (`npm run db:push`), резервное копирование и пул `pg`.
- **[`deployment/SERVER_DEPLOYMENT_GUIDE.md`](./deployment/SERVER_DEPLOYMENT_GUIDE.md)** — Пошаговое руководство по развертыванию на сетевых хранилищах ASUSTOR NAS (ADM/Docker) и облачных VPS Linux с Nginx и SSL Let's Encrypt.

### 🔄 Раздел 2.3. Миграция контекста и ИИ-инструкции ([`/docs/migration/`](./migration/README.md))
- **[`migration/AI_MIGRATION_GUIDE.md`](./migration/AI_MIGRATION_GUIDE.md)** — Комплексный архитектурный гайд и системный промпт для погружения нового ИИ-ассистента или инженера в проект.
- **[`migration/PROJECT_MIGRATION_PROMPT.md`](./migration/PROJECT_MIGRATION_PROMPT.md)** — Компактный системный промпт для мгновенного переноса проекта в новый чат или среду разработки.
- **[`migration/PRESENTATION_CEO.md`](./migration/PRESENTATION_CEO.md)** — Структура и тезисы презентации для защиты цифровой экосистемы перед высшим руководством.

### 🧪 Раздел 2.4. Тестирование и контроль качества ([`/docs/testing/`](./testing/README.md))
- **[`testing/TESTING_STRATEGY.md`](./testing/TESTING_STRATEGY.md)** — Единая стратегия тестирования, архитектура 131 автотеста (107 Vitest + 24 регрессия/Cypress E2E/Lighthouse) и регламент CI/CD.
- **[`testing/TEST_REPORT.md`](./testing/TEST_REPORT.md)** — Официальный протокол последнего прогона автотестов со 100% успехом (131 проверка).
- **[`testing/LIGHTHOUSE_AUDIT_REPORT.md`](./testing/LIGHTHOUSE_AUDIT_REPORT.md)** — Программный аудит скорости загрузки (FCP, LCP, CLS, TBT, TTFB), доступности WCAG 2.1 AA (100/100), лучших практик и SEO.
- **[`testing/SEO_AUDIT_REPORT.md`](./testing/SEO_AUDIT_REPORT.md)** — Автоматизированный протокол аудита метаданных, canonical-тегов, OpenGraph и Twitter Cards для 185 страниц (100% Index-Readiness).
- **[`testing/REGRESSION_TEST_PLAN.md`](./testing/REGRESSION_TEST_PLAN.md)** — Комплексный план регрессионного тестирования, скоуп, 5 уровней проверок и критерии Definition of Done.
- **[`testing/METROLOGY_CONFIGURATOR_TEST_SUITE.md`](./testing/METROLOGY_CONFIGURATOR_TEST_SUITE.md)** — 13 тест-кейсов проверки 4-шагового подбора оборудования, 3D WebGL просмотрщика, квалитетов IT5–IT12, расчета ROI и заявок.
- **[`testing/BUG_REPORT_TEMPLATE.md`](./testing/BUG_REPORT_TEMPLATE.md)** — Стандарты оформления отчетов о багах (Severity/Priority), матрица критичности и жизненный цикл дефекта.

---

## 🚀 Быстрый старт и команды разработки

```bash
# 1. Установка всех необходимых зависимостей
npm install

# 2. Настройка переменных окружения
cp .env.example .env

# 3. Запуск локальной базы данных PostgreSQL 17 в Docker
docker-compose up -d postgres

# 4. Применение схемы Drizzle ORM к базе данных
npm run db:push

# 5. Запуск локального сервера разработки (порт 3000)
npm run dev

# 6. Полный сквозной прогон всех автотестов (86 тестов)
npm test

# 7. Программный аудит Lighthouse & Core Web Vitals (FCP, LCP, a11y)
npm run audit:lighthouse

# 8. Автоматизированный аудит SEO-метаданных, Canonical и Соцсетей (185 страниц)
npm run seo:audit

# 7. Проверка строгой типизации TypeScript
npm run lint

# 8. Сборка производственной версии системы
npm run build
```

---

## 🛠 Стандарты поддержки документации

При выполнении любых правок кода, добавлении новых разделов или изменении бизнес-логики **обязательно** актуализировать соответствующие документы в директории `docs/`:
1. При изменении функционала или версии обновлять **`docs/SITE_PASSPORT.md`**.
2. При добавлении элементов управления или изменении интерфейса обновлять **`docs/USER_MANUAL.md`**.
3. Каждую внесенную правку фиксировать с датой и детальным описанием в **`docs/CHANGELOG.md`**.
4. При изменении СУБД или схемы БД обновлять **`docs/DATABASE_DEPLOYMENT.md`**.
5. Поддерживать актуальность каталога в **`docs/README.md`**.
