const axios = require('axios');

const API_BASE_URL = "https://radar-ufvb.onrender.com";

async function testEndpoints() {
  const endpoints = [
    "/event/",
    "/events/",
    "/api/events/",
    "/event/?include_closed=true",
    "/event/?status=closed",
    "/event/?status=all"
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting: ${API_BASE_URL}${endpoint}`);
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      const events = Array.isArray(response.data) ? response.data : (response.data.events || []);
      console.log(`Success! Found ${events.length} events.`);
      if (events.length > 0) {
        const statuses = [...new Set(events.map(e => e.status || 'no status'))];
        console.log(`Statuses present: ${statuses.join(', ')}`);
        if (statuses.includes('closed')) {
            console.log('FOUND CLOSED EVENTS AT THIS ENDPOINT!');
        }
      }
    } catch (error) {
      console.log(`Failed: ${error.message} (${error.response?.status || 'no status code'})`);
    }
  }
}

testEndpoints();
