const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

const backupTabRegex = /\{activeTab === 'backup' && \(/;

const manualContent = `
        {activeTab === 'manual' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100 flex flex-col p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Инструкция по использованию CMS</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <h3 className="font-bold text-blue-900 text-lg mb-2">1. Раздел «Каталог» (Услуги, ПО, Оборудование)</h3>
                <p className="text-blue-800 text-sm mb-2">В этом разделе вы можете управлять всеми продуктами и услугами на сайте.</p>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li><strong>Добавление:</strong> Нажмите кнопку «Добавить товар» или «Добавить услугу», заполните все поля. Для изображений используйте кнопку загрузки файла.</li>
                  <li><strong>Редактирование:</strong> Нажмите на иконку карандаша рядом с нужным элементом в таблице.</li>
                  <li><strong>Удаление:</strong> Нажмите на иконку корзины. Внимание: действие необратимо!</li>
                </ul>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <h3 className="font-bold text-emerald-900 text-lg mb-2">2. Раздел «Страницы» и «Новости»</h3>
                <p className="text-emerald-800 text-sm mb-2">Здесь вы управляете контентными страницами сайта.</p>
                <ul className="list-disc list-inside text-sm text-emerald-700 space-y-1">
                  <li>Используйте <strong>встроенный редактор</strong> для форматирования текста (жирный, курсив, заголовки, списки, таблицы).</li>
                  <li>Для загрузки картинок в статью используйте кнопку «Вставить картинку» и вставьте загруженную ссылку.</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <h3 className="font-bold text-orange-900 text-lg mb-2">3. Раздел «SEO Настройки»</h3>
                <p className="text-orange-800 text-sm mb-2">Настройки мета-тегов для поисковой оптимизации (Яндекс, Google).</p>
                <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                  <li>Заполняйте <strong>Title</strong> (до 70 символов) и <strong>Description</strong> (до 160 символов) для каждой страницы.</li>
                  <li>Ключевые слова вводятся через запятую.</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <h3 className="font-bold text-purple-900 text-lg mb-2">4. Работа с CRM</h3>
                <p className="text-purple-800 text-sm mb-2">CRM-система вынесена в отдельный раздел для менеджеров.</p>
                <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
                  <li>Доступ к CRM осуществляется через меню профиля (кнопка в правом верхнем углу шапки сайта).</li>
                  <li>В CRM поступают все заявки, лиды и запросы на консультации с сайта.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
`;

code = code.replace(backupTabRegex, manualContent + "\n        {activeTab === 'backup' && (");

fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('Added manual tab content');
