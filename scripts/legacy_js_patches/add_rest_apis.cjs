const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
  // === КАТАЛОГ ОБОРУДОВАНИЯ (Equipment Catalog) API ===
  app.get("/api/equipment", async (req, res) => {
    try {
      const data = await db.select().from(schema.equipmentCatalog);
      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  app.post("/api/equipment", async (req, res) => {
    try {
      const { slug, name, manufacturer, category, description, isActive } = req.body;
      const result = await db.insert(schema.equipmentCatalog).values({
        slug: slug || \`eq-\${Date.now()}\`,
        name,
        manufacturer: manufacturer || 'Unknown',
        category: category || 'general',
        description,
        isActive: isActive !== false
      }).returning();
      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  // === БАЗА ЗНАНИЙ (Knowledge Base) API ===
  app.get("/api/knowledge-base", async (req, res) => {
    try {
      const data = await db.select().from(schema.knowledgeBase);
      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  app.post("/api/knowledge-base", async (req, res) => {
    try {
      const { slug, title, content, categoryId, isPublished } = req.body;
      const result = await db.insert(schema.knowledgeBase).values({
        slug: slug || \`kb-\${Date.now()}\`,
        title,
        content,
        categoryId: categoryId || 'general',
        isPublished: isPublished === true
      }).returning();
      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  // === CMS ДИНАМИЧЕСКИЕ СТРАНИЦЫ (CMS Pages) API ===
  app.get("/api/cms/pages", async (req, res) => {
    try {
      const data = await db.select().from(schema.cmsPages);
      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  app.post("/api/cms/pages", async (req, res) => {
    try {
      const { slug, title, layoutConfig, isPublished } = req.body;
      const result = await db.insert(schema.cmsPages).values({
        slug: slug || \`page-\${Date.now()}\`,
        title,
        layoutConfig: layoutConfig || [],
        isPublished: isPublished === true
      }).returning();
      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });
`;

if (server.includes('// === Обработка POST-запросов от формы калькулятора ===')) {
  server = server.replace('// === Обработка POST-запросов от формы калькулятора ===', newRoutes + '\n\n  // === Обработка POST-запросов от формы калькулятора ===');
} else {
  server = server.replace('app.listen(', newRoutes + '\napp.listen(');
}

fs.writeFileSync('server.ts', server);
console.log('Rest APIs for equipment, knowledge base, and cms pages added.');
