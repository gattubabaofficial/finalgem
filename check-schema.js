const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);
const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // Or just query a common table and see if it works
  if (error) {
    console.log("Error finding tables:", error);
    // Fallback: try querying specific common tables
    const tables = ['users', 'organizations', 'manufacturing_lots', 'inventory', 'sales', 'purchases'];
    for (const t of tables) {
      const { error: e } = await supabase.from(t).select('count', { count: 'exact', head: true });
      console.log(`Table ${t}: ${e ? "MISSING (" + e.code + ")" : "EXISTS"}`);
    }
  } else {
    console.log("Tables:", data);
  }
}
listTables();
