const fs = require('fs');

const registries = [
  'src/components/crm/ProposalsRegistry.tsx',
  'src/components/crm/CertificatesRegistry.tsx',
  'src/components/crm/ContractsRegistry.tsx',
  'src/components/crm/ManagerTasksCalendarView.tsx'
];

registries.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (!content.includes('HorizontalScrollContainer')) {
      // Add import
      const importStmt = `import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer';\n`;
      content = content.replace(/(import React[^;]+;)/, `$1\n${importStmt}`);
      
      // Replace <div className="overflow-x-auto"> with <HorizontalScrollContainer>
      // We need to be careful not to replace small overflow-x-auto used for tags/filters.
      // Usually the main table wrapper is `<div className="overflow-x-auto">` followed by `<table` or similar block.
      // We will do a generic replacement if it wraps a table, or specifically target the main ones.

      // In Proposals, Certificates, Contracts it's typically:
      // <div className="overflow-x-auto">\n          <table
      
      content = content.replace(/<div className="overflow-x-auto">\s*<table/g, '<HorizontalScrollContainer>\n          <table');
      content = content.replace(/<\/table>\s*<\/div>/g, '</table>\n        </HorizontalScrollContainer>');
      
      // For ManagerTasksCalendarView, it might be a grid or div
      if (file.includes('ManagerTasksCalendarView')) {
         // Let's check how it's structured
         content = content.replace(/<div className="overflow-x-auto pb-4">\s*<div className="min-w-\[800px\]/g, '<HorizontalScrollContainer className="pb-4">\n          <div className="min-w-[800px]');
         content = content.replace(/<\/div>\s*<\/div>\s*\{\/\* Calendar Layout/g, '</div>\n        </HorizontalScrollContainer>\n      {/* Calendar Layout'); // Needs care
      }
      
      fs.writeFileSync(file, content);
      console.log(`Updated ${file}`);
    }
  }
});
