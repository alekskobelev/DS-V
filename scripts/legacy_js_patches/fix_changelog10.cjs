const fs = require('fs');
let cl = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

const newEntry = `
### [2.7.10] — 01.09.2026
#### Управление доступом (Access Control)
* **Пользователи CMS:**
  - Добавлена новая учетная запись администратора-модератора (\`moderator@ds-enginering.ru\`) для управления контентом.
`;

cl = cl.replace('---', '---' + newEntry);
fs.writeFileSync('docs/CHANGELOG.md', cl);
console.log('Changelog updated');
