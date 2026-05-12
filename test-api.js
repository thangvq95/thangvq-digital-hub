const API_URL = 'http://localhost:3005';
async function test() {
  const res = await fetch(`${API_URL}/api/repos?tab=all`);
  const data = await res.json();
  console.log(data);
}
test();
