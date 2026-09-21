const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// Ensure B2B tickets GET uses Drizzle (from previous fix)
// We already replaced it but let's make sure there are no other leftovers in memory.
// I will just check if b2bTickets array is still there and remove it if it exists.
server = server.replace(/let b2bTickets: B2BTicket\[\] = \[[\s\S]*?\];/g, '');

fs.writeFileSync('server.ts', server);
console.log('Cleaned up old B2B in-memory array');
