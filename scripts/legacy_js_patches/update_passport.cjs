const fs = require('fs');
let code = fs.readFileSync('docs/SITE_PASSPORT.md', 'utf8');

// Update Version and Date
code = code.replace(/Версия документа: \d+\.\d+\.\d+/, 'Версия документа: 2.6.0');
code = code.replace(/Дата последнего обновления: [0-9.]+/, 'Дата последнего обновления: 01.09.2026');

// Check if CRM module is listed, if not, inject it
if (!code.includes('CRM-модуль сделок')) {
  const crmModuleText = `
* **Личный кабинет заказчика**: авторизация, отслеживание договоров, заявок и ключей защиты (HASP/сетевые).
* **CRM-модуль сделок (Внутренний)**: трехуровневая воронка продаж (услуги, оборудование, сервис), трехколоночная карточка сделки, маршрутизация файлов (NAS), изменение статусов.`;
  code = code.replace(/\* \*\*Личный кабинет заказчика\*\*:.*?(\r?\n)/, crmModuleText + '\n');
}

fs.writeFileSync('docs/SITE_PASSPORT.md', code);
console.log('SITE_PASSPORT.md updated');
