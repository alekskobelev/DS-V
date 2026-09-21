const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const stateBlock = `
  // Deals
  const [deals, setDeals] = useState<ExtendedDeal[]>(() => {
    try {
      const saved = localStorage.getItem('ds_crm_deals_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_CRM_DEALS;
    } catch {
      return INITIAL_CRM_DEALS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ds_crm_deals_v2', JSON.stringify(deals));
    } catch (e) {}
  }, [deals]);

  const addDeal = (deal: ExtendedDeal) => setDeals(prev => [deal, ...prev]);
  const updateDeal = (id: string, updates: Partial<ExtendedDeal>) => setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  const deleteDeal = (id: string) => setDeals(prev => prev.filter(d => d.id !== id));

  // Support Tickets
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>(() => {
    try {
      const saved = localStorage.getItem('ds_account_tickets_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_SUPPORT_TICKETS;
    } catch {
      return INITIAL_SUPPORT_TICKETS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ds_account_tickets_v2', JSON.stringify(supportTickets));
    } catch (e) {}
  }, [supportTickets]);

  const addSupportTicket = (ticket: SupportTicketItem) => setSupportTickets(prev => [ticket, ...prev]);
  const updateSupportTicket = (id: string, updates: Partial<SupportTicketItem>) => setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteSupportTicket = (id: string) => setSupportTickets(prev => prev.filter(t => t.id !== id));

  // Licenses
  const [licenses, setLicenses] = useState<LicenseItem[]>(() => {
    try {
      const saved = localStorage.getItem('ds_account_licenses_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_LICENSES;
    } catch {
      return INITIAL_LICENSES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ds_account_licenses_v2', JSON.stringify(licenses));
    } catch (e) {}
  }, [licenses]);

  const addLicense = (license: LicenseItem) => setLicenses(prev => [license, ...prev]);
  const updateLicense = (id: string, updates: Partial<LicenseItem>) => setLicenses(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  const deleteLicense = (id: string) => setLicenses(prev => prev.filter(l => l.id !== id));
`;

content = content.replace('  const [favorites, setFavorites]', stateBlock + '\n  const [favorites, setFavorites]');

const returnBlock = `
        commercialProposals,
        setCommercialProposals,
        addCommercialProposal,
        updateCommercialProposal,
        deleteCommercialProposal,
        deals,
        setDeals,
        addDeal,
        updateDeal,
        deleteDeal,
        supportTickets,
        setSupportTickets,
        addSupportTicket,
        updateSupportTicket,
        deleteSupportTicket,
        licenses,
        setLicenses,
        addLicense,
        updateLicense,
        deleteLicense,
`;

content = content.replace('        commercialProposals,\n        setCommercialProposals,\n        addCommercialProposal,\n        updateCommercialProposal,\n        deleteCommercialProposal,', returnBlock.trim());

fs.writeFileSync('src/context/AppContext.tsx', content);
