const fs = require('fs');
let content = fs.readFileSync('src/components/crm/ManagerTasksCalendarView.tsx', 'utf8');

// Replace the end part with correct closing tags
const endRegex = /            <\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\);\s*\};\s*$/;
const newEnd = `            </div>\n            </div>\n            </HorizontalScrollContainer>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n};\n`;

content = content.replace(endRegex, newEnd);
fs.writeFileSync('src/components/crm/ManagerTasksCalendarView.tsx', content);
