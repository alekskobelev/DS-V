const fs = require('fs');
let code = fs.readFileSync('src/components/common/DsLogo.tsx', 'utf8');

code = code.replace(/className="relative shrink-0 select-none flex items-center justify-center"/, 'className="relative shrink-0 select-none flex items-center justify-center rounded-full overflow-hidden bg-white/10"');
code = code.replace(/className="w-full h-full object-contain pointer-events-none drop-shadow-xs"/, 'className="w-full h-full object-contain pointer-events-none drop-shadow-xs rounded-full"');
// Maybe remove mixBlendMode to keep it clean if it's on dark background, but I'll leave it or remove it?
code = code.replace(/style=\{\{ mixBlendMode: 'multiply' \}\}/, "style={{ mixBlendMode: 'normal' }}");

fs.writeFileSync('src/components/common/DsLogo.tsx', code);
console.log('Fixed DsLogo');
