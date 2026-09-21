const fs = require('fs');
let cl = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

const newEntry = `
### [2.7.11] — 01.09.2026
#### Документация (Documentation)
* **Руководство пользователя:**
  - Добавлен список учетных записей администраторов и модератора в раздел авторизации CMS.
`;

cl = cl.replace('---', '---' + newEntry);
fs.writeFileSync('docs/CHANGELOG.md', cl);
console.log('Changelog updated');
