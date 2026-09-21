const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('app.use("/api/docs"')) {
  const docsCode = `
  // --- SERVE DOCS ENDPOINT ---
  app.use('/api/docs', express.static(path.join(process.cwd(), 'docs')));
  // -------------------------
`;

  code = code.replace(
    '// --- VITE MIDDLEWARE SETUP ---',
    docsCode + '\n// --- VITE MIDDLEWARE SETUP ---'
  );

  fs.writeFileSync('server.ts', code);
  console.log('Added /api/docs endpoint');
} else {
  console.log('Docs endpoint already exists');
}
