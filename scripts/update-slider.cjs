const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSlider.tsx', 'utf8');

// 1. Remove Autoplay Controls
const autoplayRegex = /\{\/\* Autoplay Pause \/ Navigation Controls \*\/\}.*?<\/button>\s*<\/div>\s*<\/div>/s;
code = code.replace(autoplayRegex, '');

// 2. Wrap Main Slide Body in gradient banner
const mainSlideStart = /\{\/\* Main Slide Body: 2-Column Responsive Grid \*\/\}\s*<div className="min-h-\[360px\] sm:min-h-\[380px\] lg:min-h-\[400px\] flex items-center">/s;

const bannerWrapper = `{/* Main Slide Body: 2-Column Responsive Grid */}
        <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white p-6 sm:p-8 lg:p-10 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          
          <div className="min-h-[360px] sm:min-h-[380px] lg:min-h-[400px] flex items-center relative z-10">`;

code = code.replace(mainSlideStart, bannerWrapper);

// We need to close the banner wrapper after the AnimatePresence block.
const animatePresenceEnd = /<\/AnimatePresence>\s*<\/div>\s*\{\/\* Bottom Slider Navigation Tabs/s;
code = code.replace(animatePresenceEnd, `</AnimatePresence>\n          </div>\n        </div>\n\n        {/* Bottom Slider Navigation Tabs`);

// 3. Update text colors inside the left column (since it's now on a dark blue background unconditionally)
// We need to be careful not to affect the right card if possible, but the right card has explicit classes.

// Category pill
code = code.replace(
  /bg-blue-100 dark:bg-blue-900\/30 border border-blue-200 dark:border-blue-500\/30 text-xs font-bold text-blue-800 dark:text-blue-300/g,
  'bg-white/20 backdrop-blur-md border-white/20 text-xs font-bold text-amber-300'
);

// Slide Title
code = code.replace(
  /<h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight max-w-2xl">/g,
  '<h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight max-w-2xl">'
);

// Slide Description
code = code.replace(
  /<p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">/g,
  '<p className="text-sm sm:text-base text-blue-100 max-w-xl leading-relaxed">'
);

// Key features checkmarks
code = code.replace(
  /<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" \/>/g,
  '<CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />'
);

// Key features text
code = code.replace(
  /<span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">/g,
  '<span className="text-xs sm:text-sm font-medium text-white leading-snug">'
);

// Secondary button
code = code.replace(
  /className="px-5 py-3 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white\/5 active:bg-gray-100 dark:active:bg-white\/10 border border-gray-200 dark:border-\[\#233554\] hover:border-blue-400 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"/g,
  'className="px-5 py-3 bg-transparent hover:bg-white/10 active:bg-white/20 border border-white/30 hover:border-white text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"'
);

// Primary button
code = code.replace(
  /className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600\/30 hover:shadow-blue-500\/40 transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer"/g,
  'className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 font-bold rounded-xl shadow-lg transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer"'
);

// Clean up background pattern of the section
code = code.replace(
  /<div className="absolute inset-0 opacity-10 bg-\[linear-gradient\(to_right,#ffffff0a_1px,transparent_1px\),linear-gradient\(to_bottom,#ffffff0a_1px,transparent_1px\)\] bg-\[size:3rem_3rem\] pointer-events-none" \/>/,
  ''
);

fs.writeFileSync('src/components/home/HeroSlider.tsx', code);
console.log('Slider updated');
