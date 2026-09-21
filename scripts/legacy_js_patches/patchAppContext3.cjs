const fs = require('fs');
const file = 'src/context/AppContext.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace tickets init
content = content.replace(/const \[supportTickets, setSupportTickets\] = useState<SupportTicketItem\[\]>\(\(\) => \{[\s\S]*?\}\);/m, 
`const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([]);
  useEffect(() => {
    apiService.getCrmTickets().then(res => {
      if (res.success && res.data) {
        setSupportTickets(res.data);
      }
    });
  }, []);
`);

// Replace tickets local storage effect
content = content.replace(/localStorage\.setItem\('ds_account_tickets_v2'.*/g, '// no-op');

// Add to tickets methods
content = content.replace(/const addSupportTicket = \(ticket: SupportTicketItem\) => setSupportTickets\(prev => \[ticket, \.\.\.prev\]\);/,
"const addSupportTicket = (ticket: SupportTicketItem) => { apiService.saveCrmTicket(ticket); setSupportTickets(prev => [ticket, ...prev]); };");
content = content.replace(/const updateSupportTicket = \(id: string, updates: Partial<SupportTicketItem>\) => setSupportTickets\(prev => prev.map\(t => t.id === id \? \{ \.\.\.t, \.\.\.updates \} : t\)\);/,
"const updateSupportTicket = (id: string, updates: Partial<SupportTicketItem>) => { apiService.updateCrmTicket(id, updates); setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t)); };");
content = content.replace(/const deleteSupportTicket = \(id: string\) => setSupportTickets\(prev => prev.filter\(t => t.id !== id\)\);/,
"const deleteSupportTicket = (id: string) => { apiService.deleteCrmTicket(id); setSupportTickets(prev => prev.filter(t => t.id !== id)); };");


// Replace licenses init
content = content.replace(/const \[licenses, setLicenses\] = useState<LicenseItem\[\]>\(\(\) => \{[\s\S]*?\}\);/m, 
`const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  useEffect(() => {
    apiService.getCrmLicenses().then(res => {
      if (res.success && res.data) {
        setLicenses(res.data);
      }
    });
  }, []);
`);

// Replace licenses local storage effect
content = content.replace(/localStorage\.setItem\('ds_account_licenses_v2'.*/g, '// no-op');

// Add to licenses methods
content = content.replace(/const addLicense = \(license: LicenseItem\) => setLicenses\(prev => \[license, \.\.\.prev\]\);/,
"const addLicense = (license: LicenseItem) => { apiService.saveCrmLicense(license); setLicenses(prev => [license, ...prev]); };");
content = content.replace(/const updateLicense = \(id: string, updates: Partial<LicenseItem>\) => setLicenses\(prev => prev.map\(l => l.id === id \? \{ \.\.\.l, \.\.\.updates \} : l\)\);/,
"const updateLicense = (id: string, updates: Partial<LicenseItem>) => { apiService.updateCrmLicense(id, updates); setLicenses(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l)); };");
content = content.replace(/const deleteLicense = \(id: string\) => setLicenses\(prev => prev.filter\(l => l.id !== id\)\);/,
"const deleteLicense = (id: string) => { apiService.deleteCrmLicense(id); setLicenses(prev => prev.filter(l => l.id !== id)); };");


fs.writeFileSync(file, content);
console.log('Successfully patched AppContext.tsx');
