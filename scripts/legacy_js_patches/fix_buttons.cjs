const fs = require('fs');

function replaceButtons(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Заказать онлайн-демо button
  content = content.replace(
    /className="flex-1 py-3 px-4 bg-\[#F59E0B\] hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"/g,
    'className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"'
  );

  // Replace Запросить КП button
  content = content.replace(
    /className="flex-1 py-3 px-4 bg-\[#10B981\] hover:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"/g,
    'className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Buttons replaced in ${filePath}`);
}

replaceButtons('src/pages/SoftwarePage.tsx');
replaceButtons('src/pages/HardwarePage.tsx');

