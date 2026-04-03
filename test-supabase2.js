const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://uqmurvqfcqwfzkqyhsmy.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbXVydnFmY3F3ZnprcXloc215Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NDA4NywiZXhwIjoyMDg5MDYwMDg3fQ.u2c8mXyScDjAUmSn_YPqrIU8WlnntMoe55sXGN3qFhI";

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
