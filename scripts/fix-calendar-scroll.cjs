const fs = require('fs');
let content = fs.readFileSync('src/components/crm/ManagerTasksCalendarView.tsx', 'utf8');

if (!content.includes('import { HorizontalScrollContainer }')) {
  content = `import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer';\n` + content;
}

// Wrap LIST VIEW table
const listTableStart = '<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">\n              <table';
const newListTableStart = '<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">\n              <HorizontalScrollContainer>\n                <table className="min-w-[800px] w-full text-left border-collapse">';
content = content.replace(listTableStart, newListTableStart);
content = content.replace(/<\/table>\n        <\/div>/g, '</table>\n              </HorizontalScrollContainer>\n            </div>'); // Need to fix closing properly

// Wrap CALENDAR MONTH GRID
const calendarGridStart = '{/* Calendar Month Grid */}\n          <div className="border border-gray-200 rounded-2xl overflow-hidden">';
const newCalendarGridStart = '{/* Calendar Month Grid */}\n          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">\n            <HorizontalScrollContainer>\n              <div className="min-w-[1000px] w-full">';
const calendarGridEndRegex = /<\/div>\s*\{\/\* -- End Calendar Month Grid -- \*\/\}/g; // assuming it exists
// let's just do a targeted regex replace for the Calendar Month Grid end.

fs.writeFileSync('src/components/crm/ManagerTasksCalendarView.tsx', content);
