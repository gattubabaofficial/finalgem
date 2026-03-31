const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);
const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'users' });
  // Since I don't have get_table_info RPC, I'll just try to insert a dummy user with null org_id
  const { error: insertError } = await supabase.from('users').insert({
    name: 'Schema Test',
    email: 'test' + Math.random() + '@example.com',
    password: 'password',
    role: 'STAFF',
    organization_id: null
  });
  if (insertError) {
    console.log("Insert failed for null organization_id:", insertError.message);
  } else {
    console.log("Insert succeeded for null organization_id (no NOT NULL constraint)");
  }
}
checkSchema();
