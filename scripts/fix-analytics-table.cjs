const fs = require('fs');
let content = fs.readFileSync('src/components/crm/AnalyticsPipelineView.tsx', 'utf8');

if (!content.includes('HorizontalScrollContainer')) {
  content = `import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer';\n` + content;
  content = content.replace(/<div className="overflow-x-auto">\s*<table/g, '<HorizontalScrollContainer>\n              <table');
  content = content.replace(/<\/table>\s*<\/div>/g, '</table>\n            </HorizontalScrollContainer>');
  fs.writeFileSync('src/components/crm/AnalyticsPipelineView.tsx', content);
  console.log("Analytics table wrapped");
}
