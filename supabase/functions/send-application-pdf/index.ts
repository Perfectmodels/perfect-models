
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@1.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Resend with the API key
const resendApiKey = Deno.env.get('RESEND_API_KEY');
console.log('RESEND_API_KEY available:', !!resendApiKey);

// Only initialize Resend if we have an API key
let resend;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
}

const agencyEmail = Deno.env.get('AGENCY_EMAIL') || 'Perfectmodels.ga@gmail.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if Resend is properly initialized
    if (!resendApiKey || !resend) {
      console.error('Resend API key is not configured');
      throw new Error('Resend API key not configured. Please add RESEND_API_KEY to your Supabase secrets.');
    }

    const { application } = await req.json();
    console.log('Received application data:', JSON.stringify(application));
    
    // Send email with application details
    const emailResponse = await sendApplicationEmail(application);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Application sent via email',
        emailResponse 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing application:', error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function getGenderLabel(gender) {
  switch (gender) {
    case 'women': return 'Femme';
    case 'men': return 'Homme';
    case 'children': return 'Enfant';
    default: return gender;
  }
}

async function sendApplicationEmail(application) {
  try {
    console.log('Attempting to send email with application data');
    
    if (!resendApiKey || !resend) {
      throw new Error("Resend API key not configured. Please add RESEND_API_KEY to your Supabase secrets.");
    }
    
    // Verify we have all required data before sending
    if (!application || !application.email || !application.first_name || !application.last_name) {
      throw new Error("Missing required application data for email");
    }
    
    console.log('Sending email to:', agencyEmail);
    
    // Format application details as HTML
    const applicationDetailsHtml = `
      <h2>Informations personnelles</h2>
      <p><strong>Nom:</strong> ${application.first_name} ${application.last_name}</p>
      <p><strong>Email:</strong> ${application.email}</p>
      <p><strong>Téléphone:</strong> ${application.phone}</p>
      <p><strong>Genre:</strong> ${getGenderLabel(application.gender)}</p>
      ${application.age ? `<p><strong>Âge:</strong> ${application.age} ans</p>` : ''}

      <h2>Mensurations</h2>
      <p><strong>Taille:</strong> ${application.height} cm</p>
      ${application.weight ? `<p><strong>Poids:</strong> ${application.weight} kg</p>` : ''}
      ${application.bust ? `<p><strong>Tour de poitrine:</strong> ${application.bust} cm</p>` : ''}
      ${application.waist ? `<p><strong>Tour de taille:</strong> ${application.waist} cm</p>` : ''}
      ${application.hips ? `<p><strong>Tour de hanches:</strong> ${application.hips} cm</p>` : ''}

      ${application.instagram_url ? `<p><strong>Instagram:</strong> ${application.instagram_url}</p>` : ''}

      ${application.experience ? `
      <h2>Expérience</h2>
      <p>${application.experience}</p>` : ''}

      <p><strong>Date de soumission:</strong> ${new Date().toLocaleDateString()}</p>
    `;
    
    // Send the email using Resend
    const result = await resend.emails.send({
      from: 'Perfect Models <noreply@perfectmodels.ga>',
      to: [agencyEmail],
      subject: `Nouvelle candidature - ${application.first_name} ${application.last_name}`,
      html: `
        <h1>Nouvelle candidature</h1>
        ${applicationDetailsHtml}
      `,
    });
    
    console.log('Email sent successfully:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
