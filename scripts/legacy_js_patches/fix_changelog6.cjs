const fs = require('fs');
let cl = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

const newEntry = `
### [2.7.6] — 01.09.2026
#### Улучшение пользовательского интерфейса
* **Подвал (Footer):**
  - Оптимизированы внутренние и внешние отступы между основными блоками (CTA "Нужна консультация", сеткой ссылок и нижним блоком с копирайтом). Убраны избыточные зазоры, что сделало подвал более компактным и аккуратным, сохранив при этом удобство навигации.
`;

cl = cl.replace('---', '---' + newEntry);
fs.writeFileSync('docs/CHANGELOG.md', cl);
console.log('Changelog updated');
