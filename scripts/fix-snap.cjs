const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/html\.snap-active \{/g, 'html {');

fs.writeFileSync('src/index.css', css);
console.log('Scroll snap enabled globally on desktop');
