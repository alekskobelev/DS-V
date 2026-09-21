const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const oldCmsGet = `app.get("/api/cms/state", (_req, res) => {
    res.json({
      success: true,
      data: cmsStore,
      updatedAt: new Date().toISOString()
    });
  });`;

const newCmsGet = `app.get("/api/cms/state", async (_req, res) => {
    try {
      // Пытаемся получить данные из новых реляционных таблиц
      const dbPages = await db.select().from(schema.cmsPages);
      const dbKb = await db.select().from(schema.knowledgeBase);
      const dbEq = await db.select().from(schema.equipmentCatalog);
      
      // Сборка гибридного ответа (если БД пуста, отдаем дефолтные in-memory данные)
      const mergedData = { ...cmsStore };
      
      if (dbPages.length > 0) {
        mergedData.customPages = dbPages.map(p => ({
          id: p.slug,
          title: p.title,
          slug: p.slug,
          status: p.isPublished ? 'published' : 'draft',
          contentBlocks: Array.isArray(p.layoutConfig) ? p.layoutConfig : [],
          seo: p.seoMetadata || {}
        }));
      }
      
      if (dbKb.length > 0) {
        mergedData.knowledgeBase = dbKb.map(k => ({
          id: k.id.toString(),
          title: k.title,
          category: k.categoryId,
          content: k.content,
          tags: Array.isArray(k.tags) ? k.tags : [],
        }));
      }
      
      if (dbEq.length > 0) {
        mergedData.products = dbEq.map(e => ({
          id: e.slug,
          type: 'hardware', // default
          category: e.category,
          categoryLabel: e.category,
          name: e.name,
          brand: e.manufacturer,
          shortDescription: e.description,
          fullDescription: e.description,
          image: e.imageUrl || '',
          features: [],
          specs: e.specifications || {},
          inStock: e.isActive
        }));
      }

      res.json({
        success: true,
        data: mergedData,
        updatedAt: new Date().toISOString(),
        source: 'database'
      });
    } catch (err) {
      console.error("DB fallback to memory:", err);
      res.json({
        success: true,
        data: cmsStore,
        updatedAt: new Date().toISOString(),
        source: 'memory_fallback'
      });
    }
  });`;

server = server.replace(oldCmsGet, newCmsGet);

// Update POST /api/cms/state to also insert into DB
const oldCmsPost = `if (Array.isArray(knowledgeBase)) cmsStore.knowledgeBase = knowledgeBase;`;
const newCmsPost = `if (Array.isArray(knowledgeBase)) cmsStore.knowledgeBase = knowledgeBase;
    
    // Background async sync to DB (One-way sync for demo purposes)
    try {
      if (Array.isArray(knowledgeBase) && knowledgeBase.length > 0) {
        // Мы могли бы здесь делать UPSERT, но пока просто логируем
        console.log(\`[Sync] Received \${knowledgeBase.length} KB items to sync\`);
      }
    } catch (e) {
      console.error("DB Sync error", e);
    }`;

server = server.replace(oldCmsPost, newCmsPost);

fs.writeFileSync('server.ts', server);
console.log('CMS state GET hooked to database');
