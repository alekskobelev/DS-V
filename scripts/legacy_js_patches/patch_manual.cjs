const fs = require('fs');
let content = fs.readFileSync('docs/USER_MANUAL.md', 'utf8');

const note = `
3. **Единый обзор в CRM:** 
   * Все Заявки на техподдержку и Выданные лицензии, созданные в системе, могут быть привязаны к конкретному Договору. При просмотре Договора в CRM-системе (или в Кабинете) менеджер автоматически видит все прикрепленные к нему лицензии и заявки в едином окне.
`;

content = content.replace("или удалить.\n", "или удалить.\n" + note);
fs.writeFileSync('docs/USER_MANUAL.md', content);
