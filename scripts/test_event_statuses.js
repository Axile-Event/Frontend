const axios = require('axios');

const BASE_URL = 'https://radar-ufvb.onrender.com';

async function checkEventStatuses() {
  try {
    console.log("Fetching all public events from /event/...");
    const eventsRes = await axios.get(`${BASE_URL}/event/`);
    
    // The public endpoint might wrap the array in an object or return it directly
    const events = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data.events || eventsRes.data.data || []);
    
    console.log(`Found ${events.length} events. Fetching details for each to get their status...\n`);

    for (const event of events) {
      if (!event.event_id) continue;
      
      try {
        const detailRes = await axios.get(`${BASE_URL}/events/${event.event_id}/details/`);
        const status = detailRes.data?.data?.status || detailRes.data?.status || 'No status found';
        console.log(`- ${event.event_name || event.name} [ID: ${event.event_id}] -> Status: ${status}`);
      } catch (err) {
        console.log(`- ${event.event_name || event.name} [ID: ${event.event_id}] -> Error fetching details: ${err.message}`);
      }
    }
    
    console.log("\nNote: According to the API Docs, available event statuses are: pending, verified, rejected, cancelled.");
    
  } catch (error) {
    console.error("Error fetching events:", error.message);
  }
}

checkEventStatuses();
