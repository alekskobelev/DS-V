const fs = require('fs');
const file = 'src/context/AppContext.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace ds_auth_users_v3 local storage init
content = content.replace(/const \[authUsers, setAuthUsers\] = useState<AuthAccount\[\]>\(\(\) => \{[\s\S]*?\}\);/m, 
`const [authUsers, setAuthUsers] = useState<AuthAccount[]>([]);

  useEffect(() => {
    apiService.getUsers().then(res => {
      if (res.success && res.data) {
        setAuthUsers(res.data);
      }
    });
  }, []);
`);

content = content.replace(/localStorage\.setItem\('ds_auth_users_v3'.*/g, '// no-op');

// Deals
content = content.replace(/const \[deals, setDeals\] = useState<ExtendedDeal\[\]>\(\(\) => \{[\s\S]*?\}\);/m,
`const [deals, setDeals] = useState<ExtendedDeal[]>([]);
  useEffect(() => {
    apiService.getCrmDeals().then(res => {
      if (res.success && res.data) {
        setDeals(res.data);
      }
    });
  }, []);
`);

content = content.replace(/localStorage\.setItem\('ds_crm_deals_v2'.*/g, '// no-op');

// Proposals
content = content.replace(/const \[commercialProposals, setCommercialProposals\] = useState<CommercialProposal\[\]>\(\(\) => \{[\s\S]*?\}\);/m,
`const [commercialProposals, setCommercialProposals] = useState<CommercialProposal[]>([]);
  useEffect(() => {
    apiService.getCrmProposals().then(res => {
      if (res.success && res.data) {
        setCommercialProposals(res.data);
      }
    });
  }, []);
`);

content = content.replace(/localStorage\.setItem\('ds_crm_proposals_v2'.*/g, '// no-op');

// Contracts
content = content.replace(/const \[contracts, setContracts\] = useState<ProjectContract\[\]>\(\(\) => \{[\s\S]*?\}\);/m,
`const [contracts, setContracts] = useState<ProjectContract[]>([]);
  useEffect(() => {
    apiService.getCrmContracts().then(res => {
      if (res.success && res.data) {
        setContracts(res.data);
      }
    });
  }, []);
`);

content = content.replace(/localStorage\.setItem\('ds_account_contracts_v2'.*/g, '// no-op');

// Certificates
content = content.replace(/const \[certificates, setCertificates\] = useState<TrainingCertificate\[\]>\(\[[\s\S]*?\]\);/m,
`const [certificates, setCertificates] = useState<TrainingCertificate[]>([]);
  useEffect(() => {
    apiService.getCrmCertificates().then(res => {
      if (res.success && res.data) {
        setCertificates(res.data);
      }
    });
  }, []);
`);

// API interceptors for deals, proposals, contracts, certificates

content = content.replace(/const addCommercialProposal = \(proposal: CommercialProposal\) => \{/, 
`const addCommercialProposal = (proposal: CommercialProposal) => {
    apiService.saveCrmProposal(proposal);`);
    
content = content.replace(/const updateCommercialProposal = \(id: string, updates: Partial<CommercialProposal>\) => \{/,
`const updateCommercialProposal = (id: string, updates: Partial<CommercialProposal>) => {
    apiService.updateCrmProposal(id, updates);`);
    
content = content.replace(/const deleteCommercialProposal = \(id: string\) => \{/,
`const deleteCommercialProposal = (id: string) => {
    apiService.deleteCrmProposal(id);`);


content = content.replace(/const addDeal = \(deal: ExtendedDeal\) => \{/,
`const addDeal = (deal: ExtendedDeal) => {
    apiService.saveCrmDeal(deal);`);
    
content = content.replace(/const updateDeal = \(id: string, updates: Partial<ExtendedDeal>\) => \{/,
`const updateDeal = (id: string, updates: Partial<ExtendedDeal>) => {
    apiService.updateCrmDeal(id, updates);`);

content = content.replace(/const deleteDeal = \(id: string\) => \{/,
`const deleteDeal = (id: string) => {
    apiService.deleteCrmDeal(id);`);

    
content = content.replace(/const addContract = \(contract: ProjectContract\) => \{/,
`const addContract = (contract: ProjectContract) => {
    apiService.saveCrmContract(contract);`);
    
content = content.replace(/const updateContract = \(id: string, updates: Partial<ProjectContract>\) => \{/,
`const updateContract = (id: string, updates: Partial<ProjectContract>) => {
    apiService.updateCrmContract(id, updates);`);

content = content.replace(/const deleteContract = \(id: string\) => \{/,
`const deleteContract = (id: string) => {
    apiService.deleteCrmContract(id);`);

fs.writeFileSync(file, content);
console.log('Successfully patched AppContext.tsx');
