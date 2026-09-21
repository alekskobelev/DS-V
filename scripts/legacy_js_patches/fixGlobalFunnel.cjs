const fs = require('fs');
let content = fs.readFileSync('src/components/crm/CrmPanel.tsx', 'utf8');

content = content.replace(
  "const DYNAMIC_CRM_FUNNELS: Record<'services' | 'equipment' | 'support', FunnelConfig> =",
  "const CRM_FUNNELS: Record<'services' | 'equipment' | 'support', FunnelConfig> ="
);

content = content.replace(
  "const dynamic: any = { ...DYNAMIC_CRM_FUNNELS };",
  "const dynamic: any = { ...CRM_FUNNELS };"
);

content = content.replace(
  "if (!funnels || funnels.length === 0) return DYNAMIC_CRM_FUNNELS;",
  "if (!funnels || funnels.length === 0) return CRM_FUNNELS;"
);

fs.writeFileSync('src/components/crm/CrmPanel.tsx', content);
console.log('Fixed CRM_FUNNELS const');
