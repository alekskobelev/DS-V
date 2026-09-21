const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// For useState
content = content.replace(
  /if \(parsed\.length < 12 && parsed\.some\(\(a: any\) => a\.id === 'news-topsolid-v718'\)\) {/g,
  'if (parsed.length < 12) {'
);

// For fetchCmsState
content = content.replace(
  /if \(sArts\.length < 12 && sArts\.some\(\(a: any\) => a\.id === 'news-topsolid-v718'\)\) {/g,
  'if (sArts.length < 12) {'
);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Made article overrides more aggressive');
