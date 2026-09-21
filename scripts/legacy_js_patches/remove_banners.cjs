const fs = require('fs');

function removeBanner(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Use a regex that captures from the comment to the closing div of the banner
  const regex = /\s*\{\/\* In-text CTA Banner \*\/\}[\s\S]*?<\/button>\s*<\/div>/;
  
  if (regex.test(content)) {
    content = content.replace(regex, '');
    fs.writeFileSync(filePath, content);
    console.log(`Banner removed from ${filePath}`);
  } else {
    console.log(`Banner not found in ${filePath}`);
  }
}

removeBanner('src/pages/SoftwarePage.tsx');
removeBanner('src/pages/HardwarePage.tsx');
