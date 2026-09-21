const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Remove the mandatory scroll snap block
css = css.replace(
  /@media \(min-width: 1024px\) and \(min-height: 768px\) \{\n  html \{\n    scroll-snap-type: y mandatory;\n  \}\n\}/g,
  ''
);

// We can also just remove the snap-section class entirely to be safe
css = css.replace(
  /\.snap-section \{\n  scroll-snap-align: start;\n  scroll-margin-top: 80px; \/\* Header offset \*\/\n\}/g,
  ''
);

// Also remove html { scroll-snap-type: none; } since it's default
css = css.replace(/html \{\n  scroll-snap-type: none;\n\}/g, '');
css = css.replace(/\/\* Scroll Snap Configuration \*\//g, '');

fs.writeFileSync('src/index.css', css);
console.log('Scroll snap removed from index.css');
