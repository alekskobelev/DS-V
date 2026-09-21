const fs = require('fs');
let um = fs.readFileSync('docs/USER_MANUAL.md', 'utf8');

const oldLoginText = `   * **Логин по умолчанию:** \`admin\` (или \`editor\`)
   * **Пароль:** указан в защищенном реестре конфигурации \`DEFAULT_ADMIN_ACCOUNTS\`.`;

const newLoginText = `   * **Доступные аккаунты:**
     - Некрасов Сергей Юрьевич: \`s.nekrasov@ds-enginering.ru\` / \`admin123\`
     - Скобелев Александр Сергеевич: \`a.skobelev@ds-enginering.ru\` / \`admin123\`
     - Ярыш Иван Владимирович: \`i.yarish@ds-enginering.ru\` / \`admin123\`
     - Ярыш Александр Владимирович: \`a.yarish@ds-enginering.ru\` / \`admin123\`
     - Морозов Владимир Георгиевич: \`v.morozov@ds-enginering.ru\` / \`admin123\`
     - Модератор Сайта: \`moderator@ds-enginering.ru\` / \`moderator123\`
   * **Клиентский доступ:** Петров Дмитрий Николаевич: \`d.petrov@aviaagregat.ru\` / \`client123\``;

um = um.replace(oldLoginText, newLoginText);
fs.writeFileSync('docs/USER_MANUAL.md', um);
console.log('User manual updated');
