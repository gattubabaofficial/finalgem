const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = "https://uqmurvqfcqwfzkqyhsmy.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbXVydnFmY3F3ZnprcXloc215Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NDA4NywiZXhwIjoyMDg5MDYwMDg3fQ.u2c8mXyScDjAUmSn_YPqrIU8WlnntMoe55sXGN3qFhI";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  try {
    const { data, error } = await supabaseAdmin.from("lines_entries").select("*").limit(1);
    const result = { data, error };
    fs.writeFileSync('c:/Users/Dell/Desktop/new-pull-final/finalgem/result.json', JSON.stringify(result, null, 2));
    console.log("Wrote result.json");
  } catch (e) {
    fs.writeFileSync('c:/Users/Dell/Desktop/new-pull-final/finalgem/result.json', JSON.stringify({ exception: e.message }));
  }
}

test();
