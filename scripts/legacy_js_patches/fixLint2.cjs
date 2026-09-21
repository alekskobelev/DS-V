const fs = require('fs');
const file = 'src/server/crmModule.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("ExtendedDeal,", "");
content = content.replace("CommercialProposal,", "");
content = content.replace("ProjectContract,", "");
content = content.replace("TrainingCertificate,", "");

const mockDataImport = `import {
  INITIAL_CRM_DEALS,
  INITIAL_PROPOSALS,
  INITIAL_CONTRACTS,
  ExtendedDeal,
  CommercialProposal,
  ProjectContract,
  TrainingCertificate
} from '../data/mockCrmData.ts';
`;
content = content.replace(/import \{\s*INITIAL_CRM_DEALS,\s*INITIAL_PROPOSALS,\s*INITIAL_CONTRACTS\s*\} from '\.\.\/data\/mockCrmData\.ts';/, mockDataImport);

fs.writeFileSync(file, content);
