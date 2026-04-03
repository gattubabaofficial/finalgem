const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log("Connecting to Supabase...");
  const { data, error } = await supabaseAdmin.from("lines_entries").select("*").limit(1);
  if (error) {
    console.error("Error connecting to lines_entries:", error);
  } else {
    console.log("Success! Data:", data);
  }
}

test();
