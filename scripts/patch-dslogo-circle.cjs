const fs = require('fs');
let code = fs.readFileSync('src/components/common/DsLogo.tsx', 'utf8');
code = code.replace(/className="relative shrink-0 select-none flex items-center justify-center rounded-full overflow-hidden bg-white\/10"/, 'className="relative shrink-0 select-none flex items-center justify-center rounded-full overflow-hidden bg-white"');
fs.writeFileSync('src/components/common/DsLogo.tsx', code);
console.log('Fixed DsLogo circle background');
