const http = require('http');

async function testCrm() {
  console.log('--- ТЕСТИРОВАНИЕ CRM API ---');
  const baseUrl = 'http://127.0.0.1:3000';

  try {
    let res = await fetch(baseUrl + '/api/service-requests');
    let data = await res.json();
    console.log('Всего входящих заявок (RFQs):', data.data.length);
    if (data.data.length > 0) {
      console.log('Первая заявка:', data.data[0].id, 'Статус:', data.data[0].status);
      
      // Patch status
      const id = data.data[0].id;
      let patchRes = await fetch(baseUrl + '/api/service-requests/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' })
      });
      let patchData = await patchRes.json();
      console.log('Обновленный статус:', patchData.data.status);
    }
  } catch(e) {
    console.error(e);
  }
}
testCrm();
