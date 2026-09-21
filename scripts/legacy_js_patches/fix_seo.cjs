const fs = require('fs');
let code = fs.readFileSync('src/utils/seo.ts', 'utf8');

code = code.replace(
  /'account': {[\s\S]*?},/,
  `'account': {
    title: 'Личный кабинет | ДС-Инжиниринг',
    description: 'Личный кабинет клиента «ДС-Инжиниринг»: отслеживание статуса заявок на расчет, заказов оборудования, лицензий ПО и обращений в службу технической поддержки.',
  },`
);

fs.writeFileSync('src/utils/seo.ts', code);
console.log('seo fixed');
