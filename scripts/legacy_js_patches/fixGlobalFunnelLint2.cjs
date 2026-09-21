const fs = require('fs');
let content = fs.readFileSync('src/components/crm/CrmPanel.tsx', 'utf8');

content = content.replace(
  "  const { deals, addDeal, updateDeal, availableManagers, funnels } = useAppContext();",
  `  const { deals, addDeal, updateDeal, availableManagers, funnels } = useAppContext();
  
  const activeFunnels = useMemo(() => {
    if (!funnels || funnels.length === 0) return CRM_FUNNELS;
    const dynamic: any = { ...CRM_FUNNELS };
    funnels.forEach(f => {
      dynamic[f.id] = {
        ...dynamic[f.id],
        ...f,
        // Make sure stages is parsed if it's string (JSON) or use as is
        stages: typeof f.stages === 'string' ? JSON.parse(f.stages) : f.stages
      };
    });
    return dynamic as Record<'services' | 'equipment' | 'support', FunnelConfig>;
  }, [funnels]);
`
);

fs.writeFileSync('src/components/crm/CrmPanel.tsx', content);
console.log('Fixed activeFunnels reference');
