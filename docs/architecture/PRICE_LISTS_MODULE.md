# МОДУЛЬ «ПРАЙС-ЛИСТЫ И НОМЕНКЛАТУРНЫЙ СПРАВОЧНИК CRM»
## Документация архитектуры, бизнес-логики и интеграций (ООО «ДС-Инжиниринг»)

---

### 1. НАЗНАЧЕНИЕ И БИЗНЕС-ЛОГИКА МОДУЛЯ
Модуль **«Прайс-листы и Номенклатура»** (`PriceListsRegistry.tsx`, `/api/crm/price-items`) является центральным ядром ценообразования компании «ДС-Инжиниринг». Он решает следующие производственные задачи:
1. **Единый источник истины цен**: Все коммерческие предложения (ТКП), опросные листы Технических заданий (ТЗ), сметы сделок в CRM и счета оперируют актуальной базой номенклатуры.
2. **Прозрачность юнит-экономики и маржинальности**: Менеджер и руководство видят реальную себестоимость закупки позиции у вендора/поставщика (`costPriceRub`), базовую цену продажи без НДС (`priceRub`), маржинальность в % (`marginPercent`), наценку (`markupPercent`) и максимальный порог разрешенной скидки (`maxDiscountPercent`).
3. **Защита от несогласованного демпинга**: При попытке предоставить заказчику скидку выше установленного лимита система сигнализирует менеджеру о снижении рентабельности сделки.
4. **Бесшовный перенос в ТКП и Сделки**: В 1 клик любая номенклатурная позиция (или пакет позиций) переносится в конструктор официального бланка ТКП с автоматическим сохранением артикулов, описания, сроков поставки и расчета НДС 22%.

---

### 2. СТРУКТУРА КАТЕГОРИЙ НОМЕНКЛАТУРЫ
Каталог разделен на **5 основных промышленных разделов**:

| № | Код категории | Наименование | Примеры номенклатуры |
| :--- | :--- | :--- | :--- |
| **1** | `software` | **Программное обеспечение** | CAD/CAM/PDM системы TopSolid 7 (3D Pro, 5-Axis, Mold), метрологическое ПО PolyWorks\|Inspector™ Premier, реверс-инжиниринг Geomagic Design X, EXModel Pro, генераторы постпроцессоров ЧПУ. |
| **2** | `hardware` | **Основное оборудование СИ** | Мостовые КИМ PMT Future / Future Plus, цеховые КИМ PMT Prime IP54, портальные КИМ PMT Loong, мобильные КИМ нового поколения PMT Gamma+ (P/M/E) и PMT Alpha Arm, 7-осевые системы Hexagon Absolute Arm с RS6/AS1, отечественные лазерные 3D-сканеры ScanLine 3D (EasyScan Omni в реестре «АРШИН», Combo+, HX2, Libre, Bundle с EXModel Pro), сканеры Shining 3D FreeScan UE Pro/Rigil, лазерные трекеры Leica AT960/AT403. |
| **3** | `services` | **Инжиниринговые услуги** | Выездное 3D-сканирование в цехе Заказчика, контроль геометрических допусков GD&T в лаборатории ЦЗЛ, реверс-инжиниринг в STEP/Parasolid, разработка 5-осевых постпроцессоров ЧПУ, калибровка и лазерная интерферометрия КИМ. |
| **4** | `accessories` | **Дополнительное оборудование и оснастка** | Измерительные щупы и удлинители Renishaw (M2, M3, M4, M5 рубиновые сферы), керамические калибровочные сферы Ø30 мм с аттестатом ВНИИМС, позиционные световозвращающие маркеры 3.0 мм, графические рабочие станции DS-Station 3D. |
| **5** | `non_core_services` | **Непрофильные и сопутствующие услуги** | Спецдоставка измерительного оборудования спецтранспортом с климат-контролем и пневмоподвеской, такелажные работы и занос в цех, командировочные расходы инженеров, обучение операторов КИМ и технологов ЧПУ (с выдачей номерных свидетельств), таможенное оформление и сертификация. |

---

### 3. РЕЛЯЦИОННАЯ АРХИТЕКТУРА СУБД (PostgreSQL 17 / Drizzle ORM)

Архитектура модуля «Прайс-лист» построена на нормализованной реляционной модели в PostgreSQL 17 (`src/db/schema.ts`), обеспечивающей строгие внешние ключи (`FOREIGN KEY`), ссылочную целостность, индексацию и сквозную версионность цен.

```
       ┌────────────────────────┐
       │    price_categories    │ (Иерархическое дерево категорий и подкатегорий)
       └───────────┬────────────┘
                   │ 1:N (category_id)
                   ▼
       ┌────────────────────────┐         1:N (price_item_id)       ┌────────────────────────┐
       │      price_items       ├──────────────────────────────────►│     price_history      │
       │ (Продукты, ПО, услуги, │                                   │ (История версий цен,   │
       │  оснастка, непр.услуги)│                                   │  дельта %, причины)    │
       └───────────┬────────────┘                                   └────────────────────────┘
                   │
                   │ 1:N (номенклатурная позиция в спецификациях)
                   ▼
       ┌────────────────────────┐                                   ┌────────────────────────┐
       │  commercial_proposals  │◄──────────────────────────────────┤    price_tier_rules    │
       │ (Генератор бланков ТКП)│      (Категории скидок клиентов)  │ (Базовый, Интегратор,  │
       └───────────┬────────────┘                                   │  Стратегический, ГОЗ)  │
                   │ M:1 (deal_id)                                  └────────────────────────┘
                   ▼
       ┌────────────────────────┐
       │       crm_deals        │
       │  (Сделки и воронка)    │
       └────────────────────────┘
```

#### 3.1. Таблица категорий и подкатегорий (`price_categories`)
```sql
CREATE TABLE price_categories (
    id VARCHAR(100) PRIMARY KEY,
    parent_id VARCHAR(100) REFERENCES price_categories(id) ON DELETE SET NULL,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color_theme TEXT DEFAULT 'blue',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX price_categories_parent_idx ON price_categories(parent_id);
CREATE INDEX price_categories_slug_idx ON price_categories(slug);
```

#### 3.2. Таблица номенклатуры продуктов и услуг (`price_items`)
```sql
CREATE TABLE price_items (
    id VARCHAR(100) PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    category_id VARCHAR(100) REFERENCES price_categories(id) ON DELETE SET NULL,
    item_type TEXT NOT NULL DEFAULT 'hardware', -- 'software' | 'hardware' | 'service' | 'accessory' | 'non_core'
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT NOT NULL,
    sub_category TEXT,
    manufacturer TEXT NOT NULL,
    description TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'шт.',
    cost_price_rub REAL NOT NULL DEFAULT 0,       -- Закупочная стоимость без НДС
    price_rub REAL NOT NULL,                    -- Базовая цена продажи без НДС
    price_usd REAL,                             -- Опциональный валютный эквивалент
    currency TEXT NOT NULL DEFAULT 'RUB',
    vat_rate REAL NOT NULL DEFAULT 22,          -- Ставка НДС (22% по умолчанию)
    max_discount_percent REAL NOT NULL DEFAULT 15, -- Максимальная скидка менеджера (%)
    margin_percent REAL,                        -- Расчетная маржинальность (%)
    current_version_number INTEGER NOT NULL DEFAULT 1, -- Номер текущей редакции цен
    in_stock BOOLEAN NOT NULL DEFAULT true,
    lead_time_days INTEGER NOT NULL DEFAULT 3,
    warranty_months INTEGER DEFAULT 12,
    supplier_name TEXT,
    supplier_contact TEXT,
    min_order_qty INTEGER DEFAULT 1,
    specifications JSONB DEFAULT '{}',
    notes TEXT,
    tags JSONB DEFAULT '[]',
    is_popular BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX price_items_sku_idx ON price_items(sku);
CREATE INDEX price_items_category_idx ON price_items(category);
CREATE INDEX price_items_name_idx ON price_items(name);
CREATE INDEX price_items_active_idx ON price_items(is_active);
```

#### 3.3. Таблица истории версий и изменений цен (`price_history`)
Обеспечивает сквозной аудит ценообразования, хранение временных срезов и хронологии переоценок:
```sql
CREATE TABLE price_history (
    id VARCHAR(100) PRIMARY KEY,
    price_item_id VARCHAR(100) NOT NULL REFERENCES price_items(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    cost_price_rub REAL NOT NULL,
    sale_price_rub REAL NOT NULL,
    sale_price_usd REAL,
    vat_rate REAL NOT NULL DEFAULT 22,
    margin_percent REAL,
    max_discount_percent REAL,
    valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMP,
    change_reason TEXT NOT NULL, -- Причина изменения цен (индексация, курсовая разница, скидка поставщика)
    change_delta_cost_percent REAL,
    change_delta_sale_percent REAL,
    changed_by_manager_id VARCHAR(100),
    changed_by_manager_name TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX price_history_item_idx ON price_history(price_item_id);
CREATE INDEX price_history_version_idx ON price_history(price_item_id, version_number);
CREATE INDEX price_history_valid_idx ON price_history(valid_from, valid_to);
```

#### 3.4. Таблица тарифных сеток и клиентских скидок (`price_tier_rules`)
```sql
CREATE TABLE price_tier_rules (
    id VARCHAR(100) PRIMARY KEY,
    tier_code TEXT NOT NULL UNIQUE,       -- 'standard_retail', 'key_integrator', 'strategic_partner', 'enterprise_gov'
    name TEXT NOT NULL,
    description TEXT,
    min_order_total_rub REAL DEFAULT 0,
    target_discount_percent REAL NOT NULL DEFAULT 0,
    max_allowed_discount_percent REAL NOT NULL DEFAULT 15,
    min_margin_threshold_percent REAL NOT NULL DEFAULT 15,
    applicable_categories JSONB DEFAULT '["software", "hardware", "services", "accessories", "non_core_services"]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### Отказоустойчивость (Hybrid Persistence)
- При штатной работе транзакции выполняются в **PostgreSQL 17** через Drizzle ORM.
- При автономной работе данные мгновенно персистируются в файлы `data/price_items.json` и `data/price_history.json`.

---

### 4. МЕТОДИКА РАСЧЕТА ЮНИТ-ЭКОНОМИКИ
Все расчеты выполняются по формулам:

1. **Прибыль позиции (Profit)**:
   $$\text{Profit} = \text{PriceRub} - \text{CostPriceRub}$$

2. **Маржинальность продажи (Margin %)**:
   $$\text{Margin \%} = \frac{\text{PriceRub} - \text{CostPriceRub}}{\text{PriceRub}} \times 100\%$$

3. **Наценка на закупку (Markup %)**:
   $$\text{Markup \%} = \frac{\text{PriceRub} - \text{CostPriceRub}}{\text{CostPriceRub}} \times 100\%$$

4. **Расчет НДС 22%**:
   $$\text{VAT Amount} = \text{Round}\left(\text{PriceRub} \times \frac{22}{100}\right)$$
   $$\text{Total With VAT} = \text{PriceRub} + \text{VAT Amount}$$

---

### 5. REST API ЭНДПОИНТЫ (`src/server/priceListsModule.ts`)

| Метод | URL | Описание |
| :--- | :--- | :--- |
| `GET` | `/api/crm/price-items` | Получение полного списка номенклатуры (параметры: `category`, `search`, `activeOnly`). |
| `GET` | `/api/crm/price-items/:id` | Получение конкретной позиции по ID или артикулу (SKU). |
| `POST` | `/api/crm/price-items` | Создание новой позиции с валидацией уникальности SKU и расчетом маржинальности. |
| `PUT` | `/api/crm/price-items/:id` | Обновление цен, себестоимости, описания и условий поставки. |
| `DELETE` | `/api/crm/price-items/:id` | Удаление позиции из прайса. |
| `POST` | `/api/crm/price-items/import` | Пакетный импорт номенклатуры (JSON-массив, режим merge/replace). |
| `POST` | `/api/crm/price-items/reset-defaults` | Сброс каталога к эталонным позициям компании. |

---

### 6. ИНТЕРФЕЙС УПРАВЛЕНИЯ (`PriceListsRegistry.tsx`)
1. **Панель категорий**: Быстрый выбор любого из 5 разделов со счетчиками позиций.
2. **Переключатель видимости себестоимости**: Кнопка «Закупка видна / скрыта» позволяет менеджеру скрывать конфиденциальную закупочную цену при демонстрации экрана заказчику.
3. **Модальное окно добавления/редактирования**:
   - Автогенерация артикулов вида `DS-HAR-834`, `DS-SOF-102`.
   - Живой калькулятор маржи и наценки в реальном времени.
   - Поля сроков поставки, гарантии и складских остатков.
4. **Экспорт / Импорт**: Выгрузка отфильтрованного каталога в CSV с правильной кодировкой для MS Excel (`\uFEFF`).
5. **Создание ТКП в 1 клик**: Клик по иконке документа открывает генератор ТКП с предзаполненным оборудованием и расчетными суммами.

---

### 7. СЕРВИС FIRESTORE КЛИЕНТА (`src/services/PriceService.ts`)

Сервис `PriceService` предоставляет стандартизированный клиентский и серверный API для работы с коллекциями Firestore:

* **Коллекции Firestore**:
  - `price_items` — номенклатурный прейскурант продуктов, ПО, услуг и оснастки;
  - `price_categories` — справочник категорий и подкатегорий;
  - `price_history` — неизменяемый журнал истории версий цен и аудита переоценок;
  - `price_tier_rules` — клиентские тарифные сетки и скидочные правила.
* **Методы CRUD и версионирования**:
  - `getAllPriceItems(filters)` / `getPriceItemById(id)` / `getPriceItemBySku(sku)` — выборка позиций;
  - `createPriceItem(data, managerInfo)` — создание позиции с автоматической фиксацией v1 в истории;
  - `updatePriceItem(id, updates, managerInfo)` — обновление параметров и автофиксация новой редакции цен при изменении себестоимости/продажи;
  - `deletePriceItem(id)` — удаление позиции;
  - `subscribeToPriceItems(callback, filters)` — реактивная подписка на изменения через `onSnapshot`;
  - `batchUpsertPriceItems(items)` — пакетная вставка позиций через `writeBatch`;
  - `getPriceHistory(itemId)` / `getAllPriceHistory(limit)` — извлечение хронологии версий цен;
  - `recordPriceVersion(itemId, versionData)` — регистрация новой версии цены с закрытием предыдущей (`validTo`);
  - `subscribeToItemPriceHistory(itemId, callback)` — подписка на историю позиции в реальном времени;
  - `getCategories()` / `createCategory()` / `updateCategory()` / `deleteCategory()` — управление категориями;
  - `getTierRules()` / `saveTierRule()` / `deleteTierRule()` — управление тарифными сетками;
  - `seedInitialData(force)` — начальная инициализация коллекций Firestore эталонным каталогом.
* **Безопасность и правила**:
  - Полная защита через `firestore.rules` и спецификацию `firebase-blueprint.json`;
  - Централизованная обработка ошибок `handleFirestoreError` с кодами операций `OperationType`.

---

### 8. КОМПОНЕНТ УПРАВЛЕНИЯ ПРАЙС-ЛИСТОМ (`src/components/PriceListManager.tsx`)

Компонент `PriceListManager` реализует интерфейс управления прейскурантом на базе сервиса `PriceService`:

* **Поиск и фильтрация**:
  - Полнотекстовый поиск по артикулу (SKU), наименованию, вендору, описанию и примечаниям;
  - Быстрое переключение 5 промышленных категорий с динамическими счетчиками позиций;
  - Селектор подкатегорий и типов номенклатуры;
  - Фильтры складского наличия («В наличии» / «Под заказ») и статуса активности.
* **Многоформатный и многостраничный экспорт (`src/utils/priceListExcelExporter.ts`)**:
  - **Книга Excel (.XLS / XML Spreadsheet)**: формирование файла со всеми категориями на отдельных листах:
    1. *«Вся номенклатура (Сводный)»*
    2. *«1. Оборудование КИМ и 3D»*
    3. *«2. Программное обеспечение»*
    4. *«3. Инжиниринговые услуги»*
    5. *«4. Оснастка и щупы Renishaw»*
    6. *«5. Сервис и калибровка»*
    7. *«6. Правила скидок и акции»*
    На каждом листе внедрен нативный тег `<AutoFilter>` для моментальной сортировки и фильтрации по любой колонке в Microsoft Excel, МойОфис, Р7-Офис и LibreOffice Calc.
  - **Многостраничный структурированный CSV**: единый файл с делением на секции-листы с заголовками, суммами и структурированными блоками данных.
  - **Пакет отдельных CSV-файлов**: последовательное скачивание отдельных файлов CSV для каждого раздела прайса.
  - **Модальное окно параметров экспорта (`isExportConfigModalOpen`)**: возможность заранее задать поле и порядок сортировки (по возрастанию / убыванию), выбрать целевой раздел, отфильтровать по наличию на складе и отключить колонки себестоимости и маржи при формировании клиентского прайса.


