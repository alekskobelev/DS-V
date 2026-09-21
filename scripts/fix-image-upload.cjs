const fs = require('fs');
let code = fs.readFileSync('src/components/common/ImageUploadInput.tsx', 'utf8');

code = code.replace(/alert\('Ошибка при загрузке файла', 'error'\);/g, "alert('Ошибка при загрузке файла');");

fs.writeFileSync('src/components/common/ImageUploadInput.tsx', code);
console.log('Fixed ImageUploadInput');
