const fs = require('fs');
const path = require('path');

// 1. Update index.css with theme variables
const cssPath = 'src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const themeConfig = `
/* --- Corporate Unified Theme --- */
@theme {
  --color-primary: #1E3A8A;
  --color-primary-light: #2563EB;
  --color-primary-dark: #172554;
  --color-accent: #F59E0B;
  --color-accent-hover: #D97706;
  --color-bg-light: #F8FAFC;
  --color-bg-dark: #111827;
  --color-text-main: #1E293B;
  --color-text-muted: #64748B;
}

/* Scroll Snap Configuration */
html {
  scroll-snap-type: none;
}
@media (min-width: 1024px) {
  html.snap-active {
    scroll-snap-type: y proximity;
  }
}
.snap-section {
  scroll-snap-align: start;
  scroll-margin-top: 80px; /* Header offset */
}
`;

if (!css.includes('--color-primary:')) {
  css = css.replace('@import "tailwindcss";', '@import "tailwindcss";\n' + themeConfig);
  fs.writeFileSync(cssPath, css);
  console.log('Added theme to index.css');
}

// 2. Refactor colors and paddings in TSX files
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // A. Replace random colors with standard corporate ones
    // Convert indigo, sky, cyan, teal to blue
    content = content.replace(/text-indigo-/g, 'text-blue-');
    content = content.replace(/bg-indigo-/g, 'bg-blue-');
    content = content.replace(/border-indigo-/g, 'border-blue-');
    
    // Main background sections
    content = content.replace(/bg-gray-50/g, 'bg-slate-50');
    content = content.replace(/bg-\[\#F3F4F6\]/g, 'bg-slate-50');
    content = content.replace(/bg-\[\#0B0F17\]/g, 'bg-slate-900');
    content = content.replace(/bg-\[\#112240\]/g, 'bg-slate-800');
    content = content.replace(/bg-\[\#0a192f\]/g, 'bg-slate-900');
    
    // B. Fix paddings for scroll optimization (py-24 -> py-12, py-20 -> py-12, py-16 -> py-10)
    content = content.replace(/py-24/g, 'py-12');
    content = content.replace(/py-20/g, 'py-12');
    content = content.replace(/py-16/g, 'py-10');
    
    // Convert generic sections to snap sections (min-h-screen -> min-h-[calc(100vh-80px)])
    content = content.replace(/min-h-screen/g, 'min-h-[calc(100vh-80px)]');
    
    // Add snap-section to section tags
    content = content.replace(/<section([^>]*)className="([^"]*)"/g, (match, p1, p2) => {
      if (!p2.includes('snap-section')) {
        return `<section${p1}className="${p2} snap-section"`;
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content);
    }
  }
});
console.log('Refactored TSX files');
