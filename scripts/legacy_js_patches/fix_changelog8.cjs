const fs = require('fs');
let cl = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

const newEntry = `
### [2.7.8] — 01.09.2026
#### Исправление багов (Bug Fixes)
* **Онлайн-конфигуратор (SolutionMatcher):**
  - Восстановлен вывод полей "Сопутствующие услуги" и "Окупаемость комплекса" (ранее данные генерировались, но не выводились в интерфейс).
  - Исправлены неработающие ссылки на спецификации портативных КИМ (заменены устаревшие ID \`pmt-arm-alpha-p\` и \`pmt-arm-elite\` на актуальные \`pmt-alpha-p\` и \`pmt-alpha-e\`), из-за которых не открывались модальные окна оборудования.
`;

cl = cl.replace('---', '---' + newEntry);
fs.writeFileSync('docs/CHANGELOG.md', cl);
console.log('Changelog updated');
