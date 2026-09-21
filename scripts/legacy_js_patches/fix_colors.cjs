const fs = require('fs');

function replaceInFile(filePath, regex, replacement) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
    console.log(`Replaced in ${filePath}`);
  }
}

// 1. HomePage - Hero Button
replaceInFile('src/pages/HomePage.tsx',
  /className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl shadow-lg hover:shadow-amber-500\/20 transition-all text-xs sm:text-sm flex items-center gap-2"/g,
  'className="px-6 py-3 bg-[#003882] hover:bg-[#002d6b] text-white font-bold rounded-xl shadow-lg hover:shadow-[#003882]/20 transition-all text-xs sm:text-sm flex items-center gap-2"'
);

// 2. Header - Desktop
replaceInFile('src/components/layout/Header.tsx',
  /className="hidden 2xl:inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-\[#F59E0B\] hover:bg-amber-600 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 whitespace-nowrap"/g,
  'className="hidden 2xl:inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-[#003882] hover:bg-[#002d6b] rounded-lg shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 whitespace-nowrap"'
);

// 3. Header - Mobile
replaceInFile('src/components/layout/Header.tsx',
  /className="w-full py-2.5 px-4 bg-\[#F59E0B\] text-white font-semibold rounded-lg text-center shadow-xs hover:bg-amber-600"/g,
  'className="w-full py-2.5 px-4 bg-[#003882] hover:bg-[#002d6b] text-white font-semibold rounded-lg text-center shadow-xs"'
);

// 4. Footer
replaceInFile('src/components/layout/Footer.tsx',
  /className="px-5 py-3 bg-\[#F59E0B\] hover:bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-center"/g,
  'className="px-5 py-3 bg-[#003882] hover:bg-[#002d6b] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-center"'
);

// 5. SoftwarePage & HardwarePage - "Заказать онлайн-демо"
replaceInFile('src/pages/SoftwarePage.tsx',
  /className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"/g,
  'className="flex-1 py-3 px-4 bg-[#003882] hover:bg-[#002d6b] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"'
);
replaceInFile('src/pages/HardwarePage.tsx',
  /className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"/g,
  'className="flex-1 py-3 px-4 bg-[#003882] hover:bg-[#002d6b] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"'
);

// 6. SoftwarePage & HardwarePage - "Запросить КП"
replaceInFile('src/pages/SoftwarePage.tsx',
  /className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"/g,
  'className="flex-1 py-3 px-4 bg-[#003882] hover:bg-[#002d6b] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"'
);
replaceInFile('src/pages/HardwarePage.tsx',
  /className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"/g,
  'className="flex-1 py-3 px-4 bg-[#003882] hover:bg-[#002d6b] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"'
);

