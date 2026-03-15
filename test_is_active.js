const axios = require('axios');

const BASE_URL = 'https://radar-ufvb.onrender.com';

async function testEndpoints() {
  const urls = [
    '/event/all/',
    '/event/?include_inactive=true',
    '/event/?status=all',
    '/api/admin/events/?is_active=false',
    '/api/admin/events/?isactive=false'
  ];

  for (const url of urls) {
    console.log(`Testing ${url}...`);
    try {
      const res = await axios.get(BASE_URL + url);
      const data = Array.isArray(res.data) ? res.data : (res.data.events || res.data.data || []);
      console.log(`  Count: ${data.length}`);
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }
}

testEndpoints();
