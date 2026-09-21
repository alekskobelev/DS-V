const http = require('http');

async function testCrm() {
  const baseUrl = 'http://127.0.0.1:3000';
  let res = await fetch(baseUrl + '/api/service-requests');
  let data = await res.json();
  const id = data.data[0].id;
  let patchRes = await fetch(baseUrl + '/api/service-requests/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'completed' })
  });
  let patchData = await patchRes.json();
  console.log('Patch response:', patchData);
}
testCrm();
