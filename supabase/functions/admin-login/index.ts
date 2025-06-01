
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

    // First, try to verify admin credentials directly with the database
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, username, password_hash')
      .eq('username', username)
      .single();

    if (error || !adminUser) {
      console.log('Admin user not found:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify password using the crypt function
    const { data: passwordCheck, error: passwordError } = await supabase
      .rpc('verify_password', {
        stored_hash: adminUser.password_hash,
        input_password: password
      });

    if (passwordError) {
      console.error('Password verification error:', passwordError);
      
      // If the function doesn't exist, create it and retry
      const { error: createFunctionError } = await supabase.rpc('exec', {
        sql: `
          CREATE OR REPLACE FUNCTION verify_password(stored_hash TEXT, input_password TEXT)
          RETURNS BOOLEAN
          LANGUAGE sql
          SECURITY DEFINER
          AS $$
            SELECT stored_hash = crypt(input_password, stored_hash);
          $$;
        `
      });

      if (!createFunctionError) {
        const { data: retryPasswordCheck } = await supabase
          .rpc('verify_password', {
            stored_hash: adminUser.password_hash,
            input_password: password
          });

        if (!retryPasswordCheck) {
          return new Response(
            JSON.stringify({ error: 'Invalid credentials' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Authentication system error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (!passwordCheck) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
