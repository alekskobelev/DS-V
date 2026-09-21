const fs = require('fs');

const filesToFix = [
  'src/components/modals/CompareDrawer.tsx',
  'src/pages/SoftwarePage.tsx',
  'src/pages/HardwarePage.tsx',
  'src/pages/AboutPage.tsx',
  'src/pages/ServicesPage.tsx'
];

// In these files, we look for `.features.map` and replace it with a check

