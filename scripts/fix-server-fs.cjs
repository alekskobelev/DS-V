const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/import fs from "fs";\nimport fs from "fs";/, 'import fs from "fs";');

fs.writeFileSync('server.ts', code);
console.log('Fixed duplicated fs');
