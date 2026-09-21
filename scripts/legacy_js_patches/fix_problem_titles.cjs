const fs = require('fs');

let content = fs.readFileSync('src/components/home/ProblemsSolutionsBlock.tsx', 'utf8');

content = content.replace(
  /'Импортозамещение и детали без чертежей'/g,
  "'Импортозамещение и восстановление геометрии деталей при отсутствии чертежей'"
);

content = content.replace(
  /'Брак на производстве и долгий контроль ОТК'/g,
  "'Ускорение работы ОТК и выявление причин брака'"
);

content = content.replace(
  /'Аварии на станках с ЧПУ и сложные 5-осевые детали'/g,
  "'Разработка 3D-моделей и чертежей, управление данными и механическая обработка без столкновений'"
);

content = content.replace(
  /'Контроль крупногабаритных рам, стапелей и фюзеляжей'/g,
  "'Контроль геометрии крупногабаритных конструкций'"
);

fs.writeFileSync('src/components/home/ProblemsSolutionsBlock.tsx', content);
console.log('Titles updated in ProblemsSolutionsBlock.tsx');
