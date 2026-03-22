const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);

const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];

async function check() {
  const res = await fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

check();
