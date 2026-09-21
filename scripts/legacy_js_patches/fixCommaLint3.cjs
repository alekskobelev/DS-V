const fs = require('fs');
let content = fs.readFileSync('src/components/crm/CrmPanel.tsx', 'utf8');

content = content.replace(
  "    setCommercialProposals: setProposals\\n    funnels,",
  "    setCommercialProposals: setProposals,\\n    funnels,"
);
content = content.replace(
  "    setCommercialProposals: setProposals\\r\\n    funnels,",
  "    setCommercialProposals: setProposals,\\r\\n    funnels,"
);
content = content.replace(
  "    setCommercialProposals: setProposals    funnels,",
  "    setCommercialProposals: setProposals,    funnels,"
);
fs.writeFileSync('src/components/crm/CrmPanel.tsx', content);
