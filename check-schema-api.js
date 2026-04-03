const supabaseUrl = "https://uqmurvqfcqwfzkqyhsmy.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbXVydnFmY3F3ZnprcXloc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODQwODcsImV4cCI6MjA4OTA2MDA4N30.SaQSSIbu296JDtPmwgx8bzX30u5kbh8YD1vjKHo4pQg";

async function check() {
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${anonKey}`);
  const data = await res.json();
  const defs = data.definitions || data.components?.schemas || {};
  console.log("Tables available:", Object.keys(defs));
}
check();
