const fs = require('fs');
let content = fs.readFileSync('src/components/crm/ManagerTasksCalendarView.tsx', 'utf8');
content = content.replace('</HorizontalScrollContainer>', '</div>');
content = content.replace(`import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer';`, '');
fs.writeFileSync('src/components/crm/ManagerTasksCalendarView.tsx', content);
