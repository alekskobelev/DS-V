const fs = require('fs');
let cl = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

const newEntry = `
### [2.7.12] — 01.09.2026
#### Инфраструктура и Базы Данных (Database Migration)
* Развернут и подключен **Cloud SQL PostgreSQL**.
* Установлена **Drizzle ORM** для безопасного, типизированного обращения к БД.
* Настроена схема данных (\`users\`, \`tickets\`).
* Интегрирована облачная конфигурация для **Firebase Auth** (Server-side & Client-side).
* Написаны middlewares (\`requireAuth\`) для валидации JWT токенов.
`;

cl = cl.replace('---', '---' + newEntry);
fs.writeFileSync('docs/CHANGELOG.md', cl);
console.log('Changelog updated');
