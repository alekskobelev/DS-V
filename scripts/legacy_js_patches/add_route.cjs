const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const newRoute = `
// === Обработка POST-запросов от формы калькулятора ===
app.post("/api/service-requests", async (req, res) => {
  try {
    const {
      customerName,
      companyName,
      email,
      phone,
      serviceType,
      details,
      estimatedPrice,
      cadFormat,
      metadata,
      userId
    } = req.body;

    // 1. Базовая валидация
    if (!customerName || !email || !phone || !serviceType) {
      return res.status(400).json({ 
        success: false, 
        error: "Обязательные поля (Имя, Email, Телефон, Тип услуги) не заполнены." 
      });
    }

    // 2. Генерация читаемого ID (RFQ-ГОД-НОМЕР)
    const requestId = \`RFQ-\${new Date().getFullYear()}-\${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}\`;

    // 3. Сохранение данных в PostgreSQL через Drizzle ORM
    const result = await db.insert(schema.serviceRequests).values({
      id: requestId,
      userId: userId || null, // Если пользователь авторизован
      customerName,
      companyName,
      email,
      phone,
      serviceType,
      details,
      estimatedPrice,
      cadFormat,
      metadata: metadata || {},
      status: 'pending'
    }).returning();

    // 4. Успешный ответ
    return res.status(201).json({ 
      success: true, 
      message: "Заявка успешно зарегистрирована", 
      data: result[0] 
    });

  } catch (error) {
    console.error("Ошибка при сохранении заявки:", error);
    return res.status(500).json({ success: false, error: "Ошибка базы данных" });
  }
});
`;

// Insert before the generic catch-all route or at the end of API routes
if (server.includes('// Vite middleware')) {
  server = server.replace('// Vite middleware', newRoute + '\n  // Vite middleware');
} else {
  server = server.replace('app.listen(', newRoute + '\napp.listen(');
}

fs.writeFileSync('server.ts', server);
console.log('Route added');
