const fs = require('fs');
const file = 'src/server/crmModule.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { \n  CrmCompany,", "import { \n  ExtendedDeal,\n  CommercialProposal,\n  ProjectContract,\n  TrainingCertificate,\n  CrmCompany,");

const mockDataImport = `import {
  INITIAL_CRM_DEALS,
  INITIAL_PROPOSALS,
  INITIAL_CONTRACTS
} from '../data/mockCrmData.ts';
`;
content = content.replace("import { \n  INITIAL_CRM_COMPANIES", mockDataImport + "\nimport { \n  INITIAL_CRM_COMPANIES");

fs.writeFileSync(file, content);
console.log('Fixed imports in crmModule.ts');
