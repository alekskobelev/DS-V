const fs = require('fs');
let content = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

const date = new Date().toLocaleDateString('ru-RU');
const newLog = `
## [v2.16.2-PROD] - ${date}
### Добавлено
* **Мультимедиа**: Интегрирована загрузка локальных файлов на сервер (\`/api/upload\` с использованием \`multer\`).
* **UI Загрузки**: Компонент \`ImageUploadInput\` с кнопкой загрузки для картинок, галереи, видео и брошюр в CMS.
* **WYSIWYG**: Визуальный редактор теперь применяется к "Ключевым преимуществам" продуктов и услуг.
* **Документация**: В CMS интегрирована вкладка "Инструкция", динамически подгружающая \`USER_MANUAL.md\`.
`;
content = content.replace('## [', newLog + '\n## [');
fs.writeFileSync('docs/CHANGELOG.md', content);
