const fs = require('fs');

function replaceInFileGlobal(filePath, regex, replacement) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
    console.log(`Replaced in ${filePath}`);
  }
}

// Any remaining "Запросить КП" or similar primary buttons that we updated to blue-600 earlier:
replaceInFileGlobal('src/pages/SoftwarePage.tsx', 
  /bg-blue-600 hover:bg-blue-700/g, 
  'bg-[#003882] hover:bg-[#002d6b]'
);
replaceInFileGlobal('src/pages/HardwarePage.tsx', 
  /bg-blue-600 hover:bg-blue-700/g, 
  'bg-[#003882] hover:bg-[#002d6b]'
);
replaceInFileGlobal('src/pages/AboutPage.tsx', 
  /bg-blue-600 hover:bg-blue-700/g, 
  'bg-[#003882] hover:bg-[#002d6b]'
);

