const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

// Insert imports
server = server.replace(
  "import { createServer as createViteServer } from 'vite';",
  "import { createServer as createViteServer } from 'vite';\nimport { requireAuth, AuthRequest } from './src/middleware/auth.ts';\nimport { getOrCreateUser } from './src/db/users.ts';\nimport { db } from './src/db/index.ts';\nimport { tickets } from './src/db/schema.ts';"
);

// We can add a basic db check route
server = server.replace(
  "app.get(\"/api/health\", (_req, res) => {",
  `app.get("/api/db-health", async (_req, res) => {
    try {
      const result = await db.execute('SELECT 1');
      res.json({ db_connected: true });
    } catch(err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get("/api/health", (_req, res) => {`
);

fs.writeFileSync('server.ts', server);
console.log('server.ts updated');
