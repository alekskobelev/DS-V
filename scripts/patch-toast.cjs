const fs = require('fs');
let code = fs.readFileSync('src/components/common/ImageUploadInput.tsx', 'utf8');

code = code.replace("import { showToast } from '../../utils/toast';", "");
code = code.replace(/showToast\(/g, "alert(");

fs.writeFileSync('src/components/common/ImageUploadInput.tsx', code);
console.log('Fixed ImageUploadInput toast');
