
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as PDFKit from 'https://esm.sh/pdfkit@0.13.0';
import { Resend } from 'https://esm.sh/resend@1.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Resend with the API key
const resendApiKey = Deno.env.get('RESEND_API_KEY');
console.log('RESEND_API_KEY available:', !!resendApiKey);

const resend = new Resend(resendApiKey);
const agencyEmail = Deno.env.get('AGENCY_EMAIL') || 'Perfectmodels.ga@gmail.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { application } = await req.json();
    console.log('Received application data:', JSON.stringify(application));
    
    // Generate PDF
    const pdfBuffer = await generateApplicationPDF(application);
    
    // Send email with PDF attachment
    const emailResponse = await sendEmailWithPDF(application, pdfBuffer);
    
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

async function generateApplicationPDF(application) {
  const chunks = [];
  
  return new Promise((resolve, reject) => {
    const doc = new PDFKit();
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));
    
    // Add heading
    doc.fontSize(20).text('CANDIDATURE PERFECT MODELS', { align: 'center' });
    doc.moveDown();
    
    // Personal info
    doc.fontSize(16).text('Informations personnelles');
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Nom: ${application.first_name} ${application.last_name}`);
    doc.text(`Email: ${application.email}`);
    doc.text(`Téléphone: ${application.phone}`);
    doc.text(`Genre: ${getGenderLabel(application.gender)}`);
    
    if (application.age) {
      doc.text(`Âge: ${application.age} ans`);
    }
    
    doc.moveDown();
    
    // Measurements
    doc.fontSize(16).text('Mensurations');
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Taille: ${application.height} cm`);
    
    if (application.weight) {
      doc.text(`Poids: ${application.weight} kg`);
    }
    
    if (application.bust) {
      doc.text(`Tour de poitrine: ${application.bust} cm`);
    }
    
    if (application.waist) {
      doc.text(`Tour de taille: ${application.waist} cm`);
    }
    
    if (application.hips) {
      doc.text(`Tour de hanches: ${application.hips} cm`);
    }
    
    doc.moveDown();
    
    // Additional info
    if (application.instagram_url) {
      doc.text(`Instagram: ${application.instagram_url}`);
      doc.moveDown(0.5);
    }
    
    // Experience
    if (application.experience) {
      doc.fontSize(16).text('Expérience');
      doc.moveDown(0.5);
      doc.fontSize(12).text(application.experience);
    }
    
    // Date
    doc.moveDown();
    doc.text(`Date de soumission: ${new Date().toLocaleDateString()}`);
    
    doc.end();
  });
}

function getGenderLabel(gender) {
  switch (gender) {
    case 'women': return 'Femme';
    case 'men': return 'Homme';
    case 'children': return 'Enfant';
    default: return gender;
  }
}

async function sendEmailWithPDF(application, pdfBuffer) {
  try {
    console.log('Attempting to send email with application data');
    
    if (!resendApiKey) {
      throw new Error("Resend API key not configured. Please add RESEND_API_KEY to your Supabase secrets.");
    }
    
    // Verify we have all required data before sending
    if (!application || !application.email || !application.first_name || !application.last_name) {
      throw new Error("Missing required application data for email");
    }
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF generation failed or produced empty result");
    }
    
    console.log('Sending email to:', agencyEmail);
    
    // Send the email using Resend
    const result = await resend.emails.send({
      from: 'Perfect Models <noreply@perfectmodels.ga>',
      to: [agencyEmail],
      subject: `Nouvelle candidature - ${application.first_name} ${application.last_name}`,
      html: `
        <h1>Nouvelle candidature</h1>
        <p>Une nouvelle candidature a été soumise.</p>
        <p><strong>Nom:</strong> ${application.first_name} ${application.last_name}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>Téléphone:</strong> ${application.phone}</p>
        <p>Veuillez trouver tous les détails dans le fichier PDF ci-joint.</p>
      `,
      attachments: [
        {
          filename: `candidature_${application.last_name.toLowerCase()}_${application.first_name.toLowerCase()}.pdf`,
          content: pdfBuffer.toString('base64')
        }
      ]
    });
    
    console.log('Email sent successfully:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
