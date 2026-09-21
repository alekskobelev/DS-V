const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// RFQ GET
server = server.replace(
  'app.get("/api/rfq", (_req, res) => {\n    res.json({ success: true, count: rfqSubmissions.length, data: rfqSubmissions });\n  });',
  `app.get("/api/rfq", async (req, res) => {
    try {
      const data = await db.select().from(schema.rfqSubmissions).orderBy(sql\`created_at DESC\`);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });`
);

// RFQ POST
const rfqPostRegex = /app\.post\("\/api\/rfq", \(req, res\) => \{[\s\S]*?rfqSubmissions\.unshift\(newRfq\);\s*return res\.status\(201\)\.json\(\{ success: true, message: "Заявка успешно зарегистрирована на сервере\.", data: newRfq \}\);\s*\}\);/;

server = server.replace(
  rfqPostRegex,
  `app.post("/api/rfq", async (req, res) => {
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

fs.writeFileSync('server.ts', server);
console.log('Fixed RFQ endpoints');
