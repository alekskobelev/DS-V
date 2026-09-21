const fs = require('fs');

// 1. apiService
let apiContent = fs.readFileSync('src/services/apiService.ts', 'utf8');
apiContent = apiContent.replace(
  '  async getCrmDeals(): Promise<{ success: boolean; data: any[] }> {',
  `  async getCrmFunnels(): Promise<{ success: boolean; data: any[] }> {
    try {
      const res = await fetch('/api/crm/funnels');
      return await res.json();
    } catch (e) {
      console.error('Failed to get funnels', e);
      return { success: false, data: [] };
    }
  }

  async saveCrmFunnel(funnel: any): Promise<{ success: boolean }> {
    try {
      const res = await fetch('/api/crm/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(funnel)
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to save funnel', e);
      return { success: false };
    }
  }

  async getCrmDeals(): Promise<{ success: boolean; data: any[] }> {`
);
fs.writeFileSync('src/services/apiService.ts', apiContent);

// 2. AppContext
let appContent = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Add types and states
appContent = appContent.replace(
  '  deals: ExtendedDeal[];',
  `  funnels: any[];
  setFunnels: React.Dispatch<React.SetStateAction<any[]>>;
  deals: ExtendedDeal[];`
);

appContent = appContent.replace(
  '  const [deals, setDeals] = useState<ExtendedDeal[]>([]);',
  `  const [funnels, setFunnels] = useState<any[]>([]);
  useEffect(() => {
    apiService.getCrmFunnels().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        setFunnels(res.data);
      }
    });
  }, []);

  const [deals, setDeals] = useState<ExtendedDeal[]>([]);`
);

appContent = appContent.replace(
  '        deals,',
  `        funnels,
        setFunnels,
        deals,`
);

fs.writeFileSync('src/context/AppContext.tsx', appContent);

console.log('Updated frontend for funnels');
