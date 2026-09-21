const fs = require('fs');
let content = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

content = content.replace(/const \[supportTickets, setSupportTickets\] = useState<SupportTicketItem\[\]>\(\(\) => {[\s\S]*?\}\);\n\n  const \[licenses, setLicenses\] = useState<LicenseItem\[\]>\(\(\) => {[\s\S]*?\}\);\n/, '');

content = content.replace(/  \/\/ Sync to localStorage\n  useEffect\(\(\) => {\n    try {\n      localStorage\.setItem\('ds_account_tickets_v2', JSON\.stringify\(supportTickets\)\);\n    } catch \(e\) \{\}\n  }, \[supportTickets\]\);\n\n  useEffect\(\(\) => {\n    try {\n      localStorage\.setItem\('ds_account_licenses_v2', JSON\.stringify\(licenses\)\);\n    } catch \(e\) \{\}\n  }, \[licenses\]\);\n/, '');

fs.writeFileSync('src/pages/AccountPage.tsx', content);
