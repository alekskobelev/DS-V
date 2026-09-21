const fs = require('fs');

let content = fs.readFileSync('src/components/crm/CrmPanel.tsx', 'utf8');

// I put activeFunnels at the top level of the component CrmPanel, but inside there are sub-components like FunnelBoard, FunnelList, NewDealModal that are inside the same file but outside CrmPanel? 
// Let's check if CrmPanel.tsx exports multiple components.
