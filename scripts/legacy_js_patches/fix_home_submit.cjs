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

replaceInFileGlobal('src/pages/HomePage.tsx', 
  /className="w-full py-2\.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"/g, 
  'className="w-full py-2.5 bg-[#003882] hover:bg-[#002d6b] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"'
);
