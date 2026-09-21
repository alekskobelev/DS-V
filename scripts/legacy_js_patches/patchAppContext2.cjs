const fs = require('fs');
const file = 'src/context/AppContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const addCommercialProposal = (proposal: CommercialProposal) => setCommercialProposals(prev => [proposal, ...prev]);",
  "const addCommercialProposal = (proposal: CommercialProposal) => { apiService.saveCrmProposal(proposal); setCommercialProposals(prev => [proposal, ...prev]); };"
);

content = content.replace(
  "const updateCommercialProposal = (id: string, updates: Partial<CommercialProposal>) => setCommercialProposals(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));",
  "const updateCommercialProposal = (id: string, updates: Partial<CommercialProposal>) => { apiService.updateCrmProposal(id, updates); setCommercialProposals(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); };"
);

content = content.replace(
  "const deleteCommercialProposal = (id: string) => setCommercialProposals(prev => prev.filter(p => p.id !== id));",
  "const deleteCommercialProposal = (id: string) => { apiService.deleteCrmProposal(id); setCommercialProposals(prev => prev.filter(p => p.id !== id)); };"
);

content = content.replace(
  "const addDeal = (deal: ExtendedDeal) => setDeals(prev => [deal, ...prev]);",
  "const addDeal = (deal: ExtendedDeal) => { apiService.saveCrmDeal(deal); setDeals(prev => [deal, ...prev]); };"
);

content = content.replace(
  "const updateDeal = (id: string, updates: Partial<ExtendedDeal>) => setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));",
  "const updateDeal = (id: string, updates: Partial<ExtendedDeal>) => { apiService.updateCrmDeal(id, updates); setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d)); };"
);

content = content.replace(
  "const deleteDeal = (id: string) => setDeals(prev => prev.filter(d => d.id !== id));",
  "const deleteDeal = (id: string) => { apiService.deleteCrmDeal(id); setDeals(prev => prev.filter(d => d.id !== id)); };"
);

content = content.replace(
  "const addContract = (contract: ProjectContract) => setContracts(prev => [contract, ...prev]);",
  "const addContract = (contract: ProjectContract) => { apiService.saveCrmContract(contract); setContracts(prev => [contract, ...prev]); };"
);

content = content.replace(
  "const updateContract = (id: string, updates: Partial<ProjectContract>) => setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));",
  "const updateContract = (id: string, updates: Partial<ProjectContract>) => { apiService.updateCrmContract(id, updates); setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)); };"
);

content = content.replace(
  "const deleteContract = (id: string) => setContracts(prev => prev.filter(c => c.id !== id));",
  "const deleteContract = (id: string) => { apiService.deleteCrmContract(id); setContracts(prev => prev.filter(c => c.id !== id)); };"
);

// Certificates functions might not exist in AppContext yet. Let's see.
fs.writeFileSync(file, content);
