const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);
const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];
const supabase = createClient(supabaseUrl, supabaseKey);

async function testManufacturingQuery() {
  const orgId = "69868b9f-3f92-411a-b03c-7c6d67b09876"; // Example from my previous check-debug.js
  const { data, error } = await supabase
    .from("manufacturing")
    .select("*, lot:lots(*, product:products(*))")
    .eq("organization_id", orgId);
    
  if (error) {
    console.log("MANUFACTURING QUERY FAILED:", error);
  } else {
    console.log("MANUFACTURING QUERY SUCCESS. Count:", data.length);
  }
}
testManufacturingQuery();
