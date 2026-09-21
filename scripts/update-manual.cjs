const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

const oldManualStart = `{activeTab === 'manual' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100 flex flex-col p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Инструкция по использованию CMS</h2>`;

const oldManualEnd = `              </div>
            </div>
          </div>
        )}`;

const newManualCode = `{activeTab === 'manual' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100 flex flex-col p-8 space-y-8">
            <div className="border-b border-gray-200 pb-5">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Руководство пользователя CMS «ДС-Инжиниринг»</h2>
              <p className="text-gray-600">Подробная инструкция по управлению контентом, SEO-оптимизацией и конфигурацией корпоративного портала.</p>
            </div>
            
            <div className="space-y-6">
              
              {/* 1. Раздел Страницы */}
              <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 text-white rounded-lg"><BookOpen className="w-5 h-5" /></div>
                  <h3 className="font-bold text-blue-900 text-xl">1. Конструктор страниц (Pages Builder)</h3>
                </div>
                <div className="text-gray-700 text-sm space-y-3 leading-relaxed">
                  <p>Раздел предназначен для создания пользовательских лендингов и редактирования контента существующих системных страниц.</p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li><strong>Создание новой страницы:</strong> Нажмите «Создать новую». Укажите уникальный URL-slug (например, <code className="bg-white px-1 py-0.5 rounded text-blue-600 border border-gray-200">promo-2026</code>) и название.</li>
                    <li><strong>Блочная структура:</strong> Каждая страница состоит из блоков (Текст, Изображение, Галерея, Таблица, Видео, Разделитель). Блоки можно менять местами (drag-and-drop).</li>
                    <li><strong>Вывод в меню:</strong> Установите галочки «Показывать в шапке» или «Показывать в подвале», чтобы ссылка на страницу автоматически появилась в навигации сайта.</li>
                    <li><strong>Системные страницы:</strong> Страницы вроде «Главная» или «Контакты» имеют фиксированный URL, но их текстовые и визуальные блоки также можно редактировать.</li>
                  </ul>
                </div>
              </div>

              {/* 2. Раздел Каталог */}
              <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg"><Laptop className="w-5 h-5" /></div>
                  <h3 className="font-bold text-emerald-900 text-xl">2. Управление каталогом (Оборудование, ПО, Услуги)</h3>
                </div>
                <div className="text-gray-700 text-sm space-y-3 leading-relaxed">
                  <p>Единая панель для управления всем коммерческим ассортиментом компании.</p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li><strong>Оборудование и ПО:</strong> Для каждого товара можно задать технические характеристики, загрузить изображения (поддерживаются форматы WebP/PNG/JPG), прикрепить брошюры (PDF) и указать ссылки на видеообзоры.</li>
                    <li><strong>Инжиниринговые услуги:</strong> Карточка услуги поддерживает описание этапов работ, используемого оборудования и типа встроенного калькулятора (сканирование, реверс, контроль).</li>
                    <li><strong>Бейджи и метки:</strong> Используйте поле «Бейдж» (например, «В наличии», «Хит продаж»), чтобы выделить продукт в общем списке каталога.</li>
                  </ul>
                </div>
              </div>

              {/* 3. Раздел Инфо-центр */}
              <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-600 text-white rounded-lg"><Globe className="w-5 h-5" /></div>
                  <h3 className="font-bold text-orange-900 text-xl">3. Пресс-центр и База знаний</h3>
                </div>
                <div className="text-gray-700 text-sm space-y-3 leading-relaxed">
                  <p>Управление информационным контентом: новостями, статьями, ГОСТами и сертификатами.</p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li><strong>Визуальный редактор (WYSIWYG):</strong> Поддерживает вставку таблиц, форматирование текста, заголовки (H2-H4) и встраивание медиафайлов. Работает по принципу привычных текстовых процессоров.</li>
                    <li><strong>База знаний:</strong> Позволяет прикреплять документы (PDF, DOCX) для скачивания пользователями. Отличный инструмент для публикации ГОСТов и инструкций к оборудованию.</li>
                  </ul>
                </div>
              </div>

              {/* 4. Раздел SEO */}
              <div className="p-6 bg-purple-50/50 border border-purple-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600 text-white rounded-lg"><Search className="w-5 h-5" /></div>
                  <h3 className="font-bold text-purple-900 text-xl">4. SEO-оптимизация и Массовый экспорт</h3>
                </div>
                <div className="text-gray-700 text-sm space-y-3 leading-relaxed">
                  <p>Профессиональные инструменты для продвижения сайта в Яндекс и Google.</p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li><strong>Массовый экспорт/импорт (JSON):</strong> Новая функция в разделе SEO! Вы можете в один клик выгрузить все метатеги сайта (Title, Description, Keywords) в JSON-файл. Передайте его SEO-специалисту для редактирования в Excel/скриптах, а затем импортируйте обратно. Система автоматически обновит нужные страницы и товары.</li>
                    <li><strong>Микроразметка Schema.org:</strong> Формируется автоматически на основе введенных вами данных.</li>
                    <li><strong>Анализатор (SEO Audit):</strong> Встроенный робот проверяет длину заголовков, наличие тегов H1 и дает рекомендации прямо в панели.</li>
                  </ul>
                </div>
              </div>

              {/* 5. Настройки */}
              <div className="p-6 bg-slate-50/50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-700 text-white rounded-lg"><Sliders className="w-5 h-5" /></div>
                  <h3 className="font-bold text-slate-900 text-xl">5. Глобальные настройки и Бэкап</h3>
                </div>
                <div className="text-gray-700 text-sm space-y-3 leading-relaxed">
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li><strong>Реквизиты и Контакты:</strong> Изменения в этом разделе моментально применяются ко всем формам, подвалу сайта и странице контактов.</li>
                    <li><strong>Полный Экспорт (Backup):</strong> Вкладка «Экспорт / Запуск на ПК» позволяет скачать абсолютную копию базы данных сайта (не только SEO, но и все тексты, картинки, заявки) для резервного копирования. Рекомендуется делать экспорт раз в месяц.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}`;

let startIndex = code.indexOf(oldManualStart);
if (startIndex !== -1) {
  let endIndex = code.indexOf(oldManualEnd, startIndex) + oldManualEnd.length;
  code = code.substring(0, startIndex) + newManualCode + code.substring(endIndex);
  fs.writeFileSync('src/pages/CmsPage.tsx', code);
  console.log('Manual replaced');
} else {
  console.log('Manual block not found. Checking exact match.');
}
