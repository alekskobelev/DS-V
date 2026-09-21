const fs = require('fs');
let cl = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

const newEntry = `
### [2.7.9] — 01.09.2026
#### Улучшение безопасности (Security & Privacy)
* **Формы авторизации (CMS и Кабинет клиента):**
  - Удалены блоки "быстрого входа" для инженеров-администраторов и клиентов.
  - Очищены плейсхолдеры (\`placeholder\`) в полях ввода электронной почты и паролей. Это предотвращает случайную демонстрацию реальных данных администраторов или клиентов (например, \`a.skobelev@ds-enginering.ru\`, \`admin123\`) при деплое сайта на публичные серверы.
`;

cl = cl.replace('---', '---' + newEntry);
fs.writeFileSync('docs/CHANGELOG.md', cl);
console.log('Changelog updated');
