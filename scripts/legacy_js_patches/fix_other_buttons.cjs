const fs = require('fs');

function replaceOtherButtons(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Any stray emerald buttons for requesting quotes
  content = content.replace(/bg-emerald-500 hover:bg-emerald-600/g, 'bg-blue-600 hover:bg-blue-700');
  
  fs.writeFileSync(filePath, content);
  console.log(`Other buttons replaced in ${filePath}`);
}

replaceOtherButtons('src/pages/SoftwarePage.tsx');
replaceOtherButtons('src/pages/HardwarePage.tsx');
