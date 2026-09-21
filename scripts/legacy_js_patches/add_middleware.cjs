const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const oldValidation = `    // 1. Базовая валидация
    if (!customerName || !email || !phone || !serviceType) {
      return res.status(400).json({ 
        success: false, 
        error: "Обязательные поля (Имя, Email, Телефон, Тип услуги) не заполнены." 
      });
    }`;

server = server.replace(oldValidation, '');

const routeDef = 'app.post("/api/service-requests", async (req, res) => {';

const middlewareAndNewRoute = `// === Middleware валидации заявок калькулятора ===
const validateServiceRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { customerName, email, phone, serviceType } = req.body;
  
  if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
    res.status(400).json({ success: false, error: "Имя заказчика обязательно (не менее 2 символов)." });
    return;
  }
  if (!email || typeof email !== 'string' || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    res.status(400).json({ success: false, error: "Некорректный email адрес." });
    return;
  }
  if (!phone || typeof phone !== 'string' || phone.replace(/\\D/g, '').length < 10) {
    res.status(400).json({ success: false, error: "Некорректный номер телефона." });
    return;
  }
  if (!serviceType || typeof serviceType !== 'string') {
    res.status(400).json({ success: false, error: "Тип услуги обязателен." });
    return;
  }
  
  // Базовая санитизация строк (защита от XSS)
  req.body.customerName = customerName.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
  req.body.email = email.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
  req.body.phone = phone.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
  req.body.serviceType = serviceType.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
  
  next();
};

app.post("/api/service-requests", validateServiceRequest, async (req, res) => {`;

server = server.replace(routeDef, middlewareAndNewRoute);

fs.writeFileSync('server.ts', server);
console.log('Middleware added successfully');
