const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

// Replace the RFQ and B2B logic
// RFQ GET
server = server.replace(
  'app.get("/api/calculator/rfq", (req, res) => {\n    res.json({ success: true, count: rfqSubmissions.length, data: rfqSubmissions });\n  });',
  `app.get("/api/calculator/rfq", async (req, res) => {
    try {
      const data = await db.select().from(schema.rfqSubmissions).orderBy(sql\`created_at DESC\`);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });`
);

// RFQ POST (complex logic inside, so we replace the whole block)
const rfqPostRegex = /app\.post\("\/api\/calculator\/rfq", \(req, res\) => \{[\s\S]*?rfqSubmissions\.unshift\(newRfq\);\s*return res\.status\(201\)\.json\(\{ success: true, message: "Заявка успешно зарегистрирована на сервере\.", data: newRfq \}\);\s*\}\);/;

server = server.replace(
  rfqPostRegex,
  `app.post("/api/calculator/rfq", async (req, res) => {
    const { customerName, companyName, email, phone, serviceType, details, estimatedPrice, cadFormat } = req.body;
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return res.status(400).json({ success: false, error: "Имя заказчика обязательно (не менее 2 символов)." });
    }
    if (!email || typeof email !== 'string' || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: "Некорректный email адрес." });
    }
    if (!phone || typeof phone !== 'string' || phone.replace(/\\D/g, '').length < 10) {
      return res.status(400).json({ success: false, error: "Некорректный номер телефона." });
    }
    
    const sanitizeInput = (str: string) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    
    const newRfqId = \`RFQ-\${new Date().getFullYear()}-\${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}\`;

    try {
      const result = await db.insert(schema.rfqSubmissions).values({
        id: newRfqId,
        customerName: sanitizeInput(customerName),
        companyName: companyName ? sanitizeInput(companyName) : 'Не указано',
        email: sanitizeInput(email),
        phone: sanitizeInput(phone),
        serviceType: serviceType ? sanitizeInput(serviceType) : 'engineering',
        details: details ? sanitizeInput(details) : '',
        estimatedPrice: typeof estimatedPrice === 'number' && estimatedPrice >= 0 ? estimatedPrice : null,
        cadFormat: cadFormat ? sanitizeInput(cadFormat) : null,
      }).returning();
      
      return res.status(201).json({ success: true, message: "Заявка успешно зарегистрирована на сервере.", data: result[0] });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: "Database error" });
    }
  });`
);

// B2B Tickets GET
const b2bGetRegex = /app\.get\("\/api\/b2b\/tickets", \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, count: filtered\.length, data: filtered \}\);\s*\}\);/;

server = server.replace(
  b2bGetRegex,
  `app.get("/api/b2b/tickets", async (req, res) => {
    try {
      let query = db.select().from(schema.tickets);
      
      const { organizationId, status } = req.query;
      const filters = [];
      if (organizationId && typeof organizationId === 'string') {
        filters.push(sql\`organization_id = \${organizationId}\`);
      }
      if (status && typeof status === 'string') {
        filters.push(sql\`status = \${status}\`);
      }
      
      if (filters.length > 0) {
        // @ts-ignore
        query = query.where(sql.join(filters, sql\` and \`));
      }
      
      const data = await query;
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });`
);

// B2B Tickets POST
const b2bPostRegex = /app\.post\("\/api\/b2b\/tickets", \(req, res\) => \{[\s\S]*?b2bTickets\.unshift\(newTicket\);\s*return res\.status\(201\)\.json\(\{ success: true, message: "Сервисный тикет успешно создан\.", data: newTicket \}\);\s*\}\);/;

server = server.replace(
  b2bPostRegex,
  `app.post("/api/b2b/tickets", async (req, res) => {
    const { title, category, urgency, equipmentModel, equipmentSerial, description, organizationId, attachments } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      return res.status(400).json({ success: false, error: "Тема обращения обязательна (не менее 5 символов)." });
    }
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return res.status(400).json({ success: false, error: "Описание заявки обязательно (не менее 10 символов)." });
    }

    const newTicketId = \`TCK-\${new Date().getFullYear()}-\${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}\`;

    try {
      const result = await db.insert(schema.tickets).values({
        id: newTicketId,
        organizationId: organizationId || 'ORG-DEFAULT',
        title: title.trim(),
        category: category || 'consulting',
        status: 'new',
        urgency: urgency || 'medium',
        equipmentModel: equipmentModel ? equipmentModel.trim() : null,
        equipmentSerial: equipmentSerial ? equipmentSerial.trim() : null,
        description: description.trim(),
        attachments: Array.isArray(attachments) ? attachments : [],
      }).returning();
      
      return res.status(201).json({ success: true, message: "Сервисный тикет успешно создан.", data: result[0] });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: "Database error" });
    }
  });`
);

// We need to import schema if not imported, but wait, db is imported as "import { db } from './src/db/index.ts';".
// We need "import * as schema from './src/db/schema.ts';"
if (!server.includes("import * as schema")) {
  server = server.replace(
    "import { db }",
    "import * as schema from './src/db/schema.ts';\nimport { db }"
  );
}

fs.writeFileSync('server.ts', server);
console.log('server.ts updated to use DB for RFQ and B2B');
