const fs = require('fs');
let content = fs.readFileSync('src/components/crm/ManagerTasksCalendarView.tsx', 'utf8');

// 1. Wrap the List View table
content = content.replace(/<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">\s*<table className="w-full/g, '<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">\n              <HorizontalScrollContainer>\n              <table className="min-w-[800px] w-full');

// Close the wrapper for list view
content = content.replace(/<\/tbody>\s*<\/table>\s*<\/div>\s*\)\}/g, '</tbody>\n              </table>\n              </HorizontalScrollContainer>\n            </div>\n          )}');

// 2. Wrap the Calendar Month Grid
content = content.replace(/\{\/\* Calendar Month Grid \*\/\}\s*<div className="border border-gray-200 rounded-2xl overflow-hidden">/g, '{/* Calendar Month Grid */}\n          <div className="border border-gray-200 rounded-2xl overflow-hidden">\n            <HorizontalScrollContainer>\n            <div className="min-w-[1000px]">');

// End of calendar grid is before the CalendarEventModal
// We find {/* 3. Modals */} and insert closing tags before it.
content = content.replace(/<\/div>\s*<\/div>\s*\{\/\* 3\. Modals \*\/\}/g, '</div>\n            </div>\n            </HorizontalScrollContainer>\n          </div>\n        </div>\n      )}\n\n      {/* 3. Modals */}');

fs.writeFileSync('src/components/crm/ManagerTasksCalendarView.tsx', content);
