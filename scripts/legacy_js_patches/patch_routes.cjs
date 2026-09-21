const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const routes = `
  // === CRM & TICKETS ADMIN API ===
  app.get("/api/service-requests", async (req, res) => {
    try {
      const data = await db.select().from(schema.serviceRequests).orderBy(sql\`created_at DESC\`);
      res.json({ success: true, data });
    } catch (error) {
      console.error("GET /api/service-requests error:", error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  app.patch("/api/service-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await db.update(schema.serviceRequests)
        .set({ status, updatedAt: new Date() })
        .where(sql\`id = \${id}\`)
        .returning();
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error("PATCH /api/service-requests error:", error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  app.patch("/api/b2b/tickets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await db.update(schema.tickets)
        .set({ status, updatedAt: new Date() })
        .where(sql\`id = \${id}\`)
        .returning();
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error("PATCH /api/b2b/tickets error:", error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });
`;

server = server.replace('app.listen(', routes + '\napp.listen(');
fs.writeFileSync('server.ts', server);
console.log("Admin routes added!");
