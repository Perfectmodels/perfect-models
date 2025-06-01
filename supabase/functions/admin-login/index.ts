
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { username, password } = await req.json();

    console.log('Login attempt for username:', username);

    // Query the admin_users table
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, username, password_hash')
      .eq('username', username)
      .single();

    if (error || !adminUser) {
      console.log('Admin user not found:', error);
      return new Response(
        JSON.stringify({ error: 'Identifiants incorrects' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, use simple password comparison (in production, use proper hashing)
    // Check if password matches (assuming stored password is hashed with crypt)
    const { data: passwordMatch } = await supabase
      .rpc('verify_admin_login', {
        input_username: username,
        input_password: password
      });

    if (!passwordMatch || passwordMatch.length === 0) {
      console.log('Password verification failed');
      return new Response(
        JSON.stringify({ error: 'Identifiants incorrects' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Login successful for user:', adminUser.username);

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    return new Response(
      JSON.stringify({ 
        id: adminUser.id, 
        username: adminUser.username 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
