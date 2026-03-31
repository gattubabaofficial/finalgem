const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);
const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllPossibleTables() {
  const tables = [
    'users', 'organizations', 'lots', 'products', 
    'manufacturing', 'stock_ledgers', 'sales', 'purchases', 
    'rejections', 'inventory'
  ];
  console.log("Checking tables...");
  for (const t of tables) {
    const { error: e } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (e) {
      console.log(`Table ${t}: MISSING or ERROR (${e.code}: ${e.message})`);
    } else {
      console.log(`Table ${t}: EXISTS`);
    }
  }
}
checkAllPossibleTables();
