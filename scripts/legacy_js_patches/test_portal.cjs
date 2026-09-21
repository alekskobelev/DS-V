const http = require('http');

async function testPortal() {
  console.log('--- СТАРТ ТЕСТИРОВАНИЯ API ПОРТАЛА ---');
  const baseUrl = 'http://127.0.0.1:3000';

  try {
    // 1. RFQ Validation
    console.log('\n[1] Тест: Валидация калькулятора (Ожидаем ошибку 400 из-за нехватки данных)...');
    let res = await fetch(baseUrl + '/api/service-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: 'A' })
    });
    console.log('Статус:', res.status);
    let data = await res.json();
    console.log('Ответ:', data);

    // 2. RFQ Success
    console.log('\n[2] Тест: Успешная отправка заявки с калькулятора...');
    res = await fetch(baseUrl + '/api/service-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Иван Иванов',
        email: 'ivan@example.com',
        phone: '+79991234567',
        serviceType: '3d-scanning',
        details: 'Тестовая деталь для сканирования'
      })
    });
    console.log('Статус:', res.status);
    data = await res.json();
    console.log('Ответ:', data);

    // 3. KB Creation
    console.log('\n[3] Тест: Создание статьи в Базе Знаний...');
    res = await fetch(baseUrl + '/api/knowledge-base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Инструкция по калибровке лазера',
        content: 'Текст инструкции...',
        categoryId: 'Оборудование',
        isPublished: true
      })
    });
    console.log('Статус:', res.status);
    data = await res.json();
    console.log('Ответ:', data);

    // 4. CMS Sync
    console.log('\n[4] Тест: Получение агрегированного состояния CMS (Sync)...');
    res = await fetch(baseUrl + '/api/cms/state');
    console.log('Статус:', res.status);
    data = await res.json();
    console.log('Источник данных:', data.source);
    console.log('Количество статей в БД:', data.data?.knowledgeBase?.length);
    if (data.data?.knowledgeBase?.length > 0) {
      console.log('Название первой загруженной статьи:', data.data.knowledgeBase[0].title);
    }

    console.log('\n--- ТЕСТИРОВАНИЕ УСПЕШНО ЗАВЕРШЕНО ---');
  } catch (err) {
    console.error('Ошибка тестирования:', err);
  }
}

testPortal();
