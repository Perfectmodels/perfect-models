
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin session
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminId = authHeader.replace('Bearer ', '');

    // Verify admin exists
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', adminId)
      .single();

    if (adminError || !admin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { contentId } = await req.json();

    // Get content info first
    const { data: content, error: fetchError } = await supabase
      .from('classroom_content')
      .select('file_url')
      .eq('id', contentId)
      .single();

    if (fetchError || !content) {
      return new Response(
        JSON.stringify({ error: 'Content not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract file path from URL
    const url = new URL(content.file_url);
    const filePath = url.pathname.split('/').slice(-3).join('/'); // Get the last 3 parts of the path

    // Delete from database first
    const { error: deleteError } = await supabase
      .from('classroom_content')
      .delete()
      .eq('id', contentId);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('classroom-content')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Don't fail the request if storage deletion fails
    }

    console.log('Content deleted successfully:', contentId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Delete error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
