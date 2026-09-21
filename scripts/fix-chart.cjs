const fs = require('fs');
let content = fs.readFileSync('src/components/crm/AnalyticsPipelineView.tsx', 'utf8');
content = content.replace('<div className="h-72 min-w-[600px] w-full">', '<div className="h-[350px] w-full">');
// Change angle from -25 to -35 to fit labels better
content = content.replace('angle={-25}', 'angle={-35}');
fs.writeFileSync('src/components/crm/AnalyticsPipelineView.tsx', content);
