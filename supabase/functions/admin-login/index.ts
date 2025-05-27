
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

    // Verify admin credentials using crypt function
    const { data: adminUser, error } = await supabase
      .rpc('verify_admin_login', {
        input_username: username,
        input_password: password
      });

    if (error) {
      console.error('Database error:', error);
      
      // Create the verification function if it doesn't exist
      const { error: createFunctionError } = await supabase.rpc('exec', {
        sql: `
          CREATE OR REPLACE FUNCTION verify_admin_login(input_username TEXT, input_password TEXT)
          RETURNS TABLE(id UUID, username TEXT)
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            RETURN QUERY
            SELECT au.id, au.username
            FROM admin_users au
            WHERE au.username = input_username
            AND au.password_hash = crypt(input_password, au.password_hash);
          END;
          $$;
        `
      });

      if (createFunctionError) {
        console.error('Failed to create function:', createFunctionError);
        return new Response(
          JSON.stringify({ error: 'Database configuration error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Retry the login
      const { data: retryAdminUser, error: retryError } = await supabase
        .rpc('verify_admin_login', {
          input_username: username,
          input_password: password
        });

      if (retryError || !retryAdminUser || retryAdminUser.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', retryAdminUser[0].id);

      return new Response(
        JSON.stringify({ 
          id: retryAdminUser[0].id, 
          username: retryAdminUser[0].username 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!adminUser || adminUser.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Login successful for user:', adminUser[0].username);

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser[0].id);

    return new Response(
      JSON.stringify({ 
        id: adminUser[0].id, 
        username: adminUser[0].username 
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
