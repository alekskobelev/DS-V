const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(
  /@media \(min-width: 1024px\) \{\n  html \{\n    scroll-snap-type: y proximity;\n  \}\n\}/g,
  `@media (min-width: 1024px) and (min-height: 768px) {
  html {
    scroll-snap-type: y mandatory;
  }
}`
);

fs.writeFileSync('src/index.css', css);
console.log('Scroll snap updated to mandatory for safe screen sizes');
