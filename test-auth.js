// register-login-test.js
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uqmurvqfcqwfzkqyhsmy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbXVydnFmY3F3ZnprcXloc215Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NDA4NywiZXhwIjoyMDg5MDYwMDg3fQ.u2c8mXyScDjAUmSn_YPqrIU8WlnntMoe55sXGN3qFhI';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  const normalizedEmail = "testlogin@test.com";

  // Login simulation exactly as auth.ts does
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, name, email, password, role, organization_id, is_verified")
    .eq("email", normalizedEmail)
    .single();

  if (error) {
    console.log("Supabase error:", error);
    return;
  }
  
  if (!user) {
    console.log("No user found");
    return;
  }
  
  // password is 'password123'
  const isValid = await bcrypt.compare("password123", user.password);
  console.log("Is valid:", isValid);
  console.log("User verified:", user.is_verified);
}

testAuth();
