const fs = require('fs');
let cl = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

const newEntry = `
### [2.7.13] — 01.09.2026
#### Инфраструктура и Базы Данных (Self-Hosted Migration)
* Отказ от использования Cloud SQL в пользу независимого локального развертывания.
* Разработана инструкция по автономному развертыванию (\`DATABASE_DEPLOYMENT.md\`).
* Добавлен \`docker-compose.yml\` для быстрого поднятия контейнера PostgreSQL 15.
* Добавлены скрипты \`db:push\`, \`db:generate\` и \`db:studio\` в package.json.
* **Backend:** Выполнена полная миграция endpoints калькулятора (RFQ) и тикетов B2B с in-memory массивов на Drizzle ORM запросы к реляционной структуре (\`tickets\`, \`rfqSubmissions\`).
`;

cl = cl.replace('---', '---' + newEntry);
fs.writeFileSync('docs/CHANGELOG.md', cl);
console.log('Changelog updated');
