const fs = require('fs');
let content = fs.readFileSync('src/components/crm/CrmPanel.tsx', 'utf8');

content = content.replace(/DYNAMIC_CRM_FUNNELS/g, 'CRM_FUNNELS');

// Since there is a global CRM_FUNNELS, and inside the component we define a new one, we need to make sure we aren't redefining it. 
// Actually, earlier I had `const CRM_FUNNELS = useMemo(() => { ... ` inside the component, masking the global one.
// Let's rename the inner one to `activeFunnels` or something, and update usages inside the component.

content = content.replace(/const CRM_FUNNELS = useMemo/g, 'const activeFunnels = useMemo');
content = content.replace(
  `if (!funnels || funnels.length === 0) return CRM_FUNNELS;`,
  `if (!funnels || funnels.length === 0) return CRM_FUNNELS;` // keep this, referencing global
);

// We need to replace CRM_FUNNELS with activeFunnels ONLY INSIDE the component.
// The easiest way is to let the component use `activeFunnels` everywhere it used to use CRM_FUNNELS.

// First, revert back the CRM_FUNNELS that are inside the component render to activeFunnels.
content = content.replace(/CRM_FUNNELS\[activeFunnel\]/g, 'activeFunnels[activeFunnel]');
content = content.replace(/CRM_FUNNELS\[d\.funnel\]/g, 'activeFunnels[d.funnel]');
content = content.replace(/CRM_FUNNELS\[newDealForm\.funnel\]/g, 'activeFunnels[newDealForm.funnel]');
content = content.replace(/Object\.keys\(CRM_FUNNELS\)/g, 'Object.keys(activeFunnels)');
content = content.replace(/keyof typeof CRM_FUNNELS/g, 'keyof typeof activeFunnels');
content = content.replace(/CRM_FUNNELS\[key\]/g, 'activeFunnels[key as keyof typeof activeFunnels]');
content = content.replace(/CRM_FUNNELS\[selectedDeal\.funnel\]/g, 'activeFunnels[selectedDeal.funnel]');
content = content.replace(/funnelConfigs=\{CRM_FUNNELS\}/g, 'funnelConfigs={activeFunnels}');

fs.writeFileSync('src/components/crm/CrmPanel.tsx', content);
console.log('Fixed lint issue');
