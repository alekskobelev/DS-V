const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

// The original reset button was in CmsPage.tsx:
const resetBtnRegex = /if \(window\.confirm\('Сбросить все счетчики посещаемости страниц к 0\?'\)\) \{/g;
const resetReplacement = `if (true) {`;

code = code.replace(resetBtnRegex, resetReplacement);
fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('Fixed reset button');
